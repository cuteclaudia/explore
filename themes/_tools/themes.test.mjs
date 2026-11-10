// Checks every theme: catalogue validity, colour contrast, generated files current, and no scripts or outside requests.
// Run: node --test themes/_tools/themes.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { THEMES, PAGE_TYPES, BASE_TEMPLATES, PURPOSES, HEROES, HEADERS, SECTION_TYPES, FONT_STACKS } from './catalogue.mjs';
import { themeJson, previewHtml, readme } from './build-themes.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function luminance(hex) {
  const n = hex.replace('#', '');
  return [0, 2, 4].map(i => parseInt(n.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((s, c, i) => s + c * [0.2126, 0.7152, 0.0722][i], 0);
}
export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

test('catalogue entries are valid', () => {
  const ids = new Set(), numbers = new Set();
  for (const def of THEMES) {
    const t = themeJson(def);
    assert.match(t.id, /^[a-z0-9]+(-[a-z0-9]+)*$/, t.id);
    assert.ok(!ids.has(t.id), `duplicate id ${t.id}`); ids.add(t.id);
    assert.ok(!numbers.has(t.number), `duplicate number ${t.number}`); numbers.add(t.number);
    assert.ok(Object.hasOwn(BASE_TEMPLATES, t.baseTemplate), `${t.id} base template`);
    assert.ok(PURPOSES.includes(t.purpose), `${t.id} purpose`);
    assert.ok(HEROES.includes(t.layout.hero) && HEADERS.includes(t.layout.header), `${t.id} layout`);
    assert.ok(['public', 'private'].includes(t.recommendedVisibility), `${t.id} visibility`);
    assert.ok(t.pages.includes('home') && t.pages.every(p => Object.hasOwn(PAGE_TYPES, p)) && new Set(t.pages).size === t.pages.length, `${t.id} pages`);
    assert.ok(Object.keys(t.pageLabels).every(p => t.pages.includes(p)), `${t.id} labels refer to used pages`);
    assert.ok(Object.hasOwn(FONT_STACKS, t.typography.heading) && Object.hasOwn(FONT_STACKS, t.typography.body), `${t.id} fonts`);
    for (const s of t.layout.home) {
      assert.ok(SECTION_TYPES.includes(s.type), `${t.id} section ${s.type}`);
      if (s.page) assert.ok(t.pages.includes(s.page), `${t.id} section uses page ${s.page} that the theme does not enable`);
    }
    for (const mode of ['light', 'dark']) for (const [k, v] of Object.entries(t.colours[mode])) assert.match(v, /^#[0-9a-f]{6}$/, `${t.id} ${mode}.${k}`);
    assert.ok(def.sample?.siteName && def.sample.headline, `${t.id} sample`);
  }
});

test('colour contrast meets WCAG AA in light and dark', () => {
  const failures = [];
  for (const def of THEMES) {
    const t = themeJson(def);
    for (const mode of ['light', 'dark']) {
      const c = t.colours[mode];
      const pairs = [['text', 'bg', 4.5], ['text', 'surface', 4.5], ['muted', 'bg', 4.5], ['muted', 'surface', 4.5], ['onAccent', 'accent', 4.5], ['accent', 'bg', 4.5], ['accent', 'surface', 4.5], ['heroText', 'heroShade', 4.5]];
      if (t.layout.header === 'bar') pairs.push(['onAccent', 'accent', 4.5]);
      for (const [f, b, min] of pairs) {
        const r = contrast(c[f], c[b]);
        if (r < min) failures.push(`${t.id} ${mode}: ${f} on ${b} = ${r.toFixed(2)} (needs ${min})`);
      }
    }
  }
  assert.deepEqual(failures, []);
});

test('generated files are current and the manifest lists every theme folder', async () => {
  const manifest = JSON.parse(await readFile(join(ROOT, 'manifest.json'), 'utf8'));
  assert.deepEqual(manifest.themes.map(t => t.id), [...THEMES].sort((a, b) => a.number - b.number).map(t => t.id));
  assert.equal(manifest.schemaVersion, 1, 'schemaVersion is stable');
  for (const e of manifest.themes) {
    assert.equal(typeof e.readyToImport, 'boolean', `${e.id} readyToImport`);
    assert.equal(e.definition, `themes/${e.id}/theme.json`, `${e.id} definition path is stable`);
    assert.equal(e.preview, `themes/${e.id}/index.html`, `${e.id} preview stays separate from the definition`);
  }
  const folders = (await readdir(ROOT, { withFileTypes: true })).filter(d => d.isDirectory() && !d.name.startsWith('_')).map(d => d.name).sort();
  assert.deepEqual(folders, THEMES.map(t => t.id).sort(), 'every folder is in the catalogue and vice versa');
  for (const def of THEMES) {
    const t = themeJson(def);
    assert.equal(await readFile(join(ROOT, t.id, 'theme.json'), 'utf8'), JSON.stringify(t, null, 2) + '\n', `${t.id}/theme.json is stale — run the build`);
    assert.equal(await readFile(join(ROOT, t.id, 'index.html'), 'utf8'), previewHtml(t, def.sample), `${t.id}/index.html is stale`);
    assert.equal(await readFile(join(ROOT, t.id, 'README.md'), 'utf8'), readme(t, def.sample), `${t.id}/README.md is stale`);
  }
});

test('previews contain no scripts, handlers, forms or outside requests', async () => {
  for (const def of THEMES) {
    const html = await readFile(join(ROOT, def.id, 'index.html'), 'utf8');
    const json = await readFile(join(ROOT, def.id, 'theme.json'), 'utf8');
    for (const [name, pattern] of [['script tag', /<script/i], ['event handler', /\son[a-z]+\s*=/i], ['form', /<form|<iframe|<object|<embed|<link|<img/i], ['url()', /url\s*\(/i], ['@import', /@import/i], ['remote address', /https?:|\/\/[a-z0-9.-]+\.[a-z]{2,}/i], ['javascript:', /javascript:/i]]) {
      assert.ok(!pattern.test(html), `${def.id}/index.html contains ${name}`);
      assert.ok(!pattern.test(json), `${def.id}/theme.json contains ${name}`);
    }
    assert.match(html, /Content-Security-Policy" content="default-src 'none'/, `${def.id} preview CSP`);
  }
});
