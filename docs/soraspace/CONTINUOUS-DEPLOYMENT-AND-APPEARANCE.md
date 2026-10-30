# SoraSpace: automatic updates and compact system appearance

30 October 2026 (Sydney). Claudia created the separate Netlify project **soraspacestudio**, at `https://soraspacestudio.netlify.app`, by manual upload. She is configuring SoraSpace DNS at GoDaddy; current propagation and certificate completion have not been independently verified here. Explore remains a separate project. No direct Netlify API/browser connection or authenticated CLI session is available in this workspace.

## Connect the existing project to GitHub

The simplest update path is Netlify continuous deployment from the repository already used here. Codex can push authorized code updates; Netlify then builds/publishes them. This does **not** give Codex Netlify account/DNS administration access and does not require a password or personal access token in chat.

1. Open **the existing `soraspacestudio` project** in Netlify. Do not create a second public site; its current domain bindings should stay attached.
2. Choose **Project configuration → Build & deploy → Continuous deployment** (older labels may say Site configuration/settings).
3. Choose **Link repository** or **Configure continuous deployment**.
4. Choose **GitHub**, then **`cuteclaudia/explore`**. The repository and landing source already exist. No new repository is needed.
5. If GitHub asks for installation/access approval, authorize the Netlify app for this repository only. Existing Explore integration may already grant the necessary access. Do not add Netlify tokens to Actions secrets: GitHub Actions is not part of this setup.
6. Set the build fields **before triggering deployment**:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Base directory | `sites/soraspace` |
| Package directory | Blank |
| Build command | `npm run build` |
| Publish directory | `dist`, relative to base |
| Framework | None/static if prompted |
| Environment variables | None required |

The nested `sites/soraspace/netlify.toml` sets Node 24, command and publish directory. The installed Netlify config resolver was tested offline with this base and resolves the nested config and the correct output. Do not change the root Explore config or copy its functions/Identity/storage secrets.

7. Save and deploy. Confirm the log says `SoraSpace public landing built: 5 starter templates; no functions, identity, forms or private app data.` If it runs Astro, Keystatic or craft-tool preparation, stop and correct the base directory rather than adding owner/storage secrets.
8. Check the existing Netlify URL. It should show SoraSpace with the compact system-colour design. Check the custom domain after its DNS/certificate verification finishes; linking Git does not require another DNS change.
9. Future authorized pushes to `main` trigger the site's own build. A Git push alone does not prove deploy success; use the Netlify deploy status/log. Existing Explore can also rebuild from the same repo, under its own unchanged configuration.

## Manual update while Git is not connected

Use **`soraspace-public-site-2026-10-30-v2.zip`**. Extract it, then open **soraspacestudio → Deploys** and drag the `soraspace` folder into that project's manual deploy area. `index.html` must be directly inside the folder. This replaces the public files of that existing project. Do not start another Netlify Drop project or reconfigure its domain.

The original first-launch ZIP remains separately available as a rollback artifact. For a failed update use a previous successful Netlify deploy, or re-upload the original folder. No private data or credentials are in either ZIP. Manual uploads are a fallback; after linking Git, later pushes may supersede a manual deployment normally.

## Appearance delivered in v2

- System appearance is the default for the public landing page and 404: native CSS `Canvas`/`CanvasText` surfaces and text, browser/OS light/dark preference and forced-colour handling. No beige backdrop or custom theme preference is stored.
- Accent uses the browser's `AccentColor` when supported, with system fallback. Primary actions use a native link/Canvas contrast pair because some exposed native accent/text pairs do not meet ordinary-text contrast. Browsers do not universally expose the full Windows desktop palette or accent; this is not a promise to read arbitrary Windows personalisation settings.
- System-native sans-serif typography, slimmer header, smaller hero, compact feature strip and five compact template cards. No reduced touch target or forced single-screen fit at the expense of readable content. Long phone content scrolls vertically.
- Appearance reacts to OS/browser changes while the page stays open, without JavaScript, a theme cookie, a flash of a saved beige palette or a new login.
- New site-setup answers now default to **System**. Existing drafts explicitly choosing Moss, Ink or Clay remain supported. The authenticated owner setup page itself retains Explore's existing chrome/preferences; its generated System draft preview uses native colours. Existing app workspace/account theme settings were not globally reset.

This remains a public information site. Registration, customer publishing, standalone SoraSpace authentication, custom customer domains and payments remain gated. Existing-user sign-in is clearly labelled and still opens the current Explore workspace with noopener. No root domain, app origin, OAuth callback, storage root/key, private file, membership or subscription was moved.

## Checks

- Static landing build/config/output allowlist, no forms/private endpoints, keyboard and 320–1920px horizontal overflow checks.
- Light/dark screenshots, live OS preference switching, forced-colours, measured main-copy/action text contrast and a compact desktop height check. These are browser emulations, not a physical Windows/Android device acceptance.
- Owner questionnaire default-System and explicit-palette preservation, all five templates, private draft JSON and phone/tablet layouts.
- Server suite and existing Explore production/package checks.

Direct provider access remains separate. Only use an approved connection or server-held credential setup if added later; never post passwords/API tokens into the chat. For this workflow GitHub integration is sufficient to publish code updates automatically; Netlify/GoDaddy access is needed only for provider administration.
