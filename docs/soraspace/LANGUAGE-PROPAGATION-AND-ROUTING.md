# Language routing and app preference · 30 October 2026

## Fixed in the website

The static bootstrap previously recognised locale URL prefixes using exact casing. With a lowercased path such as `/pt-pt/`, it treated the prefix as content and could prepend `/pt-PT/`, producing `/pt-PT/pt-pt/`. Locale matching is now case-insensitive; old duplicate prefixes are stripped when recovering the URL. The public 404 page includes the same hash-authorised bootstrap so an already-broken link can recover. Query strings and fragment destinations are preserved. Locale identities and BCP-47 tags still distinguish simplified/traditional Chinese and European Portuguese.

Workspace home and saved-file pages now mark headings, app descriptions, placeholders, controls, roadmap/status text and file counts for translation in all 16 offered languages. File names, brand/Japanese companion names and user documents stay unchanged. Dates use the selected locale. These are first-pass translations and still need native-speaker review. This is expanded workspace coverage, not a claim that every administrator page or native app is fully translated.

## App contract available to Claude

The effective website locale is passed as a validated `lang` query parameter on app launches and iframe URLs. The local sandbox bridge exposes:

```js
window.SoraSpaceUI = Object.freeze({
  version: 1,
  language: 'fr',
  fallbackLanguage: 'en'
});
```

It also sets the iframe document's language metadata and dispatches `soraspace:languagechange` with this object as event detail. The initial value is available before the native bootstrap starts; the parent may update it after browser/device preferences resolve. React to updates as well as reading it initially. This preference does not translate document content.

Separately hosted apps receive `lang` in their launch URL, optional `uiLanguage` and `fallbackLanguage` fields in the existing welcome handshake, and subsequent messages of shape `{type:'soraspace:language',language:'fr',fallbackLanguage:'en'}`. Apps must validate the known parent origin/source and existing authorised launch context before using a message. This is an additive UI preference, not new storage permission or a replacement for the bridge's account/launch validation.

Each app must choose from its **actually implemented** locale resources, matching script/region where appropriate. Preserve Chinese script distinctions and do not silently substitute Brazilian for European Portuguese. When unavailable, use the supported English fallback and offer the app's own language control where appropriate. No support matrix is fabricated by the website; currently shipped native builds are not certified to honour this new hint yet.

Changing language updates the host interface and sends the preference without reloading a native editor or opening another tab. The app must apply a supported change safely in place, or tell the user if its implementation needs a restart. Never discard an open document to change language. File-opening intent remains separate from locale-only navigation.

## Validation

Server tests include case-normalised and duplicate prefixes. Public browser checks cover lowercased Portuguese/Chinese paths, 404 recovery, all locale pages/previews, query/hash retention and the exact CSP/script-integrity policy. Workspace checks cover all 16 languages at 320/768/1366 px, unchanged user filenames, translated empty states/counts, outgoing locale and live sandbox preference changes with the open-document sentinel preserved. Identity/files are fixtures; native translation quality/availability needs app-side acceptance.
