# Desktop downloads and subscription direction

27 October 2026. Installer configuration and access checks are implemented. Billing, paid-plan checkout, automatic renewals/cancellation and licence validation inside the desktop binaries are **not implemented** by this change. Do not describe existing manual grants as verified payments.

## Available now

Owner Settings → Desktop installers (`/studio/downloads`) configures one Windows, macOS and Linux link per currently available app, with optional version and SHA-256. Accepts HTTPS GitHub release pages or release assets. Use a pinned installer release and its checksum when available. Empty URL removes that platform; no guessed upstream binaries are preconfigured.

My Studio and My apps have a compact Desktop menu alongside each app. Only configured, permitted downloads appear. Links pass through `/api/desktop/download`, which freshly authenticates and authorizes the account before redirecting; raw installer URLs are not in the availability response. Owner installer configuration is protected server-side, CSRF-checked and conditionally saved to prevent stale updates.

Owner User permissions has separate `desktop.<tool>` grants. A desktop-only grant admits the personal Studio/download area but does not grant the corresponding `tools.<tool>` web editor, app storage bridge, site content editing or owner privileges. Existing web app grants include that app's desktop download. Suspension/revocation is checked again at download time. Grants are currently manual; grant them only to people you intend to authorize.

## Proposed paid plans

- **Desktop:** lower-priced subscription, including entitled desktop installers/updates and whatever support/sync benefits are explicitly agreed.
- **Web + Desktop:** higher-priced subscription including the browser apps and all corresponding desktop benefits.

Exact prices, renewal periods, app/suite coverage, offline grace period and cancellation behavior are still to be decided. Most heavy editing in the current web builds runs as WASM in the user's browser. Web pricing can reflect hosting, storage bridge operations, backup/index infrastructure, support and convenience; it should not assume all editing is server-side compute.

For paid launch, a billing provider's verified server-side webhooks should grant/revoke authoritative entitlements. Do not trust browser profile fields, checkout return URLs or a menu's visibility as proof of a subscription. Preserve owner access and define any existing testers' grandfathering explicitly.

**A public GitHub installer URL can be shared, and a downloaded binary remains on the computer.** Gating the site's button is not enforcement inside the application. Subscriber-only use needs Claude to implement account/licence checks in each desktop app, with a defined signed/offline licence policy, expiry/grace and revocation behavior. Alternatively downloads can use private delivery, but even private delivery alone cannot revoke a copied binary. Review each upstream licence and retain required notices before charging or distributing builds; this work adds no new restrictions to upstream licences.

## Message for Claude

Claudia plans Desktop and Web + Desktop subscriptions, with the latter including desktop access. The website now has owner-managed GitHub installer links (platform, version, optional checksum), compact per-app Desktop menus and separate desktop-only access grants; web grants include desktop. There is no billing integration or desktop runtime licence enforcement yet. Please coordinate account/licence validation and a bounded offline policy before a paid release, preserve upstream notices, and send rebuilt installer URLs/checksums when ready. No desktop executable, subscription price or payment flow has been invented or published by the website changes.

## Validation

145 server tests passed including desktop-only/web-includes-desktop permissions, revoked/anonymous download refusal, owner/CSRF configuration protection, URL validation, conditional installer updates and saved System/custom theme mode. Browser checks passed for live OS-theme changes/account save/reload/custom independence, and the configured-platform desktop menu with server-authorized links, Escape dismissal and no overflow at 390px. Menu layout uses extracted real styles with a card fixture; server authorization is tested separately.

## Compact access management

People & access now shows one summary row per person. Owners have a protected Full access summary with no disabled checkbox wall. Other users expand Edit access for a small app-by-platform matrix and an optional Other permissions section. Search filters the rows. Power (all four currently available apps) and Creator (Irodori/Hikari/Tsuzuri) are checkbox presets; Desktop only and Web + Desktop are separate choices. Per-app overrides remain possible. Presets do not grant site administration and are not stored billing tiers. Power Creator awaits the additional design apps; Student and Worker mappings remain to be agreed rather than guessed.

Shared page, Studio and Settings spacing/headings are reduced while article typography and iframe canvases retain their own sizing. `check-compact-permissions.mjs` covers collapsed owners/users, Creator/Desktop application, explicit desktop grants across web edits, owner flags excluded, save/search and mobile no-overflow. The production build/isolated deployment checks passed after these layout changes.
