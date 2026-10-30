# Research Library, Zotero compatibility and SoraSpace Projects

30 October 2026 (Sydney). Claudia wants app previews, a useful research workflow, a longer-term project-management service with Monday.com-like capabilities, and optional AI only after stable core builds. This is a staged product/integration plan, not a claim that those services already exist.

## Recommendation

Build a **SoraSpace Research Library** that initially works with Zotero and interoperable reference exports. Do not require researchers to abandon their existing library, and do not try to recreate Zotero's mature connector/style/plugin ecosystem before core account/storage stability. A standalone reference manager is a possible later product once source storage, metadata, citation processing, sync and portability are proven.

Build **SoraSpace Projects** later as an additional service for creatives, students, academics and other workers. Use original SoraSpace interfaces and branding, with familiar boards/tasks/status patterns; do not copy Monday.com's assets or promise full feature parity. Keep it linked to documents, research notes and chosen storage instead of creating another isolated file silo.

## What the source actually supports today

Inspected supplied/local upstream WordCraft material: `/workspace/vendor-review/wordcraft-main/docs/zotero.md`, engine/UI source references and the Claude handoff privacy table under `reviews/claude-2026-10-29/docs/kobo/PRIVACY-AND-DATA-FLOWS.md`. Fumi is the renamed Docs engine; source documentation is **not independent acceptance of every feature in the exact installed Fumi build**.

The documentation describes native desktop commands for add/edit citation, add bibliography, refresh, document style/language/note preferences, unlink and adding notes, using Zotero's local word-processor protocol. It describes DOCX fields such as `ADDIN ZOTERO_ITEM CSL_CITATION`, bibliography fields and preferences. Interoperability still needs round-trip tests against actual Word/Zotero and accepted Fumi releases.

It explicitly says the **web version cannot use that desktop socket connection**. A visible Zotero ribbon is therefore not proof of a working browser integration. Its desktop loopback protocol has trust limitations; do not expose a new unauthenticated localhost broker or relay arbitrary web requests to local ports. Current provider/API/authorization terms were not independently checked online in this environment.

## Stages

| Stage | Useful behaviour | Acceptance / scope |
| --- | --- | --- |
| 1. Stable foundations | Verified accounts, isolated files/drafts, recovery/export and reliable document formats | Existing app/two-device and tenant gates; no citation/source loss |
| 2. Portable library | Import/export CSL-JSON, RIS and BibTeX through qualified parsers, source metadata, collections/tags and duplicate review | Preserve identifiers/authors/dates/DOI/URLs/provenance; bounded parser input, malicious content tests and round trips; never merge solely by title |
| 3. Reading and private journals | Link source → PDF/attachment → quote/page locator → reading note → project/draft | Tenant-scoped private assets and notes, provenance, version/recovery and explicit sharing; private research journals never auto-publish |
| 4. Zotero connection | Explicitly authorised library access, read-only first; supported libraries/collections and sync versions | Confirm current official supported API/auth, least privileges, revocation, account switching, group-library membership, rate limits and deletion/conflict policy. Never ask for a primary Zotero password or upload an entire library automatically. |
| 5. Citations in Docs | Insert/update citations and bibliographies using stable source IDs and a qualified CSL processor | Claude owns app hooks/document fields; joint versioned bridge design if required. APA/Chicago/Harvard/Vancouver examples, locators, multiple authors, note styles, updates, undo, exports and field preservation. No invented reference, DOI or unsupported style guarantee. |
| 6. Projects | Private project boards and linked work, then collaboration once real workspace membership exists | Own product schema, transactional permissions, retries, audit, export and concurrency tests |
| 7. Optional AI | Summaries, outline/task suggestions and source-grounded assistance | Opt-in provider scope, cost limits, retention/location evidence, citations back to real source spans and human approval of writes |

Reference-library sync and a word-processor citation plugin are different features. Reading Zotero Web API metadata alone does not insert live citation fields into a Fumi document. A browser bibliography generator must not silently flatten editable citations. Any conversion should preserve originals and state its limits.

## Research workflow

Create a project or collection, capture verified source metadata and lawful attachments, annotate/read and record page-specific quotations, write private research notes, assemble a draft in Docs, insert/verify citations, then explicitly publish an article or a selected journal entry. A personal research journal and a public website Journal page are separate visibility domains. A public article must not leak unpublished notes, source PDFs, collaborators' private details or access tokens.

Suggested records: scoped source ID and version, bibliographic metadata with provenance, attachment references, collection membership, note/quote locator, document citation links, project links and publication snapshot. Deleted/changed sources need warnings and recoverable links; a bibliography should remain reproducible from its source/version snapshot. Personal versus shared/group library permission is explicit.

DOI/title search can be an optional fixed-provider lookup after supported API and privacy review. Never treat plausible AI metadata as a verified paper or auto-resolve arbitrary user URLs from the server. Citation style data/licences, parser/processor licences and exported-field compatibility need qualification. Avoid promises of institutional certification, DOI issuance or peer review services not delivered.

## Projects first-release direction (longer term)

- Boards, groups and tasks; status, priority, due dates, assignee and a linked file/source/draft.
- Board and list views first; calendar next; timeline/dependencies after concurrency and scheduling semantics are reliable.
- Comments/updates, activity history, filters/search, notifications and import/export.
- Creative workflows such as client brief → draft → review → deliver, and research workflows such as source review → analysis → manuscript → revision.
- Personal/private projects first. Shared projects/assignments require real membership, invitations and permissioned attachments; a saved email address is not a user grant.
- Stable IDs scoped by tenant/workspace/project; versioned writes; idempotent task creation/comments; immutable activity attribution; timezone/date and notification preferences. Preserve original files and avoid copying bytes for every task link.

Time tracking and job billing are now part of the confirmed staged Projects direction below. Automation, workload dashboards, guest access, external integrations and templates can follow. No AI or arbitrary third-party scripts are required to use core tasks. Projects and Research Library can be additional subscription services later, with transparent quotas and source-aware grants. They are not active paid products in the current signup chooser.

## AI after stability

AI must be optional per account/workspace, with explicit action-level consent for document/source access and clear provider/location/retention information. No training-use or data-residency promise without provider evidence. Use minimised excerpts, redacted logs, token/spend limits and safe handling of prompt injection in imported papers. Show draft suggestions, require confirmation for edits/publication and never let an AI result grant roles, alter billing or delete data. A research answer must distinguish verified sources, quotations and generated synthesis. Do not fabricate citations, claim a paper was read without access, or overwrite a bibliography from guessed metadata.

## Ownership and next deliverables

Website/platform work: previews, service catalogue/request flow, scoped source/project APIs, storage/permission model, import/export planning, privacy/status UI and backend authorization. Claude: native/web engine citation hooks, parser/format compatibility and app integration/build acceptance. The existing app bridge/IDs/storage folders stay unchanged until a specific extension is reviewed.

Public splash now has four compact **illustrative interface previews**, not screenshots or proof of app-specific support, with public product-preview/signup links and a research direction section; actual app access remains gated. Later replace illustrations with reviewed screenshots of accepted builds and consented/synthetic content. Research Library, Projects and AI remain labelled planned. No Zotero account/token, library import, native code, localhost service, AI API or paid provider was added.

## Jobs, time, alterations and client billing — confirmed product direction

Claudia's 30 October requirements extend Projects beyond boards: a user should be able to manage a job from its brief through work, alterations, invoicing and electronic payment. These are planned capabilities, not a payment feature activated by the splash.

- **Jobs and sub-jobs:** client, reference, brief, dates, status, responsible person, linked documents/files, estimate and budget. Stable task/sub-job hierarchy, cost roll-ups and permissioned activity history; avoid cycles and double-counting parent totals.
- **Time:** manual entries and start/stop timers, person, job/sub-job, date/timezone, description, billable/non-billable flag and approval. One running timer per person by default; resumable after reconnect, explicit overlap review, no duplicate billing from retries. Retain correction history instead of silently rewriting an approved entry.
- **Rates and fees:** hourly, fixed-price and mixed jobs; currency and tax settings, client/job/sub-job overrides, estimates, agreed caps and optional rounding rules. Snapshot the agreed rate and rounding method onto each billable/invoiced item; later rate changes must not recalculate old invoices. Compute money using currency minor units/decimal arithmetic, never floating-point totals.
- **Alterations:** record requested changes, included revision allowances, extra time/materials, an estimate and client approval before treating an extra as billable. Keep the original quote, approved variations and resulting invoice distinguishable.
- **Invoices:** draft from approved unbilled time, milestones or fixed fees; review line items, discounts, tax treatment, due date and payment instructions. Invoice numbers must be unique per issuing business. Issued invoices snapshot business/customer addresses, quantities, descriptions, rates and tax. Corrections use an auditable credit/replacement workflow; exports include PDF and structured CSV.
- **Payments:** provider-hosted checkout/payment links, Square first for evaluation, PayPal as another candidate. The user's own business receives client payments; SoraSpace subscription fees remain separate. No raw card storage. Use server-verified signed webhooks, invoice/workspace/merchant/amount/currency matching, idempotency and reconciliation before marking paid. Support pending, paid, part-paid, failed, refunded and overdue states; a browser success redirect alone is never payment proof.
- **Visibility and control:** own/private workspace initially; later distinct permissions for contributors, approvers, financial managers and invited clients. A client sees only explicitly shared job/invoice information, not internal notes, rates, files or another client's records. Track quotes awaiting approval, billable time, uninvoiced work, due invoices, receipts and exports.

Suggested sequence: (1) jobs/sub-jobs and private notes; (2) time/rates/budgets with export; (3) variations, quote approval and invoice drafts/PDF; (4) electronic delivery, merchant connection, hosted payments and reconciliation. Validate account/workspace isolation, concurrency, rate snapshots, timezone/rounding, duplicate timers and invoices, webhook retries and refunds at each relevant stage. Confirm merchant eligibility, provider fees, tax requirements and supported recurring/one-off features before committing public prices or enabling checkout.

Research management remains a first-class service alongside Projects: source collections, reading notes, private research journals, references/citations, bibliographies and Zotero compatibility. Public copy must distinguish desktop citation evidence from planned browser integration, and personal research notes from published journal articles.
