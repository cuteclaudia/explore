// Copies images still hosted on Squarespace into public/images/migrated
// and rewrites the content files to point at the local copies.
// Run before closing the Squarespace account:  node scripts/migrate-squarespace-images.mjs
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, basename, extname } from 'node:path';

const CONTENT = 'src/content';
const OUT_DIR = 'public/images/migrated';
const PATTERN = /https:\/\/images\.squarespace-cdn\.com\/[^\s)"']+/g;

async function* files(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) yield* files(p);
    else if (/\.(mdoc|md|yaml)$/.test(entry.name)) yield p;
  }
}

await mkdir(OUT_DIR, { recursive: true });
const done = new Map();
for await (const file of files(CONTENT)) {
  let text = await readFile(file, 'utf8');
  const urls = [...new Set(text.match(PATTERN) ?? [])];
  for (const url of urls) {
    if (!done.has(url)) {
      const clean = decodeURIComponent(new URL(url).pathname);
      const name = `${clean.split('/').slice(-2, -1)[0].slice(0, 12)}-${basename(clean).replace(/[^a-zA-Z0-9.-]+/g, '-')}`;
      const res = await fetch(url);
      if (!res.ok) { console.warn(`Skipped ${url} (${res.status})`); continue; }
      await writeFile(join(OUT_DIR, name), Buffer.from(await res.arrayBuffer()));
      done.set(url, `/images/migrated/${name}`);
      console.log(`Saved ${name}`);
    }
    text = text.split(url).join(done.get(url));
  }
  if (urls.length) await writeFile(file, text);
}
console.log(`Done: ${done.size} images migrated.`);
