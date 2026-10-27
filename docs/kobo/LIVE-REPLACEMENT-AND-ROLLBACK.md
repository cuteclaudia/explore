# Hikari live replacement and rollback plan

Status: prepared, **not cut over**. The rebuilt app remains owner-only at `/studio/kobo-test`; `/apps/hikari` still serves the existing editor. No DNS, Squarespace, domain or encryption-key change. Approval of a candidate must refer to its exact ZIP SHA-256 and website commit/deploy ID.

## Before scheduling release

1. Receive Claude's recovery/library-switcher/thumbnail release candidate, checksum and source revision. Review its CSP/allowlist and storage-format compatibility; preserve licences. Repeat independent browser and index-recovery tests. Complete `TWO-DEVICE-ACCEPTANCE.md` on both real providers, including a disposable owner recovery drill. Record actual device/browser versions, results and failures; no fixture pass substitutes for a live provider pass.
2. Back up each existing library in every browser that may contain unsynced work. Keep source originals. Finish pending uploads or resolve/preserve conflicts. Never merge by deleting browser storage.
3. In Files & storage create a Google Drive index checkpoint for every app in use, download the encrypted backup to a location outside Netlify and record its ID/time. Keep a secure independent copy of the existing `FILE_STORAGE_ENCRYPTION_KEY`, OAuth client configuration and Netlify site identifier. Do not put credentials in the handoff, repository or index download.
4. Record the current Explore deploy and app-site deploy IDs, exact artifacts/checksums and current environment values. Retain both site artifacts. Establish a **tested compatible app fallback**, not merely an older version number. A build predating multiple libraries or recovery semantics may not be safe after the candidate writes its new state.
5. Add an app-specific release gate/routing change before public opening. The current `KOBO_STORAGE_ENABLED` gate is suite-wide; do not enable rebuilt apps indiscriminately. Fresh server authorization, capability checks, provider verification and read-only safety remain enforced. Preserve legacy exports/private revisions and explain how existing-editor libraries are imported; never assume browser data from the legacy engine is automatically the new catalog.
6. Confirm basic browser support and user-facing requirements. Connected sync requires a verified provider; offline/guest use must not fall back into another account's library. Clarify which originals are cloud-backed before claiming a complete backup. Kōbō branding remains a working name pending commercial trademark clearance.

## Cutover sequence (when candidate acceptance is signed off)

1. Keep the **same separate Hikari origin** already used for owner testing. Upload the reviewed static build with its exact `_headers` to that app site and smoke-test it from the existing test wrapper. Do not deploy it over Explore.
2. Deploy a website change that routes the authorized `/apps/hikari` experience to the rebuilt iframe using the same fresh-launch session controller, compact wrapper and Files & storage link. Stage behind the app-specific gate first. Do not relax iframe isolation/CSP. Do not change public content routes or other apps.
3. Verify signed-out and unpermitted access is refused; owner launch, returning user's library, two fresh profiles, downloads, full screen and Android still work. Verify the correct current provider/library is visible. Snapshot backup failure must block head publication rather than produce an unprotected save.
4. Open a small beta cohort first. Publish experimental limits and recovery actions; monitor authorization failures, repeated conflicts, unavailable thumbnails, index backup failures and original verification errors without logging credentials or file bytes.
5. Open wider only after the cohort checks pass. Keep the test route for authorized diagnostics and retain the exact accepted artifacts.

Changing `/studio/kobo-test` to `/apps/hikari` on the same shell origin does not require moving the app origin. A later change to either the iframe origin **or the top-level website's site** can change browser storage/partitioning. Treat that as a separate migration with full original sync and verified backups. Do not combine it with this release.

## Rollback triggers

Wrong-account/provider/library data, missing originals, unsafely accepted competing writes, unrecoverable conflicts, index backup failure, or a broad launch/render regression. Stop expansion immediately. Preserve affected profiles, artifacts, logs and snapshot IDs.

## Rollback actions

1. Disable the app-specific live route/launch gate, not the user's saved connections. Show an actionable maintenance message. Already-open sessions must stop writes safely; gate revocation is checked server-side. Preserve local work and permit the app's local backup where possible.
2. If data format is compatible, republish the last accepted **app-site artifact at the same origin**, then deploy/re-enable the compatible wrapper. Validate a backed-up test account before reopening the beta.
3. If compatibility is unproven, leave the rebuilt app in maintenance and offer the previous editor separately. Do not let an old binary write a new-format registry/catalog. A separate editor is not automatic recovery of the new library.
4. **Do not restore old cloud heads or an old index as part of a UI rollback.** Users may have saved valid work after release. Preserve it and perform a separately reviewed, per-account recovery only when needed.
5. **After any recovered-index epoch is activated, do not roll the website backend back to a version predating index recovery.** Such a backend reads legacy keys and could expose stale state. Retain the recovery-aware backend while rolling back app/UI code. Reverting active index pointers without a recovery plan is a data rollback, not a code rollback.
6. Do not rotate `FILE_STORAGE_ENCRYPTION_KEY`, disconnect accounts, delete immutable Drive objects, clean caches, run GC or change DNS. Re-test representative reads and local backup before resuming writes.

## Evidence to retain

Accepted/fallback app SHA-256, website commits/deploy IDs, snapshot IDs and exported-backup checksum, provider verification time, two-device checklist, recovery drill outcomes, format compatibility statement and release decision. Keep credentials only in their secure administrator store.
