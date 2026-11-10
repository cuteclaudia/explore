# Trades & local services (`trades-services`): uplift design

Practical, trustworthy and quick to act on. Navy and safety orange, condensed capitals, real
photos of work. Everything a customer needs (what you do, where, licence, phone) is visible
without scrolling, and on phones the call and quote buttons never leave the screen. The sample
business is now a multi-trade renovator (carpentry, kitchens, decks, electrical), which shows
the theme suits a team as well as one trade.

**References:** [content.html](content.html) · [empty.html](empty.html) · screens:
[desktop](screens/desktop-content.jpg), [phone](screens/phone-content.jpg),
[desktop empty](screens/desktop-empty.jpg), [phone empty](screens/phone-empty.jpg) ·
[photo credits](CREDITS.md). Feature IDs are defined in [../../UPLIFT.md](../../UPLIFT.md).

## Page structure (home)

| # | Section | Content from | Desktop | Phone | Images (crop · focal) |
| --- | --- | --- | --- | --- | --- |
| 0 | Utility bar (F5) | Site settings | Navy: licence left; phone (amber) and hours right | Phone and hours only, centred | — |
| 1 | Header (`split`, sticky) | Name, pages | Logo square in accent with initials + name in condensed capitals 22 px; nav; "Get a quote" button; sticks to the top while scrolling | Logo + name + quote button; nav moves into the menu (F16) | — |
| 2 | Hero (`banner`, F1) | Headline, tagline, reasons, hero photo | Navy panel; text 6/11: eyebrow in amber, headline 70 px condensed capitals, lede 19 px, two buttons (quote, call), three ticks. Photo 5/11 with a floating card ("Quotes within one business day", `contact-card` widget) overlapping its lower-left corner | Stacked; photo under the text | 4:5 · 58 % 45 % |
| 3 | What we do (`cards`, 4) | Services | 4 cards: 3:2 photo, title 24 px capitals, one sentence, "Learn more →" in accent | Rows: 38 % square photo + title + link | 3:2 (phone 1:1) |
| 4 | Key numbers (`key-numbers`) | Widget | Orange band, 4 figures 46 px condensed with labels | 2 × 2 | — |
| 5 | Recent jobs (`gallery`, wide) | Our work | One large (2/3, two rows) + two small, 250 px rows; caption chips bottom-left | Stacked 3:2 | 4:3 / 3:2 · per photo |
| 6 | How it works (F10) | Services page settings | 3 white cards with navy numbered circles | Stacked | — |
| 7 | About us (`intro`) | About | Photo 5/11 + heading 40 px, intro, testimonial (genuine and attributed only), 3 fact tiles (area, insurance, licence) | Stacked | 4:3 · 50 % 30 % |
| 8 | Quote band (`cta`) | Site | Navy: "Need a quote?" 52 px + line + button | Stacked | — |
| 9 | Footer | Site | Name + line + credits (F17); contact; hours | 1 column | — |
| — | Phone action bar (F11) | Phone, contact page | — | Fixed bottom: Call · Get a quote | — |

## Type, colour, shape

- **Headings:** condensed stack (Bahnschrift, Arial Narrow, Roboto Condensed), 700, capitals,
  +0.01 em. **Body:** system sans 16/1.6.
- **Colour (light):** page `#f4f6f8`, cards white, ink and hero navy `#0f1b2a`, muted `#4b5a6b`,
  accent orange `#b93d0a` (white text on it passes AA), amber detail `#f2a33a` used only on navy.
  Dark mode keeps the same structure, with a deeper navy hero.
- **Shape:** 4 px radius on cards, photos and buttons.
- **Width:** 1180 px.

## Responsive

- Header stays sticky on all sizes; the utility bar scrolls away.
- Services become compact rows on phones so all four fit on one screen.
- The phone action bar is fixed to the bottom on phones only. The reference shows it as the last
  block, with a label, because a full-page capture can't show a fixed bar.

## Widgets

- **On:** `key-numbers` (after services), `contact-card` (in the hero, as the floating card).
- **Suggested:** `testimonials` (genuine, attributed quotes only; the reference's quote is
  labelled as a sample), `map` (service area, outside, click-to-load), `photo-strip`, `social-links`.

## Empty site

Website Manager shows: licence/phone/hours hints in the bar, headline and lede hints, the hero photo
placeholder (4:5), four service placeholders, key-number labels with dashes, three job slots,
steps, about and quote hints. Published: header, hero text the owner wrote, contact details;
sections without content are left out. The phone action bar shows as soon as a phone number exists.

## Importer split

**Supported now (changed in `theme.json`):** `heroShade` / `heroText` navy pair (light and dark);
`header: split`, `hero: banner`; home `cards` (4, images) → `facts` → `gallery` (`wide`, 3) →
`intro` → `cta`; widgets as above; sample business renamed in the preview.

**New features needed:** F1 (banner with photo and overlapping card), F2, F3, F5, F10, F11, F12,
F16, F17. Also a sticky-header option, and fact tiles in About (licence, insurance, area). Facts
exist as a section; they need an "inside About" placement.

## Stock photos

| File | Slot | Crop · focal |
| --- | --- | --- |
| hero-workshop | Hero | 4:5 · 58 % 45 % |
| carpentry, kitchen-timber, deck-pergola, electrical | Services | 3:2 (phone 1:1) |
| kitchen-island | Recent jobs, large | 4:3 · 50 % 55 % |
| deck-firepit, workbench | Recent jobs, small | 3:2 |
| team-hivis | About | 4:3 · 50 % 30 % |

**Offered as stock:** the four service photos and `workbench` (illustrations of a kind of work).
**Reference only:** `hero-workshop`, `team-hivis` (would imply these people work for the tenant)
and the Recent jobs photos `kitchen-island` and `deck-firepit` (would claim jobs the tenant didn't
do, which matters under consumer law). The hero slot in Website Manager asks for the owner's own
photo first.
