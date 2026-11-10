# Wellness clinic (`wellness-clinic`): uplift design

Calm, clear and reassuring. Soft blue-grey with sage, rounded shapes, a humanist face and plain
language. The hero says who the clinic helps and how to book, then shows the services with session
lengths, what happens at a first visit, the practitioners, how to get there and how to book. The
booking form tells visitors not to send health details.

**References:** [content.html](content.html) · [empty.html](empty.html) · screens:
[desktop](screens/desktop-content.jpg), [phone](screens/phone-content.jpg),
[desktop empty](screens/desktop-empty.jpg), [phone empty](screens/phone-empty.jpg) ·
[photo credits](CREDITS.md). Feature IDs are defined in [../../UPLIFT.md](../../UPLIFT.md).

## Page structure (home)

| # | Section | Content from | Desktop | Phone | Images (crop · focal) |
| --- | --- | --- | --- | --- | --- |
| 0 | Info bar (F5) | Hours, phone, address | Muted 13 px on white | Hours only | — |
| 1 | Header (`split`) | Name, pages | Round gradient mark + name; nav; pill "Book an appointment" | Name + pill | — |
| 2 | Hero (`split`, F1) | Headline, lede, photo | Text 6/11: eyebrow, 74 px headline, lede, two pill buttons, three practical points (sage dots). Photo 5/11, radius 14, with a white note card overlapping its corner (`contact-card`) | Stacked | 4:5 · 45 % 40 % |
| 3 | Services (`cards`, 3) | Services | White band; centred heading and line; three cards: 3:2 photo, 24 px title, two lines, session chips | 1 column | 3:2 |
| 4 | Your first visit (F10) | About | Three rounded step cards, numbers in pale circles | 1 column | — |
| 5 | Practitioners (F24) | About: team | White band; three round portraits (180 px), name, role in accent, one line | 1 column, 140 px | 1:1 · 50 % 25 % |
| 6 | Visiting us (`facts`) | Contact | Photo 6/11 + hours, address, parking, access | Stacked | 4:3 |
| 7 | Make a booking (`contact`) | Contact | Rounded card: heading, line, button, **health-details notice** in sage | Same | — |
| 8 | Footer | Site | Name + emergency line + credits; contact; hours | 1 column | — |

## Type, colour, shape

- **Headings:** humanist sans (Seravek, Gill Sans Nova, Ubuntu), 600. **Body:** system sans.
- **Colour (light):** `#f4f8fb` page, white bands and cards, ink `#16303f`, muted `#4f6573`, teal
  accent `#1d6a88`, pale blue `#8ec5d6` and sage `#b9dbb0` details, hero shade `#16303f`.
- **Shape:** radius 14; pill buttons; round portraits. **Width:** 1180 px.

## Health advertising

The sample copy makes no treatment claims. **Testimonials are not offered for this theme**:
Australian rules for regulated health services restrict testimonials in advertising, and other
countries have similar rules. Keep the booking notice wording. Suggest an emergency line in the
footer ("In an emergency, call 000").

## Widgets

- **On:** `contact-card` (hero note).
- **Suggested:** `map` (outside, click-to-load), `key-numbers`, `social-links`.

## Empty site

Website Manager: info-bar hints, headline and lede hints, hero photo placeholder and note card hint,
three service placeholders with chip hint, steps, three round portrait slots, visiting facts hints,
the booking card (notice always shown). Published: header, hero text, contact, booking card.

## Importer split

**Supported now (changed in `theme.json`):** sage `art2`, hero shade pair; home `cards` (3,
images) → `list` (first visit) → `people` → `facts` → `contact`; widgets as above.

**New features needed:** F1 (split photo with note card), F2, F3, F5, F10, F12, F16, F17, F24 (round
portraits), plus session chips on service cards (short tags).

## Stock photos

| File | Slot | Crop · focal |
| --- | --- | --- |
| hero-physio | Hero | 4:5 · 45 % 40 % |
| physio, pilates, massage | Services | 3:2 |
| reception | Visiting us | 4:3 |
| practitioner-1 … 3 | Practitioners | 1:1 · 50 % 25 % |

**Offered as stock:** `pilates`, `massage`, `physio` (illustrating a kind of service). **Reference
only:** `hero-physio`, `reception` and the practitioner portraits (they would show strangers as the
clinic's staff or premises).
