# Hikari web 0.16.0 RC — independent website review

28 October 2026. Result: ready for **owner-run real-provider acceptance**, not approved for public cutover. Windows release remains draft; no release publication, DNS/origin change or live-route replacement was performed.

## Exact artifact

Joined supplied parts 00/01/02, verified each part against the supplied checksum list, verified ZIP CRC/paths, and pinned:

- Source ZIP: 73,645,492 bytes, SHA-256 `bddc2bdd81a9d58994482fb17f8f43578062c07f94b02c2020daa1124e00811b`.
- Declared source revision `c653ec2b3de6806e467906e27dddf93a78d0a2bc`; the read-only source checkout matched that revision. This is not a reproducible-build attestation.
- Prepared static package: `hikari-test-site-0.16.0.zip`, 26,726,540 bytes, SHA-256 `32eb2e58ec956b6cd5477e018b459d4170d9fc7ff48bfea226da5a8bf70b9204`.

Preparation preserves app JS/WASM and licence notices, strips redundant precompressed/Apache copies, and adds root Netlify publish configuration. Use this supplied build, not the independently built GitHub ZIP with a different checksum.

Upload the extracted prepared folder to the **existing separate** `cuteclaudia-hikari-test.netlify.app` site, keeping `_headers`. Never upload it over Explore. No environment changes or storage encryption-key rotation are needed. Preserve local library backups/source originals first; do not clear browser storage to perform an upgrade.

## Independent checks that passed

- Updated `check-hikari-stale-session.mjs`: B commits a real multipart JPEG while A is open on an older catalog. A selects a photo and receives app focus; **zero A head PUTs**, no pause, A adopts B's count and generation in place. B's head bytes/ETag stay unchanged. Device `view.json`/`ui.json` are absent from the shared head. A reopens current/unpaused; a fresh profile retrieves the original with matching size/hash.
- `check-hikari-paused-upgrade.mjs`: actual 0.14.6 reproduces the view-only conflict and persisted pause. Upgrading assets to 0.16.0 at the same origin/profile adopts the newer catalog and clears the view-only pause without deleting storage. The local backup still downloads; a fresh profile verifies the remote original.
- `check-hikari-conflict-recovery.mjs`: genuine edits conflict without overwriting the winner; losing edit/pause survives relaunch. Keep both preserves that edit in a separately synced named library and returns main to the winning content. Rename/hide/show preserves data. Use this device conditionally creates a child of the current remote generation; another clean profile adopts it.
- `check-hikari-library-thumbnails.mjs`: two photos and originals committed in a named library; a clean browser profile opens it and both grid thumbnails draw without opening the individual photos.
- `check-hikari-photo-sync.mjs` at 390px/touch DPR 1: real small and multipart JPEG imports, scoped resume journal, committed originals mapping, new-profile restore and original hashes; read-only refusal remains enforced.
- `check-hikari-originals.mjs`: exact supplied original module, 200 MiB upload interrupted after 100 parts and resumed with only missing parts written, full read-back SHA-256, missing/damaged-part repair, intact reuse, hostile manifests, size guard and account-scoped journals.

These use exact shipped WASM/JS, supplied CSP and the real website shell, but simulated identity/atomic storage HTTP. They are **not** live Google Drive or kDrive tests. Broader upstream suites in Claude's handoff remain supplier reports unless separately listed above. No physical Android 200 MB result is claimed.

## Security and protocol review

`_headers`, `kobo.json`, `kobo-bridge.js` and `kobo-originals.js` match 0.15.0 byte-for-byte. `kobo-sync.js` changes its local helper root selection to validated `library` or `libraries/<uuid>` paths. Bridge operations remain v1.2.1; runtime v1.3/selectConnection/Save a Copy is not advertised. Remote cleanup/garbage collection stays disabled.

The exact WASM has 428 imports; none is directly named fetch/XMLHttpRequest/WebSocket/beacon/cookie. This limited static observation and restrictive CSP support the reviewed network design; they are not proof of absence of malicious behavior or a malware scan. The Windows binaries were not supplied/scanned/executed here. Claude's supplied security audit is archived as a **supplier document**, not adopted as an absolute safety guarantee.

## Remaining release gates

Run `TWO-DEVICE-ACCEPTANCE.md` on the uploaded RC on **both real providers**. Include genuine conflict recovery, originals/thumbnail restoration, interrupted uploads, library/account/provider changes and Android gestures. Complete the disposable Google private-index recovery drill in `PRIVATE-INDEX-RECOVERY.md`; a successful connection probe alone is insufficient.

Only then choose a live replacement and compatible rollback. Claude reports 0.15.0 main-format compatibility, but it cannot show new named libraries and retains the old sync behavior; do not silently downgrade a named-library workflow. Keep the recovery-aware website backend after any index restore.

Windows 0.16.0 currently has **no Kōbō cloud storage integration**; libraries are desktop folders. Billing and desktop runtime licence enforcement are also separate pending work. Do not publish an installer or enable public subscriptions on the basis of these web fixture tests.

## Reply to Claude

Exact supplied ZIP verified and prepared. Our independent stale-session regression now passes with zero selection-triggered head writes and in-place catch-up. We also passed actual 0.14.6 paused-profile upgrade recovery, real conflict persistence, Keep both, conditional Use mine, named-library preservation, fresh-profile automatic thumbnails, phone photo-original restoration and 200 MiB interrupted/resumed integrity against fixture storage. No bridge contract change is needed. The RC is ready for Claudia's real Google Drive/kDrive acceptance and the disposable index recovery drill; it is not live-approved. Please keep the Windows release draft and note that desktop Kōbō sync/licensing are not yet delivered.
