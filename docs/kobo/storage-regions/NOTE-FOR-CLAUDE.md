# Regional storage exploration: note for Claude

29 October 2026. Claudia wants Kōbō to grow into a unified workspace, connecting users' chosen drives and making Europe/Asia/Australia storage setup easier. This is an exploratory website proposal, **not a storage contract change or an instruction to rebuild any app**.

The workspace/new-tab front doors and StratWatch website card are committed separately. App iframe sources/sandbox/launch handshakes and current provider settings remain unchanged. The intended workspace subdomain is not active; preserve existing app origins and local recovery. Any future embed-origin addition must be coordinated and migration-tested.

Recommended exploration order: guided regional Nextcloud/WebDAV setup, then a region-selected S3 adapter; investigate Proton's supported SDK/auth/encryption and write guarantees separately. Google Drive storage and native Google Docs objects/editor workflows are distinct. No new provider is advertised as connected or writable.

The website will keep credentials, endpoint validation and region evidence outside app frames. Existing account/connection/library targeting and conditional-write rules still apply. There is no proposed mandatory bridge field, app file layout, renamed `main`, new registry operation or schema freeze in this note. Any required protocol extension returns for review first.

An in-region bucket alone cannot justify a whole-system residency claim: file relay, indexes, credentials/keys, Identity, logs and backups also matter. Strict residency needs a separate architecture/operational review. Official source requests were blocked by the execution proxy, so current provider plans/APIs/prices/terms are not verified.

No work has been done to switch existing libraries, create cloud accounts, rotate keys, move files, enable write gates or publish app binaries. Keep current app acceptance and recovery work moving independently. Full proposal: `REGIONAL-STORAGE-PROPOSAL.md`.
