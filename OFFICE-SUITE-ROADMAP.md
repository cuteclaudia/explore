# Personal office and creative suite

Claudia's long-term goal is an owner-controlled suite within Explore by Claudia. Capabilities must remain independently grantable to future users while both pinned owner accounts have full access. Community remains off.

## Current implementation under validation

Four pinned, checksum-verified official browser releases are prepared by the build:

- PhotoCraft 0.16.0: layered image editing (`tools.photocraft`).
- LightCraft 0.14.0: RAW/development workspace (`tools.lightcraft`), currently a temporary library, not a persistent RAW catalogue.
- WordCraft 0.11.0: advanced documents (`tools.wordcraft`).
- PdfCraft 0.14.0: PDF workbench (`tools.pdfcraft`), alpha limitations remain.

These are separate from the basic quick photo-preparation tool. Application entry HTML is served only after server authorization; public static assets contain no user documents or credentials. The actual editor runs in an opaque-origin sandbox. This prevents access to the parent site's Identity session and DOM. Session preferences, some clipboard functions, optional fonts and native-only features may be unavailable. Upstream branding and licence files are retained.

Save/Export downloads are captured by a source-window/channel-checked bridge and offered for private cloud save. Cloud revisions are immutable, uploaded in 1 MiB chunks, and verified by size/SHA-256 when restored. A file can be downloaded or passed back to an editor's file-open/drop path. For a library backup, use the editor's Restore Library action after downloading the saved backup; not every native project format can be reopened by a generic image drop.

Finished PDF/JPEG/PNG/WebP files can be explicitly published to `/library` with a title and tags, and unpublished separately. Private native projects are not automatically published. This is an export/publication workflow, not a replacement for the journal/article CMS or automatic in-editor cloud autosave.

## Additional uploaded source assessed, not integrated

| Function | Candidate | Findings and readiness |
|---|---|---|
| Spreadsheets | https://github.com/storytold/gridcraft | Uploaded archive extracted. Spreadsheet application with Rust/WASM browser target. Validate formulas, XLSX/CSV round-trip, charts and real workbooks before enabling. |
| Slides | https://github.com/storytold/deckcraft | Uploaded archive extracted. Browser-target presentation application, labelled alpha. Validate PPTX/PDF export, fonts, layout and media fidelity. |
| CAD | https://github.com/storytold/cadcraft | Uploaded archive extracted. Early-development CAD with a browser target, DXF/drafting and export claims. Validate dimensions/units, format coverage and actual models; do not promise professional CAD parity. |
| Page publishing | https://github.com/storytold/designcraft | Uploaded archive extracted. Pre-alpha page-layout application with a browser target. Validate complex typography and publication formats with real documents. |

These projects have MIT/Apache core licensing with separate asset/branding notices; inclusion still needs per-release review and browser tests. No disabled or misleading app launch buttons are exposed for unintegrated tools.

## User storage

Netlify private working files provide a baseline store. WebDAV connection settings are per user, encrypted with a site-level key. An approved public HTTPS hostname is required; the server pins a validated DNS address, verifies TLS and refuses redirects/private addresses. The Test action writes/deletes a temporary probe. Saved cloud revisions may be copied to WebDAV; this is not a WebDAV-only source of truth, automatic folder sync, or LAN/VPN support. Actual hosted storage and WebDAV credentials must be tested separately from application-unit tests.

Google Drive/OneDrive storage needs separate OAuth consent and server integration. Google sign-in is not Drive consent. No Drive connection is currently implemented.

## Digital goods: deferred at Claudia's request

An authenticated-download catalogue is planned for apps, versions/platforms and photographs/licences. Begin with free claims/entitlements and private downloads. Later add owner-managed prices/currency and payment-provider checkout with verified webhooks and durable purchase entitlements. Price changes must not revoke previous purchases. Never protect commercial downloads only by hiding public static URLs. Customer download access must be separate from Studio/Community permissions.

No checkout, pricing catalogue, payment integration or login-required commercial distribution is implemented by the public finished-export library. The library is deliberately public after an explicit publication action.

## Validation boundaries

Browser tests started all four actual releases in isolated frames, verified parent DOM access is denied, opened a real JPEG in PhotoCraft, captured a real PSD save, a real DOCX save, a real PDF save and a LightCraft JPEG export. Automated storage tests verify multi-chunk byte restoration, checksums, private access and publish/unpublish using a storage test double, plus the actual Netlify Blobs SDK/emulator across a service restart. All four actual captured export files also passed byte-for-byte SDK/emulator restoration. They do not prove a real Netlify provider round-trip or user-owned WebDAV connection. See NETLIFY-SETUP.md for required deployed validation and configuration.
