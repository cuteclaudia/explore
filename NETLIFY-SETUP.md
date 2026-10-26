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

Publish export shares only a finished PDF/JPEG/PNG/WebP through the Published library; native projects stay private. A publication title is required; public tags may be added. Unpublish removes public availability while retaining the private working revision. This does not replace the article/journal CMS: writing/galleries still use Keystatic with separate GitHub auth and branch-qualified production URLs.

Google Drive/OneDrive cloud storage, payments, digital-goods entitlements and the additional office apps are not connected. Do not add guessed OAuth/Stripe variables for them. They require separate implementations and provider approval later.

## Required real-world validation after setup

Test each owner's login and setup, Google callback, private upload and reopen after a fresh session, an unauthorised account/direct API request, a real WebDAV test/copy, publication and unpublish from a signed-out browser. The current tests verify application logic and actual browser exports, but not these production service connections.


## Optional existing Keystatic editor

The current article/journal/gallery file editor still uses GitHub independently of Identity. If its GitHub App connection has not been set up, Keystatic requires its own generated `KEYSTATIC_GITHUB_CLIENT_ID` (not secret), `KEYSTATIC_GITHUB_CLIENT_SECRET` (secret), `KEYSTATIC_SECRET` (secret), and `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` (public, not secret). Use the values generated for the site's Keystatic GitHub App, not a personal GitHub password or invented credentials. Server values need Functions; the PUBLIC slug must also be available at build time. Refer to the existing README's Keystatic GitHub App setup. These are not required for the four new creative workspaces or their private file saves. The legacy editor's live GitHub login has not been verified by this workspace.
