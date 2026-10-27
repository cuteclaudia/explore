# Hikari security and privacy audit

*Last updated: 27 October 2026 (Hikari 0.16.0 release candidate, web and Windows desktop).*

Question checked: can Hikari copy, save or send your photos or data to any site other than your own
storage (through claudiagilbert.com) and your own GitHub releases, and is there anything malicious
in it?

**Answer: no.** Details and evidence below. Two limitations: the virus-signature scan has to be run
on your computer (see the end), and the third-party libraries were checked against the public
advisory database (RustSec), not read line by line.

## Web version (claudiagilbert.com, phone, tablet, browser)

- **The browser enforces it.** The page's security policy (`packaging/web/_headers`) is
  `connect-src 'self'`: the browser refuses any network request to another site, whatever the
  code does. Scripts, images, fonts and workers can only come from Hikari's own address. Only
  CuteClaudia's website may embed the app (`frame-ancestors`).
- **Network calls in the shipped files:** `main.js` loads Hikari's own `lightcraft_web_bg.wasm` and
  `lightcraft_zh_hans.otf`, and `kobo-bridge.js` loads its own `kobo.json`. The app module (WebAssembly)
  imports no network function at all (checked: its 227 browser imports include no fetch,
  XMLHttpRequest, WebSocket or beacon).
- **The only way data leaves the page** is the Kōbō storage bridge: a private message channel to the
  website, only to the origins in `kobo.json` (`explorebyclaudia.netlify.app`,
  `www.claudiagilbert.com`, `claudiagilbert.com`). Messages from any other site are ignored. The
  website then saves to *your* connected storage (kDrive, Google Drive). Hikari never sees your
  storage passwords.
- **No eval, no hidden code:** no `eval`, `new Function`, cookie or token reading in the shipped
  scripts. Clipboard is used only when you copy or paste; a new tab opens only when you click a
  Help or Releases link.

## Windows desktop

Hikari never uploads anything on its own. Every connection it can make:

| What | Where | When | What is sent |
|---|---|---|---|
| Update check and download | `api.github.com` / `github.com`, only `cuteclaudia/hikari-releases` | once at start-up, and Help ▸ Check for Updates (there's no setting to turn the start-up check off yet) | an ordinary download request with "Hikari/<version>"; downloads are size- and SHA-256-checked |
| Place names for "Fill Location from GPS" | `download.geonames.org` | only when you ask for it | a download request; no photo data or locations |
| Face recognition models | `github.com/opencv/opencv_zoo`, `huggingface.co` (pinned versions) | only when you ask for them | a download request; each file's SHA-256 is checked |
| AI masks model (SAM 3) | none built in (the list is empty) | only from addresses you add yourself | a download request |
| Remote denoise / AI masks on another computer | only an address you set in `LIGHTCRAFT_DENOISE_URL` / `LIGHTCRAFT_SAM3_REMOTE` | never unless you set it | photo tiles to *your* computer |
| Control channel / MCP (automation) | `127.0.0.1` only (this computer) | only with `--control` / `hikari-cli mcp` | nothing leaves the computer |

- Hikari's own downloader (`crates/fetch`) can only *download*: it has no way to upload or post.
  The updater (`craft-update`) likewise only downloads.
- No telemetry, analytics, crash reporting or "phone home" code (searched the whole source).
- "Send Feedback" only opens the GitHub issue page in your browser; nothing is filled in or sent.
- Build scripts don't download anything. Dependencies come from crates.io plus three pinned
  GitHub sources (`storytold/craft-libs`, `storytold/egui`, `storytold/winit`), locked by commit.
- Release builds run on GitHub with read-only permissions; they only create **draft** releases
  in `cuteclaudia/hikari-releases`, which you publish yourself.

## Known weaknesses in libraries (RustSec, `cargo audit`)

None is malicious, and none lets data out. Fixed or not reachable:

- `rustls-webpki` 0.103.15 (certificate check could accept a distrusted intermediate):
  **updated to 0.103.16** in this release.
- `rustls-webpki` 0.102 (several certificate-check advisories): pulled in by the pure-Rust TLS
  provider only for algorithm names. Certificates are checked by the patched 0.103.16, so these
  don't apply.
- `rsa` (Marvin) and `crypto-bigint` (timing): attacks on a *private key*. Hikari only checks
  servers' public keys when downloading.
- `zip` 7.2 (unsafe extraction of symlinks): used by the AI library only to read model files;
  Hikari never extracts archives with it.
- Plus unmaintained/unsound notices for Linux-only and unused crates (`zbus`, `tokio` `AsyncFd`).

Follow-ups (not urgent): a setting to turn off the start-up update check; move the TLS provider off `rustls-rustcrypto` 0.0.2-alpha when a
maintained pure-Rust provider is ready; pin the GitHub Actions in `hikari-build.yml` to commit
hashes.

## Virus scan

The build server can't download virus signatures (its network is limited), so run this on
your computer: Windows Security (Defender) scans downloads automatically. For a second opinion,
upload `hikari-web-0.16.0.zip` and the Windows zip to virustotal.com (they're public builds, so
uploading them is fine). Compare the SHA-256 in the handoff with what you downloaded.
