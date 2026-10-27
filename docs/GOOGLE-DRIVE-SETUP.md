# Google Drive for Kōbō — administrator setup

This connects an individual user's Google Drive to their Explore account. Google sign-in is separate. Every user authorizes their own account; never put a user's Drive password or folder ID into Netlify environment variables.

Status: the website adapter has automated tests using simulated Google responses and the real Netlify Blobs emulator. Live Google consent, token refresh and Hikari acceptance tests still need to pass before this is called working. WebDAV remains the existing destination. `KOBO_STORAGE_ENABLED` should remain unset/false during owner testing.

## 1. Create a dedicated Google OAuth client

1. Open [Google Cloud Console](https://console.cloud.google.com/) and select or create a project for Kōbō storage.
2. Under **APIs & Services → Library**, enable **Google Drive API**.
3. Configure **Google Auth Platform** (or OAuth consent screen): branding, support email, audience and developer contact. Choose External for users outside a single Google Workspace organization.
4. During testing, add Claudia's intended Google account under **Audience → Test users**. Add other testers explicitly.
5. Under **Data Access**, use only `https://www.googleapis.com/auth/drive.file`. The integration does not need full Drive access. Do not add broader Drive scopes to this dedicated client.
6. Under **Clients → Create client**, select **Web application**.
7. Add this exact **Authorized redirect URI**, without a trailing slash:

   `https://explorebyclaudia.netlify.app/api/google-drive/callback`

8. Save the client ID and client secret securely. Never paste the secret into a chat or a public repository.

The callback belongs to the Explore website, not the Hikari test site. If a different website origin is used later, register its exact callback and update the matching variable together. Do not change DNS or Squarespace for this setup.

## 2. Configure the Explore Netlify project

In **explorebyclaudia → Project configuration → Environment variables**, add these for **Functions**, **Production**:

| Name | Value |
| --- | --- |
| `GOOGLE_DRIVE_CLIENT_ID` | The dedicated web client ID |
| `GOOGLE_DRIVE_CLIENT_SECRET` | The web client's secret; mark secret |
| `GOOGLE_DRIVE_REDIRECT_URI` | `https://explorebyclaudia.netlify.app/api/google-drive/callback` |

Keep the existing `FILE_STORAGE_ENCRYPTION_KEY` unchanged. It encrypts provider credentials with an account-specific binding. Replacing it makes saved credentials unreadable. No `PUBLIC_` or `VITE_` prefix should be used for secrets.

Redeploy Explore after adding the variables. The Hikari static project does not need these secrets. `WEBDAV_ALLOWED_HOSTS` controls WebDAV only; Google requests go to fixed Google API origins.

## 3. Connect and verify

1. Sign into Explore and open **Account → Settings → Files & storage** (`/studio/storage`).
2. Click **Connect Google Drive**, choose the account and approve the limited file permission.
3. Back in settings, click **Test connection**. This checks a small private Drive revision, read-back, metadata, stale-write refusal and logical deletion. It also races raw create-only and compare-and-swap writes on a fresh temporary private Netlify index key. Exactly one raw write must be accepted and the other refused; final read-back alone does not count. Google remains server-enforced read-only until these competing-save checks pass. Existing readable libraries and credentials are preserved.
4. After the test passes, choose **Google Drive** under **Kōbō sync destination → Use this provider**.
5. Reopen `/studio/kobo-test`. Existing libraries are not migrated or copied. Never approve copying a guest library unless it is yours and intended for that account.
6. Check create/edit/reopen, account isolation, reconnect, sign-out, conflicts and a real large-photo upload with Claude's current Hikari build. A settings test alone is not full app acceptance.

Selecting WebDAV again requires its existing connection to be verified. Disconnecting the selected provider stops availability; the website never silently switches to someone else's account or another provider.

## Storage and recovery model

Google Drive does not provide the same contract as WebDAV. The adapter uploads immutable binary revisions into an app-created **Kōbō/Hikari** (or other app) folder, then atomically updates the current reference in private Netlify Blobs. Conditional conflicts are checked against that index. The exposed ETags are logical Kōbō revision identifiers, not claims about native Google HTTP ETags. Google can change its internal file version for metadata updates: reads still verify the saved byte hash, and stat checks download and hash a revision when that provider version differs. An unchanged byte hash does not create an artificial competing-save conflict. Changed contents, ownership, parent folder, size or revision properties remain refused.

Only files created by this integration are available under the limited permission. It does not browse arbitrary existing Drive documents or edit native Google Docs. Working chunk files are binary app data, not individual photos ready for Drive's gallery.

Account IDs, logical paths, folder records and current file references live in the private **kobo-google-files** Blobs store. **Back up that index as well as the Drive folder.** Drive files alone are not a complete restoration procedure. This first implementation has no end-user index restore tool. Do not rely on it as your only copy of important work.

Old and abandoned uploaded revisions remain in Drive. A remove operation tombstones the current index entry; it does not permanently delete cloud snapshots. Automatic garbage collection is disabled. Disconnect removes the encrypted connection locally and attempts Google token revocation; it keeps the files. Account deletion and permanent snapshot cleanup require a separately designed retention flow.

Provider files follow Google's own hosting and account policies; connecting Google does not move them to kDrive or Switzerland. Netlify continues to hold the private index and encrypted authorization credentials.

OAuth projects in testing can have short-lived refresh authorizations, depending on Google's current policies. A reconnect prompt in testing is expected in that case. Review Google's production publishing requirements before opening access to other users.

## Competing-save verification update

The earlier independent-worker test alone was not sufficient proof: a read-back check can report a conflict after a backend accepted both writes. The stronger raw-response probe detected this behavior in the local Blobs emulator. This is not a claim that production Netlify has the same behavior. Run **Test connection** on the deployed site and require the message **connection and competing-save checks passed**. A failing probe keeps Google read-only. Even a passing backend check does not complete the separate two-device Hikari or photo-original acceptance tests.

If the live competing-save check fails, leave Google read-only and preserve the existing connection. The deployed diagnostic identifies `create-only` or `compare-and-swap`, counts SDK-reported accepted/refused/failed writes, and includes numeric backend HTTP statuses when available. For example, `2 reported accepted, 0 refused` differs from `0 reported accepted, 0 refused, 2 failed`; only the former indicates both SDK operations reported acceptance, and the HTTP statuses are needed to interpret that report. No tokens, signed URLs or file contents are included. Do not reconnect accounts or change passwords to address an index concurrency failure. Send the full diagnostic text for review; a failed check is not itself proof of a Google API fault.
