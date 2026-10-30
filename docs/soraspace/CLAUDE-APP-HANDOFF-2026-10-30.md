# SoraSpace app handoff · 30 October 2026

Prepared for Claudia to give Claude; no message has been sent automatically.

## Product branding

Use SoraDocs, SoraPDF, SoraPhotos, SoraImage, SoraMail and SoraSheets throughout visible app chrome, title bars, dialogs, errors, exports, installer screens, desktop shortcuts and help. Keep the requested smaller Japanese companions (Fumi 文, Tsuzuri 綴り, Hikari 光, Irodori 彩り, Tayori 便り, Goban 碁盤). Remove former Craft/Kōbō product branding from user-facing surfaces. Preserve required third-party copyright/licence acknowledgements. Do not rename internal capability IDs, bridge messages, storage keys or file formats without a compatible migration. Website wrappers have been updated separately; the deployed native app assets have not been modified by string replacement.

## Web startup performance

Local accepted asset sizes (uncompressed, rounded): Docs 45 MiB WASM; PDF 42 MiB WASM; Photos 31 MiB WASM. The legacy image editor has a small boot WASM and additional assets, so its boot file alone is not a measure of total startup. The current rebuilt SoraImage uses a separately configured origin and needs its own network trace. These are local asset measurements, not measured production load times.

Website-side improvements: filenames open the app directly; file metadata/chunks restore while the iframe starts, with at most three chunk reads concurrently, size/order/SHA-256 validation and account-change cancellation. Static versioned assets already have immutable cache headers. Private app HTML and user files remain private/no-store. App selection uses ordinary named browser tabs; selecting an already-open app preserves its editor. Opening another saved file may reload that app tab and must be subject to its unsaved-change protection.

Please profile cold/warm launches on a typical laptop and mid-range phone, with a throttled connection: separate session/API time, transferred bytes, WASM compile/initialisation, first paint and editor-ready. Investigate release optimisation, stripping symbols, wasm-opt and feature/module splitting where supported. Confirm Brotli/gzip and streaming WASM MIME type in the deployed environment. Keep versioned hashes and produce a supported ready/error handshake; do not report ready merely when iframe HTML loads. No preloading of every heavy app or private document on the splash page.

## Autosave: app support needed

Provide a versioned, bounded snapshot API for the native editable format, a dirty/change sequence, restore acknowledgement and save result/error handshake. It must run without invoking a download dialog and include document identity, app/format version and revision. Exports to PDF or other lossy formats are not working snapshots. Let the host coalesce/debounce changes and retain a final pending revision; never mark Saved before durable acknowledgement.

Support local crash recovery first, then explicit user-selected site/connected-drive saving. Account/workspace-bound recovery must never appear for another login. Protect conditional writes, conflicts, offline queues, quotas and interrupted uploads. Do not store OAuth/provider credentials in native app local storage. Warn about unsaved work when switching files or closing until a durable snapshot exists. Current export/download workflows remain valid; autosave is not live yet.

## Zotero in SoraDocs

Please establish what the existing Zotero menu actually supports in accepted web and desktop builds. Provide tested steps and versions: desktop Zotero connector/local bridge versus browser API/OAuth; library and group-library access; citation insertion/editing; CSL styles; bibliography refresh; footnotes; stable citation metadata and DOCX round-trip with Word/LibreOffice. No API keys in documents or URLs. Never promise compatibility from menu presence alone. Return a small reference document and exact acceptance steps.

## SoraMail / contacts / CRM

Provide a versioned contact adapter with provider account/contact IDs, display name, structured emails/phones, organisations, tags, revision/ETag, change cursor, tombstones and explicit read/write scopes. Distinguish private contacts from contacts explicitly shared into a workgroup; shared contacts must not expose private messages. Define conflict, duplicate and unlink behaviour. Projects/CRM will use the same canonical contact identities, with CRM-only relationships kept separate. Mail merge and reviewed mailouts need recipient validation, opt-out/consent, a test-send step and explicit confirmation; no automatic sends.

## Delivery

Send versioned release artifacts, hashes, build configuration, supported feature matrix and regression steps. Keep stable IDs compatible with existing saves. Mac support remains a visible future project. Website paid checkout, multi-store provisioning, workgroups and autosave must not be advertised as live until their actual integration and isolation checks pass.
