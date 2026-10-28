# Irodori 0.16.0: owner preview setup and review

28 October 2026, Australia/Sydney. Original owner-preview record. The user has since deployed the separate site, configured Explore and reported that it opens. The later normal-workspace promotion is documented in `IRODORI-0.16.0-LIVE-WORKSPACE.md`. This preview does not enable Irodori storage, alter Hikari's origin/access or approve v1.4. Hikari's real two-device acceptance remains first.

## Verified package

Source revision reported by Claude: `4de90164`.

- Supplied ZIP: 12,919,723 bytes; SHA-256 `4177ab26781a5e2ebe10c2d15e1dae98e115c090254f1ec841d75b7a700a4e78`.
- Prepared Netlify ZIP: 12,919,777 bytes; SHA-256 `2fae5aaf70c5ec27c4814080561d8c7acdb3e9c9ea7b367ff36c2636d16383de`.
- ZIP CRC and paths checked; no symlink entries. App JS, WebAssembly, compressed parts, SRI references and licence/attribution files are unchanged. Apache-only `.htaccess` is omitted; root `netlify.toml` sets `publish = "."`.
- The supplied `_headers` CSP is preserved exactly. The prepared headers add no-cache exceptions for the fixed-name `/start-1.js` and root HTML `/`. Upstream treated all JS as immutable, which could leave a cached startup script pointing to previous-release assets. Send that exception to Claude for future packages.

Reproducible preparation: `node scripts/prepare-irodori-test.mjs SOURCE_ZIP EMPTY_OUTPUT_DIRECTORY`. The source SHA is pinned; a new release must be reviewed before preparation.

## Netlify steps for Claudia

A Netlify connector/deployment credential was not available in this workspace; no site was created or deployed by these automated checks. Claudia subsequently completed the manual setup and reported success. The proposed name is not a claim that the address is registered.

1. Download `irodori-test-site-0.16.0.zip` and extract it. The extracted folder must have `index.html`, `_headers`, `netlify.toml`, `start-1.js` and `app/` directly inside it.
2. In Netlify, create a **new project/site** using the manual deploy option. Drop that extracted folder into the deploy area. Never upload it over Explore or the Hikari test site. Keep the `.part-*` bytes/names unchanged; the app decompresses them itself.
3. Rename the new site to `cuteclaudia-irodori-test` if available. Copy its actual HTTPS origin, for example `https://cuteclaudia-irodori-test.netlify.app`. Use the actual assigned name if the suggestion is unavailable.
4. On the **Explore** project, add `IRODORI_PREVIEW_ORIGIN` with that HTTPS origin, no folder/query/hash. Make it available to Production Functions/runtime (or all scopes), then redeploy Explore. No new secret is required. Keep `KOBO_HIKARI_ORIGIN`, encryption keys and Google/WebDAV settings unchanged. Do not set `KOBO_IRODORI_ORIGIN` for this no-bridge preview.
5. Sign in as an owner and open `/studio/irodori-test`, also linked from My Studio. Click Open Irodori. The page stays closed with setup instructions until an approved separate origin is configured.

The origin validator refuses the website's own origins and the configured Hikari/Fumi/Tsuzuri origins. The iframe has the same sandbox/allow/referrer attributes as Hikari. The status endpoint requires a fresh owner identity and returns private/no-store responses. Hikari beta permission is insufficient. Logout/revocation destroys the frame; startup responses arriving after logout are ignored. Existing legacy editors and storage-contract operations remain unchanged.

**Scope of “owner-only”:** the website route and launch controls are owner-only. The static app itself has no authentication and can run directly if someone knows its URL, just like an ordinary manually deployed static app. If direct asset/site privacy is required too, configure appropriate Netlify site/deploy protection and verify cross-origin embedding; the wrapper alone cannot make public static assets private. The original preview added no public app-directory link. The later permission-protected normal workspace reuses the existing Irodori app card.

## Rendering finding and compatibility mode

In this automated Chromium environment, default WebGPU started but then lost the device:

`A valid external Instance reference no longer exists.`

The canvas became blank. This is a real observed headless/software-WebGPU result, not proof that every physical Windows driver fails. Removing the loading element alone was an insufficient health check.

The build's own `HOSTING.md` documents `?webgl`. With that WebGL2 mode, the exact package painted Irodori's editor correctly (over 2,000 sampled pixel colours), without CSP violations. The owner wrapper therefore defaults to an explicit **Compatibility renderer (WebGL2)** checkbox. It can be changed only before opening; changing renderers requires closing/download preservation first. No app code was patched. Please ask Claude to investigate WebGPU instance/device lifetime before certifying default rendering. Physical Windows/tablet checks remain necessary.

The optional `fonts/manifest.txt` returns 404 as documented. The package currently disallows page scaling in its viewport; ask Claude to remove `user-scalable=no` when improving mobile accessibility. This preview is **not phone-ready**; the site wrapper fitting a phone does not certify the native canvas UI.

## Validation

- 153 server tests passed, including separate-origin validation, missing configuration, fresh owner access, refusal of ordinary app/Hikari beta users and no-store endpoint results.
- `scripts/check-irodori-preview.mjs`: exact packaged bootstrap, gzip part and main WASM, cross-origin sandbox and supplied CSP, rendered WebGL2 canvas, no storage bridge, missing-origin closure, fresh configuration, iframe fullscreen, 390px wrapper width, permission revocation and logout during a delayed startup. Owner HTTP responses are fixtures; no live Netlify site/provider was used.
- Production build and isolated deployed-package checks include unauthenticated redirects for `/studio/irodori-test` and HTTP 401 for its configuration endpoint. These exercise real production guards separately from fixture browser rendering.
- Claude reports vulnerability/source/network/security review and a ClamAV scan in the supplied handoff. Those reports are retained as reports; this review does not claim to have independently repeated a source-wide security audit or antivirus scan.

## Owner smoke test after deployment

1. Open in compatibility mode on Windows/Edge or Chrome and a tablet. Confirm the correct Irodori editor, then full screen entry/exit.
2. Open a small device PNG/JPEG, change a layer/adjustment and Save/Export to the device. Reopen the downloaded file and verify appearance/dimensions. Test PSD/layered export separately before trusting a working project to the preview.
3. Download work before closing. No Google Drive/kDrive writes, document recovery or account-isolated document cache are promised in 0.16.0.
4. Sign out with a disposable document and confirm the frame disappears; check a non-owner/Hikari beta account cannot enter. Never test forced teardown with your only unsaved original.
5. Optionally compare automatic WebGPU on the physical machine after downloading/closing the document. Record GPU/browser versions and whether the device-lost error recurs. Keep compatibility mode available.

Storage draft review and the copyable Claude response: `IRODORI-STORAGE-REVIEW-DRAFT-1.md`. No storage implementation is approved merely by hosting the preview.
