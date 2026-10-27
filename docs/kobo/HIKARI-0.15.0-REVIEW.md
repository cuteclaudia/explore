# Hikari web 0.15.0 — phone layout integration

Reviewed 27 October 2026. Phone layout release; runtime storage contract remains v1.2.1. The library switcher and v1.3 website operations are not delivered by this release.

## Package

Three supplied parts joined in numeric order; combined source ZIP SHA-256:
`4cc901ecb894de6ca65cbfcef0f2690e3e6bebb6a22b1dd4092b3cdd9f556b3c`.
ZIP paths and CRC checked. Prepared using the pinned release in `scripts/prepare-hikari-test.mjs`. No application JS or WASM changes. Redundant compression files and Apache configuration omitted; root publish configuration added. Upstream notices retained.

Prepared upload ZIP: `hikari-test-site-0.15.0.zip`, 26,686,753 bytes.
SHA-256: `bf96e47556bdfbfefb9f300272df5f111949542eb14933db29ef96af8ce6e4e8`.

Deploy the extracted prepared folder to the **existing separate Hikari test site** (`cuteclaudia-hikari-test.netlify.app`), never over Explore. No environment-variable, storage-key, origin or DNS change. Website wrapper changes deploy separately from the static app package.

## Website changes

Base already supplies `width=device-width, initial-scale=1`, covering the integration test and Studio tool pages. The standalone `/apps/[tool]` wrapper now explicitly supplies the same value. Legacy generated workspace engines and their opaque sandbox remain unchanged.

On screens below 700 CSS pixels, both wrappers have one 44px control row. The ordinary app wrapper shortens Files and uses a labelled fullscreen icon. Fullscreen expands the iframe, hiding parent controls. The owner integration test hides its site header, footer and introduction while an app is running, retains a storage settings link, and gives the remaining viewport to the frame. Close restores the surrounding page. Storage status and diagnostic errors remain available. Launch authorization and requireStorage checks are unchanged.

## Independent validation

- Website server suite: 125 tests passed.
- Production build, isolated packaged SSR and private authorization guards passed.
- `check-kobo-phone-wrapper.mjs`: extracted real markup/styles/controllers, mocked identity/launch, Chromium touch 390×844; single 44px row, no horizontal overflow, remaining-height frame, files dialog, close restoration and iframe fullscreen passed for both wrappers. This is a source fixture, not a live authenticated browser test.
- `HIKARI_PHONE=1 check-hikari-photo-sync.mjs`: exact supplied WASM, supplied CSP, actual shell/bridge, touch 390×844 at DPR 1; frame width 390; native phone layout visually inspected. Real JPEG import (775 bytes and 2,919,999 bytes), whole/multipart upload, scoped resume journal, committed originals lookup, clean-browser catalog restore, byte/hash verification and read-only refusal passed. Identity and storage HTTP were fixtures; this is not fresh live Google Drive/kDrive acceptance.
- `_headers`, `kobo.json`, `kobo-bridge.js`, `kobo-sync.js` and `kobo-originals.js` are byte-identical to reviewed 0.14.6. CSP and origin allowlist preserved.

Claude reports broader upstream suites, including 200 MB integrity tests, in the supplied handoff; those reports are not independent reruns for this review.

## Still open

Real Android touch, high-density rendering, portrait/landscape, swiping and drawer gestures need user acceptance. Verify fullscreen entry/exit on that browser. Headless phone checks used DPR 1; they do not certify physical high-density Android rendering.

Storage code is unchanged. The stale-session conflict and persisted pause described in `HIKARI-0.14.6-STALE-SESSION.md` remain open. Closing/reopening is not a guaranteed recovery. Keep local backups; do not clear browser storage or overwrite a connected library to resolve it. Thumbnail recovery observations also remain open; this release is not a sync recovery fix.

## Message for Claude

0.15.0 checksum and package verified. Base/test/Studio viewport already correct; standalone app wrapper now explicitly includes initial-scale=1. Phone wrappers use one 44px row; active test mode hides site navigation/introduction, retains storage settings, and iframe fullscreen hides the parent chrome. Exact mobile WASM/bridge import and clean-context original restore passed with fixture storage. CSP/allowlist/bridge/sync/originals files match 0.14.6; no protocol change. Android high-DPR/gesture acceptance is next. Please keep the previously reproduced stale-session/persisted-conflict recovery issue open alongside the library-switcher work.
