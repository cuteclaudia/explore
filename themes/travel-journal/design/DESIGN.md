# Travel journal (`travel-journal`): uplift design

The closest theme to Explore, and deliberately not a copy. It keeps Explore's full-bleed hero,
feature panel and illustrated map, but the mood is dusk rather than alpine: warm paper, rust
accent, an old-style serif and pill-shaped trip chips. It's built for people writing up journeys
after they get home.

**References:** [content.html](content.html) · [empty.html](empty.html) · screens:
[desktop](screens/desktop-content.jpg), [phone](screens/phone-content.jpg),
[desktop empty](screens/desktop-empty.jpg), [phone empty](screens/phone-empty.jpg) ·
[photo credits](CREDITS.md). Feature IDs are defined in [../../UPLIFT.md](../../UPLIFT.md).

## Page structure (home)

| # | Section | Content from | Desktop | Phone | Images (crop · focal) |
| --- | --- | --- | --- | --- | --- |
| 0 | Overlay header (F4) | Name, pages | Circle mark + name 22 px serif; Journal, Photos, About | Name + "☰ Menu" | — |
| 1 | Hero (F1) + feature panel | Hero photo, headline, latest trip | 720 px; gradient from the left (82 % → 10 % by 62 %) plus a low bottom shade; text 7/10.4 bottom-left: eyebrow, 88 px headline, lede, rust pill + glass pill buttons. Panel 3.4/10.4 bottom-right: "On the road · day n", trip title, line, quick links (`feature-panel`, `quick-links`) | 640 px; bottom gradient; headline 46 px; panel without quick links | 16:9 cover, **zoom 138 %, focal 0 % 92 %** so the subject sits right of the text (phone: zoom 100 %, 48 % 50 %) |
| 2 | Latest trip (`feature`, F14) | Journal: newest | Photo 7/12 (radius 10) + eyebrow, chips (days · distance · season), title 48 px, excerpt, outline button | Stacked | 3:2 |
| 3 | Earlier journeys (`cards`, 3) | Journal | 3 cards: 4:3 photo, place eyebrow, title 25 px, summary | Rows: 120 px photo + title | 4:3 (phone fills the row) |
| 4 | Photo strip (`gallery`, strip, F18) | Photos | 5 photos, 300 px high, widths 1.4 / 1 / 1.2 / 1 / 1.3, 10 px gaps, edge to edge | 2 photos, 200 px | per photo |
| 5 | Places (`illustrated-map`) | Places named in journal entries | Map 2/3 (approximate pins, "places are approximate" note) + list of numbered places with season | Stacked, map 300 px | — |
| 6 | About (`intro`) | About | Photo 5/11 + heading 40 px, intro, button | Stacked | 4:3 |
| 7 | Footer | Site | Name + line; links; credits line (F17) | Wraps | — |

## Type, colour, shape

- **Headings:** old-style stack, 500 (Explore uses Georgia 400, so this is warmer and distinct).
  **Body:** system sans 16/1.6.
- **Colour (light):** paper `#f6f3ee`, white cards, ink `#1f2a2e`, muted `#55625f`, rust accent
  `#a5481f`, sand `#d9b26f` and lake blue `#5f8c99` for the map, hero shade `#141c22`.
  Dark: night road, accent `#f0a072`.
- **Shape:** radius 10 on photos and cards (as Explore), **pill buttons** (radius 999).
- **Width:** 1300 px (Explore's width).

## Privacy, carried over from the theme notes

The panel says "On the road", but entries are published after the trip. The map shows approximate,
owner-placed pins only, never GPS from photo metadata. Website Manager should strip location
metadata from uploaded photos by default.

## Widgets

- **On:** `feature-panel`, `quick-links` (in the hero), `illustrated-map` (after the strip),
  `photo-strip`.
- **Suggested:** `map` (outside, click-to-load), `video`, `social-links`.

## Empty site

Website Manager: hero placeholder ("subject on the right"), headline and lede hints, panel hint
("your latest trip appears here automatically"), latest-trip and three card placeholders, five
strip slots, map hint and place rows, about hint. Published: header, hero text, About; the
journal sections appear with the first entry.

## Importer split

**Supported now (changed in `theme.json`):** typography `oldstyle` 500 / `sans`; radius 10,
button radius 999; width 1300; new warm palette (light and dark); home `feature` → `cards` (3) →
`gallery` (strip, 5) → `intro`; widgets on: feature panel, quick links, illustrated map, photo strip.

**New features needed:** F1 (zoom and focal, separate phone focal), F2, F3, F4, F12, F14, F16,
F17, F18. The hero panel (`feature-panel` over a full-bleed hero) already exists in the widget
catalogue.

## Stock photos

| File | Slot | Crop · focal |
| --- | --- | --- |
| hero-van-dusk | Hero | 16:9 · zoom 138 %, 0 % 92 % (phone 100 %, 48 % 50 %) |
| coastal-village | Latest trip | 3:2 |
| lake-red-boat, hiker-ridge, train-window | Earlier journeys | 4:3 · 50 % 60 / 40 / 45 % |
| switchbacks, caravan-meadow, lake-shore-boat, village-steps, map-coffee | Photo strip | fixed height |
| compass-map | About | 4:3 |

**Offered as stock:** the hero, `switchbacks`, `map-coffee` and `compass-map` (scene-setting).
**Reference only:** the trip and card photos (a journal entry should show the owner's own trip).
