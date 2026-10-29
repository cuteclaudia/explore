# Claudia's SoraSpace Netlify and domain setup

30 October 2026 (Sydney). The public landing site is prepared in `sites/soraspace`. **Claudia chose manual ZIP deployment for the first launch; use Option A below. Git deployment is optional.** The domain registration, current DNS records and Netlify projects have not been checked through a live provider session. Official help pages could not be fetched from this execution environment (proxy CONNECT 403); dashboard labels may differ. Always use the exact DNS values Netlify displays for your new project.

## The arrangement

| Address | Purpose | Netlify project | Action now |
| --- | --- | --- | --- |
| `www.claudiagilbert.com` | Explore, current app workspace and HobbyNest preview | Existing `explorebyclaudia` project | Leave it unchanged |
| `www.soraspace.studio` | Public product information, templates, eventual signup/sign-in entry | **New separate public project**, suggested name `soraspace` (or `soraspace-public` if unavailable) | Create this one now |
| `soraspace.studio` | Redirect to `www.soraspace.studio` | Alias on the same new public project | Add alongside www |
| `app.soraspace.studio` | Future authenticated customer workspace | A **second new workspace project** later | Reserve the name; do not point it to Explore or the landing project yet |
| `alex.soraspace.studio` or a customer's domain | Customer's published site, never their private workspace | Future tenant-aware publisher | Not active; no wildcard DNS today |

You need **one new Netlify project now**. The second workspace project needs a tested identity/database/credential and app-origin migration; copying Explore's project or changing its primary domain would not accomplish that safely.

A single code repository can feed separate Netlify projects. The public project uses only its own build directory; it must not publish Explore's `dist` or deploy Explore's functions. A future shared publisher can serve multiple verified customer domains, rather than manually creating an entire new codebase/project for each customer. Netlify domain automation, certificate handling and plan limits still need qualification before offering that commercially.

## Before you click anything

1. Confirm `soraspace.studio` appears in your GoDaddy account and registration has completed. `www` and `app` are subdomains; you do not buy them separately.
2. Check the domain's **Nameservers** setting. If it uses GoDaddy/default `domaincontrol.com` nameservers, edit DNS at GoDaddy. If it names another provider, edit DNS at that provider instead. Do not change nameservers just to follow this guide.
3. Save a screenshot/export of SoraSpace's current DNS and any domain-forwarding settings. Keep existing mail MX/TXT/SPF/DKIM/verification records. SoraSpace and `claudiagilbert.com` are separate domains; do not edit the working Explore/Microsoft 365 DNS.
4. Use the same Netlify account/team already connected to GitHub. Review the current plan/usage allowance in its dashboard; no plan upgrade or extra paid service is required by the code. Actual Netlify plan eligibility and costs have not been verified here.

## Option A — First launch with the provided ZIP (chosen approach)

No GitHub connection, build command, base directory, environment variable or Identity setting is needed for this method. The ZIP contains already-built public files only, not the Explore repository.

1. Download **`soraspace-public-site-2026-10-30.zip`** supplied with this handoff.
2. Extract it on your computer. You should get a folder named **`soraspace`**.
3. Open that folder to check that **`index.html` is directly inside it**, alongside `styles.css`, `favicon.svg`, `_headers`, `robots.txt`, `sitemap.xml` and `404.html`. Do not drop a parent folder with an extra nested `soraspace` folder as its site root.
4. Sign in to Netlify, in the same account/team as Explore. Choose **Add new project/site → Deploy manually**, or open [Netlify Drop](https://app.netlify.com/drop) while signed in. Exact labels can vary.
5. Drag the extracted **`soraspace` folder** into the manual deployment drop area. Netlify should publish the prepared static files without a build/install step. Do not replace a deploy in `explorebyclaudia`.
6. Open the newly assigned `…netlify.app` URL. Confirm it shows SoraSpace, the five template cards and the “registration is not open yet” notice.
7. In this **new project's** configuration, rename the project/site to **`soraspace`** if available; otherwise use `soraspace-public` or another unique variation. The menu may say Project configuration → General → Project details → Change project name, or Site settings → Change site name. Record the resulting actual `…netlify.app` URL.
8. Renaming the Netlify project changes its Netlify subdomain; **it does not attach the purchased custom domain**. Continue with Step 2 below, or give ChatGPT authorized provider access to help complete that part after reviewing the actual target.

Do not enable Forms, Identity, visitor password collection or account registration for this landing page. It has none of their backend components. No settings or secrets are copied from Explore. Existing-user sign-in deliberately opens the working Explore workspace, clearly labelled, until the separate SoraSpace account service is ready.

**Future manual updates:** upload the next extracted site folder into **this same project's Deploys/manual-deploy area**. Do not create a new project for each ZIP. The custom domain stays attached to the project. Pushing source changes to GitHub does not update a manually deployed project until Git integration is deliberately configured. Keep a previous ZIP/deploy for rollback.

## Option B — Optional later: connect GitHub instead of manual uploads

1. In Netlify, choose **Add new project/site → Import an existing project** (or the equivalent Git import option).
2. Choose **GitHub**, then repository **`cuteclaudia/explore`**. This is another project from the same repo, not replacement of `explorebyclaudia`.
3. Select branch **`main`**.
4. Name the new project **`soraspace-public`** if available, otherwise a unique variation. Record the actual generated `…netlify.app` address; the name suggested here is not a reserved hostname.
5. Set the build fields exactly as follows:

| Field | Value |
| --- | --- |
| Framework | None / static site, if asked |
| Base directory | `sites/soraspace` |
| Package directory | Leave blank; base already selects the package |
| Build command | `npm run build` |
| Publish directory | `dist` **relative to the base directory** |
| Functions | None; do not copy the root `netlify/functions` directory |
| Node version | `24` (already declared in the site's configuration) |
| Environment variables | None required for this public site |

The nested configuration is `sites/soraspace/netlify.toml`. It sets the landing build command and publish directory. Setting the **base directory before the first deployment** is what selects the separate package/configuration. Do not replace or edit the root `netlify.toml` or root Astro `site` URL.

6. Deploy. If the wizard deploys before letting you set a base directory, set it in this new project's build settings and redeploy before connecting a domain.
7. Open the assigned `…netlify.app` address. You should see the SoraSpace landing page and five template cards, **not** Explore's home page or an editor login.
8. In the deploy log, look for `SoraSpace public landing built: 5 starter templates; no functions, identity, forms or private app data.` The new project should deploy no app/server functions. If you see Astro/Keystatic, `prepare-craft-tools`, `OWNER_IDENTITY_ID` setup errors or Explore functions, the base/package configuration is wrong. Correct this project's settings and rebuild; do not add Explore secrets to work around it.

**Do not copy environment variables or enable Identity/Forms on the public project.** It has no account service, database, storage credentials, OAuth callbacks or signup form. The working existing-user sign-in link deliberately opens the current Explore workspace, on its existing origin, with a new tab and no opener. New registration is clearly marked not open yet.

## Step 2 — Attach the purchased domain to this new project

1. Open **Domain management → Production domains** in **the new public project**, not `explorebyclaudia`.
2. Choose **Add a domain / Add custom domain** and enter `www.soraspace.studio`.
3. Confirm ownership if Netlify asks. If it gives a TXT verification challenge, add only that exact TXT record at the DNS provider; never invent its value.
4. Also add `soraspace.studio` as an alias if Netlify has not automatically added it.
5. Choose **external DNS / configure DNS yourself**. Keep DNS at the current authoritative provider for now. You do not need to purchase the domain again or enable Netlify DNS.
6. Open Netlify's DNS instructions for **each** name, and keep them available while editing GoDaddy DNS.

## Step 3 — Edit SoraSpace DNS at GoDaddy (or its actual DNS provider)

For GoDaddy: open **My Products / Domain Portfolio → soraspace.studio → DNS / Manage DNS**.

### www record

Create or edit:

| Field | Value |
| --- | --- |
| Type | CNAME |
| Name/Host | `www` |
| Value/Target | The **exact public project's** `…netlify.app` hostname shown by Netlify |
| TTL | Default, or the shortest ordinary option offered during setup |

The target is a hostname only: no `https://`, no `/` path, and not the Explore `explorebyclaudia.netlify.app` target. Replace any conflicting parked/forwarding website record for `www`; a CNAME cannot coexist with another record at the same name. Leave unrelated email/verification records intact.

### Root/apex record (`@`)

1. Read Netlify's instructions for `soraspace.studio`, not just the www instructions.
2. If this DNS provider offers an ALIAS/ANAME or flattened CNAME at the root, use Netlify's displayed recommended configuration.
3. If the provider only offers an ordinary **A** record at the root, use Netlify's **currently displayed fallback A-record IP**. Do not copy an IP from the earlier Explore screenshots or an old help article.
4. Replace only the root website parking A records that conflict. Check for an old root AAAA website record too: it must not continue sending IPv6 visitors to another host. Do not remove root MX/TXT records.
5. Remove GoDaddy URL/domain forwarding for these website names if enabled and conflicting; Netlify will handle the apex-to-www redirect once configured.
6. Save the DNS changes. Do not add a normal root CNAME if the provider does not support flattening, and do not add `app` or wildcard `*` records yet.

## Step 4 — DNS verification and automatic HTTPS

1. Return to the new project's domain settings and choose **Verify DNS configuration**.
2. Allow the DNS changes to propagate according to the previous TTL; some networks can lag for hours. Repeatedly changing correct records restarts troubleshooting rather than speeding propagation.
3. In **HTTPS / SSL/TLS certificate**, wait for Netlify's automatic certificate covering both `soraspace.studio` and `www.soraspace.studio`.
4. Set **`www.soraspace.studio` as the primary domain** and ensure the apex redirects to it. If Netlify temporarily prevents primary-domain changes while provisioning the certificate, wait for that operation to finish and retry. Do not remove/re-add domains or supply a custom certificate just to bypass this state.
5. Confirm the dashboard no longer says pending DNS or “doesn't appear to be served by Netlify.” A certificate alone is not proof that both DNS names point correctly. Leave automatic renewal enabled.

## Step 5 — The quick acceptance check

- `https://www.soraspace.studio/` shows the SoraSpace page with no browser security warning.
- `https://soraspace.studio/` ends on the www address with no redirect loop.
- Both names appear on the Netlify certificate; renewal/DNS warnings are absent.
- Phone, tablet and desktop navigation/template cards are readable.
- **Existing users sign in** opens `https://www.claudiagilbert.com/apps`, where current authentication and files continue to work. It does not pretend a new SoraSpace account exists.
- No new registration, subscription checkout, upload or email form is active yet.
- `www.claudiagilbert.com`, its sign-in, app launches, HobbyNest preview and Microsoft 365 email still work.
- New public project deploys only the static landing output; no secrets or Explore functions were added.

After setup, the useful non-secret information to give ChatGPT is the new project's name and assigned `…netlify.app` URL, plus whether both custom-domain/HTTPS checks are green. No password, API token, storage key or customer data is needed.

## What ChatGPT continues building

- Five reusable starter templates and the owner setup preview.
- The private draft/editor model, a qualified trial database/identity integration, onboarding and publication authorization.
- Tenant-aware file access, backup/restore, domain routing and expiry/recovery checks before customer activation.

Later we create **a separate workspace project** for `app.soraspace.studio`, with its own narrowly scoped settings and tested sign-in. That work needs deliberate decisions about existing vs new accounts, host-only cookies/session handling, OAuth callback registration, credential/key continuity and app iframe origins/storage. A DNS alias or copied Identity configuration is not single sign-on. Keep current libraries/origins and the Kōbō provider folders unchanged until migration acceptance passes.

Do not create wildcard customer DNS, connect customer domains, turn on public signup, enable SoraShop checkout or move current app/data storage as part of the landing-page setup. These controls need the matching backend, not just DNS.

## If you need to undo only the landing change

Restore SoraSpace's previous website A/CNAME/AAAA/forwarding records from the saved snapshot. Leave mail records and Explore unchanged. Correct a new project's build settings or use Netlify's previous successful deploy if a landing-page change fails. Do not delete the working Explore project, domain registration, private data or credentials. Remove a custom-domain binding only as part of a deliberate DNS/ownership handover, avoiding a dangling address.

## Reference links

- [Netlify monorepos](https://docs.netlify.com/build/configure-builds/monorepos/)
- [Netlify external DNS](https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/)
- [GoDaddy CNAME setup](https://www.godaddy.com/help/add-a-cname-record-19236)

These pages were not retrievable in this workspace, so they are references, not claims of a current live documentation review. For the optional Git route, the installed Netlify configuration resolver was exercised offline and searches the selected base's `netlify.toml` before the repository-root configuration; the actual new-project deployment still needs the check above.
