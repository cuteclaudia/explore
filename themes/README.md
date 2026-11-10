# SoraSpace site themes

Themes for the **SoraWebSite Manager**: the website builder offered to individuals and workgroups who sign up for a SoraSpace tenant. A tenant chooses a theme, then their own pages and content fill it.

Each theme lives in its own folder:

```
themes/
  README.md            this file
  manifest.json        index of every theme (read this first)
  <theme-id>/
    theme.json         theme definition: colours, type, shape, layout, pages
    index.html         self-contained preview with fictional sample content
    README.md          who it suits, pages used, colours, notes
  _tools/
    catalogue.mjs      source for every theme (edit this)
    build-themes.mjs   generates the folders and manifest
    themes.test.mjs    validity, contrast, freshness and security checks
```

Folders starting with `_` are tooling, not themes. Nothing in `themes/` is part of the claudiagilbert.com build, and commits that change only `themes/` do not trigger a Netlify deploy (see `ignore` in `netlify.toml`).

## How themes fit the existing site setup

Tenant site setup already exists in `src/lib/soraspace-site-setup.mjs` (purposes, five base templates, palettes, seven page types). Themes extend it without changing the data model:

| theme.json field | Maps to |
| --- | --- |
| `baseTemplate` | `SITE_TEMPLATES` key (`folio`, `editorial`, `horizon`, `practice`, `canvas`) |
| `purpose` | `SITE_PURPOSES` key used as the default when the theme is chosen |
| `pages` | `SITE_PAGES` ids only: `home`, `about`, `blog`, `articles`, `journal`, `galleries`, `contact` |
| `pageLabels` | Display names (e.g. Articles shown as “Menu”). The page type is unchanged. |
| `density` | `compact` or `comfortable`, as in site setup |
| `colours.light` / `colours.dark` | Theme palette. “System” follows the visitor’s device. Forced-colours mode falls back to system colours. |
| `layout.home` | Ordered home-page sections. `page` says which tenant page supplies the content. |
| `recommendedVisibility` | `public` or `private` (private suits family, memorial and internal team sites) |

No new page types are required. Where a theme would ideally have a Menu, Services, Timetable or Listings page, it uses an existing page type with a label and says so in its README.

### Section types

`intro` (text from About), `cards` (latest items from a page; `columns`, `count`, `images`), `list` (rows with title, text and a right-hand detail such as a price or date), `feature` (one highlighted item), `gallery` (`style`: `even`, `masonry`, `wide`, `strip`), `facts` (key details such as hours, location, phone), `people` (member or staff cards from About), `cta` (call-to-action band linking to Contact), `contact` (contact details and form).

### Font stacks

Only fonts already on the visitor’s device are used: `sans`, `serif`, `oldstyle`, `didone`, `slab`, `humanist`, `geometric`, `rounded`, `condensed`, `mono`. The stacks are in `_tools/catalogue.mjs` (`FONT_STACKS`).

## Rules every theme must follow

These follow the SoraSpace security and data rules and are enforced by `themes.test.mjs`:

1. **No scripts.** No `<script>`, inline event handlers or `javascript:` links. The preview’s appearance switch is pure CSS.
2. **Nothing loaded from outside SoraSpace.** No web fonts, CDNs, analytics, embeds, remote images or `url()` references. Each preview carries a `default-src 'none'` Content Security Policy.
3. **Tenant content is plain text.** When the site manager renders a theme, every tenant-supplied value must be escaped. Themes never ask for raw HTML.
4. **Contrast meets WCAG AA (4.5:1)** for body text, muted text, links/accent text and button text, in both light and dark.
5. **Fictional samples only.** No real people, businesses, addresses or Claudia’s own content (the Explore reference entry describes the look only).
6. **Generated files are current.** Edit `_tools/catalogue.mjs`, then rebuild.

## Adding or changing a theme

```
node themes/_tools/build-themes.mjs
node --test themes/_tools/themes.test.mjs     # or: npm run test:themes
```

Add an entry to `THEMES` in `_tools/catalogue.mjs` with the next number, build, run the tests, and open the new `index.html` in a browser to check light and dark.

## Theme list

Status: **built** = folder exists in this repo; **planned** = agreed, not yet built. Batches of ten are built in order.

| # | Theme | id | Status |
| --- | --- | --- | --- |
| 0 | Explore (reference) | `explore` | built |
| 1 | Photography portfolio | `photography-portfolio` | built |
| 2 | Artist studio | `artist-studio` | built |
| 3 | Restaurant & café | `restaurant-cafe` | built |
| 4 | Trades & local services | `trades-services` | built |
| 5 | Professional practice | `professional-practice` | built |
| 6 | Consultant | `consultant` | built |
| 7 | Writer & author | `writer-author` | built |
| 8 | Magazine | `magazine` | built |
| 9 | Musician & band | `musician-band` | built |
| 10 | Fitness & studio | `fitness-studio` | built |
| 11 | Wellness clinic | `wellness-clinic` | built |
| 12 | Stay (B&B and holiday rentals) | `stay` | built |
| 13 | Community group | `community-group` | built |
| 14 | Maker & small shop | `maker-shop` | built |
| 15 | Product launch | `product-launch` | built |
| 16 | Tutor & course | `tutor-course` | built |
| 17 | Student & graduate | `student-graduate` | built |
| 18 | Team & workgroup | `team-workgroup` | built |
| 19 | Research group | `research-group` | built |
| 20 | Club & society | `club-society` | built |
| 21 | Podcast | `podcast` | built |
| 22 | Wedding & events | `wedding-events` | built |
| 23 | Filmmaker | `filmmaker` | built |
| 24 | Architecture & interiors | `architecture-interiors` | built |
| 25 | Florist & garden studio | `florist-garden` | built |
| 26 | Travel journal | `travel-journal` | built |
| 27 | Family album | `family-album` | built |
| 28 | Executive CV | `executive-cv` | built |
| 29 | Recipe & food blog | `recipe-blog` | built |
| 30 | Hobby & collector | `hobby-collector` | built |
| 31 | Memorial & tribute | `memorial-tribute` | built |
| 32 | Coming soon | `coming-soon` | built |
| 33 | Hair & beauty salon | `hair-beauty` | built |
| 34 | Real estate agent | `real-estate` | built |
| 35 | Pet care & vet | `pet-care` | built |
| 36 | Farm & produce | `farm-produce` | built |
| 37 | Winery & cellar door | `winery-cellar-door` | built |
| 38 | Childcare & early learning | `childcare` | built |
| 39 | Tours & guiding | `tours-guiding` | built |
| 40 | Venue hire | `venue-hire` | built |
| 41 | Automotive & mechanic | `automotive` | built |
| 42 | Creative agency | `creative-agency` | built |
| 43 | Faith community | `faith-community` | built |
| 44 | School & parent group | `school-parents` | built |
| 45 | Conference & event | `conference` | built |
| 46 | Neighbourhood noticeboard | `neighbourhood` | built |
| 47 | Alumni network | `alumni` | built |
| 48 | Open-source project | `open-source` | built |
| 49 | Cause & campaign | `cause-campaign` | built |
| 50 | Team handbook | `team-handbook` | built |

`manifest.json` lists only built themes.

## Manifest fields for importers

- `schemaVersion` (1), theme `id`, `definition` (`themes/<id>/theme.json`) and `preview` (`themes/<id>/index.html`) are **stable**. Ids are never renamed; new fields may be added within schemaVersion 1, but existing fields are not renamed or removed.
- `batches[]` records each batch, its theme numbers, date added and whether it is ready to import.
- Each theme entry carries `batch` and `readyToImport`. `true` means the theme passed the validity, contrast and security checks and a visual review of its preview in light and dark, so its `theme.json` can be imported.
- Preview HTML is for people only. Importers should read `theme.json`, never parse `index.html`.
