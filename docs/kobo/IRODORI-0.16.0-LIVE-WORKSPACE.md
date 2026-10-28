# Irodori 0.16.0 normal workspace

28 October 2026, Australia/Sydney. Claudia explicitly asked to use the tested rebuilt editor when choosing Irodori from My Studio, and confirmed that the separate Netlify origin still serves the verified original 0.16.0 ZIP. Draft 2 step 1 is in progress on Claude's side, not in this artifact.

## Result and access

- `/apps/irodori` automatically opens the separate-origin Irodori image editor, using its documented WebGL2 compatibility option. My Studio's existing app link needs no change.
- Existing `tools.photocraft` web access is required, checked fresh both server-side and during the session. Owner access remains. Desktop-only access, another app's beta grant, suspension or revoked access does not authorize this workspace.
- The existing `IRODORI_PREVIEW_ORIGIN` value is reused. No new environment variable, site upload, Google configuration, DNS change or storage grant is needed for this website release.
- The wrapper has the correct viewport, a compact top row, full-screen action and Save & export help. The app itself still has a desktop canvas layout. Wrapper fit at phone/tablet widths is not phone-layout acceptance.
- `/studio/irodori-test` remains owner-only for development. `/apps/irodori-legacy` preserves the previous editor and its private website-file controls. `/apps/photocraft` redirects to the normal Irodori route as before.

## Save behavior and limits

This original app opens device files and saves/exports downloads. It has no Kōbō storage bridge, cloud document sync or account-separated recovery. Preferences and brush presets can be shared between website logins in the same browser; the help dialog states that limitation. Download work before leaving/signing out. A future versioned ZIP must be reviewed before claiming stronger isolation or recovery.

The shell's device-only identity handshake is provided for future compatible app builds. It reports storage unavailable/read-only, grants no provider or storage launch, and refuses every file operation. The current binary does not use that handshake. Its launch nonce is not an authorized cloud launch ID. All cloud integration remains disabled.

Fresh account/configuration checks and Identity sign-out events destroy and replace the iframe browsing context, closing its MessagePort and aborting outstanding session requests. A late response cannot attach an editor after sign-out. An already downloaded public static app cannot be made subscription-private by the website wrapper; direct static-site protection/licensing remains a separate concern.

## Validation

158 server tests pass, including fresh permission decisions and private/no-store session responses. Production build and isolated production-package checks cover unauthenticated redirects for the normal, legacy and owner-preview routes and HTTP 401 for both session/configuration endpoints.

`scripts/check-irodori-workspace.mjs` loads the exact shipped app JS/WASM under its supplied CSP, checks actual WebGL2 canvas paint, wrapper widths 390/768/1280, full screen, save help, retained legacy link, cloud-operation refusal, revocation and logout during delayed startup. Browser HTTP identities are fixtures; live Netlify identity, file export round trips and physical tablet rendering still need user smoke checks.

The original artifact and prepared Netlify hashes remain those in `IRODORI-0.16.0-OWNER-PREVIEW.md`; this change does not replace static app bytes.

## Release and rollback

Publish the website commit to Explore's existing production branch. After Netlify finishes, reload My Studio and choose Irodori. Check opening, import/edit/export/reopen of a disposable file, full screen and sign-out. Hikari access/origin and storage settings are unchanged.

Immediate fallback: choose **Save & export → Previous editor & saved site files**. Download unsaved work before navigation. To roll back the website release, redeploy the previous known-good Explore deploy or revert this promotion commit and deploy; no native app upload, provider mutation or data migration is required. Keep the separate Irodori site and origin configured for continued owner testing. The old editor's file storage remains in place.

Future app updates: retain the same separate origin, review a versioned ZIP/handoff/hash, test device export and identity/recovery behavior, then upload it to that static site. Do not infer shipped behavior from a design proposal or overwrite Explore with an app ZIP.
