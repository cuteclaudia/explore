# Netlify stability review — 29 October 2026

Claudia chose to stabilise the current Netlify service before any European hosting trial. The baseline reviewed was website commit `223922b`; the category changes and evidence below are delivered together in the following commit. No DNS, app origin, cloud connection, encryption key or native app build was changed.

## Account and recovery evidence

Claudia confirmed in this conversation that live sign-in and **Settings → Desktop installers** now work without looping. Keep that result separate from the remaining live account cases in the [release checklist](../RELEASE-CHECKLIST.md).

Local verification passed:

- **201 server tests**, including permissions, account binding, provider concurrency, private-index snapshots/restoration, activity imports, new category concurrency and the OSINT draft/publish lifecycle.
- Real login controller: awaited session refresh, correct destination, stable refusal/service failure and explicit retry; OSINT editor links retain their destination after sign-in.
- Compact permissions: safe desktop/web presets, owner privileges excluded from member grants, save/search and phone width.
- Recovery settings: encrypted checkpoint download, interrupted verification/resume, explicit activation and selection of an imported checkpoint.
- App session lifecycle: fresh launch IDs on account/provider/restored-index changes; sign-out and late replies cannot reopen an old session.
- Workspace and storage settings at 320–1440 px, including account-change clearing, capability filtering and preservation of existing storage controls.
- GPX/TCX/FIT imports: validation, missing heights, gaps, corrupted/oversized input, old-route preservation and local-only file handling.
- Actual map renderer with simulated services: activity controls, map/list switching, stable loading/error status geometry, synthetic terrain/contours, optional satellite controls and no-WebGL fallback.
- Writing filters/editor: initial four categories, creation/rename through an isolated real Netlify Blobs API, stable IDs, automatic filter/options refresh, search, accessible selection state, phone/tablet layout and unpublished-page refusal.
- Production build and isolated Netlify package checks: public OSINT archive/article, category API, published-only RSS/feed data, private account guards on both custom hosts and expired/revoked/unavailable session handling. `require(ESM)` was disabled to match the Netlify runtime restriction.

These checks use local identities, temporary storage and simulated provider responses. They do not certify real Google Drive/kDrive behaviour, actual map coverage or physical Safari/Android devices. No live user's content was published or restored.

Logs for this workspace are `/tmp/netlify-stability-server-final.log`, `/tmp/netlify-stability-login-recovery-final.log`, `/tmp/netlify-stability-compact-permissions.log`, `/tmp/netlify-stability-storage-index-ui.log`, `/tmp/netlify-stability-kobo-relaunch.log`, `/tmp/netlify-stability-kobo-workspace.log`, `/tmp/netlify-stability-storage-onboarding.log`, `/tmp/netlify-stability-activity-imports.log`, `/tmp/netlify-stability-explore-planner.log`, `/tmp/netlify-stability-writing-filters-final.log` and `/tmp/netlify-stability-build-final.log`.

## Writing update

Research & analysis starts with **All Writing | China Series | Cyber Briefs | OSINT Brief**. The owner can add or rename categories under **Studio → Writing & photography → Writing categories**, then choose one in the article editor. Names and assignments update without changing article URLs. See [writing category instructions](WRITING-CATEGORIES.md).

## Remaining gates, in order

1. Record the current live Netlify deploy ID. Check fresh/expired/revoked sessions, sign-out, another permitted account and denied/suspended access. Finish invitation/password-recovery email checks on the canonical live domain.
2. Confirm the HTTPS renewal warning is gone and the Google Drive OAuth callback/reconnect works on the live domain. Preserve remaining Squarespace-hosted assets before cancelling the old site.
3. Receive each exact app candidate and checksum from Claude. Review it individually; earlier tests do not approve a later build.
4. Run Hikari's [two-device procedure](../kobo/TWO-DEVICE-ACCEPTANCE.md) on both Google Drive and kDrive, including the Chrome/Edge stale-session regression and original-file hashes.
5. Complete a [disposable private-index restore drill](../kobo/PRIVATE-INDEX-RECOVERY.md) against the real provider. Preserve originals, exported checkpoints and the existing encryption key separately. Never practise by deleting the sole live index.
6. Check supported real phones/tablets and Windows app rendering. Sign off each app's release gate and compatible fallback using the [rollback procedure](../kobo/LIVE-REPLACEMENT-AND-ROLLBACK.md).

Strava approval/real OAuth, HobbyNest payments, subscription enforcement, new workspace subdomains and European hosting remain separate releases. They do not block stabilising the existing website and accepted apps, and should not be advertised as delivered merely because a design or fixture exists.
