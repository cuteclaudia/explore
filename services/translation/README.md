# Local translation evaluation harness

This is **not a deployed translation service**. It exposes no HTTP endpoint, changes no journals or app files, sends no article text to a cloud API, and cannot publish content. It evaluates plain-text segments using a locally installed CTranslate2 runtime and an operator-prepared MADLAD model. Outputs always say `evaluationOnly: true` and `review-required`.

## What is verified

The uploaded source archive reports CTranslate2 **4.8.4** and contains an MIT licence. Its README lists MADLAD-400 support, and its converter supports T5/mT5. The ZIP omits Git submodules and model weights. The exact upload SHA-256 is recorded in `docs/soraspace/CTRANSLATE2-SOURCE-ASSESSMENT.md`.

Separately, the official PyPI CTranslate2 4.8.4 CPython 3.12 Linux x86_64 wheel was installed in an isolated workspace environment. Import and CPU compute-type checks passed (`int8`, `int8_float32`, `float32`). Its `translate_batch` API includes the options used by this harness. This does not prove the wheel reproduces the uploaded ZIP's source, or that a particular model/direction translates accurately.

`runtime-import-check.lock` records the actual three-wheel runtime import-check set and SHA-256 values. It is platform-specific and **not a complete model/tokenizer/conversion or production deployment lock**. Do not use it as evidence that Transformers, SentencePiece, model conversion, GPU support or translation quality were tested. No model/tokenizer runtime has been installed or qualified yet.

## Run the checks without model dependencies

```sh
python3 -m unittest discover -s services/translation -p 'test_*.py' -v
python3 services/translation/offline_evaluation.py --help
```

The eight tests use explicitly synthetic fake inference/tokenizer objects; they verify the adapter's boundaries, not translation quality. Test output never represents a machine-translated article.

## Prepare for the first real evaluation

1. Acquire the official model's licence, configuration, tokenizer files and weights at an exact verified revision outside the website repository. Model-host access is currently blocked from this workspace. Do not upload multi-gigabyte weights into chat or commit them to Git.
2. Resolve and pin a separate isolated environment for the runtime, tokenizer and conversion tools. Review licences and hashes. Converter source defaults `trust_remote_code=False`; keep that restriction. Do not run code shipped in an unreviewed model repository.
3. Convert the pinned model to the CTranslate2 format on a suitable test machine. CPU/int8 is the initial evaluation candidate; conversion and inference memory requirements must be measured rather than inferred from the ZIP size. This stage has not been run.
4. Curate inference assets into two flat local directories, `model/` and `tokenizer/`. Include `model/model.bin`, `model/config.json`, any runtime vocabulary files, `tokenizer/config.json`, `tokenizer/tokenizer_config.json`, and a usable `tokenizer.json` and/or `spiece.model`. Include all inference-required files; do not include unrelated source/scripts. The harness checks the complete directory inventory and refuses symlinks or extra files.
5. Copy `evaluation-manifest.example.json` outside Git. Replace the placeholder model revision and populate SHA-256 values for **all** curated files. The example is intentionally not runnable until completed.
6. Populate `targets` only after inspecting the actual model tokenizer. For example, the candidate `"ja": "<2ja>"` must be a real dedicated token in that tokenizer. Add explicit `evaluationPairs`, such as `["en", "ja"]`, only for the direction being tested. These are evaluation permissions, not a production-quality qualification. No directions are enabled by default.
7. Prepare a JSON input from public/synthetic text, with supported `sourceLanguage` and `targetLanguage` codes and ordered segments: `{"sourceLanguage":"en","targetLanguage":"ja","segments":[{"id":"title","text":"A public sample"}]}`. The adapter targets plain text only; structured article extraction/reassembly and citation protection remain separate work.
8. Run locally, choosing an output filename that does not exist:

```sh
python3 services/translation/offline_evaluation.py \
  --assets /path/to/local-assets \
  --manifest /path/to/evaluation-manifest.json \
  --input /path/to/public-sample.json \
  --output /path/to/new-review-output.json
```

The process verifies asset hashes before loading the model, disables Hugging Face/Transformers downloads and remote custom code, uses CPU/int8 with one runtime worker and two threads, and limits inference batch size to one segment. Source language is recorded for evaluation; MADLAD's selected target token conditions the input. This is not a source-language detection guarantee.

Inputs are bounded to 96 KB, 32 unique segments, 6,000 characters/segment and 768 tokens/segment. Oversized segments are rejected for explicit splitting. CTranslate2 input truncation is disabled. Output is rejected unless decoding terminates normally, so hitting a token budget cannot silently save a shortened translation. Output is exclusively created with private file permissions, preserving segment IDs and model/runtime provenance. No fallback copies the source text while pretending translation succeeded.

## Before any website integration

Qualify every required source → target direction among the sixteen locale choices, including non-English pairs. Verify Bokmål, European Portuguese and both Chinese scripts independently; do not silently map region/script choices to generic language tags or introduce an English pivot. Native-language reviewers must assess representative prose, technical terminology, citations and quotations.

A real service additionally needs tenant/account authorization, consent and processing-region disclosure, quotas/cost limits, durable jobs, cancellation/timeouts and isolated worker resources, structured-document preservation, source-version conflict checks, private draft storage, review/publish controls, monitoring without article text, retention/deletion and backup policies. The present CLI is not an authenticated server and must not be exposed directly to the internet.

Keep the main Netlify site and current app/file contracts unchanged. Future EU compute/storage decisions are documented separately; a local evaluator does not establish EU-only processing or provide a security certification.
