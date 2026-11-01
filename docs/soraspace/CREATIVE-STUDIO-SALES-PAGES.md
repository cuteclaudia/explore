# Photography and Journal sales pages

Routes: `/tools/photography/` and `/tools/journal/`, built for both public marketing sources. Photography galleries now links directly from its splash group and hero shortcut. Journal has a separate directory entry in the creative/academic group; My writing retains `/tools/studio/`. Both new pages cross-link each other; Journal also links the separate SoraTrip sales page. The Studio information page links both. This is a marketing change, not a new app entitlement or customer rollout.

Ten original, static concepts use fictional records and purpose-made CSS landscape illustrations. None is described as an accepted app screenshot. All visual editing controls are inert spans/text; actual links navigate to existing public pages or local sections.

## Photography

Five concepts show:

1. Compact gallery library with eight dated records, whole-row-opening guidance, selection separated from opening and selected-gallery details.
2. Small thumbnails: eight sample photographs in four columns on wide screens. Every card stacks Caption → Image description → Tags, with a gallery-image action. Name sort preserves the saved order; rearrangement arrows are shown unavailable until Gallery order/search/grouping requirements are met.
3. Large thumbnails: six of those eight sample photographs in three columns on wide screens, with the same fields/actions. Both layouts reduce columns for tablets and become one readable column on phones.
4. Original/crop preview and explicit Apply/Cancel, with the previous stored image retained.
5. A private draft and separate approved reader snapshot, explicit publication review, and withdrawal/bin privacy explanations.

Copy preserves the qualified owner-pilot boundaries in [photo views](STUDIO-PHOTO-SORT-SEARCH-AND-GROUPING.md) and [publication](STUDIO-GALLERY-PUBLICATION.md). Search suggestions are local to the gallery; sorts include name, date added, stored size and gallery order; grouping is none/day/month/year. Date added is not capture date. Layout/sort/group preferences persist per gallery/account on this browser after logout, while search text is not retained and cross-device sync is not claimed. The restricted display-image workflow is not RAW/original archival backup. Hosted owner acceptance, customer/workgroup access and production rollout remain separate.

## Journal

Five concepts show:

1. Personal Journal library with ten entry records, dates, summaries, tags, private/published states and a selected-entry inspector. Wording focuses on everyday moments and memories, rather than copying the essay/article description.
2. Entry editor with date/tags, private save state, familiar formatting, a photograph/caption, Save/Save As and a clear return to Journal entries.
3. English original beside a human-authored French review, including the same illustration and translated caption. This sample is explicitly not a machine result or proof of language quality. The copy describes the restricted editable review, formatted comparison, separate saved language reviews/history and supported on-device checks/consent; it does not promise general access or translated publication.
4. Planned optional Journal/SoraTrip/gallery links, with the original entry kept in Journal and itinerary in the separate SoraTrip app. Public stories do not silently expose booking references, private travel documents or precise future locations.
5. Private drafts, explicit per-entry publication and sharing review, later edits kept private and a route back from Sharing settings. Named journals, sub-journals and journal-level privacy ceilings remain planned, rather than implied by the existing collection filter.

Current source behaviour is documented in [Journal owner testing](JOURNAL-OWNER-TEST.md) and [translation media reviews](STUDIO-TRANSLATION-MEDIA.md). These sales pages do not alter their operational gates, save data, translate text, upload images or publish any content.

## Local acceptance and remaining work

`node scripts/check-creative-sales.mjs` validates both builds, navigation from the two splash groups, ten concepts, 4/3 desktop thumbnail columns, identical field order, compact libraries, independent Journal wording, trip/translation/privacy labels, local table scrolling, French/Japanese overviews and anchors, 320/390/768/1366px layouts, contrast in light/dark appearance and absence of live actions/network requests. Internal captures are under `/workspace/reviews/creative-sales/` (small/large desktop, Journal library/translation desktop and phone library/editor).

Overview copy has 16-language catalogue coverage; detailed fictional concepts are explicitly labelled English. Native-language editorial review remains open. Metadata/sitemap coverage is 224 locale routes. The directory now lists 33 app/module entries because Journal is separately discoverable: eight detailed sales pages, six basic previews, 19 guide-only gaps. This is not a count of separately priced subscriptions. The remaining creative apps are the next dedicated-page priorities. MKT-01/02 remain Partial, and no operational research/shop/trip/Studio release task is completed by these mockups.
