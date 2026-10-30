# Trial signup from a new email and service choices

30 October 2026 (Sydney). Claudia requested testing from scratch, followed by optional automatic onboarding later. This increment adds an explicitly approved, single-account website trial, not a production team-workspace/billing system.

## What is built

SoraSpace landing → **Create trial account** → `/studio/signup` on the existing Explore account origin → email confirmation → `/studio/welcome` approval/services page → owner-approved apps and/or private website editor.

The setup/editor capability is **`beta.soraspace`**. It admits a verified, non-suspended account without granting owner, settings/user management, site publishing or unrelated apps. It is granted only through the existing owner People & access tool. Fresh server checks and client account fences apply. The existing editor store/key names are retained for compatibility; every trial's draft is keyed by the verified identity hash with a stored identity binding. No customer-selectable tenant/account key is accepted. Two ordinary approved accounts are tested for independent private drafts.

This is a limited individual-account trial, not the multi-member tenant backend. Customer domain publishing, managed database onboarding, staff support access, billing and collaboration retain their separate release gates. Existing source documents describing the editor as owner-only are historical; the owner-or-explicit-trial guard is now authoritative.

## Claudia: two settings before trying a brand-new email

Both belong to **the existing Explore Netlify project `explorebyclaudia`**, which currently owns the account service and trial editor. **Do not enable a second Identity service on `soraspacestudio`.** The public landing only links to these authenticated routes.

1. In `explorebyclaudia`, open **Identity → Settings/Registration** (labels may vary). Change registration from **Invite only** to **Open** for the test. Keep email confirmation required: **autoconfirm off**.
2. Keep Identity's Site URL/confirmation return on the existing `https://www.claudiagilbert.com` account origin. Its home page already forwards confirmation hashes to the login handler, which redeems them. Do not send confirmation tokens to the static SoraSpace landing page. Do not edit email token placeholders blindly; verify the actual email link during acceptance.
3. Add **`SORASPACE_SIGNUP_ENABLED=true`** to `explorebyclaudia` environment variables for the production functions/runtime and build context, then redeploy. No secret value is involved. The default is closed if absent or not exactly `true`.
4. The `soraspacestudio` public project continues to need no environment variables or Identity settings. Its updated Create trial account link opens the existing account origin.

Important distinction: the environment flag controls our registration page/endpoint. Netlify Identity's own Open/Invite-only setting controls its underlying registration API. With Identity Open, someone could register directly at the provider even while our form is off; they still receive no editing/admin grants. To fully close self-registration again, set **both** the feature flag false and Identity back to Invite only. No unverified application flag is a substitute for provider controls.

Opening provider registration permits other people to create pending accounts too. It does not give them app or website-editor access. This is a manually approved test; abuse/rate protection, policy and provider configuration still need production qualification before general promotion. These provider settings and actual confirmation email delivery cannot be verified from this workspace.

## Test checklist

1. Use a separate browser profile or private window so your owner session stays separate. Start on `https://soraspacestudio.netlify.app/` (or the custom domain after HTTPS is ready).
2. Click **Create trial account**, enter a different email/name/password (not either designated owner email), select services and submit. No payment field is present. Password requires at least 12 characters, at most 72 UTF-8 bytes.
3. Check the verification email, including spam, and follow the link. Confirm its account-origin URL and that token hashes are removed by the SDK after redemption. A verification mail and provider account are real external effects only when Claudia enables registration and submits the form; automated tests mock these effects.
4. Sign in. A verified account without grants lands on **Your SoraSpace account**, showing pending approval, not a login/guard loop. Sign out, password recovery and service-choice access remain available there.
5. In your normal owner profile, open **My Studio → People & access**. Find the new email. Its requested services/verification are shown from the first 100 records in the trial review endpoint; full-scale pagination is separate work. A failed review read should not prevent existing permissions management.
6. Tick **SoraSpace website trial** and Save access to approve its own setup/editor. For requested apps, grant the corresponding web/desktop access separately; Hikari's additional beta gate remains separate. A request is not a payment, acceptance of an unready app build or automatic entitlement.
7. Return to the trial browser and click **Refresh approval status**. Open setup, generate a template, **Save & open editor**, edit and save. Verify this account cannot open SoraSpace Administration or People & access and cannot see your owner draft.
8. In **Account & services**, add/remove requested services and save. During this test they are requests for manual review. Existing grants do not change until you review them; do not present this as an active paid subscription cancellation.
9. Repeat with another test account, or compare owner vs trial. Check isolation, reload, stale save conflicts, logout/account switches and revoking the trial checkbox. Suspension denies editing regardless of the saved request.
10. Leave provider registration open only if you want pending registrations. Otherwise close it using both controls above; existing approved accounts continue to sign in.

## Service and payment boundaries

Current requests cover website/journal, Docs, PDF, Photos and Image Editor. Workspace account status is separate from paid editing. Shop, Research Library, Projects, Mail and Sheets are not made available merely by listing roadmap ideas.

Requested services are normalised identifiers in user metadata at signup, then versioned per-account private service-request records. User-editable metadata never grants access; only server-managed capabilities do. Every service change binds the current verified account and ETag, with bounded request bodies, Origin protection and fail-closed uncertain-save handling. No secret, password or raw card data is stored in request records or returned to review.

Later, registration openness, approval/provisioning policy and trial/subscription entitlement must be independent controls. Automatic onboarding needs a real provisioning transaction, quotas, idempotent grant/checkout intent and operational recovery. This increment deliberately stays manual: no flag turns a signup into an owner or an unverified paid grant.

Paid service additions/removals need a reviewed quote, currency/tax, effective date, recurring payment/cancellation state, refunds/proration policy, verified idempotent processor callbacks and recovery/export after editing expiry. Square/PayPal are candidates based on Claudia's preference; Google Pay/Apple Pay should be enabled through supported hosted checkout after merchant/region/recurring-payment checks. Availability/fees are not verified here. Hosted providers collect card details; no raw card form belongs in SoraSpace. No paid resource, processor product, webhook or charge is created by this increment.

## Test evidence

Server tests cover default-off signup, provider autoconfirm/disabled refusal, CSRF, payload/role rejection, no entitlement in signup metadata, unverified/pending/suspended status, own service preference CAS, isolated approved trial drafts, revoked grants and no administrator escalation. Browser checks use actual signup markup/controller and welcome controller with mocked Identity/email/account replies: chosen services, check-email state, pending approval, preference updates with no grant/payment, refreshed approval, account clearing and phone/tablet layout. Existing login, permission, editor and packaged deployment regressions also run. Live provider email and real-user signup still require the manual checklist above.

The public page now has separate Sign In and Sign Up buttons, a Pricing link with two proposed package directions (amounts unannounced), and app/research previews. The trial workspace shows its website shortcuts even if no separate app bundle has been granted. See [research and projects](RESEARCH-AND-PROJECTS-ROADMAP.md) for planned services and current desktop-only Zotero evidence.
