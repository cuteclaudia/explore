# Desktop releases and macOS roadmap

Claudia confirmed that macOS is on hold temporarily, remains a future project, and must stay visible. No macOS build or release date is promised. App cards show **macOS · Planned** until an actual macOS download is configured; owner settings retain every macOS URL field. The label is informational and gives no download access. Existing server-side per-app desktop permissions remain unchanged.

## Claude's reported release links

These were supplied by Claudia from Claude's update, not independently verified against GitHub. A configured URL is not proof that an installer is published, tested or licensed for a given user.

| App | Windows / Linux release page | Readiness reported in the update |
| --- | --- | --- |
| Hikari | https://github.com/cuteclaudia/hikari-releases/releases/latest | 0.16.0 draft; awaiting joint two-device acceptance before publishing. |
| Irodori | https://github.com/cuteclaudia/irodori-releases/releases/latest | 0.16.0 and 0.16.1 drafts; 0.16.2 being prepared, Windows and web testing still needed. |
| Fumi | https://github.com/cuteclaudia/fumi-releases/releases/latest | First draft being prepared; Windows and web testing still needed. |
| Tsuzuri | No release URL supplied | Repositories/token setup requested by Claude; not performed as part of this website change. |

The same release-page URL can be entered separately for Windows and Linux after a suitable release is published. GitHub drafts are private to authorized repository users and cannot be downloaded by website members. `/releases/latest` selects an eligible published release, not a draft. Do not enable links for users merely because Claude supplied the eventual URL.

For a moving release-page URL, leave the website's Version and SHA-256 blank; the release page's checksums identify its individual assets. If pinning an exact installer asset, the stored checksum must match that asset, platform and version. A release-page checksum is not a checksum of its installers. Keep licence notices and upstream acknowledgements in distributed builds.

This work changes website display/help only. No draft was published, no old draft deleted, no installer link saved into live settings, and no GitHub repository or token changed. Publishing follows the agreed app-specific acceptance checks. Desktop runtime subscription enforcement is separate from website download authorization; public release URLs can be shared.

## Validation

The desktop menu browser check covers planned macOS with no download, replacement of the planned label by a configured macOS link, authorized local download URLs, separate web navigation, keyboard dismissal, and 320/390/768px layout. The server suite checks fresh authorization and absent-platform refusal. Production build and deployment-package checks are required before pushing.
