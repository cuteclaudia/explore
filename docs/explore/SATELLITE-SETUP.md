# Optional satellite imagery: keep costs off until configured

28 October 2026. Claudia prefers no spend, or a genuinely inexpensive option. No account, paid plan or API subscription was created. No imagery key has been added to the repository or deployment. Without `PUBLIC_MAPTILER_KEY`, the Satellite control stays hidden and no MapTiler requests are made by this page.

## What is prepared

A MapTiler satellite raster layer that can be switched on and off independently of 2D/3D terrain and trails, preserving the same map, private GPX and feature layers. On imagery errors it falls back to the ordinary map. TileJSON supplies imagery attribution; the official MapTiler logo is displayed while imagery is active, and the page has additional copyright links. The source SDK explicitly says the logo cannot be disabled on free plans. Satellite capture date/resolution vary; this is not live snow, vegetation or trail-condition information.

The fixed satellite-v2 TileJSON endpoint and logo resource are confirmed in MapTiler's official SDK source. Browser rendering/error tests use fixtures; live imagery availability, key permissions and account pricing remain to be confirmed. No published example/demo key is used.

## Free-first setup for Claudia

1. Open [MapTiler Cloud](https://cloud.maptiler.com/) and check [current plans](https://www.maptiler.com/cloud/pricing/). Create a free account only if its terms cover your current site, satellite imagery and expected traffic. Do not choose a paid upgrade just to activate this feature. Pricing, quotas and commercial-use eligibility were not accessible for a current live check, so no numerical allowance or price is promised here.
2. If the free plan is suitable, create a separate **browser map key** for Explore. Restrict it to the exact production website origins you use (`https://explorebyclaudia.netlify.app`, `https://www.claudiagilbert.com` and `https://claudiagilbert.com`, as applicable), using the syntax specified by the provider. Do not enable unrestricted use or add wildcard preview domains unnecessarily. Do not reuse a server/admin secret.
3. Check dashboard usage controls. Use a hard cap if the plan supports one; an email usage alert alone is not a guaranteed spending cap. If the plan requires payment or cannot meet your no-spend preference, leave this integration unconfigured. Recheck the licence before adding subscriptions or other commercial use to Explore.
4. In Netlify, select **Explore**, then **Project configuration → Environment variables → Add a variable**. Name: `PUBLIC_MAPTILER_KEY`. Value: your domain-restricted browser key. Include the **Builds** scope and Production context (or all scopes if your UI only provides that choice). This is intentionally browser-visible; it is not a storage credential.
5. Trigger a fresh Explore production build/deploy. The **Satellite** button will then appear beside 2D/3D controls. Existing users may need a refresh. No change is needed to Irodori/Hikari sites or storage keys.
6. Test Thredbo at a useful zoom: switch Satellite on, select Skiing/MTB/Hiking, and toggle 3D terrain. Check imagery, logo, attribution, trail overlays and return to the normal map. Watch the provider's usage dashboard during this small trial before deciding whether to retain it.

## Stop or disable

Remove `PUBLIC_MAPTILER_KEY` and redeploy Explore to hide Satellite. If usage must stop immediately, revoke/disable that specific key in MapTiler too: an already open page can retain a browser key until refreshed. Do not touch Google Drive, WebDAV or app encryption keys.

## Alternatives and cost position

- **Current map and trail overlays:** no new paid-provider contract was added. These services still have terms and capacity limits; normal Netlify hosting/request costs remain separate.
- **Free MapTiler tier:** a possible small-site start, only if its then-current allowance and licence fit. Not assumed free forever or for every future commercial use.
- **NASA/other open satellite datasets:** potentially useful broad-area imagery, but many public mosaics lack the resolution needed to inspect a trail. High-resolution original open data can still require paid storage/processing/tile hosting. We won't substitute a coarse scientific layer and call it equivalent to a detailed satellite basemap.
- **Other commercial imagery providers:** compare current terms/quotes if the free option is unsuitable. No Esri, Google, Bing or other public-looking tile URL is treated as an unlimited free commercial licence.

If no suitable free option exists, the clean choice is to keep Satellite off while retaining the working maps, terrain and trails.
