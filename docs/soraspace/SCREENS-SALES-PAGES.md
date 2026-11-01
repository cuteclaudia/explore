# Presentation and interface-design sales pages

SoraSlides — Akari · 明かり (`/tools/akari/`) and SoraDesign — Hinagata · 雛形 (`/tools/hinagata/`) have separate detailed sales pages in both marketing sources. Both names remain proposed and both apps Planned. The latest-preview strip and the twelve-card discovery gallery link directly to them; the 33-entry directory and shared creative guide use the same destinations.

## Matching design concepts

SoraSlides has five original concepts: six-slide outline/canvas/inspector; four reusable layouts and a Coastal theme; presenter context with slide 3, next slide 4 and private speaker notes; an eight-deck compact library; and output review. The example deck consistently has six 16:9 slides, four slides with notes and one unresolved linked clip on slide 4. The timer is illustrative, not running. PDF handout scope is six pages with notes off; single-slide PNG is slide 3 at 1920 × 1080. No output is generated.

SoraDesign has five original concepts: five named frames with layers and selected-frame inspector; four component states and shared design values; desktop/tablet/phone variants using the same three collections; a three-screen flow with a return path; and a six-item asset/component handoff library. Home has desktop/tablet/phone variants, while Collection and Story have desktop frames. The responsive examples show three, two and one cards across. Intended 44px controls and design values do not establish tested accessibility or generated code.

The mockups use original CSS artwork, system fonts and fictional records. Compact libraries and inspectors follow the shared SoraSpace layout; slide and screen canvases retain room to work. Phone layouts stack inspectors and provide local thumbnail/table scrolling. These are static illustrations, not accepted editor screenshots.

## Validation and remaining work

`check-screens-sales.mjs` checks ten mockups, sample counts, output boundaries, 320/390/768/1366px layouts, French/Japanese overview navigation and absence of foreign requests or live input controls. Desktop and phone captures are in `/workspace/reviews/screens-sales/`. Overview copy has 16 locales; detailed English concepts are explicitly labelled and editorial localisation remains open.

Both builds cover 320 public locale routes. The current directory audit records 12 detailed pages, six basic app previews and 15 guide-only gaps. MKT-01 remains Partial. Continue with SoraVideo/Kage and SoraAudio/Hibiki, then SoraMotion/Mai, SoraCAD/Takumi and useful business/shared-service pages. Native editor integration, file fidelity, fonts, save/autosave, prototypes, presentation delivery, collaboration, export, pricing and hosted acceptance remain separate tasks. Source pushes do not verify deployed availability.
