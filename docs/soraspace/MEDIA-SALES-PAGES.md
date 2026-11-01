# Video and audio sales pages

SoraVideo — Kage · 影 (`/tools/kage/`) and SoraAudio — Hibiki · 響 (`/tools/hibiki/`) now have separate detailed pages in both marketing sources. Both are Planned apps with proposed names. The latest-preview strip, fourteen-card discovery gallery, 33-module directory and shared creative guide link to them.

## App-specific concepts

SoraVideo has five original static concepts: media bin/monitor/timeline/inspector; compact source library; titles and caption timing; separate ambience bed; and output review. Three video clips span 0–8, 8–18 and 18–30 seconds with hard cuts. Their source lengths are 12/14/15 seconds; the selected first clip uses source 2–10 seconds. The title spans 0–4 seconds and a fourth media source provides the full 30-second sound bed. At 25 fps the 1920 × 1080 sequence has 750 frames. Timeline widths and ruler positions reflect the example durations. Source sound is excluded. Waveforms and the picture are original CSS illustrations, not decoded media. Captions are manual sample cues, not an automatic transcription claim.

SoraAudio has five concepts: three-track session; compact take library; four-channel mixer including master; three timed edit sections; and stereo/separate-track output review. Narration take 02 uses source 1–25 seconds from a 26-second take; the 24-second piano source is complete; room tone uses 3–27 seconds from a 30-second source. All three session tracks start at zero and end at 24 seconds. Narration take 01 remains unused. Track gain settings match the mixer. The PCM WAV example is 24 s × 48,000 samples/s × 2 channels × 3 bytes = 6,912,000 data bytes before headers; no file is encoded. Peak/loudness are Not measured and transport is Stopped.

Compact source libraries, inspectors and shell styling follow SoraSpace. The media canvases retain usable space; phone layouts stack inspectors and keep timeline/table scrolling local. All waveform heights, faders and clip widths use classes so the existing policy does not need inline-style permission. No audio/video element, microphone request, engine, provider, save, autosave, render, playback or upload is mounted. Representative files, codecs, fonts, colour, signal processing, accessibility and host integration require separate acceptance. Detailed English concepts are labelled; four overview strings have 16-language coverage pending editorial review.

## Validation and next steps

`check-media-sales.mjs` checks both pages from the splash, ten concepts, duration continuity, visual clip ratios, nonzero waveform bars under the real content policy, source/track counts, PCM arithmetic, stopped/unmeasured/output states, 320–1366px layouts, light/dark contrast, forced colours, French/Japanese metadata/navigation and absence of inline styles/media controls/foreign requests. Captures live in `/workspace/reviews/media-sales/`.

Current coverage: 14 detailed pages, six basic previews and 13 guide-only gaps, across 33 modules and 352 public locale routes. MKT-01 stays Partial. Next are SoraMotion — Mai · 舞 and SoraCAD — Takumi · 匠, then useful business/shared-service detail pages. All eight roadmap names remain provisional. Pushed source does not establish deployed availability or a released app.
