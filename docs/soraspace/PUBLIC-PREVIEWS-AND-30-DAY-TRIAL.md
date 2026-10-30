# Public app previews and proposed 30-day trial

30 October 2026, Sydney.

## Delivered public funnel

The SoraSpace splash's six app tiles and four web-preview cards lead to public information pages, not protected app routes. The first main action explores the previews. Existing Sign In and clearly labelled workspace shortcuts remain for returning users.

Preview pages are at `/tools/fumi/`, `/tools/tsuzuri/`, `/tools/hikari/`, `/tools/irodori/`, `/tools/tayori/` and `/tools/goban/`, with corresponding paths in all sixteen interface locales. Each includes the Sora name/Japanese companion, illustrative UI, feature highlights, availability notes, pricing/back links and signup. There is no app bundle, iframe, session check, private data, working editor or public installer on these pages. Mock-ups are explicitly illustrative, not accepted-build screenshots or feature-parity guarantees.

Web-app signup links carry an allowlisted `app` starting point (`fumi` → Docs, `tsuzuri` → PDF, `hikari` → Photos, `irodori` → Image), preselecting that requested service. Users can change all service choices. This is a request, not a paid subscription or capability grant. Mail and Sheets remain desktop/in development; their previews use generic signup without implying that a web app or installer is ready.

Registration still follows the existing enablement flag, email verification and manual approval. Current app launch routes, authorization and saved files are unchanged. Language selection preserves the product path; metadata and sitemap cover each public preview variant. The static build/ZIP includes these pages without deploying a new backend or changing DNS.

## Recommended trial policy — not activated by this change

Recommend a **30-day trial with no payment card required**, starting when the verified user's first eligible app access is activated. Do not start the clock while a user is awaiting approval or an unreleased app. This recommendation has not enabled trial grants, expiry, automatic approval, paid checkout or a public 30-day availability promise.

Before advertising and enabling it:

1. Confirm what the base trial includes, which ready services can be selected, quotas and account eligibility. Unreleased apps, research, Projects and commerce stay clearly planned. Adding a service must not silently restart the account trial.
2. Stamp activation and expiry on the server against the verified account; browser-editable metadata, query parameters and clocks cannot grant or extend access. Do not retroactively expire existing testers or owner access.
3. Enforce trial permissions consistently at web launch, APIs, saves/exports and licensed desktop entry points. Coordinate signed/offline licence behaviour with Claude. A marketing countdown alone is insufficient.
4. Explain the exact expiry date, included services, limits and price of any upgrade. No-card expiry must not trigger a charge. Subscription checkout, total pricing and payment consent are separate actions.
5. Define an export/recovery path for the user's own work before restricting editing, together with retention/deletion, reminders and account cancellation. Do not delete or hold original files hostage at trial expiry.
6. Allow service changes, with a clear effect on trial time and any later paid renewal/proration. Keep ownership, trial status, capabilities and billing-provider events separate.
7. Test boundary times, repeated requests, verification/approval delays, revoked/suspended accounts, app readiness, native offline use, cancelled checkout, failed payment and migration of existing accounts. Monitor abuse with proportionate signup/quota controls.

Current signup copy accurately offers the approved free preview. It does not say a functioning automated 30-day trial is available. Publish that offer after these requirements are implemented and the trial policy is confirmed.
