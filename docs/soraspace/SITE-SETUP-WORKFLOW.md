# Guided SoraSpace site setup

30 October 2026. Claudia requested a question-led workflow that generates a template-based starting site which the owner can edit later.

## First delivered preview

**My Studio → SoraSpace site setup preview**, `/studio/soraspace-setup`, is restricted through the existing `settings.manage` owner permission boundary, with `private, no-store` and noindex. This is an owner usability prototype, not customer onboarding or a provisioning endpoint. It is linked only from the owner Studio shortcuts.

The four steps are:

1. **Purpose:** study/projects, academic work, writing/blogging, creative portfolio, business/practice or a personal space. Each suggests pages and a template; there is no invented biography, article list, research credential or product catalogue.
2. **Pages and template:** Home, About, Blog, Articles, Journal, Galleries and Contact. Choose Folio, Editorial, Horizon, Practice or Canvas. Business setups recommend Practice; personal setups recommend Canvas. Home is required in this first version. Purpose changes update untouched recommendations but preserve pages/templates already manually customised.
3. **Style and identity:** site name, optional tagline/introduction, Moss/Ink/Clay palette and compact/comfortable density. These are site branding choices, separate from workspace/system appearance.
4. **Review:** an in-tab rendered layout with empty sections; Back edits the previous answers. Download a JSON draft to keep the answers and generated configuration. No answer is sent to a service, browser storage or another domain. Answers are not automatically saved across sessions, and there is no import UI yet.

Client rendering uses text nodes for all user-entered values; no raw HTML/iframe/CSS input is accepted. The shared deterministic generator lives at `src/lib/soraspace-site-setup.mjs` and validates field bounds, fixed template/palette/page IDs, duplicate/unknown pages and unknown top-level fields. Exported JSON is private user data, not executable site code or proof of authorization.

Every generated site and page is a draft, the overall visibility is private, and the navigation contains only selected pages. Enabling Journal creates an empty draft section and never reads or publishes existing private entries. There is no public-site route, file copy, domain setup, database mutation, shop, email delivery, contact form or publication action in the preview. SoraShop remains a future optional module and cannot be enabled through forged setup fields.

## Later customer workflow

Once the tenant/identity/storage gates pass, this same questionnaire can create a private, versioned `site-draft` in the authorized workspace using server-side regeneration. The server must validate the supported answers independently and ignore client-generated authority: never accept tenant ID, account ID, visibility/publication status, domain ownership or entitlement from an uploaded draft.

Add an idempotent create receipt and request recovery before the first HTTP creation flow, including lost-response retries. Existing sites require version checks and explicit confirmation before replacing a layout; keep their content. A changed purpose should suggest adjustments rather than silently delete sections or republish anything. Saving a template change and publishing a site remain separate actions.

The full site editor should support per-page enabled state, navigation order/labels, homepage selection, header/cover/logo choices, content blocks and page-specific highlights. Turning a page off preserves its content and removes its public route, assets where exclusively private, feeds/search/sitemap entries and navigation. Restoring a page does not publish new drafts. Templates must use constrained accessible components and fixed design tokens; arbitrary theme scripts are outside the first release.

Public publication needs a distinct, immutable reviewed snapshot and a deliberate publish operation with current membership and entitlement. Preview must remain authenticated and no-store. Domain registration/mapping, TLS, public cache keys, storage grants and SoraShop each retain their separate activation gates from [the platform roadmap](PLATFORM-ROADMAP.md).

## Validation

- Server suite: generated private drafts for all six purposes, deterministic output and unmodified input; explicit page/template overrides; reject forged authority/domain/style fields and unknown/duplicate pages; plain-text malicious strings; immutable template presets.
- `scripts/check-soraspace-site-setup.mjs`: actual owner flow on local fixtures, suggested academic pages/template, custom choices survive purpose changes, required-name errors, back/edit/regenerate, XSS-safe preview, private JSON download, no HTTP mutations, keyboard focus and 320/390/768/1024/1366px overflow/touch checks.
- Production package checks include unsigned access denial and fresh custom-domain owner sessions for this route. Existing website/workspace builds and checks continue to run.

Screenshots in `/workspace/reviews/soraspace-setup` are local synthetic test data, not published assets. No real customer content is loaded or generated by the tests.

## Next increment

Connect a qualified trial database/identity adapter, idempotent draft creation and owner-only trial site editing. Then extend page editing and authenticated preview before adding public subdomain publication. Customer signup, custom domains, commerce and paid subscriptions stay off until their own acceptance checks pass.
