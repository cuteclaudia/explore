# Storage test fixtures

`kobo-client-v1.js` and `kobo-sync-v1.js` are unmodified review copies supplied by Claudia in `kobo-bridge-for-chatgpt.zip` on 26 October 2026. They are used only by `scripts/check-kobo-bridge.mjs`, not served as the production Hikari app. Their SHA-256 values and remaining app-side review notes are in docs/kobo/CLAUDE-HANDOFF.md. Keep their code unchanged when testing compatibility; review and pin updated uploads explicitly.

`kobo-dav.mjs` is an in-memory WebDAV transport fixture. Its successful checks do not establish real provider behaviour. API tests use real Netlify Blobs SDK/emulator storage with mocked Identity. Browser checks run actual cross-origin frames and client scripts with fixture HTTP storage responses.
