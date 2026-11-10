# Handoff: SoraWebSite Manager site themes

10 November 2026. From Claude (apps) to ChatGPT (website).

## What is new

Claudia approved a catalogue of **50 tenant site themes** for the SoraWebSite Manager, the website builder offered to SoraSpace tenants (individuals and workgroups). Claude is building them in batches of ten in this repository:

- **Location:** `themes/` at the top of `cuteclaudia/explore` (not under `src/` or `public/`).
- **Start here:** `themes/manifest.json` lists every built theme with its folder, `theme.json` and preview path.
- **Format and rules:** `themes/README.md` explains the `theme.json` fields, how they map to `src/lib/soraspace-site-setup.mjs`, the section types, and the full list of 50 with build status.
- **Each theme folder:** `theme.json` (definition), `index.html` (self-contained preview, open it in a browser), `README.md`.

**Batch 1 is built:** the Explore reference entry (#0) and themes #1–10: Photography portfolio, Artist studio, Restaurant & café, Trades & local services, Professional practice, Consultant, Writer & author, Magazine, Musician & band, Fitness & studio.

Further batches (#11–20, #21–30, #31–40, #41–50) will be added to the same folder. When one lands, `manifest.json` gains the new entries and the status column in `themes/README.md` changes from *planned* to *built*. Claude will add a short note to this file for each batch.

## Decisions already made

- Themes use **only the seven existing page types** (`home`, `about`, `blog`, `articles`, `journal`, `galleries`, `contact`). Display labels such as “Menu” or “Services” are in `pageLabels`; the page type stays the same. New page types (Menu, Events, Listings and so on) may come later; they are not needed now.
- Each theme builds on one of the five existing base templates (`baseTemplate`) and supplies its own colours (light and dark), typography, shape and home-page section order.
- **No scripts, no outside requests:** system fonts only, no CDNs, embeds, analytics or remote images. Tenant-supplied text must be escaped when rendered.
- Sample content is fictional. The Explore entry records the look only; the live `src/templates/explore.html` is unchanged.

## Not done yet: for the website side

The themes are **not yet offered in the site setup screen**. Claudia has not decided whether Claude or ChatGPT wires them in. Suggested approach when that is decided:

1. Load `themes/manifest.json` and each `theme.json` at build time (not from the browser at run time).
2. Add an optional `theme.id` to the site draft beside `template`, `palette` and `density`, validated against the manifest. Existing drafts without a theme keep working.
3. In setup, let the tenant pick a theme. Pre-fill `purpose`, `pages`, `template` and `density` from it, and keep the tenant’s choices editable.
4. Render with the theme’s tokens as CSS custom properties and its `layout.home` section order. Escape all tenant content.

## Working agreement

- To change a theme, edit `themes/_tools/catalogue.mjs`, then run `node themes/_tools/build-themes.mjs` and `npm run test:themes`. Do not hand-edit generated files; the tests fail if they are stale.
- Commits that touch only `themes/` skip the Netlify deploy.
- Please record questions or changes for Claude in the shared handoffs folder (`docs/handoffs/` in soraspace-platform). Claude could not write there in this session, so this note is in explore.
