# claudiagilbert.com

Claudia Gilbert's personal site: strategy and security writing (the China Series and the Daily Cyber Threat Report) alongside Explore — journal, photography and places.

Built with [Astro](https://astro.build), edited in the browser with [Keystatic](https://keystatic.com), and hosted on [Netlify](https://www.netlify.com). All content is stored as files in this repository, so nothing is locked into a platform.

## Writing and editing

- **On the live site:** go to `/keystatic`, sign in with GitHub, and edit. Each save is a commit to this repository, and Netlify republishes the site in a minute or two.
- **On your computer:** run `npm install` once, then `npm run dev` and open http://localhost:4321/keystatic. Edits save straight to the files here.

The editor has:

| Section | What it holds |
|---|---|
| Essays | The China Series and standalone essays — `/chinaseries/…` |
| Daily Cyber Threat Reports | One entry per report, pre-filled with the title and region — `/dailycyberreport/…` |
| Journal | Travel writing — `/journal/…` |
| Photography | Galleries — `/photography/…` |
| Home page / About page | The home page text, default colour palette and About text |

Tick **Draft** to save something without publishing it.

### Location privacy

Journal entries and galleries have a **Location shown to readers** field and a precision setting. Only type what readers should see (for example "Hokkaido, Japan"). Never store exact addresses or coordinates in this repository: if the repository is public, everything in it is public, including drafts. Publish journeys after you return rather than while you are travelling. Strip GPS data from photos before uploading them.

## One-time setup

1. **Netlify:** Add new site → Import from GitHub → choose this repository. The build settings come from `netlify.toml`.
2. **Keystatic on the live site:** run `npm run dev` locally once with the editor in GitHub mode (temporarily change `import.meta.env.PROD` to `true` in `keystatic.config.ts`), open `/keystatic` and follow the prompt to create a GitHub App. It writes the four `KEYSTATIC_…` values to `.env`. Copy them into Netlify → Site configuration → Environment variables, and change the line in `keystatic.config.ts` back. See `.env.example`.
3. **Contact form:** Netlify detects the form automatically. Set the notification email under Netlify → Forms.
4. **Images from Squarespace:** before closing the Squarespace account, run `node scripts/migrate-squarespace-images.mjs` to copy the remaining article images into the repository.
5. **Domain:** in Netlify, add `claudiagilbert.com` and `www.claudiagilbert.com`, then update the DNS records where the domain is registered. Do this last, after checking the Netlify preview address.

Existing Squarespace addresses (`/chinaseries/…`, `/dailycyberreport/…`, `/about`, `/contact`) are unchanged, so existing links keep working.

## Photography credits

Landscape photography from [Pexels](https://www.pexels.com) under the Pexels licence; photographers are credited where their work appears.
