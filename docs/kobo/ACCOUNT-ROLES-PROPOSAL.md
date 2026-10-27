# Account roles and app access — proposal

Keep **site role**, **app entitlement**, **beta participation**, and **account status** independent. An app subscription must never confer site administration. These roles are a design proposal; today user management and site administration remain owner-only.

| Role | Recommended rights |
| --- | --- |
| Owner | Claudia's permanent protected account. Can appoint/remove administrators, control billing and security configuration, and manage all site features. |
| Administrator | Manage ordinary members, grant approved app access, suspend members, and maintain normal site settings. Cannot appoint another administrator, demote the owner, change infrastructure secrets or inspect another person's private app files. |
| Editor | Manage explicitly assigned public site content and media. Draft and publish permissions remain separate. No account administration and no access to private app libraries. |
| Member | Use the apps and desktop downloads granted to their account; manage their own connections, files and preferences. |

Start with Owner and Member for this beta. Add delegated Administrator when there is a trusted person to appoint; add Editor when someone will help maintain the public site. A read-only support role can wait until it has a concrete need. Pending approval and Suspended are account states, not additional roles.

**Power**, **Creator**, **Power Creator**, **Student** and **Worker** are app bundles, not authority levels. Existing bundles can remain manually selected: Power = all currently available apps, Creator = image/photo/PDF, Student and Worker = documents/PDF. Future design apps can complete Power Creator when shipped. Web access includes desktop; desktop-only remains an independent entitlement. Beta access is a separate per-app opt-in. Subscription automation should update entitlements only and preserve explicit owner decisions.

## Promotion and demotion

Provide a compact Role selector beside the existing bundle/access controls, editable only by the Owner for administrator promotions/demotions. Show an explicit summary before promoting: user management and site settings, **no private files**. Never infer a role from email domains, login-provider roles, or editable profile metadata. Store role assignments in fresh server-managed account metadata, with an audit record of actor, target, old/new roles and time. Role demotion/suspension must be enforced on the next protected request and terminate privileged app launches as appropriate.

Before enabling it, replace today's hard owner checks consistently across user-management APIs, pages and navigation with explicit capabilities; add separate owner-only `roles.manage`, `billing.manage` and security controls. Administrators may change only ordinary member entitlements within an approved allowlist, not privileged capabilities or their own role. Protect the final owner, prevent self-promotion and test forged/stale sessions, demotions, cross-account file isolation and accidental publication. No role, including Administrator, grants another user's private storage credentials or photo browsing. Any future support sharing must be explicit, user authorised and separately designed.
