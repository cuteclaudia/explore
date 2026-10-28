# Move www.claudiagilbert.com from Squarespace to the existing Netlify site

Status: preparation only. No DNS, domain registration, Netlify setting, OAuth setting or Squarespace subscription has been changed. Claudia has requested this move. The website can become public while Kōbō remains an invitation-only beta.

28 October 2026 update: Claudia confirmed that DNS is managed in Squarespace. Keep that DNS service and change only the necessary website records when ready. This does not independently establish the registrar or the email provider. Strava is the selected first fitness integration; it is separate from the website launch and must not delay the cutover.

Current handoff: open Squarespace → Domains → claudiagilbert.com → DNS settings and record the existing records; also open the existing explorebyclaudia Netlify project's Domain management. Compare the current website records with the exact targets Netlify displays before editing anything. Export/screenshot the current zone for rollback, retaining mail and verification records.

The migration asset inventory is recorded in `SQUARESPACE-ASSET-INVENTORY.json`. A fresh attempt to fetch a source image from this workspace was refused by the network proxy (HTTP tunnel 403), so none has been copied or rewritten. The old sitemap and current Netlify sitemap were also inaccessible here. These are outstanding external checks, not passes. Saved Studio content still requires a separate signed-in check.

## Findings from the repository

- `astro.config.mjs`, canonical links, RSS and `public/robots.txt` already target `https://www.claudiagilbert.com`.
- Existing redirects include `/home` → `/` and `/cyber` → `/dailycyberreport`. The old site's sitemap still needs checking against the new site's routes; do not redirect every unknown address to the homepage.
- Twelve distinct Squarespace image URLs remain in nine source content files. Preserve those originals before cancelling Squarespace. Existing `scripts/migrate-squarespace-images.mjs` can download source images and rewrite source references, but it does not migrate saved Studio drafts/published overrides in Netlify Blobs. Those need checking through the signed-in content editor as well.
- Hikari 0.16.0's supplied `kobo.json` and `_headers` already allow both `https://www.claudiagilbert.com` and `https://claudiagilbert.com`. Keep its separate hosting origin unchanged.
- Google Drive starts and completes OAuth only on the origin configured by `GOOGLE_DRIVE_REDIRECT_URI`. Adding a domain alone does not update it. Google site sign-in is a separate Netlify Identity integration.
- Domain DNS and live pages could not be inspected from this workspace: name resolution failed and the network proxy refused website requests. No live domain, certificate, content parity or DNS readiness is claimed.

## 1. Preserve and prepare

Use the existing **explorebyclaudia** Netlify project. Do not create a replacement project: Identity users, private Blobs content, encrypted connections and Google index records belong to the existing site.

Record the current DNS zone, nameservers, website records and TTLs at the authoritative DNS provider. Keep MX, SPF, DKIM, DMARC and verification TXT records intact. Check for AAAA, CAA and DNSSEC constraints as part of Netlify's domain verification. Determine the registrar separately from the DNS provider; neither needs moving just to change the website host.

Export Squarespace content and download images/files, form submissions, products or other records that need preserving. Compare both sites' public pages and old sitemap. Migrate remaining image references and confirm saved Studio content has no dependency on Squarespace. Keep Squarespace active through the cutover and rollback window.

Back up important Hikari libraries and originals, and export Google private-index recovery checkpoints. Keep the existing `FILE_STORAGE_ENCRYPTION_KEY`, owner identity IDs, connection records and Blobs stores unchanged. Changing the website origin changes cookie and browser-storage scope: sign in again at the new domain, verify the same account ID and test the app there. Never clear old browser storage to force a migration. Cross-site iframe storage partitioning may also change when the top-level website origin changes; do not assume an unsynced browser library will follow the domain.

## 2. Add domains and prepare sign-in

In the existing Netlify project's **Domain management → Production domains**, add `www.claudiagilbert.com` and `claudiagilbert.com`. Use **www** as the intended primary address. Follow Netlify's exact external-DNS instructions for this project; do not guess apex IPs or replace nameservers unnecessarily.

Before cutover, add this exact callback to the existing dedicated Google Drive OAuth web client, retaining the old URI for rollback:

`https://www.claudiagilbert.com/api/google-drive/callback`

Check Google Auth Platform branding/authorised domain, homepage and privacy-policy requirements. Keep the current consent scope and OAuth client ID/secret. If the domain is required to be verified, complete that verification first. The old callback remains configured in Netlify until the new domain is ready.

In Netlify Identity, review site URL/allowed redirect settings and invitation/recovery email links/templates for the production domain. Retain the same Identity service and user IDs, invitation-only registration and existing owner bindings. If Google sign-in uses a separate custom Google OAuth client, add the exact callback shown by **Netlify Identity** to that client's settings; do not substitute the Drive callback or create a second site account.

## 3. Cut over

Change only the required website DNS records at the existing DNS provider, using Netlify's displayed targets. Remove conflicting website A/AAAA/CNAME records only where necessary; preserve unrelated records and mail. Keep a copy of every previous value for rollback.

Wait for Netlify DNS verification and a valid HTTPS certificate covering both hostnames. Verify the primary `www` hostname and apex-to-www behaviour. Review redirects from the `netlify.app` alias: do not rely on it being reachable as a separate logged-in fallback after the primary domain changes.

Once HTTPS works, set **Functions / Production** `GOOGLE_DRIVE_REDIRECT_URI` to the exact new www callback and redeploy the same Netlify project. Changing an environment variable requires redeployment. Do not rotate credentials or disconnect/reconnect storage merely because of the domain move. Start a fresh consent attempt on the new domain if one was in progress during cutover.

## 4. Live acceptance

Check HTTPS, apex → www, expected pages and assets, mobile/tablet layout, mapped old links, 404s, canonical URLs, RSS and sitemap. Confirm Netlify detects the contact form and an intentional test submission appears and notifies the right inbox. Submit the final sitemap in the existing search-console property where applicable.

Test owner email/password sign-in, separate member sign-in, invitation acceptance, password recovery, and Google sign-in if enabled. Confirm no new owner ID is requested and existing private content is present. Test sending and receiving domain email before and after DNS changes.

On the www domain, test Google Drive Test connection, a fresh OAuth flow, WebDAV/kDrive access, and Hikari's approved-origin bridge. Check that both accounts still have only their own libraries and that restored photos/thumbnails load. Preserve unsynced browser work if the new domain presents a different local scope. This domain check does not replace the remaining two-device beta acceptance.

## 5. Squarespace cancellation and rollback

Cancel only the **Squarespace website subscription** after content/assets, domain/email, sign-in and forms are confirmed on Netlify. Domain registration and Google Workspace/email may be separate subscriptions: keep those paid and active. Keeping a domain registered at Squarespace is compatible with hosting the website at Netlify.

If cutover fails, restore the recorded website DNS values and relevant Netlify primary-domain/redirect and Identity settings. Restore `GOOGLE_DRIVE_REDIRECT_URI` to its old value and redeploy if needed. DNS caches can delay rollback. Keep the existing Netlify project and all user/data stores; do not restore an older backend that cannot read private-index recovery generations. Neither platform's new edits automatically appear on the other, so reconcile any edits made during the cutover.

## Responsibility and outstanding information

DNS is managed in Squarespace. Registrar and domain-email dependencies remain unverified. Account-console and DNS changes require Claudia's access; no suitable Netlify/Squarespace connector is available in this session. The final record values must come from Netlify and the current DNS zone, not this document. The cutover is not complete until the live checks pass.
