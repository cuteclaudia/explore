// Layout/controller fixtures extracted from the real wrappers. Authentication and
// launch are mocked here; the real WASM/bridge check is check-hikari-photo-sync.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {build} from 'esbuild';
import {dirname,resolve} from 'node:path';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox']});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 for(const kind of ['test','app']){
  const file=kind==='test'?'src/pages/studio/kobo-test.astro':'src/pages/apps/[tool].astro';const source=await readFile(file,'utf8');
  let markup=kind==='test'?source.match(/<main[\s\S]*?<\/main>/)[0]:source.match(/<header[\s\S]*?<\/dialog>/)[0];
  markup=markup.replace(/<KoboLauncher[^>]*\/>/g,'<button type="button" style="width:44px;padding:0" aria-label="Switch app">Apps</button>').replace(/\{availableApps[\s\S]*?<\/select>/,'<option value="hikari">Hikari</option></select>').replace(/<KoboIcon[^>]*\/>/g,'').replace(/\{tool.name\}/g,'Hikari').replace(/\{[^}]*\}/g,'"about:blank"');
  const css=source.match(/<style[^>]*>([\s\S]*?)<\/style>/)[1].replace(/:global\(([^)]+)\)/g,'$1');
  let script=source.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/import [^;]*(?:kobo-shell|workspace-files)[^;]*;/g,'');
  if(kind==='test')script='const mountKoboSession=options=>({close(message){options.onClosed(message)}});'+script;
  const compiled=await build({stdin:{contents:script,loader:'ts',resolveDir:dirname(resolve(file))},bundle:true,write:false,format:'iife'});
  await context.route('https://wrapper.test/**',route=>route.request().url().includes('/api/kobo/launch')?route.fulfill({json:{storageStatus:{available:true}}}):route.fulfill({contentType:'text/html',body:`<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0}*{box-sizing:border-box}${css}</style>${markup}<script>${compiled.outputFiles[0].text}</script>`}));
  const page=await context.newPage();await page.goto('https://wrapper.test/');
  if(kind==='test'){await page.locator('#kobo-start').click();assert.match(await page.locator('#kobo-state').textContent(),/Opening SoraSpace Photos — photo development and editing/);assert.equal(await page.locator('iframe').getAttribute('title'),'SoraSpace Photos — photo development and editing');}
  const bar=page.locator(kind==='test'?'.test-bar':'.app-bar');assert.equal((await bar.boundingBox()).height,44);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
  const box=await page.locator('iframe').boundingBox();assert(box.width<=390&&box.height>700,'Phone frame gets the remaining viewport');
  if(kind==='app'){await page.locator('#open-app-files').click();assert(await page.locator('dialog').evaluate(d=>d.open));await page.locator('#close-app-files').click();}
  await page.locator(kind==='test'?'#kobo-fullscreen':'#app-fullscreen').click();assert(await page.evaluate(()=>document.fullscreenElement?.tagName==='IFRAME'),'Fullscreen hides parent chrome');await page.evaluate(()=>document.exitFullscreen());
  if(kind==='test'){await page.locator('#kobo-stop').click();assert.equal(await page.evaluate(()=>document.body.hasAttribute('data-kobo-running')),false);}
  await page.close();await context.unroute('https://wrapper.test/**');console.log('PASS '+kind+' wrapper: 390px, one 44px row, no overflow, frame fullscreen and controls');
 }
}finally{await browser.close();}
