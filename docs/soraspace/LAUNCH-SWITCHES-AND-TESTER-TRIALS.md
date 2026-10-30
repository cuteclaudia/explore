# Launch switches and selected-tester trials

30 October 2026, Sydney. Owner tools: `/studio/soraspace-admin` → **Launch switches & tester trials**, or `/studio/soraspace-controls` directly.

## Using the controls

- **Public signup open:** opens/pauses the application's signup form. Netlify's `SORASPACE_SIGNUP_ENABLED=true`, provider signup availability and required email confirmation remain prerequisites. This UI flag is not a replacement for the Identity provider's own registration setting; close provider registration separately if all direct provider signup must be blocked. Existing accounts and active trials are not deleted when signup closes.
- **Public trials open:** verified users can explicitly activate a trial for requested services that intersect the owner-selected public trial services. Default is closed. Default duration is 30 days; owner can choose 1–365. No card/charge. First activation only; a second request cannot restart the clock. Existing manual/permanent grants remain independent.
- **New selected-tester trials/invitations enabled:** owner can grant a verified tester a timed trial or create a private invitation even while public trials are closed. Pausing new tester admission does not cancel existing active trials. Existing trials can still be extended or stopped by the owner.
- **Individual tester:** choose the registered account, Start, Extend/reactivate or Stop, days, services and a reason. Extensions add days to the later of the current expiry or server time. A stopped/expired trial can be restored by an explicit owner extension. Suspended accounts stay suspended. Owner accounts cannot be trial-limited.
- **Invite selected tester:** enter email, services, days and reason. Copy the private link or choose **Compose invitation email** to review/send with your mail application. No message is sent automatically. The invitation is email-bound, stored by token digest, expires after 14 days and starts the trial clock only on verified activation. It does not expose the email in its URL.
- **HobbyNest switches:** physical and digital sections save independently through the existing catalogue API. They control section availability and testing, not paid fulfilment. Store-specific paused messages are retained. Full catalogue/stock controls remain in HobbyNest administration.
- **Paid checkout:** both SoraSpace subscriptions and HobbyNest payments are shown unavailable. A switch cannot substitute for payment, webhook, accounting and fulfilment integration. No new paid checkout endpoint was enabled by this change.

All controls are owner-only and bind mutations to the administrator account. Settings and trial records use version checks; stale forms must reload. Trial changes keep a bounded reason/actor/time history and request IDs prevent duplicate extension retries. Invitation links are only displayed at creation; regenerate a new invitation if a link was lost. The current interface does not offer invitation revocation/list management; unclaimed links expire, and pausing tester invitations blocks redemption.

## Tester activation

A link opens `/studio/welcome#trial-invite=...`. The browser stores its short-lived invitation context in sessionStorage and removes the fragment from the address bar. An anonymous tester can sign in or create an account using the invited email. New invited registration still requires the environment/provider prerequisites, but may pass the application signup pause after server-side email/token checks. Follow verification, then reopen the invitation link if confirmation opened another tab; sessionStorage does not follow unrelated tabs. The tester chooses **Activate tester invitation** to start the allotted period.

The trial grants only selected website/browser-app capabilities. The server ledger is independent of user-editable Identity metadata. Every fresh authorization derives effective grants using server time; expiry/revocation removes trial grants while preserving permanent ones. A ledger outage cannot grant trial access; independently granted access remains usable. The account/welcome page and service requests remain accessible without editing grants. No file is deleted at expiry.

Already-open local work and already-installed/offline desktop apps are not instantly revoked by server flags. Timed offline desktop licensing needs its own signed-ticket implementation with Claude. A full account-wide post-expiry recovery/export service remains a separate release requirement; the new controls do not promise all private file APIs remain accessible after editing access expires.

## Data boundaries

Private site file metadata, listings, bytes and publication actions now require the file owner's account even when the requester has platform-owner status. Existing public exports remain deliberately public. Joining a future workgroup must not loosen this rule automatically: shared files need explicit scoped grants. Filename links open the selected revision in its app; they do not publish or move it.

Not yet implemented: live subscriptions/payments; multi-store customer workspaces; workgroup memberships or seat billing; CRM; autosave. See the workgroup and shared-data designs for their staged requirements.
