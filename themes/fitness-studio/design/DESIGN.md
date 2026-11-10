# Fitness & studio (`fitness-studio`): uplift design

Light, energetic and practical. A split hero with a rounded class photo and a "first class free"
sticker, four facts, three class types, the week's timetable in seven columns, teachers in round
portraits, plain prices and a photo-backed first-class offer.

**References:** [content.html](content.html) · [empty.html](empty.html) · screens:
[desktop](screens/desktop-content.jpg), [phone](screens/phone-content.jpg),
[desktop empty](screens/desktop-empty.jpg), [phone empty](screens/phone-empty.jpg) ·
[photo credits](CREDITS.md). Feature IDs are defined in [../../UPLIFT.md](../../UPLIFT.md).

## Page structure (home)

| # | Section | Content from | Desktop | Phone | Images (crop · focal) |
| --- | --- | --- | --- | --- | --- |
| 1 | Header (`split`) | Name, pages | Logo dot + name; Classes, Timetable, Teachers, Prices, The studio; Book a class | Name + Book a class | — |
| 2 | Hero (`split`, F29) | Home | 5/6 split: class chips, headline 50–92 px, line, two buttons; photo 5:4 radius 29 with tilted offer sticker (`art2`) | Photo first (4:3), sticker bottom right | 5:4 · 55 % 50 % |
| 3 | Key facts (`facts`) | Home | Four figures in accent on a surface band | 2 × 2 | — |
| 4 | Classes (`cards`, 3) | About | Photo, class type, line, level and length chips | Rows: photo 120 px | 4:3 |
| 5 | This week (F32) | Timetable | Seven day columns of class slots (time · class, length), colour by category, "full" dimmed, today underlined; key and booking note | Day tabs; one day at a time | — |
| 6 | Teachers (`people`, F24) | About | Round 112 px portrait, name, what they teach in accent, one line | Stacked | 1:1 · faces 20–25 % |
| 7 | Prices (F33) | About | Three cards: option, amount + unit, line; one highlighted | Stacked | — |
| 8 | First class (`cta`, F26) | Contact | Rounded band over a dimmed studio photo, gradient from the text side | Full width | 16:9 |
| 9 | Footer | Site | Name + address, links, credits | Wraps | — |
| — | Phone action bar (F11) | — | — | Timetable · Book a class | — |

## Type, colour, shape

- **Headings:** rounded stack, 700. **Body:** system sans.
- **Colour (light):** mint white `#f5fbf8`, white cards, deep green ink `#0f2a22`, muted
  `#4a6359`, teal accent `#0f766e`, mint `#34d399` and sun `#fbbf24` details, strength coral
  `#e76f51` in the timetable key only, shade `#0c2621`.
- **Shape:** radius 18, pill buttons. **Width:** 1240 px.

## Timetable and booking (F32)

The timetable is built from a list of classes (day, time, class, length, category, optional
"full"), kept on the Timetable page, replacing the weekly blog post. There is no booking engine:
"Book a class" opens the owner's booking page as a plain outbound link if one is set, otherwise
the Contact page. No booking widget or provider is added. Health claims stay out of sample copy.

## Widgets

- **On:** `key-numbers` (the facts band).
- **Suggested:** `testimonials`, `map` (click-to-load), `video` (click-to-load), `social-links`.

## Empty site

Website Manager: chips, headline and line hints, hero slot, sticker hint, four figure hints, three
class slots, a timetable with one hint slot, three portrait slots, three price hints, CTA. Published:
header, headline, buttons and the first-class offer. Empty classes, timetable, teachers and prices
are left out.

## Importer split

**Supported now (changed in `theme.json`):** rounded headings, radius 18, pill buttons, width
1240, `heroShade`/`heroText`; home `facts` → `cards` (3) → `list` (timetable) → `people` → `list`
(prices) → `cta`; widgets as above.

**New features needed:** F2, F3, F11, F12, F16, F17, F24, F26, F29 (offer sticker), F32 (weekly
timetable), F33 (price cards), outbound booking link setting.

## Stock photos

| File | Slot | Crop · focal |
| --- | --- | --- |
| hero-class | Hero | 5:4 · 55 % 50 % |
| studio, reformer, kettlebells | Classes | 4:3 |
| instructor-1, instructor-2, instructor-3 | Teachers | 1:1 |
| studio | First-class background | 16:9 |

**Offered as stock:** `kettlebells` (equipment-led, no recognisable studio). **Reference only:**
`hero-class`, `reformer`, `studio` (would read as the owner's own space and members) and every
teacher portrait.
