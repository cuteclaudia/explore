# SoraSpace public landing site

Separate static Netlify project from the same repository. No dependencies, functions, login service, signup, forms, telemetry or environment secrets. Existing-user links explicitly open the current Explore app workspace. Customer registration/domain hosting/payment features are described as in development.

From this directory: `npm ci && npm run build`. Or from the repository root: `npm run build --prefix sites/soraspace`. The shared, dependency-free template catalogue is imported from `../../src/lib/soraspace-site-setup.mjs`; keep the repository checkout intact.

Netlify: repository `cuteclaudia/explore`, branch `main`, **base `sites/soraspace`**, package directory blank, command `npm run build`, publish `dist` relative to base. Do not use the root Astro build or copy Explore functions/secrets. Nested `netlify.toml` applies only to this new site.

For the selected first launch, use a ZIP of the generated `dist` files and Netlify manual deploy; no Git integration or build settings are required. Later manual updates go into the same project, not a new site.

Full owner instructions: [Netlify/domain setup](../../docs/soraspace/NETLIFY-AND-DOMAIN-SETUP.md). No new Netlify project, domain binding or DNS change has been made by committing this folder. No assumption that `soraspace-public.netlify.app` is available: use the hostname actually assigned.

Deployment output is limited to HTML/CSS/favicon, robots/sitemap, headers and 404. Strict CSP forbids script execution, forms, frames and network connections. There are no external fonts, trackers or runtime assets. Netlify platform-injected tooling must not be enabled without reviewing that policy. Signup/sign-in on `app.soraspace.studio` will be a separate deployment and authentication workstream.
