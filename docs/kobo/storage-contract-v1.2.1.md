# Kōbō storage contract, version 1.2.1

**For:** the claudiagilbert.com website (the "shell") and the Kōbō web apps (Hikari first, then Fumi,
Goban, Akari and Tsuzuri).
**Status:** agreed design, 26 October 2026. Version 1.0 was Claude's draft; ChatGPT reviewed it
(`kobo-storage-review.md`). 1.1 folded in that review and one hosting correction (§2). 1.2 adds
ChatGPT's three final changes: UUID generations (§7), safe cleanup with upload leases (§8a), and
browser-storage compatibility in the cross-origin iframe (§9a). 1.2.1 records the clarifications
from ChatGPT's website handoff without changing any message: the documented `head.json` schema
(§7a), cleanup disabled in the first integrated release (§8a), the deletion order, and the
website's path limits (§6).
Nothing here is implemented yet. Neither side advertises `KoboStorage.version: 1` until the
acceptance checks in §12 pass.

---

## 1. Principles

1. **The website owns the connection.** Sign-in (Netlify Identity), storage settings, encrypted
   credentials (per-user Netlify Blobs, AES-256-GCM, key in `FILE_STORAGE_ENCRYPTION_KEY`), the
   allowed-host list (`WEBDAV_ALLOWED_HOSTS`) and all WebDAV traffic, relayed by server functions.
2. **Each app owns its files.** The layout and formats inside its own folder.
3. **Apps are isolated.** An app can't reach the website's session or credentials, or any other
   app's storage. The server enforces this independently of anything an app sends.
4. **Local-first.** Apps keep working in the browser without storage. Storage is where work is
   saved and synced, and the user can always tell "Saved locally" from "Synced to storage".
5. **Saving is private.** Sync never publishes anything. Publishing stays a separate, explicit
   owner action in the website's existing workflow.

## 2. Hosting: each app on its own origin

**Correction to v1.0 and the review.** An iframe sandboxed **without** `allow-same-origin` gets an
opaque origin, which **cannot use IndexedDB or the Origin Private File System**, and the Kōbō apps
keep their local library there. So editors are served from **their own origin**, separate from the
website, and embedded with:

```html
<iframe src="https://hikari.apps.<site-host>/" title="Hikari"
        sandbox="allow-scripts allow-same-origin allow-downloads allow-popups allow-modals"
        allow="clipboard-read; clipboard-write; fullscreen"></iframe>
```

Here `allow-same-origin` lets the app use **its own** origin's storage. It gives no access to the
website's origin, cookies, session or DOM, and no access to another app, because each app has its
own origin (`hikari.…`, `fumi.…`, `goban.…`). This achieves the isolation the review asks for
without breaking storage.

- **Testing:** use Netlify-provided hostnames (a separate site, or branch subdomains) for the apps.
  The final hostnames are a hosting decision and don't change DNS or the existing Squarespace site.
- The website can still present canonical pages such as `/apps/hikari` that embed the app's origin.
- App origin headers: `Content-Security-Policy: frame-ancestors <website origin(s)>` (only the
  website may embed the app), `Cache-Control: no-cache`, `Content-Type: application/wasm` for
  `*.wasm`, and `script-src 'self' 'wasm-unsafe-eval'`. COOP/COEP isolation is not required.
- The app's release zip, `hikari-web-<version>.zip`, holds only static files.

## 3. The bridge (shell ↔ app)

Apps call `window.KoboStorage` **inside the app**. That object is an adapter shipped with each app
(the shared Kōbō bridge client). It never makes network requests to storage itself. It talks to the
shell over a `MessageChannel`.

**Handshake:**
1. The shell creates the iframe with a per-launch random `launchId` in the URL fragment
   (`#kobo-launch=<launchId>`), and records `{launchId, app, iframe.contentWindow}`.
2. When ready, the app posts `{type: "kobo-hello", launchId, app, bridgeVersion: 1}` to `window.parent`
   with `targetOrigin` = the **expected website origin** (configured in the app build; a list of
   allowed shell origins).
3. The shell accepts it only if `event.source === iframe.contentWindow`, the `launchId` matches,
   it hasn't been used before, the `app` matches what the shell launched, and `event.origin` is
   that app's registered origin. It then replies with `{type: "kobo-welcome"}` and transfers
   `port2` of a new `MessageChannel`. After this, all traffic goes over the port.
4. The app checks the welcome came from the expected website origin before using the port.

**Requests and responses** on the port:
`{id, op, args}` → `{id, ok: true, result}` | `{id, ok: false, error: {code, message, retryable, retryAfterMs?}}`.
Binary data travels as `ArrayBuffer` and is transferred, not copied. `op` is one of the methods in §4.
A `{id, op: "cancel", target: <id>}` message cancels an in-flight request (it then fails with
`cancelled`).

**Binding:** the shell attaches the launched `app` to every request itself. An `app` argument
from the app is accepted for API compatibility but **must equal** the launched app, otherwise
`forbidden`. The shell makes the authenticated calls to its functions. No session token or WebDAV
credential ever crosses into the app.

The shell closes the port, failing pending requests with `unauthorized`, on sign-out, on account
switch, or when the app's permission is revoked.

## 4. The `KoboStorage` interface (inside the app)

```ts
interface KoboStorage {
  version: 1;

  status(app: string): Promise<KoboStatus>;

  /** Bytes with the ETag of exactly those bytes. null = not found.
   *  With ifMatch: fails with "conflict" if the file's current ETag differs (nothing returned).
   *  data.byteLength ≤ maxGetBytes; a larger file fails with "too-large". */
  read(app: string, path: string, opts?: { ifMatch?: string; signal?: AbortSignal })
    : Promise<{ data: Uint8Array; etag: string } | null>;

  /** Create (ifNoneMatch: "*") or replace exactly one version (ifMatch: etag) or overwrite (neither).
   *  ifMatch and ifNoneMatch are mutually exclusive ("invalid" if both).
   *  data.byteLength ≤ maxPutBytes, else "too-large". Creates missing parent folders.
   *  Resolves only after the remote write succeeded, with the new ETag. */
  put(app: string, path: string, data: Uint8Array,
      opts?: { ifMatch?: string; ifNoneMatch?: "*"; signal?: AbortSignal;
               onProgress?: (sentBytes: number, totalBytes: number) => void }): Promise<{ etag: string }>;

  stat(app: string, path: string, opts?: { signal?: AbortSignal })
    : Promise<{ size: number; etag: string; modified: string } | null>;

  /** Direct children; [] if the folder doesn't exist. Only list("") addresses the app root. */
  list(app: string, dir: string, opts?: { signal?: AbortSignal })
    : Promise<Array<{ name: string; isDir: boolean; size: number; etag: string; modified: string }>>;

  /** Delete one file (never a folder, never recursive). Missing file = success.
   *  With ifMatch: "conflict" if it changed. */
  remove(app: string, path: string, opts?: { ifMatch?: string; signal?: AbortSignal }): Promise<void>;

  /** Synchronous: subscribe to status changes (sign-in/out, account switch, connection change,
   *  permission change). Returns an unsubscribe function. The only non-async member. */
  onChange(app: string, callback: (status: KoboStatus) => void): () => void;
}

interface KoboStatus {
  available: boolean;
  reason: "ok" | "signed-out" | "no-connection" | "app-not-permitted" | "provider-unavailable" | "bridge-unavailable";
  userKey: string;        // stable, opaque, non-secret per-user id (not an email), for local namespacing
  connectionId: string;   // non-secret id of the storage connection; changes when provider/account/folder changes
  provider: "webdav";
  label: string;          // for display, e.g. "Infomaniak kDrive"
  root: string;           // for display, e.g. "/Kobo/Hikari"
  readOnly: boolean;
  maxPutBytes: number;    // raw payload bytes per put; always a real bound (no 0 = unlimited)
  maxGetBytes: number;    // raw payload bytes per read
  quotaBytes?: number;    // optional, informational only
  usedBytes?: number;
  settingsUrl: "/studio/storage";  // the shell opens it; the app asks via the bridge ("openSettings")
}
```

An extra bridge op, `openSettings`, asks the shell to show `/studio/storage` in the website (the app
never navigates its own frame there).

**ETags** are opaque strings, compared exactly, quotes included. A provider without strong ETags and
working `If-Match` / `If-None-Match` on `PUT` and `DELETE` must report `readOnly: true` or
`available: false` with `reason: "provider-unavailable"`. It must never be presented as safe for
multi-device editing.

**Errors** (`KoboStorageError`): `unauthorized`, `forbidden`, `invalid`, `conflict`, `too-large`,
`quota`, `rate-limited` (with `retryAfterMs`), `offline`, `timeout`, `cancelled`, `server`.
`retryable` is true only for `offline`, `timeout`, `rate-limited` and transient `server` errors.
Apps retry those with exponential backoff and jitter, honouring `retryAfterMs`. They never loop on
`forbidden`, `conflict`, `quota`, `invalid` or `too-large`. "Not configured" is a normal `status`,
not an error, and real failures are never reported as "no connection".

## 5. Transfer limits

- `maxPutBytes` / `maxGetBytes` count **raw file bytes per operation** (not encoded HTTP bodies).
- **Initial advertised value: 1 MiB (1,048,576) for both**, matching the site's existing chunk size.
  Raise it only after deployed relay tests (encoding overhead, memory, execution time), not from
  nominal function limits.
- Zero-byte files are valid for `put` and `read`.
- Every file an app writes fits these limits, including mutable library files (§7). Large data
  uses the multipart format (§8).

## 6. Paths and roots

- App root = `<configured base folder>/<canonical app folder>/`. The default base is `/Kobo`, so
  Hikari's root is `/Kobo/Hikari/`. Canonical folder names are fixed configuration, never
  translated: `Hikari`, `Fumi`, `Goban`, `Akari`, `Tsuzuri`, …
- Path limits (the website enforces them): at most 32 segments, 255 characters per segment, 1,600
  characters in all, and **no literal `%`** (this rules out encoded or double-encoded traversal).
- Paths are relative, `/`-separated, with no leading `/` and none of: empty segments, `.` or `..`,
  backslashes, control or NUL characters, or percent-encoded traversal (`%2e`, `%2f`, `%5c`, in any
  case). The shell validates them, and the server validates them again before building a URL.
  Each segment is encoded once.
- The server checks every URL in a `PROPFIND` reply is on the configured host and inside the app
  root, and parses XML with external entities disabled.
- **`PROPFIND` replies often split properties across several `<propstat>` blocks** (found ones
  under `200`, missing ones under `404`, for example `getcontentlength` on a folder). Read the
  properties from **every** `200` block, never just the first. Otherwise a folder can look like a
  file, and a `DELETE` meant for one file removes a whole folder. (Found while testing against a
  real WebDAV server.)
- **ETags are normalised to their HTTP header form**, a quoted string (or `W/"…"`). Some servers
  return `getetag` without the quotes in `PROPFIND` but with them in `PUT`/`GET` headers, so
  without normalising, one version appears as two. `read`, `put`, `stat` and `list` all return
  the normalised form.
- **Legacy apps:** existing storage ids and permission keys (PhotoCraft, LightCraft, WordCraft,
  PdfCraft, …) map internally to the Kōbō names (Irodori, Hikari, Fumi, Tsuzuri, …). Saved
  revisions are not moved or orphaned.

## 7. Library saves: generations and a commit point (app side)

Mutable library state is written as **immutable generation files**, committed by conditionally
replacing one small head file:

```
library/head.json                          ← the only mutable file; replaced with ifMatch
library/gen/<uuid>/catalog.snap.<k>         ← snapshot, split into ≤ 1 MiB segments if needed
library/gen/<uuid>/log.<k>                  ← journal segment(s) of that save, each ≤ 1 MiB
library/gen/<uuid>/prefs.json, presets/…    ← small files written by that save
```

**Every save gets a new generation id: a random UUID (version 4, lower-case).** No two devices can
pick the same folder, so simultaneous saves can never write into each other's files. A generation
folder is written once and never changed. It holds only the files that save added. The head
lists every file the library consists of, across generations.

`head.json`:
```json
{ "format": "kobo-library", "version": 1,
  "generation": "3f6c2b9e-8a41-4d7e-9b0c-1f2e3d4c5b6a",
  "parent": "b7d1e0a2-55c3-4f19-8e6d-0a9b8c7d6e5f",
  "sequence": 42,
  "files": [ { "path": "gen/9a0e…/catalog.snap.0", "size": 734001, "sha256": "…" },
             { "path": "gen/1c4d…/log.0", "size": 51200, "sha256": "…" },
             { "path": "gen/3f6c…/log.0", "size": 2048, "sha256": "…" } ],
  "writer": "<device id>" }
```
- `generation` is the UUID of the save this head commits, and `parent` the UUID of the head it
  replaced (`null` for the first). `sequence` is the parent's sequence + 1, for display and
  diagnostics only. It never names a folder or decides a conflict.
- Readers accept only `gen/<uuid>/…` paths whose UUID is well-formed, and only files listed in the
  committed head.

- **Saving** works like this:
  1. Write the new segments (`ifNoneMatch: "*"`).
  2. Read them back with `stat` to confirm their sizes.
  3. Replace `head.json` with `ifMatch` = the ETag the device last read.

  Readers only trust files listed in the committed head, after verifying each one's size and
  SHA-256.
- **Appending edits:** a new generation holding a new log segment, plus a new head that adds it to
  `files`. When the log grows, a save writes a fresh snapshot (in its new generation) and a head
  listing only that snapshot. The older files then become unreferenced (§8a).
- **Conflict** on `head.json` (another device committed first): the app reads the new head, replays
  its own uncommitted edits on top where it can, and otherwise keeps both and tells the user.
  Device clocks and modification times never decide the winner.
- **Crash safety:** an interrupted save leaves only unreferenced generation files. The committed
  head is unchanged, so nothing is lost or replayed twice. Cleanup follows §8a.

## 7a. `head.json` schema (format `kobo-library`, version 1)

This is the shared format. The website never needs to parse it.

```json
{ "format": "kobo-library", "version": 1,
  "generation": "<uuid v4>", "parent": "<uuid v4> | null", "sequence": 42,
  "logical": [ { "file": "catalog.log", "size": 51200, "sha256": "<hex>" }, … ],
  "files":   [ { "file": "catalog.log", "path": "gen/<uuid>/0", "size": 51200, "sha256": "<hex>" }, … ],
  "writer": "<device id>", "written": "<ISO 8601>" }
```

- `logical` lists each library file once: its name and its whole size and hash.
  - Names match `^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$`.
  - They are unique, and never a JavaScript object key with a special meaning (`__proto__`,
    `constructor`, `prototype`, …).
- `files` lists the parts in order:
  - `file` names the logical file each part belongs to.
  - `path` is `gen/<uuid>/<n>`, where `<n>` is the save's part counter (up to 6 digits).
  - Each part is at most 1 MiB. A file's parts add up exactly to its logical `size`.
- **Bounds:**
  - `head.json` itself is at most 1,000,000 bytes.
  - At most 512 logical files and 6,000 parts.
  - The whole library is at most 256 MiB, checked before anything is allocated.
- **Compaction:** a file whose part count exceeds its minimum by more than 32 (many small
  appended tails) is uploaded whole again in the next save, which keeps `head.json` small.
- The **first** `head.json` is created with `ifNoneMatch: "*"`. Every later save uses `ifMatch`
  with the ETag last read or written.

## 8. Large files: multipart format (app side)

Photo originals larger than one part are stored as:

```
originals/<sha256 of whole file>.parts/u-<upload id>/0000, 0001, …   ← parts of one upload attempt
originals/<sha256>.parts/manifest.json                               ← created last, ifNoneMatch "*"
```

- **Fixed part size: 1 MiB (format version 1)**, regardless of the advertised limits. Every device
  agrees on part boundaries. The format requires `maxPutBytes ≥ 1 MiB` and `maxGetBytes ≥ 1 MiB`;
  below that, the app reports large-file sync as unavailable.
- Files of 1 MiB or less are stored whole at `originals/<sha256>`.
- `manifest.json`:
  ```json
  { "format": "kobo-multipart", "version": 1, "hash": "sha256",
    "size": 52428800, "sha256": "<whole-file hash>", "partSize": 1048576,
    "upload": "u-7f3c…",
    "parts": [ { "name": "0000", "size": 1048576, "sha256": "…" }, … ] }
  ```
  Readers validate the format, version, part names (`^\d{4,6}$`), count and sizes (sum = `size`),
  and limits before fetching or allocating. They verify each part's hash and the whole-file hash.
- **Uploading:**
  1. Each attempt writes into its own `u-<random>` folder.
  2. Parts are written with `ifNoneMatch: "*"`. A `conflict` on a part means that part is already
     there: read it back and compare its hash before treating it as done.
  3. When every part is verified, create `manifest.json` with `ifNoneMatch: "*"`. If another
     device's manifest already exists, check its whole-file hash matches and use that one, then
     drop the local attempt.
- **Resuming:** an interrupted upload resumes in the same `u-` folder from the first missing or
  mismatched part. Each upload folder holds a lease (§8a) while it's active.
- **Deleting:** first remove the reference (commit a library head without it), then the
  manifest, then the parts. Folders are never deleted, because `remove` only deletes files, and
  empty folders are left in place, which is harmless.
- **Connection change:** large files are never copied automatically to a new destination (§9).

## 8a. Safe cleanup (app side)

**Disabled in the first integrated release.** Keeping unreferenced files is always safe. Reading
the head, re-checking and then deleting is **not** a cross-device lock: another device can commit
a reference after the re-check. Cleanup is enabled only after a coordination or tombstone
strategy is agreed. The rules below describe what it will protect.

**The rule:** after seven days, abandoned data becomes *eligible* for cleanup. Data that is
**protected** is never deleted, however old it is. Protected means any of:

1. listed in the **current committed** `library/head.json` (read immediately before cleaning);
2. part of a **committed multipart manifest** (a private storage file; nothing to do with website
   publishing): `originals/<sha>.parts/manifest.json` and its
   upload folder, or a whole-file `originals/<sha>`. These are deleted only after no committed
   head references the photo, and then manifest first and parts after;
3. inside an **active upload**, meaning an upload folder whose lease is live.

**Upload leases.** Every upload attempt folder `originals/<sha>.parts/u-<id>/` starts with a
`lease.json` (`{"device": "<device id>", "started": "<ISO time>", "seconds": 900}`), written with
`ifNoneMatch: "*"`. While the upload runs, the uploader rewrites it with `ifMatch` at least every
5 minutes. A lease is **live** while its file's **server-reported** `modified` time (from
`stat`/`list`, not a device clock) is less than `seconds` + 7 days old. Once the manifest is
published, the upload folder is protected by rule 2 and its lease can be removed.

**Eligible for cleanup**, judged by server-reported `modified` times only:
- a `gen/<uuid>/` folder not listed by the current committed head, all of whose files are more
  than 7 days old;
- a `u-<id>/` folder whose manifest was never published, whose lease is not live (or missing), and
  whose newest file is more than 7 days old;
- a whole `originals/<sha>…` that no committed head references, more than 7 days after it stopped
  being referenced.

**How cleanup runs:**
1. Read the committed head and list the candidates.
2. Re-check each candidate's protection immediately before deleting it.
3. Delete files one at a time with `remove(ifMatch)` and never recursively. For a photo, delete
   the manifest first and its parts after. For an abandoned upload, delete the parts, then the
   lease. Folders stay.

Cleanup runs at most daily per device and stops at once on sign-out, a connection change or any
error. An app may skip cleanup entirely; that is always safe.

## 9. Local data, accounts and connections (app side)

- **Local caches** are namespaced by `userKey`, app, and `connectionId`. This covers browser
  storage (IndexedDB and OPFS), pending uploads and app preferences. A guest (signed-out) library
  has its own namespace.
- **Sign-out or account switch:** the app stops in-flight work and retries, drops the bridge port,
  and hides the departing user's library. Another user never sees it and never uploads it.
- **Guest work** is imported into an account only after the user explicitly agrees.
- **Connection change** (`connectionId` differs): nothing is uploaded automatically. The app offers
  "Use the library already at the new destination", "Copy this library there", or "Keep them
  separate".
- **Shared devices:** "Remove this device's copy" is available in the app, and the website can
  require it on sign-out (site policy).

## 9a. Browser storage in the cross-origin iframe (app side)

Inside the website, each app's origin is a **third-party** iframe, so browsers may partition,
limit, or (in private browsing) disable its storage. Partitioning keys the app's storage to the
website as top-level site. That's the intended behaviour, but it means the same app opened
directly at its own address sees a **different** local library. Apps say so ("This library
belongs to Hikari on claudiagilbert.com") rather than presenting it as missing data.

**Detection at every start** (before showing any library):
1. Try OPFS: create, write, read back and delete a probe file under the app's namespace (§9).
2. Otherwise try IndexedDB: open a probe database, write, read back and delete.
3. Ask `navigator.storage.persist()` where available, and record whether it was granted
   (`navigator.storage.persisted()`).
4. Classify as **persistent** (storage works and persistence was granted), **best-effort** (works,
   but the browser may evict it), **session-only** (works but is known to be wiped when the tab
   or private window closes, as in private browsing), or **unavailable** (both probes failed).

**Behaviour per class:**

| Class | Local library | What the app says |
|---|---|---|
| persistent | normal | "Saved locally" |
| best-effort | normal, nudges a backup or sync | "Saved in this browser (it may clear it when space runs low)" |
| session-only | in memory and the session store only | "Private window: your work is kept only until you close it. Sync to storage or download a backup." |
| unavailable | in memory only | "This browser won't let Hikari keep files here. Your work is **not saved**: sync to storage or download a backup before closing." |

In **session-only** and **unavailable** the app never shows "Saved" or "Saved locally" for local
state. It shows "Synced to storage" only after a successful remote commit (§7). If storage
disappears mid-session (eviction, quota), the app switches class, says so once, and keeps edits in
memory until they are synced or downloaded.

**Compatibility matrix** (run with the app embedded by the website, cross-origin, with the §2 sandbox):

| Browser | Normal window | Private window |
|---|---|---|
| Chrome / Edge (Windows, macOS, Android) | OPFS and IndexedDB | IndexedDB / OPFS, wiped on close |
| Firefox (Windows, macOS, Linux) | OPFS and IndexedDB | expect session-only or unavailable |
| Safari (macOS, iOS, iPadOS) | OPFS and IndexedDB, partitioned, may be evicted by ITP | expect session-only or unavailable |

The expected results are hypotheses to test, not guarantees. The test records the actual class,
probe results, `persist()` outcome and what the user saw, per browser, version and mode.

## 10. Sync behaviour and status (app side)

- Start-up: `status`, then `read("library/head.json")`. Download what the committed head lists.
  Fetch originals on demand.
- While working, the app commits a new generation a few seconds after the last change.
- The UI shows **Saved locally**, **Syncing…** (with bytes transferred), **Synced to storage**,
  **Not synced: <reason>** (offline, signed out, storage full, conflict needs attention).
- Every request has a timeout and can be cancelled. Retries follow §4.

## 11. Website-side security (summary)

- Netlify Identity session, verified server-side. The existing write-origin and CSRF protections
  stay.
- Every function call checks: signed-in user, app permission for that user, the path inside that
  app's root, and the connection belongs to that user.
- Custom WebDAV hosts must be on the allowed list. The server enforces HTTPS with certificate
  validation, resolves DNS to public addresses only (and pins that address for the request), and
  refuses redirects. The relay is never an internal-network proxy.
- Provider presets fill editable fields. They don't assume an eligible plan. Infomaniak kDrive is
  the first provider to verify:
  - server `https://<kDrive ID>.connect.kdrive.infomaniak.com`
  - username = Infomaniak login email
  - password = application password (with two-step sign-in)
  - WebDAV is not available on kSuite Free / Standard

  Conditional `PUT`/`DELETE`, `MKCOL`, `PROPFIND`, ETag behaviour, quota errors and throttling are
  verified on a real account before kDrive is advertised.

## 12. Acceptance checks (before either side advertises version 1)

1. Round trip: `put` / `stat` / `read` / `list` / `remove` on 0-byte and 1 KB files. `read` returns
   the ETag of the returned bytes.
2. A direct `put` larger than `maxPutBytes` fails with `too-large`.
3. A **200 MB logical original** is saved as 1 MiB parts and a manifest, reopened, reassembled and
   checked against its SHA-256. An upload interrupted halfway resumes. Corrupt, missing and
   mis-sized parts, and a manifest of a different part size, are detected.
4. Parallel conditional writes: one winner, one `conflict`. `ifMatch` + `ifNoneMatch` together →
   `invalid`. Interrupting a library save at each step loses no committed edit and replays none
   twice.
5. Two accounts can't read, list, overwrite or delete each other's data, including after switching
   accounts in the same browser. Local caches don't leak across `userKey`.
6. One app can't act as another: a mismatched `app` → `forbidden`. Revoked permission blocks new
   operations and closes the port.
7. Expired sessions stop retries. A connection change copies nothing without confirmation.
8. Encoded traversal, hostile `PROPFIND` URLs or XML, redirects and private-network targets are
   rejected.
9. Offline → `offline` (not a hang), timeouts → `timeout`, throttling → `rate-limited` with
   `retryAfterMs`.
10. The deployed relay's real request and response limits are measured, and the advertised limits
    stay below them.
11. The app iframe can use its own browser storage, can't read the website's, and won't load when
    embedded by any other site.
12. **Concurrent saves:** two devices save at the same moment. Their generations land in different
    UUID folders, exactly one head commit wins, the other device gets `conflict`, rebases, and
    commits as a child of the winner. No file is overwritten.
13. **Cleanup safety:** with clocks skewed on the devices, cleanup never removes a file listed by
    the committed head, a published manifest or its parts, or a folder with a live lease. An
    abandoned upload and an unreferenced generation older than 7 days (by server time) are removed.
    A resumed upload after 6 days keeps its parts.
14. **Browser storage matrix (§9a):** every cell is run in the cross-origin iframe. Detection
    classifies correctly, "Saved" never appears when the class is session-only or unavailable,
    and work can always be synced or downloaded before closing.

## 13. Who builds what

| Website (ChatGPT) | Kōbō apps (Claude) |
|---|---|
| App origins and embedding (§2), shell side of the bridge (§3) | Bridge client and `KoboStorage` adapter shipped in each app |
| Functions: `status`, `read` (bytes + ETag), `put`, `stat`, `list`, `remove`, conditions, limits | Library generations and `head.json` (§7) |
| Permission, path, XML, SSRF checks; legacy id mapping (§6, §11) | Multipart originals, resume and cleanup (§8) |
| `userKey`, `connectionId`, `reason`, `retryAfterMs`, `/studio/storage` | Account- and connection-scoped local caches, sign-out handling (§9) |
| kDrive verification on a real account | Sync status UI and retries (§10) |
| — | Upload leases and safe cleanup (§8a); browser-storage detection and fallback (§9a) |
| Run the §9a matrix with the app team | Publishing untouched: sync never publishes |

## 14. Order of work

1. Agree the app hostnames for testing (§2).
2. Website: bridge shell and the `status` / `read` / `put` / `stat` / `list` / `remove` functions,
   with a test page that runs checks 1, 2, 4, 6 and 8–10.
3. Hikari: bridge client, library generations, multipart originals, then checks 3, 5, 7 and
   11–14 end to end on kDrive.
4. Only then: both sides advertise version 1, and the next Kōbō app adopts the same contract.
