# claudiagilbert.com

Claudia Gilbert's personal site: strategy and security writing (the China Series and the Daily Cyber Threat Report) alongside Explore — journal, photography and places.

Built with [Astro](https://astro.build) and hosted on [Netlify](https://www.netlify.com). Studio uses Netlify Identity for sign-in and private Netlify Blobs for content drafts, published versions and uploaded photographs. Original repository content remains the import source; edited versions override it at the same URLs. Keystatic remains available for repository-only settings such as About.

## Writing and editing

Sign in at `/studio/login`, then open `/studio/content`. No separate GitHub login is required for articles or photo galleries. See [NETLIFY-SETUP.md](NETLIFY-SETUP.md) for the two owner UUID bindings and provider setup.

- Create a journal, China Series essay, cyber report or photo gallery, or edit an existing item.
- Write rich text with headings, lists, links, tables and inline photographs. Add a cover, date, summary, tags and a location visibility setting.
- Save draft retains the current published version. Preview opens a private saved draft. Publish replaces the live version immediately without a site rebuild. Unpublish retains the working draft.
- Upload JPEG/PNG/WebP files; the browser resizes/re-encodes them to JPEG (maximum 2400 px, 4 MiB upload), stripping original metadata. Reopening an existing gallery allows crop/rotate/flip/brightness/contrast/colour editing, replacing or duplicating photos, reordering, captions and individual photo tags. Double-click an inline article image to edit it.
- Signed-in owners see Edit, Make a copy and Delete on an open public page. Copies are unpublished drafts with independent uploaded-image records. Delete unpublishes and moves to Deleted items; Restore returns an unpublished draft.
- Existing repository article URLs and credited reference photographs remain available for editing. Blobs overrides take priority over repository edits after a page has been edited in Studio; do not edit the same item in both systems expecting automatic merging.

Original files remain in Git, but Studio drafts, versions, bin items and uploads live in Netlify Blobs and are not committed to GitHub. Back up that store separately. A draft is a working copy, not an automatic version history or automatic keystroke backup.

### Location privacy

Studio entries have a location visibility setting; approximate displays the broad location text you enter, rather than rounding coordinates automatically. Only type what readers should see (for example "Hokkaido, Japan"). Never store exact addresses or coordinates in this repository: if the repository is public, everything in it is public, including drafts. Publish journeys after you return rather than while you are travelling. Strip GPS data from photos before uploading them.

## One-time setup

1. **Netlify:** Add new site → Import from GitHub → choose this repository. The build settings come from `netlify.toml`.
2. **Keystatic on the live site:** run `npm run dev` locally once with the editor in GitHub mode (temporarily change `import.meta.env.PROD` to `true` in `keystatic.config.ts`), open `/keystatic` and follow the prompt to create a GitHub App. It writes the four `KEYSTATIC_…` values to `.env`. Copy them into Netlify → Site configuration → Environment variables, and change the line in `keystatic.config.ts` back. See `.env.example`.
3. **Contact form:** Netlify detects the form automatically. Set the notification email under Netlify → Forms.
4. **Images from Squarespace:** before closing the Squarespace account, run `node scripts/migrate-squarespace-images.mjs` to copy the remaining article images into the repository.
5. **Domain:** in Netlify, add `claudiagilbert.com` and `www.claudiagilbert.com`, then update the DNS records where the domain is registered. Do this last, after checking the Netlify preview address.

Existing Squarespace addresses (`/chinaseries/…`, `/dailycyberreport/…`, `/about`, `/contact`) are unchanged, so existing links keep working.

## Photography credits

Landscape photography from [Pexels](https://www.pexels.com) under the Pexels licence; photographers are credited where their work appears.


## Local content development

Use Node 24, `npm ci`, then `npm run dev:content -- --host 127.0.0.1 --port 4322`. This starts a local Netlify Blobs emulator plus foreground Astro; data persists in ignored `.netlify/content-local-blobs`. Stop this process with Ctrl+C. It supplies local storage only, not a fake owner login; authenticated Identity still requires a real supported service context. Anonymous private/API requests must remain denied. The plain `npm run dev` workflow does not supply a Blobs service for the dynamic public content pages. Production uses Netlify's runtime credentials automatically and must never use the local emulator token.


## Apps for invited users

`/apps` is separate from the private Studio. Owners grant specific `tools.*` capabilities through `/studio/users`; invited verified users see only granted apps. Community remains disabled and non-tool permissions are masked for app-only users. `/apps/{tool}` fills the window and uses an explicit destination prompt after export, with a per-account remembered destination. Native device permissions remain browser-managed; WebDAV must be connected separately. Owner administration remains private; other app users cannot read the owner's files. Owners retain administrative access to site-stored files.


## Deployment compatibility check

`npm run build` also runs `npm run test:deploy` via its postbuild hook. Stop local Astro development servers before building, because adapter startup also resets the generated function directory. The check copies the deployable SSR package outside the repository, starts a temporary Blobs emulator and exercises it under `node --no-require-module`, matching Netlify's CommonJS/ESM loading restriction. It verifies public content/RSS, authentication redirects and unpublished legacy overrides. The sanitizer/parser dependency tree is bundled through `vite.ssr.noExternal` so the function does not require an ESM-only parser from CommonJS at runtime. Keep this compatibility check when updating dependencies; successful development rendering alone does not verify the deployment package.
