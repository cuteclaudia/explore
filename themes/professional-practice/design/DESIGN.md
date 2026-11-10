# Professional practice (`professional-practice`): uplift design

Restrained, confident and easy to read: a large old-style headline with nothing competing, one
wide calm photograph, a numbered list of practice areas, the way the firm works, insights, people
and a navy contact band. It suits law firms, accountants and advisers who need to look established
without looking corporate.

**References:** [content.html](content.html) · [empty.html](empty.html) · screens:
[desktop](screens/desktop-content.jpg), [phone](screens/phone-content.jpg),
[desktop empty](screens/desktop-empty.jpg), [phone empty](screens/phone-empty.jpg) ·
[photo credits](CREDITS.md). Feature IDs are defined in [../../UPLIFT.md](../../UPLIFT.md).

## Page structure (home)

| # | Section | Content from | Desktop | Phone | Images (crop · focal) |
| --- | --- | --- | --- | --- | --- |
| 1 | Header (`split`) | Name, tagline | Old-style name 26 px with tagline in tracked capitals; nav; outline "Arrange a meeting" | Name + button | — |
| 2 | Hero (`text`) | Headline, lede | Headline 80 px weight 500 (7/11) beside lede and two buttons (4/11), aligned to the bottom | Stacked; headline 42 px | — |
| 3 | Image band (F7) | Hero photo | Full width 21:8, no text over it | 4:3 | 21:8 · 50 % 55 % |
| 4 | How we can help (`list`, F22) | About: services | Numbered 01–06 in 3 columns with rules; title 26 px + one line | 1 column | — |
| 5 | How we work (`intro`, F8) | About | Photo 6/11 + heading and three numbered principles | Stacked | 4:3 · 45 % 50 % |
| 6 | Recent insights (`cards`) | Insights | Lead article with 16:9 image, topic · reading time, 32 px title; three text-only items beside | Stacked | 16:9 |
| 7 | Our people (`people`) | About: people | 4 portraits 4:5, name in old-style, role · area | 2 × 2 | 4:5 · 50 % 25 % |
| 8 | Contact (`contact`) | Contact | Navy band: building photo 4/11 + heading, line, office/hours/phone/email, light button | Stacked | 3:4 · 50 % 40 % |
| 9 | Footer | Site | © name; disclaimer line the profession requires; credits | Wraps | — |

## Type, colour, shape

- **Headings:** old-style stack (Iowan, Palatino), 500. **Body:** system sans.
- **Colour (light):** white, warm grey surface `#f6f5f1`, ink `#1c2433`, muted `#555f6d`, navy
  accent `#1f3a5f`, navy band `#1b2a40`. Dark keeps the navy band darker.
- **Shape:** radius 2, square-ish buttons. **Width:** 1180 px. Generous space: 96 px above the
  headline.

## Widgets

- **On:** `contact-card`.
- **Suggested:** `latest-posts`, `map` (outside, click-to-load), `key-numbers`.
- Testimonials are deliberately not suggested: several professions restrict them in advertising.

## Empty site

Website Manager: headline and lede hints, wide photo placeholder, three numbered service rows,
principles, an insight placeholder, four portrait slots, contact hints including a "Disclaimer your
profession requires" hint. Published: header, hero text, services written so far, contact.

## Importer split

**Supported now (changed in `theme.json`):** surface and navy hero pair; home `gallery` (wide, 1:
image band) → `list` (services) → `intro` → `cards` (insights, 2 columns, images) → `people` →
`contact`; widgets as above.

**New features needed:** F2, F3, F7 (image band without text), F8, F12, F16, F17, F22 (numbered
services list). A footer disclaimer field is needed: plain text, set by the firm.

## Stock photos

| File | Slot | Crop · focal |
| --- | --- | --- |
| hero-meeting-room | Image band | 21:8 · 50 % 55 % |
| consultation | How we work | 4:3 |
| signing | Lead insight | 16:9 |
| law-library | (alternative insight image) | 16:9 |
| building | Contact band | 3:4 |
| person-1 … person-4 | Our people | 4:5 |

**Offered as stock:** `hero-meeting-room`, `signing`, `law-library`, `building` (illustrative).
**Reference only:** `consultation` and the four portraits, which would present strangers as the firm's
staff or clients.
