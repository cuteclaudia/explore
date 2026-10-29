# Spreadsheet imports and cost estimates · 30 October 2026 (Sydney)

## Importing products

Open **Settings → HobbyNest store → Import**. Download the blank `.xlsx` template, which contains Products and Instructions sheets, or choose your own `.xlsx`/comma-separated CSV (up to 5 MiB). Older `.xls` files must be saved as `.xlsx` first. Select a worksheet and map its headers to product fields. Canonical headers are recognised automatically; arbitrary/reordered columns can be mapped manually. Each source column maps to one destination.

Required on every data row: **SKU, Product name, Product type, Price AUD**. Type is physical or digital; price is an AUD decimal such as `24.95`, without thousands separators. Format SKU cells as text if leading zeros matter. Paste formulas as values; formula-containing workbooks, macros and external workbook links are rejected, not evaluated. Workbook expansion, XML row/cell counts and mapped request sizes are bounded. Spreadsheet parsing is local to the browser; only mapped rows are sent to the owner-protected API.

| Optional field | Structure / default |
| --- | --- |
| Description | Plain text; blank updates retain the existing description |
| Collections | Existing names separated by `|`; create missing collections first |
| Colour | One physical colour per row; blank = Standard |
| Opening stock | Whole finished units; applied only to new products with the explicit option enabled |
| Filament available / Print to order | yes/no, true/false or 1/0; defaults no for new products |
| Ready dispatch min/max days | Whole business days; new defaults 1 / 2 |
| Print dispatch min/max days | Whole business days; new defaults 3 / 5 |
| Packed weight g | Whole grams including packaging |
| Packed length/width/height mm | Whole millimetres; complete all four measurements or leave all blank |
| Digital licence | Required for digital products |

Repeat a SKU only for different colours of the **same new physical product**, with consistent name/type/price and product-level details. Duplicate SKU/colour rows and contradictory details are errors, not summed silently. Digital products must not contain physical colour/stock/filament values. There can be up to 300 mapped rows per import, within the existing 150-product and 30-colour limits. Images and private costing inputs are not imported; add them on the product page.

**Preview import** validates the mapped data on the server and lists new drafts, draft updates, skipped SKUs, opening stock, errors and warnings. Preview changes no records. Errors block the whole import. Changing mapping/options invalidates the preview. **Import reviewed drafts** repeats validation and atomically commits the batch against the same catalogue ETag. An account change or intervening edit requires another preview. A recorded import receipt prevents an immediate retry after a lost reply from duplicating opening stock; after any uncertain request, reload and inspect before retrying.

Existing SKUs are skipped by default. With **Update matching SKU drafts**, required product details/prices update the draft, blank optional values retain existing values, and collections can be set to existing names. Existing colours, finished stock, photo references, costing records and published snapshots are preserved. A type change still requires unpublishing and zero physical stock; colours reset appropriately when changing product type. Adding/receiving stock for an existing product remains an explicit stock operation, never an import side effect.

New products stay unpublished. Optional opening stock is recorded as received inventory with the import reference in the recent movement history; it does not become publicly available until publication. Existing shop switches, offers, shipping configuration and app/subscription data are unaffected. Retain a private catalogue export before a large import; automatic undo/complete backup restore is not implemented.

## Costs & pricing

Open a product's **Costs & pricing** tab. Saved estimates remain private on the owner product record and in private catalogue exports; they are not included in the public product snapshot. This is a unit-cost planning tool, **not realised accounting COGS, an invoice system or a tax service**. No source price or Square fee is invented: enter your actual costs/fee assumptions.

- Successful-print filament grams including supports/normal purge, multiplied by AUD price per kilogram. This is separate from packed shipping weight.
- Print minutes × average measured printer watts × AUD/kWh. Use average draw, not automatically the power supply's maximum rating.
- Print hours × printer wear/overhead rate, excluding costs entered separately to avoid double counting.
- Failed-print percentage on filament, power and machine costs: `print cost / (1 − failure rate)`. Labour, packaging and other costs are then added once.
- Hands-on labour minutes × hourly labour cost, packaging and other unit costs.
- Optional percentage payment fee plus a fixed per-payment fee allocated across the entered number of items. These are estimates; mixed-order actual fee allocation can differ.
- Target margin after entered payment fees, measured against sales revenue excluding the optional GST allowance. Margin is not markup: $10 cost at 40% margin requires about $16.67 before fees/GST, not $14.

The recommendation solves for a net selling price that covers unit cost, allocated fixed fee, percentage fee and target margin. If GST is enabled, percentage payment fees are allowed on the GST-inclusive amount. A conservative cent allowance covers fee rounding; costs/recommendations round upward. Impossible margin/fee combinations, invalid numbers and prices outside supported bounds are refused.

Use a consistent GST basis for input costs. The GST checkbox is optional and does not establish business registration, change store-wide tax policy or connect a tax service. Estimates exclude store discounts, postage revenue/cost unless included in Other, income tax, unentered returns/support costs and actual settlement adjustments. The current model is one per product, shared by its colour variants; different filament prices can be handled conservatively or through separate products until variant-specific pricing exists.

**Save costing** stores assumptions without changing price. **Save costing & use suggested price** explicitly changes only the draft selling price. Review and publish separately to change the public listing. Actual stock, published prices, offers, shipping and payments remain untouched until their own authorized actions.

## Validation

Server tests cover import ownership, account/ETag fences, changed-preview rejection, all-or-nothing invalid batches, new opening stock, retries, preservation of existing inventory/published content/private costs, costing arithmetic, fees/GST and invalid inputs. Local browser checks exercise real `.xlsx` parsing/template download/manual mapping, CSV, preview/apply, formula refusal, costing application and 320–1366px layouts. Packaged SSR checks cover authentication and the actual import endpoints. No production products are seeded by tests.
