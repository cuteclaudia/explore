# Restaurant & café (`restaurant-cafe`): uplift design

Warm, hungry and practical. A slab-serif headline over a photo of the room, with the three things
people look for first (when you're open, where you are, how to call) on a card at the foot of
the hero. Then a real menu with prices, a dark feature for the special night, the bakery, the
story, hours and bookings. On phones, Call and Book stay on screen.

**References:** [content.html](content.html) · [empty.html](empty.html) · screens:
[desktop](screens/desktop-content.jpg), [phone](screens/phone-content.jpg),
[desktop empty](screens/desktop-empty.jpg), [phone empty](screens/phone-empty.jpg) ·
[photo credits](CREDITS.md). Feature IDs are defined in [../../UPLIFT.md](../../UPLIFT.md).

## Page structure (home)

| # | Section | Content from | Desktop | Phone | Images (crop · focal) |
| --- | --- | --- | --- | --- | --- |
| 0 | Info bar (F5) | Hours, notice | Accent bar: green dot + "Open today · hours" left; one notice right | Hours only | — |
| 1 | Header (`bar`) | Name, tagline, pages | Slab name 26 px + tagline in capitals; Menu, Gallery, About, Bookings; "Book a table" button | Name + book button; menu (F16) | — |
| 2 | Hero (F1) + facts card (F20) | Hero photo, headline | 640 px; gradient from the left; eyebrow in gold, headline 92 px slab 700, lede 20 px, two buttons. Facts card (Open, Find us, Call) overlaps the hero foot by half | Bottom gradient; headline 46 px; facts card stacks under the buttons | 16:9 · 60 % 50 % |
| 3 | From the kitchen (`list`, F19) | Menu (Articles) | 7/12: heading, section tabs, rows with dotted leaders and prices in accent, dietary note. 5/12: food photo | Photo first, then the list; tabs scroll sideways | 4:5 · 50 % 50 % |
| 4 | Feature (`feature`, F8) | One menu page marked as feature | Dark band: photo 6/11 + eyebrow, heading 56 px, text, three points, button | Stacked | 4:3 · 45 % 55 % |
| 5 | From the bakery (`gallery`, even, 3) | Gallery | 3 square photos, caption in slab + one line | 2 photos | 1:1 |
| 6 | Our story (`intro`, F8) | About | Portrait 4/11 + heading 48 px, story, italic pull line | Stacked | 4:5 · 50 % 35 % |
| 7 | Find us (F21) | Hours, map widget | Hours table (today in accent) + click-to-load map box; photo of the front | Stacked | 4:5 |
| 8 | Book a table (`contact`) | Bookings page | Centred band on the surface colour | Same | — |
| 9 | Footer | Site | Address + credits (F17), contact, follow | 1 column | — |
| — | Phone action bar (F11) | Phone, bookings | — | Call · Book a table | — |

## Type, colour, shape

- **Headings:** slab stack (Rockwell, Roboto Slab), 700. **Body:** system sans. Pull lines in
  serif italic.
- **Colour (light):** cream `#fbf7f1`, white cards, espresso ink `#2b1d14`, muted `#6b5647`,
  brick accent `#9c2f1d`, gold `#f0c75e` used only on the dark hero and feature, hero shade `#24170f`.
- **Shape:** radius 6; pill tabs. **Width:** 1180 px.

## Widgets

- **On:** `photo-strip` (bakery), `social-links`.
- **Suggested:** `map` (outside, click-to-load, in Find us), `upcoming-events` (special nights),
  `testimonials` (genuine and attributed only).

## Empty site

Website Manager: hours and notice hints in the bar, hero photo placeholder, headline hints, facts
card hints (hours, address, phone), one menu row hint with "Dish name · price", photo slots for the
feature, bakery and story, hours table hint, booking hint. Published: header, the facts that
exist, hero text, About and Bookings. The menu appears with the first menu page.

## Importer split

**Supported now (changed in `theme.json`):** gold `art2` and deeper `heroShade`; home `facts` →
`list` (menu) → `feature` → `gallery` (even, 3) → `intro` → `facts` (hours) → `contact`;
widgets as above.

**New features needed:** F1, F2, F3, F5, F8, F11, F12, F16, F17, F19 (menu with prices and section
tabs), F20 (facts card over the hero), F21 (hours table, today highlighted).

## Stock photos

| File | Slot | Crop · focal |
| --- | --- | --- |
| hero-cafe | Hero | 16:9 · 60 % 50 % |
| breakfast | Menu photo | 4:5 |
| pizza-oven | Feature | 4:3 · 45 % 55 % |
| sourdough, pastry-counter, latte | Bakery | 1:1 |
| chef | Our story | 4:5 · 50 % 35 % |
| street-tables | Find us | 4:5 |

**Offered as stock:** `latte`, `sourdough` (generic coffee and bread). **Reference only:** the room,
dishes, counter, chef and street tables. A café's site should show its own food, staff and front,
and food photos of dishes it doesn't serve would mislead.
