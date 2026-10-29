# SoraSpace branding and intended address

29 October 2026 (Sydney). Claudia selected **SoraSpace**, with intended public address **https://www.soraspace.studio**. Japanese rendering: **ソラスペース**. The website showcase uses “Space for everything you create” and “by Claudia.” Claudia supplied an order receipt for two years of `soraspace.studio`; the receipt says registration is in progress. Registration completion, DNS, HTTPS and trade mark status have not been independently verified.

## Display rename

Updated the Explore app showcase/product pages, workspace header/launcher, Studio app links, app wrappers, storage settings/instructions, appearance label, SVG icon titles and selected server error text. The full Japanese name appears on the public showcase; the workspace uses a compact sky character as decoration. The workspace subsequently adopted SoraSpace Photos, Image Editor, Docs, PDF, Mail and Sheets as display names; native names remain smaller references. See [welcome dashboard](SORASPACE-WELCOME-DASHBOARD.md). The subscription proposal and Claude handoff now use SoraSpace.

This is a website presentation change, not a rebuild of Claude’s apps. Native/app-internal branding may retain the earlier name until separately accepted builds arrive.

## Compatibility retained

- Existing `/kobo`, `/kobo/<app>`, `/apps`, test, account and API routes keep their addresses and authorisation.
- Component/module names, CSS selectors, capabilities, app IDs, message types, launch headers, iframe origins, allowlists and environment variable names retain their existing identifiers.
- The actual Google Drive `Kōbō` root and its `kobo*` properties remain unchanged. WebDAV layouts, connection IDs, browser cache/storage keys, index snapshots and encryption keys are unchanged. Settings describe existing app folders rather than pretending to have renamed them.
- No storage operation, file migration, paid plan activation, DNS change, app-site deployment or sign-in callback change occurs here. No automatic redirect sends users to an unverified new host.

Old names in code, cloud folder names and historical handoff/evidence files are therefore expected and must not be globally replaced. Branding is not a reason to rename a storage namespace or rotate a key.

Verification: 213 server tests passed; workspace, public app/product pages, storage settings and phone wrappers passed existing browser checks at phone/tablet/desktop widths. The phone-wrapper fixture now substitutes the launcher with a real 44px control rather than leaving an unrendered Astro component in raw HTML. Production build and isolated Netlify package checks passed. Storage root names/properties and origin configuration were inspected and retained.

## Domain preparation, separately

1. The domain order is placed. Wait for registration completion and verify control of `soraspace.studio` at the registrar; `www` is a subdomain, not a separate purchase. Review renewal costs and auto-renewal.
2. Decide the isolated workspace hosting/routing arrangement and verify the apex/`www` redirect and HTTPS before linking or setting any destination variable. Existing `PUBLIC_KOBO_WORKSPACE_URL` currently supports the previously planned host only; it has **not** been changed to accept/activate SoraSpace’s domain.
3. Test authentication on both websites with explicit account binding; cookies/local sessions do not automatically transfer across `claudiagilbert.com` and `soraspace.studio`. An access token in a URL is not a migration solution. Keep Explore’s current host/canonical URLs unchanged.
4. Review iframe CSP/origin allowlists, same-site browser-storage partitioning, provider OAuth callbacks, account/connection switching and native activation issuer/redirect policy. A top-level site change can affect app storage even when the iframe URL stays the same.
5. Preserve originals, browser/library backups, encrypted private-index exports and the existing encryption key. Stage the new site with disposable accounts and complete two-device/recovery checks before any cutover.
6. Introduce the accepted domain through a separately tested destination/routing change. Keep old app origins and a compatible fallback. Redirect only after testing; do not move or duplicate live app files to achieve a cosmetic rename.

European hosting remains deferred until Netlify stability/app acceptance. The new brand/domain does not imply a jurisdiction or data-residency change. A future public `/soraspace` route or new host can be added independently; existing saved/bookmarked `/kobo` links continue working today.
