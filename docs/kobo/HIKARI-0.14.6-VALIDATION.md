# Hikari web 0.14.6 — independent website-side review

27 October 2026. **Ready for joint owner acceptance, not general release.** Source commit `02402c0` is reported by Claude; the supplied web build was tested without patching its JS/WASM. No native rebuild or live cloud-account photo test was performed here.

## Package verification

All three part lengths and SHA-256 values match the handoff. Combined ZIP CRC and path checks pass.

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| Supplied source ZIP | 73,512,503 | `123660c894fe06e11d98e10b6bbb6e8ba37c4b5c2298dfd9b5c798c671b56f9f` |
| Prepared owner-test ZIP | 26,678,656 | `cec6c0ba6c4cff695d69338b0726eaae369c2045f93eedd26d1846e1c0ebaa09` |

Prepared artifact: `/workspace/hikari-test-site-0.14.6.zip`. The static preparation removes redundant `.gz`/`.br` copies and adds the Netlify publish-directory configuration, retaining application code, licences and the supplied security policy. Deploy only to the existing `cuteclaudia-hikari-test` site, not over Explore and not to a new origin. Back up current work before updating; do not clear browser storage.

## Originals fixes independently exercised

The exact supplied `kobo-originals.js` runs in a controlled VM with atomic in-memory storage, crypto and local-storage interfaces. No module code is changed by the test.

- Whole-file zero/1 MiB boundaries and the 1 MiB + 1 byte multipart case pass.
- **200 MiB / 209,715,200 bytes**: interrupt after 100 parts, confirm no manifest, resume the same upload, write only the missing 100 parts, reconstruct and match the whole SHA-256.
- The 0.14.5 missing-part reuse case is fixed: the published missing part is recreated, `repaired: 1` is returned, and the complete original verifies afterward.
- An intact published original causes no writes; a corrupted published part is repaired by CAS.
- Missing, corrupted and mis-sized downloads are rejected. Hostile manifests are refused before part reads.
- Two isolated module/local-storage contexts concurrently upload the same original and converge under the atomic fixture.
- A 300 MiB manifest returns `too-large` before the VM allocation guard is reached. This verifies the new bound; it is not a claim that every phone can safely process a 256 MiB photo.
- Two scope-specific interrupted upload journals are distinct; finishing A does not delete B's pointer.

The VM test remains able to reproduce the historical 0.14.5 reuse finding when explicitly run against that older package; that is not the result for 0.14.6.

## Exact WASM and strict-CSP browser checks

Used the actual website shell, supplied CSP, real WASM and Chromium. Identity and provider HTTP were fixtures. These results do not replace live kDrive/Google acceptance.

- Valid JPEGs of 775 and 2,919,999 bytes are dropped into Hikari. Background upload stores whole/multipart originals and commits `originals.json` with the catalog.
- A separate browser context, with none of the first context's caches, restores the catalog and the app automatically fetches its opened original. Both originals retrieved through the actual bridge match their original sizes/SHA-256.
- Original-upload readonly refusal propagates and writes no file; there is no fallback provider.
- Physical OPFS original directories are separated for Alice, Bob and known offline connections. A new account starts without the other account's originals in memory/cache. Guest originals remain in the guest store.
- New render-worker thumbnails are written under the account scope, without changing the pre-existing shared thumbnail folder.
- A real 0.14.5 account with a photo in the old shared cache recovers that catalogued photo into its scope on upgrade. An account first opened under 0.14.6 does not inherit that cache.
- One account's local library and two offline connections have distinct original caches. Returning to the prior connection retains its photo.
- The real `file.backupLibrary` command downloads a `hikari-library-backup-…zip`. Inspection confirms Alice's photo is included; Bob's, the guest's and Alice's other-connection photo are excluded.
- Catalog commit/restore, concurrent-head conflict pause, account/connection switch, logout and the website unconfigured-launch guard pass.
- The account suite passes offline/unconfigured separation, storage returning without reload, and same-origin 0.14.5 → 0.14.6 namespace/album preservation.

All 125 website server tests passed. Browser/module commands are separate from `npm test`:

```sh
node scripts/check-hikari-originals.mjs PREPARED_SITE
node scripts/check-hikari-photo-sync.mjs PREPARED_SITE
node scripts/check-hikari-caches.mjs PREPARED_SITE PREVIOUS_0_14_5_SITE
node scripts/check-hikari-accounts.mjs PREPARED_SITE PREVIOUS_0_14_5_SITE
node scripts/check-hikari-library.mjs PREPARED_SITE
```

Set `PLAYWRIGHT_MODULE` and `CHROMIUM_PATH` to installed browser tooling as needed.

## Acceptance boundaries and next live test

The website's Google connection and raw competing-write check passed in production, as shown by Claudia. The conditional HTTP 409 compatibility fix remains in place. This permits owner testing of writes; it is not full app acceptance.

After deploying 0.14.6 to the existing test origin, use the same Explore account and selected provider in two independent browser profiles. Import a small JPEG and a multipart-sized original in A, wait for both photo activity and catalog sync to finish, then open each photo in B (downloads are on demand). Confirm original hashes and edits, reload B, then test interrupted resume and concurrent edits. Repeat for Google Drive and kDrive; retain source originals and independent backups until those checks pass.

Provider adapters can refuse damaged/missing physical objects before app-level repair can obtain their bytes or ETag. Where repair is unavailable, an explicit integrity failure is acceptable; reporting a complete reused original without verified bytes is not. No live repair against externally corrupted Google objects is claimed by the fixture tests.

Photos over 256 MiB stay local; thumbnails may remain blank until originals are opened. Keep one original/one part uploading at a time, no cleanup, owner-only access and the current test origins. No new environment variables, subscription/domain changes or v1.3 operations are needed for this build.

## Contract review

Section 5's library-switcher layout is approved now, with the existing main namespace retained. The full v1.3 revision 3 is not yet frozen because cross-connection copy destination/registry semantics need one explicit decision. See `V1.3-REVISION-3-REVIEW.md`; this does not block Claude's library-switcher work on v1.2.1 operations.
