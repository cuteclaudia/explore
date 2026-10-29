// Dependency-free static marketing build. No app bundles, secrets or server routes.
import {mkdir,readFile,writeFile,copyFile,rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {SITE_TEMPLATES} from '../../src/lib/soraspace-site-setup.mjs';
const root=fileURLToPath(new URL('./',import.meta.url)),out=join(root,'dist');
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cards=Object.entries(SITE_TEMPLATES).map(([id,t])=>`<article class="template-card"><div class="template-drawing ${escape(id)}" aria-hidden="true"><i></i><i></i><i></i><i></i></div><h3>${escape(t.name)}</h3><p>${escape(t.description)}</p></article>`).join('\n');
const html=(await readFile(join(root,'index.html'),'utf8')).replace('<!-- TEMPLATE_CARDS -->',cards);
if(!html.includes('class="template-card"')||html.includes('<!-- TEMPLATE_CARDS -->'))throw Error('Template catalogue was not built.');
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
await Promise.all([writeFile(join(out,'index.html'),html),...['styles.css','favicon.svg','_headers','404.html'].map(file=>copyFile(join(root,file),join(out,file))),writeFile(join(out,'robots.txt'),'User-agent: *\nAllow: /\nSitemap: https://www.soraspace.studio/sitemap.xml\n'),writeFile(join(out,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://www.soraspace.studio/</loc></url></urlset>\n')]);
console.log(`SoraSpace public landing built: ${Object.keys(SITE_TEMPLATES).length} starter templates; no functions, identity, forms or private app data.`);
