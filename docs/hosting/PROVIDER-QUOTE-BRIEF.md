# Kōbō: managed EU hosting quote and trial brief

29 October 2026. Draft for Claudia to use in a provider console/support conversation; no message has been sent and no account has been created.

## Product and proposed trial

Kōbō is a browser-based creative/productivity workspace. Static HTML/JS/WebAssembly apps do most editing on the user's device; our HTTP backend handles accounts, permissions, encrypted storage credentials, conditional metadata/index updates and WebDAV/Google Drive file transfers. The public Explore website stays on Netlify. We want a separate managed EU deployment for the workspace/backend, with a clearly scoped data-location statement.

Begin with one isolated development application, a small managed PostgreSQL database and dummy accounts/files. Node.js 24 is our existing runtime. Native Netlify authentication/Blobs dependencies will be ported; no assumption that the existing repository works unchanged on another provider. We have independently run an unchanged reviewed app build under a standard Docker/Caddy host locally.

## Please quote two configurations

1. **Development/prototype:** one small Node HTTP application, smallest appropriate managed PostgreSQL, test-domain TLS and supported static app delivery. State trial eligibility, required payment method, exact resource limits, expiry and what starts billing automatically.
2. **Initial production pilot:** appropriate Node capacity, managed database with the offered recovery/availability options, private binary/index-backup storage, monitoring/support and a clear scaling route. Itemise HA/failover costs rather than treating the cheapest single-node database as highly available.

## Required details

- Node runtime support, deploy/build memory, restart/rollback behaviour and request concurrency.
- Supported hostnames and TLS; multiple separately isolated app origins must be possible. Does each hostname require a separately billed application, or can one app route multiple hosts safely?
- Request/body/response and execution-time limits. Core sync uses bounded roughly 1 MiB chunks; legacy site-file routes support files up to 50 MiB and may need refactoring. Photo-original acceptance includes large files assembled from chunks, not a requirement for one unbounded request.
- Outbound traffic to users' storage providers and client downloads: included allowance, egress/operation rates, throttling and overage controls.
- Managed PostgreSQL pricing, plan-specific backups/PITR, retention, failover, restore support, RPO/RTO and SLA/credits. We need real transactional conditional writes, not best-effort cache updates.
- Private binary/object storage options, file sizes, encryption/key options, backup destination and restore/export costs. Application ephemeral disk is not our persistent file store.
- Locations for primary app/database data, credentials/indexes, backups, logs, management plane and support access; subprocessor/DPA details. We seek verified facts, not a blanket claim of exemption from foreign law.
- Existing user/account identifier mapping and EU-hosted identity-service options; no unreviewed dependency on Netlify for a purported all-EU workspace data path.
- Currency, taxes/FX, minimum commitments, support level and full monthly estimate for each configuration. Add billing alerts and clear stopping/deletion instructions for trial resources.

We are not requesting migration of live users or files before a disposable two-account/two-device recovery/sync pilot passes. Please identify gaps in these requirements before any production commitment.
