# CTranslate2 upload assessment — 30 October 2026 (Sydney)

## Artifact inspected

- Uploaded file: `CTranslate2-master.zip`, 3,867,764 bytes.
- SHA-256: `29206037d7c171e60cf5c17ccff7cffd9278b9af7620d51bc4a142628fe966f4`.
- 683 archive entries, 8,025,162 expanded bytes. Archive paths and file types were checked before extraction; no absolute/parent traversal paths or symbolic-link entries were accepted. No archive instructions were treated as user authorization.
- Source reports `__version__ = "4.8.4"` in `python/ctranslate2/version.py`.
- This master ZIP has no Git history/commit identity. Its version string is not independent provenance verification, a signed release or a security audit.

## Findings from the supplied source

`LICENSE` contains the MIT licence with SYSTRAN/OpenNMT copyright notices. It permits commercial use subject to retaining required notices. This establishes the runtime source licence, not the separate model licence or all dependency terms.

`README.md` explicitly lists MADLAD-400 among supported encoder-decoder models. `python/ctranslate2/converters/transformers.py` registers `T5Config` and `MT5Config` loaders, accepts a revision pin and defaults `trust_remote_code` to false. `docs/guides/transformers.md` documents conversion and token-level T5 inference. This is compatible-source evidence, not a completed MADLAD model conversion or translation-quality test.

`python/cpp/translator.cc` documents input truncation defaulting to 1024 tokens, output prediction defaulting to 256, and the `return_end_token` option. The new evaluator disables input truncation, rejects overlong source segments, requires a normal decoding end token and never publishes partial output as a successful translation.

`.gitmodules` lists cxxopts, NVIDIA components, googletest, cpu_features, spdlog and ruy. These directories are empty in the ZIP. Building it directly as a complete standalone source checkout would need qualified/pinned submodule contents and toolchain/dependency work. No source build or uploaded install script was executed.

## Separate runtime check

PyPI's public 4.8.4 metadata was reachable and listed a CPython 3.12 Linux x86_64 wheel. The official binary wheel and its dependencies were installed in an isolated environment outside the website source/dependencies. The import and supported-CPU-compute-types query passed: `float32`, `int8`, `int8_float32`. The installed binding exposes `max_input_length`, `max_batch_size` and `return_end_token`.

The runtime import-check wheel set is recorded, with exact versions and hashes, in `services/translation/runtime-import-check.lock`. This is not a reproducible source build from the uploaded ZIP or a complete production inference environment. Transformers, SentencePiece, GPU/CUDA and actual model inference were not qualified by this check.

The model-host metadata request to `https://huggingface.co/api/models/google/madlad400-3b-mt` was blocked by the workspace proxy (CONNECT 403). Model revision, licence, exact tokenizer/language tags and weights therefore remain unverified here. There are no model weights in the upload.

## Concrete work delivered

`services/translation/offline_evaluation.py` is a local-only, bounded plain-text segment evaluation adapter, with an explicit empty-by-default evaluation-pair manifest, asset checksum validation, offline/local-only loading, private exclusive output creation and review provenance. Eight synthetic adapter tests passed. The CLI help works without native model dependencies.

It is intentionally not connected to live journals, article storage, subscriptions, account permissions or the public Netlify site. No draft was translated, sent to a provider, overwritten or published. No server was provisioned or paid plan activated. All-direction author translation remains the product target, not a capability enabled merely by listing sixteen interface locales.

Next: obtain and verify the pinned model on a test machine, lock the tokenizer/conversion environment, measure CPU/int8 and memory behaviour, review representative language-pair samples, then design the authenticated worker and private translated-draft workflow. See [the evaluation README](../../services/translation/README.md) and [translation/data-region requirements](ARTICLE-TRANSLATION-AND-DATA-REGIONS.md).

These checks do not justify a blanket “security checked by Claude AI” or certified-security claim.
