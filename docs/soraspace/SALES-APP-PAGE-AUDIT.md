# App sales-page coverage audit

The splash links all 32 listed apps/modules to an existing public path and, where used, a valid feature-guide anchor. Coverage is recorded per entry in `audits/sales-app-page-audit.csv`; run `node scripts/audit-sales-app-pages.mjs` after building marketing output. This audit distinguishes a detailed page from a minimal app preview or a guide section.

| Coverage | Count | Current examples |
| --- | ---: | --- |
| Detailed sales page | 2 | My writing & Journal; SoraTrip |
| Dedicated app preview | 6 | SoraDocs, SoraSheets, SoraMail, SoraPhotos, SoraImage, SoraPDF |
| Feature-guide section only | 24 | SoraResearch, SoraShop, SoraProjects, CRM, websites, creative roadmap and shared modules |

The six app previews already have app-specific illustrations and basic workflow/features copy. They need deeper accepted-build stories and screenshots as their engines mature. The 24 guide-only entries do **not** yet have individual detailed sales pages. Shared research/shop concepts and the eight creative concepts exist in the guide, but do not qualify as standalone pages. Some modules have feature text without a matching detailed mockup; the CSV explicitly records those gaps.

Prioritise dedicated SoraResearch and SoraShop pages, then Photography/Journal separation, Projects/CRM/business and the remaining creative apps. Shared services such as translation, Files or Home should have explanatory pages where useful, without implying every module is a separately priced app. All entries remain in the main splash directory while detail pages are built.

Every new mockup must reflect that app's actual purpose and reviewed design: dense references/collections/metadata for SoraResearch; catalogue/stock/orders for SoraShop; timelines/tasks for Projects; contacts/activity/pipeline for CRM; layers for image tools; cells/formulas for Sheets; document layout/references for Docs. Reusing an unrelated generic screen is not acceptable. Distinguish static design concepts from accepted product screenshots and keep sample data fictional.

This is source/build/link coverage, not proof of deployed availability or functional app acceptance. Sales copy, detailed localisation, provider claims, approved pricing and owner review remain tracked in MKT-01/02/05/06.
