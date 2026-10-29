# Local static-app portability rehearsal

This runs a **previously reviewed Irodori 0.16.1 specimen** under Caddy/Docker on localhost. It is a hosting test, not a current app release, Hetzner deployment, sync backend or EU-residency certification. It does not change Explore, deploy app binaries or use real accounts/files.

The test copies the extracted specimen into an isolated temporary Docker build context, preserves each app file, translates its required headers into Caddy configuration and opens it in a disposable browser. The image runs as an unprivileged user with read-only root, no Linux capabilities and no-new-privileges; only localhost receives a published port. The Caddy file capability is removed at image build time because this specimen uses port 8080. No remote installer script is executed.

Run from the Explore repository with Docker and Playwright available:

```sh
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs CHROMIUM_PATH=/path/to/chromium \
  node scripts/check-eu-static-hosting.mjs
```

`IRODORI_HOSTING_SPECIMEN` can point to the extracted specimen; the default is the earlier workspace review folder. The script requires the exact Caddy image digest recorded in its source; it does not silently follow a floating image tag. Pulling/building downloads public container code, not customer data. The test container and temporary build context are removed on completion; a local image can remain for inspection. No image is pushed to a registry.

Do not expose this HTTP configuration to the Internet. Actual hosting needs the selected current accepted app ZIP, verified image/security versions, HTTPS/host routing, exact embedding origins, country/backup evidence, authentication/backend migration and the staged plan in `docs/hosting/hetzner/INVESTIGATION.md`. `_headers` is host-specific metadata; a generic static server does not apply those rules by itself.
