"""Local-only model evaluation. No HTTP endpoint, publishing or cloud writes."""
import argparse
import hashlib
import importlib
import json
import os
from pathlib import Path
import re
import sys

LOCALES = frozenset(('en', 'zh-Hans', 'zh-Hant', 'fr', 'pt-PT', 'id', 'de', 'ja',
                     'ko', 'it', 'th', 'uk', 'nl', 'sv', 'fi', 'nb'))
RUNTIME_VERSION = '4.8.4'
MAX_INPUT_BYTES = 96_000
MAX_SEGMENTS = 32
MAX_SEGMENT_CHARS = 6_000
MAX_INPUT_TOKENS = 768
MAX_OUTPUT_TOKENS = 2048

class EvaluationError(ValueError):
    pass

def require(condition, message):
    if not condition:
        raise EvaluationError(message)

def read_json(path, limit=MAX_INPUT_BYTES):
    with Path(path).open('rb') as stream:
        raw = stream.read(limit + 1)
    require(len(raw) <= limit, 'Input exceeds the evaluation size limit.')
    try:
        return json.loads(raw)
    except (ValueError, UnicodeError) as error:
        raise EvaluationError('Invalid UTF-8 JSON input.') from error

def validate_manifest(manifest):
    keys = {'schemaVersion', 'runtimeVersion', 'modelId', 'modelRevision', 'files',
            'targets', 'evaluationPairs'}
    require(type(manifest) is dict and set(manifest) == keys, 'Use the evaluation manifest schema.')
    require(type(manifest['schemaVersion']) is int and manifest['schemaVersion'] == 1,
            'Unsupported manifest version.')
    require(manifest['runtimeVersion'] == RUNTIME_VERSION, 'Runtime version must match the reviewed source.')
    require(manifest['modelId'] == 'google/madlad400-3b-mt', 'Use the selected model family.')
    require(type(manifest['modelRevision']) is str and
            re.fullmatch(r'[0-9a-f]{40}', manifest['modelRevision']), 'Pin the exact model revision.')
    files = manifest['files']
    require(type(files) is dict and 4 <= len(files) <= 40, 'List the local model/tokenizer files and SHA-256 values.')
    for name, digest in files.items():
        require(type(name) is str and re.fullmatch(r'(model|tokenizer)/[A-Za-z0-9_.-]+', name)
                and not name.endswith('.py'), 'Use flat local model/tokenizer asset paths.')
        require(type(digest) is str and re.fullmatch(r'[0-9a-f]{64}', digest), 'Supply valid SHA-256 values.')
    require({'model/model.bin', 'model/config.json', 'tokenizer/config.json',
             'tokenizer/tokenizer_config.json'} <= set(files), 'Missing required model/tokenizer files.')
    require('tokenizer/spiece.model' in files or 'tokenizer/tokenizer.json' in files,
            'Include the local tokenizer vocabulary.')
    targets = manifest['targets']
    require(type(targets) is dict and set(targets) <= LOCALES, 'Choose listed target locales.')
    for token in targets.values():
        require(type(token) is str and re.fullmatch(r'<2[a-zA-Z0-9-]{2,20}>', token),
                'Use a verified MADLAD language token.')
    pairs = manifest['evaluationPairs']
    require(type(pairs) is list and len(pairs) <= 240, 'Use explicit evaluation pairs.')
    seen = set()
    for pair in pairs:
        require(type(pair) is list and len(pair) == 2 and
                all(type(code) is str and code in LOCALES for code in pair), 'Invalid language pair.')
        require(pair[0] != pair[1] and pair[1] in targets and tuple(pair) not in seen,
                'Language pairs must be distinct and have a verified target token.')
        seen.add(tuple(pair))
    return manifest

def validate_request(request, manifest):
    require(type(request) is dict and set(request) == {'sourceLanguage', 'targetLanguage', 'segments'},
            'Use sourceLanguage, targetLanguage and plain-text segments.')
    source, target = request['sourceLanguage'], request['targetLanguage']
    require(type(source) is str and type(target) is str and source in LOCALES and target in LOCALES
            and source != target, 'Choose two different supported locales.')
    require([source, target] in manifest['evaluationPairs'], 'This direction is not configured for evaluation.')
    segments = request['segments']
    require(type(segments) is list and 1 <= len(segments) <= MAX_SEGMENTS, 'Use 1–32 segments.')
    seen = set()
    for segment in segments:
        require(type(segment) is dict and set(segment) == {'id', 'text'}, 'Use stable segment IDs and plain text.')
        identifier, text = segment['id'], segment['text']
        require(type(identifier) is str and re.fullmatch(r'[A-Za-z0-9_.:-]{1,80}', identifier)
                and identifier not in seen, 'Use unique bounded segment IDs.')
        require(type(text) is str and 0 < len(text.strip()) <= MAX_SEGMENT_CHARS
                and len(text) <= MAX_SEGMENT_CHARS, 'Segment is empty or too long.')
        require(not re.search(r'[\x00-\x08\x0b\x0c\x0e-\x1f]|<(?:2[^>]+|extra_id_\d+|/?s|pad|unk)>', text),
                'Text contains reserved model/control tokens.')
        seen.add(identifier)
    require(len(json.dumps(request, ensure_ascii=False).encode('utf-8')) <= MAX_INPUT_BYTES,
            'Input exceeds the evaluation size limit.')
    return request

def verify_assets(root, manifest):
    """Verify the complete inference asset set, so unlisted config cannot be loaded."""
    root = Path(root).resolve()
    actual = set()
    for directory in ('model', 'tokenizer'):
        path = root / directory
        require(path.is_dir() and not path.is_symlink(), 'Missing local model/tokenizer directory.')
        for asset in path.iterdir():
            require(asset.is_file() and not asset.is_symlink(), 'Only flat regular model assets are accepted.')
            actual.add(directory + '/' + asset.name)
    require(actual == set(manifest['files']), 'The local assets do not match the manifest.')
    for name, expected in manifest['files'].items():
        digest = hashlib.sha256()
        with (root / name).open('rb') as stream:
            for chunk in iter(lambda: stream.read(1_048_576), b''):
                digest.update(chunk)
        require(digest.hexdigest() == expected, 'Local asset checksum mismatch.')
    return root

def load_runtime(root):
    os.environ['HF_HUB_OFFLINE'] = '1'
    os.environ['TRANSFORMERS_OFFLINE'] = '1'
    try:
        ct2 = importlib.import_module('ctranslate2')
        transformers = importlib.import_module('transformers')
    except ImportError as error:
        raise EvaluationError('The isolated evaluation runtime is not installed.') from error
    require(ct2.__version__ == RUNTIME_VERSION, 'Installed runtime does not match the reviewed version.')
    tokenizer = transformers.AutoTokenizer.from_pretrained(
        str(root / 'tokenizer'), local_files_only=True, trust_remote_code=False)
    translator = ct2.Translator(str(root / 'model'), device='cpu', compute_type='int8',
                                inter_threads=1, intra_threads=2)
    return translator, tokenizer

def evaluate(request, manifest, translator, tokenizer):
    validate_request(request, manifest)
    language_token = manifest['targets'][request['targetLanguage']]
    token_id = tokenizer.convert_tokens_to_ids(language_token)
    require(type(token_id) is int and token_id != tokenizer.unk_token_id and
            tokenizer.convert_ids_to_tokens(token_id) == language_token,
            'Target language token is not present in this tokenizer.')
    encoded = []
    for segment in request['segments']:
        ids = tokenizer.encode(language_token + ' ' + segment['text'])
        require(0 < len(ids) <= MAX_INPUT_TOKENS, 'Segment exceeds token limit; split it explicitly.')
        encoded.append(tokenizer.convert_ids_to_tokens(ids))
    results = translator.translate_batch(encoded, beam_size=2, max_input_length=0,
                                         max_batch_size=1, batch_type='examples',
                                         max_decoding_length=MAX_OUTPUT_TOKENS, return_end_token=True)
    require(len(results) == len(encoded), 'Translation returned an incomplete result set.')
    output = []
    for segment, result in zip(request['segments'], results):
        require(bool(result.hypotheses), 'Translation returned no hypothesis.')
        tokens = result.hypotheses[0]
        ids = tokenizer.convert_tokens_to_ids(tokens)
        require(bool(ids) and ids[-1] == tokenizer.eos_token_id and len(ids) <= MAX_OUTPUT_TOKENS,
                'Output did not terminate normally; no partial translation was saved.')
        text = tokenizer.decode(ids, skip_special_tokens=True)
        require(type(text) is str and bool(text.strip()), 'Translation returned empty text.')
        output.append({'id': segment['id'], 'text': text})
    return {'evaluationOnly': True, 'status': 'review-required', 'sourceLanguage': request['sourceLanguage'],
            'targetLanguage': request['targetLanguage'], 'modelId': manifest['modelId'],
            'modelRevision': manifest['modelRevision'], 'runtimeVersion': RUNTIME_VERSION, 'segments': output}

def write_private_output(path, result):
    # Exclusive create: never overwrite an original or previous evaluation result.
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as stream:
            json.dump(result, stream, ensure_ascii=False, indent=2)
            stream.write('\n')
    except BaseException:
        Path(path).unlink(missing_ok=True)
        raise

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--assets', required=True, type=Path)
    parser.add_argument('--manifest', required=True, type=Path)
    parser.add_argument('--input', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    try:
        manifest = validate_manifest(read_json(args.manifest))
        request = validate_request(read_json(args.input), manifest)
        root = verify_assets(args.assets, manifest)
        translator, tokenizer = load_runtime(root)
        result = evaluate(request, manifest, translator, tokenizer)
        write_private_output(args.output, result)
    except (EvaluationError, OSError) as error:
        # No article text, token IDs, credentials or dependency traces in terminal output.
        message = str(error) if isinstance(error, EvaluationError) else 'Could not read or create local evaluation files.'
        print(message, file=sys.stderr)
        return 1
    except Exception:
        print('Evaluation runtime failed. No output was published.', file=sys.stderr)
        return 1
    print('Private evaluation output created. Human review is required; nothing was published.')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
