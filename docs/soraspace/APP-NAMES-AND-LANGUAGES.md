# App names and multilingual interface — 30 October 2026

## Display names

| Website name | Japanese name | Existing app ID |
| --- | --- | --- |
| SoraDocs | Fumi · 文 | fumi |
| SoraPDF | Tsuzuri · 綴り | tsuzuri |
| SoraPhotos | Hikari · 光 | hikari |
| SoraImage | Irodori · 彩り | irodori |
| SoraMail | Tayori · 便り | tayori |
| SoraSheets | Goban · 碁盤 | goban |

Japanese names appear as smaller companion text beside the main title, wrapping when necessary on narrow screens. The public catalogue, detail pages, workspace app tiles and launcher use these names. Public previews cover the four current browser app types. Mail and Sheets retain their desktop-only availability; naming does not imply a new browser build.

This is website presentation. App IDs, capability keys, bridge messages, cloud folders, storage keys, existing files, repository URLs and installer filenames are unchanged. Claude's native app builds still need the corresponding branding/menu changes; do not replace identifiers in binaries or migrations.

## Languages and implemented coverage

English plus Japanese (`ja`), Traditional Chinese (`zh-Hant`), Simplified Chinese (`zh-Hans`), Korean (`ko`), French (`fr`), German (`de`) and European Portuguese (`pt-PT`). Chinese scripts and Portuguese region are separate explicit choices.

- **SoraSpace public landing:** translated visible marketing copy, templates/descriptions, pricing/availability explanations, metadata, native HTML language picker, canonical URLs, reciprocal language links and sitemap entries. English remains `/`; the seven translations have their own paths, e.g. `/ja/` and `/pt-PT/`. No JavaScript, translation API or additional hosting project is required.
- **Explore shared interface:** language selector, main navigation, marked account-menu/footer labels and selected signup/login controls. This is partial interface coverage; page bodies, detailed settings and admin tools are not fully translated yet.
- **SoraSpace workspace:** common sidebar labels, search placeholder, selected dashboard controls and a persisted language choice. Detailed dashboard paragraphs, errors and editor controls still include English.
- **HobbyNest:** shared language choice and marked navigation/preview labels. Product descriptions, checkout/fulfilment language and most shop/admin copy remain a further pass.
- **Auth continuity:** allowed language query values survive protected-page sign-in redirects and allowed return destinations; existing destination allowlists remain in force. Local preference is non-sensitive browser storage, not account entitlement.

These are first-pass product translations, not independently certified/native-speaker-reviewed copy. Arrange language review before promising fully localized paid service, particularly account, payment, cancellation and privacy text.

## Content safety

`src/lib/locales/public-copy.mjs` is the explicit translation catalogue. `data-i18n` marks approved interface labels; unknown strings fall back to English. The controller never walks arbitrary page text and never sends files or text to a translation provider. Content inside `[data-user-content]`, editable fields, textareas and app frames is excluded. App brand names and Japanese companion names stay fixed across languages.

Authored articles, private documents, filenames, research sources and customer product descriptions remain in their original language. Future translated content needs explicit author-created versions, language metadata, translation relationships and review; changing the UI language must not silently rewrite published articles.

## Remaining rollout

1. Translate remaining workspace, site-setup/editor, settings, research/explore controls, errors and shop/admin strings using explicit keys. Add screen-reader labels alongside visible labels.
2. Add reviewed signup/approval/recovery messages and consistent language-aware email templates. Preserve provider error details safely without misleading translations.
3. Add author-controlled language/translation variants for posts, products and customer sites; keep private and public content boundaries intact. Do not publish duplicate-language URLs for untranslated content.
4. Coordinate native app branding, menu translations and locale messages with Claude. Web wrappers cannot translate an app iframe's internals.
5. Review legal/billing/support copy and language-specific formatting, dates, numbers, currencies and addresses. UI language must not change AUD prices or tax/shipping country.
6. Complete keyboard/screen-reader and native-language review for every locale, including unavailable/expired-account and payment flows before launch.

## Validation

`server/interface-locales.test.mjs`, `scripts/check-interface-languages.mjs` and expanded `scripts/check-soraspace-landing.mjs` check language allowlists, locale routes/metadata, eight choices, branding/kanji, no-script public pages, 320/768/1366px layouts, preserved auth destinations and private-content exclusion. Login recovery and production SSR packaging checks remain required when redirect handling changes.

Deploy through the existing `cuteclaudia/explore` main branch. Public Netlify base stays `sites/soraspace`; Explore stays at the repository root. No environment variables or DNS changes are required for names or languages. Signup's existing separate enablement and identity settings are unchanged.

## Expanded splash overview

The opening tool panel also links to website templates for blogging/journals and photography galleries, plus the planned research and Projects sections. Research management explicitly covers sources, notes, citations, bibliographies and Zotero compatibility; Projects includes the requested staged jobs/time/alterations/rates/invoices/payments direction.

Eight additional app families are shown publicly as in development: Akari (presentations), Sen (illustration), Hanga (page layout), Hinagata (UI design), Kage (video), Hibiki (audio), Mai (motion) and Takumi (CAD). The inventory is shared with the owner's workspace roadmap in `src/lib/soraspace-upcoming-apps.mjs`. These working names are retained until their Sora branding is agreed; the entries have no launch links, capabilities or published release dates.
