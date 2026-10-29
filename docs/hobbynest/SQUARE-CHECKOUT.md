# Square checkout direction · 29 October 2026

Claudia has a Square account and asked to keep HobbyNest's store/basket while Square takes payment. This is feasible and is the preferred next payment integration to investigate. No Square credentials, sandbox resources, payment links, purchases or live checkout were created in this increment.

## Intended customer flow

1. HobbyNest manages products, physical/digital type, colours, availability, discounts, delivery choices and the basket.
2. A server checks the current published catalogue, both shop-section switches, stock by colour, printing rules, promotion eligibility, shipping/address and tax policy. Never accept a browser-supplied total as the amount to charge.
3. Create a durable pending order with price/dispatch/licence snapshots and transactional stock reservations. Use idempotency keys and a stable internal order reference. Physical and digital items can be in one order.
4. Create Square's hosted checkout/payment link for that order, with matching currency, line items and the final approved amount. Card entry stays on Square. Confirm the current Square Checkout/Payment Links API fields, merchant/location eligibility, taxes, discounts, shipping and payment methods against the current official documentation before implementing the adapter. Do not assume an arbitrary amount-only payment link provides itemised inventory, shipping or digital fulfilment.
5. Verify signed Square callbacks and query authoritative payment/order state as needed. Reconcile amount, AUD currency, merchant/location, order association and completion before fulfilment. Redirecting back from checkout is not proof of payment.
6. Commit payment/reservation state once, schedule physical fulfilment/production and grant secure digital downloads after verified payment. Use a durable outbox for receipts and processing notices. Handle duplicate/out-of-order events, payment delays, checkout expiration, cancellations, refunds and reconciliation.

## Required setup and acceptance

- Confirm Square merchant account country, AUD/location configuration, and current ability to sell the intended physical products and digital STL licences. Check the account's actual processing fees; none have been verified here.
- Create/configure a Square developer application with **sandbox first**, a sandbox location, scoped server-side access credentials and callback signing configuration. Store secrets in the hosting platform's secret settings; do not paste them into chat, commit them, expose them in JavaScript or place them in public admin exports. A single-store integration does not need a multi-merchant OAuth platform now.
- Select a transactional order/inventory database and tested backup/restore before payment integration. The current Blob catalogue/manual stock adjustments do not supply transactional multi-customer order reservations.
- Configure allowed return URLs and verified callback endpoints. Define whether HobbyNest alone owns inventory initially; don't enable two competing Square/HobbyNest stock authorities without an explicit sync/reconciliation design.
- Test physical-only, digital-only and mixed baskets; open/paused section changes during checkout; last-ready-unit races; print-to-order quantities; codes, free-shipping thresholds, GST and total reconciliation; duplicate callbacks; failed/abandoned payments; delayed completion; cancelled/refunded orders; email failure and download recovery.
- A refund does not automatically restore dispatched inventory. A cancelled reservation does need release. Define the handling for a payment that finishes after a shop is paused or an order's reservation expires; reconcile it explicitly instead of silently dropping or double-fulfilling the payment.
- Hosted checkout does not itself provide printing queues, shipping labels, purchase licences, private STL delivery, customer service or Australian consumer-law policies. Those remain HobbyNest responsibilities.

Official starting points (not retrieved/verified from this execution environment):

- `https://developer.squareup.com/docs/checkout-api/overview`
- `https://developer.squareup.com/docs/orders-api/what-it-does`
- `https://developer.squareup.com/docs/webhooks/overview`
- `https://developer.squareup.com/docs/devtools/sandbox/overview`

The present **owner test basket** exercises prices, quantities, colours, codes, channel closure and manual postage without Square. It does not generate a Square sandbox payment or a real order. Connecting Square is a separate, reviewable step after the above prerequisites.
