# Squarespace → Netlify migration status

The local Explore prototype now includes the existing repository content: 3 China Series essays, 11 cyber reports, About, and links to Contact and RSS. Article URLs under `/chinaseries/` and `/dailycyberreport/` are retained. The Explore by Claudia interactive prototype is now the root homepage, with `/prototype/` retained as a compatibility page. The previous editorial homepage is preserved at `/strategy`. These changes do not alter Squarespace or DNS.

## Verified locally

- Frozen dependency installation with `npm ci --cache /tmp/explore-npm-cache --no-audit --no-fund`.
- Production build with `ASTRO_TELEMETRY_DISABLED=1 XDG_CONFIG_HOME=/tmp/explore-config XDG_CACHE_HOME=/tmp/explore-cache npm run build`.
- Writing data comes from Astro content collections through the built `/prototype-content.json`; drafts are excluded. The archive is searchable and filterable.
- Existing article bodies render through the existing Astro article pages. They are not rewritten or reduced to summaries.

## Required before cutover

1. Compare the live Squarespace sitemap and an export against repository content. Live site reads were blocked by the environment network policy; completeness is unverified. No journal entries or photography collections are currently stored in the content collections. Prototype landscapes are demonstration content. Community and member routes are disabled.
2. Download and preserve Squarespace-hosted images before closing Squarespace. The current image migration helper was inspected but NOT run: its failed-download path can replace an unresolved URL with `undefined`. Correct that failure handling in a coding task before using it; preserve content and verify every downloaded image.
3. Review article citations pointing to OneDrive document fragments. Confirm they are accessible to readers or supply public references; do not silently remove citations.
4. Inventory every old URL and add redirects where paths differ. Current Netlify configuration includes `/home` → `/` and `/cyber` → `/dailycyberreport`; a complete redirect audit is still required.
5. Use a separate Netlify draft/staging site first. Verify the Node 24 build, Keystatic GitHub App configuration, form detection and actual contact submission, canonical metadata, RSS, sitemap, image loading, and all internal links. Local static hosting does not process contact forms or run Keystatic server functions.
6. Review the Explore by Claudia homepage and navigation. Do not deploy, push, change DNS, or connect this checkout to automatic production publishing without authorization.
7. Switch the domain only after staging acceptance; retain Squarespace and a content export until the new site is verified and rollback is possible.

## Owner tools

The public `/studio` page links to the existing content editor and the browser-only `/studio/photo-editor`. A public studio link does not authorize publishing. Keystatic uses GitHub authentication in production; the requested Google/Microsoft/password owner account is not implemented or configured yet. See `OWNER-ACCESS.md`.

## Local run

Build first, then run `python3 -m http.server 4321 --bind 0.0.0.0 --directory /workspace/explore/dist`. Open the prototype through a supported development preview interface when available. This onboarding interface does not expose a public browser preview URL. Full content pages use the existing site layout with an Explore v1 return link.
