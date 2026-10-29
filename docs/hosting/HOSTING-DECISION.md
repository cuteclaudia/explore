# Kōbō hosting decision: managed ease, cost and reliability

29 October 2026 (Sydney). Recommendation for a **test provider**, conditional on a satisfactory full quote, account terms and residency review before production. No account, resource, subscription, DNS record or live application was changed.

## Recommendation

**Start with Scalingo's eligible-account managed trial for the complete Kōbō backend prototype.** Its documented Node.js support, French region, managed PostgreSQL/backups and deployment workflow make it the strongest currently evidenced fit for Claudia's preference for remote cloud operation with less infrastructure administration. Keep Explore on Netlify and the existing working app origins available.

**Keep Hetzner + Coolify Cloud as the budget alternative**, if the total quote is materially better and Claudia accepts that server, database and workload operations still need ownership. Cloud manages Coolify's control plane; it does not turn a VM into a fully operated app service. If strict control-plane residency matters, verify Cloud's handling or choose self-hosted EU management instead.

**Clever Cloud is the managed runner-up.** Its current official docs support Node.js and PostgreSQL; backup, point-in-time recovery and replica/failover configuration need particular attention. A price/support comparison could change the final production choice. We cannot honestly declare a cheapest provider without live quotes.

## Evidence-based comparison

| Candidate | Evidence / fit | Main limitation | Current recommendation |
| --- | --- | --- | --- |
| Scalingo | First-party docs confirm Node.js 24, Paris/Outscale region, GitHub deployment docs, managed PostgreSQL backups and eligible-account trial | Live full-stack price not retrieved; Starter DB is single-node, HA costs more; backend port still needed | Preferred managed prototype |
| Clever Cloud | First-party current docs confirm Node runtime, app deployment and managed PostgreSQL/backup features | Current cost/terms need quote; PITR is not default and replicas require setup/support per docs | Managed alternative |
| Hetzner + Coolify Cloud | Official Coolify docs describe Hetzner provisioning, base control-plane price and operational boundary; local static Docker rehearsal passed | We still operate workload VM/security/backups; control-plane residency and total cost unverified | Budget alternative with operational responsibility |
| Hetzner + self-hosted Coolify | Apache-2.0 control plane on chosen infrastructure; no Coolify licence fee | We maintain both management and workload infrastructure; one VM isn't HA | Useful if control and lower fees outweigh maintenance |
| Deploybase | Claudia supplied product/site and Paris/Scaleway/Bunny claims | Official pages inaccessible here; persistent Node/SSR, database, auth/atomic state, private data routing, limits, SLA and complete price unverified | Candidate for further qualification; not yet proven for whole backend |
| Statichost | Claudia supplied static hosting/European infrastructure claims | Full backend execution is not established; no logging/residency claim verified | Potential static-app front end, needs a backend partner unless it proves those capabilities |
| IONOS Deploy Now | Claudia supplied managed Git deployment option | Build-time Node support must not be confused with persistent Node SSR/API runtime; current database/private-state fit not verified | Do not choose for complete Kōbō without runtime proof |
| Lucity | Claudia supplied Swiss/Kubernetes claim through a directory | Exact official service identity/URL, managed versus self-hosted offering, Node/storage/backups, terms and prices not established | Insufficient evidence to recommend |

Directory blurbs are useful leads, not platform acceptance. “No US cloud” and “no personal logs” need current contractual/subprocessor evidence. A European CDN company may operate global edges; verify cache/log routing and bypass private data paths as required. Free/static hosting alone doesn't replace Netlify Identity, Blobs or native functions.

## Trial and reliability facts verified in first-party source

Scalingo's source snapshot says eligible accounts get a **30-day trial**, with a **billing profile/payment method required**. It permits one application with up to five S/M containers and the smallest eligible managed database instances; review apps are not available during the trial. At expiry resources keep running and **billing starts automatically**. To avoid charges, its docs say to delete apps/databases/add-ons before trial expiry. Do not sign up assuming a no-card, automatically stopping free tier.

Scalingo documents a Paris region on Outscale and a restricted region available on request. Do not assume the restricted offer or a certification applies to our standard account. Node.js 24 is listed. PostgreSQL backup policy and availability are plan-specific: its source describes Starter as single-node without HA, Business/Enterprise as redundant plans. Managed does not make the cheapest plan highly available. Trial success doesn't prove production availability; measure real workloads and obtain the relevant contract/SLA before a paid release.

Clever Cloud's source says Node applications listen on `0.0.0.0:8080` and supports stable Node versions. PostgreSQL PITR support requires setup/support rather than being installed by default; replica creation also requires support in that snapshot. Confirm the selected database product/plan's actual failover and recovery, rather than equating replicas with automatic availability.

## Concrete trial architecture

One isolated prototype application can hold the workspace/portable HTTP API and static routing, plus a small PostgreSQL instance. Separate hostname/origin routing for apps must still be enforced and supported on the selected plan. This is a trial architecture to prove, not a production deployment ready to upload today.

The first prototype uses dummy users and no production files. We port the `currentActor`/session boundary and the required Blobs operations instead of depending on Netlify for a claimed all-EU data path. PostgreSQL must preserve conditional create/replace/version semantics; user files go to private EU storage or their chosen provider. Readonly/copy/index recovery behaviour must survive unchanged. Persistent file storage is not an application container's ephemeral disk.

Do not duplicate the whole Explore/Keystatic public site. Its existing deploy remains intact. App binaries stay the same accepted builds; any new embedding origin and native-library migration is coordinated separately. Existing `netlify.app` app origins cannot be carried to a new host.

## Quote before production choice

Request the **total**, not one advertised application price:

1. Required Node app memory/CPU, instances and build capacity.
2. Managed PostgreSQL size, backup retention, restore and HA option.
3. Private binary/index-backup storage and traffic/egress.
4. Identity/session service, transactional email, logs/monitoring and support.
5. Separate app origins/custom hostnames, TLS, upload limits, request timeouts and region guarantees.
6. Tax, currency conversion, trial expiry and any minimum/annual commitment.

Earlier AUD budgets are planning allowances only. Current provider calculators/checkout were blocked here. A cheap prototype can be single-node; sell a reliable production service only after choosing the availability/recovery design and its full cost.

## Next action

Review the managed trial terms and a live Scalingo quote first. Use a separate EU prototype, keeping the current website and storage live. If cost is unsuitable, compare an equivalent Clever Cloud quote and the fully costed Hetzner/Coolify operating model. The local Caddy/Docker test has already shown static app portability, so no native rebuild is needed merely to evaluate these hosts.

Evidence and commit-pinned first-party sources: `hetzner/SOURCE-EVIDENCE.json`. Detailed Hetzner configuration/operations/migration path: `hetzner/INVESTIGATION.md`.
