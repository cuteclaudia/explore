# Kōbō shell handoff to Claude — 26 October 2026

The website side implements an **experimental** v1.2 transport. It does not advertise completed acceptance or enable normal users by default. The Hikari 0.14.1 web ZIP starts correctly in Chromium but has no bridge loaded. Your separately supplied `kobo-bridge-for-chatgpt.zip` now passes the website shell browser test, including its actual `kobo-bridge.js` and `kobo-sync.js`. The app build still needs to wire these into its real library and finish photo sync.

## Addresses

- Allowed shell origin: `https://explorebyclaudia.netlify.app`.
- Selected app test origin: `https://cuteclaudia-hikari-test.netlify.app`.
- **The app hostname is proposed, not provisioned.** Claudia must create this separate static Netlify site first. If unavailable, use the actual assigned hostname in both the site's `KOBO_HIKARI_ORIGIN` and this handoff. Each later app gets its own origin.
- Owner launch page: `/studio/kobo-test` on the shell. Existing `/apps/hikari` continues to use the old workspace until joint acceptance.
- No DNS, Squarespace or custom-domain changes are required.

## Exact bridge wire format

The shell creates the iframe and adds `#kobo-launch=<UUID>` to its root URL. The child must send to its configured shell origin, never `"*"`:

```js
parent.postMessage({type:'kobo-hello',launchId,app:'hikari',bridgeVersion:1},shellOrigin);
```

The child accepts welcome only from `event.source === parent`, the configured `event.origin`, with matching launchId/app/version, and exactly one transferred port:

```js
{type:'kobo-welcome',launchId,app:'hikari',bridgeVersion:1}
// event.ports[0] is the MessagePort; use port.start().
```

The shell accepts the handshake once, checks frame/source/origin/launch/app/version, and attaches the app identity itself. The launch expires after one hour: reopen the app for a new launch. Never store the launch UUID as an account credential.

The shell now matches your **BRIDGE-MESSAGES.md** exactly: numeric IDs (positive safe integers), named args, `dir` on list, progress/change/close packet types, and no app argument on openSettings.

```js
{id:1,op:'status',args:{app:'hikari'}}
{id:2,op:'read',args:{app:'hikari',path:'library/head.json',ifMatch:'"etag"'}}
{id:3,op:'put',args:{app:'hikari',path:'library/head.json',data:arrayBuffer,ifNoneMatch:'*'}}
{id:4,op:'stat',args:{app:'hikari',path:'library/head.json'}}
{id:5,op:'list',args:{app:'hikari',dir:'library'}}
{id:6,op:'remove',args:{app:'hikari',path:'temporary/file',ifMatch:'"etag"'}}
{id:7,op:'openSettings',args:{}}
{id:8,op:'cancel',target:3} // no cancel acknowledgment; original request rejects
```

Up to four operations may run together; exceeding this returns retryable rate-limited. Read status before file operations. onChange is a local adapter subscription. Replies are the shapes in your message document, including:

```js
{id:2,ok:true,result:{data:arrayBuffer,etag:'"etag"'}} // or null for missing file
{type:'progress',id:3,sent:123,total:456}
{id:3,ok:true,result:{etag:'"new-etag"'}}
{id:3,ok:false,error:{code:'conflict',message:'…',retryable:false}}
{type:'change',status:status}
{type:'close',reason:'signed-out'}
```

Your client correctly copies the caller's Uint8Array before transferring it; the browser test verifies the original is not detached. AbortSignal and progress callbacks stay in the app adapter. A cancelled/timed-out write may already have reached WebDAV: reconcile before retrying, never promise that cancellation undoes a remote write.

Connection changes close the launch, and the shell clears the iframe to hide the old library. Reopen and ask how to handle the new destination before copying anything. openSettings opens /studio/storage in a new shell tab; the shell also provides a normal settings link if popup blocking prevents it.

The shell remembers the user/connection from status, and the server independently checks each call against its stored launch, fresh Identity permissions and the user's encrypted connection. The app receives no HTTP session or WebDAV credentials.

`openSettings` opens `/studio/storage` in a new shell tab. Browser popup blocking can prevent a new tab after an asynchronous bridge message; the shell also provides a normal settings link outside the frame.

## Bounds and paths

Both raw-operation caps are 1,048,576 bytes; empty files are valid. Payloads above the cap fail before WebDAV. Literal percent signs are conservatively forbidden in paths, preventing encoded/double-encoded traversal. Relative paths have at most 32 segments, 255 characters per segment and 1,600 total characters. Only list with `path:''` addresses the root. DELETE never accepts a folder.

The base folder is relative to the connection URL. Default `Kobo` + `Hikari` means `<connection URL>/Kobo/Hikari/`. A URL already ending in `/Kobo/` should use an empty base-folder field. Stable legacy permission/file IDs remain mapped internally; the new WebDAV tree does not move older saved revisions.

## Two small contract clarifications

1. The **first** `library/head.json` is created with `ifNoneMatch:'*'`; subsequent commits use the read ETag with ifMatch.
2. Leave automatic garbage collection **disabled for the first integrated release**. §8 says manifest first then parts; §8a later says parts first, then manifest/folder, conflicting with the rule that remove cannot delete folders. Also, read-head/recheck/delete is not a cross-device lock: another device can commit a reference after the recheck. Agree a coordination/tombstone strategy before enabling deletion. Retaining unreferenced files is safe. “Published multipart manifest” means a committed private manifest, never website publishing.

Please send the next full Hikari web archive with these scripts wired into the real library. The standalone client/sync package has now replaced the protocol stand-in in our browser test.

## Validation completed on the website side

- Real Netlify Blobs SDK/local emulator for account connections and server launch records; Identity is mocked in API tests.
- In-memory DAV transport for CRUD, conditional races, safe XML/path handling and provider verification. **This does not establish real kDrive support.**
- Real Chromium cross-origin MessageChannel with your unmodified client and sync scripts: binary transfer/progress, caller-buffer preservation, list dir, status subscription, browser-storage probe, segmented library commit/pull and hashes, simultaneous-save conflict, and session-close teardown. Auth/provider HTTP remain fixtures.
- Hikari 0.14.1 loads its actual WASM and reports an OPFS library in Chromium. This does not establish Safari/private-mode compatibility.
- Build/postbuild checks cover the packaged Netlify SSR function with require(ESM) disabled.

Still required together: deployed relay and Identity, actual stage-one app client, kDrive conditional operations and quotas, interrupted 200 MB uploads/hashes, conflict/recovery and the full browser-storage matrix. `KOBO_STORAGE_ENABLED` remains absent/false until shared acceptance; both configured owners can test meanwhile.

## App-side review notes for the next build

- `KoboLocal.detect()` uses a 120 MiB quota threshold to infer private mode. That is a heuristic, not reliable private-window detection; generous private-mode quotas can still be temporary. Use conservative wording for best-effort storage, and test the actual Safari/private-mode matrix before claiming session-only detection works.
- `KoboSync.pull()` currently indexes untrusted logical names in plain `{}` objects. Use Map or `Object.create(null)`, reject reserved/invalid/duplicate logical names, and validate safe integer sizes, summed sizes and an explicit library memory limit before allocation. The site limits each file; the app must also bound the complete logical library.
- The sync head adds `logical`, `file`, and ordered numeric segment names beyond the contract example. Document this concrete schema as the shared format and bound head.json itself to 1 MiB; compact before it exceeds the cap. No website file-format parser is needed.
- Received client SHA-256: `4b0019612aeec66ef75f9334373a0611c38ff72bcc228bdece30c48828c4f3c2`; sync SHA-256: `22e10009ecb79af55b06c5ede1161813ee9db29f4469170da1bcf580b7cf953c`. Test fixtures preserve those files unchanged.
