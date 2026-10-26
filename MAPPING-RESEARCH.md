# Mapping and activity integration review — 26 October 2026

Goal: a clean Explore adventure map with 2D/3D views, private routes, and eventual Strava/Garmin/Komoot connections. Renderer licensing, hosted map usage, terrain data rights and activity-provider access are separate decisions. “Open source” does not imply free global satellite imagery, free routing infrastructure or approved access to personal activity accounts.

## Recommended foundation

**MapLibre GL JS + OpenFreeMap Liberty + Mapzen Terrain Tiles**. The implementation is at `/places`, with 2D/3D switching, featured destinations, attribution and a local GPX viewer/elevation profile. It does not upload GPX files, claim to plan navigable routes, or sync external accounts. Other pages do not load the map library. Live tile delivery must be checked separately from renderer tests: this cloud environment blocks the third-party tile origins, so browser tests use deterministic local tile fixtures.

MapLibre is BSD-3-Clause; its official example demonstrates actual elevation-based 3D terrain, rather than merely rotating a flat map. OpenFreeMap's README explicitly offers a free public instance with no registration, API keys, map-view or request limits; it is donation-funded, not a contractual availability guarantee. The Liberty style is actively maintained according to the styles repository. OpenFreeMap does not provide satellite imagery or raster tile hosting.

Mapzen's Terrain Tiles are listed in the AWS Open Data Registry as a global bare-earth dataset. The public bucket is `elevation-tiles-prod`; Terrarium tiles provide a key-free DEM source. Resolutions/dates vary by region, and heights are approximate. Its constituent datasets require attribution, including Geoscience Australia, Copernicus/European Union, USGS, and others. These are recorded at `/map-credits`, linked from the map and terrain attribution. Do not remove the map's source attribution control. Never use this view as safety-critical navigation.

## Options assessed

| Option | Licence / hosting distinction | Suitability |
|---|---|---|
| [MapLibre GL JS](https://github.com/maplibre/maplibre-gl-js) | BSD-3-Clause renderer; tiles/elevations separate | Best current fit for one shared 2D/3D terrain interface, vector styles and GPX layers. WebGL required. |
| [OpenFreeMap](https://github.com/hyperknot/openfreemap) | Open-source deployment; public instance currently free/key-free per README; map data attribution still required | Preferred initial vector basemap. Self-hosting is possible but substantial, not a free Netlify static upload. |
| [Leaflet](https://github.com/Leaflet/Leaflet) | BSD-2-Clause; tile services separate | Excellent light 2D option and potential older-device fallback. No native 3D mountain terrain; would need a second renderer. |
| [OpenLayers](https://github.com/openlayers/openlayers) | BSD-2-Clause; tile/data services separate | Strong 2D GIS, projections, raster/vector data and editing. More GIS-oriented; not the simplest unified 3D terrain choice. |
| [CesiumJS](https://github.com/CesiumGS/cesium) | Apache-2.0 engine; hosted ion datasets/services have separate terms and quotas | Strongest for globe-scale 3D and complex geospatial scenes. More weight/integration complexity; not necessary for the current outdoor map. Free engine is not unlimited hosted terrain/imagery. |
| [deck.gl](https://github.com/visgl/deck.gl) | MIT rendering layers; base maps still separate | Good future route/heatmap/data visualisation on MapLibre, not a complete map provider by itself. |
| [PMTiles / Protomaps](https://github.com/protomaps/PMTiles) | Open format/libraries; archive storage, bandwidth and CORS/HTTP Range support still needed | Good future owned regional/offline map layers and reduced provider dependency. Do not put a worldwide archive in a site build or assume hosted Protomaps service is free. |
| [Mapzen Terrain Tiles](https://github.com/tilezen/joerd) | Mixed source data rights, public AWS dataset, explicit attribution | Selected terrain source; useful global terrain without a map API key. Accuracy varies. |

The [MapLibre terrain example](https://github.com/maplibre/maplibre-gl-js/blob/main/test/examples/3d-terrain.html) now also references Mapterhorn tiles. This is a promising alternative to evaluate, but its independent service terms/availability were not verified here, so it was not silently adopted. Commercial satellite imagery and turn-by-turn hiking/cycling routing need their own licensed services or self-hosted infrastructure. The base map renderer does not calculate routes. OpenStreetMap's community raster tile servers should not be treated as an unlimited bulk/offline backend; consult the [tile usage policy](https://operations.osmfoundation.org/policies/tiles/) before any such use.

## Activity connections

User's selected priorities: **Strava, Garmin Connect, Komoot**. `/settings/connections` explains their current status and links to the provider sites. It is separate from `/studio/storage`, which handles file-save destinations, not activity-account consent.

- **Strava:** the intended first direct integration is official OAuth with least-necessary activity scopes, encrypted server-side tokens, state/CSRF and replay protection, refresh/revocation, rate-limit handling and explicit private-by-default activity import. Confirm current developer terms and production athlete-access limits when registering the app. Do not publish tracks automatically, collect provider passwords or use activity data for unrelated AI processing. No Strava OAuth flow or credentials have been configured in this increment.
- **Garmin:** assess approved Garmin Connect Developer Program access before implementing live sync. Eligibility, contractual requirements, costs and permitted uses must be confirmed with Garmin; do not promise a free, unrestricted public personal-account API. GPX export/import is the available starting point. Do not integrate password-based/reverse-engineered consumer login scraping.
- **Komoot:** GPX export/import is the starting point. A documented approved integration/partnership must be established before promising a Connect button; this review did not establish a supported general-purpose OAuth API for this site. Do not mistake unofficial wrappers for provider permission.

Direct developer websites for Strava, Garmin, Komoot and some mapping policy pages returned network-proxy 403 responses in this environment. The official mapping GitHub repositories, licences, AWS dataset registry source and terrain attribution were read; direct-provider API terms were not claimed fully verified. Strava's official Go client README is supplementary historical API context, not proof of current API terms. No fabricated provider environment-variable keys are needed for the current map/GPX workflow.

## Rollout

1. Validate live vector and terrain delivery on the Netlify site, including mobile performance and attribution.
2. Test representative GPX exports from the three providers. Current importer accepts track segments/routes, validates coordinates, caps size/point count, keeps segment gaps out of distance, and reports incomplete elevations without claiming complete ascent. Imported routes remain in browser memory, not account storage or public content.
3. Register and approve the first official activity integration, then implement and test its consent/storage/revocation flow before offering live syncing. Keep precise coordinates private by default and add deliberate trim/redaction controls before public sharing.
4. Integrate the finished planner into the proposed homepage. Keep community off, avoid fake activity totals/member posts, and add routing/imagery only after a suitable licensed data/service decision.

## Primary sources read

- [MapLibre README and BSD-3-Clause licence](https://github.com/maplibre/maplibre-gl-js)
- [OpenFreeMap service statement and deployment scope](https://github.com/hyperknot/openfreemap)
- [OpenFreeMap styles and maintenance status](https://github.com/hyperknot/openfreemap-styles)
- [Terrain Tiles AWS registry source](https://github.com/awslabs/open-data-registry/blob/main/datasets/terrain-tiles.yaml)
- [Terrain attribution requirements](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)
- [PMTiles README/licence](https://github.com/protomaps/PMTiles), [Leaflet README/licence](https://github.com/Leaflet/Leaflet), [Cesium README/licence](https://github.com/CesiumGS/cesium), [deck.gl](https://github.com/visgl/deck.gl), [OpenLayers](https://github.com/openlayers/openlayers)
