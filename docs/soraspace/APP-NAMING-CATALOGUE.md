# SoraSpace paired app names

Owner clarification: app presentation should combine an English Sora-prefixed name with the corresponding Japanese name. Use **English name — Romanised name · Japanese text**, for example **SoraDocs — Fumi · 文**. English is the primary product label; show the Japanese pairing alongside it, preserving an appropriate language marker in the UI. Feature descriptions remain separate and localisable.

The six established names remain unchanged:

| ID | English name | Romanised name | Japanese |
| --- | --- | --- | --- |
| fumi | SoraDocs | Fumi | 文 |
| goban | SoraSheets | Goban | 碁盤 |
| tayori | SoraMail | Tayori | 便り |
| tsuzuri | SoraPDF | Tsuzuri | 綴り |
| hikari | SoraPhotos | Hikari | 光 |
| irodori | SoraImage | Irodori | 彩り |

The following **proposed** English names and Japanese display spellings complete the existing roadmap pairings. They implement the owner's naming pattern, not approval of final product names or release readiness:

| Stable ID | Proposed English name | Romanised name | Japanese | Capability |
| --- | --- | --- | --- | --- |
| akari | SoraSlides | Akari | 明かり | Presentations |
| sen | SoraDraw | Sen | 線 | Illustration |
| hanga | SoraLayout | Hanga | 版画 | Page layout |
| hinagata | SoraDesign | Hinagata | 雛形 | Interface design |
| kage | SoraVideo | Kage | 影 | Video |
| hibiki | SoraAudio | Hibiki | 響 | Audio and music |
| mai | SoraMotion | Mai | 舞 | Motion |
| takumi | SoraCAD | Takumi | 匠 | CAD |

`src/lib/app-presentation.mjs` remains the established six-app presentation registry. `src/lib/soraspace-upcoming-apps.mjs` supplies roadmap English/Japanese fields and a paired identity helper for public pages and the owner workspace's upcoming list. The existing `id` and romanised `name` fields remain stable; naming changes do not rewrite paths, storage IDs, app bridges, user content or vendor builds.

Apply the pairing to sales cards/directories, detailed pages, mockup headers, metadata and workspace listings. The Illustration/Page Layout detail routes remain `/tools/sen/` and `/tools/hanga/`. Capability names remain useful descriptions. Proposed names remain labelled provisional and all eight apps remain Planned. No final branding or packaging has been approved by a code edit.

Other SoraSpace modules retain their existing identities where a Japanese counterpart has not yet been defined; do not invent or claim approved translations silently. Complete those pairings and editorial review as their catalogue entries are developed. Native app branding/user-profile persistence and removal of inherited XCraft presentation remain separate APP-06/11 work in the maintainer handoff, not completed by changing web copy.
