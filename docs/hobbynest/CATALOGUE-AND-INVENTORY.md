# HobbyNest catalogue and inventory · 29 October 2026

## Compact administration, photos and shop switches

The owner product overview is now a searchable table: thumbnail, name/SKU/type, AUD price, stock by colour, dispatch ranges and publication status. Select a row/product name to open `/studio/hobbynest/products/<id>`; Add product opens its own page. Phone layouts use compact stacked summaries. Product details, Images and Stock & colours are separate tabs. Existing products keep their IDs and stock.

In **Store controls**, tick **Physical shop open** and/or **Digital shop open**, then Save store controls. Either, both or neither can be enabled; each section has its own pause message. Both start paused, including existing stores with no configuration. Pausing leaves published listings visible with that message. These are test-availability switches; they cannot bypass the hard `checkoutEnabled: false` gate.

Choose **Open test shop** for an owner-only basket. Add published products, choose colours/quantities, enter a code and calculate against current server prices, stock, shipping and shop switches. Closing a section is caught by a new quote even if the page/basket was opened earlier. This creates no orders, reservations, payments or stock deductions and is not yet a Square sandbox checkout. The normal public shop has no basket controls. Test baskets stay in memory and are not saved to browser storage.

Each product is marked Physical (printed product) or Digital (STL) in its editor. Physical products have packed weight in grams and three packed dimensions in millimetres, including packaging. Complete all four, or leave them all blank until measured. Manual shipping rates are still manually configured: entering measurements does not yet connect a weight/size-based carrier tariff. Multi-item parcel packing, carrier dimensional/chargeable-weight rules, region and service prices must be confirmed for a live Australia Post quote.

Images support up to 12 still JPEG/PNG/WebP photos per product. The browser accepts up to 20 MiB / 40 megapixels and optimises to WebP at 1600px; the server independently validates/decode/re-encodes bounded inputs and strips embedded metadata. Output is stored privately, separately from the catalogue JSON. Uploads require owner authentication, same-origin verification, current account and catalogue revision. Add alt text, choose a cover, reorder/remove photos and publish the saved draft. Anonymous image requests succeed only while that exact image is referenced by the product's published snapshot; draft requests require owner sign-in. Unpublishing revokes public image access. Removing an image from a draft does not remove it from the published listing until that draft is published. Retained binary objects are not automatically deleted; a future reachability-based cleanup must retain all published references and handle orphaned/conflicted uploads safely.

Catalogue JSON exports contain image references/alt text, not the actual photo binaries. They remain incomplete disaster recovery until an image-inclusive backup and tested restore are implemented.

Square is the preferred payment integration to investigate next; see [Square checkout direction](SQUARE-CHECKOUT.md). No Square credentials/resources/payments were created.

Spreadsheet importing and private per-product cost/margin estimates are now available too; see [Spreadsheet imports and cost estimates](SPREADSHEET-IMPORT-AND-COSTING.md).

## Available in this increment

Owner-only **Settings → HobbyNest store** (`/studio/hobbynest`) and a shortcut in My Studio. All store API writes require fresh owner authorization, same-origin verification, an account fence and the latest catalogue ETag. A stale form or uncertain save stops editing until reload. Do not blindly repeat a stock adjustment after a connection failure; reload and check the recent movements first.

- Physical and digital products, unique SKU, AUD prices in integer cents, descriptions, collections and digital licence text. Product details are saved as drafts; Publish saved draft makes them visible in the preview. Unpublish removes a listing without erasing stock/history. No fabricated products or prices are seeded in production.
- Colours per physical product, finished stock per colour, a manually managed filament-available flag and a shown/hidden flag. Rename the initial Standard colour; add others as needed. Filament is initially unavailable until explicitly set. Hiding a colour retains its stock and history. Stock counts shown to customers exclude hidden colours.
- Positive receiving/printing/returns and negative manual-sale/damage adjustments, plus count corrections. Negative finished stock is rejected. Notes, time, owner, colour and resulting count are recorded atomically with the change. The most recent 500 movements are retained; export regularly to keep longer history. This is a small-store catalogue ledger, not an accounting or sales ledger.
- Editable dispatch ranges **per product**: ready-stock preparation time, and total print-to-order preparation time, each in business days. They exclude carrier transit. Printing is offered only when backorders are enabled and the selected colour has filament available. Already finished stock can sell even if filament has run out. Partial-ready quantities use the printing range and assume one combined dispatch. All colours currently share their product's price and dispatch ranges.
- Visible/hidden named collections (catalogue groups), editable names/descriptions, safe deletion of unused groups. Hiding a group only hides its public filter; unpublish products to hide listings. Detach a group from product drafts, published listings and discounts before deleting it.
- Percentage/fixed-AUD discounts, optional codes, eligibility collections, merchandise minimum, start/end dates and enable/disable. Dates are entered in the administrator's local time and stored as absolute timestamps. One best eligible discount applies; no stacking. Hidden collections do not activate collection-scoped discounts. Usage limits, first-purchase eligibility and redemption counts are deferred until a transactional order ledger exists.
- Manual Australian shipping rates by state/territory, carrier transit ranges, free-shipping thresholds and private origin postcode. An empty state selection covers all Australia. No matching enabled rate means no quote, not free shipping. Thresholds use the discounted merchandise total. These are owner-set estimates, not verified Australia Post rates. International zones, postcode/remote-area exceptions, labels and live carrier access are not connected.
- An owner-only estimate tester for one product/colour/quantity and code. Its underlying calculation handles mixed physical/digital carts; the current tester UI shows one line. It never takes money, reserves stock or creates an order. Digital-only estimates have no postage. Public previews expose published descriptions/prices/availability, not codes, drafts, origin postcode, stock notes or owner IDs.
- Private JSON catalogue export, including draft/published records, configuration and recent stock movements. It excludes paid file bytes and orders. It is an export, **not a tested restore or complete shop disaster recovery**.

The catalogue uses a dedicated strong-consistency Netlify Blobs record, with conditional writes. This keeps catalogue edits and manual stock adjustments together for this small preparation phase (150 products, 30 colours per product, 40 collections, 80 offers, 20 rates). It does not change SoraSpace storage, apps, subscriptions or existing website content. The storefront remains noindex and **orders remain closed**.

## Australia Post investigation and next integration

The official developer portal is `https://developers.auspost.com.au/`; the Postage Assessment Calculator documentation target is `https://developers.auspost.com.au/apis/pac`. Direct retrieval from this execution environment was refused by its outbound proxy (CONNECT 403 on 29 October 2026). This is **not** evidence that Australia Post is unavailable, nor verification of current API terms, prices, account eligibility or endpoints. No current rate table has been copied or invented.

Before enabling live rates:

1. Confirm current Australia Post developer registration, API access, authentication and applicable retail versus merchant/contract rate service. Confirm whether a separate MyPost Business/eParcel integration is required for Claudia's actual account and prices. Don't present public estimates as negotiated account charges.
2. Configure the credential server-side only. Use an allowlisted carrier host, bounded timeouts, rate limits and no credential/client exposure. Don't accept arbitrary fetch URLs from catalogue fields.
3. Verify origin/destination postcodes, country, packed weights/dimensions, unit conversion, service limits, remote-area restrictions, surcharges and GST presentation. A product's packed dimensions alone do not define how a multi-product order packs into parcels.
4. Implement packing rules (combined parcel versus multiple parcels), carrier-service selection and clear fallback handling. Do not silently replace a failed carrier quote with free postage.
5. Compare real quotes for metro/regional/remote destinations, bulky parcels, multi-item carts and account prices before offering them in checkout. Keep dispatch and carrier transit estimates separate. Label purchase/tracking are separate capabilities from rate estimates.

## Next release gates before accepting orders

Use a managed transactional commerce database for orders, reservations and payment events; migrate/import the verified catalogue and reconcile opening stock. The Blob catalogue does **not** protect two competing payment checkouts for the last unit. Do not bolt a payment button onto the preview.

- Reserve **finished stock by colour** when creating checkout; allocate any permitted remainder to a production queue. Confirm availability and price on the server. Expire abandoned reservations; handle payment/expiration races and duplicate webhooks exactly once. Decide explicitly whether long printing queues should limit backorders even when filament exists.
- Reduce sellable finished stock through the order/reservation transaction, not the success page or a browser callback. Keep physical on-hand, reserved, available and production quantities distinct. Record cancellations/refunds/returns; refunding does not automatically mean a dispatched item is back in sellable stock.
- Clearly show the ready/to-print split and agreed dispatch range before payment, snapshot it on the order and receipt, and show a combined expected delivery window only when both preparation and carrier estimates are known. Add production/dispatch/delivery status and notifications for changed estimates.
- Material/size variants, mixed-colour personalization rules, printing instructions, safety/age/use information, per-colour lead-time overrides if needed, and image/licence/content rights checks. Product photo upload/alt text are now delivered above.
- Hosted payment sandbox, tax/GST policy appropriate to the actual business, signed/reconciled callbacks, receipts, order administration, secure immutable paid-STL delivery, licence acceptance, refund/consumer guarantees, privacy/contact/shipping policies and secure customer order recovery.
- Shipping address validation, rate testing, tracking, backup **restore** drills, stock/order reconciliation, accessibility and real physical/digital/mixed-order acceptance. No production charges or paid carrier service activation in this increment.


## Australia Post connector and monthly review · 30 October 2026 (Sydney)

An **experimental PAC connector** is now wired into owner test-basket estimates, with no hardcoded postage prices. It is disabled by default. No genuine carrier request, tariff, credential or account eligibility has been verified: official developer/pricing pages are blocked by the execution environment's outbound proxy (CONNECT 403). The request/response integration still needs comparison against the current official API documentation and an actual account before any sales release. Automated tests use clearly synthetic carrier responses, not today's Australia Post prices.

Preparation/activation for testing:

1. Obtain appropriate Australia Post developer/PAC access for the actual account. Confirm that PAC public service prices are the intended tariff; MyPost Business/eParcel/contract pricing and labels are separate and not connected here.
2. Add **AUSPOST_PAC_API_KEY** as a server-only secret in Netlify's environment settings (Functions scope). Never put it in a public variable, client script, catalogue export, repository or chat. Redeploy if Netlify requires it for runtime availability.
3. Enter the dispatch postcode in Shipping. Set every physical product's **packed** grams and length/width/height in millimetres, save and publish. The adapter converts to kilograms and centimetres for PAC. No guessed carrier dimensional-weight multiplier or rate table is used; the provider receives the actual measurements.
4. In **Shipping → Australia Post live estimates & monthly check**, enable live estimates, choose a sample destination postcode, save and run the connection check. The test basket/estimate also needs a destination postcode. No postcodes are persisted with a basket.
5. Verify real metro/regional/remote rates, product dimensions, GST/account tariff and service restrictions against Australia Post before relying on these results. The current connector accepts supported Parcel Post/Express Post service prices only. Extra cover, signature, labels, negotiated rates and transit guarantees are not implemented.

The initial explicit packing policy is **one physical unit per measured parcel**, including each item in a mixed cart. Matching service costs are summed; digital items add no postage. Up to 20 separate parcels and 8 product types are supported per quote. Requests for independent product types are bounded and run concurrently. Combining products into one parcel needs a separate packing policy; do not represent these estimates as optimal combined-parcel pricing. Reference/live carrier amounts are provider-reported; tax and surcharges still need actual-account verification before checkout.

When live estimates are enabled, each owner basket calculation asks the carrier again, with server-only credentials, fixed allowlisted host, no redirects, bounded responses and an 8-second request timeout. Missing measurements, credentials, invalid postcodes, unexpected responses or unavailable services fail closed. There is no silent manual/free-postage fallback.

The optional monthly switch runs a published Netlify Scheduled Function at **03:00 UTC on the first day of each month** (13:00 Sydney standard time / 14:00 daylight time). It checks one stated reference parcel (1 kg, 200 × 150 × 100 mm) and records success/failure and changes from the previous comparable sample. It does **not** certify every tariff/destination or overwrite manually configured prices. Live baskets are the mechanism for current per-order costs. Last successful samples remain visible after failures, clearly marked as history, not usable fallback quotes. The owner can run a check manually; there is no email alert service configured.

The scheduled function and all live requests stay inactive until the owner opts in and configures the necessary key/settings. No API account, paid carrier service, labels, payment or real order has been activated by this change.
