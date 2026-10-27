# Hikari web 0.14.4 — website-side review

Reviewed 27 October 2026. This records independent checks, not a claim that Claude's reported suites were rerun verbatim or that live provider acceptance is complete.

## Verified package

- Source commit reported by Claude: `97a2dd6` (not independently rebuilt).
- Combined ZIP: 73,451,326 bytes.
- Source SHA-256: `cf15d7ca41cbf8e4e2448e6be53496f7e984ea3d9ca63d07b241164d2bd8e2a3`.
- All three part hashes and ZIP CRC/path validation passed.
- `_headers`, `kobo.json`, `index.html`, `main.js`, bridge and sync scripts match the reviewed 0.14.3 files byte-for-byte. The supplied CSP and app origin allowlist are preserved. No WASM or app code was patched.
- Prepared Netlify ZIP: `/workspace/hikari-test-site-0.14.4.zip`, 26,659,835 bytes.
- Prepared ZIP SHA-256: `923a94691e66a9aea971c71b294739ef7c1dac400d9a19cb43ac146fee1c8985`.

Preparation strips the redundant `.gz`/`.br` assets, retains all licence/font notices, and adds `netlify.toml` with the static publish directory. The headers and index sit at the ZIP root.

## Real-WASM browser checks

Used the supplied CSP, the website's actual shell and Chromium with normal third-party storage partitioning. Identity/provider HTTP responses were fixtures, not live cloud accounts.

- Catalog edits auto-commit; a fresh local browser library restores the committed remote catalog.
- Account changes close the old iframe and open a distinct library.
- A simulated competing save pauses sync and does not overwrite the remote head.
- Connection changes do not copy the old local library.
- Logout tears down the iframe; the production website still blocks unconfigured owner-test launches.
- With that guard disabled **only in the test harness**, Alice and Bob without connections get distinct `library-user-*` namespaces and retain their own albums across reopen.
- Guest mode uses `library`, never the signed-in account's library.
- Known but unavailable connections use distinct `library-kobo-*` namespaces per account; storage returning starts sync in the same namespace without a reload or guest-copy prompt.
- Serving 0.14.3, making and syncing an album, then serving 0.14.4 at the same origin in the same test browser retains the connected local namespace and album.

Commands (set `PLAYWRIGHT_MODULE` and `CHROMIUM_PATH` for the installed browser):

```sh
node scripts/prepare-hikari-test.mjs SOURCE_ZIP PREPARED_DIRECTORY
node scripts/check-hikari-library.mjs PREPARED_DIRECTORY
node scripts/check-hikari-accounts.mjs PREPARED_DIRECTORY PREVIOUS_0_14_3_DIRECTORY
node --test server/google-drive-concurrency.test.mjs
npm test
```

## Concurrency evidence

The independent worker test checked logical conflict results and the final index, without a shared process lock. **A subsequent stronger test showed why that is insufficient to certify atomicity:** a write accepted by an unsafe backend may later fail the commit helper's read-back check. The local Blobs emulator accepted both raw competing creates during the stronger probe. Google uploads in the worker test were simulated; no live distributed acceptance is established by it.

The website now inspects raw SDK write results in a live-capable diagnostic: exactly one accepted and one refused conditional write are required for both create-only and CAS, followed by stale-write refusal and winning-value verification. The production backend must pass this test before Google gains server-side write permission. User file mappings and originals are untouched by the index probe. The live test and two-device app acceptance remain pending.

All 115 server tests passed after adding this test. The browser core/account/upgrade checks above passed separately.

## Remaining limits and deployment

Photo originals are not cloud-synced in 0.14.4. A restored catalog does not prove restoration of its imported original files. Original and thumbnail caches still need the stricter account/connection namespace noted by Claude. Keep the release owner-only; do not loosen the website's existing launch guard on the strength of the catalog fix alone. Photo sync, interruption/resume, 200 MB integrity, independent-device reopen and live-provider races remain joint acceptance work.

Back up important current work before updating. Extract the prepared ZIP and upload its folder to **the existing `cuteclaudia-hikari-test` Netlify project's Deploys page**. Do not deploy it over Explore, create a new origin, change environment variables, move DNS or clear browser storage. Updating the existing origin preserves browser storage; the controlled upgrade test does not replace checking Claudia's actual existing library.

No v1.3 feature is enabled by this package. See `V1.3-REVIEW-AND-CLAUDE-REPLY.md` for the proposed next contract, safeguards and six answers.
