# App access and subscriptions: proposed six-app design

29 October 2026 (Sydney). Design only: manual grants work today; no subscription checkout, automatic entitlement mode, Store purchase verification or native licence enforcement is delivered by this change.

## Separate the choices

Use bundles to choose **which apps**, and a platform tier to choose **desktop** or **web plus desktop**. A web tier grants desktop for the same app; desktop does not imply web. Available products, published binaries and permissions are separate facts. Tayori and Goban can have desktop grants but must never acquire a fictitious web route. macOS remains Planned until a real build is accepted.

- Power: all registered apps; enabling the preset is an explicit owner action, not an automatic grant to existing people or proof that every app has a release.
- Creator: Irodori, Hikari and Tsuzuri.
- Student / Worker: Fumi and Tsuzuri, as Claudia selected. Consider Goban and Akari when released; do not silently alter existing paid contracts.
- Power Creator: define its exact design-app list once those apps are ready. Do not charge for unavailable features or label an unimplemented bundle active.
- Overrides: explicit per-app desktop/web changes and expiry, with actor/reason/audit record. Owner access remains permanent and separate from purchase status.

Existing checkbox presets are convenience controls, not stored billing plans. A billing implementation should introduce versioned product-to-entitlement definitions and retain their revision in each purchase record, rather than guessing a person's plan from their current checkbox combination.

## Manual versus automatic

Keep registration policy (invitation/open), access policy (manual/subscription-managed), and app availability gates independent. Signing up or verifying an email must not itself create paid grants.

Manual mode: Claudia assigns account access. Subscription-managed mode: a verified payment provider supplies purchase state and a server-side entitlement ledger computes the paid grants. Preserve explicitly recorded owner/manual grants and overrides; payment cancellation must not silently erase unrelated access. Show the source and expiry in the account editor so the same boolean cannot be unintentionally overwritten by competing administrators and webhooks.

A future toggle must report whether signing keys, price mappings, webhook reconciliation and native licensing are ready. It must not enable automation merely by changing a browser setting. Before switching modes, preview the exact affected accounts/grants and retain a rollback snapshot. This is a future implementation requirement, not a toggle shipped today.

## Billing implementation requirements

- Use provider-issued customer/subscription identifiers bound to the authenticated account. Server-side catalogue sets price and currency; success URLs and claimed purchase IDs are not entitlement proof.
- Verify signed webhooks, deduplicate events, handle out-of-order updates and reconcile periodically with the provider. Record event provenance without logging secrets/payment data.
- Define start/end, trial, payment failure/grace, cancellation, refund, chargeback and plan-change behaviour. Expired web access should preserve users' source files and offer an appropriate export/recovery route; no deletion of private libraries as a billing side effect.
- Test two accounts, suspended/owner accounts, repeated events, lost callbacks, clock boundaries and concurrent manual overrides. Automation defaults off until acceptance.
- Website download grants protect the website link only. Shared GitHub installers currently run without a subscription check. Claude must design signed native licence/offline-grace behaviour before desktop access can be described as subscription-enforced.
- Microsoft Store sales/licences are separate from website billing. Decide one-off versus subscription products and platform policies first. Linking a Store purchase requires verified Store entitlement plus a secure account-linking flow; a screenshot or browser-supplied receipt claim is insufficient.

## HobbyNest is separate

Physical goods and STL orders use the store's own catalogue, shipping, tax, licences and fulfilment. A HobbyNest purchase does not grant Kōbō app access, and an app subscription does not imply an STL commercial-print licence. Keep these product ledgers distinct even if customers later choose to link accounts.

See `REGISTRATION-AND-ACCESS-MODES.md` for registration policy and `DESKTOP-DOWNLOADS-AND-PLANS.md` for today's manual controls. Prices, billing provider, native enforcement and automatic access remain decisions to implement and accept separately.
