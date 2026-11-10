# Writer & author (`writer-author`): uplift design

A book-like site: centred name, italic headline, one big image for the newest piece with its title
card overlapping it, then a quiet reading column of essays. A typeset book cover follows, then a
monthly letter and a black-and-white portrait. Old-style type throughout, the 700 px reading
measure kept for lists, and very few images.

**References:** [content.html](content.html) · [empty.html](empty.html) · screens:
[desktop](screens/desktop-content.jpg), [phone](screens/phone-content.jpg),
[desktop empty](screens/desktop-empty.jpg), [phone empty](screens/phone-empty.jpg) ·
[photo credits](CREDITS.md). Feature IDs are defined in [../../UPLIFT.md](../../UPLIFT.md).

## Page structure (home)

| # | Section | Content from | Desktop | Phone | Images (crop · focal) |
| --- | --- | --- | --- | --- | --- |
| 1 | Header (`centered`) | Name, pages | Name 34 px old-style; nav in italic old-style; short rule | Same, smaller | — |
| 2 | Hero (`text`) | Headline, lede | Centred italic headline 72 px, lede 20 px | 38 px | — |
| 3 | New essay (`feature`) | Essays: newest | Image 2:1 (1100 px), title card (700 px) overlapping by 90 px: type · reading time, 52 px title, summary, italic link | Image 4:3; card overlaps by 40 px | 2:1 (phone 4:3) · 50 % 55 % |
| 4 | Recent essays (`list`) | Essays | 700 px column: date · reading time, 30 px title, one line, rules between | Same | — |
| 5 | The book (`feature`, F23) | About: book | Surface band: cover 4/11 (typeset, or uploaded) + eyebrow, italic title 50 px, blurb, review quote (genuine), two buttons | Cover 220 px wide, centred | Cover 2:3 |
| 6 | Letters (`cta` with sign-up) | Site | Image 5/11 + italic heading, line, email field, Subscribe | Stacked | 4:3 |
| 7 | About (`intro`) | About | Grayscale portrait 4/10 + name 40 px, bio, button | Stacked | 4:5 · 50 % 30 % |
| 8 | Footer | Site | Centred name, links, credits | Same | — |

## Type, colour, shape

- **Headings and body:** old-style stack (Iowan, Palatino, P052), weight 400, scale 1.05; italics
  for the headline, nav and book title. Labels in sans capitals.
- **Colour (light):** paper `#fdfcf8`, surface `#f6f3ea`, ink `#222`, muted `#5e5a52`, oxblood
  accent `#8a2c2c`; `art1` `#4b5a52` is the typeset cover colour.
- **Shape:** square; buttons radius 2. **Width:** 1100 px for images and bands, 700 px for reading.

## Widgets

- **On:** `social-links`.
- **Suggested:** `latest-posts` (Notes), `audio` (readings, outside, click-to-load), `upcoming-events` (launches, readings).

## Empty site

Website Manager: headline hints, wide image placeholder with title-card hints, one essay row hint,
cover placeholder ("upload the cover, or let SoraSpace set the title in type"), newsletter and about
hints. Published: name, headline, About; essays appear with the first one.

## Importer split

**Supported now (changed in `theme.json`):** width 1100; `art1` for the cover; home `feature` (new
essay) → `list` → `feature` (book) → `cta` (letters) → `intro`; widgets as above.

**New features needed:** F2, F3, F8 (overlapping title card), F12, F16 (nav may also stay visible,
it's short), F17, F23 (typeset book cover), plus a sign-up field in `cta`. That needs the newsletter
or mail service: until it exists, the button links to Contact.

## Stock photos

| File | Slot | Crop · focal |
| --- | --- | --- |
| foggy-town | New essay | 2:1 · 50 % 55 % |
| fjord-fog | (alternative essay image) | 2:1 |
| letters | Letters | 4:3 |
| desk, bookshelf | (alternatives for notes and letters) | 4:3 |
| author | About | 4:5 · 50 % 30 % |

**Offered as stock:** all landscape and still-life photos (essay illustrations). **Reference only:**
`author`. The book cover is never stock: it's typeset or uploaded.
