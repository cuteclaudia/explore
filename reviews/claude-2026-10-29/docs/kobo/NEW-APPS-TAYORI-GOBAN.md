# Tayori and Goban for the /kobo showcase

Both are **in development**: no published release, no web version, no Store product. Show them
like the others, with no download button until a release is published and no Store badge.

## Tayori (便り): mail

- **Card line:** Mail, calendar, contacts and tasks.
- **Short description:** Tayori is a private mail program for Windows and Linux. It works with
  ordinary mail accounts (IMAP and SMTP) and with Outlook.com and Microsoft 365. Pictures in
  emails load only when you ask, and nothing in a message ever runs.
- **Name:** *tayori* is a letter or news from someone, as in "a letter from home".
- **Icon:** `tayori.svg` / `tayori-256.png` (envelope closed with a sakura seal).
- **Privacy, if a line is wanted:** Talks only to your own mail servers. No account, no telemetry.
- **Status:** In development · Windows and Linux · Web: not planned yet · macOS: Planned.
- **Built on:** MailCraft by the MailCraft contributors (credit wording, if shown: "Built on
  MailCraft, MIT OR Apache-2.0").

## Goban (碁盤): spreadsheets

- **Card line:** Spreadsheets and data.
- **Short description:** Goban opens, edits and saves Excel workbooks (.xlsx) and CSV files, with
  formulas, charts, tables and pivot tables, on Windows and Linux.
- **Name:** a *goban* is the grid board the game of go is played on.
- **Icon:** `goban.svg` / `goban-256.png` (gold go board with black, white and sakura stones).
- **Status:** In development · Windows and Linux · Web: later (needs the Kōbō bridge) · macOS: Planned.
- **Built on:** GridCraft by the ArtCraft Team and contributors (MIT OR Apache-2.0).

## Website-side work this needs (yours)

- Add both to `/kobo` and the protected `/apps` library cards, with the same permission model as
  the other apps (per-app desktop download permissions; no web launch for these two yet).
- Owner settings: add install-URL fields for Tayori and Goban (Windows, Linux, macOS-planned), left
  empty until a release is published.
- The website's app switcher and Drive ideas: Goban will open `.xlsx`/`.csv` and Tayori nothing
  from storage yet. No bridge operations are needed for either until their web versions exist.
