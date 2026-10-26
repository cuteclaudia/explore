# Uploaded ArtCraft source review

Reviewed 26 October 2026. Six uploaded source ZIPs were downloaded, checked for extraction paths/symlinks and unpacked outside the site repository under `/workspace/vendor-review`. The local `inventory.json` records archive hashes and ZIP metadata. The uploaded `artcraft-main.zip` exceeds the 32 MiB attachment-transfer limit and was not downloaded or extracted. A shallow/sparse read of official `storytold/artcraft` was used as a separate source review; this is not proof that the inaccessible uploaded snapshot is identical.

No build scripts, AGENTS.md or other instructions in these archives were executed or adopted as user instructions. No suite application is embedded or enabled by this review. The archives contain source projects, not ready-to-host application distributions; the lone PhotoCraft WASM file found is a test plugin fixture, not the application.

## Incorporation assessment

| Source | Suitable role | Evidence and remaining integration work |
|---|---|---|
| PdfCraft ZIP | Protected PDF workbench | Includes a real `apps/pdfcraft-web` Rust/WASM target and web-hosting/iframe documentation. Supports source paths for blank PDF creation, text/image conversion, page operations and annotations. Upstream explicitly labels it alpha; test browser operations and export before adopting. |
| PhotoCraft ZIP | Advanced photograph workspace | Browser target, layer/mask/adjustment features and web-hosting instructions. Needs a pinned tested web build, controlled file handoff, reliable saving and access checks. Current native-canvas editor remains the quick tool. |
| WordCraft ZIP | Advanced documents and PDF authoring/export | Browser target and word-processing/PDF capabilities. Best candidate from the suite for composing a report before exporting a PDF. Test browser export, fonts, tables, references and real article round-trips. The everyday web article editor remains the separate Tiptap recommendation. |
| LightCraft ZIP | Optional RAW development/library | Browser target is explicitly experimental. Library and originals are stored in origin-specific browser storage; it is not a durable cloud media library. Backup/restore and real camera RAW samples need testing. |
| FilmCraft ZIP | Optional future video editor | Browser target and web-hosting docs exist. Export codecs, memory usage and real video projects require browser verification; desktop hardware-encoding claims must not be assumed to apply to the browser. |
| ArtCraft-X ZIP | Later AI-workflow research | Early experimental Tauri desktop application with native IPC and external provider integrations; not a drop-in Netlify browser editor. No root license was found in the supplied snapshot; frontend/package.json says MIT while the Rust app has an empty license field. Resolve code-level licensing before copying anything. |
| ArtCraft GitHub fallback | Later AI image/video/3D workflow research | Full desktop AI-creation application; root MIT/Apache terms and notices exist in the reviewed GitHub source. Requires a separate review of backend/provider credentials, pricing and browser adaptation. This is not the oversized ZIP's verified contents. |

## PDF creation versus PDF editing

PdfCraft's source contains blank-document creation and creation from text/images. On the web, the image-dialog path instructs the user to open or drop an image for conversion; desktop dialog/clipboard behaviour is not automatically available in the browser.

For a useful first PDF workbench, validate open/read/search; create from supported inputs; rotate/reorder/delete pages; merge/split; annotate/highlight; form filling; save/export and reopening the result. Do not call arbitrary text replacement, OCR, redaction or digital signing production-ready without format-specific tests.

The upstream README's October 2026 status calls PdfCraft **alpha**, explicitly identifies unreliable existing-text editing (especially CJK/right-to-left), limited OCR, no Office-document-to-PDF and weak DOCX layout fidelity. Some web/printing status notes differ between documents, so the built browser behaviour must decide readiness. This is not currently an Acrobat-equivalence claim.

Recommended PDF workflow: compose articles/reports in the writing editor or WordCraft, export a PDF using a tested route, then use PdfCraft for page organisation/annotation and supported edits. Add title/author/credit metadata through the chosen PDF creation/export workflow after its metadata behaviour is verified. Avoid rewriting article source from a PDF as the primary editing workflow.

## Hosting, storage and permissions

The suite's web applications are compiled static JS/WASM distributions that can be hosted on Netlify. This does not supply owner authentication, cloud file storage, autosave, publication, or our universal site navigation. Each tool needs a protected Studio entry route and a real capability when integrated; Claudia's pinned owner identity then receives it automatically.

Large applications should load only when opened. Review the built package's MIME/cache/HTTPS and browser GPU requirements. An iframe is not a security boundary when scripts and same-origin access are both enabled. Evaluate an isolated tool origin plus a validated file/message bridge if embedding substantial third-party UI; do not expose Identity tokens or storage credentials to that editor. Uploaded PDF scripts, untrusted rendering inputs and long-running processing also need deliberate limits and isolation.

Keep originals/working files separate from published exports. Local browser storage and downloads are not server backups. Public asset paths must not become a route around draft or file permissions.

Most Craft app root code uses MIT OR Apache-2.0, with separate notices for fonts/assets and trademarks. Preserve required notices and review branding terms for forks. Do not infer that the entire ArtCraft-X snapshot is MIT from one frontend manifest.

## Proposed order

Finish owner sign-in/account navigation and the integrated writing/media workflow first. Then prove WordCraft PDF export and a PdfCraft browser open/edit/export round-trip before adding a PDF Studio capability. PhotoCraft is the next advanced-image candidate. Keep LightCraft, FilmCraft and AI suites optional until their specific workflows and storage requirements have been tested.
