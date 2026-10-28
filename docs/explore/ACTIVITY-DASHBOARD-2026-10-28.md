# Explore: an outdoor dashboard

Claudia requested a more immersive Explore page based on the supplied visual reference, with exercise statistics and hiking, mountain biking, climbing and skiing discovery. The existing `/explore` redirect still leads to `/places`; the homepage, site navigation, community access and app permissions are unchanged.

## Delivered first stage

- Compact outdoor hero using an existing local image, with working planner and private-trip links.
- GPX preview statistics: distance, ascent, highest point and track-point count. These describe one imported route, not weekly exercise totals or a saved activity history. Missing elevation stays unavailable; clearing the route clears the statistics. Nothing is uploaded or persisted by this feature.
- Four destination inspiration cards focus the existing map and enable hiking, MTB, climbing-route or ski discovery. Plain links retain place/activity targeting on navigation. Photographs are explicitly illustrative; no invented named itinerary or route length is attached to them.
- Mapped line features show distance calculated from their supplied geometry, labelled **Mapped section** because geometry may be incomplete. Point-based climbing records are not given an invented route length or profile.
- Mapped elevation profiles appear only when the geometry contains complete finite heights. Most current OpenStreetMap line geometry is two-dimensional, so the details explicitly say its elevation profile is unavailable. The existing GPX profile remains available for user tracks with elevation.
- Existing map status stability, 2D/3D contours, source attribution, activity filters, layer settings, full screen, GPX clearing and no-WebGL fallback are retained.
- Strava is identified as the first planned connection. There is no fake Connect button or suggestion that existing users' activities have already been fetched. Implementation and approval requirements are in `docs/site/STRAVA-INTEGRATION-PLAN.md`.

## Source research and limits

The live discovery adapters already query OpenStreetMap/Overpass and OpenBeta, and show Waymarked Trails/OpenSnowMap reference overlays. Their feature links and map credits are retained. Test fixtures demonstrate rendering and calculations, not real-world route coverage, current conditions or source uptime.

Fresh HTTP requests to NSW National Parks walking information (`https://www.nationalparks.nsw.gov.au/things-to-do/walking-tracks`), ACT Parks Mount Ainslie information (`https://www.parks.act.gov.au/find-a-park/canberra-nature-park/mount-ainslie`) and Strava's developer guide were all refused by this execution environment's network proxy (tunnel HTTP 403). No official guide text, named itinerary statistics, resort operating information or closure status was copied or claimed verified. Broad destination cards are inspiration, not the result of a completed official-guide research audit.

Before adding a curated itinerary catalogue, record each route's official/source URL, check date, precise start/end, activity, distance definition (one-way/return/loop), difficulty scale, ascent and geometry/profile provenance, and permission to reuse text/images/data. Keep source grades distinct for MTB, climbing and skiing. Link current access/closure information rather than implying that a historic guide confirms today's conditions. Trail map data alone does not establish a safe route or a legal right of access. Do not label a partial OSM section as a complete hike or a climbing-area pin as a pitch topo.

Future weekly/monthly exercise totals must come from a real approved provider connection or an explicitly designed private activity log. Browser GPX preview is not that log. Public sharing of provider-derived data needs review against the current provider agreement before implementation.

## Validation

The extended real-renderer fixture acceptance (`scripts/check-explore-planner.mjs`) passed, covering card-to-map/activity targeting, sourced mapped-section distance, GPX values, clear/reset, missing-elevation states and full-page fit at 320, 390, 768 and 1440px. Tests use synthetic map/service responses and the site's real rendering code. All 166 server tests passed. The production build and isolated deploy-package checks also passed. Physical phone performance and external source availability remain live checks.
