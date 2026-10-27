# Hikari 0.14.6 — older open session conflicts after another browser saves

27 October 2026. Claudia reports Chrome's warning after Edge finished a large-photo save and showed Synced. Chrome was already open; she also tried closing/reopening it. The screenshot shows the generic another-device conflict warning.

## Independent reproduction

Run `scripts/check-hikari-stale-session.mjs PREPARED_SITE` with the usual Playwright and Chromium variables. This uses the exact supplied 0.14.6 WASM, actual website shell and supplied CSP. Two browser contexts share an atomic storage HTTP fixture under one account/connection. It does not write to Claudia's live storage.

1. Open profile A and let its initial library sync. Its catalog has 24 demonstration photos.
2. Open independent profile B with the same account/provider. Import a real JPEG larger than 1 MiB.
3. Wait for its multipart manifest and a committed `originals.json` containing its actual SHA-256, as well as its catalog. This is stronger than checking the cloud tooltip alone.
4. A remains open on the old catalog. Bring it forward and select another existing photo in the filmstrip; no photo edits, imports or ratings are made in A.
5. A attempts to commit `library/head.json` with its older revision and receives `conflict`. Its native sync state becomes `paused: true`, `dirty: true`. B's head bytes/ETag remain unchanged.
6. A can still use the real `file.backupLibrary` command and download a nonempty local backup.
7. Navigate A's parent page again and mint a fresh launch in the **same browser context**. In the controlled reproduction its paused local state survives, its old 24-photo catalog remains, and B's new photo does not appear. A read of the remote head is observed; that does not mean the new catalog is applied.
8. Open profile C with completely new browser storage. It loads B's 25-photo catalog. Fetching the new original through the actual bridge returns the expected size and SHA-256. A's paused profile has not been cleared or reset.

The script's successful exit means the no-overwrite/backup/fresh-profile checks passed **and the retained-pause finding was recorded**. It does not mean recovery of a conflicted profile is fixed. Earlier exploratory iframe-only reopen attempts had navigation/timing stalls; the recorded reproduction uses full parent-page navigation. No universal claim is made about every restart.

## Interpretation

The website's revision guard is correctly protecting the newer committed head. This is not evidence that large originals cannot upload or that Google credentials are invalid. Browsing/view-state changes can trigger a shared library save, and an old open session can therefore conflict even without a meaningful catalog edit. Restarting is not a reliable recovery instruction because paused/local-dirty state is deliberately retained.

The shell currently polls account/provider status, not library-head generations; focusing it does not promise that the native app has pulled a newer catalog. Do not force an iframe reload on focus: that could discard genuine unsynced edits.

## App-side fix requested from Claude

- Detect a newer remote head before treating a previously open clean session as current, particularly on focus/resume. Account for an active original upload or catalog save before changing the in-memory model.
- Distinguish device view/selection state from meaningful catalog edits, so simply viewing photos does not leave the user stuck on a stale shared head.
- For semantically clean local data, safely load the newer committed generation, preserving device-local preferences and account/connection cache scope.
- For genuine local edits, preserve the local branch and provide a visible recovery choice (backup/keep-local copy, load remote after preservation, or safe operation replay/merge where supported). Do not silently overwrite either side, use clocks to choose a winner, discard a paused namespace, or retry the old snapshot without conditions.
- After restart, surface the preserved paused branch and its recovery choices rather than an indefinite generic warning with no way forward.
- Include two profiles where B imports/saves and A only selects a photo; repeat with real local edits in A, a restarted paused profile, and interrupted original upload. All original/thumbnail/resume/backup namespace requirements remain in force.

No new website operation is needed to investigate this v1.2.1 recovery behavior. Leave the website's atomic/ETag checks enabled. It is an outstanding two-device app-acceptance item, independent of the frozen v1.3 design/library-switcher work.

## Safe current workaround

Preserve a local backup from the warning profile and retain the source photo files. Finish B's photo activity and catalog sync. Use B as the working session for now, or use a genuinely fresh browser profile to view the committed remote data. Preserve the old profile; do not clear its storage, restore over a connected library, delete connection settings or force a cloud overwrite. Reloading a paused session alone is not a proven resolution, and the fixture tests do not establish how to merge arbitrary unsynced edits from a real user's archive.
