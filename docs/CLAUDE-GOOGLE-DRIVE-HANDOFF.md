# Kōbō collaboration update: website storage and editors

The website now has an experimental Google Drive adapter behind the same Kōbō operations. WebDAV remains supported. No migration happens on connection or provider selection. Global `KOBO_STORAGE_ENABLED` remains off; owner testing only until real acceptance passes.

## App-side contract review needed

- Status may now contain `provider: "google-drive"`, alongside `"webdav"`.
- Operation names, byte limits (1 MiB), strong quoted logical ETags and conflict behavior remain unchanged. Google ETags identify atomic index revisions; do not parse or reinterpret them as native Drive tags.
- Google files are immutable versions; conditional publication uses a private website index. This is not a claim of native Google WebDAV support.
- Google `connectionId` binds the Explore user, OAuth client, Drive account and Kōbō root. Changing the selected provider/account changes the connection namespace. Preserve per-user *and* per-connection local library isolation.
- Do not automatically upload or merge a local library on connection/provider changes. Ask before copying a true guest library.
- Keep the pending fix for signed-in users with no connected provider: their local libraries must still be scoped by `userKey`; only actual signed-out guests may use a generic guest library.
- Cleanup/garbage collection remains disabled. Google remove only removes the current logical reference; snapshots are retained.
- Tokens, OAuth codes and client secrets never enter the app frame. The website owns authorization and refresh.

The real 0.14.3 WASM build accepted `google-drive` in the controlled shell test: edit/autocommit, restore, account isolation, conflict pause, connection switch and logout passed against a simulated storage service. This does not test live Google. Please record the provider value in the contract, then provide the next build with the unconfigured-account isolation fix. We still need shared live tests on kDrive and Google Drive: real-photo upload/resume, library reopen after clearing isolated test-browser data, conflict pause, account/provider change, sign-out and restricted browser storage behavior.

## Website-only work

The writing editor is more compact and supports font size/family, alignment and line spacing. About Claudia now has owner-only text/image sections, rearrangement and draft/preview/publish. These do not require app changes.

Google Cloud setup instructions are in `docs/GOOGLE-DRIVE-SETUP.md`. No real Google authorization or production acceptance is claimed from simulated API tests.
