# Hikari 0.14.6 — thumbnail after remote original retrieval

27 October 2026. Claudia reports that both imported photos open in Edge through the same Explore account/Google connection. The supplied screenshot shows the Lisbon original open in the main view while both imported filmstrip entries still have `!` placeholders. This is user-observed live original retrieval, not original-byte hash certification or full app acceptance.

## Independent observation

Run the unchanged supplied build with the actual website shell/CSP and simulated storage/Identity:

```sh
HIKARI_THUMBNAIL_DIAGNOSTIC=1 node scripts/check-hikari-photo-sync.mjs PREPARED_SITE
```

Set the usual Playwright/Chromium variables. This optional diagnostic uses the fixed 1280 px test viewport to select the larger imported filmstrip entry; it is test tooling, not an application patch.

- In a new browser context the opened small JPEG obtains its thumbnail.
- Select the multipart-sized JPEG (2,919,999 bytes). The full image displays and `originalsInMemory` reaches 2.
- After 2.5 seconds the large thumbnail remains blank in the captured frame. The render queue is still active, so this alone does not establish a permanent failure or a specific cache-invalidation defect.
- Close/reopen the test app in that same context. The large image and its thumbnail then both display.
- Both original downloads still match their source hashes through the bridge. Readonly refusal still propagates without writes.

Screenshots from the controlled test:

- `/workspace/reviews/hikari-0.14.6-restored-thumbnails.png`
- `/workspace/reviews/hikari-0.14.6-restored-large-thumbnail.png`
- `/workspace/reviews/hikari-0.14.6-reopened-thumbnails.png`

These observations do not exactly reproduce Claudia's persistent `!` state, nor prove Edge-specific behavior. They show that initial on-demand retrieval and thumbnail availability can diverge, and that reopening can restore the thumbnail in a controlled case.

## App-side follow-up for Claude

Please check that successful on-demand original download commits the scoped file before thumbnail/preview jobs use it, invalidates any missing/failed thumbnail state, and schedules a thumbnail refresh without requiring a restart. Also check scheduling/prioritization when the restored demo/library render queue is busy. The application should distinguish not-yet-downloaded/loading from a genuine image/decode error.

Acceptance: with a fresh browser profile, open each remotely synced original and let the activity settle. Its filmstrip/grid thumbnail should appear without re-importing or clearing storage. Cover small and multipart originals, prior failed thumbnail attempts, reload/cache reuse, and the existing account/connection namespace rules.

## User workaround

After photo activities and catalog sync finish, close and reopen Hikari in Edge once. Preserve browser data; no original re-import, credential change or storage reset is needed. If placeholders remain after reopening, retain the screenshot and report it to Claude with the current build number.
