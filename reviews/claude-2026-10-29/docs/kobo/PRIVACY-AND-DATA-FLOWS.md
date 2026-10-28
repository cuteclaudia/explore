# Data-flow inventory: the Kōbō desktop apps (29 October 2026)

From each app's security gate (`tools/security/allowed-hosts.txt` and `network-code.txt`). Every web
address in the code and every file that can open a connection is listed there with a reviewed
reason, and nothing new can be released until it is reviewed. The public versions are each app's
`PRIVACY.md` (links in `APP-REGISTRY.md`).

## Common to all six

| Flow | When | What is sent |
|---|---|---|
| Update check, GitHub (`api.github.com` / `github.com`, the app's `-releases` repo) | Hikari, Irodori, Fumi, Tsuzuri, Goban: at start. Tayori: only after the user agrees, at most daily. **Never in Store copies.** | An ordinary request for the newest published release; nothing about the user or their files |
| Help/About links (claudiagilbert.com, releases, feedback) | Only when clicked; opened in the browser | Nothing from the app |
| Control channel / MCP | Off unless the user starts it; 127.0.0.1 only; secret key | Nothing leaves the computer |
| Telemetry, analytics, crash reports, ads, accounts | Never | — |

Names such as `schemas.openxmlformats.org`, `www.w3.org`, `purl.org` and `ns.adobe.com` appear in
the code as XML namespace names inside files. They are never contacted.

## App-specific

| App | Extra flows |
|---|---|
| Hikari | Optional, user-started downloads: face-recognition model files (GitHub/OpenCV model zoo, Hugging Face) and the GeoNames place list (download.geonames.org), each SHA-256 checked; processing is local. "Show on Map" opens openstreetmap.org at the photo's position when clicked. |
| Irodori | None beyond the common flows. |
| Fumi | Zotero citation integration over 127.0.0.1 only. |
| Tsuzuri | None beyond the common flows. |
| Tayori | **Mail exception:** the user's own mail servers (IMAP/SMTP, encrypted), Microsoft sign-in (in the browser) and Microsoft Graph for Outlook/365 accounts. Pictures in mail only on request, from the sender's servers. Credentials only in the OS credential store. Removed from upstream: public DNS lookups (Cloudflare/Google) and sender pictures (Gravatar, favicon.im, Google). |
| Goban | None beyond the common flows. |

## Web versions (Hikari, Irodori, Fumi, Tsuzuri)

The browser policy in each app's `_headers` allows connections only to the app's own origin
(`connect-src 'self'`) and embedding only by `https://www.claudiagilbert.com`,
`https://claudiagilbert.com` and `https://explorebyclaudia.netlify.app`. Files go through the
website's Kōbō bridge to the user's connected storage. The website's privacy policy should cover the
account, entitlements and storage connections. The app pages above point there.
