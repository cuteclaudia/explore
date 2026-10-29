# SoraSpace welcome dashboard and app display names

29 October 2026 (Sydney). Website presentation and existing site-file navigation; no new mail/calendar provider, cloud-folder API, native app build or domain cutover.

## Welcome page

`/apps` opens with apps and search on the left. The right column stacks Mail, Calendar, then Files & folders. App cards use short English names within the branded workspace, with the older names as smaller references. On wider monitors the app grid expands to three columns; on smaller screens the layout stacks and scrolls naturally. The sidebar’s **Mail & calendar** link goes directly to that preview area from the workspace or saved-files page.

The recent files and folder counts come from the existing account-owned private site revision API. Folders are clearly labelled app groups of site files, not fabricated provider directories. Clicking a group opens `/apps/files?app=<existing-slug>` and filters the existing list; the selector can return to all site files. Connected Drive/WebDAV libraries and device files remain in their apps. No files are moved, duplicated or published.

Mail and Calendar are explicitly **Coming soon**. No invented message/event, unread count, “no events” claim, OAuth consent button or automatic second window is presented. These panels currently communicate the intended layout, not a live connection. A future integration needs provider authorisation, account-bound read access, session-change clearing, safe message rendering and event/time-zone handling. Desktop mail credentials must not simply be copied into the browser. A sidebar preview link must not become an unimplemented `/apps/mail` route.

## Display names accepted by Claudia

| Website name | Transitional reference | Existing app / permission identifiers |
| --- | --- | --- |
| SoraSpace Mail | Tayori | `tayori`, `desktop.tayori`; no web engine |
| SoraSpace Docs | Fumi | `fumi`, `wordcraft` |
| SoraSpace Sheets | Goban | `goban`, `desktop.goban`; no web engine |
| SoraSpace PDF | Tsuzuri | `tsuzuri`, `pdfcraft` |
| SoraSpace Photos | Hikari | `hikari`, `lightcraft` |
| SoraSpace Image Editor | Irodori | `irodori`, `photocraft` |

`src/lib/app-presentation.mjs` owns the display mapping. Workspace cards and the public catalogue use English names, cards retain the older names as smaller references, and launcher/wrapper labels use short names where space is limited. Existing administrative permission/installer metadata may retain legacy names. Claude’s binaries and Store listings need separate accepted builds/updates; native branding is not changed by this website work.

## Privacy and compatibility

Site files/groups use fresh session checks before and after retrieval, owner/capability filtering, validated IDs and text-only name rendering. Changing account/signing out clears both lists; late replies cannot repopulate the old workspace. Folder queries resolve only to registered permitted app tools. Release gates and the existing sandbox/bridge boundaries remain unchanged. App identifiers, permissions, routes, browser storage, provider folder names and encrypted indexes retain their current bindings.

The public domain remains the existing Explore host until the separately recorded SoraSpace domain cutover is accepted. Subscriptions remain a proposal with an isolated policy prototype, not a reason to enable Mail/Sheets web access.

Validation uses the existing workspace, public app catalogue, phone wrapper and actual Image Editor browser checks, plus the server suite and production package. Provider/identity data in browser checks are fixtures; mail/calendar provider acceptance is still future work.

Results: 213 server tests passed; workspace/file-group selection, account/capability filtering, public catalogue, phone wrappers and the existing actual Image Editor checks passed. Layouts were checked from 320 to 1440px. Production build and isolated Netlify package checks passed. The catalogue fixture now scopes its no-checkout assertion to page content, excluding the unrelated Astro development toolbar.

## Compact laptop and monitor layout

The default owner view keeps upcoming apps in an expandable **Next from SoraSpace** row under the app grid. It shows up to three recent site revisions (two in short desktop windows), with **All saved site files** opening the full list. Long preview filenames are ellipsised visually with the full name retained in text and a hover title. No file is removed by limiting the preview.

Measured browser checks passed with the main dashboard fitting without page scrolling at 1280×640, 1280×720, 1366×650, 1366×768, 1440×900, 1920×1080 and 2560×1440 CSS pixels, including the owner’s six permitted apps and fixture files. The test checks column order and full document height after fonts load, not just horizontal overflow. These are viewport checks, not measurements of a physical monitor; browser zoom, scaling, expanded future-app details or additional content can require scrolling. No page overflow is forcibly hidden. Future live mail/calendar previews must remain bounded and repeat the same fit checks.

Readability/touch controls are retained, and the phone/tablet checks still cover widths down to 320px. The page content expands up to 1800px on large monitors rather than stretching text across the entire display.
