# SoraSpace public landing handoff

30 October 2026 (Sydney). Claudia selected manual ZIP deployment to a **new** Netlify project; Git setup is an optional later path. She plans to provide authorized Netlify/GoDaddy access for DNS after uploading. No project, DNS, certificate, signup or billing has been changed from this environment.

Source: `sites/soraspace`. Generate with `node scripts/package-soraspace-landing.mjs`. Public output is seven files under an extracted `soraspace` folder; no source, functions, identities, secrets or app binaries. The ZIP is the landing page, not the customer-workspace backend.

Delivered artifact: `/workspace/reviews/soraspace-release/soraspace-public-site-2026-10-30.zip` (7,127 bytes).
SHA-256: `c12cbf5265197e870ff8490df916c004802e68088745e64baf240a4d5bc7ee17`.
The same folder contains `SoraSpace-setup-guide.md`, `START-HERE.txt` and `SHA256SUMS.txt` outside the public ZIP.

Owner instructions: [Netlify and domain setup](NETLIFY-AND-DOMAIN-SETUP.md), **Option A**. Extract, drop the `soraspace` folder with index.html directly inside it, verify the assigned URL, rename the new project to soraspace if available. Renaming the project is not attaching `www.soraspace.studio`. Keep `explorebyclaudia` intact. Future ZIPs go into the same project's manual Deploys area; they are not updated automatically by our Git pushes.

Marketing page contains five starter-template cards and clearly describes registration/customer publishing/subscriptions as in development. Existing sign-in links explicitly open `https://www.claudiagilbert.com/apps` with noopener. There is no link to an unconfigured app.soraspace.studio origin. There are no scripts, forms, external fonts, analytics, iframe embeds or runtime API calls. A strict static CSP forbids scripts, forms, frames and connections. The prepared `_headers` file must accompany the HTML/CSS.

Owner questionnaire now supports Folio, Editorial, Horizon, Practice and Canvas. Business recommends Practice; personal recommends Canvas. All generated pages remain private drafts. Actual complete customer site provisioning/publication/editor remains gated; this does not make those five layouts production customer websites.

Validation: 250 server tests passed; actual questionnaire checks include the new templates; isolated public build checks verify the nested Netlify config selection, allowed output files, no private endpoints/forms, noopener links, keyboard and 320–1920px layouts, and enforced no-script CSP. Actual extracted ZIP entries/CRC and bytes were verified. The main Explore production build and packaged SSR/auth/private-data regression checks passed. Local synthetic screenshots are in `/workspace/reviews/soraspace-landing`.

Next owner action: upload and provide the non-secret assigned Netlify URL/project name. Then review actual SoraSpace authoritative DNS and use the exact new project's displayed CNAME/apex values. Do not reuse Explore's target or a stale IP. No wildcard/app records until matching services exist. Verify both apex/www HTTPS and automatic renewal status. Provider help fetches were blocked by this workspace's proxy; no current plan pricing or live provider state was verified.
