# Hikari release candidate: joint work for Claude and website

27 October 2026 preparation. No public cutover or storage-data rollback is authorized by this document. App runtime remains v1.2.1; frozen v1.3 operations are not advertised as implemented.

## Exact stale-session reproduction for Claude

Original finding: 0.14.6, also not fixed by layout-only 0.15.0. Claudia saved a large photo in Edge, waited for “Synced to storage”, then returned to an already-open Chrome session. Chrome warned of another-device changes; closing and reopening did not reliably recover.

1. Use two independent browser profiles A (Chrome) and B (Edge), the same website account, storage connection and library. Keep the original source JPEG outside the app. Use a test library or backed-up owner library.
2. Open A and wait until its library is fully loaded and synced. Record photo count, generation and head ETag. Leave A open.
3. Open B. Import a real JPEG larger than 1 MiB. Wait for the original's parts and manifest, committed `originals.json` SHA-256 mapping and the catalog head; also wait for “Synced”. Record the new head/generation and photo count. The tooltip alone is not sufficient evidence of original publication.
4. Return to A. Select another existing filmstrip photo. Do not import, rate or edit anything. This selection/view-state save triggered the bug.
5. In the broken build, A PUTs `library/head.json` with an old revision, gets conflict/HTTP 412, and becomes `paused:true, dirty:true`. B's head bytes/ETag must remain unchanged. These conditional checks must stay enabled.
6. Download A's local library backup using File → Back Up Library. Verify the download is nonempty and keep A's profile intact.
7. Close/reopen A's full parent page in the **same browser profile**, obtaining a fresh launch. Broken 0.14.6 still retained the paused, old catalog despite reading the remote head. Merely seeing a head GET or issuing a fresh iframe launch does not demonstrate app recovery.
8. In a fresh profile C with empty browser storage, open the same account/connection/library. Confirm B's photo count and photo, download its original through the app/bridge and compare byte length and SHA-256 with the source. Preserve A.

Independent executable reproduction: `scripts/check-hikari-stale-session.mjs PREPARED_SITE`. It uses exact WASM, the real shell and atomic HTTP fixtures, not live providers. Its current successful exit records the old retained-pause finding; it is **not a passing recovery regression test**. Replace its old-bug assertions with the release candidate's documented recovery outcomes after review.

Fix acceptance:

- A with only view/selection changes safely adopts B's latest committed library. It does not publish its old snapshot or remain indefinitely paused.
- Repeat with an actual edit in A: preserve both branches, show explicit recovery choices, and demonstrate backup/keep-copy or verified replay. No blind overwrite, last-device-clock winner or cache deletion.
- Restart an already-paused A and prove its recovery choices work; also test interruption during original upload. A fresh launch alone is not the fix.
- Thumbnails regenerate after original download in a genuinely fresh profile without requiring another reopen.
- Repeat these cases for Google Drive and kDrive. Keep originals, caches, upload journals, backups and libraries properly account/connection-scoped.

## Website work in this handoff

- Fresh session controller replaces a changed account/connection/index epoch with a newly server-authorized launch. Old port, requests and iframe are closed. Sign-out/manual close cancels pending relaunch; later login does not silently restart it. No forced reload on ordinary focus or library-head change.
- Google Drive index snapshots are stored encrypted in a separate private recovery store before control-head publication. Restore validates cloud references/bytes in batches, stages a separate namespace and atomically activates it. Old launches cannot write through the restored epoch. Recovery controls live in Files & storage.
- These are website changes, not evidence the native stale-session merge/recovery behavior is fixed.

Please send the candidate's exact archive checksums, source revision, tests, library-format/backward-compatibility statement and documented conflict-recovery actions. We will run the final checklist before routing `/apps/hikari` to the new app. No origin, DNS or encryption-key change is planned for cutover.
