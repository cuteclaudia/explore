# Musician & band (`musician-band`): uplift design

Dark, loud and built for the two things fans come for: the next gig and the new record. The name
fills the bottom of a full-bleed live photo, gigs come straight after with ticket status, then the
release with its artwork, track list and listening links, a live photo mosaic, an optional video,
the band, a photo-backed booking block and the mailing list.

**References:** [content.html](content.html) · [empty.html](empty.html) · screens:
[desktop](screens/desktop-content.jpg), [phone](screens/phone-content.jpg),
[desktop empty](screens/desktop-empty.jpg), [phone empty](screens/phone-empty.jpg) ·
[photo credits](CREDITS.md). Feature IDs are defined in [../../UPLIFT.md](../../UPLIFT.md).

## Page structure (home)

| # | Section | Content from | Desktop | Phone | Images (crop · focal) |
| --- | --- | --- | --- | --- | --- |
| 1 | Overlay header (F4) | Name, pages | Name in capitals 20 px, nav in spaced capitals | Name + "☰ Menu" (F16) | — |
| 2 | Hero (F1, `full-bleed`) | Home | 760 px; shade from the bottom; news line in accent, name 64–150 px condensed capitals, line, Gig dates + Listen | 640 px, name 68 px | 16:9 · 50 % 35 % (heads in the top half, name sits over bodies) |
| 3 | On tour (F30) | Gigs & news (dated) | Rows: date block (day 44 px + weekday · month), venue, town · details, status chip, Tickets ↗ | Date left, venue, details, button | — |
| 4 | Latest release (F31) | Gigs & news (release post) | Square artwork 5/12 (typeset by F23 until uploaded), type · tracks, title 44–72 px, blurb, two-column track list, listening links, audio placeholder | Stacked | 1:1 |
| 5 | Live (`gallery`, F25) | Photos | One large (2 rows) + four, 300 px rows, caption chips; video placeholder 21:7 below | Large + two | per photo |
| 6 | The band (`intro`) | About | Photo 6/11, heading, story, member chips | Stacked | 3:2 |
| 7 | Book the band (`contact`, F26) | Bookings | Dimmed crowd photo, 52–110 px heading, for / agent / press list | Stacked | 16:9 |
| 8 | Mailing list (`cta`) | Site | Heading + line, Join the list | Stacked | — |
| 9 | Footer | Site | Name, links, credits | Wraps | — |

## Type, colour, shape

- **Headings:** condensed stack, 800, capitals. **Body:** system sans.
- **Starts dark (F15)**, offering System and Light: night `#0c0812`, surface `#17101f`, text
  `#f4efff`, muted `#b4a6c8`, lilac accent `#d9a6ff`, art `#4b1580` → `#a3164c` (cover gradient).
  Light: lavender `#f3f0ff`, accent `#7c1fd1`.
- **Shape:** radius 4, pill buttons. **Width:** 1400 px (4 % sides).

## Gigs and tickets (F30)

Gigs are dated posts. Each has venue, town and details, an optional ticket link (outbound,
`rel="noopener"`) and a status: on sale (default, shows Tickets ↗), few left, sold out (no button,
struck through), free, cancelled. Past gigs drop off at the next publish, as with
`upcoming-events`. With no future gigs the section is left out.

## Listening (F31)

Listening links are plain text links the owner adds (service name + URL), shown as outlined pills
with ↗. No service logos, no embeds. The `audio` widget (Spotify or SoundCloud) can sit under the
links: off by default, click-to-load. The `video` widget (YouTube or Vimeo) sits under Live, also
click-to-load. Both follow `widgets.json` external rules.

## Widgets

- **On:** `upcoming-events` (the gig list), `social-links`.
- **Suggested:** `audio`, `video`, `photo-strip`, `social-post` (all external ones click-to-load).

## Empty site

Website Manager: hero slot, name hint, one gig row of hints, artwork slot with "or SoraSpace sets
the title in your theme", release hints, five photo slots, video placeholder, band hints, booking
hints, list hints. Published: header, name and line over the theme's dark ground, booking and
mailing list. Gigs, release, photos and band are left out until added.

## Importer split

**Supported now (changed in `theme.json`):** condensed capitals, radius 4, width 1400; home `list`
(gigs) → `feature` (release) → `gallery` (masonry, 5) → `intro` → `contact` → `cta`; widgets as above.

**New features needed:** F1, F2, F3, F4, F12, F15, F16, F17, F23 (square typeset artwork), F25,
F26, F30 (gig list with ticket status), F31 (release block).

## Stock photos

| File | Slot | Crop · focal |
| --- | --- | --- |
| hero-stage | Hero | 16:9 · 50 % 35 % |
| guitarist, drummer, crowd, rehearsal, vinyl | Live mosaic | per photo |
| van | The band | 3:2 |
| crowd | Booking background | 16:9 |

**Offered as stock:** `crowd`, `vinyl` (atmosphere only). **Reference only:** `hero-stage`,
`guitarist`, `drummer`, `rehearsal`, `van`. Other musicians shown as the band, or as its gigs,
would mislead fans and bookers.
