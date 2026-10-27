# Google Drive private index backup and restore

Implemented on the website for owner testing before public Google Drive release. This does not enable v1.3 bridge operations, replace app library backups or authorize a live replacement. Production recovery must pass the disposable drill below before release.

## What is backed up

Google Drive contains immutable file revisions; `kobo-google-files` stores which revision belongs to each app-relative path. The private index is part of the data needed to reopen a library. The recovery snapshot contains that app's logical file/directory records, tombstones and app-folder mapping, bound to the current website account, Google connection, Drive root and app. No OAuth tokens, app passwords, photo bytes or website content are included.

Before publishing `head.json` or `libraries.json` at any library path, the website stores a complete encrypted candidate snapshot in the separate private `kobo-google-recovery` Blobs store. Entries are read against strong versions and a second enumeration rejects a changing index. If creating the snapshot fails, the control-head index commit is refused. The already-uploaded immutable Drive object may remain unreferenced; it does not become current.

After a successful control-head CAS, the snapshot is labelled confirmed. A lost response or losing CAS can leave a prepared snapshot: it is a complete candidate mapping, **not proof that save won**. Users must choose the intended checkpoint explicitly. No automatic “newest timestamp wins” restore exists. Non-control uploads before their library head is committed are not promised as committed-library backups.

Snapshots are encrypted/authenticated with AES-256-GCM using the existing `FILE_STORAGE_ENCRYPTION_KEY` and an account/connection/app-specific AAD. They are immutable apart from informational publication labels. There is no automatic retention deletion or cloud garbage collection in this delivery. Listing shows the latest 50 checkpoints. Snapshot count/storage costs and a retention policy need review before wider commercial scale.

A snapshot is limited to **4,096 index records and 2 MiB plaintext** per app/connection. Approaching this limit requires a reviewed capacity increase or chunked snapshot design before more heads can publish. This is not a claim of unlimited library history. The import request limit is 3 MiB including the encrypted envelope. Per-file checks remain bounded to 1 MiB; larger originals are represented by multiple parts.

## Back up now

1. Keep source originals and use the app's File → Back Up Library for any unsynced or conflicted local branch. Finish saves and close app instances.
2. Open Files & storage → Google Drive recovery → Back up or recover the private index.
3. Select Hikari (repeat for any other app in use), click Create checkpoint, and select the checkpoint. Download encrypted backup.
4. Keep the exported JSON outside this Netlify site, and record its checksum, account/connection label, app and timestamp. Do not put it in a public repository.
5. Administrator: keep a separate secure copy of the **existing** storage encryption key and OAuth/Netlify site configuration. Do not send secrets in chat. A download cannot decrypt after key loss, nor grant Google authorization by itself.

The automatic snapshot store is separate from the working index but remains in the same Netlify account: this is not an off-site backup by itself. Downloaded copies and key escrow are required for account/site-loss recovery. Existing connected libraries need an initial checkpoint before release; there is no retroactive backup of already lost index entries.

## Restore

Use recovery on a disposable library first. Returning to an earlier snapshot is an explicit data-state rollback for the selected app; later cloud objects are retained, but the older snapshot does not magically contain later edits.

1. Preserve local app backups and originals, record the current index checkpoint if readable, and close **all** instances of this app. Confirm you selected the intended website account, Google connection and app. Reconnect Google if necessary; do not change the OAuth client/root or encryption key as part of recovery.
2. Refresh snapshots, select the desired checkpoint, or import its encrypted JSON. Google connection and competing-save checks must pass before starting or activating a restore. Import authenticates and validates scope/schema; it does not change the active index.
3. Click Verify for restore and confirm that apps are closed. A conditional recovery fence blocks new index operations for this app. Other apps/connections are not fenced. In-flight operations cannot report success across the fence; their local work must be preserved.
4. The website checks the app folder, each live file's parent/properties/revision/size, and its full bytes/SHA-256 in batches of four. It stages records in a new private namespace. A missing/moved/tampered file stops verification; it never activates a partial recovery. Tombstones remain tombstones.
5. If interrupted, reopen settings, Refresh snapshots, and Resume verification. The server-held cursor and create-only staging make a lost reply safe to resume. If verification fails, fix access/file availability or Cancel recovery to keep the original index active. A recovery fence does not expire silently; cancellation is explicit.
6. When every record is verified, click Activate restored index. One CAS publishes the new index namespace. The old index and all cloud objects are retained; no cloud rewrite or deletion occurs. The staging key set is rechecked before activation. A lost activation reply is idempotent.
7. Explicitly reopen the app after recovery if it was closed by the fence. Every old launch is fenced by its index epoch; a new authorized launch is required. The app may still have a local branch: use Claude's conflict-recovery controls to preserve it and load/reconcile the restored head. **Index restoration is not automatic native-library merging.** Verify counts, albums, edits and originals before resuming normal work.

Never roll the website backend back to code that ignores recovered index namespaces. App/UI rollback must retain this recovery-aware backend. To return to another saved data state, perform another explicit checkpoint restore; do not manually flip pointer keys.

## Disaster recovery boundaries

The tested lost-index case starts with the working index cleared in an isolated fixture and restores an exported checkpoint to a new namespace. It recovers folder mappings and exact logical ETags while verifying the original Drive objects. It also supports lost recovery-store data if an exported envelope and original key survive. It cannot recreate deleted Drive originals, a lost encryption key, missing authorization, or newer local edits that were never committed/backed up. Replacing the Netlify Identity account, OAuth client/Drive root, or website owner identifiers changes the binding and needs a separate migration plan; imports intentionally refuse another binding.

## Disposable owner drill before public release

Use only a disposable account/connection/app library. Never delete the real production index to test recovery.

- Create a checkpoint and download it; preserve source originals and the app backup.
- Make a later change and checkpoint it. Restore the earlier checkpoint through Verify → Activate, then use app recovery to load it. Verify its expected content and original hashes. Verify a pre-restore launch is refused and a new launch works.
- Restore the newer checkpoint to return to the latest saved state. Confirm all newer photos reappear and their bytes match.
- Interrupt verification and resume; cancel another attempt and confirm the existing index remains usable.
- On fixtures, separately test completely lost working/recovery stores, missing/tampered remote files, malformed encrypted imports, other-account/connection/app rejection and competing restoration jobs. Do not manipulate live objects to stage corruption.
- Record live results, website deploy, snapshot IDs and candidate checksum. Fixture test coverage does not certify production storage atomicity; retain the existing live competing-save verification requirement.

## Implementation / validation entry points

`server/google-drive-recovery.mjs`, `server/google-drive-files.mjs`, `netlify/functions/drive-index-recovery.mts`, `src/scripts/storage-index-recovery.ts` and the storage settings page. Fresh authenticated authorization and CSRF checks run for every recovery request. The server derives account/connection from the current session and encrypted Google config; it never trusts a requested user ID or arbitrary Drive URL. App capability and the existing owner-testing release gate remain enforced.

Tests: `server/google-drive-recovery.test.mjs`, `server/drive-index-api.test.mjs`, the epoch test in `server/kobo-storage.test.mjs`, plus `scripts/check-kobo-relaunch.mjs` for browser lifecycle. Run `npm test`, the browser script with installed Playwright/Chromium, and the production build/isolated deploy checks. The settings flow also has `scripts/check-storage-index-ui.mjs` browser coverage. These use simulated identity/storage and are not claims of executing a restore against Claudia's live account.
