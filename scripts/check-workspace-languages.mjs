// Actual translated workspace/controllers and sandbox bridge, fixture identity/files.
import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
import {LANGUAGES} from '../src/lib/locales/languages.mjs';
import {translate} from '../src/lib/locales/public-copy.mjs';
import {CAPABILITIES} from '../server/access.mjs';
const bridge=await readFile('scripts/craft-file-bridge.js','utf8');
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox']});
try{
 const base='http://127.0.0.1:4352',context=await browser.newContext({viewport:{width:1366,height:768}}),page=await context.newPage(),errors=[];
 context.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));page.on('pageerror',e=>errors.push(e.message));
 const file={id:'11111111-1111-4111-8111-111111111111',ownerId:'audit-owner',tool:'wordcraft',name:'Welcome to SoraSpace.',createdAt:'2026-10-30T01:00:00Z'};
 await context.route('**/*',route=>{const url=new URL(route.request().url());if(url.origin!==base)return route.abort();if(url.pathname==='/api/studio/session')return route.fulfill({json:{id:'audit-owner',isOwner:true,capabilities:Object.fromEntries(Object.keys(CAPABILITIES).map(k=>[k,true]))}});if(url.pathname==='/api/files/list')return route.fulfill({json:[file]});if(url.pathname==='/api/storage/preferences')return route.fulfill({json:{defaultDestination:'download'}});if(url.pathname.startsWith('/studio/workspaces/'))return route.fulfill({contentType:'text/html',body:`<html lang="en"><head><script>${bridge}</script></head><body><canvas width="900" height="700"></canvas><script>dispatchEvent(new Event('TrunkApplicationStarted'));window.preservedDocument='unchanged';</script></body></html>`});if(url.pathname.startsWith('/api/')||url.pathname.startsWith('/.netlify/identity/'))return route.fulfill({status:401,json:{error:'Fixture'}});return route.continue();});
 await page.goto(base+'/apps');await page.locator('.workspace-file-name').waitFor();
 for(const [code,lang] of Object.entries(LANGUAGES)){
  await page.locator('[data-ui-language]').selectOption(code);assert.equal(await page.locator('html').getAttribute('lang'),lang.tag);
  for(const key of ['Welcome to SoraSpace.','Your files, apps and daily essentials, together.','Your apps','Calendar','Files & folders','Recent files','Your inbox preview will appear here.','Your upcoming events will appear here.','Layers, masks, selections and image composition.','Desktop · In development','macOS · Planned'])assert.equal(await page.locator(`[data-i18n=${JSON.stringify(key)}]`).first().textContent(),translate(key,code),code+' '+key);
  assert.equal(await page.locator('.workspace-file-name').textContent(),file.name,'Never translate a user filename');
  for(const width of [320,768,1366]){await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),code+' fits '+width);}
 }
 await page.setViewportSize({width:1366,height:768});await page.locator('[data-ui-language]').selectOption('fr');
 const tab=page.waitForEvent('popup');await page.locator('[data-desktop-app="wordcraft"] .app-open').click();const app=await tab;await app.waitForURL(url=>url.pathname==='/apps/fumi');assert.equal(new URL(app.url()).searchParams.get('lang'),'fr');
 const frame=app.frames().find(f=>f.url().includes('/studio/workspaces/wordcraft'))||await app.waitForEvent('framenavigated',{predicate:f=>f.url().includes('/studio/workspaces/wordcraft')});await frame.waitForFunction(()=>window.SoraSpaceUI?.language==='fr');assert.equal(new URL(frame.url()).searchParams.get('lang'),'fr');assert.equal(await frame.evaluate(()=>SoraSpaceUI.fallbackLanguage),'en');
 await app.evaluate(()=>window.preservedEditor=true);await page.locator('[data-ui-language]').selectOption('ja');await frame.waitForFunction(()=>window.SoraSpaceUI.language==='ja');await page.locator('[data-desktop-app="wordcraft"] .app-open').click();await app.waitForFunction(()=>document.documentElement.dataset.selectedLanguage==='ja');assert.equal(context.pages().length,2);assert.equal(await app.evaluate(()=>window.preservedEditor),true);assert.equal(await frame.evaluate(()=>preservedDocument),'unchanged','Language change does not reload native document');
 await app.close();await page.goto(base+'/apps/files?lang=fr');await page.locator('.workspace-file-name').waitFor();await page.locator('[data-ui-language]').selectOption('fr');assert.equal(await page.locator('#main h1').textContent(),translate('Saved site files','fr'));assert((await page.locator('#workspace-files-status').textContent()).includes('1 sur 1'));assert.equal(await page.locator('#workspace-file-sort option[value="newest"]').textContent(),translate('Newest first','fr'));
 await page.locator('#workspace-app-search').fill('unfindable');assert.equal(await page.locator('#workspace-files-status').textContent(),translate('No saved site revisions match these filters.','fr'));
 await mkdir('/workspace/reviews/locales',{recursive:true});await page.screenshot({path:'/workspace/reviews/locales/french-files.png'});assert.deepEqual(errors,[]);
 console.log('PASS all 16 workspace languages at phone/tablet/desktop widths; headings, descriptions, counts and files; filename preserved; app launch locale and live bridge updates without document/tab reload. Native translation availability remains app-side.');
}finally{await browser.close();}
