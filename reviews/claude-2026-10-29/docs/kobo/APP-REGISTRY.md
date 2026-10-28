# Kōbō app registry (29 October 2026)

One row per app. "Code version" is the version in the app's code today: a release with that number
exists only once Claudia publishes it on GitHub. Release pages (`…/releases/latest`) show only
**published** releases, never drafts.

| App | Japanese | What it is | Code version | Built on (credited in NOTICE and About) |
|---|---|---|---|---|
| Hikari | 光 | Photo library and raw developer | 0.16.0 | LightCraft (ArtCraft Team) |
| Irodori | 彩り | Image editor with layers | 0.16.2 | PhotoCraft (ArtCraft Team) |
| Fumi | 文 | Word processor | 0.11.0 | WordCraft (ArtCraft Team) |
| Tsuzuri | 綴り | Read, fill, sign and edit PDFs | 0.14.0 | PdfCraft (ArtCraft Team) |
| Tayori | 便り | Mail, calendar, contacts and tasks | 0.8.2 | MailCraft (MailCraft contributors, UCS-Care-Group) |
| Goban | 碁盤 | Spreadsheets and data | 0.12.1 | GridCraft (ArtCraft Team) |

All are MIT OR Apache-2.0 and published by **CuteClaudia**. Only CuteClaudia's names appear in the
apps: no ArtCraft or storytold logos or links.

## Links

| App | Release page (published only) | Privacy page | Feedback |
|---|---|---|---|
| Hikari | https://github.com/cuteclaudia/hikari-releases/releases/latest | https://github.com/cuteclaudia/hikari-releases/blob/main/PRIVACY.md | https://github.com/cuteclaudia/hikari-releases/issues/new |
| Irodori | https://github.com/cuteclaudia/irodori-releases/releases/latest | https://github.com/cuteclaudia/irodori-releases/blob/main/PRIVACY.md | https://github.com/cuteclaudia/irodori-releases/issues/new |
| Fumi | https://github.com/cuteclaudia/fumi-releases/releases/latest | https://github.com/cuteclaudia/fumi-releases/blob/main/PRIVACY.md | https://github.com/cuteclaudia/fumi-releases/issues/new |
| Tsuzuri | https://github.com/cuteclaudia/tsuzuri-releases/releases/latest | https://github.com/cuteclaudia/tsuzuri-releases/blob/main/PRIVACY.md | https://github.com/cuteclaudia/tsuzuri-releases/issues/new |
| Tayori | https://github.com/cuteclaudia/tayori-releases/releases/latest | https://github.com/cuteclaudia/tayori-releases/blob/main/PRIVACY.md | https://github.com/cuteclaudia/tayori-releases/issues/new |
| Goban | https://github.com/cuteclaudia/goban-releases/releases/latest | https://github.com/cuteclaudia/goban-releases/blob/main/PRIVACY.md | https://github.com/cuteclaudia/goban-releases/issues/new |

The Tsuzuri row also answers your 28 October note "Tsuzuri: no release URL supplied". Its repos
exist now, but it has no published release yet.

## Platforms

| App | Windows | Linux | Web (claudiagilbert.com) | Android | macOS |
|---|---|---|---|---|---|
| Hikari | yes | yes | yes (owner-only until joint acceptance) | yes | Planned |
| Irodori | yes | yes | yes | — | Planned |
| Fumi | yes | yes | yes | — | Planned |
| Tsuzuri | yes | yes | yes | — | Planned |
| Tayori | yes | yes | **not yet** (needs a decision on how a browser reaches mail servers) | — | Planned |
| Goban | yes | yes | **not yet** (needs the Kōbō website bridge, as Tsuzuri has) | — | Planned |

Windows downloads per release: `<app>-<version>-windows-x64-setup.exe` (installer) and
`…-windows-x64-portable.zip`. Linux: `.AppImage`, `.deb`, `.rpm`, `.tar.gz`. Each release has
`SHA256SUMS.txt` (Tayori also ships a `.msi`). Releases are not code-signed yet, so Windows shows
"Windows protected your PC" (More info › Run anyway). Microsoft Store copies won't have that warning.

## Files each desktop app offers to open ("Open with"; it never takes over the default app)

| App | File types |
|---|---|
| Fumi | .docx .docm .dotx .dotm .doc .dot .odt .rtf |
| Tsuzuri | .pdf |
| Tayori | .eml .ics .vcf .mbox, mailto: links |
| Goban | .xlsx .xlsm .csv |
| Hikari, Irodori | none registered (open files from inside the app) |

## Icons

`assets/kobo-icons/<app>.svg` (master) and `<app>-256.png`. All follow the Kōbō system: indigo
#1F2A4D tile, gold #F2B544 ring, one motif. Tayori: a washi envelope with a sakura seal. Goban: a
gold go board with black, white and sakura stones.
