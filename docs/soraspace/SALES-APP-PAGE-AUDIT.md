# App sales-page coverage audit

The splash links all 32 listed apps/modules to an existing public path and, where used, a valid feature-guide anchor. Coverage is recorded per entry in `audits/sales-app-page-audit.csv`; run `node scripts/audit-sales-app-pages.mjs` after building marketing output. This audit distinguishes a detailed page from a minimal app preview or a guide section.

The main splash now presents the same 32 entries in seven ordered app-group tabs, rotating every eight seconds while visible and idle. Choosing a tab stops rotation; Play resumes it. Hover, keyboard focus, background tabs and off-screen viewing suspend the timer. Reduced-motion users start paused. Without JavaScript all seven groups remain readable. Longer app/workspace/template previews are collapsed beneath the showcase, and existing hash links open that section. Detailed pages keep their static directory. New showcase descriptions and controls are English; full editorial localisation remains outstanding.

| Coverage | Count | Current examples |
| --- | ---: | --- |
| Detailed sales page | 3 | My writing & Journal; SoraTrip; SoraResearch |
| Dedicated app preview | 6 | SoraDocs, SoraSheets, SoraMail, SoraPhotos, SoraImage, SoraPDF |
| Feature-guide section only | 23 | SoraShop, SoraProjects, CRM, websites, creative roadmap and shared modules |

The six app previews already have app-specific illustrations and basic workflow/features copy. They need deeper accepted-build stories and screenshots as their engines mature. The 23 guide-only entries do **not** yet have individual detailed sales pages. SoraShop and the eight creative concepts still appear in the shared guide; those shared sections do not qualify as standalone pages. Some modules have feature text without a matching detailed mockup; the CSV explicitly records those gaps.

The dedicated SoraResearch page now has six matching concepts. Prioritise a detailed SoraShop page next, then Photography/Journal separation, Projects/CRM/business and the remaining creative apps. Shared services such as translation, Files or Home should have explanatory pages where useful, without implying every module is a separately priced app. All entries remain in the main splash directory while detail pages are built.

Every new mockup must reflect that app's actual purpose and reviewed design: dense references/collections/metadata for SoraResearch; catalogue/stock/orders for SoraShop; timelines/tasks for Projects; contacts/activity/pipeline for CRM; layers for image tools; cells/formulas for Sheets; document layout/references for Docs. Reusing an unrelated generic screen is not acceptable. Distinguish static design concepts from accepted product screenshots and keep sample data fictional.

This is source/build/link coverage, not proof of deployed availability or functional app acceptance. Sales copy, detailed localisation, provider claims, approved pricing and owner review remain tracked in MKT-01/02/05/06.

Showcase validation: `node scripts/check-app-showcase.mjs` checks manual/automatic selection, keyboard order, focus pause, reduced-motion defaults, no-script visibility, legacy hash navigation and 320–1366px layouts. The legacy landing smoke also expands and checks the optional material through 1920px. Marketing metadata remains checked across 176 locale routes.
