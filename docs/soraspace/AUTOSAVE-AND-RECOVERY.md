# Autosave and recovery plan

Status: design, not a live autosave feature. Existing files are not moved or converted.

1. Agree a lossless snapshot/restore protocol with each app; establish a dirty sequence and reliable ready acknowledgement. Test recovery of realistic documents including images, citations, layers and forms.
2. Add bounded local recovery with explicit account/workspace/document binding. Decide shared-device retention and encryption/key handling before release. Clear access on logout and never fall back to another user's snapshots.
3. Show distinct states: Unsaved changes, Saving, Saved locally, Saved to [chosen destination], Offline/pending, Conflict and Save failed. Only a durable acknowledgement advances the saved sequence. Recovery is not a backup and browser storage may be evicted.
4. Offer a user-selected default destination and explicit consent. Connected storage retains its region/provider identity; the website must not silently redirect European storage selections to site storage. Service credentials stay server-side.
5. Save revisions with conditional writes/ETags and idempotent IDs. Keep the previous recoverable revision until the new one is verified; do not overwrite conflicting edits in another tab/device. Offer compare/recover/save-copy actions.
6. Handle interrupted chunks, offline retry with backoff, quotas, entitlement expiry and storage revocation. A trial ending must not silently delete data; design an authenticated recovery/export path before relying on it for paid customer retention. That recovery path is not currently implemented.
7. Test crash/restart, two devices, two tabs, logout/account switch during saving, failed writes, corrupt snapshots and app upgrades. Preserve manual downloads throughout rollout.

Start with SoraDocs, then SoraPDF and the image/photo formats after their adapters pass equivalent checks. Workgroup sharing requires transactional membership/ACL checks at every read and write, not just hiding rows in the interface.
