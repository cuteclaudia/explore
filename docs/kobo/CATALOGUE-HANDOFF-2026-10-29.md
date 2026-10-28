# Six-app catalogue and HobbyNest follow-up

29 October 2026 (Sydney).

## Apps

- Public `/kobo` now lists Hikari, Irodori, Fumi, Tsuzuri, Tayori and Goban with the supplied icons. Each has a public `/kobo/<name>` product page, honest testing/development/platform status, desktop privacy link and My apps link. No public installers or Store URLs were invented. Screenshots await accepted binaries.
- A separate desktop catalogue adds Tayori/Goban to private My apps/Studio and the owner's installer settings (18 app/platform rows). Existing web-engine registry, iframe origins and storage operations are unchanged. `/apps/tayori` and `/apps/goban` remain 404.
- New `desktop.tayori` / `desktop.goban` capabilities are false for existing non-owner accounts until explicitly granted. Owner access stays protected. The app-by-platform editor offers desktop only for those two; Power is an explicit preset action, not a migration of existing accounts. Student and Worker remain Fumi/Tsuzuri.
- All installer URLs stay empty unless Claudia configures them after accepting a published release. No GitHub drafts, Microsoft products or native licence mechanisms were changed.
- macOS stays Planned. App product pages do not expose private web launch access through their public descriptions.
- `SUBSCRIPTION-ENTITLEMENTS-DESIGN.md` updates the proposed six-app/manual-versus-automatic model. Billing and licence enforcement are **not delivered** by that design document.

## HobbyNest

Claudia chose physical products and downloadable STL files, a branded subdomain linked from Explore, and possible standalone domain later. `/hobbynest` is an independently branded, noindex design preview; `/3d-printing` links to it and remains the process/portfolio introduction. The preview is excluded from the sitemap. It has no products, cart, payments, order collection or signup form.

`docs/hobbynest/STORE-PLAN.md` recommends assessing a managed Shopify store plus supported private digital delivery, with an intended hostname `hobbynest.claudiagilbert.com`. No platform account, DNS change, fee, provider integration or checkout was created. Confirm current platform capabilities and fees directly; this workspace cannot freshly retrieve provider sites. The plan covers real product information, STL licensing, mixed carts, shipping/tax, verified fulfilment, privacy/returns and a later domain move. Explore accounts, app subscriptions and HobbyNest purchases must remain distinct unless explicitly linked through a tested design.

## Evidence

190 server tests passed. New tests exercise desktop-only member admission/download authorization, absent web capabilities, six-app settings and configured-platform filtering. Browser fixtures exercise real catalogue/product/Studio/owner pages, permission presets and installer saving at 320, 390, 768, 1024 and 1440px (65 rendered route/width combinations). Existing public menu/page tests pass at six widths; desktop-menu tests pass too. These use local fixture identities/settings, not changes to live accounts. Production build and isolated packaged authentication/content checks passed before pushing. Physical device and real installer/Store acceptance remain separate.
