# SoraSpace customer workspaces and publishing

30 October 2026. Working product direction agreed with Claudia; architecture and release gates, not a launched multi-customer service. Existing Explore, HobbyNest and app storage contracts continue unchanged.

## Product boundaries

- **SoraSpace**: a private workspace, creative/office apps and an optional public website under the customer's identity.
- **SoraShop**: the working name for an optional commerce engine. HobbyNest remains Claudia's own shop and first proving ground. Name/trademark/domain clearance remains outstanding.
- **Explore by Claudia**: Claudia's existing website, not a shared administration account or the default branding of customer sites.

Initial audiences include students, academics and independent creators. Offer straightforward templates and useful publication controls first; do not promise a reference manager, peer review, university compliance, collaborative editing, Office format parity or institutional data residency without implementing and accepting those features.

A workspace can exist without a public site. A site can exist without a shop. Buying an app bundle must not automatically publish a website or activate commerce. Subscription design in ../kobo/subscriptions remains a proposal; published prices, billing and feature enforcement need separate acceptance.

## Target customer journey

An owner-only four-step questionnaire and downloadable private template draft are now available; see [guided site setup](SITE-SETUP-WORKFLOW.md). This is a usability preview, not customer provisioning or publication.

1. Create a verified account and a workspace. Keep invitation-only access until onboarding and isolation pass the gates below.
2. Choose a template and optional pages: Home, About, Blog, Articles, Journal, Galleries and Contact. Shop appears only when the commerce module is available and deliberately enabled.
3. Rename/reorder navigation, choose the homepage, colours, fonts, logo, hero and page-specific highlights. Start with a constrained section editor and approved themes; arbitrary script/HTML/theme uploads are outside the first version.
4. Write privately, preview, then publish an explicit site revision. Page visibility is separate from content visibility. Private journals start private; enabling a Journal page does not publish existing entries.
5. Use a platform subdomain initially; connect a verified custom domain later. No SoraSpace domain is configured by this document.
6. Connect chosen storage through the existing supported authorization flows. Explain where each file lives and what is actually backed up.

Switching a page off hides its navigation and public route, including direct links, search, sitemap and feeds. It preserves content privately; it does not delete documents. Restoring a page does not publish new drafts. Previously downloaded public content cannot be recalled. Preview requires scoped authorization, noindex/no-store and safe handling of private images.

Owner-only implementation update: [private site editor](PRIVATE-SITE-EDITOR.md) now supports saved trial drafts and editable page/navigation/appearance controls. [Super-administrator assessment](SUPER-ADMINISTRATOR-ASSESSMENT.md) defines the separate platform control plane; its owner overview is read-only. Neither activates customer provisioning or publishing.

## First technical prerequisite: explicit tenant boundaries

Implementation update: an isolated PostgreSQL schema, tenant service and real-database adversarial tests are now built; see [tenant foundation](TENANT-FOUNDATION.md). They are not connected to live routes or a managed database. The full isolation release gate below remains open.

Current owner-centric Explore content stores and HobbyNest's single catalogue are not a safe multi-tenant backend. Do not accept a browser-provided customer ID or prepend an ID to existing keys and call isolation complete. Do not onboard a second seller to the existing single-shop record.

Design a transactional database with workspace, verified membership/role, site, publication, domain binding, entitlement and audit records. Use non-null tenant IDs on tenant-owned records and tenant-scoped uniqueness, foreign keys and database policies; enforce authorization in the service layer as well. Jobs, exports, object storage and backups must carry explicit authorized tenant scope. Platform administration and billing support are distinct from customer roles.

Resolve public sites only through an allowlisted, verified hostname-to-site binding at the trusted edge. The Host header, path, forwarded host or query string is never proof of membership. Private APIs derive tenant access from a fresh session and membership, not a domain alone. Restrict cache keys by verified site and published revision; never cache private responses publicly.

Keep the authenticated workspace on a canonical platform origin. Custom domains serve public published sites; provide a clear Edit in SoraSpace link rather than trying to share login cookies across unrelated domains. Review host-only secure cookies, CSRF, redirects, editor previews and app launch audience/origin before enabling domains. Verify domain ownership, provisioning, TLS renewal, revocation and removal before reassignment. Reject collisions and unknown domains; prevent dangling domain takeover.

Use a separate trial deployment and disposable tenants before touching live content. No mass migration, credential rotation, iframe origin change or app folder rename is part of this increment. Claude retains app feature/build ownership; website and tenant infrastructure work stays here. Existing Kōbō folder names, IDs and bridge contracts remain stable.

## Design system direction

Use the compact SoraSpace shell as the workspace foundation: shared spacing, type sizes, buttons, surfaces, focus states and status messages; progressive disclosure for detailed settings. Public themes can express customer identity without exposing internal app controls.

At laptop sizes, prioritise apps and daily essentials; use scrolling for longer content instead of shrinking text to fit. At phone/tablet sizes, stack panels and offer accessible drawers, wrapping controls and touch targets. Keep hover optional, keyboard access complete, reduced motion supported, and error/status space stable. Test system/light/dark appearance, long names and empty/loading/error states. Do not apply desktop dashboard density to a long-form article's reading measure.

## Delivery order and acceptance gates

| Stage | Concrete output | Gate before release |
| --- | --- | --- |
| 1. Stabilise current product | Existing workspace/app release checklist, clearer site-file browsing, consistent controls, index recovery drill | Google Drive/kDrive two-device acceptance; private/public regression checks; phone/tablet usability |
| 2. Tenant foundation | Separate trial backend with memberships, tenant data policies, audit trail and isolated objects | Two adversarial tenants cannot list/read/write/delete each other's records, files, drafts, previews, exports or restore jobs; platform support access audited |
| 3. Publishing beta | Two customer templates, page switches, navigation, draft/preview/publish, subdomain routing | Page-off direct URLs/assets/feeds fail closed; unpublished edits stay private; tenant-aware cache tests; revert a published revision |
| 4. Storage management | Scoped inventory and clear locations using verified adapters | Read-only browsing first; provider and account changes fenced; storage acceptance described in STORAGE-MANAGEMENT.md |
| 5. Commercial workspace | Metering, plan entitlements, hosted billing, cancellation/export/read-only grace | Verified idempotent payment events and reconciliation; quotas; backup/restore; data portability; tested expired access without data loss |
| 6. Custom domains | Guided ownership proof, mapping, TLS and lifecycle controls | Cross-domain sign-in stays stable; renewal and domain removal/reassignment drill; tenant routing isolation |
| 7. SoraShop beta | Extracted commerce module, tenant merchant connections and order ledger | Transactional reservation/payment/refund/download tests and seller isolation; HobbyNest end-to-end acceptance first |

Do not enable all stages through a single site setting. Feature flags default off and require the relevant gate. Start with a small invitation beta after isolation, not a public subscription launch.

## Subscription and operations decisions to settle with evidence

Separate app entitlement, publishing capacity and optional commerce. Define limits for storage we actually host, file traffic, publication size, image processing, domains, members and commerce operations. Connecting a user's drive does not mean our metadata, previews, relays and support have zero cost. Cost the actual workload before setting a whole-product price; no new prices are frozen here.

Each merchant should connect their own authorized payment account unless a separately reviewed marketplace arrangement is chosen. Platform subscriptions and shopper purchases have separate ledgers. Square remains the HobbyNest checkout candidate; the platform must not silently pool seller funds.

Select the database, private object storage, transactional email and operational backup services after checking current costs, supported transactions, recovery and region terms. Add restore drills, dependency patching, uptime/error alerts, abuse and upload limits, account recovery, lawful takedown process, deletion/retention policy and support ownership before selling. No new provider account or paid resource is created here.

Regional storage is a per-service evidence question. User files in Europe do not remove US jurisdiction or localise Netlify identity, credentials, indexes, relays, logs or backups. Keep Netlify stability first; European infrastructure migration remains a separate reviewed workstream.
