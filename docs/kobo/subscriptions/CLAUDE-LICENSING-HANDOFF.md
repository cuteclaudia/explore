# Desktop subscription handoff for Claude

29 October 2026. Proposal for review when app development resumes. No external message was sent, and no licence endpoint/key/payment service is live.

Claudia wants lower-cost Desktop bundles and Web + Desktop bundles, with the latter including desktop. No permanent founding discount; maximum 25% for the first year. The website remains on Netlify while we stabilise it. The suite is now named SoraSpace (ソラスペース), with intended address https://www.soraspace.studio. Preserve app IDs and account/file bindings independently of branding; no launch/storage contract or origin migration is authorised by the display-name change.

Please review the [subscription specification](SUBSCRIPTION-SPECIFICATION.md), particularly sections 3, 4 and 8. It supersedes the earlier draft’s identical desktop/web access and permanent founding discount as a proposed direction, not a frozen API contract.

The website will own purchase verification, source-specific grants, manual overrides, account suspension, trial issuance and transactional device registration. Apps receive a signed app/device/account-bound desktop editing ticket, never an administrator role or an unverified payment claim. Web and desktop scope must be distinct. One global expiry covering every purchased bundle is unsafe.

Suggested limits for review: one explicit 30-day no-card account trial; five computers across the suite; refresh daily; maximum 30 days offline capped by the applicable app grant/trial end; bounded seven-day recovery grace only after a previously paid renewal fails. These values need final commercial acceptance and native feasibility checks.

Required app behaviours:

1. PKCE S256 browser sign-in, unpredictable state, exact one-time loopback code exchange and rotating secure device token. Review concurrent refreshes across multiple apps.
2. Strict Ed25519/JWS verification of issuer/audience/app/device/account/scopes/times; algorithm allowlist and overlapping key rotation. No private key in app builds. Agree canonical wire schema before implementation.
3. Detect suspicious clock rollback with signed server-time evidence; do not rely only on `exp - iat`. Document offline revocation limits.
4. Expiry/read-only transition preserves local recovery, originals and in-flight work. Opening/export/recovery must remain possible where supported; no cloud writes after expired editing rights.
5. Account/device switching must fence old licences and app/cache/storage work. File provider selection remains separate from purchase state.
6. Verify shared credential access between independently packaged/MSIX Store apps rather than assuming suite-wide single sign-in is automatic. Check current Microsoft policies and each upstream licence.
7. Add app-specific tests for invalid/expired/wrong-audience tickets, trial and paid-period boundaries, five-device races, revoked/rotated tokens, key rotation, offline transitions and unsaved-document recovery. Return candidate/source/checksum and real Windows results.

Existing installers do not become subscription-enforced through the website’s download gates. Please continue reporting that distinction until the shared licensing component and each accepted binary have passed the agreed tests. App sync/recovery acceptance still comes before paid launch.
