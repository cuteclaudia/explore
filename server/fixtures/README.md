# Storage test fixtures

`kobo-client-v1.js` and `kobo-sync-v1.js` are unmodified review copies supplied by Claudia in the checksum-verified `hikari-web-0.14.3.zip` on 27 October 2026 (Sydney). They replace the earlier standalone review package. They are used only by `scripts/check-kobo-bridge.mjs`, not served as the production Hikari app. Their SHA-256 values and remaining app-side review notes are in docs/kobo/CLAUDE-HANDOFF.md. Keep their code unchanged when testing compatibility; review and pin updated uploads explicitly.

`kobo-dav.mjs` is an in-memory WebDAV transport fixture. Its successful checks do not establish real provider behaviour. API tests use real Netlify Blobs SDK/emulator storage with mocked Identity. Browser checks run actual cross-origin frames and client scripts with fixture HTTP storage responses.
