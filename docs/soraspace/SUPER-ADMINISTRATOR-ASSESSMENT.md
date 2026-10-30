# SoraSpace super-administrator controls: full assessment

30 October 2026 (Sydney). Source-based assessment requested by Claudia. Scope: SoraSpace workspaces, customer websites/custom domains, optional SoraShop, app access, storage and platform operations. This is an operational control specification, **not evidence that these controls are delivered or that a multi-customer service can launch**. No customer accounts, billing, DNS or operator permissions are changed by this document.

## Decision and current position

Create a distinct **SoraSpace Administration** control plane. Keep Claudia's personal Explore Studio, the public product landing site, the authenticated customer workspace and each customer's published website separate. Only platform staff should see Administration. A customer's own site administrator is not a platform administrator.

Claudia is the initial platform owner, with the authority to manage the business. Customer private content should still require an explicit, scoped support or recovery process; it must not be available through a permanent “view everyone's files” button.

Current source inventory:

| Area | Evidence | Current boundary/gap |
| --- | --- | --- |
| Owner identity and app permissions | `server/access.mjs`, `server/identity.ts`, `/studio/users` | Fresh identity and owner-only user/settings controls exist for Explore. `isOwner` currently grants all listed legacy capabilities. Do not reinterpret this as customer-tenant bypass. No platform-staff RBAC or step-up authentication is implemented. |
| App subscriptions | `server/subscription-catalogue.mjs`, `server/subscription-policy.mjs`, subscription specification | Disabled price/policy prototypes and proposals. No live checkout, billing ledger, plan admin or proven native licence enforcement. |
| Tenant membership/resources | `db/soraspace/001-tenant-foundation.sql`, `server/soraspace-tenant.mjs`, real PostgreSQL checks | Isolated tested foundation, not connected to live identity/database/routes. No production tenant onboarding, owner transfer or support access. |
| Site setup/editor | `/studio/soraspace-setup`, `/studio/soraspace-editor`, owner trial service | Owner-only private prototypes. Editor saves are separate, account-bound trial Blobs, not the tenant backend. No customer publisher, domain resolver or public page-visibility enforcement. |
| Storage/recovery | storage connection functions, Google Drive/WebDAV adapters, private index recovery | Existing per-account mechanisms and index recovery. Index backup is not an original-file or whole-platform backup. Regional evidence and provider acceptance remain separate. |
| HobbyNest/SoraShop | HobbyNest service/admin, Square direction | Owner catalogue/inventory/discount/shipping and test basket preparation. No multi-merchant ledger, checkout, paid download delivery or transactional order reservations. |
| Public SoraSpace hosting | `sites/soraspace`, Netlify project `soraspacestudio` per Claudia | Static marketing, automatic Git deployment now reported published by Claudia. This workspace has no authenticated Netlify admin connection; live DNS/certificate health has not been independently checked. |
| Audit/operations | Tenant resource audit trigger, existing individual service tests | Partial resource-only prototype audit. No durable platform admin audit browser, alerting/on-call panel, tested whole-platform recovery or customer deletion workflow. |

A read-only owner overview at `/studio/soraspace-admin` organises this work. It is a readiness inventory, not live telemetry or a functional super-admin backend.

## 1. Roles and privileged access

Recommended roles:

| Role | Intended authority | Deliberate restriction |
| --- | --- | --- |
| Platform owner | Business ownership, staff-role policy, emergency process, high-impact approval | No automatic customer-content session or raw payment/storage secret viewer |
| Platform administrator | Customer lifecycle, plans/quotas, feature rollout, domain operations | Cannot transfer platform ownership, grant self owner, silently impersonate or inspect secrets |
| Support agent | Customer metadata and consented diagnostics; approved temporary assistance | No payments, role escalation, broad exports or routine private-content access |
| Billing operator | Subscription events, verified payment status, refund/credit workflows | No customer documents or unrelated merchant funds |
| Security operator | Incidents, session revocation, abuse investigations and quarantine | Bounded purpose, audit and data minimisation; cannot silently give themselves billing/owner powers |
| Release/operator service | Scoped build/job/backup operations using separate service identities | No interactive owner session or unrestricted shared administrator credential |
| Customer workspace owner/admin/editor/viewer | Their own workspace/site authority | No platform control plane, other customers or platform billing configuration |

Server-side capability checks must enforce every action, not merely hide menu items. Keep platform roles distinct from tenant memberships and app entitlements. Recheck actor/target scope at execution, expire sessions, revoke role grants and block stale UI/network replies. Preserve last-owner access; ownership transfer needs authenticated handover, audit and a recovery procedure.

Before privileged customer operations: verified MFA/passkey or equivalent supported step-up path, short admin-session lifetime, rate limits, separate recovery factors and a tested owner recovery drill. Actual identity-provider support must be qualified; this is not currently delivered by adding a checkbox. Register separate production/staging service accounts and keep recovery codes outside the app. Never display passwords, refresh tokens, encryption keys or raw card details.

For irreversible/high-impact operations require target summary, reason, scope, fresh re-authentication, typed confirmation where useful and a delayed/recoverable step. For a solo operator, a second independent approval cannot be assumed; require out-of-band owner notification and a controlled delay instead. As staff grow, require dual approval for owner transfer, broad data export/deletion, credential rotation and payout changes.

## 2. Customer and workspace lifecycle

Required controls: search by immutable ID/email/domain, verified-account state, workspace owners/members, plan and entitlement source, created/last-active times and relevant health indicators. Show metadata by default, not document contents.

Actions:

- Invite, verify, approve, suspend, reactivate and close accounts/workspaces independently, with reasons and expiry on temporary suspensions. Distinguish identity, workspace and app blocks.
- Manage workspace owner/member roles and invitation expiry/revocation; prevent self-escalation and loss of the last owner. Do not silently merge accounts or transfer files because emails match.
- View/revoke active sessions, app launches and desktop activations. Document that an offline ticket remains valid until its bounded expiry; a button cannot guarantee instant offline revocation.
- Admin-assisted email/account recovery through supported verified provider flows, with anti-takeover checks and customer notice. No administrator password-view feature.
- Export, close, schedule deletion, cancel a deletion within policy, and restore where retained. Show active subscriptions, owned domains, teams, digital orders and pending jobs before closure.
- Keep a verified account/recovery shell available after paid editing expires. Current legacy access can block that shell when the last app grant disappears; fix this before billing enforcement.

Invitation-only/manual approval is the safe current operating mode. Eventually configure signup policy separately from grant policy: `closed / invitation / open` registration and `manual / billing-driven` access, with explicit pending state, no self-granted subscription, audit and a reversible rollout. “Automatic” must mean verified backend grants, not a browser field. Never bypass release gates because signup is open.

## 3. Plans, subscriptions, licensing and usage

Admin needs a versioned product catalogue: app/platform membership, publishing allowance, domain/member/storage/traffic/processing quotas, currency, tax presentation, effective dates and available sales channels. Existing app-bundle names/manual presets are distinct from whole-product SKUs. Preserve contracts and existing subscriptions when changing a future price.

Control trial eligibility/duration, start/expiry, paid-through date, renewal/cancellation, recovery/read-only periods and source-specific manual grants. Every manual grant/extension needs actor, reason, start/end and an audit record; it must not overwrite paid or other manual grants. No permanent founding discount; Claudia's direction is at most 25% for the first year, with proposed implementation on the first annual payment. Final product pricing remains a separate decision.

Billing controls: provider-bound customer IDs, checkout intents, webhook verification/health, idempotency, duplicate/out-of-order event review, reconciliation, failed-renewal retry status, invoices/receipts, refunds/credits/chargebacks and payout reconciliation. A redirect or checkbox is not payment proof. Hosted processor handles card details. Sandbox/live separation and provider approval are release gates.

Desktop licensing: supported builds, signed issuer/key rotation policy, device names/last seen, transactional activation limits, removal/recovery and bounded offline tickets scoped to account/app/entitlement. No hardware fingerprinting assumption or claim that public GitHub binaries cannot be copied. Native enforcement requires Claude's app builds and acceptance.

Usage controls: metered bytes/requests/egress/image processing/active members and limits, with timestamps and source. Set per-tenant budgets, warning thresholds and soft/hard limits. Stop expensive new work before denying recovery reads. Never label unknown provider capacity as zero or promise unlimited resources. Anti-abuse/rate limits apply independently of billing quota.

## 4. Customer websites, publishing and domains

Site controls: owner/workspace binding, private draft/public snapshot, template version, enabled pages, navigation/homepage, per-page highlights, brand assets, SEO metadata, sitemap/feed and publication history. Templates need availability and compatibility rules; changing design must preserve content. No arbitrary customer script/theme uploads in the first release.

Publishing actions: preview under authenticated no-store access; explicit publish/revert/unpublish; per-site pause; limited operator quarantine for abuse. Turning a page off must also stop its direct public route, associated private-only assets, feeds/search and sitemap exposure. Cached published versions require purge/versioned keys. A UI checkbox or draft record alone is insufficient.

Domain controls: reserved subdomain list (`www`, `app`, `api`, `admin`, `auth`, `mail`, etc.), ownership challenges, verified hostname-to-site bindings, status/expiry, collision checks, pending transfers, certificate issue/renewal warnings, safe removal and reassignment. Reject unknown Host/forwarded headers; do not trust a browser-selected tenant ID. Preserve registrar ownership and email DNS; do not request customer registrar passwords.

Keep authenticated management on one canonical platform origin. Customer custom domains host published sites and link to Edit in SoraSpace. Cookies do not automatically span unrelated customer domains. Before offering automated customer domains, qualify provider API permissions, certificate scale, plan limits, costs and takeover prevention. Root/www/app platform domains and customer site domains are distinct routing concerns.

## 5. Apps, templates and release management

A versioned app/template registry must show accepted version, platforms, build provenance/checksum, capabilities, current release gates, beta cohort and compatibility. macOS remains planned/visible, not falsely available. App preview access, desktop downloads and editing entitlements remain separate.

Controls: stage → beta cohort → promote, freeze rollout, pin accepted version, roll back with preserved data/origin compatibility, disable a broken integration or new launches, and provide a status notice. Signed/verified artifacts and a tested launch allowlist are required. Native builds stay with Claude; platform admin must not silently mutate app manifests or Kōbō cloud folder names.

Website/template releases need versioned schemas and migration plans. Preview template updates, record compatibility, keep prior snapshots and test imported drafts. A code rollback cannot safely undo an incompatible data migration; prefer additive changes and staged migration with restored-copy acceptance.

## 6. Storage, recovery, privacy and residency

Metadata view per customer: connection provider/account identifier (minimised), permissions/read-only/writable state, last successful check/sync, relevant version/index status and supported storage scope. Display exact file/provider/backup/relay/index/key/log locations independently, with evidence date and unknown states. A provider being European does not make the whole platform Europe-only or exempt it from US jurisdiction.

Controls: disable a broken adapter, restrict to read-only, revoke/re-authorise through supported provider flows, diagnose redacted sync errors, scope temporary access and show the effect of account/connection changes. Never expose tokens or connect using a customer's primary password. Provider endpoint validation, SSRF limits and atomic-write capability tests remain mandatory.

Backups need a coverage matrix: original file chunks/manifests, document revisions, private indexes, tenant/membership data, published snapshots/media, orders/licences, keys/recovery methods and configuration. Metadata-only or index-only backup is not “all data backed up.” Set schedules, retention, encrypted target, restore point and verified coverage; monitor failures and capacity.

Restore controls must preview affected tenant/scope, restore into an isolated copy first, verify hashes/manifest/index consistency and account bindings, then explicitly reconcile. Never restore one customer's backup over another or overwrite live original heads blindly. Run scheduled drills and record recovery time/objectives based on measured results, not invented guarantees.

Data exports/deletions: verify requestor and ownership, include only authorised scope, rate-limit and expire download grants, track third-party retention and backups separately, record deletion receipts and holds. Legal hold requires a policy, restricted reason/access and retention, not an indefinite hidden exception. Secrets and other customers' content must not enter exports or support logs. Publish privacy/retention/subprocessor information before customer onboarding.

## 7. Support and security operations

Default support view: account/workspace IDs, plan/grant state, connection health and redacted error IDs. Do not send private documents, full filenames, OAuth codes or tokens to analytics/session replay. Provide correlation IDs without a secret-rich raw-log download.

Content access, if necessary, uses a time-limited, purpose/tenant/resource-scoped grant with owner consent when appropriate, visible support banner, staff actor attribution and an audit trail. Prefer customer-supplied redacted diagnostics. No invisible “log in as customer” feature. Emergency access is a separate step-up, tightly logged process; applicable exceptions must follow a documented policy.

Incident controls: revoke sessions/launches/credentials, isolate a tenant/integration, disable new writes or signup, communicate status, preserve evidence and perform recovery. Include secret leak, malicious upload, data crossover, compromised staff and provider outage drills. Security reports, patch ownership and response contacts must be assigned. Credential rotation must be staged with recovery; old backups/active libraries can depend on old encryption keys.

Content/abuse queue for public websites: report, triage, evidence/reference, narrowly scoped takedown/quarantine, customer notice, review/appeal and restoration. Stop public serving without deleting private originals unnecessarily. Include copyright/phishing/spam/malware and resource abuse. School/under-age eligibility needs an explicit policy before targeting minors; no institutional/research compliance certification is implied.

## 8. SoraShop and merchant controls

Keep the platform subscription ledger separate from each merchant's shopper orders. HobbyNest is Claudia's merchant, not the default beneficiary of other sellers' funds. Merchant onboarding/processor permissions, business verification and any marketplace/payment-facilitator requirements need provider qualification.

Controls per authorised merchant: physical/digital channel state, catalogue/variants/stock movements, print lead times/filament, weights/dimensions, tax/shipping settings, discounts/codes, orders/reservations, payment/refund status, tracking, returns and private versioned digital-download grants. Live/test modes must be obvious. Platform operator may pause new checkout/unsafe files while retaining receipts and necessary fulfilment/recovery access.

Protect transactional stock/reservation/order invariants, webhook reconciliation and refund-to-original-payment behaviour; a paid success page must not deduct stock or grant STL rights by itself. Control per-merchant secrets using the provider's supported delegated connection, with no raw token viewer. Finite stock races, lost replies, partial dispatch/refund, revoked downloads and restored orders all require acceptance before checkout.

Platform commissions, connected-account payouts or routing other merchants' funds are not approved by naming SoraShop. No blanket refund across tenants or automatic merchant-account substitution. Current HobbyNest store controls are owner-only preparation, not this merchant platform.

## 9. Global operations and emergency controls

Separate granular switches: new signup, new trials, new checkout, new app launches, provider writes, public-site publishing, shop physical/digital sales and existing reads. “Maintenance” must not indiscriminately sign everyone out, strand paid files or delete content. Every switch needs scope, actor, reason, duration/auto-expiry, user message and rollback behaviour.

An operations page should show measured status of auth, database, object storage, sync, job queues, email, callbacks and certificate renewal, plus last update/timezone. Use unknown/stale/failed states honestly. Add queue depth, retry/backoff/dead-letter review and idempotent scoped replay; no “replay all” button without a plan. Alert on unusual spend, login abuse, repeated tenant denials, restore failures, payment mismatch and private-data exposure.

Manage platform defaults, approved regions/providers, mail sender configuration, service announcements, accessibility/system appearance defaults and supported browser versions. Validate changes in staging, version configuration, use least-privilege services, and preserve prior good settings. No server secret in a front-end environment variable or Git commit. Git/Netlify/DNS administration remains outside the app unless a secure scoped integration is explicitly built.

## 10. Audit and reporting

Every privileged mutation needs timestamp, staff/service actor, effective role, tenant/target, action, reason, before/after or safe diff, request/correlation ID and outcome. Denied attempts, role changes, support reads, exports, restores, billing overrides and emergency switches are events too. Do not put private document bodies or secrets in the audit payload.

Store audit append-only to runtime, access-controlled and retained with a tamper-evidence/independent backup strategy appropriate to the service. Database-operator access remains a separate trust boundary; do not call a mutable SQL table absolutely immutable. Export audit by authorised scope; review privileged access periodically and monitor missing event writes. Operational actions should fail closed if required audit cannot be committed atomically.

Financial reporting uses reconciled processor data: active paid subscriptions, recognised cash/refunds/tax/fees as appropriate, churn/failure states and currency-aware totals. Usage/health reports must separate trial, manual and paid accounts; do not infer revenue from legacy checkboxes or display sample numbers as telemetry. Minimise identifiable analytics and define retention/access.

## Release gates and implementation order

| Gate | Required before |
| --- | --- |
| Current owner previews | Owner-only auth/CSRF, account fencing, private no-store, safe text/assets, CAS conflict handling, no public publication path. These do not require enabling customer admin powers. |
| Invitation beta with multiple customers | Real tenant/identity provisioning and lifecycle; fresh role checks; MFA/step-up for any exposed staff powers; safe low-privilege DB roles; tenant isolation across bytes/metadata/previews/jobs/exports; audit; rate limits/quotas; functioning recovery shell; backups and an isolated restore drill; support/incident contact. |
| Public customer publishing/custom domains | Verified host binding/TLS lifecycle; publication snapshots and direct-route/feed/cache/asset isolation; domain collision/removal checks; reports/quarantine/appeal; privacy/retention/export/deletion processes and abuse controls. |
| Paid subscriptions | Final products/prices/terms, provider approval, hosted checkout, verified idempotent billing/reconciliation, entitlement expiry/recovery, invoices/refunds/grant audit, limits/cost alerts and native licence acceptance where sold. |
| Multi-merchant SoraShop | Merchant verification/delegation, transactional stock/order/payment ledger, scoped reconciliation/refunds/payout model, private digital delivery, consumer/shipping/licence policies, order and restore drills. |

Build next in this order:

1. Maintain this compact read-only readiness overview; keep prototypes clearly labelled.
2. Define a small platform action catalogue and staff-role matrix, then qualify the production identity/MFA/database/backup combination. No provider is selected or provisioned by this assessment.
3. Implement the invitation beta's provisioning, membership/owner lifecycle, audit and recovery shell. Exercise hostile tenant/staff tests before enabling writes in admin UI.
4. Add safe customer metadata/support and scoped operational controls; then publisher/domain controls with real telemetry.
5. Add commercial billing and later merchant controls only as those products pass their gates.

## Acceptance examples for future admin work

- A workspace owner cannot become platform staff through profile fields, purchase, imported JSON, hostname or an edited request. A support role cannot refund or promote itself.
- Removing a role/revoking support access blocks the next protected operation and late replies do not restore private content in another account's UI.
- A paid expiry preserves authorised recovery access; an app-specific suspension does not remove unrelated manual grants or private files.
- A disabled page is unavailable through direct URL/feed/cache/asset routes; a disabled shop channel refuses backend checkout even when a stale basket button is enabled.
- Domain ownership changes, tenant restores and identical file IDs across customers cannot cross-bind data or redirect login credentials to a customer domain.
- Failed/duplicate billing callbacks and admin retries cannot double-charge, double-refund, duplicate stock or silently rewrite a plan.
- Support access and emergency operations require fresh scope and write an attributable audit event; audit or permission failure causes no partial action.
- Platform-wide changes show affected scope, staged rollout, rollback and recovery, with functional phone/tablet/keyboard access. No secret is emitted in HTML, client storage, logs, reports or exports.

Open decisions are implementation dependencies, not blockers for the current owner editor: actual identity/MFA provider, transactional DB/object store regions/cost/backup terms, paid products and quotas, support/retention policy, and merchant onboarding model. We can continue isolated implementation while those are qualified, without enabling multi-customer sales or data access prematurely.
