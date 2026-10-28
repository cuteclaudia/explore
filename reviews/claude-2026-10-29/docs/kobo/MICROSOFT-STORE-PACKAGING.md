# Microsoft Store packaging (what Claude is adding to the apps)

## What exists

Each app's GitHub build gets a `store` job on a Windows runner. It turns the Windows portable zip
into **`store-upload-<app>-<version>-x64.msix`**. The job then signs a throwaway copy with a
temporary certificate, installs it, checks the package and uninstalls it. The real `.msix` stays
**unsigned**, because Partner Center signs it on submission. The security gate's virus scan covers
it. It is a build artifact for Claudia to upload, and is **not** attached to the GitHub releases.

Store copies:
- are installed and updated by the Store, and never check GitHub or update themselves (Help ›
  Check for Updates says the Store keeps them up to date);
- have no "Windows protected your PC" warning;
- offer the same file types under "Open with" as the installers.

Goban has this now. Hikari, Irodori, Fumi, Tsuzuri and Tayori get it on 29 October.

## What Claudia must do (not the website)

1. In Partner Center, create each product and reserve its name (Hikari, Irodori, Fumi, Tsuzuri,
   Tayori, Goban).
2. Copy each product's **Product identity** values into that app's code repo as Actions variables:
   `STORE_IDENTITY_NAME`, `STORE_PUBLISHER`, `STORE_PUBLISHER_DISPLAY_NAME`. Until then the packages
   use placeholders that Partner Center refuses.
3. For each submission: the privacy policy URL (the app's `PRIVACY.md` page), screenshots, a
   description, age rating, and the `runFullTrust` justification ("a desktop app that opens and
   saves the user's own files").

## For the website

- Keep Store links "forthcoming" until a product is **published**. Then record its real Store
  URL/product ID and add the official badge.
- **Store purchases and website entitlements are separate.** No app checks a Store licence or a
  website subscription today; all desktop apps run fully for anyone who installs them. If paid
  Store listings or subscriptions are planned, that needs an explicit design with Claude first,
  covering the Store licensing API in each app and any link to website accounts. Please don't
  grant website access from a claimed Store purchase.
- If the apps are free in the Store, nothing changes on the website beyond the links.
