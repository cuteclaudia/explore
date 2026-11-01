Video/audio sales update: [SoraVideo and SoraAudio](MEDIA-SALES-PAGES.md) add ten original app-specific concepts to both sources. Find them under Latest detailed previews on the splash. Current coverage is 14 detailed pages, six basic previews, 13 guide-only gaps and 352 public locale routes. Both apps remain Planned; no media engine is enabled.

Presentation/interface sales update: [SoraSlides and SoraDesign](SCREENS-SALES-PAGES.md) add ten original app-specific concepts to both sources. Latest previews are directly linked from the splash; current coverage is 14 detailed pages, six basic previews, 13 guide-only gaps and 352 public locale routes. Both apps remain Planned; native integration and live deployment acceptance remain separate.

# App sales-page coverage audit

The splash links all 33 listed apps/modules to an existing public path and, where used, a valid feature-guide anchor. Coverage is recorded per entry in `audits/sales-app-page-audit.csv`; run `node scripts/audit-sales-app-pages.mjs` after building marketing output. This audit distinguishes a detailed page from a minimal app preview or a guide section.

The main splash is now [a scrolling landing tour](SCROLLING-LANDING-PAGE.md). A visible fourteen-card preview gallery leads directly to the detailed pages, with SoraVideo and SoraAudio highlighted. All 33 catalogue entries appear in seven scrolling groups with sticky chapter links. The earlier eight-second rotating tab view is available through an explicit Slideshow view choice, with pause/manual/keyboard/focus/reduced-motion controls. Home/templates remain visible; supplemental editor/roadmap mockups are optional, and legacy bookmarks open their disclosures. New English explanations are labelled; editorial localisation remains outstanding.

| Coverage | Count | Current examples |
| --- | ---: | --- |
| Detailed sales page | 14 | My writing; Journal; Photography galleries; SoraTrip; SoraResearch; SoraShop; SoraProjects; SoraCRM; Illustration; Page layout; Presentations; UI design; Video; Audio & music |
| Dedicated app preview | 6 | SoraDocs, SoraSheets, SoraMail, SoraPhotos, SoraImage, SoraPDF |
| Feature-guide section only | 13 | Websites, creative roadmap, finance/procurement/support and shared modules |

The six app previews already have app-specific illustrations and basic workflow/features copy. They need deeper accepted-build stories and screenshots as their engines mature. The 13 guide-only entries do **not** yet have individual detailed sales pages. Illustration and Page layout now have dedicated pages, each with five original concepts. Two of the eight original creative concepts still appear only in the shared guide; those shared sections do not qualify as standalone pages. Some modules have feature text without a matching detailed mockup; the CSV explicitly records those gaps.

The dedicated SoraResearch page has six matching concepts, and SoraShop has seven compact commerce concepts. Photography and Journal now have separate pages with five matching concepts each. Journal has its own directory entry, raising the total from 32 to 33 modules without adding an entitlement or pricing claim. SoraProjects and SoraCRM now each have six matching business concepts. Prioritise Motion and CAD, then finance/procurement/support and useful shared-service explanations. Shared services such as translation, Files or Home should have explanatory pages where useful, without implying every module is a separately priced app. All entries remain in the main splash directory while detail pages are built.

Every new mockup must reflect that app's actual purpose and reviewed design: dense references/collections/metadata for SoraResearch; catalogue/stock/orders for SoraShop; timelines/tasks for Projects; contacts/activity/pipeline for CRM; layers for image tools; cells/formulas for Sheets; document layout/references for Docs. Reusing an unrelated generic screen is not acceptable. Distinguish static design concepts from accepted product screenshots and keep sample data fictional.

This is source/build/link coverage, not proof of deployed availability or functional app acceptance. Sales copy, detailed localisation, provider claims, approved pricing and owner review remain tracked in MKT-01/02/05/06.

Showcase validation: `node scripts/check-app-showcase.mjs` checks default scrolling/discovery visibility, chapter/progress navigation, optional slideshow/manual/keyboard pause, reduced-motion/no-script behaviour, legacy bookmarks and 320–1366px layouts. The legacy landing smoke also expands and checks the optional material through 1920px. Marketing metadata remains checked across 352 locale routes.
