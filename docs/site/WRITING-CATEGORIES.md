# Writing categories and weekly OSINT briefs

The initial Research & analysis filters are **All Writing | China Series | Cyber Briefs | OSINT Brief**. The category list is editable without a code deployment.

## Create or rename a category

1. Open **My Studio → Writing & photography → View all** (`/studio/content`).
2. Expand **Writing categories**. Enter a new name and choose **Add category**, or edit an existing name and choose **Save name**.
3. Open an article's editor and expand **Details → Writing category** to assign it. Use **New OSINT brief** for a weekly brief, or an existing writing creation link for another category.
4. Save a private draft, preview it, then publish when ready. Changing a draft's category does not change the public article until publication.

The public writing page and newly opened editors read the saved category list on their next load. An already open page must be reloaded to see changes. New empty categories are selectable and explain that no matching articles exist. Search works within the selected category. The compact filter row scrolls horizontally when needed on phones/tablets.

Renaming changes a display name while retaining a stable category ID. Existing assignments, article addresses and saved content are preserved. Category deletion is not included; there is no automatic bulk reassignment. Up to 30 categories are supported, with unique names of 1–60 characters. “All Writing” is reserved for the combined view.

## Data and permissions

`studio-writing-categories/registry` is a separate Netlify Blobs record. Only a freshly authorised site owner can create or rename categories. Writes require same-origin validation, the expected account ID and the current ETag; a concurrent or uncertain save requires reload. Public reads expose category names and IDs, never drafts or account records. The registry contains no storage credentials or app files.

Writing drafts may contain an optional `writingCategory` ID. Existing essays/cyber reports/OSINT briefs without one retain their previous category automatically. Unknown IDs are rejected on save. Non-writing collections do not acquire writing-category metadata. The existing content permissions, private draft snapshots and publish/unpublish rules remain enforced.

Weekly briefs have their own `osint` publication collection and `/osint-brief/<slug>` routes, using the existing rich editor, image permissions, RSS and tags. Other new display categories use the article's existing collection and URL; choosing a category does not move the article to a different archive path. Existing collection archives remain available. No article has been created or published in Claudia's live account as part of implementation.

Verification: `server/writing-categories.test.mjs`, the OSINT lifecycle case in `server/content.test.mjs`, `scripts/check-writing-filters.mjs`, login return-destination checks and packaged SSR tests. Browser checks use an isolated local Netlify Blobs instance and fixture publication data, not live content.
