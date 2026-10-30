// Dependency-free static marketing build. No app bundles, secrets or server routes.
import {mkdir,readFile,writeFile,copyFile,rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {APP_PRESENTATION} from '../../src/lib/app-presentation.mjs';
import {LANGUAGES} from '../../src/lib/locales/languages.mjs';
import {localizeLanding,localePath} from '../../src/lib/locales/static-page.mjs';
import {SITE_TEMPLATES} from '../../src/lib/soraspace-site-setup.mjs';
const root=fileURLToPath(new URL('./',import.meta.url)),out=join(root,'dist');
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cards=Object.entries(SITE_TEMPLATES).map(([id,t])=>`<article class="template-card"><div class="template-drawing ${escape(id)}" aria-hidden="true"><i></i><i></i><i></i><i></i></div><h3>${escape(t.name)}</h3><p>${escape(t.description)}</p></article>`).join('\n');
const featuredTools=[['fumi','Documents & references'],['tsuzuri','PDFs & annotations'],['hikari','Photo development'],['irodori','Images & layers'],['tayori','Mail & calendar'],['goban','Spreadsheets & data']];
const tools=featuredTools.map(([id,purpose])=>{const app=APP_PRESENTATION[id],desktop=['tayori','goban'].includes(id),href=desktop?'https://www.claudiagilbert.com/apps?desktop='+id+'#workspace-app-'+id:'https://www.claudiagilbert.com/apps/'+id;return `<a class="tool-link ${desktop?'tool-desktop':'tool-web'}" href="${escape(href)}" target="_blank" rel="noopener"><img src="/icons/${id}.svg" width="36" height="36" alt=""/><span class="tool-copy"><span class="tool-title"><strong>${escape(app.name)}</strong><small lang="ja">${escape(app.legacyName)} · ${escape(app.japaneseName)}</small></span><span class="tool-purpose">${escape(purpose)}</span><span class="tool-state">${desktop?'Desktop · In development':'Web preview'}</span></span><span class="tool-arrow" aria-hidden="true">↗</span></a>`;}).join('\n');
const html=(await readFile(join(root,'index.html'),'utf8')).replace('<!-- TEMPLATE_CARDS -->',cards).replace('<!-- HERO_TOOLS -->',tools);
if(!html.includes('class="template-card"')||html.includes('<!-- TEMPLATE_CARDS -->')||html.includes('<!-- HERO_TOOLS -->'))throw Error('Template catalogue was not built.');
await rm(out,{recursive:true,force:true});await mkdir(join(out,'icons'),{recursive:true});
await Promise.all([...featuredTools.map(([id])=>copyFile(join(root,'../../public/kobo/icons',id+'.svg'),join(out,'icons',id+'.svg'))),...Object.keys(LANGUAGES).map(async code=>{const dir=join(out,localePath(code));await mkdir(dir,{recursive:true});await writeFile(join(dir,'index.html'),localizeLanding(html,code));}),...['styles.css','favicon.svg','_headers','404.html'].map(file=>copyFile(join(root,file),join(out,file))),writeFile(join(out,'robots.txt'),'User-agent: *\nAllow: /\nSitemap: https://www.soraspace.studio/sitemap.xml\n'),writeFile(join(out,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+Object.keys(LANGUAGES).map(code=>'<url><loc>https://www.soraspace.studio'+localePath(code)+'</loc></url>').join('')+'</urlset>\n')]);
console.log(`SoraSpace public landing built: ${Object.keys(SITE_TEMPLATES).length} starter templates; no functions, identity, forms or private app data.`);
