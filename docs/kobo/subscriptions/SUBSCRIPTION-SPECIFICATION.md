# SoraSpace subscription specification — proposed first release

29 October 2026 (Sydney). Reviewable implementation proposal, not a commercial launch. **Explore stays on Netlify. Existing access, apps, files, checkout and registration settings remain unchanged.** SoraSpace is the chosen suite name, with intended address `https://www.soraspace.studio`. Domain setup is a separate pending cutover; product and app identifiers remain independent of the name.

The user has agreed to no permanent founding discount and a maximum 25% reduction for the first year. Prices, bundle membership, trial/device limits, grace periods and provider selection below are recommendations for approval before checkout goes live. Claude’s attached licensing draft is input to this proposal, not an instruction to enable billing or proof of native licence enforcement.

## 1. Recommended products and prices

Suggested Australian retail amounts, including Australian GST where applicable. Amounts are AUD; local currency and tax-inclusive checkout behaviour must be configured and verified with the merchant of record. Do not assume a currency conversion or add GST again to an already inclusive display price.

| Bundle | Membership for this revision | Desktop monthly / annual | Web + Desktop monthly / annual |
| --- | --- | --- | --- |
| Office | Fumi, Goban, Tayori | A$4.99 / A$49 | A$7.99 / A$79 |
| Office Pro | Office plus Tsuzuri | A$7.99 / A$79 | A$11.99 / A$119 |
| Photography | Hikari, Irodori | A$6.99 / A$69 | A$10.99 / A$109 |
| Complete | The six apps listed above | A$12.99 / A$129 | A$19.99 / A$199 |

This retains Claude’s Office/Office Pro membership; it does not turn the existing Student/Worker preset into a paid product. Those manual presets still start with Fumi and Tsuzuri. Keep Power/Creator/Student/Worker as administrative conveniences, separate from commercial SKUs.

All proposed products remain **not for sale**. Each requires accepted app builds and its own licence/availability checks. Goban and Tayori currently have no registered web engine: the web tier includes their desktop apps, not invented browser versions. Show per-app platform availability beside every plan. Do not sell a bundle on the strength of planned features. Photography is a possible first paid cohort once both apps pass acceptance; Office/Complete need their own readiness decision.

Design and Media stay off sale until useful accepted apps exist. Presentations, page layout, CAD, video and audio are not silently included in a contractual six-app Complete product. New bundle definitions receive a new immutable catalogue revision, with an explicit policy for existing customers.

**Founding offer:** recommend 25% off one eligible account’s first qualifying annual subscription payment, with the standard annual renewal price disclosed before purchase. No monthly discount, stacking, permanent discount or reset by cancelling, switching plans or buying another bundle. Recommended Complete first-year examples: Desktop **A$96.75**, Web + Desktop **A$149.25**, renewing at A$129 / A$199. The eligibility window and redemption constraints need configuration and acceptance; they are not enabled. Price helpers calculate display amounts only, not eligibility.

## 2. What customers buy

- Desktop is the lower-priced tier. Web + Desktop includes editing in accepted browser apps and the corresponding accepted desktop apps.
- One verified person/account may hold several bundles; access is their union. Never double-bill an overlapping upgrade without showing the choice and any credit.
- File storage is supplied by the user or an explicitly described site service. No included terabyte, unlimited retention or exclusively European processing promise is part of these prices.
- Much browser editing runs locally as WASM. The web premium covers the hosted workspace, storage bridge/index operations, reliability work and support; it is not a claim that every edit uses a server GPU.
- HobbyNest physical goods/STLs have a separate product/order ledger. They do not grant app subscriptions, and app access does not grant an STL commercial-use licence.

## 3. Separate manual, paid and trial grants

Store grants by source, not one overwritten capability checkbox. A paid grant ending must not remove an independent manual grant. Owners remain permanent under existing fresh identity checks; payment events can never grant owner, site publishing, user administration or other non-app capabilities.

| Priority | Result |
| --- | --- |
| Unverified/missing identity | No paid app access; sign-in/verification flow only |
| Verified owner | Existing owner policy, independent of purchases |
| Suspended ordinary account | Editing, downloads and new licence tickets denied regardless of grants |
| Explicit administrator app block | Overrides paid/manual/trial editing for that app |
| Valid grants | Union by app and platform, respecting start/end boundaries |
| No valid editing grant | Account/billing and authorised file recovery remain available |

Every route still verifies account ownership, capability and current app release gate. A licence to edit one app does not grant another app’s cloud files. Runtime capabilities are not evidence that a payment occurred. Manual audit records need actor, target, reason, source and expiry; `false` on a legacy checkbox must not ambiguously mean “remove a manual grant” and “block every source.”

Existing manual grants require an explicit migration snapshot before billing enforcement. Preserve non-app/site capabilities separately. Trial expiry, cancellation and late webhook delivery must not rewrite those grants.

**Important current-code gap:** `resolveActor` currently admits ordinary users through existing app/trip/community permissions. Removing the last app grant can also block settings/account pages. Before enforcing paid expiry, introduce a verified account shell for pending/expired subscribers, separate from app editing. Create an ownership-checked recovery/export route and read-only app launch/bridge policy. Simply denying `tools.*` is insufficient and could strand customers. Storage write operations must remain refused after expiry while supported recovery reads/exports remain possible.

## 4. Suggested trial, expiry and offline rules

| Situation | Recommended behaviour |
| --- | --- |
| Trial | One explicit, no-card, 30-day suite trial per verified account; accepted apps only; starts on “Start trial,” not merely sign-up |
| Active purchase | Editing until the paid-through boundary; web grants include desktop |
| Cancel renewal | Continue through the paid period, then recovery/read-only access; never delete libraries |
| Failed renewal | A maximum 7-day recovery grace after a previously paid period, only for recoverable payment failure; show update-payment action |
| First payment fails/pending | No paid grant; a separately valid trial/manual grant may still apply |
| Paused/expired | No editing beyond any legitimately paid interval; recovery preserved |
| Refund/chargeback | Reconcile the affected transaction/grant; unrelated purchases/manual grants survive. No automatic file deletion |
| Fraud/account suspension/device removal | Stop new grants/tickets immediately; already-issued offline tickets have a bounded revocation delay |
| Provider outage | Honour already verified, unexpired grants; never create indefinite access or invent a renewal |

Propose five registered computers per person across the suite. Do not count browsers as desktop activations, make per-app installs consume six separate slots, or use hardware fingerprinting. Device registration/release must be transactional and account-bound. Provide clear device names, last seen and “Remove device”; a retry must not consume a new slot.

Desktop tickets refresh roughly daily when online, with **at most 30 days offline**, capped by the applicable app grant’s actual end. Trial tickets cannot extend beyond trial end. Payment grace is applied once in the server grant calculation, not once more every time a ticket refreshes. A Hikari grant ending tomorrow cannot be extended by a longer Fumi subscription. If an app has overlapping valid grants, use that app’s permitted end. Cancellation immediately before renewal must not generate a fresh 30 days beyond the paid period.

Offline use means revocation is not instantaneous. Clock rollback and copied files are threats; a maximum `exp - iat` check alone does not solve them. Require trusted server time on refresh, retain the last signed server-time high-water mark securely, detect suspicious local time rollback and require reconnection. Describe remaining limits honestly. Upstream open-source binaries and modified clients are not made uncopyable by a website download gate.

## 5. Paddle evaluation and account binding

Paddle Billing is the preferred first sandbox candidate because merchant-of-record handling may reduce tax/payment administration. Merchant eligibility, current fees, payout currency, refund/chargeback terms, supported products and Store policy compliance still require confirmation. No account, product, discount, API key or webhook has been created here.

Official SDK source confirms separate sandbox/live keys/environments, subscription states, portal sessions, scheduled cancellation fields and bounded recurring-discount fields. It does **not** establish merchant approval, a current fee quote, product eligibility or the exact semantics of every payment event. See [source evidence](SOURCE-EVIDENCE.md).

Checkout starts from a fresh signed-in verified account. The server creates a short-lived checkout intent containing the immutable plan revision, selected interval, environment, owner account ID and allowed provider price ID. The server owns customer/subscription bindings. Do not identify purchasers solely by matching email, accept a browser-supplied customer ID, or use `custom_data.accountId` without validating the server-created intent and customer binding. An account switch during checkout must not transfer the purchase to the new browser session.

The provider-hosted customer portal is generated server-side for that account’s verified customer/subscription IDs. Never expose another person’s portal URL. Do not store card details in Explore. Auth/session/CSRF checks protect account actions; verified webhook signatures protect the external event endpoint.

## 6. Billing ledger and event processing

Recommend a small managed PostgreSQL ledger for transactionally consistent billing/device records, with functions hosted on existing Netlify. Provider, region, cost, connection pooling and backup/restore need review before provisioning. This does not move app files or change existing Blobs storage. It adds a billing database only after a concrete service is chosen; no price quote or new resource is assumed.

| Record | Required boundaries |
| --- | --- |
| Product/price mapping | Environment + immutable catalogue revision + bundle + tier + interval + provider IDs; never choose from client prices |
| Checkout intent | Account-bound, expires, one-time association, explicit plan and price |
| Customer/subscription binding | Unique provider object per environment; stable Identity ID; conflict cannot overwrite another account |
| Subscription projection | Verified state, paid-through, grace end, cancellation schedule, reconciliation revision |
| Grants and app blocks | Source-specific, start/end, revision, provenance; preserve manual grants |
| Event inbox | Unique environment + event ID, digest, received/occurred timestamps, processing state and attempts |
| Trial/founder redemption | Account-unique issuance/redemption; concurrency cannot issue a second trial or discount |
| Devices/tokens | Account-bound device ID, hashed refresh secret, rotation/revocation, transactional device limit |
| Audit/outbox | Actor/reason and idempotent follow-up actions, without credentials/card data |

Webhook sequence:

1. Read bounded **raw bytes**; verify the signed header and timestamp before JSON parsing or mutation. Check both old and excessively future timestamps, malformed headers, supported key rotation and constant-time signature comparison. Do not re-serialize JSON for verification. The reviewed SDK helper needs explicit adversarial tests; its presence alone is not a security acceptance result.
2. Durably insert/deduplicate the event in the correct environment before acknowledging success. On durable-write failure return a retryable failure. A queue/cache alone is not a billing record.
3. Reconcile the bound provider object and relevant payment history. A checkout return, `subscription.created`, or an `active` string by itself does not prove a successful charge or give unlimited paid duration.
4. Commit projection/grants/event result atomically. Deduplicate across crashes. Serialize reconciliation per subscription, re-fetch on conflicting/stale work and process refund/adjustment changes as well as subscription updates. Event timestamp ordering alone is insufficient.
5. Retry transient failures; display unresolved events to the owner. Periodically reconcile subscriptions to recover missing events. Never reset paid-through from a delayed old event.

Proposed operational targets: process normal events within one minute, reconcile every 15 minutes where due and perform a daily full consistency sweep. These are implementation targets, not a service guarantee or a scheduled job that already exists. Define retention, encrypted backups, restore exercises and redacted logging before production.

## 7. Safe automation controls

Keep registration policy, new checkout availability, payment environment and entitlement enforcement independent.

1. **Manual:** current behaviour. No billing dependency.
2. **Sandbox:** real test checkout/events with test credentials and isolated ledger. No live account capabilities change.
3. **Shadow:** compute projected grants and compare with manual permissions. Owner reviews changes; no enforcement.
4. **Paid cohort:** enforce only accepted app/plan combinations for explicitly enrolled accounts after migration and recovery acceptance.
5. **Wider sale:** open approved checkout products; preserve explicit tester/manual grants.

Closing new checkout must not stop webhook reconciliation or silently end existing paid rights. Turning off paid-grant application must not grant everyone access or discard purchases. “Rollback” means close sales/pause expansion and retain the ledger, key material and recovery-aware code—not revert to an older backend that forgets paid or recovered state. Audit all control changes.

## 8. Desktop contract for Claude to review

The earlier draft’s single `apps` array and one global expiry cannot represent Desktop versus Web + Desktop or differently expiring bundles safely. Propose an app-scoped desktop ticket and a versioned shared verifier; do not freeze a wire format before Claude reviews it.

- Browser-based sign-in with PKCE S256 and unpredictable `state`; one-time short-lived authorization codes; exact loopback `127.0.0.1` redirect/port/path validation. No password, token or private signing key in a command-line argument or URL query. Exchange codes over TLS. Restrict activation origins.
- A hashed rotating device refresh token in OS secure storage; reuse detection and account/device revocation. Rotation must handle simultaneous app refreshes without spuriously signing out the suite.
- Proposed signed claims: version, fixed issuer, app-specific audience, opaque account subject, device ID, app ID, desktop editing scope, issue/not-before/expiry times, entitlement revision and token ID. No owner/site capabilities; avoid unnecessary email in tickets.
- Use reviewed Ed25519/JWS libraries and strict algorithm/audience/issuer/schema validation. Private keys stay server-side; key rotation overlaps valid ticket lifetimes and supports offline verification. No production keys generated for this proposal.
- On expiry, preserve work and support opening/recovery/export where the app can do so. Block new paid editing without terminating a save halfway through or deleting local recovery data. File decryption/storage keys remain independent of licences; cancellation must never rotate or withhold a key required to recover a customer's files.
- Shared sign-in across separately packaged Windows Store apps is a separate implementation problem: verify MSIX identity/secure-store restrictions and use a reviewed broker/shared component if needed. Do not assume one app can read every other app’s vault. macOS remains Planned.
- Microsoft Store external billing/subscription/linking rules and each upstream distribution licence must be checked against current terms. Do not assume zero fees or that reserving a Store name proves compliance.

Website-side endpoints will be specified under brand-independent internal identifiers. No activation/token/refresh/device routes are delivered in this phase. See [Claude handoff](CLAUDE-LICENSING-HANDOFF.md).

## 9. Compact account experience

Proposed **Settings → Subscription**: one compact plan row with bundle, tier, renewal/end date and source; “Manage billing” for real subscribers; “Compare plans” when checkout is ready. During processing, show “Payment received; confirming access” only if provider evidence supports it. Otherwise show “Checking payment status,” with a refresh action. Do not show a fake active subscription based on the return URL.

Put devices in a collapsed list with remove actions. Explain manual/tester access independently of a paid plan. On phone/tablet use stacked rows and 44px actions, readable price/tax/renewal terms, no wide comparison table as the only route. App launchers show current editing versus recovery availability and the chosen file provider separately from subscription state.

No public pricing page, payment button or account subscription screen is added yet. That keeps unapproved prices and unavailable billing out of the current site.

## 10. Acceptance before taking money

- Catalogue/prices/membership and founder terms approved; product names, upstream notices and customer/refund/privacy terms reviewed. No unsupported European-jurisdiction claim.
- Real sandbox checkout, cancellation, failed initial charge, failed renewal, grace boundary, refund and dispute; correct prices/tax/renewals; return URLs cannot grant access.
- Replayed, invalid, old/future-dated and out-of-order events; lost database response, webhook retry, delayed reconciliation and manual changes during processing.
- Two accounts/customers, account change during checkout, attempted customer swap, unverified/pending/expired account shell and suspension precedence.
- No-card trial one-time issuance; overlapping bundles; separate desktop/web; unavailable apps refused; yearly/monthly change and upgrade/downgrade credits displayed before confirmation.
- Five-device race, retry-safe activation, removed device, stolen/rotated token, key rotation, offline trial end and exact paid period end. Wrong app/account/audience/tier tickets rejected.
- Existing libraries, original hashes, private index recovery, authorisation/account-change tests, expired-user download/export and no read-only write bypass.
- Native Windows acceptance and candidate-specific app enforcement; downloadable binaries alone are not proof. Phone/tablet billing/account screens tested on real devices too.
- Encrypted ledger backup restored in isolation, reconciled with the provider, owner recovery procedure and a compatible rollback recorded.

## 11. What this delivery contains

`server/subscription-catalogue.mjs` contains the proposed versioned product definitions and cent-based prices, all marked not sellable. `server/subscription-policy.mjs` is a pure policy prototype. Its tests cover grant unions, desktop/web scope, owner/suspension/block precedence, expiry, trials, malformed/wrong-account records and per-app offline limits.

Neither module is imported by production routes, authentication, app shells or checkout. They are not a payment integration, licence signer, device ledger, trial issuer or production authorisation service. Rollout defaults off; existing manual capabilities remain authoritative. The prototype accepts canonical trusted ledger grants, not raw Paddle events. Real payment/grace normalization, immutable older catalogue lookup and durable state are still required.

Verification: eight focused policy tests passed, and the full server suite passed **213 tests**. Production import inspection found references only within the isolated prototype and its tests. No runtime page or build configuration was changed; a production build was not repeated for this isolated design delivery. Real provider, desktop, device and billing acceptance remain pending.

## 12. Delivery order and next owner steps

1. Review this specification, especially bundle membership/prices and the proposed 30-day trial / five computers / 30-day offline / seven-day payment-failure grace.
2. Create a Paddle **sandbox** account if choosing Paddle; confirm product eligibility and current charges before any live agreement. Store credentials through the chosen secret-management mechanism, never in chat or the repository. No purchase is necessary for reviewing this specification.
3. Choose and quote the small billing ledger service; prepare an isolated environment. Build the ledger/event processor and mock-provider tests before connecting sandbox credentials.
4. Add verified pending/expired account access, safe recovery paths and the compact subscription/device UI. Run shadow comparisons against current manual grants.
5. Review the desktop wire contract with Claude when available. Run the native and real-provider acceptance gates before inviting the first paying cohort.
