# SoraSpace isolated tenant foundation

30 October 2026. **Built and exercised in a disposable PostgreSQL database; not connected to the website, live identity, app bridges or billing.** This is the first implementation step in [the platform roadmap](PLATFORM-ROADMAP.md), not completion of the customer isolation release gate.

## Delivered

- `db/soraspace/001-tenant-foundation.sql`: trial PostgreSQL schema, separate NOLOGIN owner/runtime roles, workspace membership and resource metadata, row-level access policies, immutable tenant/owner/object identity and transactionally appended audit events.
- `server/soraspace-tenant.mjs`: parameterized, bounded resource list/read/create/update/delete service. Every call requires a trusted session verifier and fresh membership; optimistic versions protect updates/deletes. This module is imported only by tests, not a live route.
- `server/soraspace-tenant.test.mjs`: adversarial validation, unverified/suspended identity, unsafe database credentials and connection-failure handling in the normal server suite.
- `scripts/check-soraspace-tenants.mjs`: real PostgreSQL adversarial acceptance with two disposable workspaces. No host TCP port, no live URL, no application credentials and no persistent database volume.

This adds no provider credentials, remote file operations, production database, real tenant, new signup or payment control. Existing Explore/HobbyNest Blobs data remains unchanged. No production migration runner invokes this SQL.

## Roles and privacy

| Role | Private resources owned by the account | Shared workspace resources | Membership changes |
| --- | --- | --- | --- |
| Owner | Read/create/edit/delete | Read/create/edit/delete | No runtime endpoint yet |
| Admin | Read/create/edit/delete | Read/create/edit/delete | No runtime endpoint yet |
| Editor | Read/create/edit/delete | Read/create/edit/delete | None |
| Viewer | Read existing own resources | Read | None |

A new resource is **private** unless deliberately marked `workspace`. Workspace owners/admins cannot read another person's private resource through the runtime service. Editors may edit/delete workspace-shared resources. Sharing is internal; there is no public visibility state or website publication operation. Product wording should make these consequences explicit when a sharing UI is added.

Membership edits, invitations, initial provisioning, owner transfer and support access are intentionally unavailable to runtime credentials. The trial has one active owner per workspace; initial membership is seeded by the disposable fixture only. A future provisioning service must create workspace, initial owner and audit records atomically and protect last-owner/ownership-transfer rules. Platform owner flags, existing Explore capabilities and paid plan claims grant no implicit membership here.

Database operators with privileged credentials can access underlying data. These policies are application/database isolation, not end-to-end encryption or a promise that operators cannot read data. Actual private file bytes are not stored by this prototype.

## Authorization chain

1. A future HTTP integration must verify the canonical-origin session using the existing fresh identity boundary, validate request origin/CSRF, resolve a verified active account and check the appropriate enabled feature/entitlement. None of those responsibilities is replaced by this prototype's injected `verifySession` callback.
2. The request can select a workspace but cannot set its effective account, role or object storage key. Authorization happens afresh on each service call. Global owner/admin flags are ignored.
3. A dedicated low-privilege database login, with membership in `soraspace_runtime` only, uses an exclusive pooled connection for each transaction. The adapter refuses known superuser, RLS-bypass, role/database-creation or schema-owner credentials. Do not give this login other privileged memberships or ownership; verify the real managed provider's role model before adoption.
4. The adapter binds account/workspace with parameterized transaction-local settings, sets the runtime role, uses READ COMMITTED snapshots and limits statements, locks and idle transactions. Context resets on commit/rollback; failed rollbacks discard the connection. Host/provider-specific connection, TLS, total request and pool timeouts remain integration work.
5. Row policies independently filter resources, workspace information and memberships. A query accidentally lacking a workspace predicate still cannot cross its bound workspace. Account-private resources are additionally owner-filtered. Column grants prohibit moving a row, changing its owner/type/object key or forging a version.
6. The same transaction records resource creation/update/delete events containing tenant/resource/actor IDs and versions, without document content or titles. Runtime has no audit read/change/delete permissions; append-only here means immutable to runtime, not immutable against a database administrator. A separately authorized, audited support/audit interface is not implemented.

**Important trust boundary:** PostgreSQL custom settings are not signed claims. Anyone with database credentials or arbitrary SQL execution could change them. This database is server-only; never expose its runtime login to browsers, customer SQL, a generic query endpoint or an untrusted extension. Parameterized queries and the trusted identity-binding service are essential. RLS adds defense in depth; it does not make SQL injection safe.

The narrow membership lookup uses a SECURITY DEFINER function owned by the NOLOGIN schema owner, with a fixed `pg_catalog` search path and fully qualified tables. Owner bypass is intentional on workspace/membership lookup tables to avoid recursive policies. Resources FORCE RLS; audit events deny all runtime access. Never use schema-owner credentials for application requests. Migration and backup credentials must remain separate.

Revocation committed before a resource statement is rechecked by that statement's policy, even if the earlier service membership check passed. An operation already authorized at its statement snapshot may finish concurrently with revocation; this does not promise cancellation of an already-returned response or an already-authorized write. Long-running jobs need their own fresh authorization and cancellation design.

## Data and storage boundaries

Resource identity is `(workspace_id,id)`, and identical IDs in separate workspaces remain separate. Supported resource types are `document`, `file` and `site-draft`; `body` is bounded JSON metadata/content, not a filesystem, universal editor document or upload endpoint. Names are display text, not paths. No rendering layer exists here; any future renderer still needs appropriate text/HTML sanitization.

Storage namespaces are generated by the database as `soraspace/v1/workspaces/<workspace UUID>/objects/<resource UUID>`. A future object gateway must first authorize the resource, derive that exact namespace server-side, then authorize the requested immutable object/version. Never accept a key or tenant prefix from the browser. Reserving resource metadata does not prove that bytes exist, are scanned, backed up or are safe to serve.

Pagination uses an opaque UUID cursor within the authenticated workspace and selected resource type, at most 100 items. It is not an export snapshot: concurrent creation/sharing can change later pages. Export/backup must use a consistent snapshot and scoped authorization of its own. Create operations currently generate a new resource ID per call: lost-reply retry receipts/idempotency are not implemented and must be added before exposing creation over HTTP. Metadata deletion is immediate in this disposable prototype; a user-facing trash/retention flow and object garbage collection are separate work. Resource payloads are returned only to trusted server callers; public caching is prohibited when HTTP routes are eventually introduced.

No tenant-aware export, restore, search index, background queue, public site cache, custom-domain routing, object upload/download grant or application library migration exists yet. None should reuse a global key or the current owner-only content service as a shortcut.

## Reproduce and validation

Requirements: Node with project dev dependencies, Docker, network to pull the pinned PostgreSQL image on first run, a Linux shared Unix socket filesystem. Run:

```sh
npm test
npm run test:soraspace-tenants
npm run build
```

The database check pins PostgreSQL's container digest in its script, uses temporary memory-backed database files, waits for the final server (not initdb's temporary one), connects over a temporary Unix socket and removes the container/socket on completion. Its test-only local socket authentication is **not** a production database configuration. No Docker image is deployed with the website. The `pg` package is an exact dev dependency used by this acceptance script; the server adapter uses an injected pool interface and no deployment database configuration.

Verified in PostgreSQL 17.11: two-tenant list/read/write/delete denial; private notes hidden from owners/admins; viewer restrictions; same object IDs and filenames in different workspaces; unscoped SQL filtering; forged tenant/owner refusal; no runtime membership promotion/audit modification/RLS bypass; missing/malformed context; admin-credential refusal; pooled context clearing after success/failure; fresh identity/account suspension; membership revocation/expiry and suspended workspace; revocation between verification and resource read; concurrent version conflicts; stale deletes; audit rollback; bounded pagination.

## Next build and activation gates

1. Choose and qualify a managed transactional database and private object store with actual supported role/transaction/pooling semantics, costs, regions and backup/restore. No provider has been selected or paid resource created.
2. Build an isolated trial deployment with the real identity adapter, feature flag default off, authenticated HTTP routes and CSRF handling. Add tenant onboarding, owner lifecycle, account deletion/retention, invitations, membership auditing and explicit support-access controls.
3. Build private object uploads/download grants, version coverage, malware/type/size limits, quota accounting and two-tenant storage tests. Retest account switching across app iframes, caches and library indices; do not silently migrate existing libraries.
4. Add the template/page draft/publish model and verified subdomain mapping; test private assets, direct URLs, feeds, search, previews and cache isolation separately. A page switch alone cannot enforce publication privacy.
5. Add scoped jobs/export/restore and failure/retry isolation, operational monitoring and a successful backup restore drill. Do a separate security review before inviting customers.
6. Subscription entitlements, custom domains and SoraShop merchant/order isolation each retain their own gates. This foundation does not make the current HobbyNest catalogue multi-merchant or enable checkout.

Rollback is removing these unused modules/docs/test command and their trial schema on a disposable database. No live data is migrated and the current production routes do not import them. Do not run a DROP command against any live database as an automatic rollback.
