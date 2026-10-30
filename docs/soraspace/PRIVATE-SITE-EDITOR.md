# Owner-only private site editor trial

30 October 2026 (Sydney). A testable continuation of the [setup questionnaire](SITE-SETUP-WORKFLOW.md). **This is not a customer publisher or the live tenant backend.** It runs under Claudia's existing fresh owner identity on Explore, not the standalone public SoraSpace landing site.

## Delivered controls

My Studio → SoraSpace site editor (`/studio/soraspace-editor`) provides:

- One account-bound private trial draft, saved explicitly and reopened from the server.
- Seven standard pages: enable/hide, rename navigation, reorder with keyboard-accessible arrows, choose an enabled homepage and a featured page. Hidden pages retain their content. These switches affect the private preview; no public route is created or changed.
- Site name/tagline, short text logo mark, footer, all five templates, System/default or explicit palette, and compact/comfortable spacing. Template changes preserve content. Logo/cover uploads remain future work, not arbitrary remote URL fields.
- Per-page heading, summary and plain text; no raw HTML, scripts, remote asset retrieval, rich editor embeds, article collection ingestion, contact delivery or shop checkout.
- Interactive draft navigation and wide/phone preview. A disabled page does not appear in preview navigation; the homepage must stay enabled.
- JSON export/import, including validated conversion of the original questionnaire export. Import replaces only the in-tab draft until Save. Existing answers regenerate the v1 draft; untrusted exported authority fields never establish ownership/publication.
- The questionnaire's new **Save & open editor** explicitly creates the trial draft. It refuses to overwrite an existing saved draft; Open saved editor draft is available instead. Generate draft and Download still do not save to the server.

Brand controls collapse to keep page editing compact. Navigation-order buttons appear for the selected page instead of cluttering all rows. Responsive layouts stack at tablet/phone sizes; native controls retain 44px targets.

## Storage and security

`server/soraspace-editor.mjs` uses a dedicated strong-consistency Blobs store `soraspace-owner-editor`. The key is `owner-drafts/<SHA-256 of verified owner identity>`. The stored account binding is checked on reads. It does not reuse Explore content, cloud file indexes, app libraries or HobbyNest's catalogue. There is one trial draft per verified owner, not an arbitrary tenant ID supplied by the browser.

`/api/soraspace/editor-draft` requires fresh `settings.manage` access and server-side isOwner checks. GET/PUT only, private/no-store. PUT verifies Origin/CSRF, streams a maximum 128 KiB request and validates schema 2, private/draft status, page IDs, text bounds, theme IDs, homepage/highlight and derived navigation eligibility. The model is bounded to 60,000 UTF-8 bytes, compatible with the future resource body bound. No public visibility state or publication operation is accepted.

Each save binds expected account, strong ETag and a client-generated mutation UUID. CAS prevents stale writes; the last 32 normalized request digests make lost-response retries idempotent. A reused UUID with different content is rejected. An old successful request receipt returns the latest current record; it does not reapply old content. Older receipts beyond the bound cannot pass a stale ETag. This is a bounded save receipt, not a full administrator audit/history or a backup.

A failed/uncertain save blocks further saves until reload. In-tab edits remain exportable; reload asks before discarding unsaved changes. The client verifies session before and after network operations, fences late replies by account/epoch, and clears private UI on account change. An operation already authorised server-side may complete to its original owner's draft; it must not be displayed under the next account.

All preview user text is rendered with DOM text nodes. Imports are bounded and validated before replacing current state. Preview changes use no iframe/remote code. Unsaved work receives a browser unload warning where supported; this is not guaranteed crash recovery or autosave.

This is an explicit owner preview exception, not a shortcut to multi-customer tenancy: do not enable ordinary customers on this store/API, infer platform-staff authority from legacy owner flags, or move these keys into a shared SaaS account. Before customer rollout use the qualified tenant database/identity/object authorization/provisioning/audit design and gates in [tenant foundation](TENANT-FOUNDATION.md).

## Administration assessment

My Studio → **SoraSpace Administration** (`/studio/soraspace-admin`) is a protected read-only readiness inventory of eight control areas. Existing tools are labelled owner tools, prototypes are labelled, and required controls are not actionable fake toggles. It displays no sample customers/revenue/health telemetry. Read the [full super-administrator assessment](SUPER-ADMINISTRATOR-ASSESSMENT.md) for roles, controls, source gaps, stage gates and acceptance cases.

## Verification and limitations

- Server tests: page/content retention, navigation/homepage/highlight constraints, authority/HTML/asset injection shape refusal, v1/v2 import, owner/account binding, separate scope, idempotency and two-writer CAS using a real local Blobs server.
- Browser fixture: actual questionnaire → private save → editor, reopen, hidden content retention, navigation/homepage/highlight, safe XSS text, conflicting second writer, export/reload and rejected public import, late-account clearing; editor and administration fit 320/390/768/1024/1366px.
- Packaged production SSR: both pages require login/fresh owner on custom domains, API is private, CSRF refuses an untrusted origin, stale save conflicts, and published-state import is refused.

Actual app/storage two-device acceptance remains separate. No production customer was provisioned, public publication enabled, payment created, domain rebound, original file moved or credential changed. Draft storage remains on the existing Netlify infrastructure; it is not a Europe-only or end-to-end encrypted service. Whole-platform backup/restore and an administrative audit plane remain requirements.

Rollback can remove owner links/routes/modules without touching existing Explore data. Preserve/export any trial draft first; do not automatically delete its store. Current application files, publishing content, database foundation and third-party storage folders remain independent.
