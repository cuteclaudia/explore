# Editors for Explore by Claudia

Research date: 26 October 2026. Reviewed official GitHub source/README/license files at the revisions below. Feature lists are upstream claims unless explicitly marked tested. The Gizmodo article could not be retrieved because the environment proxy denied its domain; the linked ArtCraft repositories were inspected directly. No third-party editor has been embedded, built or deployed as part of this research.

## Recommended experience

One protected Studio with Articles, Journal, Photographs and Media Library. Articles and journals share a rich writing editor, but keep separate templates, metadata and publication settings. Photographs have a quick preparation editor and, optionally, a separately loaded advanced workspace. Identity authenticates accounts; server capabilities authorize actions. Claudia's pinned owner user ID gets all capabilities. Community remains off.

A functioning editor is more than a toolbar: it needs private draft storage, save status, conflict handling, recovery, preview, asset upload, sanitized rendering, and deliberate publishing. These are site integrations to implement, not features obtained simply by installing a UI package. Existing Markdoc content and article URLs must remain intact until conversion is tested on real articles, tables, images and citations.

## Writing candidates

| Project | License examined | Findings | Recommendation |
|---|---|---|---|
| [Tiptap](https://github.com/ueberdosis/tiptap) | MIT core | Web-focused, headless, extensible ProseMirror editor. Can supply headings, lists, links, tables, images and structured JSON with a site-specific UI. Premium extensions and some services have separate subscription terms. | Preferred core for the site's article/journal editor. Specify open-source features individually; do not promise paid import/export, AI or collaboration as free. |
| [Lexical](https://github.com/facebook/lexical) | MIT | Web/React editor framework with a plugin architecture. Requires building much of the finished authoring interface. | Strong alternative if custom behaviour or accessibility evaluation favours it; more product UI work than a ready editor. |
| [Editor.js](https://github.com/codex-team/editor.js) | Apache-2.0 core | Block-style editor with JSON output and separate tools for images, tables and embeds. Plugin maintenance/licenses must be reviewed separately. | Good for a block-first journal; less direct fit for long research papers and complex references. |
| [WordCraft](https://github.com/storytold/wordcraft) | MIT OR Apache-2.0 code; separate asset/trademark terms | Rust/egui word processor with desktop and WebAssembly targets. Upstream advertises DOCX and other formats, document layout, references and track changes. It is a complete application rather than a drop-in rich-text component. | Investigate as an optional advanced document workspace/import-export companion. Browser capability and format fidelity require a real proof of concept. |
| [GenOffice](https://github.com/genspark-ai/genoffice) | Apache-2.0 root; dependencies retain their terms | Electron office suite with TypeScript document engines and a Rust spreadsheet sidecar. Its Docs editor uses Tiptap. The desktop shell and local file/AI integration are not a Netlify web application. | Study its engines for future Office import/export; do not embed the whole desktop suite. AI provider usage is a separate optional service. |

Writing editor product requirements: undo/redo; headings and formatting; ordered/unordered lists; tables; image insertion/captions/alt text; links, quotes and references; word count; cover/summary/date/location metadata; autosaved private drafts with clear saved/unsaved state; preview; explicit publishing; revision recovery. These are the target integration, not a statement that they are already implemented. Existing Keystatic still provides the current rich-text/file workflow via GitHub.

## Photograph and design candidates

| Project | License examined | Findings | Recommendation |
|---|---|---|---|
| [PhotoCraft](https://github.com/storytold/photocraft) | MIT OR Apache-2.0 code; assets/branding separate | Browser-hostable static WASM app. Upstream describes layers, masks, type, adjustments and PSD handling. Its web packaging docs document WebGPU/WebGL2 requirements and local open/export. The measured 0.8.2 package on 13 October had ~10.9 MiB compressed app data; do not treat that as a current universal size. Browser packaging explicitly lacks web autosave/crash recovery and server document storage. | Best advanced-photo proof-of-concept candidate from the linked suite. Load separately after authorization and connect exports to our media workflow. Do not describe it as already integrated or backed up. |
| [LightCraft](https://github.com/storytold/lightcraft) | MIT OR Apache-2.0 code | RAW development and photo library. Browser packaging explicitly says experimental. Library/originals are stored in OPFS/IndexedDB per origin; clearing browser data, storage eviction or changing domain can lose access without backup/migration. It documents iframe embedding, workers, WebGL2 and export. | Optional later RAW workspace; not the authoritative cloud media library. Test camera RAW samples and backup/restore before adopting. |
| [Filerobot Image Editor](https://github.com/scaleflex/filerobot-image-editor) | MIT | Purpose-built embedded crop/resize/adjust/annotation/watermark/filter UI. React adapter depends on react-konva and styled-components. README compatibility table lists React 17/18 while this site uses React 19. | Conventional embedded-photo alternative, subject to a React 19 or isolated-bundle compatibility test. No peer-dependency forcing or site React downgrade just to make it install. |
| [TOAST UI Image Editor](https://github.com/nhn/tui.image-editor) | MIT | Browser editor with crop, shapes, text and filters. The inspected default-branch HEAD dates to October 2022. | Lower priority given the observed maintenance age; not proof that every downstream use is insecure. |
| [DesignCraft](https://github.com/storytold/designcraft) | MIT OR Apache-2.0 code | Page layout and publishing application with a browser target. | Future designed reports/photo books rather than the everyday web article editor. |
| [VectorCraft](https://github.com/storytold/vectorcraft) | MIT OR Apache-2.0 code | Vector illustration application with a browser target. | Optional future graphics workspace after writing and photography are stable. |

The current native-canvas photo tool is already implemented and tested for local crop/rotation/flip/adjustments/JPEG export. It is not a layer editor, RAW processor or asset library. Preserve original images and separate edit recipes or working files from web exports. Define upload/publication separately from editing; an editor running in a browser does not automatically save to Netlify or make assets private.

## Integration and access requirements

- Protect tool entry routes and every storage/publication API using Identity and the capability registry. Static JavaScript is not secret or DRM-protected; server operations and private data must remain inaccessible without authorization.
- Use server-private originals/drafts and explicit published exports. Avoid exposing draft images under a public static upload directory.
- Isolate large WASM workspaces so public pages do not download them. Validate MIME types, security/cache headers, browser/GPU compatibility, keyboard/file access, download behaviour and large-image memory usage.
- Keep the stable site origin for browser-local tools. Deploy-specific Netlify URLs and a later custom domain each have different browser storage.
- Preserve upstream notices and inspect asset licenses. WordCraft/PhotoCraft-family trademark terms are separate from their permissive code licenses; rebranding/forks must follow those terms.
- Test imported tables, citations and images from Claudia's actual existing articles before changing the publishing source of truth. Do not silently drop unsupported nodes or references.

## Revisions examined

WordCraft ab0eccd; GenOffice 5c1c41e; Tiptap b1f54b4; Lexical 7bc4baa; Editor.js ff9b95a; PhotoCraft 59cb4c4; LightCraft bb08a69; DesignCraft and VectorCraft default-branch source retrieved on the research date; Filerobot a7cce31; TOAST UI 9ee993e. Recent commits were observed, not treated as a substitute for testing or a full dependency/security audit.

## Practical order

1. Finish and verify owner Identity login and permanent UUID binding.
2. Implement the Tiptap writing editor with private storage and publishing, migrate a representative existing article with no content loss, then extend to journals.
3. Add a real media library and connect the existing quick editor's exports.
4. Prove PhotoCraft browser loading, edit/export and asset handoff with real photos before integrating its advanced workspace.
5. Evaluate LightCraft and document-design tools as optional owner capabilities later.

## Uploaded source archives and PDFs

The subsequent ZIP review is documented in `ARCHIVE-REVIEW.md`, including the PdfCraft web target, creation/editing limitations, ArtCraft-X licensing uncertainty, and the oversized ArtCraft archive's GitHub-source fallback. The ZIP review does not establish a successful browser build or deployed editor integration.


## Integration status after the initial research

Pinned official PhotoCraft, LightCraft, WordCraft and PdfCraft browser releases are now integrated as independently authorized, isolated Studio workspaces. They are release artifacts verified against upstream SHA-256 checksums, not builds of the uploaded source snapshots. Real PSD, DOCX, PDF and JPEG save/export operations were captured in browser tests. The same exported bytes were saved and restored across a restart using the official Netlify Blobs SDK and its filesystem emulator. This is not a test of the user's deployed Netlify account or WebDAV server. See NETLIFY-SETUP.md and OFFICE-SUITE-ROADMAP.md for current limitations, storage settings and deferred apps.
