# HobbyNest store plan

29 October 2026 (Sydney). Claudia confirmed physical 3D-printed products **and downloadable STL files**, clear HobbyNest branding, a subdomain linked from Explore, and the option of an independent domain later.

## Recommended first version

Use `hobbynest.claudiagilbert.com` as the intended shop address, with a separate storefront deployment/platform and a visible link back to Explore. Explore's 3D Printing page is the brand/process introduction; its current `/hobbynest` page is a noindex design preview, not the production shop. No DNS records, store accounts, payment services or charges have been created.

**Updated preference:** Claudia wants a custom Netlify store rather than a Shopify subscription, with a possible reusable commercial platform later. The recommended path is now an independent Astro/Netlify storefront, transactional database, hosted payment checkout and private digital delivery. See [Netlify commerce scope and design](NETLIFY-COMMERCE-DESIGN.md) for effort, costs, stages and future-platform boundaries. No commerce backend or payments have been implemented by this planning update.

Keep branding and editorial links consistent with Explore, while HobbyNest owns its logo, palette, product pages and checkout. Do not assume Explore sign-in automatically logs a customer into a store merely because both use subdomains. Guest checkout is a useful starting point; account linking can follow if there is a concrete customer benefit. App subscription purchases and HobbyNest orders remain separate.

| Approach | Advantage | Trade-off |
| --- | --- | --- |
| Managed Shopify storefront (alternative) | Maintained checkout/orders, hosted storefront, supported shipping/digital extensions | Recurring platform/app fees; verify fulfilment and policy fit |
| Custom Netlify storefront + hosted payment checkout (preferred) | Full design control; Explore integration can be closer | More engineering, webhook/stock/security/fulfilment maintenance |
| WordPress/WooCommerce | Broad commerce extension ecosystem | Another CMS/hosting stack and ongoing plugin maintenance |

A separate domain later should attach to the **same chosen store**, preserving product URLs where practical and redirecting the old hostname. Retain order and licence records. Update canonical URLs, return links, checkout redirects and transactional email branding. The hosting/domain change is separate from moving store data.

## Catalogue and fulfilment

Physical listings need original photographs, dimensions, material, available colours/variants, price/currency, stock versus made-to-order status, processing time, care/suitability and shipping restrictions. Do not invent products, safety certifications or food/toy suitability. Confirm rights to manufacture and sell every design.

STL listings need images of actual printed results where possible, file contents/version, dimensions/scale, units, printer/material guidance, support/assembly needs and licence terms before purchase. Decide personal-use versus commercial-print rights per product; do not assume purchasing the digital file grants permission to redistribute it or sell prints. Preserve a purchased file version when a design is updated.

A mixed cart must charge shipping only for physical items and release digital files only after verified payment. Store STL originals in private digital-delivery storage, not this repository's public assets. Provide controlled download links and a customer recovery path. Confirm actual provider support for expiry, download limits, resend, refunds, file updates and access revocation before promising any of those behaviours.

For a future custom backend: derive amounts and product/file IDs from server-side catalogue data, verify signed payment webhooks and deduplicate event/order processing. Never fulfil from a browser success URL. Test delayed payment, duplicate callbacks, stock races, partial fulfilment, failed delivery, refunds and chargebacks. Avoid logging raw download tokens or payment credentials. Hosted checkout should handle card details; Explore should not collect them.

## Decisions before commerce setup

- Confirm legal trading/contact details, shipping origin, initial delivery countries, currency and tax/GST position. Australian audience/timezone does not establish tax registration.
- Select database, payment and private-file providers after checking current total fees and physical/digital workflow. The preferred hosting direction is Netlify.
- Supply first real products, photographs, prices, variants, manufacturing lead times and owned/licensed STL files.
- Agree STL licences, privacy, shipping, returns/refunds and digital fulfilment terms. Terms must reflect applicable consumer rights; do not use a blanket “no refunds” policy as a substitute.
- Decide support inbox and transactional email sender. Preserve the existing Microsoft 365 DNS records when authenticating store mail.

## Domain and launch checklist

1. Build and test the actual store on its platform preview hostname; preserve the current Explore deployment.
2. Configure the exact custom domain in that store's dashboard. Use **its supplied DNS values** at Squarespace for the `hobbynest` host; do not guess a Netlify/Shopify target, alter apex/www, change nameservers or remove mail records.
3. Verify HTTPS and one canonical shop hostname, product links and email. Replace the Explore preview link with the production subdomain only after the store is reachable and ready. Keep `/hobbynest` as a redirect or explicitly retired preview then.
4. Test physical-only, digital-only and mixed orders, guest checkout, shipping/tax, payment failure/cancellation, verified fulfilment, download resend, refund, device layouts and accessibility. Confirm no unpaid download is exposed.
5. Make a small real order and refund as the final acceptance drill, with Claudia's agreement to the actual charge. Publish only when products, policies and support details are complete.

The current design preview collects no payments, orders, email signups or customer files. It is intentionally independent of checkout/platform choice.
