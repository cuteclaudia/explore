# Beta acceptance results

28 October 2026, user-reported live checks. Keep separate from the independent fixture tests in `HIKARI-0.16.0-REVIEW.md`.

| Setup | Observation | Status |
| --- | --- | --- |
| Google Drive, Chrome | Thumbnails displayed; syncing downloaded new images saved from another login | Reported pass for thumbnail display and cloud image restoration |
| Google Drive, two accounts | User reports the owner and `kobobycuteclaudia@gmail.com` accounts keep their files separate; both save and reopen work correctly | User-reported live pass for account separation and save/reopen |
| kDrive/WebDAV, same account on two devices | User explicitly confirms save/sync across two devices works and passes | User-reported live pass for ordinary same-account two-device sync |
| kDrive/WebDAV, two independent accounts | User has only one kDrive account and accepts proceeding without this test | Untested; accepted beta limitation, not a verified pass |
| Simultaneous genuine edits and Keep both recovery | Ordinary two-device sync was confirmed; deliberate competing-edit recovery was not separately reported | Pending explicit live result |
| Disposable Google private-index restore drill | No live result supplied in this report | Pending |


Update recorded 28 October 2026, Australia/Sydney. These are the user’s reported live results, not a new independent execution by the website agent. Normal two-device syncing does not by itself establish deliberate conflict recovery.

The report does not independently establish the deployed artifact checksum or complete every two-device acceptance item. Do not treat it as approval to expose other users' libraries, publish installers or cut over the live app. Follow `TWO-DEVICE-ACCEPTANCE.md` for the remaining checks.

## Irodori hosting report

Claudia reports the separate-origin Irodori 0.16.0 preview opens successfully and explicitly authorizes using it from My Studio as the normal Irodori editor. This is permission to promote the device-download editor, not evidence of cloud storage, account-separated recovery, a phone canvas layout or edited-file export/reopen acceptance. Claudia confirms the original 0.16.0 ZIP remains deployed; Claude's draft 2 step 1 is in progress and will arrive as a new versioned ZIP and handoff.
