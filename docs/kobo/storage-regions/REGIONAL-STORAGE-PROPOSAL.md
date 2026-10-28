# Kōbō as a user-owned workspace: regional storage proposal

29 October 2026 (Sydney). **Design/review only.** Claudia asked for a unified place to work with apps and chosen storage in Europe, Asia, Australia or elsewhere, without breaking existing work. The workspace/StratWatch change was built, tested and pushed before this proposal. No storage code, credentials, provider setting, library folder, grant or app binary is changed here.

## Recommendation

Make Kōbō the workspace people open to find their apps, work and storage choices. Keep local-first editing and provider-neutral files. Deliver regional **Nextcloud/WebDAV onboarding first**, because it can build on the existing protocol; investigate **region-selected S3-compatible storage second** as a distinct adapter. Keep Google Drive, optional Google Docs workflows and Proton Drive as separate provider/product decisions rather than treating them as interchangeable folders.

Do not advertise “all your work” as full Office/Google Docs feature parity, collaborative editing or universal format compatibility. The current workspace is the front door; app capability, file compatibility, collaboration and storage acceptance each retain their own release gates. A later installable web workspace or native companion can use the same concept; native shells and desktop credential access remain Claude's app-side work.

## What exists and what is proposed

Existing: per-account connections, server-held encrypted credentials, WebDAV adapter, Google Drive adapter, provider verification, isolated app launches, local-first libraries and separate private-index recovery. Their current gates and known limitations remain authoritative. The recent-files workspace view lists site revisions, not every connected cloud catalogue.

Proposed: a provider catalogue with evidence-backed country/region information, guided provider setup, optional additional adapters, multiple connection/library targeting under the reviewed contract, and eventually a region-aware transfer/control plane. None is silently enabled by this document.

The historical storage contract document records its original implementation status; use current source and release acceptance for delivered state. This proposal neither edits nor supersedes the agreed storage contract or Claude's app folder layouts.

## Candidate paths by region

These are **integration candidates**, not verified recommendations, prices or residency promises. Fresh official pages could not be retrieved through the workspace proxy; see `SOURCE-CHECKS-2026-10-29.json`.

| User preference | Most compatible first path | Further option to evaluate | Evidence needed |
| --- | --- | --- | --- |
| Europe | A Nextcloud/WebDAV host with a contractually identified European data centre; existing kDrive users can retain their accepted connection | Region-selected S3 storage; kDrive/Proton account-specific residency and protocol suitability | Exact country and plan, primary/backup locations, processing/logs/subprocessors and provider terms. Switzerland is in Europe, not the EU. |
| Asia | A Nextcloud/WebDAV host with a selected country/data centre | S3 storage in a named region, for example Singapore or Japan | Exact country/region availability, backups, transfer path, access/cost and conditional-write behaviour |
| Australia | An Australian-hosted Nextcloud/WebDAV service | S3 storage in Sydney/Melbourne regions where the selected provider supports them | Verified Australian location/plan, backups, processing/metadata boundaries, costs and safe writes |

Do not invent a worldwide list of tested Nextcloud hosts. A usable endpoint is not proof of location, supported onboarding or atomic writes. Provider selection and current terms must be reviewed before a service gets a “verified region” badge. Country choice is more precise than a continent alone.

### Nextcloud / WebDAV

This offers the smallest likely protocol change. WebDAV is a protocol; Nextcloud is software/service that can expose it, not a single global storage operator. Users may already have an account or choose an independent host in their preferred country. A user can also supply a self-hosted endpoint if it satisfies the same security and acceptance checks.

Assess supported delegated login/app-password flows (including Nextcloud's documented login flow where the host supports it), instead of asking users to hand over their primary account password. Hosts, HTTPS, DNS resolution and redirects need the existing SSRF/allowlist protections; country selection must not become permission to fetch arbitrary internal URLs.

Regional hosting contracts, backup location, host versions and write semantics vary. Run the existing create-only/CAS/read-back/conditional-delete and actual two-device tests per connection before granting writes. No browser or backend mutex is a substitute for provider-atomic writes.

### Google Drive and Google Docs

Google **Drive** is the storage service already being integrated. Google **Docs** is an editor/document format/service. Files stored in Drive and Google-native document objects need different handling.

The safe initial Docs experience is an explicit shortcut to Google's own editor, or a separately implemented read/export operation where allowed. Opening Google's editor does not mean Kōbō edited a native Google document. Exporting/importing DOCX/PDF/etc. can change formatting/features; preserve the original and make conversion/save-a-copy explicit. No undocumented remote editor embedding or background overwriting of a Google-native document.

A consumer Drive account is not a country-selection switch. Any Google Workspace business data-region feature must be checked against the customer's actual edition, administrator controls, covered services/data and contractual limitations. Do not promise Australian or Asian residency from an account's billing address or a folder location.

### Proton Drive

Evaluate the current **supported** API/SDK/partner authorization path, supported account plans, key/encryption model and the required conditional-write semantics before offering a Connect button. This workspace could not verify those details. Do not claim Proton has no supported integration, and do not claim one is ready.

Proton must not be presented as an ordinary WebDAV endpoint or connected by scraping a password session. Its end-to-end encryption/key design needs a separate review; storing a normal server token alone does not establish that the intended encryption properties are preserved. Read-only/manual export may be the interim path if no tested write-capable adapter is available. A company's domicile is not sufficient account-level residency evidence.

### Region-selected S3-compatible storage

This is object storage, not automatically a friendly Drive-style account. A guided connection could select provider/region/bucket and app-scoped credentials, with an in-app file/library interface. Use least-privilege credentials or delegated roles; never request a cloud root key. Treat endpoint, bucket and region as a validated server binding, not arbitrary browser-selected network destinations.

Implement a separate adapter for stat/list/read/conditional create/conditional replace/conditional delete. API compatibility does not guarantee matching concurrency guarantees across all S3 vendors. Confirm the selected service's documented primitives and live tests; refuse unsupported writes. Bound object sizes/listing/costs and handle retries, lost replies and multipart completion safely under the existing app chunk/manifest design.

S3 region selection can make file-at-rest location explicit, but does not by itself localise the Kōbō relay, index, tokens, account service or logs. A commercial Kōbō-managed storage subscription would add capacity metering, billing, backups, support and data-processing responsibilities. That is separate from connecting a user's own bucket.

## Guided setup inside the workspace

The proposed entry is Storage → **Connect existing storage** or **Help me choose storage**. Keep today's working settings route and defaults until a separately accepted replacement is ready.

1. Ask preferred country/region and whether the user already has an account. Explain whether the preference concerns provider files at rest or a stricter residency requirement.
2. Show only providers with reviewed capabilities. Distinguish country **confirmed for this plan/account**, provider-reported, and unknown. Show current costs only from verified provider terms, including transfer/egress and backup charges where relevant.
3. If account provisioning is not supported by a documented partner API, open the provider's own setup in a new tab, then guide the user back to connect. Do not fabricate an “instant drive setup” promise or create a paid account without the user's deliberate selection and consent.
4. Authorize the user's selected account through the supported flow. Validate endpoint and bind the connection to the current Kōbō account and provider identity. Keep credentials outside the app iframe and browser persistence.
5. Show account/provider and evidence-backed location. Run capability tests in an isolated temporary path; require atomic write evidence before sync writes. Read-only remains a valid, clearly labelled outcome.
6. Let the user explicitly select an app/library destination. Existing libraries continue untouched. Copy/move uses the agreed targeting and safe-copy semantics; no automatic migration, registry replacement or silent merge.
7. Display saving state, active library and provider. Settings can show location evidence separately without inventing a new required bridge field. Any app-visible metadata/protocol addition is reviewed with Claude first.

Until this is built and provider evidence is confirmed, regional options belong in the proposal, not in working-looking UI switches.

## Data residency: separate the claims

Track these facts independently in an evidence record (proposal, not delivered schema):

- File primary storage country/region and provider account/plan scope.
- Backup/replica locations and retention/deletion scope.
- Where file bytes are processed or relayed.
- Account/email, filenames, provider indexes, logs and analytics location.
- Credential/encryption-key location and who can decrypt.
- Provider/operator jurisdiction and applicable terms/subprocessors.
- Evidence source/date and what has actually been verified.

**Current important limitation:** storage payloads use website server relays; connection/index/account metadata use the existing hosted services. An EU/Australian bucket does not make this architecture “Europe-only” or “Australia-only.” Netlify execution/log locations, Identity/Blobs/backups and client device copies must be considered. Do not rotate or relocate the existing encryption key to create the appearance of a residency switch.

A strict-residency tier would require a reviewed regional data plane and possibly a regional control plane, including indexes, keys, logs, backups and identity. Options include a validated regional broker or scoped direct transfer architecture, but either changes authorization/threat models and needs its own design. Presigned URLs must remain object/operation/user-bound and must not expose general credentials. Direct browser transfers can still reveal user IP/location to the chosen provider. End-to-end encryption and key recovery are separate engineering requirements, not an automatic property of regional hosting.

Show a narrow statement such as “Provider file storage: Australia, verified for this plan” only when supported. Do not expand it into a whole-system sovereignty guarantee.

## Non-breaking rollout and acceptance

1. Keep this work as a proposal first. No reset, connection/provider switch, app origin move, folder rename, index restore, key rotation or native build change.
2. Start with one reviewed regional WebDAV/Nextcloud host in isolated development/disposable accounts. Reuse the current adapter only where it actually fits; keep writable-provider gates.
3. Provider acceptance: create-only and CAS races from independent sessions/workers, stale conditional deletes, metadata/read-back, interrupted/lost-response resume, missing/damaged parts, large originals (including the established 200 MB case where applicable), account/connection changes and two-device conflict recovery. Test index backup/restore without touching the sole live library.
4. Use the existing per-app launch/provider/account fences. Evaluate multiple connections/library selection against the agreed v1.3 design; no new required operation or file layout is frozen by this proposal.
5. Add S3 or Proton only as separately reviewed adapters with feature flags and explicit evidence. Existing kDrive and Google Drive behaviour must continue passing their own tests and live acceptance.
6. Limited voluntary beta, reversible entry/settings exposure, no silent migration. Preserve old data/origins/credentials and a clear fallback. Never “resolve” sync conflicts by deleting browser storage or rewriting a head unconditionally.

## Practical sequence

The next useful implementation is an evidence-backed provider catalogue and **guided Nextcloud/WebDAV connection**, while preserving today's storage UI. In parallel, prepare the S3 adapter design and investigate Proton's supported SDK/authorization/encryption requirements with current official documentation. Google Docs can begin as explicit editor shortcuts and export/copy design, not an untested promise of native document sync.

Creating accounts, choosing a paid plan, committing to a location guarantee, and moving user data remain explicit user actions after a concrete reviewed setup. Nothing in this proposal grants a provider account or changes where existing files are stored.
