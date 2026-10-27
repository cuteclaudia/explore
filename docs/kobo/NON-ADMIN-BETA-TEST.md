# Invite-only, separate-user Hikari beta test

This is a limited beta grant, not a live app replacement or public registration. The test account stays a member; it must not become an owner or administrator.

1. In Netlify, open the Explore site's **Identity → Invite users** and invite the separate testing email Claudia created. Keep registration invitation-only. Do not add this account to `OWNER_IDENTITY_ID` or `OWNER_GOOGLE_IDENTITY_ID`.
2. Signed in as Claudia, open **My Studio → User permissions** (`/studio/users`). Find the invited email, expand its row, tick **Hikari beta testing**, then **Save access**. This automatically enables Hikari web access (which includes desktop access). Leave other app and content grants off. You can grant access before the invitation is accepted.
3. Accept the invitation, set a password and sign in at `/studio/login` in another browser or profile. If the invitation link lands on the homepage, open `/studio/login` with the invitation's original fragment retained. Never share the invitation token or passwords.
4. As the member, open **Files & storage** and connect a **different Google Drive account** from Claudia's existing connection. If Google OAuth is still in Testing mode, add the tester's Google address under **Google Auth Platform → Audience → Test users** first. Run **Test connection** and select Google Drive as the Kōbō provider. Google Drive authorisation is separate from site login.
5. In **My Studio** or **My apps**, use the small **Beta** link next to Hikari, then **Open test app**. The ordinary Hikari tile still opens the current editor engine; it has not been replaced.
6. Import a small uniquely named JPEG in each account, for example `OWNER-ONLY.jpg` and `TESTER-ONLY.jpg`. Wait for each upload and “Synced to storage”. The member must not see the owner's imported photo, albums, edits or library names; Claudia must not see the member's. Built-in sample photos may appear in both accounts.
7. Close and reopen the member app; its own photo and thumbnail should return. Then repeat by signing out and changing accounts in the **same browser profile**. This checks local cache separation as well as cloud storage. Back up any important unsynced work first.
8. As the member, visit `/studio/users`, `/studio/about` and `/studio/downloads`. Administration must be refused. Account and personal storage settings should remain available.
9. As Claudia, remove **Hikari beta testing** and save. The member's active launch must lose storage access and reopening the beta must be refused. Removing the Hikari web grant also clears its beta checkbox. Existing local files and cloud files are retained; revocation does not remotely erase downloaded copies. Restore the beta grant when finished.
10. Repeat with kDrive using separate WebDAV credentials or isolated base folders. Intentionally sharing the same remote folder is not a separate-storage privacy test.

The invitation and live checks are performed by Claudia. No invitation email was sent by this code change. No new environment variable, encryption key or DNS change is required. Keep provider credentials private.

## Automated evidence and limits

150 server tests pass, including a non-admin beta member denied the owner's files and launch, connection substitution, removed grants, suspension, and own-account index recovery. Browser checks cover the beta grant and compact permission controls, plus the phone wrapper. Real Hikari 0.16.0 WASM checks pass for separate Alice/Bob albums, guest isolation, unavailable-provider account/connection separation, scoped photo originals and thumbnails, and actual backup downloads excluding other-account and guest originals. These use fixture authentication/provider HTTP; live separate-user Google Drive and kDrive acceptance is still required.
