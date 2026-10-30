# Startup improvements · 30 October 2026

The website can improve waiting/restoration without rebuilding the native apps. It cannot make a large engine instant or replace the separately hosted SoraImage deployment through an Explore deploy.

## Website update

Docs, PDF, Photos and the previous image editor now show a dismissible startup strip. A delay alone produces informational copy, never a claim that files failed. The generated page titles and loader errors use Sora names; the legacy image editor's timed notice also has neutral wording. The handwritten Photos bootstrap now emits the same startup event after WASM initialisation and its native start call. The strip closes on the embedded editor's native startup event plus removal of its loading element and a present, sized canvas. An iframe load event or a file bridge handshake is not treated as editor-ready. This signal establishes startup, not completion of a particular file's rendering or import.

Saved-file delivery uses the same signal. It no longer sends a file merely because the canvas resized, nor abandons it after 45 seconds. The file waits up to three minutes, then shows retry guidance while leaving the editor running. A newer open request replaces the pending one; changing bridge session drops the old pending bytes. No file is persisted by this change and there is no autosave claim.

The website's SoraImage error/help messages use its Sora name; its stable app ID and bridge protocol stay unchanged. The externally hosted native app still controls its own loading display.

## Separate SoraImage loading-copy package

Run:

```sh
node scripts/prepare-irodori-test.mjs VERIFIED_0.16.1_ARCHIVE OUTPUT_DIRECTORY --friendly-loader
```

This opt-in mode checks the pinned supplied archive and expected HTML markup, then changes only the HTML title/loading copy. Every JavaScript, WASM, compressed part, bridge, licence and security header stays byte-for-byte the same as the prepared 0.16.1 package. It leaves the original preparation folder untouched and changes no recovery/storage capability. The default preparation mode still preserves all supplied app bytes.

Prepared artifact: `/workspace/SoraImage-0.16.1-friendly-loading.zip`; verification record beside it. Local comparison verified that only `index.html` differs from the previously prepared 0.16.1 folder. This is a packaging correction, not a new native release or security certification.

Claudia prefers to leave this with Claude when credit resumes on **2 November 2026 at 5:00 pm Sydney time**. No upload is needed from Claudia now. The following steps are retained for the later app handoff:

To deploy it later:

1. Open the **separate Netlify project already hosting SoraImage/Irodori**, identified by Explore's `IRODORI_PREVIEW_ORIGIN`. Do not upload it to Explore or `soraspacestudio`.
2. Upload the complete ZIP/folder as a replacement deploy. Keep all files together; do not mix releases or upload only the HTML.
3. After publishing, open SoraImage from SoraSpace. Check the new loading title, a real image import/edit/export, and account-change teardown. Keep the previous Netlify deployment for rollback. No DNS or environment-variable change is needed.

The website controller and actual local 0.16.1 engine passed CSP, WebGL2 rendering, fullscreen/save-help and permission/logout teardown checks with simulated session responses. This does not verify a live Netlify deploy, physical device performance, cloud sync or autosave.

## HobbyNest verification

Local isolated checks exercise catalogue/detail pages, images, stock/colours, packed dimensions, independent physical/digital switches and owner test-basket quotes at phone/tablet/desktop sizes. These use fixture products/storage only. Real payments remain disabled; no live products, stock or customer records are changed.

## Validation

The real local Docs, PDF, Photos and legacy Image WASM engines were launched with the new bridge in Chromium. Each removed its native loader and closed the parent startup strip. These local runs are not production speed benchmarks. A simulated slow engine separately proved that a resized canvas or WASM event alone does not deliver a queued file, that the file survives 45 seconds of waiting, and that the three-minute bound/dismiss control works.
