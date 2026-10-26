# Hikari 0.14.3 review — 27 October 2026 (Sydney)

## Artifact

The three uploaded parts were joined in numeric order. The source ZIP's SHA-256 matches the supplied value:

`202f5a55c028c43c26744946b024f224d00ef2e24c56497a75eb48aefdf57712`

ZIP CRC validation passed. `scripts/prepare-hikari-test.mjs` now recognises this pinned release alongside 0.14.1. It prepares a separate static Netlify site, preserves the build's `_headers` and `kobo.json` unchanged, and omits only redundant precompressed variants and Apache .htaccess. It does not patch the WASM or startup code. The fixed strict CSP works with external main.js and requires no inline-script hash.

The prepared package is `hikari-test-site-0.14.3.zip`, SHA-256 `0a399a6a24bac97db5aed5034ff160a48f43dd55cf54b8193ccb4bbbfb298a2e`. Deploy it to the existing **cuteclaudia-hikari-test** project. It has not been uploaded to Netlify by this workspace.

Contract v1.2.1 is stored unchanged in this directory. Its message formats require no server API changes. The owner test page's outdated 0.14.1 waiting message is removed.

## Checks passed

- 93 server tests and the production build, including isolated packaged SSR guards.
- Current unmodified bridge/sync scripts against the actual shell in Chromium: handshake, source/app isolation, binary transfer, progress, preserving the caller's buffer, direct folder listing, size/path refusal, status subscriptions, segmented commits/hash verification and competing commits.
- Malformed heads reject reserved/duplicate logical names, fractional/oversized sizes and oversized head data before trusting the library.
- **Actual Hikari WASM and supplied CSP** in a cross-site frame: an album edit triggers a new committed generation; after clearing the isolated test profile's local app storage, the edited album restores from remote committed files.
- An account switch closes the previous iframe and opens a different local library namespace without the first account's added album.
- A conflicting remote ETag pauses sync, reports that local changes remain, and does not overwrite the remote head.
- A connection change closes/reopens the app into a separate namespace without silently copying the previous connection's pending edit.
- Sign-out removes the old app frame.
- With local storage blocked, the app warns that work is not saved and uses memory; no false remote save is reported.

These browser tests run real app code, CSP and shell, but **Identity and remote file HTTP responses are fixtures**. They do not establish live kDrive compatibility or deployed Netlify limits.

## Reproduce

Prepare the reviewed upload:

```sh
node scripts/prepare-hikari-test.mjs /workspace/attachments/hikari-web-0.14.3.zip /workspace/hikari-test-site-0.14.3
```

With an installed Playwright module and Chromium:

```sh
PLAYWRIGHT_MODULE=file:///opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs CHROMIUM_PATH=/usr/bin/chromium node scripts/check-kobo-bridge.mjs
PLAYWRIGHT_MODULE=file:///opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs CHROMIUM_PATH=/usr/bin/chromium node scripts/check-hikari-library.mjs /workspace/hikari-test-site-0.14.3
KOBO_BLOCK_STORAGE=1 PLAYWRIGHT_MODULE=file:///opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs CHROMIUM_PATH=/usr/bin/chromium node scripts/check-hikari-library.mjs /workspace/hikari-test-site-0.14.3
```

The normal-storage test removes only Playwright's default disabling of ThirdPartyStoragePartitioning, preserving normal browser partitioning. The blocked variant retains that test restriction. Every app/shell HTTP request in these browser checks is intercepted; there are no production credentials or provider calls. Any clearing of storage affects only the fresh isolated test profile.

## Local account-separation issue and website mitigation

**Needs an app-side fix before broader rollout:** when a signed-in account has no configured storage connection, Hikari 0.14.3 uses the generic local `library` folder. In a controlled shared-browser test, Alice began with 7 albums, added a private eighth album, then Bob (also without a connection) opened the same `library` and saw 8 albums. No remote files were shared or uploaded; this is a local fallback namespace defect.

The website owner test page now checks launch storage status before loading the app, and its shell requires available verified storage throughout the launch. If the connection is missing/unverified/disconnected, it refuses or closes the iframe. Current editors remain available separately. The storage API itself still returns normal unavailable status as the contract requires.

Claude should choose an account-scoped local namespace whenever status.userKey is present, even if available is false or connectionId is empty. Only a truly signed-out/standalone guest should use the guest namespace. Moving from account-local to a connected destination should ask before copying. Please add no-connection and provider-unavailable account-switch tests to the app acceptance suite.

## Remaining acceptance and follow-up

- Actual deployed Netlify Identity/relay and the user's real kDrive conditional operations, quotas and error handling.
- Photo-original upload/reopen and 200 MB interruption/resume/hash checks. The tests above validate the catalog/library; they do not certify original photo transfer.
- Safari, Firefox, private browsing, mobile and storage-eviction behaviour.
- When local storage is blocked, this build does not start remote Kōbō sync (web.stats shows kobo:null). Download/backup is the current fallback. App-side remote sync from memory is a potential follow-up to §9a.
- Automatic cleanup remains disabled, as agreed. Regular app users remain excluded from this new integration until joint acceptance; leave KOBO_STORAGE_ENABLED absent/false.

The current normal /apps/hikari editor stays in place while the rebuilt release is tested through /studio/kobo-test. No DNS or Squarespace changes are involved, and no new environment variables are needed to update the existing test app origin.
