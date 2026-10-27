# Hikari web 0.14.5 — website-side review

Reviewed 27 October 2026. **Owner testing only; not production acceptance or a live-provider certification.** Supplied source commit reported as `c7bcba8`; no independent native rebuild was performed.

## Archive

All three part sizes/hashes match Claude's handoff; combined ZIP CRC/path checks pass:

- Combined source ZIP: 73,488,525 bytes.
- SHA-256: `9dd11411515c64257b82635591152d8368aa7b9464aabb0eb6441b3010c9c575`.
- Prepared owner-test ZIP: `/workspace/hikari-test-site-0.14.5.zip`, 26,671,166 bytes.
- Prepared SHA-256: `a16d4e849a1b7096f020f7435ae41266290ae96d63eb74b4fc66b1583cbc824f`.

Preparation keeps the supplied application code and notices, strips redundant precompressed assets, and adds only the static Netlify publish configuration. `_headers`, `kobo.json`, bridge, library-sync module, `main.js` and worker match 0.14.4. `index.html` adds the same-origin `kobo-originals.js` script under the existing strict CSP. No application/WASM patch was made.

## Independent checks performed

These are our checks, not a claim to have rerun Claude's reference-WebDAV suites verbatim.

### Exact originals module with atomic in-memory storage

`scripts/check-hikari-originals.mjs` executes the supplied JS unchanged in a VM with controlled storage and browser-like crypto/storage interfaces. It verifies:

- Whole-file storage/reopen/reuse, including zero bytes and the exact 1 MiB boundary.
- A 1 MiB + 1 byte multipart original.
- **200 MiB (209,715,200 bytes)** interrupted after 100 parts, with no manifest published; resume uses the same upload directory and uploads only the missing 100 parts.
- Full reconstructed SHA-256 matches the source.
- Missing, corrupted and mis-sized parts are refused on download.
- Wrong part size, wrong whole-file hash, oversized manifest size, traversal upload ID, wrong part count and a part name containing a path are refused before any part read.
- Simultaneous same-photo uploads from separate module/local-storage contexts converge in an atomic storage fixture.

The test explicitly records the reuse-path finding below. Its successful exit means the positive integrity checks passed and the finding was reproduced, **not** that the finding is resolved.

### Real browser and WASM integration

`scripts/check-hikari-photo-sync.mjs` runs the supplied WASM, JS and CSP with the actual website shell. Identity and storage HTTP responses are controlled fixtures.

- Two valid JPEGs (775 bytes and 2,919,999 bytes) are dropped into Hikari.
- Background upload stores the small original whole and the large original in parts, publishing its manifest.
- A committed library generation includes `originals.json`.
- A completely new browser context, with no original browser's caches, restores the catalog and Hikari fetches its opened photo from storage.
- Both originals are fetched through the supplied originals module and actual bridge; sizes and SHA-256 match the imported bytes.
- A server-side readonly refusal is propagated for an original upload; no file is written and no fallback provider is used. This does not certify every native readonly UI state.

The initial CDP-only storage-clear experiment retained a partitioned original cache, so it was not counted as independent-device proof; the separate-context test replaces that weaker experiment.

The existing real-WASM catalog suite also passed commit/restore, account/connection changes, conflict pause, logout and the website's unconfigured-launch guard. The account suite passed unconfigured-account and offline-provider separation, storage returning without reload, and a same-origin **0.14.4 → 0.14.5** upgrade retaining the connected namespace and album. These are catalog-isolation checks; original/thumbnail caches are not yet strictly account-isolated.

All 120 website server tests passed. The new tests change no application runtime code or storage contract.

## Findings for Claude

### 1. Published-manifest reuse can report success for missing data

Reproduced with the exact supplied module:

1. Upload a valid multipart original.
2. Remove its first referenced remote part in the test fixture, preserving the published manifest.
3. `get()` correctly fails with `missing part 0000`.
4. Call `put()` again with the full correct source bytes.
5. It returns `reused: true`, `uploaded: 0`; the part is still missing.

The initial manifest-reuse branch in `putParts()` only parses manifest structure. The manifest-race loser branch likewise only parses the winner's manifest. A valid shape and claimed SHA-256 do not establish that the referenced bytes exist and match. Please either verify/repair the referenced parts against the available source bytes under create-only/CAS conditions, or return an explicit incomplete/integrity error. Do not declare a complete reusable original solely because a structurally valid manifest exists. Preserve manifests, references and existing valid parts; cleanup remains disabled.

At minimum also compare manifest size and expected per-part hashes with the supplied original. A different source size with the same claimed manifest digest must not be accepted merely on the claim. If upload reuse intentionally means only “manifest exists”, document that narrower guarantee and keep it separate from any “fully backed up/verified” UI; it must not be presented as a repair or integrity test.

### 2. Cache namespace work should include the resume journal

The acknowledged original and thumbnail cache work is still outstanding. Include `kobo-upload/<app>/<sha>` resume entries too: scope by account, app and connection, while sharing originals only among libraries in that same scope. Local data must not cross accounts via caches, resume pointers, restore pointers or incidental background tasks. Do not automatically copy the shared legacy cache into another account.

### 3. Download allocation budget

The module currently accepts manifests up to 4 GiB and immediately allocates `new Uint8Array(m.size)`. A numeric upper bound of 4 GiB is not a demonstrated safe browser/phone memory budget. Before broader use, stream verified parts to account-scoped storage with incremental hashing, or enforce a smaller tested in-memory limit and return `too-large` before allocation. The independent test demonstrates 200 MiB, not safe 4 GiB operation.

## Live acceptance still pending

Google is server-enforced read-only until the deployed **Test connection** passes the raw competing-write checks. A final surviving index value alone is insufficient. Neither these photo fixtures nor Claude's reference WebDAV tests certify production Google/kDrive or two physical devices.

Keep photo uploads at one photo/one part at a time for now. The four-operation shell allowance also has to accommodate catalog commits, status polling and lease refresh. No new environment variables, domain changes or v1.3 operations are required for this release.

A prepared ZIP is available for isolated owner testing, not a production replacement or a reason to clear browser data. Await the cache-isolation fix and the reuse/integrity clarification before treating this as a complete photo-backup release. Preserve original photo files and an independent library backup meanwhile.
