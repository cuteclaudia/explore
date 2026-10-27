# Final Hikari two-device acceptance checklist

Run the full checklist separately on **Google Drive** and **kDrive/WebDAV**, using the same accepted candidate checksum on both. Use disposable test libraries and retained source files. Fixtures and earlier connection checks do not sign off these tests.

Record: candidate SHA-256/source revision; website commit/deploy; provider/connection label; library names/IDs; A and B device, OS and browser versions; date; outcome/evidence for each row. A=Chrome, B=Edge or another physical device. Include Android with the same account; add a fresh profile C for cloud-only restoration.

## Setup and ordinary sync

- [ ] Provider's connection/competing-save checks pass. Correct account, connection and library are visible; no credentials enter the iframe or exported logs.
- [ ] Back up existing local libraries and originals. Google: create/download an index checkpoint; follow the disposable recovery drill in `PRIVATE-INDEX-RECOVERY.md`.
- [ ] A imports a small JPEG, a multipart original and a real large original near 200 MB within the app's 256 MiB limit. Wait for verified original publication **and** committed catalog, not just a generic tooltip. Record source sizes/SHA-256.
- [ ] Fresh B/C loads the expected albums, ratings/edits, names and photo count. Open each photo; verify original sizes/hashes with a download or diagnostic, including the large file. Thumbnails generate automatically and remain after reopening.
- [ ] Edit in B; A adopts it safely after becoming active. Reopen both after a clean shutdown. No duplicate photos or reverted edits.

## Exact stale-session and real conflicts

- [ ] Leave A open and synced. B imports a >1 MiB JPEG and finishes syncing. In A only select another existing photo. A safely updates to B's library without overwriting B or remaining stuck. See `RELEASE-CANDIDATE-HANDOFF.md` for the exact original steps.
- [ ] Make genuine edits in A while B commits another edit. Only a valid conditional write wins. The losing branch is preserved and visible recovery works. No claim of “synced” for rejected/pending work.
- [ ] Back up the losing branch, close/reopen its full parent page in the same profile, and exercise recovery. Both intended edits are retained or explicitly kept as separate copies. No cache clearing, force overwrite or clock-based winner.
- [ ] Intentionally race two browser/device commits and capture safe operation/result evidence. A connection probe alone is insufficient; verify the resulting actual library and both originals.

## Interruptions and errors

- [ ] Interrupt a multipart upload, close/reopen, reconnect and resume. Verify every final part, manifest and full-file hash. Resume state must belong to the same account/connection. No premature completion.
- [ ] Simulate a lost commit reply. Retry verifies the existing result rather than silently overwriting a different head or copying duplicate libraries.
- [ ] Revoke/expire provider access; observe an actionable reconnect state and preserved local work. Reconnect without resetting libraries. A failed atomic recheck leaves Google read-only.
- [ ] Test offline edits and reconnect. Resolve a concurrent remote save safely. A failed local/provider quota or file-size check must not truncate data or allocate an oversized original.

## Libraries, provider switching and accounts

- [ ] Existing `main` and `library/` continue unchanged. Create two named libraries, close/reopen and switch in each browser. Verify names, distinct catalogs, active library display and device-local selection.
- [ ] Registry conflict/corruption produces safe recovery/refusal, not a replacement default registry. Hiding a library does not delete its files.
- [ ] Change verified provider in settings with an app open after syncing/preserving local edits. Old iframe/port closes; one new launch ID opens the new destination. No implicit copy or fallback. Switching back retains the saved connection and its own libraries.
- [ ] Switch account during a launch/upload, then sign out during a delayed launch. Old requests are cancelled/refused, no other account's library/photos/thumbnails appear, and logout never auto-reopens the app. A later login requires explicit Open.
- [ ] Test read-only source/destination handling only for delivered features. Do not claim v1.3 Save a Copy/selectConnection is available until its website operations are implemented and separately accepted.

## Recovery, phone and release decision

- [ ] Google: export/import a checkpoint for the same account/connection; interrupt/resume validation; activate only after all files verify; prove a pre-restore launch cannot write. Test missing/tampered file refusal and cancellation. Restore a disposable lost-index fixture; never erase a real production index to stage the drill.
- [ ] kDrive: verify native app backup/export and documented restore on a disposable library. WebDAV has no website private-index dependency; Google index recovery is not a kDrive backup.
- [ ] Android: portrait/landscape, high-DPR rendering, bottom tabs, drawer drag/tap/scroll, photo swipe, keyboard if applicable, full screen entry/exit and browser restart. No hidden critical controls or accidental navigation data loss.
- [ ] Rehearse app-only rollback with a format-compatible fallback while retaining the recovery-aware backend and all post-release data.
- [ ] Record all failures and limitations. Owner signs off **both provider runs**, conflict recovery, original integrity and recovery drill before live replacement. Keep public rollout gated until then.
