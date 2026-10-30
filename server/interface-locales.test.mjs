import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {LANGUAGES,languageCode,escapeHTML} from '../src/lib/locales/languages.mjs';
import {PUBLIC_COPY,translate} from '../src/lib/locales/public-copy.mjs';
import {localizeLanding,localePath} from '../src/lib/locales/static-page.mjs';
import {APP_PRESENTATION} from '../src/lib/app-presentation.mjs';
import {KOBO_APPS} from '../src/lib/kobo-catalogue.mjs';
const source=await readFile(new URL('../sites/soraspace/index.html',import.meta.url),'utf8');
test('locale catalogues distinguish Chinese scripts and European Portuguese and reject unsafe codes',()=>{
 assert.deepEqual(Object.keys(LANGUAGES),['en','zh-Hans','zh-Hant','fr','pt-PT','id','de','ja','ko','it','th','uk','nl','sv','fi','nb']);
 for(const value of ['__proto__','constructor','pt-BR','../../','ja<script>',null,{}])assert.equal(languageCode(value),'en');
 for(const row of Object.values(PUBLIC_COPY)){assert.deepEqual(Object.keys(row),Object.keys(LANGUAGES));for(const text of Object.values(row))assert.equal(typeof text,'string');}
 assert.equal(translate('Your files','pt-PT'),'Os seus ficheiros');assert.notEqual(translate('Files','zh-Hant'),translate('Files','zh-Hans'));
 assert.equal(translate('Private unlisted document title','ja'),'Private unlisted document title');
});
test('localized public pages retain auth return destinations and never translate brands or native IDs',()=>{
 for(const code of Object.keys(LANGUAGES)){
  const page=localizeLanding(source,code);
  assert(page.includes(`<html lang="${LANGUAGES[code].tag}"`));
  assert(page.includes(escapeHTML(translate('Space for everything you create.',code))));
  assert(page.includes('href="/?lang=en" data-language-choice="en" hreflang="en-AU"'));assert(page.includes('https://www.soraspace.studio'+localePath(code)));
  assert(page.includes('/tools/fumi/'));assert(page.includes('Fumi · 文'));assert(!/<script\b|<iframe\b|<form\b/i.test(page));
  const href=page.match(/class="sign-in" href="([^"]+)"/)[1].replaceAll('&amp;','&');const link=new URL(href);
  assert.equal(link.origin,'https://www.claudiagilbert.com');assert.equal(link.searchParams.get('next'),'/studio/welcome');if(code!=='en')assert.equal(link.searchParams.get('lang'),code);
 }
 assert.throws(()=>localizeLanding(source,'__proto__'),/Unsupported/);
});
test('six Sora names match catalogue identities without renaming app routes',()=>{
 assert.deepEqual(Object.keys(APP_PRESENTATION),['hikari','irodori','fumi','tsuzuri','tayori','goban']);
 for(const app of KOBO_APPS){const display=APP_PRESENTATION[app.id];assert.equal(app.name,display.name);assert.equal(app.japaneseName,display.japaneseName);assert.equal(app.legacyName,display.legacyName);assert.match(display.japaneseName,/\p{Script=Han}/u);}
});

test('SSR preserves only an allowed request language during protected-page login redirects',async()=>{
 const {withActorRequest,scopedLanguage}=await import('./request-actor.mjs');
 assert.equal(scopedLanguage(),'');
 for(const value of ['ja','pt-PT','__proto__','https://evil.test'])assert.equal(await withActorRequest(new Request('https://www.claudiagilbert.com/apps?lang='+encodeURIComponent(value)),async()=>scopedLanguage()),Object.hasOwn(LANGUAGES,value)?value:'');
});

test('public app preview pages keep canonical, language and signup links on the requested product',async()=>{
 const {TOOL_PREVIEWS,renderToolPreview}=await import('../sites/soraspace/previews.mjs');
 for(const tool of TOOL_PREVIEWS){
  const app=APP_PRESENTATION[tool.id];
  for(const code of Object.keys(LANGUAGES)){
   const main=renderToolPreview(tool,app,escapeHTML);
   const page=localizeLanding(source.replace(/<main id="main">[\s\S]*?<\/main>/,main),code,{path:'/tools/'+tool.id+'/',name:app.name,purpose:tool.purpose});
   assert(page.includes('https://www.soraspace.studio'+localePath(code)+'tools/'+tool.id+'/'));
   assert(page.includes('href="/fr/tools/'+tool.id+'/"'));
   assert(!/iframe|data-app-launch/.test(main));assert(!main.includes('/apps/'+tool.id));
   assert(main.includes('/studio/signup?package=workspace'));
   if(!tool.desktop)assert(main.includes('&amp;app='+tool.id));
  }
 }
 assert.throws(()=>localizeLanding(source,'en',{path:'//evil.example/'}),/Unsupported public page/);
});
