# Set up the Hikari test site

These instructions create a **separate** static application site. They do not replace Explore, change DNS, or change the existing Squarespace site.

## 1. Deploy the prepared static app

1. Download `hikari-test-site.zip` supplied with this review and extract it on your computer.
2. Open https://app.netlify.com/drop while signed into your Netlify account, or choose **Add new project → Deploy manually**.
3. Drag the **extracted folder containing index.html and _headers** into the upload area. Do not drag it into the existing Explore project's deploy area.
4. Open the new project's configuration and change its project/site name to `cuteclaudia-hikari-test` if available.
5. Confirm the assigned URL. Our selected address is `https://cuteclaudia-hikari-test.netlify.app`. If Netlify assigns another address, use that actual address in the next step and tell Claude.
6. This static app project needs no sign-in keys, WebDAV credentials or build-time secrets. The included headers allow embedding only from `https://explorebyclaudia.netlify.app`. Keep the app's licence/NOTICE files.

The ZIP was prepared from the uploaded Hikari archive with SHA-256 `1979822f6118bbe75c61f120b4af44191b2fd4c71091cf7678f4a65a11c006a8`. Redundant precompressed variants were omitted; executable app files were not rewritten. Its inline module is allowed by its exact CSP hash, rather than unrestricted inline scripts. The current build has no new storage bridge yet.

## 2. Configure the Explore website project

In **the existing Explore project**, open **Project configuration → Environment variables → Add a variable**.

| Key | Value | Secret? | Scope / context |
|---|---|---|---|
| `KOBO_HIKARI_ORIGIN` | `https://cuteclaudia-hikari-test.netlify.app` (or the actual assigned origin, with no path) | No | Functions / Production |
| `WEBDAV_ALLOWED_HOSTS` | Your exact kDrive WebDAV hostname, e.g. `<your-drive-id>.connect.kdrive.infomaniak.com` | No | Functions / Production |
| `FILE_STORAGE_ENCRYPTION_KEY` | Keep your existing key; if none exists, generate once using the Administrator setup in Files & storage | Yes | Functions / Production |
| `OWNER_IDENTITY_ID` | Existing primary owner's Identity UUID | No | Functions / Production |
| `OWNER_GOOGLE_IDENTITY_ID` | Existing secondary owner's Identity UUID | No | Functions / Production |

Preserve any existing approved WebDAV hosts by adding the kDrive host to the comma-separated list. Use the hostname only, without `https://`, path or wildcard. Do not replace an encryption key already in use: existing saved credentials require it.

Leave `KOBO_STORAGE_ENABLED` **unset** (or `false`). Owners can test, while normal users cannot launch this experimental integration. Later origins follow the same convention: `KOBO_FUMI_ORIGIN`, `KOBO_IRODORI_ORIGIN`, `KOBO_TSUZURI_ORIGIN`; only set them when those separate app sites exist.

Save the variables and redeploy **Explore** so its Functions receive them. These variables are not needed on Hikari's static site. No CORS setup is required on kDrive for this relay design. Do not put passwords or encryption keys in the app ZIP, GitHub or chat.

## 3. Connect your kDrive securely

1. Sign into Explore with one of the configured owner accounts.
2. Open **Account → Settings → Files & storage** (`/studio/storage`).
3. Expand **Connection details**.
4. Give it a name such as `My kDrive`.
5. Enter the WebDAV URL supplied by Infomaniak for your drive/account. Verify your plan supports WebDAV; a provider preset is not proof of eligibility.
6. Enter your provider username and a revocable **application password** in that form only.
7. Set the Kōbō base folder to `Kobo`. If your WebDAV URL already ends in `/Kobo/`, leave the base-folder field blank instead.
8. Click **Test & save**. This checks the folder with a temporary file; the password is encrypted server-side and cleared from the form.
9. Click **Test Kōbō sync connection**. This probes conditional writes, read-back, metadata/listing and conditional deletion in an isolated Hikari test folder. Existing WebDAV-copy support alone does not mark a connection sync-ready.
10. If a test fails, retain the displayed error and share that error only. A pass confirms this small connection check; it does not mean the full app integration is finished.

The configured WebDAV URL must already be an accessible account/folder endpoint. Kōbō creates its subfolders as needed; it does not create a provider account.

## 4. Open the owner test shell

Open `https://explorebyclaudia.netlify.app/studio/kobo-test`, choose **Hikari**, then **Open test app**. Hikari should load in the separate-origin frame. With 0.14.1 the shell will say it is waiting for the bridge, because Claude is still building that component.

When the next Hikari build arrives, deploy its reviewed files to the **same Hikari test project**, preserving that app origin and correct CSP. Update the inline-script CSP hash when index.html changes. We will then connect the real client and run the joint acceptance checks on your kDrive.

Your normal app links continue to use the existing editors until acceptance. Site saving/publishing and the older 50 MiB saved-revision limit are separate from this new 1 MiB-per-operation multipart contract.
