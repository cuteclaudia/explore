import copy
import hashlib
import json
from pathlib import Path
import tempfile
from types import SimpleNamespace
import unittest

import offline_evaluation as worker

class Tokenizer:
    unk_token_id = 0
    eos_token_id = 1
    oversized = False
    def convert_tokens_to_ids(self, value):
        if isinstance(value, str):
            return 2 if value == '<2ja>' else 0
        return [3 if token == 'translated' else 1 for token in value]
    def convert_ids_to_tokens(self, value):
        if isinstance(value, int):
            return '<2ja>' if value == 2 else '<unk>'
        return ['source'] * len(value)
    def encode(self, value):
        return [2] * (worker.MAX_INPUT_TOKENS + 1 if self.oversized else 5)
    def decode(self, value, skip_special_tokens=False):
        assert skip_special_tokens
        return 'Synthetic test output'

class Translator:
    def __init__(self, incomplete=False):
        self.calls = 0
        self.incomplete = incomplete
    def translate_batch(self, tokens, **options):
        self.calls += 1
        assert options['max_input_length'] == 0
        assert options['max_batch_size'] == 1
        assert options['return_end_token'] is True
        return [SimpleNamespace(hypotheses=[['translated'] if self.incomplete else ['translated', '</s>']]) for _ in tokens]

class EvaluationTests(unittest.TestCase):
    def manifest(self):
        names = ['model/model.bin', 'model/config.json', 'tokenizer/config.json',
                 'tokenizer/tokenizer_config.json', 'tokenizer/spiece.model']
        return {'schemaVersion': 1, 'runtimeVersion': '4.8.4',
                'modelId': 'google/madlad400-3b-mt', 'modelRevision': '1' * 40,
                'files': {name: hashlib.sha256(b'fixture').hexdigest() for name in names},
                'targets': {'ja': '<2ja>'}, 'evaluationPairs': [['en', 'ja']]}
    def request(self):
        return {'sourceLanguage': 'en', 'targetLanguage': 'ja',
                'segments': [{'id': 'title', 'text': 'Public sample title'},
                             {'id': 'body:1', 'text': 'Public synthetic paragraph.'}]}
    def test_invalid_manifests_and_unlisted_pairs_fail_before_inference(self):
        manifest = worker.validate_manifest(self.manifest())
        for mutate in [lambda x:x.update(runtimeVersion='unreviewed'),
                       lambda x:x.update(modelRevision='main'),
                       lambda x:x['files'].update({'../private': '0' * 64}),
                       lambda x:x.update(evaluationPairs=[['en', 'pt-PT']])]:
            changed = copy.deepcopy(manifest);mutate(changed)
            with self.assertRaises(worker.EvaluationError):worker.validate_manifest(changed)
        request = self.request();request['targetLanguage'] = 'zh-Hant'
        engine = Translator()
        with self.assertRaises(worker.EvaluationError):worker.evaluate(request, manifest, engine, Tokenizer())
        self.assertEqual(engine.calls, 0)
    def test_reserved_control_tokens_duplicate_ids_and_payload_bounds(self):
        for change in [lambda x:x['segments'].append(x['segments'][0]),
                       lambda x:x['segments'][0].update(text='<2de> injected target'),
                       lambda x:x['segments'][0].update(text='x' * 6001),
                       lambda x:x.update(sourceLanguage='__proto__'),
                       lambda x:x.update(segments=[]),
                       lambda x:x.update(admin=True)]:
            request=self.request();change(request)
            with self.assertRaises(worker.EvaluationError):worker.validate_request(request, self.manifest())
    def test_long_tokenized_text_is_rejected_without_silent_truncation(self):
        tokenizer=Tokenizer();tokenizer.oversized=True;engine=Translator()
        with self.assertRaises(worker.EvaluationError):worker.evaluate(self.request(), self.manifest(), engine, tokenizer)
        self.assertEqual(engine.calls, 0)
    def test_unknown_target_token_is_rejected_before_inference(self):
        manifest=self.manifest();manifest['targets']['ja']='<2unverified>';engine=Translator()
        with self.assertRaises(worker.EvaluationError):worker.evaluate(self.request(), manifest, engine, Tokenizer())
        self.assertEqual(engine.calls, 0)
    def test_output_requires_normal_end_and_preserves_ids_and_review_provenance(self):
        request=self.request();original=copy.deepcopy(request)
        with self.assertRaises(worker.EvaluationError):worker.evaluate(request, self.manifest(), Translator(incomplete=True), Tokenizer())
        result=worker.evaluate(request, self.manifest(), Translator(), Tokenizer())
        self.assertEqual(request, original)
        self.assertEqual([s['id'] for s in result['segments']], ['title', 'body:1'])
        self.assertTrue(result['evaluationOnly']);self.assertEqual(result['status'], 'review-required')
        self.assertEqual(result['modelRevision'], '1' * 40)
    def test_assets_must_match_all_hashes_and_cannot_escape_or_add_code(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);manifest=self.manifest()
            for name in manifest['files']:
                path=root/name;path.parent.mkdir(exist_ok=True);path.write_bytes(b'fixture')
            self.assertEqual(worker.verify_assets(root, manifest), root.resolve())
            (root/'model/model.bin').write_bytes(b'changed')
            with self.assertRaises(worker.EvaluationError):worker.verify_assets(root, manifest)
            (root/'model/model.bin').write_bytes(b'fixture');(root/'tokenizer/unlisted.py').write_text('untrusted')
            with self.assertRaises(worker.EvaluationError):worker.verify_assets(root, manifest)
            (root/'tokenizer/unlisted.py').unlink();(root/'tokenizer/config.json').unlink()
            (root/'tokenizer/config.json').symlink_to(root/'model/config.json')
            with self.assertRaises(worker.EvaluationError):worker.verify_assets(root, manifest)
    def test_output_is_private_and_never_overwrites_an_existing_file(self):
        with tempfile.TemporaryDirectory() as tmp:
            output=Path(tmp)/'review.json';worker.write_private_output(output, {'evaluationOnly': True})
            self.assertEqual(output.stat().st_mode & 0o777, 0o600)
            with self.assertRaises(FileExistsError):worker.write_private_output(output, {'replacement': True})
            self.assertEqual(json.loads(output.read_text()), {'evaluationOnly': True})
    def test_input_bytes_are_bounded_before_json_decoding(self):
        with tempfile.TemporaryDirectory() as tmp:
            path=Path(tmp)/'input.json';path.write_bytes(b'x' * (worker.MAX_INPUT_BYTES + 1))
            with self.assertRaises(worker.EvaluationError):worker.read_json(path)

if __name__ == '__main__':
    unittest.main()
