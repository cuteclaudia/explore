# Explore planner: first release

Claudia requested a compact Explore page, ski/MTB/hiking/climbing data research, investigation of missing Thredbo trails and an optional inexpensive satellite view.

## Changes

- One place search, compact activity filters, Map/List switching, expandable GPX/trip tools and a bounded feature list with original mapped grades/access and source links.
- Corrected styling for generated layer labels, which previously ran together because scoped CSS did not reach script-created elements. Saving preferences is distinguished from loading trail data.
- Hiking queries include ordinary `highway=path` geometry alongside marked route relations. Query cache version bumped to avoid retaining earlier empty results.
- Independent Waymarked Trails hiking/MTB and OpenSnowMap pistes-only raster overlays, so visible trails need not depend on a successful clickable-details request. On-demand view tiles only, no offline/bulk downloads, source attribution and referrer policy retained. Provider failures visible; geometry/feature API limits remain.
- Separate optional rock and ice/mixed route discovery uses the documented OpenBeta API. Queries are bounded/cached, individual routes retain original grades and source links, and route coordinates are distinguished from approximate crag locations. No photos, descriptions or vertical topos are copied. Live coverage/API compatibility is not certified by fixtures.
- `/explore` now redirects to the existing real planner `/places`, retaining query parameters. No “map coming soon” duplicate.
- Optional MapTiler satellite integration prepared. It stays hidden and makes no MapTiler requests without a public domain-restricted key; no key/account/paid plan was configured. Source-supplied attribution and official logo retained, errors revert imagery to the standard map, and terrain/trails remain separate controls.
- GPX still stays in the browser. Community publishing remains off. No new provider contract, account data migration, app-origin change or app/storage access grant.

## Verification and limits

165 server tests pass. Browser checks use the real MapLibre renderer with bounded service/image fixtures: one search, layer/activity preference synchronization, dynamic-label styles, feature details/source links, list switching, GPX import/clear, real raster pixel paint and separate tile outages. Rock/ice controls, source grades and approximate crag-location labels are exercised with independent API fixtures. They also cover keyless no-request behavior, optional imagery requests/logo/toggle, 2D/3D switching, 320/390/768 imagery controls and no-WebGL fallback.

Rendered route audit: 12 checks across `/places`, `/explore`, `/map-credits` at 320, 390, 768 and 1440px, no overflow/clipped-control failures. Production build and isolated deployed-package checks include the legacy redirect with its query string.

Ordinary internet and live production/provider endpoints were blocked in this execution environment. The missing Thredbo trail result was reported, not independently reproduced against live Overpass. Reference tile endpoints and reuse terms are evidenced by official source snapshots, but neither live Thredbo coverage nor current pricing/API contracts is certified by fixture tests. The full source assessment records what was and was not checked.

## After deploy

1. Refresh Explore. At Thredbo, select Skiing, then Hiking/MTB. Confirm trail lines and reference-source status in 2D and 3D. The details list can be empty or fail independently of tile imagery; report the exact visible message if that happens.
2. Open Layers; labels/checkboxes should have separate rows. Check activity chips synchronize and saved preferences survive reload.
3. Try Map/List on phone/tablet and a disposable GPX import/clear. Confirm no GPX upload occurs.
4. Keep satellite off unless a suitable free plan is confirmed; follow `SATELLITE-SETUP.md` if desired. No current feature requires a paid imagery plan.

## Next work, not delivered features

Account-scoped saved-place bookmarks and plan collections, owner editing/reordering of curated places, linking published journal/gallery entries to locations, complete-route retrieval/export/share and route creation still need implementation and their own authorization/data model. The source assessment records the bounded initial OpenBeta integration and prioritizes live regional climbing coverage checks, a routing pilot for hiking/cycling, and authoritative access/closure references. They are not implied by the map controls in this release.

## Rollback

Redeploy the previous Explore deploy or revert the planner release commit and deploy. No user cloud files or GPX documents are migrated. Existing layer preferences remain compatible; older versions ignore the extra specialist-layer setting through their normal preference validation. Disable specialist layers through Layers if a provider is unavailable. To stop imagery immediately after future setup, disable its specific provider key as well as removing the environment variable and rebuilding; open pages can retain browser configuration.
