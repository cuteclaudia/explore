# SoraProjects and SoraCRM sales pages

Public routes: `/tools/soraprojects/` and `/tools/soracrm/`. Both are linked from the Business & collaboration splash group and the complete app directory. The existing Projects hero shortcut and feature-guide sections also lead to the new pages. Each page links the other, and the Projects billing concept links the existing finance guide rather than inventing a live invoice route.

Both apps remain Planned. These pages are source/build marketing work: no project/task service, contact persistence, timer, inbox adapter, import, message send, invoice or payment is activated. The existing `/business` hub remains separate, with disconnected operational data until authorised service adapters exist. PRJ-01–08, CRM-01–05 and the associated contacts/finance/procurement release work remain open. See [the implementation design](PROJECTS-CRM-AND-FINANCE-DESIGN.md) for the canonical product scope and reviewed Jira/monday.com patterns. No competitor branding, artwork, UI code or feature-parity claims are used.

## SoraProjects concepts

Six original static concepts use an example workgroup and fictional records:

1. Ten-row compact project library with navigation, search/sort/group controls and selected-project inspector. Open/paused/complete counts and a selected project's 25% (2/8 tasks) are coherent.
2. Eight work items with assignees, states, due dates, effort and dependencies, including a selected task waiting on an approval. Job/subjob hierarchy, cycle validation and safe date changes remain planned rather than implemented by this table.
3. A board and dated timeline of those same eight task identities: four To do, two In progress and two Done. Bars correspond to the visible November ranges; no dragging or scheduling action runs.
4. Six time records with 7.5 tracked hours: four approved billable hours at AUD 80/hour (AUD 320), 2.5 submitted billable hours (AUD 200), and one non-billable hour. Submitted work does not enter the draft invoice.
5. An accepted 15-hour/AUD 1,200 estimate, requested +3-hour/AUD 240 change and pending 18-hour/AUD 1,440 total. Requested scope does not overwrite accepted scope. A separate draft billing preview shows only approved time (AUD 320 before configured taxes), Not issued and Not requested payment states.
6. Business summary widgets and role examples, keeping project contribution, scope management and invoice issuing separate. Fictional counts follow the library/task/time records rather than masquerade as live business data.

Nine benefit cards cover lists/jobs/subjobs, alternative views, dependencies/milestones, time/rates, estimates/alterations, reviewed finance handoffs, templates/custom fields and future capacity/reporting. The pages do not require software-specific terms or sprints. Other currencies, tax/issuing rules, timer recovery, actual sharing and financial providers need separate qualification.

## SoraCRM concepts

Six concepts use fictional people, three organisations and estimated values:

1. Twelve-row contact library with selected-contact inspector, role/owner/contact preferences and deliberate sharing. Personal contacts and store-specific customers are not implicitly shared or merged.
2. Organisation context with four related contacts, two opportunities totalling AUD 3,600 and two active linked projects for Example Studio. Original records keep their own permissions.
3. Six opportunities as both a value-sorted table and the same-identity stage board. Qualified/Proposal/Negotiation counts are 3/2/1 and the total open pipeline is AUD 14,900. Estimates are explicitly not invoices, sales receipts or received revenue.
4. Source-linked activity/notes, two assigned follow-ups and visibly unconnected SoraMail. No personal inbox is copied, recipient audience selected or outgoing message sent.
5. Reviewed CSV field mapping, source/consent review, possible duplicate comparison and a separate shop-scoped record. Matching email/name alone is not sufficient to merge identity, permission or marketing consent.
6. Relationship widgets and action-specific role examples. Totals, future exports and linked commercial/financial records must respect the same access as the source, with clear periods/snapshots and freshness.

Nine benefit cards cover people/organisations, shared contact identity, opportunities, activity/follow-ups, import/export review, consent/suppression, future project/finance handoffs and summary widgets. Automation, enrichment, mailouts, merchant connections and supported account integrations are not represented as live.

## Shared presentation and local evidence

Both use the established `sc-library`, table, toolbar, selected-row and inspector patterns, with the same colours/spacing as Photography, Journal and the other compact concepts. Phone samples stack the shell and keep wide tables/timelines locally scrollable; operational phone flows should drill into a record with a clear Back route. Views/preferences and widgets are illustrative, not saved by these sales pages. No fake interactive form, customer account, real personal data or provider call is used.

Overview/metadata copy has 16-language catalogue coverage. Detailed fictional concepts remain explicitly English, with full editorial localisation still pending. `scripts/check-work-sales.mjs` validates both builds at 320/390/768/1366px, direct business-group links, twelve concepts, compact desktop panes, list/board identity, effort/time/currency examples, organisation/pipeline totals, local table scrolling, French/Japanese routes/anchors, light/dark contrast and absence of live actions/network calls. Internal design captures are under `/workspace/reviews/work-sales/` (project library/board-timeline/scope, CRM library/pipeline and phone views); these are not accepted operational screenshots.

The current audit lists 33 modules: eight detailed pages, six basic previews and 19 guide-only gaps. Metadata and sitemap checks cover 256 locale routes. Next priorities are the remaining creative app pages, then useful explanations for finance/procurement/support and shared services; none should imply separately priced apps without approved packaging. MKT-01/02 remain Partial, and source/build checks do not establish live deployment or operational app acceptance.
