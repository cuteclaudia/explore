# Hetzner investigation and Kōbō migration plan

29 October 2026 (Sydney). Investigation only: no cloud account, billable server, public DNS, production key or app release was changed. See `../HOSTING-DECISION.md` for the final comparison after Claudia asked for managed ease of use as well as low cost.

## What Hetzner and Coolify each provide

Hetzner rents cloud infrastructure. A server in Germany or Finland can be managed from Australia; “self-hosted” does not mean equipment in Claudia's home.

Coolify is a deployment control plane. Its official source describes Git deployments, container/database services, domains/TLS, logs and backup configuration. Self-hosted software is Apache-2.0 and has no Coolify licence charge; the VM and operations still cost money. Coolify Cloud runs that control plane for you while workloads still run on your own Hetzner server.

Claudia's screenshot shows Cloud at **$5/month for two connected servers**, then **$3/month per extra server**, with a yearly discount. The same amounts appear in the official documentation snapshot. Confirm invoice currency, tax, current terms and control-plane location in checkout; do not assume the dollar amount is AUD. This is in addition to Hetzner.

The official Coolify security/backup documents explicitly say Cloud **does not take over responsibility for your connected servers, applications, databases or their backups**. Its own instance backup also does not back up workload data. This is why a managed PaaS remains a serious alternative for Claudia's ease/reliability priority.

## Affordable test configuration to obtain a quote for

This is an engineering sizing proposal, **not a verified current Hetzner SKU or price**:

- Separate `kobo-eu-test` project; Germany as the first EU location, Finland as an alternative subject to availability and backup-location review.
- x86-64 shared-vCPU VM, around **4 vCPU / 8 GB RAM / 80 GB SSD** if building/running Coolify, app containers and a small test database together. A static-only specimen needs much less. Avoid assuming the smallest VM will comfortably build the whole website and operate a database.
- A supported maintained Linux image, such as Ubuntu 24.04 LTS after checking the chosen Coolify release's support.
- Public IPv4 if required by the selected connectivity path, IPv6 where correctly configured, cloud firewall and SSH public-key access. No public database ports.
- Server backup option plus a separate verified EU off-server database/file-backup destination. VM snapshots are not a complete application backup strategy; check attached-volume/object-store coverage and backup placement.

Several apps can share a VM using distinct hostnames/containers; there is no requirement to rent one VM per app. Maintain separate browser origins and credentials/permissions nonetheless. One VM is a single failure domain: sensible for tests and a limited pilot, not proof of high availability.

The earlier A$20–40 prototype and A$50–150 pilot allowances were budgets, not quotes. Obtain the actual server, IPv4, backup, storage and traffic total before buying. Do not assume stopping a retained VM stops its bill; confirm deletion/retention billing rules.

### Trial credit found in a first-party project source

Coolify's official documentation snapshot lists a **€20 Hetzner credit for eligible new users, valid for three months**, with promo code `C00L1FYLM40`. This is a statement from the partner's docs, not confirmed eligibility or a live Hetzner checkout result. Check the terms and redemption timing before creating resources. The same page mentions another signup offer; neither has been redeemed or relied upon in our budget. No referral link was used.

## Costs to confirm

| Item | How to verify |
| --- | --- |
| VM | Current EU location, exact type, monthly/hourly pricing and disk size in Hetzner checkout |
| IPv4 | Whether needed/included and any separate charge |
| Server backups | The Coolify guide states a 20% server-price surcharge; confirm current Hetzner terms and covered data |
| Object/off-server storage | Minimum charge, capacity, operations, backup location and egress |
| Traffic | Included transfer for that location, excess rate and expected photo-sync volume |
| Coolify Cloud | Screenshot/doc base fee, currency, tax, server count and control-plane data processing |
| Database/auth/email | Self-operation versus managed add-ons, backup/recovery and operational time |
| Tax/FX | Actual Australian customer/business treatment and card conversion costs |

Website processing/transfer costs still matter even with users' own drives. Test large-file transfer and concurrent sync, then set a fair-use/capacity policy from evidence rather than promising unlimited traffic at an untested fixed cost.

## How the existing application maps to an EU deployment

| Current component | Migration requirement |
| --- | --- |
| Explore public site | Leave on its existing Netlify project/domain; link to Kōbō only after acceptance |
| Static app releases | Serve existing HTML/JS/WASM with exact MIME, cache and security headers. `_headers` is not automatically understood by a generic server |
| Private workspace | Separate EU deployment/build entry; avoid copying the whole public CMS/editor into an unrelated host |
| Astro runtime | Current config uses `@astrojs/netlify`; build an isolated Node-compatible deployment profile, not a production adapter replacement |
| Native Netlify functions | Adapt Request/Response handlers and inject portable authorization/storage services; container hosting alone does not replace SDK behaviour |
| Identity and permissions | Choose an EU-hosted account/session service or explicitly transitional federation. Preserve secure subject mapping, owner safeguards and fresh grants; email alone is not safe account linking; do not assume password hashes are exportable |
| Netlify Blobs | Replace its required operations with tested EU storage. PostgreSQL is a candidate for account/metadata/versioned records; binary bytes need private EU storage or users' providers |
| CAS/atomic state | Transactional create-only/compare-and-swap, correct ETags, conflict/refusal and lost-response verification across independent workers. A global in-process lock is insufficient |
| Current private site revisions | Inventory, verified copy/recovery and deliberate retirement. Do not delete old copies or assume a provider-folder copy removed them |
| Credential/index recovery | Preserve account bindings and original decryption material through a secure reviewed migration; no key rotation or pointer rollback as a UI fix |
| App bridge/origins | Preserve the agreed protocol and app folder layout; new parent/app origins need exact allowlist/CSP updates and local-library migration acceptance |

Current Irodori normal and owner-preview routes share `IRODORI_PREVIEW_ORIGIN`; changing that production variable would affect the working app too. Use isolated staging configuration, not an assumed separate test slot. The suite-wide storage gate must not be flipped as a hosting test.

The source has material Identity/Blobs dependencies; the EU backend is a porting project, not a Git-push-only move. Existing Google Drive/WebDAV files can remain where they are, while authorization, file relay, indexes and recovery move separately. There must be no silent fallback through the Netlify data path for a user promised an EU-only path.

Netlify-hosted app URLs cannot be taken to Hetzner. Owned custom hostnames can retain their browser origin when changing hosts, but existing `netlify.app` app origins require migration. Preserve old origins and local-only work until originals/library backups have been restored and verified. Don't treat a different origin's empty browser storage as missing cloud data and overwrite a head.

## Local portability rehearsal completed

A Docker/Caddy rehearsal served the **previously reviewed Irodori 0.16.1 specimen** without rebuilding or changing its 20 release files. Byte hashes matched over HTTP; CSP/nosniff and mutable/immutable cache rules were checked. Real Chromium software-WebGL canvas startup passed. The container ran as UID 1000, read-only, no Linux capabilities, no-new-privileges, with its port bound only to localhost. Caddy v2.11.7 was resolved to the recorded image digest. No real account, customer file, cloud sync or paid cloud resource was used.

This proves the basic static hosting layer can be portable. It does not qualify Hetzner availability, full backend migration, real-device behaviour, a new app release, current binary security or EU residency. It also caught two hosting details during development: file permissions for non-root serving and Caddy header ordering. Both are reflected in the working specimen configuration.

Artifacts:

- `deployment/hetzner-static-rehearsal/` — localhost-only Docker/Caddy configuration and run instructions.
- `scripts/check-eu-static-hosting.mjs` — reproducible rehearsal with an extracted specimen.
- `STATIC-REHEARSAL-RESULTS.json` — image/version, file hashes and scope.
- `/workspace/reviews/hetzner/irodori-caddy-local.png` — local browser evidence; not an internet deployment.

## Secure setup and controlled rollout

1. Obtain exact quotes and decide managed PaaS versus Hetzner/Coolify. Any actual paid purchase must be approved against that concrete configuration; no token/SSH private key belongs in chat or a repository.
2. Create an isolated test project/server or managed trial, with dummy accounts, separate test secrets and no imported production data. Protect provider and deployment accounts with MFA.
3. Configure TLS, exact hostname routing and access controls. Use the provider firewall; restrict SSH to necessary management/admin paths. Do not publish database/admin endpoints. For self-hosted Coolify, its docs list initial direct dashboard/terminal ports; once proxied through a domain, those direct ports can be closed. Verify the chosen release's requirements before applying rules and retain a tested recovery access path.
4. Port and test authorization/metadata/atomic storage in isolation. Then test external-provider relays, backup/export/restore and large-file concurrency. Code/asset hosting in Europe alone does not move these services.
5. Coordinate any app embedding-origin changes with Claude. Keep app isolation and CSP; do not broadly permit all origins. Host-only secure session cookies and strict app/account/provider binding remain required.
6. Complete the two-account/two-device acceptance and a disposable restore drill. Prove file contents and index mappings before cutover. Verify OAuth callback/consent changes and sign-out/revocation.
7. Add only the required new subdomain records at Squarespace when the staged service is ready. Keep Explore apex/www, mail records and the original app sites. Open a voluntary pilot with a rollback route.
8. Expand capacity after measured CPU/RAM/traffic/error evidence. Separate the database/control plane and add redundancy when the required availability justifies it. Database backups, external file backups and restore drills remain required even with a managed deployment dashboard.

## What still requires direct verification

Live Hetzner pricing/location capacity, account approval/credit eligibility, backup/subprocessor contracts, current Coolify Cloud currency/location/retention and production support. Official Hetzner websites returned an execution-proxy CONNECT 403, not a provider rejection. First-party GitHub source was accessible and is cited by commit in `SOURCE-EVIDENCE.json`.

EU hosting supports scoped location claims; it does not itself prove exemption from US law. Explore remaining on Netlify is compatible with a separate EU workspace, but the customer data paths and contractual claims must be documented precisely.
