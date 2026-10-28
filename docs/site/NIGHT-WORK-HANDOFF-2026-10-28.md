# Next-morning handoff

## Ready for website deployment

- Login recovery: protected Astro pages use the same fresh authorization service as the browser; session mismatches stop instead of looping. Browser initialization waits for near-expiry cookie refresh. Desktop installers and Settings return paths are retained. No account/password/grant reset was performed.
- Shared public menu: **Apps** → `/kobo`; **3D Printing** → `/3d-printing`. The authenticated `/apps` library remains gated. Public app releases are clearly in testing/development; Store links are forthcoming. The 3D project gallery is explicitly in preparation.
- macOS remains visible as **Planned** in the public showcase and enabled app cards, with all installer fields retained for future builds. No draft release was published, installer URL configured in live settings, Microsoft product submitted, repository created or token changed.
- Fitness settings list Strava, Komoot, Garmin, Google Fit/Health Connect, MyFitnessPal and Xiaomi, with provider-specific availability and no fake Connect action. Current GPX preview remains functional. Follow-up: the Strava read-only connection is now implemented but disabled pending credentials, current provider requirements and real-athlete acceptance. The other five direct integrations remain pending. See `docs/fitness/STRAVA-SETUP.md` and `docs/fitness/CONNECTIONS-IMPLEMENTATION-HANDOFF.md`.

## Verification

- 169 server tests passed.
- Real login controller tests cover a delayed cookie refresh, the reported login/Studio bounce, explicit recovery, exact Desktop installers return, and service failures.
- The actual built SSR package accepts verified simulated sessions on both domain names and denies expired/revoked/unavailable sessions without an automatic login loop. Native authorization checks and public/private content isolation tests remain in place.
- **414 rendered layout checks**: 48 page routes/views across 320, 360, 390, 768, 1024 and 1440px, plus all 14 repository essay/cyber article pages at those widths. No horizontal overflow or clipped controls; no undersized visible mobile form inputs in the checks. Includes expanded settings/editor/permissions views and representative Studio-managed content. These are local fixtures, not the current private Studio database or full native app canvases.
- New public pages/navigation and expanded six-provider connection rows pass interaction checks at 320, 390, 768, 1024, 1366 and 1440px. A narrow-phone app-icon layout issue was corrected.
- Production build and isolated deploy-package checks passed. Physical-device graphics/performance and actual live account/provider behavior remain separate checks.

## First checks when Claudia returns

1. After Netlify deploys, refresh the site, sign in normally and open My Studio → Settings → Desktop installers. The new login controller should no longer bounce. Record the URL/status if a real-account problem remains; local fixtures are not a live authentication attestation.
2. Review `/kobo` and `/3d-printing` on a phone/tablet. Add actual Store URLs only after products are published. The printing gallery needs Claudia's real photographs/project descriptions; no invented work was uploaded.
3. Revisit Netlify's `www` certificate-renewal warning using `DOMAIN-RENEWAL-CHECK.md`. It remains unverified from here. Continue domain callback/mail/forms checks and preserve Squarespace-hosted assets before cancelling its website subscription.
4. Start Strava developer registration/documentation review. The dedicated callback/token/preview path is now built; configure it and test with an approved athlete. Credentials belong in server-side configuration, never chat. See `docs/fitness/PROVIDER-CONNECTION-PLAN.md`; other providers need the listed access/mobile prerequisites.
5. Coordinate app candidates/Windows and Hikari two-device checks with Claude. Microsoft developer registration alone does not publish products or connect Store licences to website entitlements. See `docs/kobo/MICROSOFT-STORE-PUBLIC-PAGES.md`.

A short note to forward is in `docs/kobo/WEBSITE-UPDATE-FOR-CLAUDE-2026-10-28.md`.

Fitness source research was attempted against official pages but every fresh request was blocked by the execution environment's network proxy. The provider plan distinguishes known integration models from unverified current access/terms; no claim of provider approval, current API capacity or a live connection is made.
