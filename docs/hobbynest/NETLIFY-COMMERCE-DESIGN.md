# HobbyNest on Netlify: scope and reusable platform design

29 October 2026 (Sydney). Claudia prefers to avoid Shopify's recurring platform subscription and wants the option to commercialise the store software later. This supersedes the earlier recommendation to start with Shopify. It authorizes planning and a custom implementation path, not creating paid accounts, charging customers or declaring checkout ready.

## Feasibility and effort

Netlify can host a custom storefront, owner UI and stateless server functions. It does not itself supply a complete commerce engine, card processor, fulfilment system or transactional database simply by deploying an Astro site. The features HobbyNest needs are achievable; full parity with Shopify's international/channel/POS/app ecosystem is a much larger product and is not required for the first store.

Treat a production-ready first store as **several developer-weeks** of work, with uncertainty until shipping regions, product/variant rules, licences and payment/tax requirements are settled. This is a rough effort assessment, not a promised calendar delivery date. A reusable platform for other businesses adds substantial tenancy, billing, domain, support and operational work. Code generation and local test passes do not replace real fulfilment/payment acceptance.

Avoiding Shopify does not make commerce free. Budget separately for payment processing, Netlify compute/bandwidth, a transactional database, private STL storage/download traffic, transactional email, domain and any tax/shipping services. Free allowances and provider prices have not been verified. Total operating cost may be lower for a small shop, but that depends on orders and file-download volume; maintenance is an ongoing responsibility.

## Proposed stack and ownership

- Independent HobbyNest storefront/deployment at the intended `hobbynest.claudiagilbert.com`, linked from Explore; keep the current noindex preview until the actual store passes acceptance.
- Astro storefront plus Netlify Functions for server-side catalogue/cart validation, checkout creation and payment callbacks. Client prices, stock claims, order IDs and success URLs never authorize a purchase or download.
- Managed PostgreSQL with transactions, uniqueness constraints and a tested serverless connection mechanism for products/variants, prices, inventory reservations, orders, payment events, licence grants and fulfilment. Select the actual database service after checking current Netlify/provider support and costs. Do not repurpose the existing Kōbō storage index or use unrelated Blobs writes as a relational stock/order transaction.
- A hosted payment checkout such as Stripe Checkout, subject to Claudia's merchant onboarding and current regional/physical/digital-goods terms. This can remove Shopify while still outsourcing card handling. Explore/HobbyNest do not collect raw card details.
- Private object storage for STL originals and purchased immutable file versions. Download grants are scoped to paid order line, file version and customer; use expiring/revocable links and bounded retry/download policy. Do not place paid files in Astro `public/` or public GitHub releases.
- Transactional email service and a durable database outbox for receipts, delivery and resend. Signed callbacks, idempotency and scheduled reconciliation handle retries; do not rely on an unawaited serverless task surviving a response.
- Authenticated store administration with server-side owner checks, audit records and protected product/file uploads. Guest checkout can be first; an order number or known email alone is never sufficient to retrieve private downloads.

## Four delivery stages

### 1. Catalogue and owner workspace

Products typed physical/digital, variants, price/currency, original photos, availability/stock versus made-to-order, weights/dimensions, production lead time, STL file/version and licence descriptions. Draft/published separation, owner-only administration and input/file validation. Use fixtures until Claudia provides real products; no invented goods/prices.

### 2. Cart and sandbox payment

Mixed cart with server-authoritative price snapshots; shipping only for physical lines; shipping zones/rates, address validation and tax policy appropriate to the initial sales region. Reserve finite stock transactionally, expire abandoned reservations and reconcile paid/expired session races. Verify signed payment events and deduplicate fulfilment. Test asynchronous/failed payments, duplicate/out-of-order callbacks, price/stock changes and multiple buyers competing for the last item.

### 3. Orders and delivery

Order timeline, partial fulfilment, physical dispatch/tracking, stock adjustments, receipt emails and resend, secure digital download recovery, versioned STL licences, refund/cancellation and recorded external payment state. A digital licence does not itself prevent copying; access control is not a DRM guarantee. File updates must not silently change the rights granted at purchase.

### 4. Production acceptance and operations

Backups plus tested restore, reconciliation/alerts, permission checks, accessible phone/tablet checkout, privacy/returns/licence/shipping information, sender-domain setup and real payment/refund/physical/digital fulfilment drills. Explicitly approve the actual paid test transaction before making it. Configure the subdomain with the selected Netlify site's exact DNS target only when the deployment is ready; preserve apex/www and Microsoft 365 mail records.

A limited beta can open only after the relevant payment and delivery acceptance gates pass. Customer checkout does not launch merely because the catalogue looks finished. Discounts, customer accounts, reviews, advanced shipping labels, multi-currency, wholesale and subscription products can be separate increments when needed.

## Build for future shops without launching a SaaS now

Keep business branding **HobbyNest** separate from the software platform's working name. Use portable product/order schemas and a commerce module independent of Explore's private Studio. Introduce a store identifier in relational keys/uniqueness constraints and object namespaces from the beginning; every query and file grant must derive authorized store scope on the server. A request's store ID or hostname is not by itself proof of administrative permission.

Before onboarding a second business: implement and test tenant isolation (including database policies and background jobs), verified custom-domain ownership, separate payment merchant accounts, secure tenant onboarding, role-based staff access, themes, platform subscription billing, usage limits, support/export/deletion workflows and operational ownership. Decide whether each merchant connects its own processor account; do not collect/pool seller funds under HobbyNest or assume marketplace payment obligations disappear.

A dedicated platform domain can follow later. HobbyNest remains the first shop and proving ground. Domain naming and marketing do not establish product readiness or trademark clearance.

## Names: working candidates only

- **Nestlane** — connects to HobbyNest while leaving room for other kinds of shops.
- **Shopweave** — suggests bringing storefront, orders and downloads together.
- **MakerHarbour** — fits a product aimed first at makers and independent businesses.

These are brainstorming candidates, **not cleared trademarks or confirmed available domains**. Search the intended markets (including IP Australia and relevant international registries), domain/handle availability and similar commerce/software brands before committing. Do not rename HobbyNest or buy a domain from this list without Claudia's choice.

## Immediate next implementation

Start with the catalogue/data model and an owner-only product editor against a selected development database, followed by sandbox checkout. Keep storefront payment controls disabled until the matching backend and live acceptance exist. Confirm initial shipping regions, currency/tax position, stock/made-to-order rules and STL licence choices as product setup inputs, rather than blocking all independent implementation now.
