# WebDAV save-version compatibility

The live kDrive setup reached “WebDAV connection saved for your current account”: the website's basic PROPFIND/temporary PUT/DELETE and encrypted connection save completed. The later Kōbō probe reported that PUT did not expose a usable strong ETag. No authenticated provider response headers were inspected directly in this environment.

The relay supports:

- Quoted strong ETags, with conservative normalization of unquoted opaque tags in DAV properties and HTTP headers. Weak validators stay weak.
- When PUT returns a strong ETag, return that saved version normally.
- When PUT returns no usable strong ETag, GET the resource, require a strong validator attached to that same response, and compare its bounded bytes exactly with the uploaded bytes. Return the GET validator only on an exact match.
- A different/missing resource is a conflict. Missing or weak GET validators still refuse sync. A metadata-only PROPFIND cannot confirm a write because it could return another writer's version.
- If another writer changes the file after the confirming GET, the next conditional write uses the older returned ETag and fails normally.

The full verification probe still requires create-only writes, matching-version replacement, refusal of stale writes and stale conditional deletion, metadata/listing, read-back, and cleanup. There is no unconditional-overwrite fallback. Message formats, credentials and environment settings are unchanged.

Tests cover empty/1 MiB files without PUT tags, HTTP/DAV normalization, successful verification persistence, changed/deleted files between PUT and GET, weak/missing read validators and servers that ignore preconditions. API tests use actual Netlify Blobs SDK/emulator with mocked Identity and a simulated DAV transport; live kDrive verification must still be repeated after deployment.

After the Explore deployment is Published, keep the existing saved connection and click **Test Kōbō sync connection** again. There is no need to resave credentials or upload a new Hikari app package for this relay change.
