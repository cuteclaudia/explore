# Maker & small shop (`maker-shop`): uplift design

Quiet and product-first, like a good market stall. A centred header under a shipping note, a split
hero with the best product photo, a shop grid with price and availability, how it's made in three
photographed steps, the latest journal post, markets and other shops, and a simple ordering
explainer. There is still no checkout: every product leads to an enquiry.

**References:** [content.html](content.html) · [empty.html](empty.html) · screens:
[desktop](screens/desktop-content.jpg), [phone](screens/phone-content.jpg),
[desktop empty](screens/desktop-empty.jpg), [phone empty](screens/phone-empty.jpg) ·
[photo credits](CREDITS.md). Feature IDs are defined in [../../UPLIFT.md](../../UPLIFT.md).

## Page structure (home)

| # | Section | Content from | Desktop | Phone | Images (crop · focal) |
| --- | --- | --- | --- | --- | --- |
| 1 | Utility bar (F5) | Site | Shipping or pick-up note on the accent | Wraps | — |
| 2 | Header (`centered`) | Name, line, pages | Shop, Journal · centred name 28 px with spaced line · About, Markets, Order | ☰ · name · Order | — |
| 3 | Hero (`split`) | Home | 5/7 split: what's new, headline 44–76 px weight 500, line, two buttons, two promises | Photo full width first (4:3) | 4:3 · 45 % 50 % |
| 4 | In the shop (`gallery`, F38) | Shop | Category chips; three columns: 4:5 photo with badge (made to order · lead time, sold out), name, price · unit, line, Enquire; optional commissions card | Two columns, no lines | 4:5 · 50 % 55 % |
| 5 | How it's made (F40) | About | Surface band; three photographed steps | Rows: photo 110 px | 4:3 |
| 6 | From the journal (`feature`) | Journal | Photo 7/12 + post | Stacked | 3:2 |
| 7 | Markets + also available at (`upcoming-events`, F39) | Journal (dated) · site | Market list beside outbound shop and stockist links ↗ | Stacked | — |
| 8 | Ordering (`contact`) | Order | Centred heading, line, three numbered steps, Send an enquiry | Same | — |
| 9 | Footer | Site | Name + line, links, credits | Wraps | — |

## Type, colour, shape

- **Headings:** geometric stack, 500. **Body:** system sans.
- **Colour (light):** off-white `#fafaf7`, white, ink `#1f1f1c`, muted `#5e5e57`, bottle green
  accent `#2f5d50`, sand `#d8cbb5` and sage `#9fb7a6` details.
- **Shape:** radius 4, square-ish buttons. **Width:** 1240 px.

## Products and orders (F38, F39)

Products are gallery items with name, price, unit (each, pair, set of four), one line and an
availability of available (no badge), made to order (with lead time), sold out, or none. "Enquire"
opens the Order page with the product named; a sold-out item asks about the next batch. Category
chips come from the gallery's albums. "Also available at" lists the owner's existing shops and
stockists as plain outbound links (label, one line, ↗, `rel="noopener"`). No shop embeds, no
tracking. The theme makes no payment promises beyond the owner's own text.

## Widgets

- **On:** `upcoming-events` (markets), `social-links`.
- **Suggested:** `photo-strip`, `social-post` (click-to-load), `map` (studio, click-to-load).

## Empty site

Website Manager: shipping hint, hero slot and hints, one product slot with name/price/description
hints, the commissions card, three process slots, journal slot, a market hint, an "other shop" hint
and the ordering steps. Published: utility bar if filled, header, headline, buttons and the
ordering section. Empty shop, process, journal and markets are left out.

## Importer split

**Supported now (changed in `theme.json`):** geometric headings 500, radius 4, width 1240,
`heroShade`/`heroText`; home `gallery` (6) → `list` (process) → `feature` → `list` (markets) →
`contact`; widgets as above.

**New features needed:** F2, F3, F5, F12, F16, F17, F38 (product cards with price and
availability), F39 (also available at links), F40 (steps with photos).

## Stock photos

| File | Slot | Crop · focal |
| --- | --- | --- |
| hero-mugs | Hero | 4:3 · 45 % 50 % |
| cups, bowls, vases, blue-mug, shelf | Products | 4:5 |
| wheel, glaze, kiln | How it's made | 4:3 |
| bisque | Journal | 3:2 |

**Offered as stock:** `wheel`, `glaze`, `kiln` (process scenes, no finished products).
**Reference only:** the hero and every product photo, `shelf` and `bisque`. Selling with another
maker's work would mislead buyers.
