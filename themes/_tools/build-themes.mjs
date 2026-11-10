// Builds every SoraSpace tenant site theme from catalogue.mjs.
// Writes themes/<id>/theme.json, index.html (preview) and README.md, plus themes/manifest.json.
// Deterministic, offline, no network I/O. Run: node themes/_tools/build-themes.mjs
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { THEMES, FONT_STACKS, PAGE_TYPES, BASE_TEMPLATES, BATCHES } from './catalogue.mjs';

export const batchOf = n => (n <= 10 ? 1 : Math.ceil(n / 10));

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const esc = v => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const COLOUR_KEYS = ['bg', 'surface', 'text', 'muted', 'accent', 'onAccent', 'border', 'art1', 'art2', 'heroShade', 'heroText'];

export function themeJson(t) {
  const fill = mode => ({ heroShade: t.dark.bg, heroText: t.dark.text, ...mode });
  return {
    schemaVersion: 1,
    id: t.id,
    number: t.number,
    name: t.name,
    category: t.category,
    status: t.status ?? 'preview',
    description: t.description,
    suits: t.suits,
    baseTemplate: t.baseTemplate,
    purpose: t.purpose,
    recommendedVisibility: t.visibility ?? 'public',
    workgroupFriendly: !!t.workgroup,
    pages: t.pages,
    pageLabels: t.pageLabels ?? {},
    density: t.density ?? 'comfortable',
    colours: { light: fill(t.light), dark: fill(t.dark) },
    typography: {
      heading: t.font.heading,
      body: t.font.body,
      headingWeight: t.font.weight ?? 600,
      headingCase: t.font.case ?? 'none',
      headingTracking: t.font.tracking ?? 0,
      scale: t.font.scale ?? 1
    },
    shape: { radius: t.radius ?? 8, buttonRadius: t.buttonRadius ?? t.radius ?? 8 },
    layout: { maxWidth: t.width ?? 1180, header: t.header, hero: t.hero, home: t.sections },
    notes: t.notes ?? []
  };
}

function vars(c) {
  return COLOUR_KEYS.map(k => `--${k}:${c[k]}`).join(';');
}

function art(i, style = '') {
  return `<div class="art ${style}" style="--n:${i}" aria-hidden="true"></div>`;
}

function label(t, page) {
  return t.pageLabels[page] ?? PAGE_TYPES[page];
}

function section(t, s, sample) {
  const head = s.heading ? `<div class="sec-head"><span class="eyebrow">${esc(label(t, s.page ?? 'home'))}</span><h2>${esc(s.heading)}</h2></div>` : '';
  const items = sample.items ?? [];
  switch (s.type) {
    case 'intro':
      return `<section class="wrap intro">${head}<p class="lead">${esc(sample.intro)}</p></section>`;
    case 'cards':
      return `<section class="wrap">${head}<div class="cards cols-${s.columns ?? 3}">${items.slice(0, s.count ?? 3).map((it, i) => `<article class="card">${s.images === false ? '' : art(i)}<div class="body">${it.meta ? `<span class="meta">${esc(it.meta)}</span>` : ''}<h3>${esc(it.title)}</h3><p>${esc(it.text)}</p><span class="more">Read more →</span></div></article>`).join('')}</div></section>`;
    case 'list':
      return `<section class="wrap">${head}<ul class="list">${items.map(it => `<li><div><h3>${esc(it.title)}</h3><p>${esc(it.text)}</p></div>${it.meta ? `<span class="meta">${esc(it.meta)}</span>` : ''}</li>`).join('')}</ul></section>`;
    case 'feature': {
      const it = sample.featured ?? items[0];
      return `<section class="wrap">${head}<article class="feature">${art(0, 'tall')}<div class="body"><span class="meta">${esc(it.meta ?? '')}</span><h3>${esc(it.title)}</h3><p>${esc(it.text)}</p><span class="button">Read more</span></div></article></section>`;
    }
    case 'gallery':
      return `<section class="wrap">${head}<div class="gallery ${s.style ?? 'even'}">${Array.from({ length: s.count ?? 6 }, (_, i) => art(i, 'tile')).join('')}</div></section>`;
    case 'facts':
      return `<section class="wrap"><div class="facts">${(sample.facts ?? []).map(([k, v]) => `<div><span class="meta">${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('')}</div></section>`;
    case 'people':
      return `<section class="wrap">${head}<div class="people">${(sample.people ?? []).map(([n, r], i) => `<div class="person">${art(i, 'face')}<strong>${esc(n)}</strong><span class="meta">${esc(r)}</span></div>`).join('')}</div></section>`;
    case 'cta':
      return `<section class="wrap"><div class="cta"><h2>${esc(s.heading ?? 'Get in touch')}</h2>${s.text ? `<p>${esc(s.text)}</p>` : ''}<span class="button">${esc(s.button ?? 'Contact us')}</span></div></section>`;
    case 'contact':
      return `<section class="wrap contact">${head}<div class="contact-grid"><div><p>${esc(s.text ?? 'Send a message and we will reply as soon as we can.')}</p>${(sample.facts ?? []).slice(0, 2).map(([k, v]) => `<p><span class="meta">${esc(k)}</span><br>${esc(v)}</p>`).join('')}</div><div class="mock-form" aria-label="Contact form preview"><span>Name</span><span>Email</span><span class="area">Message</span><span class="button">Send message</span></div></div></section>`;
    default:
      throw new Error(`Unknown section type ${s.type} in ${t.id}`);
  }
}

function hero(t, sample) {
  const buttons = `<span class="button">${esc(sample.primary ?? 'Find out more')}</span>${sample.secondary ? ` <span class="button ghost">${esc(sample.secondary)}</span>` : ''}`;
  const copy = `<div class="hero-copy"><span class="eyebrow">${esc(sample.tagline)}</span><h1>${esc(sample.headline)}</h1><p>${esc(sample.subhead ?? '')}</p><div class="actions">${buttons}</div></div>`;
  switch (t.layout.hero) {
    case 'full-bleed': return `<section class="hero full-bleed">${art(0, 'bleed')}${copy}</section>`;
    case 'split': return `<section class="hero split wrap">${copy}${art(1, 'tall')}</section>`;
    case 'banner': return `<section class="hero banner"><div class="wrap">${copy}</div></section>`;
    case 'statement': return `<section class="hero statement wrap">${copy}</section>`;
    case 'text': return `<section class="hero text wrap">${copy}</section>`;
    default: throw new Error(`Unknown hero ${t.layout.hero} in ${t.id}`);
  }
}

function header(t, sample) {
  const nav = t.pages.map(p => `<span>${esc(label(t, p))}</span>`).join('');
  return `<header class="site-header ${t.layout.header}"><div class="wrap"><strong class="logo">${esc(sample.siteName)}</strong><nav aria-label="Site pages">${nav}</nav></div></header>`;
}

export function previewHtml(t, src) {
  const ty = t.typography;
  const hf = FONT_STACKS[ty.heading], bf = FONT_STACKS[ty.body];
  const css = `
:root{${vars(t.colours.light)};--radius:${t.shape.radius}px;--btn-radius:${t.shape.buttonRadius}px;--max:${t.layout.maxWidth}px;--scale:${ty.scale};--gap:${t.density === 'compact' ? 20 : 32}px;color-scheme:light dark}
@media (prefers-color-scheme:dark){:root{${vars(t.colours.dark)}}}
:root:has(#mode-light:checked){${vars(t.colours.light)};color-scheme:light}
:root:has(#mode-dark:checked){${vars(t.colours.dark)};color-scheme:dark}
@media (forced-colors:active){:root{--bg:Canvas;--surface:Canvas;--text:CanvasText;--muted:CanvasText;--accent:LinkText;--onAccent:Canvas;--border:CanvasText}}
*{box-sizing:border-box}html{background:var(--bg)}body{margin:0;background:var(--bg);color:var(--text);font:calc(17px*var(--scale))/1.6 ${bf}}
h1,h2,h3,.logo{font-family:${hf};font-weight:${ty.headingWeight};text-transform:${ty.headingCase};letter-spacing:${ty.headingTracking}em;line-height:1.12;margin:.2em 0 .4em}
h1{font-size:clamp(38px,5.6vw,${Math.round(72 * ty.scale)}px)}h2{font-size:clamp(28px,3.4vw,${Math.round(40 * ty.scale)}px)}h3{font-size:${Math.round(22 * ty.scale)}px}
p{max-width:68ch}.wrap{max-width:var(--max);margin:auto;padding:calc(var(--gap)*1.6) 5%}
.eyebrow,.meta{font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.button{display:inline-block;background:var(--accent);color:var(--onAccent);padding:11px 22px;border-radius:var(--btn-radius);font-weight:600}.button.ghost{background:transparent;color:inherit;border:1.5px solid currentColor}
.more{color:var(--accent);font-weight:600}
.preview-bar{position:sticky;top:0;z-index:5;display:flex;gap:14px;align-items:center;justify-content:center;flex-wrap:wrap;padding:8px;font:13px/1.4 system-ui,sans-serif;background:#1d1d1f;color:#f5f5f7}.preview-bar label{display:inline-flex;gap:5px;align-items:center}
.site-header{border-bottom:1px solid var(--border);background:var(--surface)}.site-header .wrap{display:flex;align-items:center;justify-content:space-between;gap:20px;padding-top:18px;padding-bottom:18px;flex-wrap:wrap}.logo{font-size:22px;margin:0}nav{display:flex;gap:22px;flex-wrap:wrap;font-size:15px}
.site-header.centered .wrap{flex-direction:column}.site-header.minimal{background:transparent;border:0}.site-header.bar{background:var(--accent);color:var(--onAccent);border:0}
.art{--a:var(--art1);--b:var(--art2);background:radial-gradient(circle at calc(20% + var(--n)*13%) 30%,color-mix(in srgb,var(--b) 70%,transparent),transparent 55%),linear-gradient(calc(120deg + var(--n)*40deg),var(--a),var(--b));border-radius:var(--radius);min-height:200px}
.art.tall{min-height:380px}.art.tile{min-height:0;aspect-ratio:1}.art.face{width:96px;height:96px;min-height:0;border-radius:50%}
.hero.full-bleed{position:relative;min-height:560px;display:flex;align-items:center}.hero.full-bleed .art{position:absolute;inset:0;border-radius:0}.hero.full-bleed .hero-copy{position:relative;margin-left:5%;max-width:620px;padding:36px;background:var(--heroShade);color:var(--heroText);border-radius:var(--radius)}.hero.full-bleed .eyebrow{color:inherit;opacity:.9}
.hero.split{display:grid;grid-template-columns:1.1fr 1fr;gap:calc(var(--gap)*1.5);align-items:center}
.hero.banner{background:var(--accent);color:var(--onAccent)}.hero.banner .eyebrow{color:inherit}.hero.banner .button{background:var(--onAccent);color:var(--accent)}
.hero.statement h1{font-size:clamp(46px,8vw,${Math.round(110 * ty.scale)}px);border-bottom:6px solid var(--accent);padding-bottom:.2em}
.hero.text{text-align:center}.hero.text p{margin-inline:auto}
.actions{margin-top:22px;display:flex;gap:12px;flex-wrap:wrap}.hero.text .actions{justify-content:center}
.sec-head{margin-bottom:22px}.lead{font-size:1.25em}
.cards{display:grid;gap:var(--gap)}.cols-2{grid-template-columns:repeat(2,1fr)}.cols-3{grid-template-columns:repeat(3,1fr)}.cols-4{grid-template-columns:repeat(4,1fr)}
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden}.card .art{border-radius:0}.card .body{padding:22px}
.list{list-style:none;margin:0;padding:0;border-top:1px solid var(--border)}.list li{display:flex;justify-content:space-between;gap:24px;padding:18px 0;border-bottom:1px solid var(--border)}.list h3{margin:0 0 4px}.list p{margin:0;color:var(--muted)}
.feature{display:grid;grid-template-columns:1.3fr 1fr;gap:var(--gap);align-items:center;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:var(--gap)}
.gallery{display:grid;gap:10px;grid-template-columns:repeat(3,1fr)}.gallery.wide{grid-template-columns:repeat(2,1fr)}.gallery.wide .tile{aspect-ratio:16/9}.gallery.masonry .tile:nth-child(3n+1){grid-row:span 2;aspect-ratio:auto}.gallery.strip{grid-template-columns:repeat(6,1fr)}
.facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:var(--gap);background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:var(--gap)}.facts strong{display:block;font-size:18px;margin-top:4px}
.people{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:var(--gap)}.person{display:flex;flex-direction:column;gap:6px}
.cta{background:var(--accent);color:var(--onAccent);border-radius:var(--radius);padding:calc(var(--gap)*1.5);text-align:center}.cta p{margin-inline:auto}.cta .button{background:var(--onAccent);color:var(--accent)}
.contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:var(--gap)}.mock-form{display:grid;gap:12px}.mock-form span:not(.button){display:block;padding:12px 14px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);color:var(--muted)}.mock-form .area{min-height:110px}.mock-form .button{justify-self:start}
footer{border-top:1px solid var(--border);color:var(--muted);font-size:14px}footer .wrap{padding-top:28px;padding-bottom:28px;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
@media (max-width:760px){.hero.split,.feature,.contact-grid,.cols-2,.cols-3,.cols-4{grid-template-columns:1fr}.gallery,.gallery.strip{grid-template-columns:repeat(2,1fr)}.list li{flex-direction:column;gap:6px}.hero.full-bleed .hero-copy{margin:0 5%}}
`.trim();
  const body = [header(t, src), `<main>${hero(t, src)}${t.layout.home.map(s => section(t, s, src)).join('')}</main>`,
    `<footer><div class="wrap"><span>© ${esc(src.siteName)}</span><span>Sample content · Theme: ${esc(t.name)}</span></div></footer>`].join('');
  return `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'">
<meta name="referrer" content="no-referrer">
<title>${esc(t.name)} · SoraSpace site theme preview</title>
<style>${css}</style>
</head>
<body>
<div class="preview-bar" role="region" aria-label="Theme preview controls"><strong>${esc(t.name)}</strong><span>Appearance:</span><label><input type="radio" name="mode" id="mode-system" checked> System</label><label><input type="radio" name="mode" id="mode-light"> Light</label><label><input type="radio" name="mode" id="mode-dark"> Dark</label><span>· Sample content only</span></div>
${body}
</body>
</html>
`;
}

export function readme(t, src) {
  const pages = t.pages.map(p => `- ${PAGE_TYPES[p]}${t.pageLabels[p] ? ` — shown as **${t.pageLabels[p]}**` : ''}`).join('\n');
  const sw = mode => COLOUR_KEYS.map(k => `| ${k} | \`${t.colours[mode][k]}\` |`).join('\n');
  return `# ${t.number}. ${t.name}

${t.description}

**Suits:** ${t.suits.join(', ')}
**Category:** ${t.category} · **Status:** ${t.status} · **Base layout:** ${BASE_TEMPLATES[t.baseTemplate]} (\`${t.baseTemplate}\`) · **Setup purpose:** \`${t.purpose}\`
**Recommended visibility:** ${t.recommendedVisibility} · **Workgroup friendly:** ${t.workgroupFriendly ? 'yes' : 'no'} · **Density:** ${t.density}

## Pages used

Only the existing SoraSpace page types are used. Labels are display names; the underlying page type is unchanged.

${pages}

## Layout

- Header: \`${t.layout.header}\` · Hero: \`${t.layout.hero}\` · Maximum width: ${t.layout.maxWidth}px
- Home sections, in order: ${t.layout.home.map(s => `\`${s.type}\`${s.page ? ` (${s.page})` : ''}`).join(', ')}
- Headings: ${t.typography.heading} stack, weight ${t.typography.headingWeight}${t.typography.headingCase !== 'none' ? `, ${t.typography.headingCase}` : ''} · Body: ${t.typography.body} stack · Corner radius: ${t.shape.radius}px

## Colours

Light and dark sets are both defined; System follows the visitor's device setting. Forced-colours (high contrast) mode falls back to system colours.

| Token | Light |
| --- | --- |
${sw('light')}

| Token | Dark |
| --- | --- |
${sw('dark')}
${t.notes.length ? `\n## Notes\n\n${t.notes.map(n => `- ${n}`).join('\n')}\n` : ''}
## Files

- \`theme.json\` — the theme definition (source of truth for the site manager)
- \`index.html\` — self-contained preview with sample content (“${src.siteName}” is fictional). Open it in a browser; use the bar at the top to switch System / Light / Dark.

Generated by \`themes/_tools/build-themes.mjs\` from \`themes/_tools/catalogue.mjs\`. Edit the catalogue, not these files.
`;
}

export async function build() {
  const manifest = {
    schemaVersion: 1,
    description: 'SoraSpace tenant site themes. Each entry has a folder containing theme.json (definition), index.html (preview only) and README.md.',
    stability: 'schemaVersion, theme ids and definition paths are stable. New fields may be added; existing ones are not renamed or removed within schemaVersion 1.',
    readyToImport: 'An entry with readyToImport true has passed the validity, contrast and security checks and a visual review in light and dark, and its theme.json may be imported.',
    batches: BATCHES,
    themes: []
  };
  for (const def of THEMES) {
    const t = themeJson(def);
    const dir = join(ROOT, t.id);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'theme.json'), JSON.stringify(t, null, 2) + '\n');
    await writeFile(join(dir, 'index.html'), previewHtml(t, def.sample));
    await writeFile(join(dir, 'README.md'), readme(t, def.sample));
    manifest.themes.push({ id: t.id, number: t.number, name: t.name, batch: batchOf(t.number), readyToImport: !!def.readyToImport, category: t.category, status: t.status, suits: t.suits, baseTemplate: t.baseTemplate, purpose: t.purpose, pages: t.pages, workgroupFriendly: t.workgroupFriendly, recommendedVisibility: t.recommendedVisibility, path: `themes/${t.id}/`, definition: `themes/${t.id}/theme.json`, preview: `themes/${t.id}/index.html` });
  }
  manifest.themes.sort((a, b) => a.number - b.number);
  await writeFile(join(ROOT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const m = await build();
  console.log(`Built ${m.themes.length} themes.`);
}
