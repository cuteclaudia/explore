# Magazine (`magazine`): uplift design

A monthly arts, ideas and local-life magazine front page in the newsprint tradition. A big
didone masthead, one strong lead story with a rail beside it, then the issue, a full-width photo
essay and an interview. Unlike Explore's single hero image, the page reads like a front page:
many stories, clear hierarchy, red category labels.

**References:** [content.html](content.html) · [empty.html](empty.html) · screens:
[desktop](screens/desktop-content.jpg), [phone](screens/phone-content.jpg),
[desktop empty](screens/desktop-empty.jpg), [phone empty](screens/phone-empty.jpg) ·
[photo credits](CREDITS.md). Feature IDs (F1–F18) are defined in [../../UPLIFT.md](../../UPLIFT.md).

## Page structure (home)

| # | Section | Content from | Desktop | Phone | Images (crop · focal) |
| --- | --- | --- | --- | --- | --- |
| 0 | Utility bar (F5) | Site settings | Dateline and issue left; Subscribe, Search right; 13 px | Dateline hidden; links centred | — |
| 1 | Masthead (F13) | Site name, tagline | Centred, didone 84 px (clamp 40–84), tagline 12 px capitals tracked 0.32 em; double rule above nav, single rule below | Masthead 40 px; nav scrolls sideways | — |
| 2 | Lead story grid (F6) | Stories: newest marked "Cover" | Lead 8/12: image, kicker, headline 56 px, italic serif standfirst 20 px, byline. Rail 4/12 with a left rule: two stories (16:9 thumb, headline 24 px, summary) and In brief | Lead full width; rail stories become rows (120 px square thumb + headline); In brief list follows | Lead 3:2 · 50 % 55 %; rail 16:9 (phone 1:1) |
| 3 | In brief (`latest-posts` widget, hero position) | News | Numbered 1–4 in accent didone, 3 px rule above heading | Same | — |
| 4 | This issue | Stories | 3 cards + Most read column (1.05 fr, left rule). One card can be a text-only Opinion card on the surface colour with an italic pull quote | 1 column; Most read after cards | 4:5 · focal per photo |
| 5 | Photo essay band (F7) | One story marked "Photo essay" | Full width 21:9, bottom gradient from `heroShade`, kicker, 52 px title, credit | 4:5 | 21:9 / 4:5 · 50 % 55 % |
| 6 | Interview (F8) | One story marked "Interview" | 5/12 portrait + 7/12 quote (italic didone 40 px), headline, summary, outline button | Stacked | 4:5 · 50 % 30 % |
| 7 | Newsletter (`cta`) | Site settings | Centred between double and single rules; email field + Subscribe | Same, field full width | — |
| 8 | Footer | About, contact, social | Masthead 30 px + about (2 fr), Sections, Contact, Follow; credits line (F17) | 2 columns, about full width | — |

## Type, colour, shape

- **Headings:** didone stack, 700. Fallbacks (Noto Serif Display, Playfair Display, Times) keep
  the high-contrast look where Didot isn't installed.
- **Body:** system sans, 16/1.6. Standfirsts and opinion quotes use the serif stack in italic (a
  deck style: part of F6/F8).
- **Labels:** 12 px bold capitals, 0.16 em, accent red.
- **Colour (light):** warm newsprint `#fbfaf7`, surface `#f1eee7`, ink `#141414`, muted
  `#57534d`, crimson accent `#b0102b`, rules `#ddd7cc`. Dark set unchanged.
- **Shape:** square corners everywhere (radius 0). Hierarchy comes from rules: 3 px solid or
  double over section heads, 1 px between items.
- **Width:** 1280 px.

## Navigation and responsive behaviour

- Sections nav: centred, 12 px capitals, 34 px gaps. The current section is in accent.
- Below 760 px: the masthead shrinks and the nav row scrolls sideways (F13, no hamburger);
  Subscribe stays in the utility bar.
- Below 980 px the issue grid becomes 2 columns, and 1 column below 760 px.

## Widgets

- **On:** `latest-posts` (In brief, in the lead grid rail), `social-links` (footer).
- **Suggested:** `upcoming-events` (after the issue), `photo-strip` (before the footer), `audio` (podcast edition).

## Empty site

Masthead with the tenant's name and only the enabled sections (Stories, News, About). Website
Manager shows placeholders for the lead story (3:2), two rail stories, In brief, three issue cards,
the photo essay band and the interview, each labelled with what goes there. Published: masthead,
nav, the About text in the footer, nothing else until the first story is published.

## Importer split

**Supported now (changed in `theme.json`):** palette above (light), `header: centered`,
`hero: statement`, home order `feature` (Cover story) → `list` (In brief) → `cards` (This issue,
3 columns) → `gallery` (`wide`, 1: photo essay) → `feature` (Interview) → `cta` (newsletter);
widgets on/suggested as above; radius 0; width 1280.

**New features needed:** F2, F3, F5 (dateline, issue), F6, F7, F8, F12, F13, F16 (sideways nav), F17.
Also needed: a way to mark a story as *Cover*, *Photo essay* or *Interview* (a story "slot" tag),
and a "Most read" column. The latter can wait; it falls back to a second In brief list.

## Stock photos

| File | Slot | Crop · focal |
| --- | --- | --- |
| cover-street | Lead story | 3:2 · 50 % 55 % |
| library-concrete | Rail story 1 | 16:9 · 50 % 40 % |
| cafe-reader | Rail story 2 | 16:9 · 50 % 50 % |
| pottery-hands | Issue card | 4:5 · 45 % 50 % |
| market | Issue card | 4:5 · 55 % 50 % |
| night-bus | Photo essay band | 21:9 (phone 4:5) · 50 % 55 % |
| portrait-window | Interview | 4:5 · 50 % 30 % |

**Offered as stock:** the street, architecture, café, market, pottery and night-bus photos, as
illustration for stories. **Reference only:** `portrait-window`: an interview needs a photo of the
person interviewed.
