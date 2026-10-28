# Guided storage setup: first implementation

29 October 2026 (Sydney). This implements the first proposal stage without a provider migration or app rebuild.

## What users get

In Settings → Files & storage, **Find your storage → Choose a location & connect storage** opens a compact guided setup. A user can record their preferred region/country and whether they need provider file location or a fuller residency review. These are explicitly planning preferences, not verified provider facts, an activated region-only service or a completed external review.

The guide links to official Nextcloud/kDrive information as starting points, with no claim that listed countries have a tested provider, a checked price or account provisioning. Users sign up with the chosen provider separately. It distinguishes primary storage, backups, processing, metadata and keys; Switzerland is identified as European but not EU.

For an existing Nextcloud account, a local helper prepares the usual WebDAV folder URL from an HTTPS server address and account ID, preserving installation paths and encoding the ID. It rejects credentials/IP/local hosts, login/full WebDAV paths, queries, non-443 ports, ambiguous account IDs and dot-path IDs. It never contacts the host, checks DNS, creates a folder or certifies location. The existing server allowlist/public-address/TLS protections still apply when the user actually connects.

Copy is deliberate, with a manual-selection fallback. Open connection details expands/focuses the original WebDAV form without replacing any value or submitting it. The existing Test & save and Test Kōbō sync connection remain the actual connection/safe-write gates. The active provider is not switched. The guide explains the single WebDAV slot and that changing it requires preserving unsynced work; no multiple-connection feature is claimed.

Google Drive stays in its existing section. Google Docs editing, Proton and regional S3 adapters remain separate work; no working-looking Connect button is added for those unsupported paths.

## Account data and backend

- Exact new route: `GET/POST /api/storage/onboarding`, handled within the existing authenticated storage function.
- A separate private Blobs namespace, `studio-storage-onboarding`, stores only `{locationPreference, writeId}` at `location/<fresh-actor-user-id>`.
- POST requires a matching `expectedAccount`, an explicit nullable ETag and the bounded preference object. Unknown/claimed-verification fields and invalid country/region combinations are rejected. The server chooses the owner key.
- CSRF, fresh actor checks, private/no-store responses and conditional create/replace apply. The existing conditional Blob fetch normalises the known backend conflict response. Stale tabs get a conflict rather than overwriting a newer preference.
- This is not stored in the connection credential record, active-provider record, ordinary appearance/save preferences or app files. Preference writes therefore cannot overwrite those records through a read/merge race.
- Late loads do not replace a user-edited draft; account changes clear helper inputs and disable/hide the stale storage controls until reload. A missing save reply requires reload/check before retry. No planning/credential state is put into browser persistence.

## Unchanged

Existing WebDAV and Google Drive configuration, verification/write gates, connection IDs, encryption key, library folder/layout, launch/account/provider fences, private-index recovery, default export destination and appearance. No OAuth permission, provider account, hostname allowlist or paid service was created. Native app code and bridge operations are unchanged.

## Verification

197 server tests passed, including new parser/service tests and actual bundled native handler tests against the Netlify Blobs emulator. Coverage includes account isolation, CSRF, stale/concurrent writes, invalid inputs and preservation of existing connection/preferences. Browser fixtures exercise the real settings/controller flow, URL/copy fallback, preservation of existing fields, old save/verify flow, conflict/draft/account guards and touch layouts at 320, 390, 768, 1024 and 1440px.

These are fixture checks; no regional provider has been certified. Production build and isolated packaged authorization/content checks passed before pushing. Current provider pages/prices/country contracts remain unverified because official requests were blocked by the workspace network proxy. The existing region proposal and source-check record retain that boundary.

## Next stage

Qualify an actual regional Nextcloud/WebDAV host with current plan/location documentation and a disposable account. Obtain exact hostname approval through the existing administrator process, run connection/concurrent-write and two-device/original-file acceptance, and record evidence. Only then can a specific provider/plan earn a verified location/capability label. S3 and Proton remain separate reviewed adapter workstreams.
