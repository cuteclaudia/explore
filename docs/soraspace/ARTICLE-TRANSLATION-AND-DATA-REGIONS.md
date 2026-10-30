# Author translation and data-region choices

30 October 2026, Sydney. Product direction agreed with Claudia; this document does not activate machine translation, provision a server or migrate existing content.

## Author-controlled translation in every supported direction

Target all source/target combinations among the sixteen supported locales: English, Simplified/Traditional Chinese, French, European Portuguese, Indonesian, German, Japanese, Korean, Italian, Thai, Ukrainian, Dutch, Swedish, Finnish and Norwegian Bokmål. Article language is independent of the reader/interface language. The language-menu population order must never restrict translation directions or give English extra publishing rights.

The author explicitly chooses a source language and a different target, sees the processing location/provider and any charge/limit, then requests translation. A new private draft is linked to its original article/version; never overwrite or auto-publish either version. Preserve structured headings, links, footnotes, citation/reference identifiers and non-translatable spans. Bibliographic titles/quotations and names need explicit policy rather than silent rewriting. Review translations side by side; retain provenance/model/version, creation time and approval, and flag translations when their source changes. Private journals and attachments do not become public through translation.

Treat supported pairs as a backend capability matrix, not all possible UI locale combinations assumed operational. Test the model on each required direction with representative essays/research writing, script/region fidelity, formatting and citations. Unsupported pairs remain visibly unavailable. No silent English pivot, generic-Portuguese substitution, or Chinese-script conversion presented as an independently reviewed translation. An explicitly permitted pivot/conversion can be offered separately with provenance and review.

## Recommended engine candidate

For expanded multilingual coverage, evaluate Google's `google/madlad400-3b-mt` model with OpenNMT CTranslate2 as the server runtime. This is a candidate, not a verified production selection. The earlier LibreTranslate/Argos proposal is easier to start but cannot be assumed to cover the full requested matrix or required quality.

- Runtime source: https://github.com/OpenNMT/CTranslate2 (Code → Download ZIP).
- Model: https://huggingface.co/google/madlad400-3b-mt . Weights are separate from runtime source and too large to upload as a normal chat attachment.
- Model research/source: https://github.com/google-research/google-research/tree/master/madlad_400 . The Google Research repository contains many unrelated projects; downloading the whole monorepo is unnecessary.
- Confirm the exact runtime/model licences, weight authenticity, tokenizer/language tags, supported conversion/runtime versions, RAM/CPU/GPU requirements and benchmark quality before installation. General multilingual coverage does not prove European Portuguese, Bokmål, both Chinese scripts or every translation direction meets the product requirement.
- Run a separate authenticated worker, optionally on EU infrastructure. Netlify serves the site and account routes; static hosting does not execute a multi-gigabyte translation model. First acceptance should use synthetic/public test text, not private production journals.

Implementation needs workspace-scoped authorization, bounded job sizes, quotas, consent, a safe structured-document translation adapter, idempotent jobs, cancellation/retry, concurrent-source-change handling, retention/deletion, restricted logs and private output. Keep runtime/model versions pinned and isolate provider adapters so engine changes do not change article IDs or author ownership.

## Storage and processing are separate choices

A useful first path is an EU-hosted Nextcloud/WebDAV account and a separate EU translation worker. Existing documents, IDs, encryption/storage preferences and Netlify website should remain intact until an explicit migration is tested. User-owned storage is an option, not forced platform storage.

Evaluate user-owned Nextcloud, a managed Nextcloud provider such as Hetzner Storage Share, or a platform-managed Nextcloud deployment. Verify the current service's actual region, operator, backup locations, terms, costs and supported authentication before offering a provider as a verified region choice. Hetzner's EU cloud locations are candidates for a translation worker; managed storage and model compute are different products. Switzerland is in Europe but outside the EU, so any Swiss option must have its own label.

Document the full data flow: file bytes; article drafts and metadata; sign-in/account data; database; translation input/output; logs; temporary files; backups; billing and support. Netlify remains a US provider even if a user's drive and translation server are in Europe. Sending plaintext through a Netlify function still puts that processing in the Netlify data flow. A later browser-to-EU-worker design could avoid that hop for translation text using short-lived, narrowly scoped authorization, but needs authentication, replay/expiry, CORS and workspace checks; it is not implemented now.

Do not claim EU-only processing, exclusive EU jurisdiction, immunity from US laws, end-to-end encryption or deletion from backups without evidence for the entire relevant service chain. EU storage is a specific storage location choice, not a blanket legal guarantee. Present verified storage and processing regions separately, together with retention and export/recovery options.

## Uploaded runtime follow-up

The supplied CTranslate2 master ZIP has now been inspected, and a separate official 4.8.4 wheel passed an isolated CPU import/capability check. A bounded local-only evaluation harness and eight synthetic boundary tests are available under `services/translation`; it is not a web service or proof of translation quality. Model weights, model licence/revision/tokenizer, actual translation and every language-pair qualification remain outstanding. See [the source assessment](CTRANSLATE2-SOURCE-ASSESSMENT.md) for exact artifact hashes, findings and the model-host access blocker.
