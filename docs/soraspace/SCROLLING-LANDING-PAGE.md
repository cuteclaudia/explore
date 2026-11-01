# Scrolling sales landing page and finding recent changes

Owner feedback: recent app-page work was hard to find on the splash. The earlier default slideshow exposed one group at a time, and much longer preview material sat behind a collapsed disclosure. The owner supplied a Dribbble scroll-landing search as direction. Attempts to inspect that reference, both live-site URLs and GitHub deployment status were denied by this environment (403/Forbidden), so no claim of direct reference inspection or live deployment verification is made.

## Where to find the changes after deployment

- Staging: `https://soraspace-platform-staging.netlify.app/#discover-apps`.
- Public canonical source: `https://www.soraspace.studio/#discover-apps`.
- A **Latest detailed previews** strip immediately below the header directly links SoraSlides/Akari and SoraDesign/Hinagata.
- Choose **App previews** in the header, **Explore the tools** in the hero, or **New app previews** immediately below it. Each goes straight to the visible preview gallery.
- The twelve detailed page cards are all visible: SoraSlides/Akari, SoraDesign/Hinagata, SoraDraw/Sen, SoraLayout/Hanga, SoraResearch, SoraProjects, SoraCRM, SoraShop, Journal, Photography, SoraTrip and My writing. The latest two are prominent, and all cards link to their actual detail path. Names come from the existing paired-name directory.
- **All apps** / **Browse by app group** goes to the complete 33-entry catalogue. Seven chapter links jump to each group; they stay available within the catalogue while scrolling. Both natural scroll and no-JavaScript views show every group.
- **Slideshow view** is an explicit optional choice. It keeps the earlier ordered tabs, eight-second rotation, manual selection/pause/play, hover/focus/off-screen/background pause and reduced-motion opt-in. **Scrolling view** returns all groups. Anchored group links reveal the scrolling view.

If the deployed page lacks the App previews navigation, preview gallery or Scrolling/Slideshow controls, that does not match this source version. Live-site access was blocked here, so hosting/deployment state cannot be diagnosed from the local build alone.

## Presentation and behaviour

The default is a continuous landing tour: a larger typographic hero, visible section navigation, purpose-specific preview gallery, grouped app catalogue, visible Home/dashboard concept, visible website templates, pricing and workspace entry. Original miniatures depict slide decks, interface frames, vector artwork, page spreads, a compact reference library, project board, CRM contacts, shop records, personal Journal, photo contact sheet, travel itinerary and writing. They are explicitly design illustrations with fictional content, not working engines or accepted app screenshots.

The full writing/editor examples and extended roadmap/research/travel mockups remain in optional disclosures. Existing anchors (`#app-previews`, `#writing-publishing`, `#future-workspace`, `#research-preview`, `#shop-preview`, `#translation-preview`, `#research`, `#soratrip`, `#templates`) remain present; the existing ancestor-opening behaviour reveals a bookmarked disclosure. The catalogue and featured gallery avoid duplicate `data-sales-app` identifiers: 33 source entries, twelve separate discovery cards.

A small page-progress indicator and restrained entry animation support the scrolling layout. There is no forced scroll snapping, scroll hijacking, automatic chapter scrolling or hidden initial content. Reduced motion removes the entry animation; no JavaScript still exposes the twelve cards, all groups, Home/templates and normal links. Progress and illustration controls do not call any service, store a visitor profile or send data. Optional slideshow mode does not persist across a fresh page load.

The same names, status labels, system appearance and ordinary navigation connect the marketing tour with the compact detail-page concepts. Existing 16-language routing and metadata remain; new English landing explanations are labelled English, and full editorial localisation stays open. Planned apps and restricted testing remain distinguished; no trial, publishing, payment or provider capability is activated.

## Local evidence

- `scripts/check-app-showcase.mjs`: default scrolling visibility, twelve discovery links, all 33 apps/seven groups, hero/section navigation, catalogue anchors, progress, optional slideshow/manual/keyboard/focus pause, eight-second playback, reduced-motion/no-JS behaviour and legacy bookmarks, at 320/390/768/1366 px.
- Existing individual app-page checks now navigate the scrolling chapter links. Metadata/sitemap coverage remains 320 locale routes and all 33 catalogue paths/guide anchors remain valid.
- The independent Explore landing smoke continues 320–1920 px, language persistence, system light/dark/forced colours, contrast, keyboard and CSP checks, expanding optional material only for its supplemental coverage. A bounded larger hero replaces its old tighter-height assumption.
- Internal preview captures: `/workspace/reviews/landing-scroll/desktop-top.png`, `app-previews.png`, `desktop-full.png` and `phone-top.png`. These show the current local source, not a verified live deployment.

Both repository sources are maintained together. Publishing status remains separate from pushed commits; no Netlify configuration, DNS, customer account, provider or production data is modified. Resume the app-page task list with SoraVideo/Kage and SoraAudio/Hibiki after this discoverability update. MKT-01 remains Partial for the remaining detail pages, localisation and release/hosting acceptance.
