# Fitness implementation handoff

Claudia asked for the connections to be built while she sleeps. The first deliverable is Strava's actual read-only server/browser flow, not another placeholder. The feature is disabled until its dedicated application credentials, callback and explicit enable flag are configured. See `STRAVA-SETUP.md` for exact steps. Nothing has been enabled or linked to Claudia's real athlete account from this environment.

## Delivered

- Dedicated native `/api/fitness/strava/*` routes for status, start, callback, activity list, route preview and disconnect, using existing fresh account authorization.
- Server-only OAuth code exchange and encrypted per-user access/refresh credentials, account/browser/state binding, conditional-write fences, shared server-worker refresh leases and revocation attempts. No raw provider tokens in API responses, logs or browser code.
- A compact activity picker and existing-map integration with recorded distance/time/gain, actual coordinates/heights, honest missing-data behavior and Strava source links. All API data is private to the connected athlete/Explore account.
- Ephemeral previews; no persistent activity database, automatic publishing, full-device sync, calorie/heart-rate collection, background polling or writes/uploads to Strava.
- Existing GPX import, route controls, app permissions and Kōbō contracts remain separate. Sign-in can preserve a valid Strava preview return ID.

## Other requested providers

| Provider | Current working path | Direct-connection dependency |
| --- | --- | --- |
| Komoot | View a GPX export where the user's account permits it | Approved/documented access and current reuse rules; no unofficial password-based API. |
| Garmin | View exported GPX activities | Garmin Connect Developer Program approval and documented Activity/Health API access. FIT/TCX parsing is future work, not advertised as delivered. |
| Google Fit | No new direct Fit integration | Deprecated developer API route must be replaced/verified; Android Health Connect needs a mobile companion and scoped device permissions. |
| MyFitnessPal | No nutrition connection delivered | Approved partner access or verified supported export format, plus optional nutrition consent/data design. |
| Xiaomi | No direct wearable connection delivered | Confirm Mi Fitness versus Zepp Life and device model; then a supported Health Connect/export/approved partner route. |

All five stay visible in the connection roadmap with their actual requirements. Credentials/approvals and a phone-side Health Connect bridge cannot be fabricated by website code. Official provider research requests were blocked by the execution network; no fresh legal/API-policy approval is asserted. Do not turn these roadmap rows into working-looking Connect buttons until their actual adapters and access are ready.

## Next after real Strava acceptance

Use the existing provider-scoped activity interface as the pattern for other adapters. Decide private history retention/deletion, source deduplication and timezone rules before implementing weekly/monthly totals; a Garmin activity mirrored to Strava must not be double-counted. Persistent provider-derived storage or public journal sharing requires a verified current provider-permitted design. Those are separate from the delivered ephemeral route preview.

## Verification

- 184 server tests passed, including 15 Strava-specific driver/native-route tests. These include independent server workers sharing the refresh lease, abandoned refresh handling, wrong-account/suspended access, concurrent callbacks, private-only exclusion and stale-request fencing.
- The real settings controller/map pass provider-fixture browser tests for setup gating, safe redirects, activity selection, source attribution, profiles/statistics, XSS handling, abort/disconnect while loading, and clearing on account/visibility changes at 320–1440px.
- The existing full planner renderer suite passes: GPX, search, climbing/MTB/ski layers, status stability, contour/terrain rendering, satellite and fallback behavior. New login-return checks pass, including a Strava activity ID.
- Public page/navigation checks passed again, and 20 targeted rendered-layout checks passed for the changed Settings, map and login pages at five widths. The earlier site-wide audit covered 414 route/layout checks.
- Production build and isolated deployment-package authentication/content checks passed before pushing. These are local fixtures; actual athlete consent, current provider policy/capacity, real-device performance and live provider responses remain unverified.
