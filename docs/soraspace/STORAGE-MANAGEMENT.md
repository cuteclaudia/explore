# SoraSpace file and storage management

30 October 2026. Delivery inventory and safe implementation sequence. Read with [platform roadmap](PLATFORM-ROADMAP.md), [regional storage proposal](../kobo/storage-regions/REGIONAL-STORAGE-PROPOSAL.md), existing storage contracts and [private index recovery](../kobo/PRIVATE-INDEX-RECOVERY.md).

## Current increment

The Files page now separates site revisions from connected storage and app libraries, offers filename/app search, app filtering, sorting and progressive display beyond 30 results. The home page still shows three recent revisions. Counts describe authorized revisions returned by the existing site API, not unique documents, provider totals or stored bytes. A saved revision may be an earlier save of the same document. File links retain existing app tools and separate-window behaviour.

Account and capability checks still run before and after listing. Cached metadata and rendered results are cleared on account loss, hidden pages and failed refreshes. Sort/filter/load-more use only the verified current-page metadata; none performs a remote mutation. No persistent file search index is added.

## Location model for the next increment

| Location | What it contains today | Next safe enhancement |
| --- | --- | --- |
| Site revisions | Private saves accessible through the existing file API | Revision grouping once a stable document identity exists; don't group solely by filename |
| Device/app library | App-owned browser/device files and Photos/Image Editor libraries | Explicit app shortcut, honest local/unsynced status supplied by the app |
| Connected storage | Authorized provider connection, its isolated app data and libraries | Read-only inventory using adapter-supported, bounded listing with continuation tokens |
| Public site media | Deliberately published website assets | Separate publication controls; never treat a private drive item as public just because it appears in Files |
| Shop digital products | Versioned paid originals and customer download grants (future) | Private immutable assets scoped to merchant and order; never publish under normal site media |

A future inventory entry needs tenant/workspace, authorized owner, connection ID, provider-scoped opaque object ID, optional app/library ID, display name, content type, bytes if known, modified time if known, provider version/ETag if available, capability and last verified time. Never infer identity from a display path alone. Store minimal metadata; no credential in a listing or client preference. Location evidence and encryption/recovery status need honest unknown states.

## Sequence

1. Audit actual file APIs, retention and current index backup/restore. Establish counts and limits per source. Do not describe metadata-only index backups as photo-original backups.
2. Add a read-only location selector for supported sources, with scoped server pagination, bounded search and per-connection cancellation. Avoid recursive whole-drive scans or showing unsupported providers as connected.
3. Show quota/size only where provider scope and API evidence support it. Provider-wide capacity is not our hosted quota. Unknown size is unknown, not zero. Make request/traffic limits visible before expensive scans.
4. Add explicit download/export and revision history where already supported. Keep original bytes and app-native manifests intact. Destructive operations come later with provider conditional writes, clear scope and recovery.
5. Introduce copy with source/destination review and verified completion under the agreed storage contract. Lost replies require read-back verification; no blind overwrite. Move requires a verified copy and conditional source removal; it is not simply upload then unconditional delete. No directory renames or library merging by filename.
6. Add automated backup schedules only after choosing a target, credential scope, retention, restore authorization and a successful restore drill. Include originals, indexes, metadata, keys/recovery method and published assets as separate coverage entries. Test missing/damaged chunks and backup consistency during concurrent saves.

## Provider options

Keep existing Google Drive and accepted WebDAV/kDrive paths stable. Guided Nextcloud/WebDAV is the nearest extension, subject to HTTPS/SSRF protections and actual atomic-write acceptance per host. S3-compatible and Proton Drive need their own reviewed adapter/auth/encryption design. Google Docs is an editor and native document format, not an interchangeable Drive file. See the regional proposal for evidence requirements; no provider, region or current price becomes verified through this plan.

## Acceptance before a unified file browser ships

- Two tenants plus two accounts/connections with identical filenames and object IDs: no data or cache crossover, including late network replies and browser back/forward restore.
- Capability removal, expired sign-in and storage switching clear old results and stop pending requests.
- Pagination/search bounds, unicode and malicious filenames, empty/large listings, unknown sizes and partial provider failures behave predictably.
- Keyboard, 320px phone, touch tablet and 13-inch laptop: readable metadata, wrapping controls and stable errors.
- No tokens in browser persistence, client errors, logs or exported indexes; least-privilege scopes and approved callback/origin handling.
- Provider create/CAS/read-back/resume and two-device acceptance, plus backup/restore on disposable libraries, precede mutation features.

## Rollback of this increment

Revert the Files page/controller changes to restore the previous display. There is no schema change, provider write, storage migration, file deletion or new credential. The current single-owner stores remain single-owner until the tenant foundation passes its gates.
