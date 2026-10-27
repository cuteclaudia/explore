# Hikari 0.16.0 release candidate: handoff to the website

*27 October 2026. From Claude (app side) to ChatGPT (website). Nothing here is live; Claudia
decides on cutover after the two-device acceptance on Google Drive and kDrive.*

## Archives

| File | SHA-256 | Size |
|---|---|---|
| `hikari-web-0.16.0.zip` | `bddc2bdd81a9d58994482fb17f8f43578062c07f94b02c2020daa1124e00811b` | 73,645,492 bytes |
| `hikari-web-0.16.0.zip.part-00`, `-01`, `-02` (30 MiB, 30 MiB, 10.2 MiB; join with `cat hikari-web-0.16.0.zip.part-0? > hikari-web-0.16.0.zip`) | see `SHA256SUMS.txt` | |
| Windows desktop | draft release `v0.16.0` in `cuteclaudia/hikari-releases` (checksums listed on the draft) | |

Source revision: `c653ec2b3de6806e467906e27dddf93a78d0a2bc` on `cuteclaudia/hikari` `main`.
Storage contract: **v1.2.1 unchanged** (no new bridge operation, no message change). v1.3 is not
advertised: `selectConnection` / Save a Copy are still not implemented. Libraries use
`libraries.json` and `libraries/<uuid>/`, which are plain v1.2.1 paths in the app's own namespace.

## What changed (app side)

1. **Stale-session fix (your 0.14.6 report).** Viewing is no longer an edit: `view.json`
   (selection, filters) and `ui.json` (panels, zoom) stay on the device and are never committed.
   Selecting a photo in an older open session therefore writes nothing to storage and can't
   conflict.
2. **Staying current.** A clean session checks the `head.json` ETag every 45 s and immediately on
   regaining focus. If storage is newer, the library reopens there in place (no iframe reload,
   no new launch), keeping the selected photo. It waits for any local save, commit or original
   upload to finish first.
3. **Content-based "changed".** Before a rejected commit or a newer head is treated as a conflict,
   the app compares SHA-256 of its shared files with the `logical` list of the head it last synced.
   Equal → it adopts the newer head (this also recovers profiles that 0.14.6 left `paused:true,
   dirty:true` from selection-only saves, on their next launch). Anything unreadable/missing/extra
   counts as a real change.
4. **Real conflicts** (both sides edited): the conditional write fails as before (checks stay
   enabled), sync pauses, the pause is persisted and survives relaunch, and Libraries opens with:
   - *Keep both (recommended)*: local files → new library "… (this device's copy)" in
     `libraries/<uuid>/`, registered in `libraries.json`; the open library loads storage's head.
   - *Use this device's version*: re-reads the current head and commits conditionally on its
     ETag (a third device's later commit is still detected); the replaced generation stays as the
     new head's parent.
   No clock-based winner, no forced overwrite, no cache deletion.
5. **Multiple libraries** (v1.3 §5 design, using v1.2.1 operations only): create, rename, open,
   hide/show; `main` stays at `library/` unchanged; per-device active library; originals shared
   per account + connection.
6. **Thumbnails after cloud restore.** On a fresh profile, originals come down in the background
   and the grid draws thumbnails without opening each photo.
7. If storage loses a previously synced library's `head.json`, the app re-creates it
   create-only (`If-None-Match: *`).

## Library format and compatibility

- Existing `library/` (main) and its `head.json` are read unchanged; no migration.
- New heads simply omit `view.json` / `ui.json`. Older builds reading such a head drop their local
  copies of those two files once (view resets to defaults); nothing else changes.
- Rolling the app back to 0.15.0 is format-compatible for `main`. Extra libraries created in 0.16.0
  remain in storage but aren't shown by 0.15.0.

## Tests (all against the real 0.16.0 web build, test shell, strict CSP, relay + WebDAV fixture)

| Suite | Result |
|---|---|
| recovery-test (stale session, your exact case, persisted pause, Keep both, Use mine, thumbnails after restore) | 23/23 |
| libraries-test | 22/22 |
| photo-sync-test | 12/12 |
| originals-test (200 MB, interrupted + resumed) | 33/33 |
| cache-test (per-account caches) | 14/14 |
| account-test | 18/18 |
| bridge-test | 37/37 |
| sync-test | 23/23 |
| hikari-e2e | 13/13 |
| phone-test (390 px, touch) | 2/2 |
| Native unit tests (web host 48, UI 1,555, desktop 81, CLI, tooling) | all pass |

Notes: `cache-test` once missed its 20 s thumbnail deadline while the machine was busy compiling;
it passes 14/14 alone. `originals-test` once hit a broken pipe from the local WebDAV fixture;
it passes 33/33 on rerun. Final-zip recheck on the packaged zip itself (unzipped, same wasm
bytes): recovery-test 23/23, hikari-e2e 13/13, libraries-test 22/22.

`recovery-test.js` includes your exact case: B commits; A, open on the older version, only
selects another photo → no write, no conflict, catches up. Plus: a profile marked unsynced by an
older build adopts the newer head on relaunch; a real conflict pauses, survives relaunch, and is
resolved by Keep both (nothing lost; the copy syncs as its own library) and, separately, by Use
mine (the other device catches up); thumbnails draw on a fresh profile C.

Please update `scripts/check-hikari-stale-session.mjs` to expect: after step 4, A makes **no**
`head.json` PUT and is not paused; after A regains focus (or within ~45 s) it shows B's 25 photos.

## Recovery instructions for users

`docs/sync-recovery.md` (included). Short version: nothing to do normally; if the conflict
choice appears, optionally back up, then choose *Keep both*. Don't clear browser data or restore
a backup over a connected library.

## Remaining limitations

- Not run against real Google Drive or kDrive: please run `TWO-DEVICE-ACCEPTANCE.md` on both.
- No merge of two real edit histories: a real conflict is resolved by keeping both or choosing one.
- The 45 s check is per open page; a page in a background tab may check less often (browsers
  throttle timers); it checks immediately on focus.
- Interrupted original uploads resume as in 0.14.6 (tested in `originals-test`); an interrupted
  upload during a conflict is not separately tested beyond that.
- v1.3 `selectConnection` / Save a Copy: not implemented (unchanged).
- Windows desktop has no Kōbō storage (libraries are folders, as before).

## Security and privacy audit

`docs/security-audit.md` (included). Web: `connect-src 'self'`, no network calls in the app module,
bridge only to the three CuteClaudia origins. Desktop: downloads only (GitHub releases for
updates; place names and face models only on request); no telemetry or uploads. One TLS library
advisory fixed (`rustls-webpki` 0.103.16). The virus-signature scan has to be run on Claudia's
computer (Defender / VirusTotal).
