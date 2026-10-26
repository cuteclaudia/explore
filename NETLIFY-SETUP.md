# Netlify settings for Explore by Claudia

These settings apply to the actual Netlify project, not just the separate Codex cloud environment. Do not paste secrets into chat. A saved environment variable requires a new deploy before Functions use it.

## Environment variables

| Key | Value | Secret checkbox | Scope | Context |
|---|---|---|---|---|
| OWNER_IDENTITY_ID | Identity UUID of verified claudia@claudiagilbert.com | No | Functions (All scopes also works) | Production |
| OWNER_GOOGLE_IDENTITY_ID | Separate Identity UUID of verified claudiaegilbert@gmail.com | No | Functions | Production |
| FILE_STORAGE_ENCRYPTION_KEY | 32 cryptographically random bytes encoded as base64 (44 characters); generate once using /studio/storage | Yes | Functions | Production |
| WEBDAV_ALLOWED_HOSTS | Exact approved public WebDAV hostnames separated by commas, e.g. cloud.example.com; no scheme/path/port/wildcard | No | Functions | Production; only needed for WebDAV |
| OWNER_EMAIL | Optional bootstrap address; defaults to claudia@claudiagilbert.com | No | Functions | Production |

Choose Different value for each deploy context and fill Production. Keep production credentials out of untrusted deploy previews. If a plan only offers All scopes, that can work, but never name a secret with a PUBLIC_ prefix. For a separately configured trusted staging environment, use its own storage/key/account setup. OWNER_GOOGLE_IDENTITY_ID is not a role; keep the primary owner's UUID unchanged.

The encryption key is needed for saved WebDAV credentials, not for basic Netlify file storage. Keep the same key after connections are saved. Changing/losing it requires restoring the prior key or reconnecting the WebDAV accounts. The generator on the private storage page creates the key in browser memory; it does not transmit or persist it. The key must never appear in source, screenshots or chat.

## Identity

Keep Identity enabled, Invite only, and email confirmation Required. Invite each owner email under Identity → Users. Deploy callback code before accepting the invitation. The verified setup screen displays the account's ID and the correct variable name; pin it and redeploy. Other emails never receive owner privileges from a matching role or browser metadata.

Enable Google under Identity → Registration → External providers → Add provider → Google. Netlify's default OAuth app is sufficient initially. Google for claudiaegilbert@gmail.com is a separate Identity account and must be pinned using its own UUID. Google authentication is not Google Drive permission. Microsoft is not currently integrated.

## Build and storage

Branch main; base directory blank; build npm run build; publish dist. Node 24 is in netlify.toml. Keep the Netlify functions directory at netlify/functions. The prebuild downloads pinned official Craft releases and verifies their SHA-256 digests before preparing assets. No Rust compiler or third-party API keys are needed for those browser builds.

Netlify Blobs should supply runtime credentials automatically to deployed Netlify Functions. No Blobs token is placed in the browser and no manual NETLIFY_AUTH_TOKEN is required by this implementation. Files are stored privately as immutable chunks with a checksum and can be restored/downloaded after sign-in. Named stores persist independently of a site deploy; check plan usage limits and establish a backup policy. The current per-file limit is 50 MiB. Production storage operation has not yet been verified using a real authenticated owner; local isolated application tests are not proof of hosted readiness.

## WebDAV user settings

After the encryption key and allowed hostname are configured, go to Account → Storage connections. Enter the complete existing HTTPS WebDAV folder URL, username and an app password. The folder must already exist. Test and save creates a uniquely named temporary test file, then removes it. The connection password is encrypted per user and never returned to the browser. The server rejects unapproved/private/loopback hosts, pins a validated public DNS address for the TLS request, does not follow redirects and does not disable TLS checks.

Saved cloud revisions offer Copy to WebDAV. This copies the verified private revision to the user's WebDAV folder; it does not publish it, and it does not remove the site's private copy. This increment is not WebDAV-only storage or folder synchronisation. Users cannot use an unapproved private-LAN NAS endpoint through this public server.

## Publication and outstanding providers

Publish export shares only a finished PDF/JPEG/PNG/WebP through the Published library; native projects stay private. A publication title is required; public tags may be added. Unpublish removes public availability while retaining the private working revision. Article/journal/gallery publishing is now available separately at `/studio/content`, using the same Identity login. Existing repository content is imported for editing and overridden at its original public URLs; private drafts and published snapshots are stored in the `studio-content` Blobs store. No additional environment variables or GitHub login are required for this workflow. A saved draft leaves the current published version unchanged. Deleted items can be restored as unpublished drafts. The About/settings repository editor still uses Keystatic.

Google Drive/OneDrive cloud storage, payments, digital-goods entitlements and the additional office apps are not connected. Do not add guessed OAuth/Stripe variables for them. They require separate implementations and provider approval later.

## Required real-world validation after setup

Test each owner's login and setup, Google callback, private upload and reopen after a fresh session, an unauthorised account/direct API request, a real WebDAV test/copy, publication and unpublish from a signed-out browser. The current tests verify application logic and actual browser exports, but not these production service connections.


## Optional existing Keystatic editor

The optional repository file editor still uses GitHub independently of Identity. It is no longer the default Studio article/journal/gallery workflow. If its GitHub App connection has not been set up, Keystatic requires its own generated `KEYSTATIC_GITHUB_CLIENT_ID` (not secret), `KEYSTATIC_GITHUB_CLIENT_SECRET` (secret), `KEYSTATIC_SECRET` (secret), and `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` (public, not secret). Use the values generated for the site's Keystatic GitHub App, not a personal GitHub password or invented credentials. Server values need Functions; the PUBLIC slug must also be available at build time. Refer to the existing README's Keystatic GitHub App setup. These are not required for Studio content editing/publishing, the four creative workspaces or their private file saves. The legacy editor's live GitHub login has not been verified by this workspace.

## Using the integrated content editor

After signing in, choose My Studio → Manage writing & photography. Journal/gallery cards and the previous `/studio/photo-editor` bookmark now lead to the integrated workflow. Choose a new article/gallery or open an existing item. Save draft, Preview saved draft, Publish and Unpublish are separate actions. On an open public article/gallery, owner controls offer Edit, Make a copy and Delete. Opening a gallery photograph provides a full-size page with Edit, Copy photo to draft and Remove photo from draft. Photo changes still require publishing the gallery; removing the final photograph means the gallery must stay unpublished or receive a replacement before it can be published.

No new Netlify variables are required for this increment. The existing two owner UUID bindings and automatic Blobs runtime access are used. Validate a small test article and gallery on the hosted site before relying on it. Drafts/uploads live in Blobs, so a Git repository backup alone does not back them up. Local/browser tests do not establish that your actual hosted credentials are configured.


## Invited app users and save destinations

Community can stay off while invited users use selected apps. Invite an email under Netlify Identity → Users; have the user verify the invitation. As an owner, open Studio → User permissions, check only the individual `tools.*` app capabilities required, leave suspension off and save. Users with no app grants remain denied. The user can then sign in and open `/apps`; the app fills the window and offers an optional browser full-screen button. Hikari remains pending until its rebuilt browser release is delivered; current LightCraft remains the temporary implementation.

App-only users have no article editing, publishing or administration permissions while community is off. Each protected file request checks the actual signed-in user and fresh grants. Private revisions and preferences are scoped to that user; other app users cannot list/read them. The pinned owners retain administrative access to site-stored files.

In the full-window app, Save/Export opens a choice of Download to this device, Private site storage or My WebDAV folder. Remember this choice stores the destination on the user's account, not a device folder handle. Each export still requires a Save click. Supported browsers ask for a device file destination; others use normal browser downloads and browser download settings. WebDAV copies retain a private site revision first; connect the user's WebDAV folder in Storage connections before choosing that destination. Its hostname still needs the administrator's allowlist. Large exports above the managed 50 MiB limit fall back to native downloads. Google Drive remains unavailable. No new environment variables are needed for save preferences.


## Account Settings and mapping update

Account → Settings (`/settings`) now contains appearance (including Sakura Pink and Kōbō), custom colours, spacing and reduced motion. Signed-in users can save these preferences to their account; guests save appearance in their browser. File-save destination updates preserve appearance fields, and vice versa. Files & storage remains `/studio/storage` with the shared default destination and per-user encrypted WebDAV settings for all apps. Sign-in & security remains `/studio/account`. Activities & maps is `/settings/connections`; activity consent and file storage are separate concerns.

`/places` adds key-free 2D/3D map viewing and local GPX route previews. No extra Netlify environment variables are required for this map. OpenFreeMap provides the basemap and Mapzen's public AWS terrain dataset supplies elevations; the browser must be able to reach those services. The worker is bundled locally. Current browser checks use local style/terrain fixtures because this cloud environment blocks those external origins; live provider delivery still needs a real browser check on Netlify. Live Strava/Garmin/Komoot sync is not connected and provider approval/credentials have not been invented. See MAPPING-RESEARCH.md for the comparison, licensing and rollout plan.
