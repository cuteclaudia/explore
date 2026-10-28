# Clearer 3D relief and elevation contours

28 October 2026, Australia/Sydney. The previous relief used gentle 0.4 hillshade and 1× height. Satellite and specialist raster layers could be inserted above the shading, flattening the appearance. Actual contour lines were not present.

Changes:

- Multidirectional hillshade with stronger 0.65 shading and map-anchored light improves slope/ridge/valley separation.
- 3D visual height is enhanced **1.3×**, disclosed in the map status and footnote. Raw elevation/GPX measurements are not multiplied.
- Real contour lines are generated locally from the existing Mapzen Terrarium DEM using pinned `maplibre-contour` 0.1.1, BSD-3-Clause. The library licence is retained at `/licences/maplibre-contour.txt` and linked from Map credits. No new terrain provider, account, secret key or server proxy was introduced.
- Contours and terrain shading have independent 3D-only layer switches. Both are hidden in 2D, where extra DEM/contour requests are not started.
- Zoom-aware minor/major contour spacing (200/1000m at z10, 100/500m at z12, 50/200m at z13, 20/100m at z15) avoids drawing the finest grid across a whole region. Major contours use metre labels where the base style has glyphs.
- Contour computation uses a worker and a 32-tile cache. Elevation source max zoom remains 15; source resolution still limits genuine terrain detail. These are approximate contours, not surveyed/navigation-grade data.
- Satellite and hiking/MTB/ski rasters are inserted below hillshade/contours and labels, rather than covering relief. Vector routes and labels remain legible above it.
- Map size/status stability and phone/tablet controls from the companion status fix remain in place.

Independent checks use real MapLibre/contour worker code with synthetic Terrarium tiles and synthetic reference imagery; they do not certify live provider availability or local ground accuracy. They check decoding and generated contour vector features, 3D enhancement, correct raster/shading/contour order, independent contour visibility, flat-view behavior and existing map features at phone/tablet/desktop widths. Physical mobile performance and subjective live terrain appearance remain user smoke checks.

Implementation: `src/lib/terrain-view.mjs`, `src/scripts/explore-map.ts`, layer classification and raster adapter placement. Tests: `server/terrain-view.test.mjs` plus `scripts/check-explore-planner.mjs`; `EXPLORE_TERRAIN_ONLY=1` runs its focused renderer check against the local fixture server. The `window.fixtureMap` hook is injected only by Playwright into local served test code; no production debug global is shipped.
