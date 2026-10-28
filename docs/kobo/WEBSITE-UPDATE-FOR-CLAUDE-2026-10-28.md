# Website update to share with Claude

The production website has moved toward `www.claudiagilbert.com`; retain both www and apex shell origins in existing app allowlists/CSP. Hosting origins for the apps stay unchanged. Netlify's www certificate-renewal warning still needs a live check; a working root-domain page alone does not settle that.

The website login loop was addressed: protected SSR pages use the native fresh session endpoint, login waits for near-expiry refresh, and a rejected page/session mismatch cannot repeatedly auto-redirect. Local browser tests and built-package authenticated checks pass on both hostnames; a real production login check remains necessary. This is website authentication work, not an app storage-contract change.

Claudia wants macOS **kept visibly planned**, not removed. It is temporarily on hold and remains a future project. Website app cards and public pages now show this. Installer fields stay available; no macOS build/date is claimed.

Claudia now has a Microsoft developer account and wants her apps publicised here. `/kobo` is a public showcase; `/apps` remains the permission-protected library. Microsoft Store is shown as forthcoming, with no invented product IDs/links. Please coordinate the real Windows packaging/update, screenshots, licence notices, privacy disclosures and any future desktop licence enforcement before Store submission. Publicity is not approval to publish drafts or bypass the agreed app acceptance checks. No GitHub draft or Microsoft product was published by this website work.

The public `/3d-printing` page is a portfolio introduction, with actual project content still to be supplied. Shared navigation and site pages passed 414 responsive layout checks; app canvases/physical-device graphics remain their own acceptance work.

Fitness integration is a separate Explore workstream: Strava first, then Komoot/Garmin and approved paths for Google Fit/Health Connect, MyFitnessPal and Xiaomi. Current functionality is local GPX preview and real route-derived statistics. No direct provider sync has been enabled, and no Kōbō bridge operations changed for this. Current official provider documentation could not be freshly retrieved in this environment; access/terms and approval must be checked before direct integrations are frozen.
