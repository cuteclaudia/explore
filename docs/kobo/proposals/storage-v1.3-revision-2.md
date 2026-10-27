# Kōbō storage contract: proposal for v1.3 (multiple storage connections and multiple libraries)

Status: **proposal from the app side (Hikari), for review by the website side (revision 2: adds §5, multiple libraries).** Nothing here is
implemented. v1.2.1 stays in force until both sides agree. Bridge messages, the handshake and the
1 MiB limits are unchanged; this only adds to the status and adds two operations.

## Goal (from Claudia)

- A user can have several saved storage connections (WebDAV such as kDrive, Google Drive, later
  OneDrive).
- Inside an app they can choose which one that app uses, and the choice is remembered **per app**.
- They can **explicitly** save a copy of a library to another connection.
- Switching keeps every connection's settings, and libraries stay isolated per account **and**
  connection.
- Not in this version: automatic copying, or syncing to two providers at once.

## 1. Status: every connection, and the app's chosen one

`KoboStatus` keeps all its v1.2.1 fields. They continue to describe the **app's chosen
connection**, so v1.2.1 apps keep working unchanged. Two fields are added:

```ts
interface KoboStatus {
  // … all v1.2.1 fields, describing the chosen connection (connectionId "" when none is chosen) …
  provider: "webdav" | "google-drive" | "onedrive";   // extended (was "webdav" only)
  connections: KoboConnection[];   // NEW: every connection this app is permitted to use, chosen one included
  contractVersion: "1.3";          // NEW: lets an app tell a 1.3 shell from a 1.2.1 one
}

interface KoboConnection {
  connectionId: string;   // same meaning as today: changes when provider, account or folder changes
  provider: "webdav" | "google-drive" | "onedrive";
  label: string;          // "Infomaniak kDrive", "Google Drive (claudia@…)": display only
  root: string;           // display only
  available: boolean;
  reason: "ok" | "provider-unavailable" | "app-not-permitted";
  readOnly: boolean;
  maxPutBytes: number;
  maxGetBytes: number;
}
```

- The list holds **no secrets** (no tokens or passwords), only what the app needs to show a choice.
- `available` / `reason` for the chosen connection mean exactly what they mean today.

## 2. New operation: `selectConnection`

```ts
selectConnection(app: string, connectionId: string): Promise<KoboStatus>;
```

- The website records `connectionId` as this user's **preferred connection for this app**, on the
  server, so the choice follows the user to other devices. It then returns the new status and also
  sends the usual `change` message.
- `connectionId` must be one of `status.connections`; otherwise `forbidden`.
- An app calls this only when the user picks a connection in the app (never by itself).
- From then on every ordinary operation (`read`, `put`, `stat`, `list`, `remove`) goes to the newly
  chosen connection, exactly as today.
- For the app, a switch is the existing **connection change** (§9). It opens that connection's own
  local library (`userKey` + `connectionId`), and nothing is copied or uploaded automatically.
  Hikari reloads its library for the new connection (the page is relaunched, as for sign-in changes).

## 3. Explicit copy to another connection: a `connectionId` on operations

To "save a copy to Google Drive" while using kDrive, the app writes a library to a connection that
is not the chosen one:

```ts
// optional on read, put, stat, list (not on remove: a copy never deletes anything)
{ connectionId?: string }
```

- This is accepted only for a connection in `status.connections` with `available: true` and
  `readOnly: false`; otherwise `forbidden`.
- `put` with a `connectionId` other than the chosen one must use `ifNoneMatch: "*"`. A copy only
  ever **creates** files at the destination and never replaces or deletes them; otherwise `invalid`.
- The app shows a confirmation first ("Save a copy of this library to Google Drive?"). If the
  destination already has a library, it stops and says so. It never merges and never overwrites.
- After the copy, the app keeps syncing to the chosen connection only (no dual sync). The user can
  then switch to the copy with `selectConnection` if they want.

## 4. Google Drive and OneDrive: the conditions the sync relies on

The library format (§7) is safe only because of **conditional writes**:

- `ifNoneMatch: "*"` must be an atomic create-only. Google Drive allows two files with the same
  name in a folder, so a plain create is **not** create-only.
- `ifMatch` on `head.json` must be an atomic compare-and-swap. The Drive v3 API has no `If-Match`
  on updates.

So a provider is offered as read-write only when the website guarantees both, for example:

- **Option A (suggested): the website keeps the commit point itself.** `head.json`'s content and
  ETag live in a store the website controls and that supports compare-and-swap. Netlify Blobs
  writes with `onlyIfMatch` / `onlyIfNew` would do, keyed by `userKey` + `connectionId` + app. The
  immutable parts (`library/gen/<uuid>/<n>`) go to the provider. Their names are unique UUIDs, so
  create-only can be enforced with a per-path lookup under a lock in that same store.
- **Option B:** serialise all writes for one `userKey` + `connectionId` + app through a single
  lock in the website's own store, and check the provider before each create or replace.

Without one of these, the connection must be `readOnly: true` (copies **from** it work; sync and
copies **to** it don't), as §4 already requires for providers without strong ETags. The app can
also detect which guarantee it got through `contractVersion` and `readOnly`. The library format
itself does not change.

Large photo originals (multipart, §8) work the same on every provider, because they use the same
create-only parts plus a manifest.

## 5. Multiple libraries per app

Claudia wants to create, name, open and switch between several libraries in one app, with the
active library and its storage provider always shown. Today each app's storage holds exactly one
library at `library/` (§7).

**This needs no bridge change.** It is only an agreed folder layout inside the app's root, using
the existing operations and conditions. We'd like your agreement because it changes what lives in
the user's storage folder.

```
<app root>/                         e.g. /Kobo/Hikari
  libraries.json                    the list of libraries (new; optional)
  library/                          the existing library, unchanged ("main")
    head.json, gen/<uuid>/<n>
  libraries/<library uuid>/         each further library, same format as library/
    head.json, gen/<uuid>/<n>
  originals/…                       photo originals, SHARED by all of this app's libraries (§8, stage 3)
```

```json
{ "format": "kobo-libraries", "version": 1,
  "libraries": [
    { "id": "main", "name": "Library", "path": "library", "created": "2026-10-27T01:00:00Z" },
    { "id": "6f1c…", "name": "Travel 2026", "path": "libraries/6f1c…", "created": "…" } ] }
```

- **Existing libraries carry over untouched.** No `libraries.json` means one library, `main`, at
  `library/`. Nothing is moved or re-uploaded, and v1.2.1 apps keep working with `main`.
- **`libraries.json` is updated only with compare-and-swap**: `ifMatch` with its ETag, or
  `ifNoneMatch: "*"` for the first write. Two devices creating libraries at once can't lose one.
  The loser re-reads and retries.
- **Creating** writes the new library's first `head.json` (create-only), then adds it to the list.
  **Renaming** changes only the list. **Removing** in this version only hides the library from the
  list and deletes nothing, consistent with cleanup being disabled.
- Library ids are UUIDs and names are display-only (any text, ≤ 100 characters), so names never
  become paths.
- **Isolation:** the browser keeps each library in its own namespace,
  `userKey` + `connectionId` + library id. Switching saves pending work and commits it before
  opening the other library.
- **Active library:** remembered per device, for each account, connection and app. Should it
  instead follow the user across devices, like the preferred connection in §2? That's question 5
  below.
- **Originals are shared per app root, not per library.** A photo in two libraries is stored and
  uploaded once, by content hash. A library refers to originals; it doesn't own them.
- **UI:** the top bar always shows the active library and provider, e.g.
  "Travel 2026 · Google Drive". File ▸ Libraries… lists them, with New, Rename, Open and Hide.
- Accounts with no storage connection get the same, kept in the browser only.

## 6. What the app side will do once agreed

- **Settings ▸ Storage:** lists `status.connections` (provider, label, available or not), marks the
  chosen one, and offers "Use this one" (`selectConnection`). "Manage connections…" opens
  `/studio/storage` (`openSettings`, unchanged).
- **File ▸ Save a Copy to…:** runs the explicit copy in §3, with progress in the activity stack. It
  can be resumed, because the parts are content-addressed and create-only.
- Libraries stay isolated by `userKey` + `connectionId`, as v1.2.1 §9 already requires.
- Cleanup stays disabled, and nothing about publishing changes.

## Questions for the website side

1. Is a server-side preferred connection per user per app acceptable, or would you rather the app
   remember it locally?
2. For Google Drive, which of options A and B in §4 suits you (or something else that gives an
   atomic create-only and compare-and-swap)?
3. Folder layout on Google Drive: an app folder the user can see (`/Kobo/Hikari`, like WebDAV), or
   Drive's hidden `appDataFolder`? We suggest the visible folder, so people can see and download
   their own files.
4. Should a v1.2.1 app inside a 1.3 shell be shown only its chosen connection (it would ignore the
   rest anyway)? We assume yes.
5. Multiple libraries (§5): is the layout acceptable? Should the active library be per device (our
   suggestion, simplest) or remembered by the website across devices?
6. Your report that Google Drive sync succeeds: does it include atomic create-only
   (`ifNoneMatch: "*"`) and compare-and-swap (`ifMatch`) on the same path under concurrent
   writers? Hikari's library sync (and `libraries.json`) relies on both. Until then we'd treat
   Google Drive as `readOnly` for Hikari.

## Order of work on the app side

1. Photo-original sync (§8: multipart, resume, 200 MB integrity tests), with originals stored
   shared per app root as in §5. This is the agreed priority and needs no change from v1.2.1.
2. The multiple-libraries switcher (§5), once the layout is agreed.
3. Multiple connections (§1–§4), once agreed.
