# Irodori storage draft 2: website review

28 October 2026, Australia/Sydney. Original proposal retained in `releases/irodori-0.16.0/STORAGE-PROPOSAL-DRAFT-2.md`. This reviews the proposed design; it does not attest to an implemented app or enable storage.

The revised registry validation, bounded explicit reconciliation, committed previews, fresh CAS retries, read-only rules, same-ID lost-reply verification, scoped journals and request-bound v1.4 leave receipt address the main draft 1 concerns. The storage model is acceptable in principle, subject to the clarifications below. v1.4 remains a proposal, and Hikari's outstanding live acceptance stays first.

## Remaining clarifications for Claude

1. **256 MiB is the aggregate generation budget in the existing helper.** Draft 2 gives that entire amount to `document.pcraft`, then adds a preview. Keep the combined logical files within 268,435,456 bytes: reserve preview space, or omit it at the boundary. Do not raise the shared guard implicitly. Test exactly at/below/above the combined limit before assembly and upload.
2. **Restore explicit preview limits:** PNG only, no more than 256 pixels on either axis and 128 KiB encoded. Validate byte count, signature and IHDR dimensions before decoding, and verify the committed logical-file hash. Decode failures use placeholders. Serve privately with `image/png` and nosniff; revoke object URLs. The Drive page is still not implemented.
3. **Dirty recovery survives closing.** “Removed after saved or closed” must not mean tab closure, iframe teardown, sign-out, a crash or ordinary closing of an unsaved document. Delete a dirty branch only after a verified durable save of its current revision or explicit Discard. A completed save of an earlier revision must not delete newer edits. Download completion is not proof of preservation. Browser quota and abrupt-exit writes remain best effort.
4. **Storage quota is not decoded-memory capacity.** Do not automatically decode up to 1 GiB of recovery files at startup. Offer lazy/limited restores under an independent decoded-memory/layer/canvas budget. Bound serialization/spooling before creating a second large upload buffer; validate actual codec limits independently of registry display dimensions.
5. **Account changes cannot leave another account's live canvas accessible.** Reconcile §4 with §8: sign-out/revocation forces immediate teardown; it cannot wait for user downloads. User-initiated connection/app switching uses held, successful recovery and consent once the v1.4 protocol is agreed. Do not silently transfer pending work between scopes or promise an asynchronous recovery write will finish during forced teardown.

## Website work delivered here

The Google Drive checkpoint trigger now includes `documents.json` as well as `head.json` and `libraries.json`, including nested paths. A registry-only rename/hide is captured before publication. Added tests restore an isolated lost index containing multiple document heads, private preview bytes, document bytes, names and hidden flags, and prove checkpoint failure preserves the prior registry/ETag. These use opaque transport fixtures; they do not test `.pcraft` decoding or live provider recovery.

**Capacity remains a blocker:** the existing 4,096-record/2 MiB per-app/connection snapshot bounds include retained generations. This release does not expand them or deliver incremental/chunked recovery. Agree and test that architecture, or an enforceable app-wide lifetime budget, before enabling Irodori cloud writes. Full snapshots on each control write also need throughput measurement at scale. Never bypass checkpoint failure to publish a head/registry.

The disposable live recovery drill is still pending. The new normal Irodori workspace is device-download only and makes no `/api/kobo/*` calls. It supplies an unavailable/read-only identity status for future compatible app code, without granting any cloud operation. No storage API contract change is made.

## Version clarification

Although draft 2 labels §11 step 1 “in this build”, Claudia explicitly confirms it is **in progress and not deployed**. The currently hosted 0.16.0 ZIP has no native bridge or scoped recovery. Wait for Claude's new versioned ZIP, handoff and hashes before reviewing those features. Hosting that known original build as the normal editor does not approve or activate proposed storage.

## Message to Claude

> Irodori 0.16.0 is being promoted to the normal permission-protected My Studio workspace, using the existing separate origin and WebGL2 option. It remains device-download only; the previous editor and owner preview stay available. Claudia confirmed your draft 2 step 1 is still in progress, so we await a new versioned ZIP/handoff/hash before claiming scoped recovery.
>
> Draft 2's storage model is agreed in principle, with five clarifications: the existing 256 MiB cap covers document plus preview together; explicitly retain the 256px/128KiB PNG limits; dirty recovery must survive all non-discard closure/teardown and newer edits; restore lazily under a decoded-memory budget; and reconcile account-change wording with immediate sign-out/revocation teardown. Please incorporate these before freezing the design.
>
> Website checkpoints now cover documents.json, with registry-only rename/hide, lost-index restoration and failure-preserves-old-value tests. Index capacity remains 4,096 records/2 MiB including retained generations, so cloud writes stay off until capacity is agreed/tested. v1.4 runtime and Drive listing remain pending. Continue the new bridge/scoped-recovery/renderer/cache-header build; Hikari's remaining live acceptance comes first.
