# Unified workspace and separate shop front doors

29 October 2026 (Sydney). Claudia approved a dedicated Kōbō workspace and separately branded HobbyNest shop, entered from Explore in new tabs. This is a website change; Claude continues to own the native apps.

## Delivered on current addresses

- `/kobo` remains the public app showcase; Open workspace opens `/apps` in a new tab with `rel=noopener`. Product pages use the same entry convention. Explore's signed-in My apps shortcut also opens a separate tab. Public Apps navigation stays a same-tab showcase link.
- `/apps` is a compact private workspace with its own header/sidebar, app launcher, search, same-tab app cards, optional separate-tab app links, account/settings/storage shortcuts and recent saved site revisions. The normal Explore navigation/footer do not crowd the workspace.
- `/apps/files` lists the current account's permitted private **site revisions**, with file-tool shortcuts. It does not claim to index connected-provider libraries or device files. Irodori's older site revisions link to the previous editor; Hikari library ZIPs link to its file tools rather than being passed as photos. No files are copied/moved/published.
- The existing app wrappers have the shared app launcher. App sources, separate/opaque origins, sandbox permissions, launch/session handshakes and cloud contracts are unchanged. There is no new multi-app iframe container or replacement native binary. Existing app unsaved-work/unload handling is retained.
- Account mismatches and ended sessions clear the file view; files are rendered as text, filtered to current owner and current web capability. The existing API's owner administration powers are not expanded by the new UI. No private filenames/history are put in localStorage.
- Settings/storage/account open in another tab so the workspace remains available. Sign-out is explicit. Native files/libraries remain managed by their apps; no claim of full Office/Google Docs feature parity or universal autosave is made.
- `/3d-printing` links to the independently branded HobbyNest preview in a new tab. No orders or payments are enabled.

## Intended addresses and current gate

- Workspace: `https://kobo.claudiagilbert.com/`
- Shop: `https://hobbynest.claudiagilbert.com/`

Neither hostname was configured, deployed or verified from this environment. There is no DNS/Netlify management tool or authenticated console session available here. Current working links deliberately remain `/apps` and `/hobbynest`. Do not advertise the subdomains as live yet.

`PUBLIC_KOBO_WORKSPACE_URL` and `PUBLIC_HOBBYNEST_SHOP_URL` can change public front-door links after acceptance. Only the exact corresponding HTTPS root hostname is accepted; unknown hosts, credentials, paths and query/fragment strings fall back to working routes. Those variables **do not create a deployment, rewrite its homepage, configure authentication or migrate browser storage**. Do not set them merely because a DNS name resolves.

## Workspace subdomain cutover (separate acceptance)

1. Record current deployment/app origins and back up local-only work and source originals. Complete cloud-original/library recovery checks for every app that relies on browser storage. Keep the current workspace/app paths working.
2. Stage a workspace deployment/host routing that serves the workspace at the new root, not the Explore homepage. Decide explicitly whether to use an alias on the existing Netlify project with host routing or a separate deployment; a new Netlify project must not silently create a separate user/permissions store or duplicate encryption keys.
3. Test fresh account authorization on the new origin. Netlify session cookies, SDK storage, sign-in return paths, invitation/recovery links and account preferences are origin-sensitive. Sharing a parent domain does not automatically provide SSO. Extend server trusted-origin lists only for the exact owned/verified hostname, with tests; do not widen CSRF or cookie policy indiscriminately.
4. Review app embedding allowlists and fresh-launch origin validation with Claude. A top-level site/iframe-origin change can change browser storage partitioning. Current uploaded apps list the existing Explore origins; do not relax CSP to `*` or move app origins to make the header work.
5. Recheck Google Drive/WebDAV connections, original restore, two-account/two-device isolation, new launch IDs, logout/revocation, native local recovery and provider OAuth return/settings URLs. Keep storage keys/account identities stable.
6. Use Squarespace to add only the `kobo` DNS record required by the staged host. Verify HTTPS, root routing and login on real devices; preserve apex/www, nameservers and Microsoft 365 records. Then set the public entry URL and redeploy Explore.
7. Roll back the public entry URL if needed. Do not delete caches, disconnect storage or restore old data heads during a UI/domain rollback. Preserve the old origin for recovery until migration is confirmed.

## HobbyNest subdomain cutover

Use the custom Netlify commerce plan in `../hobbynest/NETLIFY-COMMERCE-DESIGN.md`. A storefront deployment needs its own root routing/canonical URL and shop checkout acceptance. Do not deploy the entire Explore app under a new host and assume its root becomes the store. Configure the exact host/DNS/HTTPS only after the dedicated storefront is ready; then set its public entry URL. Shop customer identity and Kōbō subscriptions remain distinct.

## Remaining boundaries

Real subdomain/DNS provisioning and live account/device migration remain pending. The delivered workspace is usable at the existing `/apps` address without moving browser data. It is the reviewed starting point for that cutover, not evidence that the two new hosts are already live.
