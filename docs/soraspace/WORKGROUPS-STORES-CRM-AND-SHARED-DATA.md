# Workgroups, multiple stores and shared app data

30 October 2026, Sydney. Agreed product direction; this is not an active multi-tenant feature or a claim that current per-account Blobs equal workgroup membership. Existing tenant/RLS work remains an isolated foundation until a database, provider identities and storage grants are qualified.

## Workgroup signup and seats

Offer Personal or Business/workgroup. A workgroup starts with **5 seats**; suggested selectors are **5, 10, 15, 20, 25, 50, 100 and 250**, with reviewed custom quantities above that. The founder counts as one seat. Capacity is purchased for a workspace, not inferred from the number of emails typed into a form. Do not claim 250-user production readiness before load, permission and recovery tests.

Setup: verify account → choose group name/type → select ready services → select capacity/billing period → show full quote → establish workgroup administrator → configure privacy/storage → invite members now or later → review before publishing anything. Keep the personal workspace separate and provide a workspace switcher. A person may belong to multiple workgroups without merging their private libraries.

Show **From A$… per user/month** alongside the **full group total and minimum five-seat commitment**, the actual monthly/yearly charge, tax treatment, optional-service totals, limits and any evidenced volume discount. No price has been fixed by this design. Upgrade/proration requires an explicit quote/consent; downgrades must not remove members or files automatically. A pending invitation reserves capacity until acceptance, expiry or revocation; accepting cannot charge again for an already purchased seat. Use transactional membership/seat reservation to avoid overbooking from concurrent invites.

Support invited, active, suspended and removed membership states; owner/admin/member/viewer roles; scoped invitations that can be resent/revoked; verified email binding; group ownership transfer and last-admin protection. Group admins cannot become platform super administrators or grant themselves private-file access. Login email domains are not membership evidence. Workgroup trials need a workspace-level clock/seat allowance and quota policy; individual trial controls must not be mistaken for a business seat licence.

## Private and shared files

Personal/private files are the default. Uploading inside a business account or joining a group does not automatically share all files. Offer **Private**, **Selected members** or **Workgroup**, with distinct view/edit and optional re-share rights. Share owners must be allowed to revoke grants. Administrative control of membership/shared folders is separate from reading personal content.

Every operation needs verified account, workspace membership, file identity and current grant checks. Use immutable workspace/file IDs, tenant-scoped object paths, versioned saves, audit and cache invalidation. No email address alone grants access. Search, previews, export, background jobs and download URLs must enforce the same scope. Removed members lose future shared access; explain unavoidable limits for previously downloaded bytes. Public publishing is a separate deliberate action.

Current production private-file APIs remain owner-scoped. New sharing endpoints/storage grants must be implemented and tested before exposing a Share button that promises real access. Never implement sharing by removing an owner check from a legacy endpoint.

## Multiple stores within one workspace

Yes: one workgroup may eventually own several stores, each with its own immutable `storeId` under `workspaceId`. Examples: HobbyNest physical/STL store and a separately branded digital-products store. Each store has independent catalogue, URL/branding, visibility, physical/digital section switches, checkout pause, shipping/tax settings, inventory, order sequence and fulfilment. Closing one store must not close another or the workspace/apps.

Distinguish platform subscription checkout, individual merchant-store checkout, storefront visibility and physical/digital product availability. A payment provider account belongs to the merchant; product charges are not SoraSpace subscription revenue. Bind signed payment events to workspace/store/merchant/order/amount/currency and reconcile idempotently. Shared inventory must be an explicit stock-pool choice with transactional reservations; do not duplicate stock across stores. Digital download grants are order-scoped and private.

Implement a store registry, tenant/store authorization, migration of current HobbyNest into a preserved default store, transactional stock/orders and tested merchant connections before public multi-store provisioning. Current HobbyNest uses one catalogue and its two section controls; it is not yet a multi-store workspace. Do not silently rename existing object keys, reset inventory or split existing orders during this migration.

## Contacts and CRM must talk to one another

Aim for shared, permissioned **contact and organisation records**, linked from SoraMail, Projects, CRM, invoices and document mail merge. Keep a personal contact book distinct from business contacts. Use stable contact IDs, external-provider ID mappings and field provenance; avoid uncontrolled copies for each app. Email addresses can change and are not sufficient identifiers or safe duplicate-merge keys.

A planned schema includes workspace/contact ID, name, organisation links, email/phone/address fields, labels, owner/visibility, consent/subscription preferences, source/version and archival status. CRM adds relationship-specific opportunities, stages, notes, jobs, activities and invoice references without forcing those private notes into an address book. Issued invoices snapshot customer/legal address details; future contact edits must not rewrite issued invoices.

Two-way updates need a defined SoraMail interface from Claude, supported field mappings, provider authentication, version checks, conflict review, duplicate suggestions, revocation and deletion propagation. Changes from CRM should appear in the permitted SoraMail contact view and vice versa. Group membership does not grant access to a person's whole mailbox, calendar or private address book. Never import every mail sender into CRM automatically.

## Mail merge and reviewed mail-outs

SoraDocs templates can select a permitted contact segment and map fields, preview generated documents, validate missing fields and create drafts. Email mail-outs should show the recipient list and content, respect purpose/consent and opt-outs, offer a test message, and require an explicit Send action through an authenticated mail provider. Track per-recipient delivery/retry idempotency without exposing recipient addresses to other recipients. Do not send to all CRM contacts by default or reuse transactional permission as marketing consent. This design sends no messages.

Apps should use purpose-scoped APIs/links to shared records and files, not universal access to everything in the workspace. Cross-app search, recent activity, attachments, exports and AI tools must all respect the same permissions. Current app bridge identifiers and storage contracts stay unchanged until a reviewed extension is agreed.

## Delivery order

1. Stable per-account app/file flows, trial controls and restore speed.
2. Qualified tenant identity, transactional database, recovery and workgroup/seat policies.
3. Workgroup onboarding, invitations and explicit file grants; privacy/concurrency/load tests through 250 seats.
4. Store registry and independent store controls before merchant checkout.
5. SoraMail contact contract, shared contacts and Projects/CRM links.
6. Document merge, reviewed email sending and provider reconciliation.

None of workgroup provisioning, seat checkout, multi-store commerce, CRM, bidirectional contact sync or mail-outs is enabled by this planning document.
