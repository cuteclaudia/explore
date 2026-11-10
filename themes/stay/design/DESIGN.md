# Stay (`stay`): uplift design

Big landscape, slow pace, and every practical detail a guest needs. The hero is the property in its
landscape with the headline set in the open sky, and a booking card at the foot (sleeps, bedrooms,
price, minimum stay, check availability). Then a welcome, a photo mosaic of the rooms, "Good to
know", the farm and nearby, a guest comment and a photo-backed call to action.

**References:** [content.html](content.html) · [empty.html](empty.html) · screens:
[desktop](screens/desktop-content.jpg), [phone](screens/phone-content.jpg),
[desktop empty](screens/desktop-empty.jpg), [phone empty](screens/phone-empty.jpg) ·
[photo credits](CREDITS.md). Feature IDs are defined in [../../UPLIFT.md](../../UPLIFT.md).

## Page structure (home)

| # | Section | Content from | Desktop | Phone | Images (crop · focal) |
| --- | --- | --- | --- | --- | --- |
| 1 | Overlay header (F4) | Name, pages | Old-style name 24 px; The cottage, Rooms, Nearby, Book | Name + "☰ Book" | — |
| 2 | Hero (F1) + booking card (F20) | Hero photo, headline, stay facts | 760 px; text block on the right (600 px) where the sky and field are empty; gradient from the right plus a light top shade. Booking card: 4 facts + "Check availability", overlapping the hero foot | Text top; top-to-bottom shade; card 2 × 2 + full-width button | 16:9 · 50 % 70 % (owner puts the subject where text isn't) |
| 3 | Welcome (`intro`) | The property | Heading 54 px + story + link; outdoor photo 6/11 | Stacked | 4:3 |
| 4 | Rooms & spaces (`gallery`, F25) | Rooms | Large (2fr, two rows) + four, 260 px rows; caption chips | Large + two | per photo |
| 5 | Good to know (`facts`) | The property | 3 × 2 grid with rules: check-in, check-out, pets, Wi-Fi, getting here, accessibility | 2 columns | — |
| 6 | On the farm & nearby (`cards`, 3) | The property | 4:3 photo, distance in accent capitals, title, one line | 1 column | 4:3 |
| 7 | Guest book (`testimonials`, suggested) | Widget | Italic old-style quote on surface band (genuine, with permission) | Same | — |
| 8 | Plan your stay (`cta`, F26) | Book page | Dimmed photo behind centred heading, line, button | Same | 16:9 |
| 9 | Footer | Site | Name + line; links; credits | Wraps | — |

## Type, colour, shape

- **Headings:** old-style stack, 400. **Body:** system sans.
- **Colour (light):** linen `#f8f5ef`, white cards, ink `#2a2a24`, muted `#615d52`, olive accent
  `#5f5228`, sage and wheat details, hero shade `#1f241c`.
- **Shape:** radius 8; pill buttons. **Width:** 1300 px.

## Bookings

There is no booking engine. "Check availability" goes to the Book page (a request). The booking
card's price is optional text ("From $280 a night"). It must stay accurate, so Website Manager
shows when it was last edited.

## Widgets

- **On:** `key-numbers` (the booking card facts).
- **Suggested:** `map` (outside, click-to-load, "Getting here"), `testimonials` (guest book, genuine
  only), `photo-strip`, `video` (walk-through, click-to-load).

## Empty site

Website Manager: hero placeholder ("your property in its landscape, wide, with sky above"),
headline hints, booking-card hints, welcome hints, five room slots, six "Good to know" hints, three
nearby placeholders, guest comment hint, CTA. Published: header, hero text, the facts entered,
welcome text, booking request.

## Importer split

**Supported now (changed in `theme.json`):** old-style headings, radius 8, pill buttons, width
1300; home `facts` (booking card) → `intro` → `gallery` (wide, 5) → `facts` (good to know) → `cards`
(nearby, 3) → `cta`; widgets as above.

**New features needed:** F1 (text position: right), F2, F3, F4, F12, F16, F17, F20 (booking card
with button), F25 (photo mosaic), F26 (photo-backed CTA). `cards` needs to read items from the
property page (not only from a listing page).

## Stock photos

| File | Slot | Crop · focal |
| --- | --- | --- |
| hero-cottage | Hero | 16:9 · 50 % 70 % |
| verandah | Welcome | 4:3 |
| bedroom, bath, linen, living-room, wood-stove | Rooms mosaic | per photo |
| sheep, eggs, creek | Nearby | 4:3 |
| living-room | CTA background | 16:9 |

**Offered as stock:** `eggs`, `creek`, `sheep` (scene-setting for a farm stay). **Reference only:**
the cottage, verandah and every room. Showing another property's rooms as yours would mislead
guests.
