# Enable and test the Strava connection

## What is built

The website now has a real, read-only Strava connection: consent callback, encrypted per-account tokens, shared refresh leases, safe reconnect/disconnect, a paginated activity picker, and private map/elevation previews. It is **disabled by default** and has not been tested against a real athlete or current Strava production approval. No credentials, provider application or live settings were created by this deployment.

It requests `read,activity:read`. Private-only activities and write permissions are excluded. The picker displays only the connected athlete's activities; another user's activity ID cannot bypass that check. No activity history, raw route file, nutrition or heart-rate data is stored in Explore. Tokens and the athlete binding are retained encrypted so the account can reconnect across visits. Selected previews stay in the active browser view, clear on leaving/hiding the view, and are not published. GPX preview still works separately.

## Administrator steps

1. Open https://www.strava.com/settings/api while signed into the Strava account that will manage the Explore application. Register/inspect the application using the actual website `https://www.claudiagilbert.com` and **Authorization Callback Domain** `www.claudiagilbert.com` (hostname only). Review Strava's current API agreement, branding/retention requirements and athlete capacity/approval before enabling users. Fresh official documentation was blocked from this execution environment, so current policy approval is not claimed.
2. Obtain the client ID and client secret. Keep the secret out of chat, source control and screenshots.
3. In the **existing explorebyclaudia Netlify project → Environment variables**, set the following for **Functions / Production**:

| Variable | Value |
| --- | --- |
| `STRAVA_CLIENT_ID` | The application's numeric client ID |
| `STRAVA_CLIENT_SECRET` | The application's secret |
| `STRAVA_REDIRECT_URI` | `https://www.claudiagilbert.com/api/fitness/strava/callback` |
| `STRAVA_ENABLED` | `true` after the provider requirements and test access are confirmed |

The existing `FILE_STORAGE_ENCRYPTION_KEY` must be available to Functions as well. **Keep its current value**; changing it would also affect existing storage credentials. Do not reuse Google Drive OAuth credentials for Strava.

4. Redeploy the same Netlify project. Environment changes require deployment. Open https://www.claudiagilbert.com/settings/connections on that exact origin, sign into your existing Explore account, then choose **Connect Strava**. Consent requests only the narrow read-only scopes above. Account/password/access grants are not changed by linking a fitness account.
5. After returning, the server must show **Strava connected**. Click **Choose an activity**, then **Preview route**. The activity name, recorded distance/time/gain and source link are shown. The map displays a route and a genuine elevation profile when the source supplies heights. Route-derived distance/ascent can differ from Strava's recorded totals; both are labelled.
6. Test **Disconnect**, which removes local authorization before attempting provider revocation. If revocation cannot be confirmed, remove Explore from Strava's own application settings as the UI advises. A delayed refresh or activity reply must not reconnect or redisplay old data.

The website permits only the exact configured origin to start/complete consent. It supports the known www, apex and Netlify project hostnames as configuration choices, but choose **one** and configure Strava/Netlify consistently. The recommended production choice remains www. A pending TLS/DNS/canonical-host issue should be resolved before testing cross-site OAuth; changing credentials is not a TLS fix.

## Live acceptance still required

- Complete and decline real consent; test missing activity permission and retry after expired consent. Confirm no unrequested scopes.
- Load an eligible walking/running/MTB/ski activity from the approved test athlete. Confirm the date, units, source link and distinction between elapsed/moving time and route-derived/recorded values. Private-only activities are intentionally excluded.
- Preview an activity with heights, one without a GPS track, and a long activity. Current limits are 20 activities/page, at most 50 manually requested pages, 20,000 route points and 5 MiB provider JSON per response. Large routes are refused rather than silently truncated. A summary-polyline fallback has no invented height data.
- Test a second **approved** athlete/Explore account within actual app capacity, expired/revoked authorization, disconnect during a pending request and account changes. Another account must not see the connection or preview data. Activity lists and previews clear on account/visibility changes.
- Check phone/tablet layout and real provider rate-limit behavior. There is no automatic activity polling or background sync. Verify current Strava data/display/branding requirements before wider release or commercial use.

## Local evidence

Server tests cover OAuth origin/account/browser binding, single-use and expired state, scope refusal, encrypted tokens, duplicate callbacks, cross-account reads, private-only exclusion, coordinate/size validation, refresh races between separate server workers, abandoned-refresh handling, reconnect requirements, disconnect fencing, throttling and missing GPS/height behavior. Native-function tests cover fresh authentication, CSRF, callbacks/cookies and no token leakage. Browser tests use the real settings/map code with simulated provider replies, including safe activity-name rendering, activity choice, cancellation, account changes and mobile/tablet layouts. These do not attest a live Strava account or provider approval.

Implementation: `server/strava.mjs`, `netlify/functions/fitness-strava.mts`, `src/scripts/fitness-connections.ts`, and the existing Explore map. Private storage namespace: `explore-fitness-connections`. Kōbō storage connections, document libraries, app bridge messages and desktop releases are unchanged.
