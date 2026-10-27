# Website release-readiness validation

27 October 2026. Delivery prepares release; it does not cut over Hikari or enable public storage access.

- 140 server tests passed, including private-index backup/restore, actual Blobs SDK compatibility, CSRF/fresh identity, scope and import authentication, provider competing-save gate, interrupted/lost-response resume, missing/tampered originals, complete index/recovery-store loss, simultaneous recovery fences, staging completeness, epoch authorization races and cancellation before head publication.
- `scripts/check-kobo-relaunch.mjs` passed with the real shell and reviewed MessageChannel client: changed provider, account and restored-index epoch each get a new launch; unchanged focus does not reload; sign-out cancels pending launch; a late reply/later login cannot reopen; cross-tab old-launch 401 is freshly authorized. Storage/identity are fixtures.
- `scripts/check-storage-index-ui.mjs` passed against extracted real markup/controller: checkpoint, encrypted download, interrupted verification/resume, explicit activation and importing an older checkpoint. API responses are fixtures.
- Phone wrapper checks passed. Actual Hikari 0.15.0 WASM/bridge at 390px, touch DPR 1 passed small/multipart JPEG upload, committed catalog, clean-context restore, original hashes and read-only refusal through the new session controller, including the optional website index-epoch field.
- Production build and isolated packaged SSR/private-guard checks passed.

Not run against Claudia's live data: index restore, account/provider relaunch acceptance or destructive corruption scenarios. The owner must complete the disposable real-provider drill and Claude's candidate must pass the two-device checklist. No native conflict-recovery fix is claimed from these website tests. Android 0.15.0 layout acceptance remains the user's earlier result.

See `RELEASE-CANDIDATE-HANDOFF.md`, `PRIVATE-INDEX-RECOVERY.md`, `LIVE-REPLACEMENT-AND-ROLLBACK.md` and `TWO-DEVICE-ACCEPTANCE.md` for the concrete procedures and limits. No new environment variable or encryption-key rotation is needed. Index snapshots are separate private Blobs records; exported copies and the original encryption key must be kept outside this Netlify account for account-loss recovery.
