# Fitness connections for Explore

Claudia's requested order starts with Strava, and includes Komoot, Garmin, Google Fit, MyFitnessPal and Xiaomi. The public website and Kōbō releases need not wait for these integrations. `/settings/connections` now lists all six, with distinct readiness information. **Strava’s read-only OAuth and selected-activity preview are now implemented, but remain disabled until administrator configuration and real-provider acceptance.** The other five direct connections are not implemented. GPX viewing and route-derived statistics work now; neither GPX nor Strava preview is a persisted activity history or automatic background sync. See `STRAVA-SETUP.md`.

## Research status

The implementation inventory is verified against the repository. Fresh requests to official provider/developer pages were attempted on 28 October 2026; every request was refused by this environment's network proxy with tunnel HTTP 403. See `SOURCE-CHECKS-2026-10-28.json`. The feasibility assessment below uses known integration models, not a freshly completed review of current commercial terms, admission rules, pricing, quotas or current endpoint availability. Verify those with each provider before implementation or consent scopes are frozen. Do not use unofficial password-scraping integrations as a substitute for approved access.

| Provider | Proposed data/use | Integration path to validate | What must happen first |
| --- | --- | --- | --- |
| Strava | Selected activities, routes, distance, elapsed/moving time and source elevation | Dedicated OAuth application and documented activity/stream APIs; begin read-only | Register app; review current API agreement and allowed display/retention; confirm test-athlete/production capacity and required approval. |
| Komoot | Planned tours/completed routes for trip planning | Approved documented partner access; GPX import where the user's account permits export | Confirm a supported integration/partner route. Do not assume an unrestricted self-service developer API. |
| Garmin Connect | Recorded activity files/routes; later separately consented wellness data | Garmin Connect Developer Program, with Activity/Health access as appropriate | Apply for approved programme/data access and confirm commercial terms. Existing GPX preview is a manual fallback; FIT/TCX import is not implemented. |
| Google Fit | Android activity/wearable summaries | Assess Android Health Connect with a companion app, rather than starting new work on deprecated Google Fit developer APIs | Verify current Fit retirement/export status, Health Connect policy, Android packaging and which source apps actually write the requested data. Website OAuth cannot directly read a phone's Health Connect store. |
| MyFitnessPal | Optional nutrition/energy information alongside activity summaries | Approved partner API or an explicitly supported user export | Confirm access and permitted uses. Do not assume open developer registration or treat nutrition entries as GPS routes. |
| Xiaomi | Activity/wellness information from a wearable | Supported Mi Fitness/Zepp Life export, Health Connect if supported by that app/device, or approved Xiaomi/partner access | Confirm the wearable model and companion app first. Mi Fitness and Zepp Life are distinct ecosystems; a supported path for one does not establish it for the other. |

Official starting points (their current content was **not** retrieved here):

- Strava: https://www.strava.com/settings/api ; https://developers.strava.com/docs/getting-started/ ; https://developers.strava.com/docs/authentication/
- Garmin: https://developer.garmin.com/gc-developer-program/overview/
- Google Fit: https://developers.google.com/fit ; Health Connect: https://developer.android.com/health-and-fitness/health-connect
- Komoot: https://www.komoot.com ; MyFitnessPal: https://www.myfitnesspal.com ; Xiaomi: https://www.mi.com/global/

## First delivery: Strava, selected imports

1. Register a dedicated Explore application at Strava's official application settings. Use the production website `https://www.claudiagilbert.com`; the intended callback **domain** is `www.claudiagilbert.com` (a hostname, not a full URL). Do not reuse Google Drive client credentials. The implemented callback is `https://www.claudiagilbert.com/api/fitness/strava/callback`; server-side variables are `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_REDIRECT_URI` and the explicit `STRAVA_ENABLED=true` switch. These are not configured by the code deployment. Do not paste secrets into chat or source control.
2. Review current scopes and terms. Start with the narrowest read-only activity access that supports the selected imports. Private activities and heart-rate/health data are separate decisions, not automatic permissions. Confirm the allowed number of athletes and any production approval requirements; a test account connecting successfully does not establish subscriber-wide access.
3. Build server-side authorization-code exchange, one-use expiring state tied to the current Explore account/browser, encrypted per-account tokens, safe refresh-token rotation, reconnect/disconnect fencing and provider revocation handling. Use the existing encrypted-credential patterns in a separate fitness namespace, not a document storage connection. Never accept a client-supplied athlete ID as ownership proof.
4. Deliver a private activity picker and explicit import/preview. Fetch only documented endpoints, with pagination, response/geometry bounds, rate-limit handling and a clear last-refreshed time. A missing GPS route remains missing. No upload/write-back or automatic journal publication in the first version.
5. Verify retention rules before persisting data. Implement provider-required deletion/privacy updates and deauthorization reconciliation/webhooks before retaining a long-lived cache. Disconnect revokes tokens and explains data removal. Moving provider-derived data into a journal is not a loophole around provider restrictions.
6. Test real consent with the approved test athlete after offline tests pass. Then test two users, revoked/expired tokens, cancelled consent, login/account changes during consent/import, throttling, large/partial tracks, duplicate activity imports, provider privacy/deletion changes and disconnect while importing. Enable broader use only after actual app capacity/approval is confirmed.

## Shared activity model and display

Keep provider adapters behind a common private activity interface: provider and provider-account ID; remote activity ID; Explore owner ID; activity type; source time/timezone; metres of distance/ascent; elapsed and moving seconds as **different fields**; optional bounded geometry and elevation samples; source URL/check time; consent/source/availability metadata. Missing metrics stay null, rather than being fabricated from names, grades or average speed. Do not present DEM terrain enhancement as measured exercise elevation.

Weekly/monthly summaries need a real private activity store and the user's chosen timezone. Browser GPX preview is ephemeral and must not be silently counted as a completed workout. A planned Komoot tour and a completed Garmin activity are different records. A ride mirrored from Garmin to Strava must not be counted twice: use provider-scoped IDs and an explicit primary-source/duplicate policy; do not silently merge unrelated users or similarly named routes.

Only request data that serves an actual feature. Route planning needs geometry; it does not automatically need heart rate, sleep, weight or food diaries. Those later additions need separate controls and deletion/retention design. Keep connected activities private to their owner; public route/journal sharing is a separate, provider-permitted action with location privacy controls.

GPX imports stay useful while partner access is pending. FIT/TCX support would require bounded parsers, validation and integrity tests before being advertised. Manual user exports and provider-derived API data must retain distinct provenance and obligations.

## Practical sequence

First finish the live website/account smoke checks. Next verify Strava's current documentation and register the application. Build selected-activity import and real totals before background sync. In parallel, request Garmin access, clarify Komoot/MyFitnessPal access, and establish the Xiaomi device/app. Health Connect needs a separate Android companion workstream; it is not a website toggle or an existing Kōbō app capability. No provider credentials, grants, API approvals or paid services have been created by this work.
