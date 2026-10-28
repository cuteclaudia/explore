# Remaining live domain and renewal checks

The user supplied screenshots of DNS changes and a Let's Encrypt certificate covering both `claudiagilbert.com` and `www.claudiagilbert.com`. The certificate showed an expiry of 26 January 2027. The user reports that the new site works at the root domain; later login screenshots/URLs also show the site on `www`. Netlify's HTTPS panel nevertheless warned that `www` did not appear to be served by Netlify and automatic renewal was not assured. That warning has **not** been shown cleared.

Expected website DNS from Netlify's instructions and the user's saved Squarespace screenshot:

| Host | Type | Target |
| --- | --- | --- |
| `@` | A | `75.2.60.5` |
| `www` | CNAME | `explorebyclaudia.netlify.app` |

The Microsoft 365 autodiscover/DKIM/MX/SPF/verification records were retained in the supplied screenshot. Domain registration, mail, nameservers and subscriptions were not changed by Codex. Root-domain browser success alone does not establish `www` renewal readiness.

## Once propagation has settled

1. Refresh Netlify Domain management → HTTPS. Confirm the certificate still covers both names, the warning clears and the intended `www` primary-domain setting can be saved. Do not replace/delete a working managed certificate merely to dismiss a warning.
2. Check both `https://claudiagilbert.com` and `https://www.claudiagilbert.com` in a fresh browser window. Both should reach the same site without certificate warnings; the root should redirect to `www` once that is primary.
3. If Netlify still warns, inspect public/authoritative DNS for the exact CNAME and root A record, conflicting old website A/AAAA/HTTPS records and CAA restrictions. An AAAA answer reached through the Netlify CNAME is not automatically a conflict. Preserve email records; do not blindly delete records just because they are unfamiliar.

Optional read-only Windows PowerShell checks (no account credentials):

```powershell
Resolve-DnsName www.claudiagilbert.com -Type CNAME -Server 1.1.1.1
Resolve-DnsName www.claudiagilbert.com -Type CNAME -Server 8.8.8.8
Resolve-DnsName claudiagilbert.com -Type A -Server 1.1.1.1
Resolve-DnsName claudiagilbert.com -Type AAAA -Server 1.1.1.1
curl.exe -I https://www.claudiagilbert.com
curl.exe -I https://claudiagilbert.com
```

Use Netlify's displayed DNS verification/renewal controls where available. If correct public DNS/HTTPS persist while its warning remains, provide Netlify support the exact domains, DNS results, certificate timestamps and warning. Do not share Identity tokens, client secrets or private account cookies.

This environment's system DNS, HTTPS requests and public DNS-over-HTTPS requests all failed or were refused by the network proxy. No independent live verification of DNS propagation, Netlify response headers, certificate chain or automatic renewal is claimed.

## Other domain-move work still open

Verify Google Drive's production callback in Google and Netlify, Identity invitation/recovery links, owner/member sign-in, forms, email and app approved-origin behavior on `www`. Preserve the twelve source images still on Squarespace and check saved Studio content before cancelling the Squarespace website subscription. The source image requests are currently blocked here; the migration inventory and full cutover/rollback plan remain in this directory. Keep the existing Netlify project, Identity IDs and storage encryption key.
