# SoraSpace workspace navigation · 30 October 2026 (Sydney)

The workspace home and saved-site-files pages use a slim header, app launcher, shared app/file search and a left icon rail. Home retains apps on the left, Mail/Calendar previews on the right, and files below Calendar. Colour follows the existing appearance palette; the subtle local landscape accent and app icons retain SoraSpace branding.

## Slide-out menu

- Desktop mouse hover reveals labels in a 224px overlay without moving content. Keyboard focus expands it too. The menu button also works on touch devices.
- Pin menu keeps it expanded and gives it permanent layout space. The pin preference is stored as a boolean under `soraspace.navigation.pinned:<verified-account-id>`; it contains no files, tokens or connection details. Changing accounts does not share the preference.
- Unpinned menus close when leaving, clicking outside or pressing Escape. Explicit Close returns focus to the menu button. A pinned menu remains available until unpinned.
- On phones, the menu is a left drawer with a backdrop, focus trap and Escape/Close support. Closed drawer links are inert. Pinning is offered on larger screens; a desktop pin preference is retained when moving to/from phone width.
- Only permitted web apps appear as launchable rail/launcher links. Mail and Sheets desktop status is retained in the app cards; no nonexistent browser routes are advertised. Mail/Calendar previews remain clearly marked Coming soon.

## Separate app windows

App cards, web-app rail/launcher links, saved-file app links and public product-page launch links target a separate context. A normal click requests an app-sized window, removes its opener before navigating, and keeps the workspace available. If a popup is blocked, the ordinary `_blank`/`noopener` anchor remains the fallback. Ctrl/Cmd/Shift/middle-click keep normal browser behaviour. Browsers, particularly on phones, ultimately control whether a separate context is presented as a window or tab.

App destination paths, legacy editor/file routing, permissions, native iframe sources/sandbox, file revisions, cloud folder/index names and storage contracts are preserved. Desktop-only apps still open their desktop area rather than acquiring invented web editors. The editors' own interfaces continue to be supplied by their existing app builds.

## Search and privacy

The header searches app names/descriptions and already-loaded **saved site revisions**, including file names and app names. It does not claim to search email, calendars, local disks or connected-provider catalogues. File filtering runs only on records already checked against the current owner and capabilities. Account loss clears cached rows and hides private workspace content; stale asynchronous replies cannot restore another account's files. Public text/file names are rendered through text nodes.

## Checks

Local browser checks cover actual separate app-window launch with no opener, native fallback when `window.open` is blocked, hover without page shift, pinned layout/persistence, keyboard/mobile drawer behaviour, search, existing owner/capability/XSS filtering and late-account/session clearing. Home fits the existing seven laptop/monitor test sizes from 1280×640 to 2560×1440; phone/tablet layouts are checked from 320px. Tests use isolated identities/file fixtures and do not assert live provider or native-app release acceptance.
