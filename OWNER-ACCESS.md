# Netlify Identity owner access

## Implemented in this increment

- Official `@netlify/identity` 2.0.0 integration; no Supabase dependency.
- The email/password form is visible immediately, independent of provider discovery or JavaScript startup. A same-origin-checked POST fallback keeps credentials out of URLs.
- `/studio/login` provides email/password, enabled Google-provider discovery, invitation password setup, confirmation callbacks, password reset and sign-out. Public signup is not offered. Microsoft is not a supported provider in the reviewed Netlify documentation/SDK.
- Default email links landing on the homepage are routed to the login callback handler before the homepage hash router interprets them.
- `/studio`, `/studio/photo-editor` and `/studio/users` are server-rendered private routes, with no shared caching. Anonymous requests redirect to sign-in.
- `/api/studio/session` verifies the current account; `/api/studio/users` lists accounts only for the pinned owner; owner-only access updates accept a fixed allowlist of capability booleans and account suspension, and check the request origin.
- Owner binding is by `OWNER_IDENTITY_ID` (Identity UUID), not by client metadata, role names or email alone. The owner has every registered capability and cannot have those rights changed through the site's access endpoint. Other accounts remain denied because community is hard-disabled in server code.
- Capabilities are stored in server-managed `app_metadata.capabilities`. Protected requests fetch the current Identity user record rather than trusting stale permission claims. User-editable profile metadata does not grant privileges.
- Unknown capabilities, unknown payload fields, role escalation, anonymous requests, unverified accounts and unavailable Identity verification fail closed.
- The checkbox user-access screen locks the owner's grants. Saving access for a future user does not turn community on.

## Required Netlify setup

1. Keep Identity enabled, registration **Invite only**, and email confirmation **Required**.
2. Deploy this login/callback code before inviting the owner. Default Netlify email templates/sender suffice; custom templates/sender and Identity audit-log UI require Pro or higher according to the supplied documentation.
3. In Identity → Users, invite **claudia@claudiagilbert.com**. Accept the email on the stable `explorebyclaudia.netlify.app` origin and set a password.
4. Once verified and signed in, the setup screen displays only that account's own Identity UUID. Add it as **OWNER_IDENTITY_ID** to the Netlify project's environment variables (Functions runtime scope), then redeploy. This UUID is not a password, and displaying it grants no capabilities before it is pinned.
5. Optional **OWNER_EMAIL** defaults server-side to `claudia@claudiagilbert.com` and is used only to restrict the initial setup-ID display. Once pinned, ownership follows the UUID even if the email changes. Do not delete/recreate the owner account; recover it through Netlify if needed. Netlify project administrators can still change environment configuration or delete Identity accounts outside the site's controls.
6. Enable Google under Identity → Registration → External providers if desired. Netlify's default OAuth app can be used; custom OAuth branding is optional. Verify it resolves to the intended invited account before depending on it.
7. Test actual invitation delivery/acceptance, login, Google if enabled, recovery, logout, refresh, owner access and rejected non-owner access on the deployed site. Never paste passwords, invite links, recovery tokens, sessions or operator tokens into chat/source.

No owner account, provider or Netlify variable has been created or changed by this workspace. Missing owner binding deliberately keeps protected tools unavailable; a successful build is not a successful production login test.

## Validation

`node --test server/access.test.mjs server/studio-access.test.mjs` runs authorization tests. Function-handler tests replace the external Identity service with an explicit test double; they do not establish hosted provider readiness. Browser checks verify public login UI/callback routing and anonymous denial. Real owner authentication remains unverified pending the setup above.

## Publishing and editors

The existing `/keystatic` editor remains a separate GitHub-authenticated file editor. Identity login does not unlock it. The integrated Identity-compatible writing/media publishing backend is still to be implemented; do not describe this increment as delivering a complete replacement CMS. Existing article URLs and content files are unchanged.

See `EDITOR-RESEARCH.md` for the researched editor options. The photo editor's local edit/export capability remains; it now requires owner authorization in the hosted site. No PhotoCraft/LightCraft/WordCraft/GenOffice application is embedded or represented as available yet.

Identity's Pro audit log covers authentication/account events; a detailed application log for publishing, uploads and individual permission changes has not been implemented in this increment.
