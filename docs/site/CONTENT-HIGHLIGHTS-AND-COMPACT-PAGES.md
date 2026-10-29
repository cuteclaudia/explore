# Pinned content, compact discovery pages and direct app links

29 October 2026 (Sydney). Website change; preserves existing content URLs, article bodies, app launch permissions, file storage and app origins. No live article has been published or pinned by the development checks.

## Owner instructions

Open **Studio → Writing & photography → Pinned & featured content**. Choose a published item under **Pinned writing** and save it; choose a separate **Home page feature** and save it. For the other public landing pages, use **Other page**, choose its **Highlight**, then **Save page highlight**. Choices are independent: reuse an item on several pages or choose a different item for each. Select **No highlight** to clear an additional page without changing the others. Use **Automatic latest (no pin)** to clear a manual choice. Reload the public page to see a selection.

Writing can feature a published China Series article, Cyber Brief, OSINT brief or PDF from the published library. Home can also feature a journal entry or photography collection. Working files/private PDF revisions are not eligible. Publish an item through the existing workflow first; choosing a feature never publishes a draft.

If selected content is later unpublished, deleted or moved to the bin with its category, the public feature disappears. Home/Writing can show a clearly labelled latest published item instead; other pages show no replacement unless you select one. A reference may remain in the owner selector as unavailable until replaced/cleared. Public responses never include the unavailable title, draft body or private selection key.

## Public layout

- **Writing & analysis:** writing and a compact pinned/latest feature on the left; search, editable category filters and StratWatch on the right. Results show four per page, with Previous/Next and a result range. Search/filter changes return to the first page. The feature stays visible independently of the selected filter/search.
- **Home:** a compact upper-right feature card within the existing mountain hero, plus topic links and, when different from the feature, the latest journal title. The original photograph, image position and primary copy remain. On narrow screens the card follows the introduction instead of covering it.
- **Public archives:** China Series, Cyber Briefs, OSINT, Journal, Photography and Published library share a compact content/“Explore more” sidebar layout. Article prose and full-screen creative apps retain their appropriate reading/editing layouts. Existing compact settings, Studio, map and form layouts remain in place.
- **Phone/tablet:** writing search/filters move above results, StratWatch follows them, archive navigation reflows, and cards stack. No body overflow is forcibly hidden to simulate a fit. Touch actions retain 44px targets where applicable. Full articles remain readable and scroll normally.

## Pin safety and storage

The separate `studio-content-features/selection` Blobs record stores one selected key per supported page and write provenance. Supported targets are Home, Writing & analysis, China Series, Cyber Briefs, OSINT, Journal, Photography, Published library, About, Contact, Places, Trips, SoraSpace showcase and 3D printing; private account/editor pages and the separate HobbyNest shop are not pin targets. Every selection request requires fresh owner authorisation, the expected account ID, same-origin validation and a matching ETag. Concurrent/uncertain writes require reload. Saving one page preserves all other persisted choices; the UI also retains unsaved selections while switching page/form.

Public features resolve against current published content on each feed request. PDF candidates come only from the existing published library listing; document bytes and private working revisions are not downloaded for previews. The feed uses published snapshots rather than current private draft titles. StratWatch remains an explicit external link with no embedded remote preview or third-party request before a click. Metadata/title/summary rendering escapes text.

## App links

App tiles, shortcut icons and main actions on `/kobo` now open the selected web app directly at `/apps/<existing-slug>` in the SoraSpace tab. Product detail pages do the same. A separate **About this app** link retains the information page. Sign-in preserves the app destination rather than returning everyone to the generic workspace.

Mail and Sheets remain desktop-only: their links focus the corresponding permitted desktop card in `/apps`, using an allowlisted `desktop` parameter preserved through sign-in. They do not invent web engines or bypass release gates. Installer access is still separately authorised. New windows retain `noopener`; internal app IDs and storage contracts are unchanged.

## Verification

`server/content-features.test.mjs` covers published-only selection, independent slots, owner/account checks, stale/concurrent updates and withdrawal of deleted/unpublished features. `scripts/check-content-highlights.mjs` uses real isolated local content/feature APIs for both selections, private draft exclusion, published PDF pinning, pagination, filter independence, hero-image preservation, sidebar geometry and direct app links. It checks widths from 320 to 2560px. Login tests verify direct app and desktop-card return destinations.

The shared responsive audit covers all existing page families, including expanded settings/editor states, with additional archive/app-product checks. Browser identity/provider data are fixtures; these results are not a live payment, cloud-sync or domain-cutover acceptance.

Dynamic archives render their page feature on the server. Prerendered landing pages load the current published feature with the compiled client controller, so changes do not require rebuilding the website. The existing static Netlify contact form is preserved. `scripts/check-prerendered-features.mjs` verifies the built contact, apps and printing pages at phone/tablet/desktop widths.

Final results: **218 server tests passed**, plus the content/highlight and direct-login browser scenarios. The final shared audit passed **220 checks** at 320/768/1366/1920px; an additional 32 archive/product/file-page checks and the earlier six-width 330-check style audit passed. Production build, isolated packaged SSR/auth checks and the built static-page feature tests passed. Local evidence is under `/workspace/reviews/content-highlights/` and `/workspace/reviews/layout-audit/`; no live owner selections were changed. Mock guard navigation in the login browser test stays within controlled documents, while real HTTP redirects remain covered by packaged SSR checks.
