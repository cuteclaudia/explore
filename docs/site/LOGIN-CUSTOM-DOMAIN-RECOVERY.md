# Custom-domain login and protected account pages

Claudia reported repeated navigation to `https://www.claudiagilbert.com/studio/login/?next=%2Fstudio` after signing in, and again when opening Settings → Desktop installers. Visiting Home temporarily cleared the symptom. Browser screenshots showed a signed-in Sign out button alternating with the login form. The live browser/network could not be inspected from this environment, so the precise Netlify-side cause is not asserted as independently observed.

The website previously checked browser login through the native `/api/studio/session` function, while protected Astro pages separately called the Identity SDK through the SSR runtime. When those checks disagree, the login controller redirects to Studio and its page guard redirects back indefinitely. A temporary service/setup failure was also treated as a reason to redirect to login.

## Change

Astro middleware binds an isolated request context using AsyncLocalStorage. Protected SSR pages and Astro API handlers verify the incoming `nf_jwt` cookie through the existing, freshly authorized native session function on the **same configured website origin**. This works without relying on an Astro runtime's SDK globals matching those of a native v2 function. Native Netlify function authorization remains unchanged and still checks the current Identity user and current grants.

The session check forwards cookies only to an allowlisted origin, refuses HTTP redirects, has a timeout, checks the response shape, and independently matches owner status against configured permanent owner IDs. Authorization is never derived from decoded client tokens, userMetadata or browser state. Verification is reused only within one request, not across users or later requests. Missing/expired credentials yield login; revoked access yields 403; verification failures yield 503 instead of a login redirect.

The browser also awaits the SDK’s near-expiry session refresh before checking the server or navigating, so an expired cookie is not raced against a background token refresh. The form shows a stable checking state during initialization. Login returns marked `reason=session` do not automatically redirect a second time when the native session API says the user is already signed in. They show an explicit Continue retry instead, breaking a disagreement loop. A normal successful password/invitation/recovery flow can proceed normally. Desktop installers, the Irodori preview and Settings are included in the validated return destinations.

## Evidence and remaining check

- 169 server tests passed, including request-cookie forwarding, absent/invalid sessions, setup/service failures, owner binding, revoked capability checks and concurrent account isolation.
- `scripts/check-login-recovery.mjs` runs the real browser controller against simulated Identity replies. It reproduces the protected-page bounce, confirms it stops, tests explicit retry, preserves the Desktop installers return path, waits for a deliberately delayed cookie refresh, and handles failed/successful sign-in checks.
- The actual built SSR package passes authenticated session checks for Studio, Desktop installers, account settings, People & permissions and My apps on both `www.claudiagilbert.com` and `claudiagilbert.com`, with simulated native-session replies and no SDK user globals. Expired/revoked/unavailable responses fail closed. Public SSR, private guards and existing content isolation checks also pass.
- No Identity accounts, passwords, permissions, DNS or provider credentials were reset. Real live email/password sign-in and the protected links still require a check after Netlify deploys. These local tests do not attest live DNS, OAuth-provider settings or certificate renewal.
