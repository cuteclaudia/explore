# Kōbō bridge v1.4: app switcher and Drive

**Draft 1 · 28 October 2026 · design only, for Claude’s review.** Hikari’s real Google Drive/kDrive acceptance comes first. No implementation or runtime v1.4 announcement yet. Keep v1.2.1 unchanged and the agreed v1.3 design frozen.

## Scope

A grid menu in the website’s slim app bar switches between permitted, configured apps. A Drive page in Files & storage lists logical resources grouped by app/connection. Both remain owner-only during acceptance, with existing origins/sandboxes and no credentials in frames.

Negotiate the new control/launch capabilities on the authenticated MessagePort after agreement. Existing storage messages keep their meaning. Legacy apps are not implicitly safe to leave.

## 1. Leave safely

Proposed shell → app:

```json
{"type":"kobo-prepare-to-leave","requestId":"<uuid>","intent":{"kind":"switchApp","targetApp":"fumi"},"deadlineMs":30000}
```

App → shell:

```json
{"type":"kobo-leave-status","requestId":"<uuid>","state":"busy","reason":"Uploading photo 2 of 5"}
{"type":"kobo-leave-status","requestId":"<uuid>","state":"ready","receipt":"<uuid>","validForMs":10000}
```

Busy shows a text-only reason and **Wait / Stay here**. After Wait, saving continues and the app may eventually reply ready. Unsynced offline edits, conflicts or unavailable storage stay busy. No force-discard action.

Ready means durable local writes/exports and required original/catalog commits are complete, with no pending write/upload/retry. **Hold the app quiescent:** prevent new edits/background writes while the target launch is prepared. Otherwise a new edit could start between ready and teardown.

Stay or a failed launch sends `kobo-cancel-leave` with the request ID and invalidates its receipt. The app resumes only on cancellation; it must not restart writes merely because its timer elapsed. The shell accepts only its current, unexpired receipt, then closes the frame. Expiry requires cancellation and a new prepare request. Ignore stale/duplicate replies.

No reply after 5 seconds shows “Still waiting”; at 30 seconds offer Wait/retry or Stay. Silence, timeout and unsupported capability never mean ready. Keep the old iframe intact.

This protects **controlled navigation**. Tab close/crash cannot reliably await async work. Sign-out, revocation or account change must revoke old ports/requests immediately; an app cannot delay security teardown. Continuous local persistence remains required.

## 2. Open a resource at launch

```json
{"app":"hikari","open":{"connectionId":"<opaque-id>","path":"libraries/<uuid>"}}
```

The server freshly authorizes account/app/connection and validates a supported resource inside that app’s §9 namespace. Reject URLs, absolute paths, traversal, backslashes, empty segments, percent/double encoding and excess path limits. The app repeats validation and checks registry membership/file format. A previously listed item is not authorization.

Bind `open` to the short-lived launch and deliver it over the welcome channel. The iframe URL carries only the opaque launch ID, never paths or credentials.

Hikari accepts main’s `library` or a validated `libraries/<uuid>` root, not raw parts. Missing/deleted resources show “No longer available” with Back to Drive/choose another. Unavailable connections offer reconnect/choose connection. **Explicit failed opens must not create an empty library, recreate a head, overwrite, copy or silently fall back to another provider.**

An explicit resource connection is session-scoped; it does not change the saved preference. Without `open`, use the app’s preferred verified connection. Today selection is account-wide: per-app preferences and other-connection targeting depend on delivering the agreed v1.3 support.

## 3. Switch transaction

Recommend **same tab on desktop and phone**. A separate desktop “Open in new tab” action can follow later.

1. Preflight target availability/permissions; obtain held ready receipt.
2. Mint a fresh server-authorized target launch, including validated `open` if supplied.
3. On failure/expiry, cancel leave and retain the old app. No partial preference changes.
4. On success, close the old port, cancel safe residual reads, destroy its browsing context and attach the target. Never reuse IDs/ports or accept a delayed launch after Stay/logout/another switch.

Target load failure offers retry/return, not resurrection of an old port. Returning uses another fresh launch and saved library selection.

## 4. What Drive reads

The **website** performs bounded existing `list`/`stat`/`read` operations per authorized app namespace. One iframe never gains another app’s access. No arbitrary storage crawl, removal, migration or Save a Copy operation is introduced.

| App | Logical listing and open target |
| --- | --- |
| Hikari | Validated `libraries.json` names; existing main at `library/`; derived named UUID roots, never registry-supplied paths |
| Irodori | App-agreed project/image adapter and supported open resource |
| Fumi | App-agreed document adapter and supported open resource |
| Tsuzuri | App-agreed PDF/project adapter and supported open resource |

Agree safe roots, names, metadata and formats before each app integrates; the last three rows are proposed, not delivered schemas. Do not parse binary catalogs or invent counts. Paginate results and recheck on open. Corrupt/unavailable listings are errors, not healthy empty drives.

Hide internal heads, manifests, generations/chunks, upload journals, leases, locks and implementation indexes using app-specific allowlists. Show meaningful names/app/connection and reliable metadata. Hidden libraries stay hidden by default. An absent Hikari registry may fall back to an existing main head; an invalid registry must not be replaced.

Start with the currently selected verified connection. “All connected storage” requires agreed enumeration/targeted reads; do not repeatedly change the active provider to list files.

## 5. Acceptance

- Upload/unsaved edit during switching: busy reason, Wait completes safely, Stay preserves interaction; no interrupted save.
- Timeout/no reply, stale/expired ready, edits attempted after ready and delayed launches: no silent discard or unintended teardown.
- Genuine conflict/offline work blocks switching; revocation still tears down immediately.
- Deleted file, missing head, disconnected/read-only connection, corrupt registry and forged cross-app/traversal paths: clear refusal, no creation/overwrite/fallback.
- Phone same-tab switch, accessible keyboard/menu operation, and return to the first app: saved work/library selection intact.
- Fresh authorization, permission/account changes during switching and provider namespace isolation.

**Claude review requested:** held-ready/cancel semantics, message shape, explicit-open connection targeting and per-app resource adapters. No implementation until agreed; Hikari acceptance remains first.
