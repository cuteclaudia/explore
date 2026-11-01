# Detailed SoraShop sales page

Public route: `/tools/sorashop/` in both marketing builds. The Business & collaboration showcase tab, complete feature-guide directory and existing shop feature concept link to it. SoraShop remains a planned optional business app, separate from My Studio's creative/academic tools. The page does not activate a shop, checkout, customer account, provider, local database, printer or marketplace.

Seven original static concepts use fictional Paper & Form shop data:

1. Compact catalogue with collection/status navigation, search/sort/group toolbar, 12 product rows and a selected-product inspector. Desktop retains three readable panes; small screens stack the static sample, with local horizontal table scrolling. The planned operational app should drill from list to record with a clear Back route on phones.
2. Ten order records with a selected mixed physical/digital order, private customer summary and separate payment, production and delivery states.
3. Stock quantities split into on-hand/reserved/available, a low-stock cue and reasoned movement history. Sample availability equals on-hand minus reserved.
4. Fabrication jobs, material/spool use, machine/job-file review, quality/reprint states and private sample costing. No job or hardware is started.
5. Packing checks, parcel dimensions/weight, unconnected carrier quotes and separate digital access. Prepared local work is planned; current rates, new labels and remote payment confirmations require connections.
6. A branded public product view with variants, sample AUD price, made-to-order dispatch estimate and pre-purchase delivery information. No working basket, purchase offer or checkout is presented.
7. Business summary widgets with periods and explicitly fictional values, independent shops and role examples. Today's three sample paid orders total AUD 118.00, matching the sample sales widget. Runtime widgets remain disconnected until authorised data adapters exist.

Nine balanced benefit cards cover catalogue/variants, physical/digital/made-to-order/mixed products, inventory, orders, production, storefronts, independent stores, reviewed imports and the business hub. Six growth cards retain the supplied v3 specification scope: per-shop payments/tax/reconciliation, carrier/packing stations, qualified local working/recovery, customer service/returns, promotions/consent and optional eBay/Amazon channels. Pricing, supported regions, package limits and provider compatibility are not promised. See [the specification review](SORASHOP-SPECIFICATION-REVIEW.md) for engineering corrections and SHP-01–24; the isolated print-costing core does not constitute a released commerce app.

The overview/headline/metadata/navigation have 16-language catalogue coverage. Detailed design concepts are explicitly labelled English; editorial localisation remains open. Mock controls are inert text/spans. No copied product photography, real customer/shop data, provider calls, payment links or downloads are used.

Local evidence: `scripts/check-shop-sales.mjs` checks both builds at 320/390/768/1366px, direct business-group navigation, seven concepts, compact desktop panes, readable detail columns, local table scrolling, coherent stock/sales samples, French/Japanese routes/anchors and no live commerce controls/network calls. Internal captures are `/workspace/reviews/sorashop/catalogue-desktop.png`, `orders-desktop.png`, `overview-desktop.png` and `storefront-phone.png`; these are design concepts, not accepted app screenshots. Metadata/sitemap checks cover 192 public locale pages. Source/build acceptance does not establish live deployment.

Current sales coverage: eight detailed pages, six basic previews, 19 guide-only entries across 33 modules, following the Projects/CRM addition. MKT-01/02 remain Partial; operational commerce and the full SHP acceptance remain outstanding. The remaining creative apps are the next dedicated-page priorities, followed by useful business/shared-service explanations.
