# Photography portfolio (`photography-portfolio`): uplift design

Dark, quiet and image-first. One full-screen photograph with a thin title, then a masonry wall
of work with small captions, a list of series, a short about and a black contact band. The
interface almost disappears: light-weight type, no boxes, no colour except the photographs.
Explore uses a photo hero with a feature panel; this theme goes further, with the hero at full
viewport height and a header that floats over it.

**References:** [content.html](content.html) · [empty.html](empty.html) · screens:
[desktop](screens/desktop-content.jpg), [phone](screens/phone-content.jpg),
[desktop empty](screens/desktop-empty.jpg), [phone empty](screens/phone-empty.jpg) ·
[photo credits](CREDITS.md). Feature IDs are defined in [../../UPLIFT.md](../../UPLIFT.md).

**Default appearance: dark** (F15). Light stays available and passes contrast.

## Page structure (home)

| # | Section | Content from | Desktop | Phone | Images (crop · focal) |
| --- | --- | --- | --- | --- | --- |
| 0 | Overlay header (F4) | Site name, pages | Name 13 px capitals 0.32 em left; Portfolio, About, Contact right; white over the hero | Name + "☰ Menu" (F16) | — |
| 1 | Hero (F1) | Hero photo, headline, tagline, caption | 100 vh (min 620, max 980 px); shade from the bottom (to 45 %) plus a light top shade for the header; title 112 px weight 200 bottom-left; caption bottom-right in 12 px capitals | 86 vh; title 54 px; caption under the title | 16:9 cover · 45 % 50 % (phone 50 % 50 %) |
| 2 | Intro (`intro`) | About summary | "Selected work" 48 px weight 200 (1/3) beside two sentences in muted 18 px (2/3), aligned to the bottom | Stacked | — |
| 3 | Selected work (`gallery`, masonry) | Portfolio | 3 columns (min 320 px), 14 px gutters, side padding 4 %; natural ratios; caption under each: title left, year right, 12 px muted | 2 columns, 8 px gutters, no captions | Natural; keep each photo's own ratio |
| 4 | Series (`list`, F9) | Portfolio galleries | Rows: 16:9 cover (220 px), title 30 px weight 200, years, count → | 96 px cover + title; count hidden | 16:9 |
| 5 | About (F8) | About | Photo 6/11 + name 42 px, bio, two facts (Based in, Available for) | Stacked | 4:3 · 72 % 50 % |
| 6 | Contact (`contact`) | Contact | Black band, centred: 64 px weight 200 heading, line, outline button with the email | Same | — |
| 7 | Footer | Site | © name, social links, credits line (F17), 12 px | Wraps | — |

## Type, colour, shape

- **Headings:** system sans at weight **200** (was 300 capitals): large and thin, normal case,
  tracking −0.01 em. Capitals are kept for the small labels only.
- **Body:** system sans 16/1.6; muted text `#a3a3a3` on `#0b0b0c`.
- **Colour:** near-black `#0b0b0c`, surface `#151517`, contact band pure black. No accent colour:
  buttons are outlined in the text colour.
- **Shape:** square corners; no card backgrounds.
- **Width:** 1400 px; the gallery and header use 4 % side padding, not the content width.

## Responsive

- Above 760 px the header floats over the hero. On every other page (and without a hero photo) it
  sits on the background (F4).
- Masonry: 3 → 2 columns under about 1000 px wide, and stays 2 on phones (photographers want to show more than one at a time).
- The hero caption moves under the title on phones.

## Widgets

- **On:** `social-links` (footer).
- **Suggested:** `contact-card` (before footer), `photo-strip` (after hero, for a second series),
  `map` (outside, click-to-load: where workshops happen).

## Empty site

Website Manager: dark hero placeholder ("Your opening photograph · landscape, at least 2400 px
wide"), headline and tagline hints, nine masonry placeholders, three series rows, about and contact
hints. Published: name and navigation, About and Contact text if written; the gallery appears
with the first published photographs. No stock photo is placed for the owner.

## Importer split

**Supported now (changed in `theme.json`):** typography `sans`/`sans`, weight 200, case none,
tracking −0.01; `header: minimal`, `hero: full-bleed`; home `intro` → `gallery` (masonry, 9) →
`list` (Series) → `intro` (About) → `contact`; widgets as above; width 1400.

**New features needed:** F1 (full-viewport height option and caption), F2, F3 (natural ratio),
F4, F9 (series list), F12, F15, F16, F17. A gallery caption option (title + year) is part of F9.

## Stock photos

| File | Slot | Crop · focal |
| --- | --- | --- |
| hero-misty-lake | Hero | 16:9 · 45 % 50 % |
| mountain-reflection, wave-mono, dunes, glacier, dusk-lake | Masonry (landscape) | natural |
| rain-night, misty-pines | Masonry (portrait) | natural |
| fox | Masonry | natural (4:3) |
| photographer | About | 4:3 · 72 % 50 % |

A photographer's site must show their own photographs, so **none of these is offered as stock**
in Website Manager. They exist so the reference looks real.
