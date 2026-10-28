# Website follow-up for Claudia and Claude

29 October 2026 (Sydney).

Delivered in the requested order:

1. Phone/tablet activity-picker actions wrap cleanly and use 44px touch targets. Map navigation, route picker, layer controls and preview actions have larger targets on touch devices. Complete elevation profiles have readable distance/height ranges and accessible descriptions. Incomplete profiles are hidden explicitly; no partial curve implies a full profile. Segment gaps are respected by both mapped geometry and chart paths.
2. `docs/RELEASE-CHECKLIST.md` is the single sign-off index for website accounts/domain, fitness/maps, creative apps, desktop/Store and rollback. Its links point to the detailed existing procedures. It includes Claude's latest app version/platform/publishing distinctions without claiming new binaries have passed acceptance.
3. Local GPX/TCX/FIT GPS route viewing: browser-only parsing, 5 MiB/20,000 point limits, FIT checksums and endian/compression/developer-field handling, missing-position segment gaps, optional elevations and useful no-GPS/corrupt-file errors. Failed replacement keeps the last valid route. No retained workout history, uploads or automatic Garmin sync. `ACTIVITY-FILE-IMPORTS.md` describes supported data and limits.
4. `GARMIN-KOMOOT-APPROVAL.md` contains a reusable application brief, provider-specific questions, implementation gates and acceptance/evidence requirements. No external application or message was submitted. Official-site requests again failed with proxy CONNECT 403, so current partner terms/fees/API availability still need direct verification.

## Claude's supplied handoff

The archive `kobo-handoff-for-chatgpt-2026-10-29.zip` has SHA-256 `a271a3f51826a1c1bd34b0abfb8f6312275edd629aebc49d7ef03a569d2ffd41`. Its documents/icons are preserved in `reviews/claude-2026-10-29/`; review is in `docs/kobo/CLAUDE-HANDOFF-REVIEW-2026-10-29.md`. No app binary is supplied in that archive. Tayori/Goban showcase, installer fields and app-specific entitlements are a separate catalogue change, not silently enabled by adding these review files. No draft releases or Store products were published.

## Verification and remaining acceptance

- 189 server tests passed, including FIT integrity/format variants, independent standard CRC check vector and existing authorization/storage regressions.
- Browser file-import/controller checks passed at 320–1440px, including phone/tablet landscape, touch targets, namespace-aware TCX, missing/invalid data, FIT previews, previous-route preservation and no file uploads. These use generated files and fixture map replies.
- Strava picker and preview/account/disconnect regression checks passed with provider fixtures and long activity names.
- Full planner regression checks cover terrain/contours, layer synchronization, stable status rows, satellite/fallback, route statistics and four-width layout using synthetic services.
- Production build and isolated packaged authorization/content checks passed. Git push triggers the existing deployment workflow; that is not independent proof of the live Netlify deployment or real browser/provider acceptance.

Next real checks: representative GPS exports from Claudia's actual devices, physical phone/tablet (including Safari/iPad where supported), live Strava consent, and the still-unchecked items in the consolidated release checklist. Kōbō contracts, provider gates, encryption keys and subscription/registration behaviour are unchanged.
