# Full Claude handoff · SoraSpace / creative applications

Prepared 30 October 2026 for Claudia's next Claude session on **2 November 2026, 5:00 pm Australia/Sydney (AEDT, UTC+11)**. Website baseline: `b869110` on `cuteclaudia/explore`, main. This is a prepared snapshot, not a scheduled job. No email has been sent and no future autonomous refresh is configured. Check for later commits before implementation.

## Read first: scope and precedence

Claudia confirmed Claude handles the native/creative apps; ChatGPT handles Explore, SoraSpace's website/workspace, HobbyNest and platform integrations. Coordinate app/host contracts before changing them. This document consolidates Claudia's decisions; the dated supporting documents include historical proposals and test evidence, not blanket instructions to deploy or enable every feature. Later explicit user decisions take precedence. Do not mark planned functionality as delivered.

## Current user decisions

- Product: SoraSpace, public domain `www.soraspace.studio`. Explore remains `www.claudiagilbert.com`; maintain stable hosting on Netlify before any European migration.
- App names: SoraDocs (Fumi 文), SoraPDF (Tsuzuri 綴り), SoraPhotos (Hikari 光), SoraImage (Irodori 彩り), SoraMail (Tayori 便り), SoraSheets (Goban 碁盤). Sora names lead; Japanese companions are smaller. Remove other visible product branding while preserving legal/third-party acknowledgements. Internal IDs, file formats and provider/bridge/storage keys require backwards compatibility.
- Compact, clear, system-colour interfaces; phone/tablet support and usability on 13-inch laptops through large monitors. Apps open in ordinary reusable tabs, with the SoraSpace hover/pin sidebar. Reselecting an app preserves its document; explicit file changes must protect unsaved edits.
- macOS remains visible as planned, not hidden. Windows/Linux/web are current delivery priorities.
- Pricing is configurable packages/services with “from” prices and editable service choices. Do not infer approval of all earlier suggested prices. Founding offer: no permanent discount, maximum 25% for the first year.
- Selected tester trials, default 30 days, owner extensions/revocation and public admission switches. Paid checkout remains disabled. Offline desktop licensing is a separate signed-ticket design; server trial controls do not revoke installed offline apps.
- Every person sees only their own private data. Workgroups start at 5 seats; proposed capacities include 10, 15, 20, 25, 50, 100 and 250, with explicitly shared files/contacts and workspace administration. These are staged requirements, not live multi-user provisioning.
- SoraShop is the commerce engine; HobbyNest is Claudia's physical print/STL business. Multiple independent stores per workspace are planned, with separate store and physical/digital switches.
- Research management and Zotero, Projects with jobs/subjobs/time/alterations/fees/invoicing/payment, shared SoraMail contacts/CRM and reviewed mail merge/mailouts are priorities. Add AI features after stable releases.
- Website UI supports 16 locale options. Native app UI/document translation is separate; do not claim it exists because the site has a language picker.

## Highest-priority app work

1. **Startup and branding:** profile cold/warm launches, network transfer and WASM compile/init versus first usable editor. Current bundled local engines: Docs 0.11.0, PDF 0.14.0, Photos 0.14.0 and previous Image 0.16.0. These are legacy host bundles; do not mistake them for the latest candidates you have built. The separate Image candidate is 0.16.1. Supply versioned accepted artifacts/hashes and upgrade instructions without breaking saved work.
2. **SoraImage notice:** supplied 0.16.1 HTML reveals a warning after 20 seconds through CSS, irrespective of actual failure. Claudia saw it, then a successful launch. Use neutral loading copy and reserve errors for observed failures. A packaging-only candidate was prepared: all 19 other prepared files match; only index.html changes. See STARTUP-IMPROVEMENTS and its verification record. Claudia prefers this to wait for your handoff; no upload/deployment is requested now.
3. **Autosave/recovery:** establish a non-interactive lossless snapshot/restore + dirty/revision/acknowledgement protocol per app. Preserve manual export and current recovery. No false Saved state; handle offline/quotas/conflicts/account changes. Distinguish local crash recovery from user-chosen cloud saving and backups. Do not silently move European-chosen data into site storage. Existing SoraImage recovery is version-specific/best effort, not proof of universal autosave.
4. **Zotero:** verify the existing Docs menu, supported desktop and browser flows, library/group access, citation editing/CSL/bibliography and DOCX roundtrip. Return a reference document and exact test steps. Presence of a menu is not compatibility proof.
5. **Mail/contacts/CRM:** agree a versioned contact adapter with stable provider IDs, organisations, revisions, changes/tombstones, explicit scopes and duplicate/conflict/unlink handling. Share canonical contact identities with Projects/CRM without exposing private mailboxes. Mailouts require recipient review, opt-outs/consent, test send and explicit send confirmation.
6. **Storage candidates:** preserve the current bridge/account/provider fences and safe-write verification. Read current Hikari two-device acceptance and rollback documents before promoting any storage-enabled candidate. Do not flip storage gates or migrate real libraries merely to test hosting.
7. **Licensing:** coordinate signed offline entitlements, device limits, expiry/recovery and add-on/seat semantics with platform billing. Do not collect card details in native apps or treat local flags as payment authority.

## Website work already implemented

- Named app tabs and persistent responsive sidebar; filenames are links; private-file API no longer grants platform owners access to other users' private revisions.
- Parallel checked file restoration, bounded chunk concurrency, checksum validation and account-change cancellation.
- Latest startup update adds an informational strip and a native-start/loader-removal signal. Saved-file delivery waits for that signal, up to three minutes, rather than relying on canvas resize or the previous 45-second cutoff. Photos' handwritten bootstrap emits the corresponding event after its start call. This is not a native binary change or a promise of instant startup.
- Owner launch/trial controls, email-bound copy/compose invitations (not automatic email sending), account-bound service preferences and timed server-side grants. Existing paid checkout stays unavailable.
- Public whole-card app previews with category comparisons and honest beta/desktop/planned labels; real screenshots still awaited from Claudia. Do not add unsupported feature-parity or AI security-certification claims.
- HobbyNest owner catalogue/detail/image editing, colour inventory and dispatch estimates, import mapping/preview, costing and margins, physical/digital availability switches and owner test basket. Real order/payment/stock-reservation/fulfilment still needs a transactional implementation.
- Guided regional storage preferences exist; no provider location/jurisdiction guarantee or automatic regional account provisioning. Europe-located user files do not remove the US jurisdiction of other services.

## Language / translation

Current options: English, simplified/traditional Chinese, French, European Portuguese, Indonesian, German, Japanese, Korean, Italian, Thai, Ukrainian, Dutch, Swedish, Finnish and Norwegian Bokmål. Site device-language default with remembered override is implemented. Native UI localisation and translation among all supported languages need separate validation. CTranslate2 source/runtime assessment and isolated offline evaluation exist; no translation model/service is live or licensed for production merely by this assessment. See the source assessment and region notes.

## Validation and limits

The preceding owner/trial/tab batch passed 283 server tests. The latest startup change passed the production build/package guards, simulated delayed-file readiness, real local pinned Docs/PDF/Photos/legacy Image engines, and the separate Image 0.16.1 engine/CSP/logout checks. Workspace tab/mobile/account fences and HobbyNest catalogue/stock/image/test-basket checks also passed. Local fixture identities/storage were used: this is not live Netlify verification, a production performance benchmark, independent security certification, or acceptance of cloud sync on two physical devices.

## Return to ChatGPT / Claudia

Provide exact artifact version, source revision, SHA-256, app/host feature matrix, changed bridge contract (if any), migration/rollback notes and reproducible acceptance steps. Keep app/recovery/storage IDs stable. Flag untested work rather than inferring completion. Do not send real mail, publish paid releases, enable charging or change live user data as a side effect of this handoff.

## Contents

- `docs/soraspace/`: current platform decisions, rollout controls, startup, autosave, CRM/workgroup/store design and app handoff.
- `docs/kobo/`: app release, bridge/storage/recovery/licensing references. Historical files retain their dates; reconcile with this current summary and actual code.
- `docs/hobbynest/`, `docs/fitness/`: host-side context, not a request to take over website implementation.
- `host-source/`: relevant app metadata, startup/restore bridge/controller and wrapper source at the stated website commit.
- `verification/`: prepared SoraImage loading-copy record. The separate 13 MB native ZIP is not duplicated here; its source package and preparation command are identified in the startup notes.


## Latest update: languages and repository separation

Website commit `b869110` fixes case-variant/duplicated language URL prefixes, adds full workspace home/saved-file UI coverage in all 16 locales, and passes the effective UI language to local and separately hosted app frames. The language-only change does not reload open documents. Native apps still need to consume the preference and negotiate their available translations/English fallback; see `LANGUAGE-PROPAGATION-AND-ROUTING.md`. User document text and filenames are never auto-translated. The server suite now passes 284 tests; additional browser checks cover the actual workspace UI, app preference propagation, document preservation, public broken-link recovery and the real Image engine.

The website-side SoraImage opening panel is now a compact top notice. Retry and the previous-editor shortcut are hidden during normal startup and appear only after an actionable failure. The separate native app's internal 20-second loading warning remains a distinct handoff item.

`cuteclaudia/soraspace-platform` is now initialised at `d3a3e31` with a buildable public marketing copy and migration gates. It has no authenticated workspace runtime or migrated accounts/private files. Existing production deployments still use Explore; no authentication, DNS, OAuth, encryption key or storage cutover occurred. A new static Netlify staging project can build from repository root with `npm run build`, publish `sites/soraspace/dist`, no environment variables, and its default Netlify address. Keep its staging noindex header until the deliberate production marketing cutover. Claude's app repositories remain separate.
