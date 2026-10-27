# Kōbō storage contract v1.3 — frozen specification

**Status: agreed and frozen, 27 October 2026**, based on Claude’s revision 4 and the website-side review.

**Implementation status:** the website still implements v1.2.1. Freezing this specification does not enable new operations. Advertise `contractVersion: "1.3"` only after the complete v1.3 operation set is implemented and checked. The §5 library switcher can be built with the existing v1.2.1 operations, preserving `main`, its existing local namespace, and `library/`.

Revision 4 settles where an explicit copy writes (§3), and corrects the operation count and the index-backup wording. Revision 3 added the website review of 27 October 2026, covering the answers to questions 1–6 and the clarifications on read-only sources, safe copy and resume, registry validation and recovery, switch ordering, and fresh authorization.

**v1.2.1 stays the implemented website contract** until the v1.3 implementation is completed and verified. The bridge messages, the handshake and the 1 MiB limits are unchanged. This version only adds status fields, **one** new named operation (`selectConnection`), an optional target on existing operations, and one folder layout. Cleanup stays disabled, and nothing here touches public publishing.

## Goal (from Claudia)

- A user can have several saved storage connections (WebDAV such as kDrive, Google Drive, later OneDrive).
- Inside an app they choose which one that app uses, and the choice is remembered **per app**.
- They can **explicitly** save a copy of a library to another connection.
- An app can hold **several libraries**: create, name, open, switch and hide them, with the active library and its provider always shown.
- Switching keeps every connection's settings, and libraries stay isolated by account **and** connection.
- Not in this version: automatic copying, or syncing to two providers at once.

## 1. Status: every connection, and the app's chosen one

`KoboStatus` keeps all its v1.2.1 fields. They continue to describe the **app's chosen connection**, so v1.2.1 apps keep working unchanged. Added fields:

```ts
interface KoboStatus {
  // … all v1.2.1 fields, describing the chosen connection (connectionId "" when none is chosen) …
  provider: "webdav" | "google-drive" | "onedrive";   // extended (was "webdav" only)
  connections: KoboConnection[];   // NEW: every connection this app is permitted to use, chosen one included
  contractVersion: "1.3";          // NEW: sent only once the complete v1.3 operation set is implemented
}

interface KoboConnection {
  connectionId: string;   // as today: changes when provider, account or folder changes
  provider: "webdav" | "google-drive" | "onedrive";
  label: string;          // "Infomaniak kDrive", "Google Drive (claudia@…)": display only
  root: string;           // display only
  available: boolean;
  reason: "ok" | "provider-unavailable" | "app-not-permitted";
  readOnly: boolean;      // true until the provider's conditional writes are verified (§4)
  maxPutBytes: number;
  maxGetBytes: number;
}
```

- The list holds **no secrets**: no tokens, passwords or other credentials.
- A provider is listed only when a real adapter for it exists. OneDrive isn't exposed as usable before then.
- Several accounts of the same provider are separate connection records, each with its own `connectionId`.
- **Old clients:** a v1.2.1 app inside a 1.3 shell sees its chosen connection exactly as today. It ignores the added fields.

## 2. New operation: `selectConnection`

```ts
selectConnection(app: string, connectionId: string): Promise<KoboStatus>;
```

- The website records `connectionId` as this user's **preferred connection for this app**, on the server, so the choice follows the user to other devices.
  - Until an app has an explicit preference, the current account-wide selection is its default.
  - Connecting, verifying or reconnecting a provider never silently changes any app's preference, and never copies a library.
- `connectionId` must be one of `status.connections`, available, permitted and **writable**: a sync destination can't be read-only. Otherwise the call fails with `forbidden`.
  - A stale `connectionId`, for example one belonging to a connection that has since been reconnected under a new id, is refused. It is never mapped to the new connection.
- The app calls this only when the user picks a connection in the app, never by itself.
- **Switch order** (it applies equally to switching libraries, §5):
  1. The app saves local changes and **settles pending sync**, so the library is committed and no uploads are in flight. If sync is offline or in conflict, the old namespace stays intact and the app offers a clear choice (wait, switch anyway keeping the unsynced changes in this browser, or cancel). It never drops edits.
  2. The app calls `selectConnection`. The website replies to that call first, then sends the `change` message.
  3. The app only reloads or relaunches after it has received the reply.
  4. The app opens that connection's own local library (`userKey` + `connectionId`). Nothing is copied or uploaded automatically.
  5. If the website relaunches the iframe (a later website follow-up, not part of this version), it does so only after re-checking the current account and app permission. It mints a fresh launch id after the reply has been delivered.
- **Sign-out** still closes private content immediately and never automatically reopens an app.

## 3. Explicit copy to another connection

To "save a copy to Google Drive" while using kDrive, the app reads from its chosen connection and writes to another one, using an optional target on operations:

```ts
// optional on read, stat, list and put; never on remove
{ connectionId?: string }
```

**Authorization:**
- The website checks ownership, app permission and availability on **every** operation.
- A supplied `connectionId` only selects a target; it is never a credential or proof of permission.
- Reads (`read`, `stat`, `list`) are allowed from an available connection even when it is `readOnly`, so a read-only source can be copied *from*.
- Writes (`put`) require `readOnly: false`.
- `remove` never takes another connection's id.

**Writes:**
- A `put` to a connection other than the chosen one must use `ifNoneMatch: "*"`; otherwise it fails with `invalid`.
- A copy only ever creates files at the destination, never replaces or deletes them.

**A safe, resumable copy:**
1. **Freeze the source.** The copy is of one committed source generation (its `head.json` content and ETag), read once at the start. Edits made during the copy belong to the source and aren't included.
2. **Stable identity and target.** The copy has its own UUID, so a resumed copy continues in the same place.
   - In v1.3, a copy always writes the destination connection's **main** library: `library/head.json`, with the copy's UUID as the new generation folder (`library/gen/<copy uuid>/…`).
   - A copy **never modifies a destination `libraries.json`**. Copying into a new named library at a destination that's already in use needs a separately agreed registration and authorization flow. That's not part of v1.3.
3. **Originals first.** Every original the source library lists is copied before anything else: whole files and multipart parts, then manifests. Each part is verified by size and hash against the source.
   - On resume, an existing destination part is read and verified. It is skipped only on an exact match.
   - A differing existing part, or a differing existing manifest, **stops the copy**. Nothing is merged or overwritten.
   - An original already published at the destination is reused only after it verifies part by part.
4. **Library files**, then the destination `library/head.json`, **last** and create-only.
   - If a destination main head already exists and it is **not this copy's** generation, the copy stops and says so. Nothing there is merged or overwritten.
   - If the head exists and **is** this copy's own generation (a retry after the reply to the final write was lost), the app verifies that generation's content against the frozen source and reports the copy complete, without rewriting anything.
   - A pre-flight "destination is empty" check alone isn't relied on: the create-only head is the real guard.
5. A copy that stops early is never labelled complete. It can be resumed or abandoned, and what it already wrote is harmless and unreferenced. A library copy is "complete" only once its originals are there, not just its catalog references.

After a copy, the app keeps syncing to the chosen connection only (no dual sync). The user can then switch to the copy with `selectConnection`.

## 4. Providers: the conditions sync relies on

Hikari's library format (§7) and the library list (§5) are safe only because of **atomic conditional writes**:

- `ifNoneMatch: "*"` must be an atomic create-only.
- `ifMatch` must be an atomic compare-and-swap.

Both apply to every path, including heads, manifests and `libraries.json`.

**Google Drive (agreed: Option A):**
- Drive holds immutable uploaded objects.
- Private Netlify Blobs records map `user + connection + app + logical path` to the current object, hash and logical ETag. They are published with `onlyIfNew` / `onlyIfMatch`.
- The `library/gen/…` tree is a **logical** layout in the website's adapter. Drive's own file names aren't unique, so no one relies on them.
- **Recovery requirement:** the private index must be backed up, because Drive alone isn't the full mapping. Automated index backup and restore is **not yet delivered** on the website side; this records the requirement, not a finished feature.

**Until conditional writes are proven, a provider is read-only.** A connection is advertised `readOnly: false` only once the website's raw competing-write check passes on the live backend: two conditional writes from the same starting revision, exactly one accepted, and a stale write refused. A failed recheck makes it read-only again. Hikari treats any `readOnly: true` connection as copy-*from*-only and never syncs to it.

Multipart originals (§8) work the same on every provider: create-only parts, then a create-only manifest.

## 5. Multiple libraries per app (agreed layout)

There's no bridge change here. It's an agreed layout inside the app root, using the existing operations and conditions.

```
<app root>/                         e.g. /Kobo/Hikari
  libraries.json                    the list of libraries (optional; absent = only "main")
  library/                          the existing library, unchanged: id "main"
    head.json, gen/<uuid>/<n>
  libraries/<library uuid>/         each further library, same format as library/
    head.json, gen/<uuid>/<n>
  originals/…                       photo originals (§8), shared by this app's libraries
                                    within one account + connection
```

```json
{ "format": "kobo-libraries", "version": 1,
  "libraries": [
    { "id": "main", "name": "Library", "created": "2026-10-27T01:00:00Z", "hidden": false },
    { "id": "6f1c2b9e-…-…", "name": "Travel 2026", "created": "2026-10-27T02:00:00Z", "hidden": false } ] }
```

**Validation** (readers check all of this before trusting the list):
- `libraries.json` is at most 256 KiB, with at most 256 entries.
- `id` is `main` or a full canonical lowercase UUID, and ids are unique.
- `name` is 1–100 Unicode code points, with no control characters. It's for display only and never becomes a path.
- `created` is an ISO-8601 UTC time within a sane range. `hidden` is a boolean.
- **Paths are derived from validated ids, never read from the file**: `main` → `library/`, otherwise `libraries/<id>/`. Any `path` field is ignored.
- Anything that doesn't validate is refused as a whole. The app falls back to `main` alone and says the list couldn't be read. It never rewrites the list from a refused copy.

**Updates** use compare-and-swap only:
- The first registry is written with `ifNoneMatch: "*"`, and always includes the implicit `main`, so creating the first extra library never hides the existing one.
- Later changes use `ifMatch` with the ETag that was read.
- A conflict means another device changed the list. The app re-reads it and **re-applies its own change** to the new version, with bounded retries (5, with back-off). If those run out, it reports the problem and never overwrites.

**Creating a library:**
1. Pick a new UUID.
2. Write that library's first `head.json` (create-only).
3. Add the entry to the list (CAS).

If step 3 fails after step 2, the library isn't lost. Its head exists and the app keeps a local note, so it registers the library when it can or offers to retry. A missing registry entry for an existing head is recoverable this way, and never cleaned up.

**Other operations:**
- **Rename** changes only the list.
- **Hide / unhide** flips `hidden`. The library keeps its id and files, and no original bytes are deleted. Hiding `main` is a display choice in this app, **not** a privacy boundary: older clients still open `main`.
- **No registry** means only the existing `main` library. The registry is never created by an automatic migration, only when the user first creates a second library.

**Local isolation:**
- Each library has its own browser namespace: `userKey` + `connectionId` + library id.
- The photo and thumbnail caches are per `userKey` + `connectionId` (shared by that account's libraries in that connection, like the stored originals). Hikari 0.14.6 already does this.

**Other rules:**
- **Active library:** remembered **per device, user, connection and app**, so one device never changes what another device has open.
- **Switching libraries** follows the switch order in §2: settle first, keep the old namespace on trouble, then open.
- **UI:** the top bar always shows the active library and provider, e.g. "Travel 2026 · Google Drive". A Libraries panel offers New, Rename, Open, Hide and Show hidden.
- Accounts with no storage connection get the same features, kept in the browser only.

## 6. What the app side will do once agreed

- **The library switcher (§5).** It needs nothing from the website beyond the existing v1.2.1 operations, so it can be built and tested now against the reference relay.
- **Settings ▸ Storage**, once the website implements §1–§2: lists `status.connections` and marks the chosen one, with "Use this one" (`selectConnection`, following the switch order) and "Manage connections…" (`openSettings`, unchanged).
- **File ▸ Save a Copy to…** (§3), once the website accepts `connectionId` on operations. Progress shows in the activity stack, and the copy is resumable.
- Cleanup stays disabled, and nothing about publishing changes.

## Agreed answers (website review, 27 October 2026)

1. **Preferred connection:** server-side, per user and app. The account-wide selection is the default until an app has its own (§2).
2. **Google Drive:** Option A, as implemented (§4). It stays read-only until the live raw competing-write check passes, and then the joint two-device acceptance still follows.
3. **Folder:** a visible app-created folder with the limited `drive.file` permission, as a logical layout (§4).
4. **Compatibility:** old clients use their selected connection and `library/`. `contractVersion: "1.3"` is sent only once the full v1.3 operation set exists.
5. **Multiple libraries:** layout agreed. The active library is per device, user, connection and app (§5).
6. **Concurrency evidence:** a live raw competing-write pass is required before Google writes are enabled (§4).

## Order of work on the app side

1. Done in 0.14.5 and 0.14.6: photo-original sync (§8 of v1.2.1) with resume and 200 MB integrity tests, per-account photo and thumbnail caches, and verify-and-repair when reusing a published original.
2. Next: the multiple-libraries switcher (§5), on v1.2.1 operations.
3. Then: multiple connections (§1–§3), once the website has implemented them.
