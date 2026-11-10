# Consultant (`consultant`): uplift design

A confident personal-brand site that answers three questions quickly: what you help with, what
happened when you did, and how to start. The hero is a split: a big two-tone headline with an
availability chip on the left, a portrait with a figure card on the right. Then three services,
case studies that lead with their result, four steps, one genuine client quote, the latest writing
and an enquiry panel with the practical details.

**References:** [content.html](content.html) · [empty.html](empty.html) · screens:
[desktop](screens/desktop-content.jpg), [phone](screens/phone-content.jpg),
[desktop empty](screens/desktop-empty.jpg), [phone empty](screens/phone-empty.jpg) ·
[photo credits](CREDITS.md). Feature IDs are defined in [../../UPLIFT.md](../../UPLIFT.md).

## Page structure (home)

| # | Section | Content from | Desktop | Phone | Images (crop · focal) |
| --- | --- | --- | --- | --- | --- |
| 1 | Header (`split`) | Name, line, pages | Name 21 px + line; Services, Work, Writing, About; "Book a call" pill | Name + "Book a call" | — |
| 2 | Hero (`split`, F28) | Home | 7/5 split; availability chip; headline 46–82 px, last words in accent; lede 21 px; two buttons. Portrait with figure card overlapping its lower left | Portrait first (1:1, 320 px), then text | 4:5 · 50 % 30 % |
| 3 | What I help with (`list`, F22 variant) | About | Three cards: number, service, one line, up to three examples ruled | Stacked | — |
| 4 | Selected work (`cards`, F27) | Work | Three cards: photo, sector, title, line, **result figure** in accent + label | Rows: photo 130 px left | 3:2 |
| 5 | How it works (F10) | About | Four steps under a 2 px rule, 01–04 in accent | 2 × 2 | — |
| 6 | Client quote (`testimonials`) | Widget | Deep indigo band (`heroShade`), centred quote 24–40 px with large cyan quote mark | Same, smaller | — |
| 7 | Latest writing (`feature`) | Writing | Photo 6/11 + title, summary, link and two older posts with reading time | Stacked | 4:3 |
| 8 | Enquiry (`cta` + `contact-card`) | Contact | Rounded accent panel: heading, what happens next; white card with call length, reply time, location and button | Full-width panel | — |
| 9 | Footer | Site | Name + business details; links; credits | Wraps | — |
| — | Phone action bar (F11) | Contact | — | Email · Book a call | — |

## Type, colour, shape

- **Headings:** geometric stack, 700, tracking −0.02 em. **Body:** system sans 16/1.6.
- **Colour (light):** paper `#fbfbfd`, white cards, ink `#17171c`, muted `#5b5b66`, indigo accent
  `#4f46e5`, cyan detail `#22d3ee`, quote band `#17153a`. Dark keeps the same structure
  (`#0f0f14`, accent `#a5b4fc`).
- **Shape:** radius 12, pill buttons, cards with 1 px borders and no shadows (one soft shadow on
  the figure card). **Width:** 1240 px.

## Enquiry path

One action everywhere: "Book a call" (header, hero, enquiry panel, phone bar) goes to the Contact
page. Optional booking link: if the owner adds a scheduling link, the button opens it as a plain
outbound link (no embed, no provider). The enquiry card's three facts are short text fields.

## Widgets

- **On:** `testimonials` (genuine, with permission, never invented), `contact-card` (the enquiry card).
- **Suggested:** `latest-posts`, `key-numbers` (the hero figure card can come from here),
  `social-links`.

## Empty site

Website Manager: chip, headline and lede hints, portrait slot (4:5), figure card hints, three
service cards, three case-study slots with result hints, four step hints, quote hint, writing
slot, enquiry hints. Published: header, headline, lede, buttons and the enquiry panel. The chip,
figure card, case studies, steps, quote and writing are left out until they have content.

## Importer split

**Supported now (changed in `theme.json`):** geometric headings, radius 12, pill buttons, width
1240, `heroShade`/`heroText`; home `list` (services) → `cards` (work, 3 with images) → `facts`
(steps) → `feature` (writing) → `cta`; widgets as above.

**New features needed:** F2, F3, F10, F11, F12, F16, F17, F22 (with examples list), F27 (result
figure on cards), F28 (availability chip).

## Stock photos

| File | Slot | Crop · focal |
| --- | --- | --- |
| portrait | Hero | 4:5 · 50 % 30 % |
| meeting, sticky-notes, whiteboard | Case studies | 3:2 |
| desk | Latest writing | 4:3 |

**Offered as stock:** `desk`, `sticky-notes` (generic working scenes). **Reference only:**
`portrait` (the consultant must be themselves), `meeting` and `whiteboard` (would read as the
consultant's own clients and workshops).
