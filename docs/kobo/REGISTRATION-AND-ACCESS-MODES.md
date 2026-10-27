# Registration and access approval: next-stage plan

28 October 2026. This is a concrete implementation/testing plan, **not a claim that public sign-up or billing has been enabled**. Netlify remains invitation-only and existing per-app access grants remain manual.

## Separate controls

| Administrator control | Choices | Effect |
| --- | --- | --- |
| Registration | Invitation only / Open sign-up | Who can create an Identity account; open sign-up still requires email verification. |
| Access approval | Manual / Subscription-managed | How verified accounts receive app/desktop entitlements. |

Defaults remain Invitation only + Manual. Subscription-managed must be unavailable until a billing provider, verified webhook processing and entitlement mappings are configured and tested. A front-end toggle must never pretend that Netlify registration changed: the dashboard/provider registration setting remains authoritative and needs a verified read-back.

## Open registration with manual approval

1. Publish and test sign-up, email verification, sign-in, password recovery and sign-out on an isolated/test environment before changing the live Identity registration setting.
2. A new verified account starts **Pending access**, with no app, desktop, content or owner capabilities. It sees an explicit awaiting-approval page and its own account settings, rather than an unexplained permission error.
3. Notify the owner in the administrator UI; do not send automated email without configuring/authorizing it separately. The owner chooses an app bundle, Desktop/Web access and optional per-app overrides in compact People & access.
4. Revalidate grants on every protected launch/download. Pending, suspended, unverified and revoked accounts cannot launch apps or retrieve another account's files.

## Subscription-managed access later

A confirmed server-to-server billing event—not a checkout return URL or client profile field—creates, updates or revokes the appropriate app entitlements. Web plans include the corresponding desktop downloads. Student eligibility/discount is separate from which apps are granted.

Required before enabling the toggle: verified webhook signatures; idempotent/out-of-order event handling; trusted product-to-bundle mapping; renewal/expiry/cancellation/refund handling; explicit grace/offline policy; cross-account binding; audit history; operator visibility of failed events. Keep owner access permanent and define manual overrides clearly so a delayed webhook cannot undo a deliberate suspension or grant administrator privileges.

Disabling automation does not silently give everyone access or reinterpret existing paid licences. Preserve existing grants and payment records, show the current source of each grant, and require an explicit policy for existing subscribers. Billing failure must not turn into unrestricted access.

## Acceptance checklist for that implementation

- Invitation-only mode refuses uninvited registration; open mode lets a new person register and verify without receiving app grants.
- Verified pending users see a clear approval state; unverified email, forged roles, userMetadata and client-side checkout success cannot grant access.
- Owner manual approval/revocation applies to fresh downloads and app launches; site/content permissions remain separate.
- The automation switch is blocked while billing prerequisites are absent. Test signed, replayed, invalid and out-of-order payment events before enabling it.
- Test expiration, cancellation, suspension, account changes during checkout and administrator override precedence.
- Check all sign-up/pending/approval screens at phone and tablet sizes and preserve the compact layout.

No payment provider or subscription price has been selected or integrated by this plan. Desktop runtime licence enforcement is still separate work with Claude; a public installer link can be shared.
