# SoraSpace public landing handoff

30 October 2026 (Sydney). Claudia selected manual ZIP deployment to a **new** Netlify project; Git setup is an optional later path. She plans to provide authorized Netlify/GoDaddy access for DNS after uploading. No project, DNS, certificate, signup or billing has been changed from this environment.

Source: `sites/soraspace`. Generate with `node scripts/package-soraspace-landing.mjs`. Public output contains localized HTML, shared styles/icons, a local language bootstrap, sitemap/robots, error page and generated security headers under an extracted `soraspace` folder; no source, functions, identities, secrets or app binaries. The ZIP is the landing page, not the customer-workspace backend.

Delivered artifact: `/workspace/reviews/soraspace-release/soraspace-public-site-2026-10-30.zip` (7,127 bytes).
SHA-256: `c12cbf5265197e870ff8490df916c004802e68088745e64baf240a4d5bc7ee17`.
The same folder contains `SoraSpace-setup-guide.md`, `START-HERE.txt` and `SHA256SUMS.txt` outside the public ZIP.

Owner instructions: [Netlify and domain setup](NETLIFY-AND-DOMAIN-SETUP.md), **Option A**. Extract, drop the `soraspace` folder with index.html directly inside it, verify the assigned URL, rename the new project to soraspace if available. Renaming the project is not attaching `www.soraspace.studio`. Keep `explorebyclaudia` intact. Future ZIPs go into the same project's manual Deploys area; they are not updated automatically by our Git pushes.

Marketing page contains five starter-template cards and clearly describes registration/customer publishing/subscriptions as in development. Existing sign-in links explicitly open `https://www.claudiagilbert.com/apps` with noopener. There is no link to an unconfigured app.soraspace.studio origin. There is one local integrity-pinned language bootstrap for device/saved preferences. There are no forms, external fonts, analytics, iframe embeds or runtime API calls. A strict static CSP authorizes only that bootstrap hash and forbids other scripts, forms, frames and API connections. The prepared `_headers` file must accompany the HTML/CSS.

Owner questionnaire now supports Folio, Editorial, Horizon, Practice and Canvas. Business recommends Practice; personal recommends Canvas. All generated pages remain private drafts. Actual complete customer site provisioning/publication/editor remains gated; this does not make those five layouts production customer websites.

Validation: 250 server tests passed; actual questionnaire checks include the new templates; isolated public build checks verify the nested Netlify config selection, allowed output files, no private endpoints/forms, noopener links, keyboard and 320–1920px layouts, and an enforced CSP (now allowing only the pinned language bootstrap). Actual extracted ZIP entries/CRC and bytes were verified. The main Explore production build and packaged SSR/auth/private-data regression checks passed. Local synthetic screenshots are in `/workspace/reviews/soraspace-landing`.

Next owner action: upload and provide the non-secret assigned Netlify URL/project name. Then review actual SoraSpace authoritative DNS and use the exact new project's displayed CNAME/apex values. Do not reuse Explore's target or a stale IP. No wildcard/app records until matching services exist. Verify both apex/www HTTPS and automatic renewal status. Provider help fetches were blocked by this workspace's proxy; no current plan pricing or live provider state was verified.

## Compact system-appearance update (v2)

Claudia selected project name **soraspacestudio**, with `https://soraspacestudio.netlify.app`. She is setting up DNS and now wants to link GitHub for automatic updates. There is no direct Netlify tool/CLI authentication in this environment. Use [continuous deployment and appearance instructions](CONTINUOUS-DEPLOYMENT-AND-APPEARANCE.md) for the existing project; do not create another project or reset its domains.

The current packaging script defaults to v2, `/workspace/reviews/soraspace-release-v2/soraspace-public-site-2026-10-30-v2.zip` (7,613 bytes), SHA-256 `dab958c16129244ca9cbc9b26ecbc22b1d08939ec00722e5560c2537a5c75110`. The original first-launch artifact above remains preserved. v2 ships compact sans-serif/system-colour light/dark styling, matching 404 and an appearance indicator. New questionnaire drafts default to System; explicitly saved colour choices remain supported. No credentials, app origins or live storage changed.

Checks: 251 server tests passed, owner flow/system-preview response to OS changes passed, public system light/dark/live switching/forced-colours/contrast and 320–1920px checks passed, and the existing Explore production build/package checks passed. Test screenshots are local emulations, not physical-device or live-deployment verification. The v2 guide explains automatic Git deployment and uploading the fallback ZIP into the same project's Deploys area.

## Workspace entry links update

The public landing now offers a direct primary Open workspace action, a compact four-card workspace/files/setup/editor area and an owner-administration footer link. Destinations remain on the existing authenticated Explore origin, open with noopener, and label owner-only previews; no private files, identity service or administration API are deployed into the static project. Registration and customer publishing remain closed. Static checks include an actual mocked new-tab launch with null opener and unchanged original page.

Claudia supplied a Netlify screenshot showing `feb5e56` cancelled and `da4dd98` still published. Cancellation reason was not available; no build failure or data loss is established. The cancelled commit primarily added private Explore tools, so unchanged-base skipping is a possibility, not a verified diagnosis. This update changes `sites/soraspace` directly and should produce a fresh build under the linked project. Check the next deploy's status/log before claiming live completion; existing published deploy remains the fallback. If cancellation continues, inspect its recorded reason rather than changing DNS or credentials.

Validation: separate public build, 320–1920px overflow/touch controls, system light/dark/live switching/forced colours and text contrast, five templates, static output/config allowlist, only the pinned language bootstrap and no forms/private endpoints, protected-origin/noopener links and the mocked workspace launch passed. The prior packaged owner-route/API checks remain relevant; this increment changes no backend code.

## Registration, research previews and pricing update

The landing now uses Sign In / Sign Up, links to a gated same-origin-account-server signup flow, adds four labelled illustrative app previews, and explicitly mentions Zotero-compatible research management and later project management. Research Library, Projects and AI remain planned. Zotero desktop support is documented in the supplied Docs engine source; no browser Zotero connection has been implemented. Pricing has two proposed package directions with final amounts unannounced; no checkout is live.

See TRIAL-SIGNUP-AND-SERVICES.md before enabling a new-email test. Registration needs SORASPACE_SIGNUP_ENABLED=true and provider Open/confirmation-required settings on the existing explorebyclaudia project, not a second Identity service on soraspacestudio. The flag is off by default. Approval remains manual and payments off. Account/service preferences do not grant app/admin access. Tests prove two approved non-owner trial drafts are isolated and administrator/store access is denied. Actual confirmation email and provider configuration still need Claudia's acceptance test.

Current source packaging defaults to a separate v3 artifact directory, preserving original/v2 ZIPs. Git continuous deployment is the preferred update path. New static links depend on the matching Explore backend deploy; check both projects before enabling registration. Validation: 262 server tests, signup/pending/service-choice browser tests with mocked Identity/mail, existing login/permissions/editor regressions, system/responsive public checks and production packaged owner/trial isolation checks passed.

Current device-language matching and preference scope are documented in [App names and languages](APP-NAMES-AND-LANGUAGES.md). Deploy the generated HTML, language.js and _headers as one matching build.
