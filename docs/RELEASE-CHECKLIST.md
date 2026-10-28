# Explore and creative apps: release checklist

Prepared 29 October 2026 (Sydney). Use this as the single release sign-off index; linked procedures retain the detailed steps. A local test pass is not a real-provider or physical-device pass. Record candidate checksum, website commit, Netlify deploy ID, tester, date, devices and evidence beside each completed item.

## Website and accounts

- [ ] Confirm apex and www serve the intended Netlify project, one canonical host redirects correctly, and HTTPS works on both. Confirm the renewal warning is gone: [domain checks](site/DOMAIN-RENEWAL-CHECK.md).
- [ ] Sign in from a fresh profile and an existing session on the canonical host. Open Studio, Settings and Desktop installers directly; refresh and return from another page. No login loop. Test sign-out, session expiry, denied and suspended accounts: [login recovery](site/LOGIN-CUSTOM-DOMAIN-RECOVERY.md).
- [ ] Check invitation and password-recovery email links on the live domain. Keep invitation-only registration until a separately tested registration/access change is ready; do not imply subscription billing is delivered.
- [ ] Verify Google Drive OAuth callback and reconnect after the domain move. Retain the old callback for rollback until migration acceptance.
- [ ] Verify phone/tablet portrait and landscape: navigation, login, settings, activity selection, file picker, map/layers, elevation profile, long errors and keyboard focus. Include a real Android device and Safari/iPad where supported; automated Chromium checks do not cover those devices.
- [ ] Check public Apps and 3D printing pages, honest availability labels and real links. macOS stays visible as Planned. Do not advertise unpublished GitHub drafts or unapproved Microsoft Store listings as available.
- [ ] Migrate remaining Squarespace-hosted assets and check saved content before cancelling the old website: [cutover](site/CUSTOM-DOMAIN-CUTOVER.md), [asset inventory](site/SQUARESPACE-ASSET-INVENTORY.json).

## Fitness and maps (independent release gate)

- [ ] Configure Strava securely and verify current permitted scopes, display rules and athlete capacity: [setup](fitness/STRAVA-SETUP.md). Keep disabled if not ready; website release need not wait.
- [ ] Real consent, cancelled consent, expiry/revocation, reconnect and disconnect; two different Explore accounts must never share data. Exercise disconnect/account change during loading.
- [ ] Preview a GPS activity and elevation; verify recorded totals are labelled separately from route-derived estimates. No-GPS and incomplete elevation are explained. Do not count previews as saved workout history.
- [ ] Open representative GPX, TCX and FIT exports locally. Check route location, segment gaps, missing elevations, invalid/truncated files and size limits; file contents must not be uploaded or published.
- [ ] Verify map attribution, terrain, contours and hiking/MTB/climbing/ski controls with live services. Test blocked/unavailable map sources and stable status rows.
- [ ] Other providers remain labelled by actual readiness. No simulated Connect buttons, background sync, retained history or public sharing without implemented and approved access.

## Creative apps (sign off separately for each app)

- [ ] Receive exact candidate ZIP, SHA-256, source revision, test report and limitations. Record both accepted and compatible fallback artifacts. Preserve CSP, licences and separate app origins.
- [ ] Hikari: complete stale-session/conflict recovery, library switching, thumbnails and original-file round trip on **both Google Drive and kDrive**, using two independent browsers/devices: [two-device procedure](kobo/TWO-DEVICE-ACCEPTANCE.md). The historical Chrome warning after Edge showed Synced is a required regression.
- [ ] Preserve unsynced local work and originals before any refresh/recovery drill. Confirm relaunch with a fresh launch ID on account, connection and restored-index epoch changes; old in-flight work must not cross accounts.
- [ ] Perform the private-index checkpoint/export and a disposable real-provider restore drill; preserve the original encryption key outside Netlify: [recovery procedure](kobo/PRIVATE-INDEX-RECOVERY.md). Never practise destructive recovery on the sole live library.
- [ ] Irodori: confirm current candidate and storage-contract status. Check recovery after closing a tab, account/connection isolation, immediate change notice, software rendering and real Windows canvas rendering. Website review of 0.16.1 does not approve later builds or deliver its proposed cloud sync.
- [ ] Fumi/Tsuzuri/Tayori/Goban: obtain their own reviewed candidate and app-specific acceptance; do not inherit Hikari/Irodori's result.
- [ ] Check desktop installers on real target operating systems, checksum/version, licence notices and update behaviour. Publish only the accepted release. Microsoft Store submission and subscriber licence enforcement are separate checks: [desktop readiness](kobo/DESKTOP-RELEASE-READINESS.md).

## HobbyNest (separate store launch)

- [ ] Choose the commerce platform, real products/prices, shipping/tax settings and STL licence terms. Test physical-only, digital-only and mixed orders plus payment/refund/download recovery.
- [ ] Configure `hobbynest.claudiagilbert.com` only with the chosen platform’s supplied DNS records, verify HTTPS, and link it from Explore after acceptance. The current `/hobbynest` page is a noindex preview and accepts no orders: [store plan](hobbynest/STORE-PLAN.md).

## Cutover and rollback

- [ ] Record the release decision and app-specific gate. Open a small accepted cohort first; keep unfinished apps gated rather than enabling the suite indiscriminately.
- [ ] Follow [replacement and rollback](kobo/LIVE-REPLACEMENT-AND-ROLLBACK.md); retain recovery-aware backend code and the app origin. Verify old binaries can safely read/write the candidate's formats before selecting a fallback.
- [ ] Wrong-account data, lost originals, unsafe concurrent writes or unrecoverable saves stop rollout. Preserve evidence and local work; a UI rollback must not restore old cloud heads, delete browser caches, rotate encryption keys or silently discard new saves.

## Current evidence boundary

Earlier local server, browser-fixture and production-package checks are recorded in [fitness handoff](fitness/CONNECTIONS-IMPLEMENTATION-HANDOFF.md) and [website validation](kobo/RELEASE-READINESS-VALIDATION.md). Live domain renewal, real Strava approval/consent, physical-device testing, candidate-specific creative-app acceptance and recovery drills require their own recorded results. No item above is marked passed solely because code exists.

## Claude’s 29 October handoff

The supplied registry reports Hikari 0.16.0, Irodori 0.16.2, Fumi 0.11.0, Tsuzuri 0.14.0, Tayori 0.8.2 and Goban 0.12.1 as code versions, not published-release proof. Tayori and Goban have no web launch or published release in that handoff. Store packaging is reported complete for Goban and in progress for the rest; product identities, submission, certification and licence enforcement are separate. Treat these as supplied claims pending artifact/repository review. Do not carry the earlier independent Irodori 0.16.1 acceptance over to 0.16.2. Supplied documents are preserved under `reviews/claude-2026-10-29/`.
