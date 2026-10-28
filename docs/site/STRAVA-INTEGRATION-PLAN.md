# Strava: first fitness connection

28 October 2026. Claudia selected Strava as the first provider. This is preparation, not a delivered OAuth connection or a claim of Strava approval. The existing `/settings/connections` page correctly says that live syncing is not connected. GPX preview already works locally in `/places`.

## First usable version

A signed-in user connects their own Strava account, selects an activity and views its route, distance and elevation in Explore. Activity access stays private to that user. Start with manually selected imports; automatic background syncing and writing activities back to Strava are later work. Do not offer public journal publication of Strava-derived data until the current API agreement explicitly permits that use; importing a user's own GPX file is a separate existing path.

## Provider setup before credentials are needed

Use Strava's official application settings at https://www.strava.com/settings/api and current documentation at https://developers.strava.com/docs/getting-started/ and https://developers.strava.com/docs/authentication/. Review the current API agreement, branding requirements, permitted display/retention rules, athlete limits, quotas and approval process. These have not been independently retrieved in this environment; do not assume a newly registered app can serve every subscriber.

Register the app for Claudia's website and the final production hostname once the domain cutover is settled. The callback domain is a hostname, not a full URL. The exact callback endpoint and environment-variable names should be supplied by the implementation; there is no Strava callback route or Strava secret configuration in the website today. Do not enter the existing Google Drive callback into Strava. Keep the client secret in server-side Netlify configuration, never source control, browser scripts, screenshots or chat.

## Website implementation

- Use the existing authenticated account as the connection owner. Connecting Strava is separate from signing into Explore and never grants administrator or app permissions.
- Server-side authorization-code exchange with short-lived, single-use state bound to the account and browser session. Validate callback origin and consent scopes; handle declined consent without altering an existing connection. Start with the narrowest supported activity scope; access to private activities requires separate explicit consent if implemented.
- Encrypt access/refresh tokens using the existing server-side credential protection pattern, in a separate provider namespace. Serialize refresh-token rotation and fence reconnection/disconnection so stale requests cannot restore revoked credentials.
- Fetch activities and map data from documented provider APIs on the server. Bound pages, response bytes, geometry complexity and request rates. Validate coordinates before reusing the existing map renderer; safely render activity names and descriptions as text.
- Provide connection status, selected-activity import, reconnect and disconnect in the site's compact settings style. Disconnect explains what happens to cached/imported data; implement provider-required revocation/deletion behaviour. Do not treat public GPX preview as authenticated cloud storage or silently send its contents to Strava.
- Cache only as permitted by the current provider agreement. Respect activity privacy changes, deletions and provider deauthorization. If persistent imports need webhooks or reconciliation to meet those obligations, implement them before enabling retention. Defer background syncing until those rules and delivery can be met.

## Acceptance before enabling Connect

Use real consent with a test athlete after local server tests pass. Cover declined/expired consent, replayed state, account-switch during consent, token refresh, revocation, throttling, missing route/elevation, large tracks, two different users and disconnect during an import. Verify phone/tablet/desktop layout, no token leakage, no cross-account route visibility and no automatic publication. Check actual provider approval/athlete capacity before broader launch.

## Immediate sequence

Finish public-domain migration preparation first. Claudia can inspect/register the Strava application in parallel, keeping credentials private. Build and test the connection against the agreed final hostname, then enable it for an approved test account before inviting more athletes. Kōbō app releases and subscription automation are independent work.
