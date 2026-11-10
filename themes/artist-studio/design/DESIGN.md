# Artist studio (`artist-studio`): uplift design

A personal portfolio for painters and makers: warm paper, an old-style serif and work shown like
it hangs in a gallery. Each piece sits on a mat with its title in italics and its medium, size and
availability underneath. Explore leads with landscape; this theme leads with the person and the
studio, then the work.

**References:** [content.html](content.html) · [empty.html](empty.html) · screens:
[desktop](screens/desktop-content.jpg), [phone](screens/phone-content.jpg),
[desktop empty](screens/desktop-empty.jpg), [phone empty](screens/phone-empty.jpg) ·
[photo credits](CREDITS.md). Feature IDs are defined in [../../UPLIFT.md](../../UPLIFT.md).

## Page structure (home)

| # | Section | Content from | Desktop | Phone | Images (crop · focal) |
| --- | --- | --- | --- | --- | --- |
| 1 | Header (`centered`) | Name, tagline, pages | Name 30 px old-style, tagline 12 px capitals 0.3 em; nav below, current page underlined in accent; rule under | Name 24 px; nav scrolls sideways | — |
| 2 | Hero (`split`, F1) | Headline, tagline, studio photo | Text 5/11: eyebrow, 86 px headline with one word in accent italic, 19 px lede, two buttons; photo 6/11, radius 4 | Photo first, then text; headline 46 px | 5:4 · 55 % 50 % |
| 3 | Current series (`gallery`, even, F9) | Work | Head: eyebrow, series title 52 px, one sentence, "All work" button; grid 3 columns, 44/38 px gaps; each work on a 22 px mat (surface, 1 px border), italic title 21 px, medium · size, availability dot (teal available, accent sold) | 2 columns, 10 px mat, smaller captions; "All work" hidden | 3:4 · centre (artwork is never cropped off-centre) |
| 4 | Statement (`feature`, F8 quote only) | About: statement line | Surface band, centred italic quote 42 px, source | Same, 28 px | — |
| 5 | From the studio (`cards`, 2) | Studio notes | Two notes: 3:2 photo, date, title 28 px, summary | Stacked | 3:2 |
| 6 | Shows & stockists (`list`) | About: exhibitions | Photo 5/11 + year · title · venue rows | Stacked | 4:3 |
| 7 | About the artist (`intro`, F8) | About | Bio 6/11 + 3 facts; portrait 5/11 on the right | Stacked | 4:5 · 55 % 40 % |
| 8 | Footer | Site | Centred name, social links, credits line (F17) | Same | — |

## Type, colour, shape

- **Headings:** old-style stack (Iowan, Palatino, P052), 500. Italic for artwork titles and quotes.
  **Body:** humanist sans (Seravek, Gill Sans Nova, Ubuntu, Calibri).
- **Colour (light):** paper `#f6f0e6`, mat `#fffaf2`, ink `#2e2620`, muted `#6a5d52`, terracotta
  accent `#a8412a`, rules `#e3d6c4`, available-dot teal `#5d7c80`. Dark: studio-at-night browns.
- **Shape:** radius 4 on photos and buttons; mats are square.
- **Width:** 1180 px.

## Responsive

- On phones the hero photo comes first, so the artist's world is visible before any text.
- The works grid stays 2 columns on phones (one column makes paintings feel like a feed).
- Artwork photos are never cropped by focal point: the crop ratio is the painting's ratio (3:4 by
  default; natural is allowed under F3).

## Widgets

- **On:** `social-links`.
- **Suggested:** `upcoming-events` (openings, after the statement), `photo-strip` (process photos),
  `video` (studio film, outside, click-to-load).

## Empty site

Website Manager: centred name, nav, hero hints and photo placeholder, six artwork placeholders on
mats with "Title", "Medium · size" and "Available / Sold" hints, statement, notes, exhibitions and
about hints. Published: header, hero text, About; the work grid appears with the first artwork.

## Importer split

**Supported now (changed in `theme.json`):** added `heroShade` / `heroText`; teal `art2` for the
available dot; home `gallery` (even, 6) → `feature` (statement) → `cards` (2) → `list` (shows) →
`intro` → `contact`; widgets as above; sample text updated.

**New features needed:** F1 (split hero photo), F2, F3, F8 (quote-only band and image-right
about), F9 (artwork details, mat style, availability), F12, F16 (sideways nav), F17. Exhibitions
need list rows with year · title · venue: a small "exhibitions" list style.

## Stock photos

| File | Slot | Crop · focal |
| --- | --- | --- |
| studio-wide | Hero | 5:4 · 55 % 50 % |
| work-tide, work-meadow, work-undertow, work-fence, work-plaster, work-dusk | Series works | 3:4 · centre |
| palette, hero-studio | Studio notes | 3:2 |
| exhibition | Shows & stockists | 4:3 |
| artist-easel | About portrait | 4:5 · 55 % 40 % |

The six works are abstract paintings by Steve A Johnson on Pexels. Because a tenant would be
showing someone else's paintings as "their work", these photos are **reference only**: Website
Manager must not offer them as stock for the Work page (F2 excludes them). The studio, palette,
exhibition and portrait photos can be offered.
