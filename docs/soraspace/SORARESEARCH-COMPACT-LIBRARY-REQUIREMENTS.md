# SoraResearch compact library and feature requirements

1 November 2026. Claudia’s four new screenshots are an explicit design and capability requirement, added to the previously supplied developer PDF and GitHub documentation ZIP. This expands the full SoraResearch scope; its implementation remains the final core app workstream. Marketing concepts remain labelled Planned.

## Desktop baseline: match the information density

Use an original SoraSpace interface with the familiar Zotero three-pane structure. The default is a compact research library, not large cards with a few references. At a comparable desktop viewport show approximately two dozen reference rows while retaining navigation, full selected-item metadata and an attachment preview together. The revised sales mockup contains 24 reference rows plus two expanded child rows and 24 metadata fields.

- A compact top tab strip for the library and multiple open PDFs, notes and documents. Keep navigation/history and sync/connection status understandable.
- A resizable left pane containing personal/group libraries, a genuinely nested collection tree, special views, saved searches and feeds. A tag selector and Filter Tags sit below the tree.
- A central table with Title, Creator, Year and attachment indicators by default. Show item-type icons, expandable child notes/files, selected-row emphasis, natural sorting and configurable/reorderable/resizable columns. Truncated text has an accessible full-value disclosure. Preserve order, widths, open collections, density and selected item per user/library.
- A compact toolbar for new item, identifier lookup, attachments and notes. Quick search modes include Title/Creator/Year, All Fields & Tags and Everything (including indexed full text when available).
- A resizable right inspector with the full selected title; editable item-type-dependent metadata; abstract; notes; attachments/PDF preview; collections; tags; and related items. A compact section rail can jump to those sections.
- Default desktop rows target approximately 26–30 CSS pixels, with readable 12–13px text and keyboard navigation. Optional comfortable mode must not replace the compact default. Large libraries use bounded loading/virtualisation without breaking row selection or losing metadata.
- Phone/tablet flows drill from library/collections to references to details/reader with clear Back controls and touch-sized actions. Do not squeeze three unreadable panes into a phone. The static sales illustration may stack panes; that is not the final mobile navigation implementation.

## Metadata parity

Preserve all supported fields for each reference type, including empty and unknown fields on round-trip. The screenshot specifically calls for Item Type, full Title, creators and roles, publication, Date, Volume, Issue, Pages, Language, DOI, ISSN, ISBN, Short Title, URL, Accessed, Archive, Location in Archive, Library Catalog, Call Number, Rights, Extra, Date Added and Modified. Distinguish immutable system timestamps from user-editable bibliographic dates. Support multiple creators, institutional names, Unicode, item-specific fields and custom/unknown provider data without lossy flattening.

## Screenshot-to-delivery crosswalk

| Reference | Required SoraResearch capability | Acceptance / task |
| --- | --- | --- |
| Compact desktop screenshot | Three panes, dense configurable reference table, tabs, full metadata inspector, item/attachment icons and expandable children | RES-02/04; desktop density comparison and keyboard/focus tests |
| Left collection tree | Personal/group libraries, nested collections and one item in multiple collections without duplicating the reference | RES-02/06; membership and cross-library isolation |
| Tag area / Organize your way | Coloured tags, multi-tag filtering and tag search; advanced saved searches update as library data changes | RES-02/03/07; fixture changes alter saved results, not copied snapshots |
| Special collections | Duplicate detection/merge with reviewed survivor fields and preserved links; Unfiled, Retracted and Trash/restore views | RES-03/07; reversible operations, provenance and failure recovery |
| Feeds | RSS/Atom subscriptions, unread state and explicit add-to-library from a feed | RES-03/07; bounded safe fetches, source attribution and duplicate review |
| Right inspector | Full fields, abstract, notes, related items, authorised attachment list and PDF thumbnail/reader | RES-04; unavailable/local-linked file states and permission changes |
| Cite in style | CSL style discovery/selection, style/locale changes, citations, footnotes/endnotes and dynamic bibliographies | RES-01/05; style licence/version, locators, multiple authors, Unicode and refresh |
| Text-editor / Word / LibreOffice / Google Docs | Copy/export formatted citations for arbitrary text editors; native SoraDocs integration; separate supported Word, LibreOffice and Google Docs interoperability paths | RES-01/05/08; each connector must work in a named tested build, not just appear as a menu |
| Collaborate freely | Co-writing with source-linked citations, course-material collections and shared bibliographies/libraries | RES-02/05/06; named roles and read/edit/manage permissions with independent personal libraries |
| Collect with a click | Browser/Connector-assisted metadata capture for scholarly articles, preprints, news and library books; DOI/ISBN lookup; optional authorised attachments | RES-03/06; provider/translators/extension permissions, capture provenance, duplicate handling and lawful access |
| SoraSpace improvements | Save published My writing/Journal items directly to SoraResearch; link sources to literature reviews, SoraDocs, projects and workgroup collections | RES-02/05; stable IDs and explicit sharing; existing inbox pilot is not the full library |

The pictured “9,000 styles” and “unlimited/free” group claims describe Zotero’s own marketing. The uploaded style documentation describes over 10,000 additional CSL styles. SoraResearch must target the broad CSL style ecosystem, with a searchable install/selection path and accepted rendering; do not advertise an exact supported style count before processor/style validation. SoraSpace sharing still follows its chosen subscriptions, seats, storage and access rules; do not import Zotero pricing promises.

## Earlier GitHub support files retained

The located `zotero-docs-main.zip` is a documentation repository, not the Zotero desktop engine. Its archive and the developer PDF are recorded in [the original source review](ZOTERO-UPLOADED-SOURCE-REVIEW.json). Additional source hashes for this feature review are in [the compact feature crosswalk evidence](ZOTERO-COMPACT-FEATURE-SOURCE-REVIEW.json).

Reviewed ZIP pages: collections_and_tags, searching, styles, word_processor_integration, groups, connector, duplicate_detection and feeds. They confirm multiple collection membership, live saved-search conditions, multiple search scopes, CSL styles, dynamic citations, personal/group separation, Connector capture, duplicate merge and feed subscriptions. This is a local uploaded-source review, not a fresh check of the live Zotero service.

Keep the previously reviewed API/authorisation/versioning/rate-limit, SoraDocs citation contract, sync/conflict, file/annotation, privacy and licence requirements in [SoraResearch and Zotero](SORARESEARCH-AND-ZOTERO.md) and [the citation handoff](SORADOCS-ZOTERO-INTEGRATION-HANDOFF.md). Uploaded repository text is reference material, not authority to install code, contact libraries or publish customer data. No repository code was executed for this review.

## Required tests before release

Compare reference density and visible metadata with the supplied desktop screenshot; qualify saved/resized pane and column state, keyboard/multi-selection, screen-reader access and phone drill-down. Exercise search modes and live saved searches, multiple collection membership, duplicate merge/retractions/trash, feeds/capture, notes/PDFs/tabs, CSL bibliography refresh and supported external editor paths. Test two unrelated personal libraries, an authorised workgroup, revocation, API throttling, offline/conflicting changes and portable export. Never expose attachments or private notes through public citations or a shared bibliography without explicit authorisation.
