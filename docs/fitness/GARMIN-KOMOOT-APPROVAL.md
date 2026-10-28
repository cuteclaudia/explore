# Garmin and Komoot: integration and approval brief

29 October 2026 (Sydney). This prepares the next applications; it is not an assertion of approval or a delivered direct connection. Requests to the official Garmin developer overview and Komoot business site were attempted again today and blocked by this workspace's proxy (CONNECT 403). Current forms, admission criteria, pricing, quotas, licences and API details must be confirmed directly with the provider. Do not build against unofficial password-based endpoints.

## Shared product brief (ready to adapt for an application)

**Product:** Explore by Claudia, https://www.claudiagilbert.com. A travel/outdoor planning site with private account-based map previews. Planned commercial subscriptions; no partner approval or subscriber-wide provider access is assumed.

**Initial request:** User-authorized, read-only selection of GPS routes/activities to preview distance, ascent, elapsed time and an elevation profile. Planned tours must be distinguished from completed exercise. No uploading to the provider, auto-publishing to journals, AI training, advertising use, heart-rate/sleep/weight/nutrition collection, or sale of route data in this initial scope.

**Current implementation:** Manual GPX/TCX/FIT route previews, processed locally in the browser with 5 MiB / 20,000 point limits. Read-only Strava adapter exists behind configuration and acceptance gates. No persistent workout history or background syncing. Other provider rows explicitly show pending readiness.

**Security proposal:** Server-only per-Explore-account authorization, encrypted tokens in a separate provider namespace, one-use account/browser-bound consent, provider identity verification, request limits and account/connection fences. Secrets never in browser code. Reuse the Strava patterns only where they match the approved provider protocol; do not assume Garmin or Komoot uses Strava's OAuth/scopes.

**Privacy proposal:** Private by default; explicit manual route selection, clear attribution and no silent cross-provider merging. User disconnect and required deletion/revocation handling. Provider-derived history is not retained before documented retention/display rules and deletion mechanisms are implemented. Map services receive tile requests for viewed areas; exact locations can be sensitive. Update the site's public privacy notice to match the final approved flows before consent goes live.

## Garmin Connect

Starting point: https://developer.garmin.com/gc-developer-program/overview/

1. Claudia opens the official Garmin Connect Developer Program site and applies using her publisher/business details. Describe the initial activity-file/route use case above, expected launch audience and subscription intent. Provide the real privacy/support URLs and requested information; do not invent business credentials, API approval or user counts.
2. Ask which programme/API is appropriate for recorded GPS activity files (Activity access), whether selected user-initiated retrieval is supported, and whether wellness/Health access is unnecessary for this scope. Confirm developer/test access, production review, fees, quotas and supported delivery formats.
3. Obtain the approved integration documentation, sandbox credentials and consent flow. Establish whether delivery uses callbacks/push/pull, how events are authenticated, retry/duplicate identifiers, which file URLs may be fetched and their expiry. Never accept arbitrary download URLs from the browser; use documented hosts and validate redirect behaviour.
4. Confirm allowed private previews, display attribution, export/reuse, retention, account deletion/deauthorization and required notification/security terms. Record the agreement/version and any restrictions before persistence or public sharing is considered.
5. Implement the approved adapter separately from Strava and document storage. If callbacks deliver data, verify authenticity, replay limits, idempotency and owner mapping; returning a route requires the current Explore owner, not just a file or athlete ID.
6. Test sandbox and then approved real athletes: consent/cancel/revoke, delayed duplicate deliveries, expired file links, malformed files, no GPS, account switching and concurrent reconnect/disconnect. Roll out only within approved capacity.

**Usable while waiting:** Export a supported GPS activity file from Garmin using the account's own download features, then open the unzipped `.fit`, `.tcx` or `.gpx` in Explore. This is a view-only import, not ongoing Garmin sync; it does not import workouts into a retained history. Supported exports and menu names can vary.

## Komoot

Starting point: https://www.komoot.com (use its current official business/partner/contact route; the attempted business URL was https://www.komoot.com/business/).

1. Ask Komoot whether an approved partner interface is available for **both planned tours and completed tours**, and for a small commercial outdoor-planning website. Do not assume an unrestricted self-service API exists.
2. Send the shared brief. Ask for approved auth/data documentation, eligibility, cost/quotas, test accounts, production process, source attribution and whether the user's region/product/export entitlement limits route access.
3. Confirm whether turn instructions, surfaces, difficulty and elevation are available and licensed for display. Route geometry alone does not establish trail safety, current closures, climbing grades or ski conditions. Keep unsupported metadata absent.
4. Confirm retention, derived statistics, exporting, public journal reuse, required deletion and disconnect behaviour. A paid user's ability to export a GPX does not by itself grant Explore a partner API licence.
5. Only after documented access is granted: implement scoped consent, provider-account ownership, approved endpoints, bounded geometry and rate limits; test reconnect/cancel/revoke, unavailable/deleted tours, private tours and planned/completed distinctions.

**Usable while waiting:** A GPX export where Komoot permits it. Users obtain it through Komoot and open it locally in Explore; Explore does not scrape Komoot sessions or ask for the Komoot password.

## Decision and evidence to retain

For each provider, record: official contact/application reference, accepted developer terms/version, permitted APIs/data, approval and capacity, auth/callback requirements, quota/retry rules, retention/deletion/attribution rules, sandbox evidence, real-account acceptance and feature enable decision. Keep credentials in Netlify's server-side environment, not this document. No application was submitted or external message sent during preparation.
