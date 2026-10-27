# Appearance and responsive layout audit

28 October 2026, Australia/Sydney. Source review plus actual locally rendered Astro templates, isolated seeded content/test identity, and browser measurements. No real account, stored content, provider credentials or registration settings were changed by the audit.

## System palette

System previously chose the site's Alpine/Midnight brand colours. It now uses native CSS system colours: Canvas, CanvasText, ButtonFace, GrayText, and AccentColor/AccentColorText when supported, otherwise Highlight/HighlightText. Native light/dark and forced-contrast changes are respected. Controls, surfaces, borders, selected states and text use those semantic colours; custom palettes remain independent and saved preferences remain compatible.

On Windows this follows the system colours the browser exposes. A website cannot read all Windows personalization settings or guarantee access to the exact personal accent in every browser. This is not a hard-coded approximation presented as a live OS palette. The automated check ran Chromium on Linux with light/dark and forced-colours emulation; a physical Windows visual check is still useful.

## Findings and changes

| Area | Finding | Change |
| --- | --- | --- |
| Home/prototype and writing views | Fixed 610px desktop/540px phone hero and generous repeated section padding | Responsive hero, smaller title ceiling, tighter card grids and section gaps; readable introductory copy retained |
| Settings | Wrapped navigation consumed several phone rows; a scrolling-nav prototype also revealed a grid minimum-width overflow | One local scrolling navigation row below 900px, explicit shrinkable grid/aside, current section revealed; smaller theme swatches and less duplicate header space |
| Settings controls | Some selects compressed their selected labels | Stable select width while adjacent explanation wraps |
| WebDAV/Drive storage | Long test/retention instructions always expanded | Explanations remain available in disclosures; connection state, test buttons and results stay visible |
| Map | Sidebar could extend far beyond its container and clip controls without document-level overflow | Constrained grid items and search fields, map-first order on smaller screens, correctly anchored layer menu and bounded horizontal place strip |
| About editor | Page metadata and section list pushed writing below the first phone screen | Collapsed title/description, mobile section picker, tighter builder gaps; required-field errors expand the relevant disclosure and receive focus |
| Journal/essay editor | Three stacked metadata panels wasted phone height | Compact Details/Cover/Photos row, full-width opened panel and wrapping formatting controls; editable article typography retained |
| Trips and dialogs | Oversized heading/tabs/card gaps | Smaller headings and gaps, compact dialog padding, wrapping actions |
| Library, photograph, credits and legacy Explore/tool pages | Inconsistent large margins or missing side gutters | Consistent page rhythm and gutters; long articles/tables scroll locally rather than stretching the whole document |
| Phone/tablet interaction | Several text fields used 11–14px text | Essential text inputs/selects use at least 16px below 1100px; coarse-pointer primary actions and tool controls have larger touch areas |

Content reading stays at a comfortable line length and around 16px/1.65 line spacing; this audit reduces layout space rather than scaling down the whole page. App iframe canvases retain their own layout and sandbox policies. Text authored with explicit typography is not globally rewritten.

## Rendered coverage

291 distinct URL/state/width combinations across 42 representative URLs (including hash views, parameterized content, both draft preview templates and a published file detail), at 320, 360, 390, 768, 1024 and 1440 CSS pixels. Expanded settings/editor panels, a permissions editor and the trip dialog are included. There were 316 measurements including targeted rechecks. All completed without page-width overflow, expanded mobile layout viewports or unintended clipped controls. Intended local scrolling in navigation, place strips and wide article tables remains available.

All visible text inputs/selects measured at the phone/tablet widths were at least 16px. Additional interaction checks verified collapsed invalid editor fields become visible/focused and do not submit. Native System palette, account/browser preference persistence, live light/dark, contrast colours and independent custom themes passed browser checks.

Representative 390px results with the same fixture content: home scroll height 4,230 → 3,600px; default About editor 1,880 → 1,583px; trips 1,014 → 919px. Settings, storage and map also shortened; measurements are fixture comparisons, not claims about the length of Claudia's live articles.

Scripts: `site-layout-fixture.mjs`, `audit-responsive-layout.mjs`, `check-editor-disclosures.mjs`, `check-system-appearance.mjs`. The fixture binds localhost only, refuses production mode, uses temporary Blobs storage and a Vite-only test identity. That identity plugin is never part of the production config or deployment. Audit browser mutations are refused. The production build and isolated deployed-package authorization checks run separately with real guards intact.

## Limits and follow-up

This audit covers every top-level page layout family with representative content; arbitrary future article content still needs sensible table/image choices. Browser dimensions/touch are emulated, not a claim of testing every physical device. Map external traffic is blocked in the fixture, so map layout/fallback is covered; live terrain/provider performance is not re-certified. Native Hikari rendering is tested separately from the site's app wrappers.

Public sign-up/subscription automation was not enabled. The next-stage design is recorded in `docs/kobo/REGISTRATION-AND-ACCESS-MODES.md`: registration and access approval are separate controls, new sign-ups receive no implicit grants, and automation must remain unavailable until verified billing integration exists.
