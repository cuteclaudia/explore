# Irodori 0.16.0 (web): handoff to the website

*28 October 2026. From Claude (app side) to ChatGPT (website). Owner-only hosting for now; nothing
public until Claudia decides.*

## The archive

| File | SHA-256 | Size |
|---|---|---|
| `irodori-web-0.16.0.zip` | `4177ab26781a5e2ebe10c2d15e1dae98e115c090254f1ec841d75b7a700a4e78` | 12.3 MiB |

Source revision `4de90164` on `cuteclaudia/irodori` (built by GitHub Actions; the same file is in
the `v0.16.0` draft of `cuteclaudia/irodori-releases`). It passed the release security gate:
known vulnerabilities, dependency sources, every host and network/process call reviewed, the web
CSP, and a ClamAV scan. It was tested by loading the packaged site in Chromium under the shipped
CSP: it starts, with no CSP violations.

## What Irodori is

Irodori (彩り) is CuteClaudia's image editor (layers, masks, selections, adjustments, type, brushes;
opens and saves PSD), built on PhotoCraft. Web app id: **`irodori`**. Its future storage root is
`/Kobo/Irodori/`.

## Hosting (same model as Hikari, contract §2)

- **Its own origin**, separate from the website and from Hikari, for example
  `irodori.apps.<site-host>` or a separate Netlify site for testing. It must not share an origin
  with another app.
- Embed with the same iframe attributes as Hikari:
  `sandbox="allow-scripts allow-same-origin allow-downloads allow-popups allow-modals"`,
  `allow="clipboard-read; clipboard-write; fullscreen"`.
- Serve the zip's folder `irodori-web-0.16.0/` as static files. `_headers` (Netlify/Cloudflare
  format) carries the policy. Other hosts need the same headers:
  - `Content-Security-Policy: default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; worker-src 'self' blob:; font-src 'self' data:; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self' https://explorebyclaudia.netlify.app https://www.claudiagilbert.com https://claudiagilbert.com`
  - `X-Content-Type-Options: nosniff`, `Content-Type: application/wasm` for `*.wasm`,
    `Cache-Control: no-cache` for `index.html`, `app/photocraft-web.js` and `app/parts.txt`; the
    hashed files may be cached as immutable (`_headers` has the rules).
- `index.html` has no inline script (start-up is in `start-1.js`), so the CSP needs no hash.
- The app's WebAssembly ships gzipped in parts under `app/` (largest file well under 25 MiB);
  the page joins and inflates them itself. Don't let the host re-compress or rename `app/*.part-*`.
- `kobo.json` (`app: irodori`, `shellOrigins` = the three website origins) is included for the
  bridge. Keep it in step with `frame-ancestors`.

## What works in this version

- The full editor in the browser. Open from the device (picker or drag and drop), edit, and save by
  downloading (PSD, PNG, JPEG and others).
- Kōbō branding: Ai (indigo) theme by default, Sakura (light) available, only CuteClaudia links.

## Not yet (known limitations)

- **Not connected to Kōbō storage.** This build doesn't load the bridge, so it works the same
  signed in or out, with nothing saved to Google Drive/kDrive. The storage design is in
  `kobo-storage-irodori.md` (attached separately) for your review. It needs no new bridge operation.
- **No phone layout yet:** on phones it shows the desktop layout. It's best on tablets and
  computers for now; please don't offer it as phone-ready.
- A request for `fonts/manifest.txt` returns 404 and is harmless (optional served fonts aren't
  shipped in this build).
- Account separation in browser storage comes with the storage work. Today Irodori keeps only
  preferences and brush presets in the browser, the same for every user of that browser.

## Requested from the website

1. A test origin for Irodori and an owner-only page that embeds it, like Hikari's.
2. Review of `kobo-storage-irodori.md`, especially its §7 questions.
3. Nothing changes for Hikari: its acceptance stays first.
