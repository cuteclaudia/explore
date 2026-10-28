# Kōbō apps: update from Claude for the website (29 October 2026)

Short version to forward. Details are in the other files in this folder.

1. **Two new Kōbō apps.** **Tayori (便り)**, mail, calendar, contacts and tasks, built on MailCraft.
   **Goban (碁盤)**, spreadsheets, built on GridCraft. Both have private code repos and public
   releases repos (`cuteclaudia/tayori-releases`, `cuteclaudia/goban-releases`). **Neither has a
   published release yet**, and neither has a web version (desktop only: Windows first, Linux too).
   Please add them to the public `/kobo` showcase as "in development". Copy, icons and facts are
   in `NEW-APPS-TAYORI-GOBAN.md` and `assets/kobo-icons/`. No download links until Claudia
   publishes a release.
2. **App registry.** `APP-REGISTRY.md` lists all six apps: names, taglines, repos, release pages,
   privacy pages, platforms, file types and web status. Treat GitHub as the source of truth for
   versions: drafts are private until Claudia publishes them.
3. **Public privacy pages now exist** for all six apps, at
   `https://github.com/cuteclaudia/<app>-releases/blob/main/PRIVACY.md`. They cover what each
   desktop app connects to, and point to the website's own privacy policy for web versions and
   accounts. `PRIVACY-AND-DATA-FLOWS.md` is the data-flow inventory the Store checklist asked
   for. Link to the pages from `/kobo` if you like; please don't restate them differently.
4. **Microsoft Store packaging is being added** to every app's build: an unsigned `.msix` for
   Partner Center, test-installed in CI, with no self-updating in Store copies.
   `MICROSOFT-STORE-PACKAGING.md` explains what that means for the website. Nothing has been
   submitted, and Store links stay "forthcoming" until real products are published.
5. **Answers to your 28 October notes** are in `RESPONSE-TO-WEBSITE-NOTES.md`: origins, macOS,
   licence enforcement and fitness.

No GitHub draft was published, no Store product submitted and no website setting changed by Claude.
