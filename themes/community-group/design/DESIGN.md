# Community group (`community-group`): uplift design

Warm and welcoming, and always clear about the next time people can turn up. A rounded photo banner
with the headline in the bottom left, a "next get-together" card overlapping it, what the group
does beside three ways to take part, what's on, latest news, supporters, a call for volunteers and
an optional Acknowledgement of Country in the footer.

**References:** [content.html](content.html) · [empty.html](empty.html) · screens:
[desktop](screens/desktop-content.jpg), [phone](screens/phone-content.jpg),
[desktop empty](screens/desktop-empty.jpg), [phone empty](screens/phone-empty.jpg) ·
[photo credits](CREDITS.md). Feature IDs are defined in [../../UPLIFT.md](../../UPLIFT.md).

## Page structure (home)

| # | Section | Content from | Desktop | Phone | Images (crop · focal) |
| --- | --- | --- | --- | --- | --- |
| 1 | Header (`split`) | Name, motto, pages | Round mark + name + motto; About, Events, News, Photos; Get involved | Name + "☰ Menu" | — |
| 2 | Banner hero (`banner`, F1) | Home | 1400 px rounded frame, min 560 px; shade from bottom left; eyebrow, headline 46–84 px, line, two buttons | Full width, square corners | 21:9 · 50 % 60 % |
| 3 | Next get-together (F34) | Events (next dated) | Card 360 px overlapping the banner's lower right: name, when, where, bring; I'll come + Add to calendar | Card under the banner | — |
| 4 | What we do + ways to take part (`intro`, F35) | About | Large 22–30 px paragraph beside three numbered action rows with links | Stacked | — |
| 5 | What's on (`upcoming-events`) | Events | Photo 5/12 beside a list with calendar tiles and tags | List, then photo | 4:5 |
| 6 | Latest news (`cards`, 3) | News | Photo, kind, title, line | Rows: photo 120 px | 3:2 |
| 7 | Thanks to (F36) | About | Supporters as plain text on a surface band | Wraps | — |
| 8 | Lend a hand (`cta`) | Get involved | Rounded accent block, photo half, heading, line, button | Stacked | 4:3 |
| 9 | Footer + acknowledgement (F37) | Site | Name and registration, contact, follow; acknowledgement line; credits | Stacked | — |

## Type, colour, shape

- **Headings:** humanist stack, 700. **Body:** system sans.
- **Colour (light):** cream `#fffaf3`, white cards, brown ink `#2b2118`, muted `#66574a`, rust
  accent `#a83f18`, apricot `#f4a261` and teal `#2a9d8f` details, banner shade `#2b1a10`.
- **Shape:** radius 12 (24 on the banner and CTA), pill buttons. **Width:** 1300 px (banner 1400).

## Taking part (F34, F35)

"I'll come" opens the Contact page with the event named (no account needed). "Add to calendar"
downloads an `.ics` file that SoraSpace generates from the event; it uses no outside calendar
service. Ways to take part are up to three rows (title, one line, link to a page). Supporters
are text only by default, so no third-party logos are needed. The acknowledgement is optional and
written by the group in its own words; the theme supplies no default text.

## Widgets

- **On:** `upcoming-events` (What's on and the next get-together), `social-links`.
- **Suggested:** `latest-posts`, `photo-strip`, `map` (click-to-load, "Where we meet"),
  `social-post` (click-to-load).

## Empty site

Website Manager: banner slot, headline hints, the next-event card with field hints, the paragraph
hint, three action rows, one event row, three news slots, supporters hint, CTA and acknowledgement
hint. Published: header, banner text over the theme colour, the action rows the group has filled
and the CTA. The card disappears when no future event exists.

## Importer split

**Supported now (changed in `theme.json`):** humanist headings, radius 12, pill buttons, width
1300, `heroShade`/`heroText`; home `facts` (next get-together) → `intro` → `list` (ways) → `list`
(events) → `cards` (news, 3) → `cta`; widgets as above.

**New features needed:** F1 (banner frame), F2, F3, F12, F16, F17, F34 (next get-together card
with `.ics`), F35 (action rows), F36 (supporters line), F37 (footer acknowledgement).

## Stock photos

| File | Slot | Crop · focal |
| --- | --- | --- |
| hero-garden | Banner | 21:9 · 50 % 60 % |
| hall | What's on | 4:5 |
| raised-beds, seedlings, harvest | News | 3:2 |
| produce | Lend a hand | 4:3 |

**Offered as stock:** `seedlings`, `harvest`, `produce` (scene-setting for a garden group).
**Reference only:** `hero-garden` (other volunteers shown as the group), `raised-beds` (another
garden), `hall`.
