# Owner access and publishing

## Current verified capabilities

- `/studio` is a public launch page, not a protected admin area. It contains no private data and cannot grant publishing rights.
- `/keystatic` is the existing journal, gallery and article editor. In development it edits repository files. Production uses Keystatic GitHub authentication and repository authorization. Production credentials and end-to-end deployed sign-in have not been verified in this workspace.
- Local browser testing created and saved a temporary journal draft (title, date, summary and rich body), then removed that test entry.
- Journal and photography collections already support drafts, dates, descriptions, covers, uploads, captions and location visibility.
- `/studio/photo-editor` processes a selected image locally: centre crops, quarter-turn rotation, horizontal flip, brightness/contrast/saturation, JPEG export up to 2400 px. It does not upload or publish. Exporting re-encodes pixels without original EXIF metadata.

## Requested next authentication system

Claudia requests Google, Microsoft and username/password sign-in for one owner, with community and public registration deferred. Do not represent the existing GitHub editor as satisfying this requirement.

Claudia confirmed email address and password. Recommended service: Supabase Auth, alongside Google and Microsoft OAuth. Google and Microsoft (Azure) providers require their own OAuth app registrations, provider credentials and callback configuration. No provider credentials are present in this workspace. Configure secrets in the service and Netlify settings; never put them in source or chat.

Required before implementing a replacement publishing workflow:

1. Create or connect the authentication project and configure exact production and development redirect URLs. Use one canonical Netlify origin for owner sign-in rather than arbitrary deploy URLs.
2. Enable Google and Microsoft OAuth plus password sign-in. Disable public password registration and allow only the explicitly provisioned owner to read drafts and write content. An authenticated Google/Microsoft visitor is not automatically an owner.
3. Enforce owner authorization in the content backend, not only the browser or a hidden menu. Use a fixed verified owner identity and server-side checks or database row-level policies. Require owner authorization for content writes and media uploads; do not expose service keys to the client.
4. Connect journal/gallery storage and publication to that backend. Signing into a wrapper around Keystatic would still require GitHub and would not satisfy the requested login methods. Preserve existing file content and article URLs while choosing the new publishing bridge.
5. Verify login, logout, session expiry, password reset, rejected non-owner accounts, unauthorized writes, draft visibility, authenticated uploads and publication using real provider configuration before claiming owner login is ready.

No custom passwords, insecure browser-only admin flags, fake social-login buttons or public registration are added in this iteration. Existing Keystatic access is retained while the replacement is designed and configured.

## Open-source additions

Evaluate focused maintained projects with compatible licenses, browser/server fit, security history and accessible UX before adding dependencies. The initial photo editor uses native canvas and introduces no image-processing dependency. Future editor, gallery and workflow integrations should be selected for a specific requirement rather than importing an unrelated application wholesale.
