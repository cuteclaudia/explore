// Real Astro headers/controllers, offline fixture APIs; private content stays literal.
import assert from 'node:assert/strict';
import {CAPABILITIES} from '../server/access.mjs';
import {LANGUAGES} from '../src/lib/locales/languages.mjs';
import {translate} from '../src/lib/locales/public-copy.mjs';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox']});
try{
 const context=await browser.newContext(),page=await context.newPage(),base='http://127.0.0.1:4352',errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await context.route('**/*',route=>{const url=new URL(route.request().url());if(url.origin!==base)return route.abort();if(url.pathname==='/api/studio/session')return route.fulfill({json:{id:'audit-owner',isOwner:true,setupRequired:false,capabilities:Object.fromEntries(Object.keys(CAPABILITIES).map(key=>[key,true]))}});if(url.pathname==='/api/files/list')return route.fulfill({json:[]});if(url.pathname.startsWith('/api/')||url.pathname.startsWith('/.netlify/identity/'))return route.fulfill({status:401,json:{error:'Offline fixture'}});return route.continue();});
 await mkdir('/workspace/reviews/soraspace-locales',{recursive:true});
 for(const [code,language] of Object.entries(LANGUAGES)){
  for(const width of [320,768,1366]){
   await page.setViewportSize({width,height:900});await page.goto(base+'/kobo?lang='+code);
   await page.waitForFunction(tag=>document.documentElement.lang===tag,language.tag);
   assert.equal(await page.locator('[data-ui-language]').inputValue(),code);
   assert.equal(await page.locator('.explore-navigation [data-i18n="Home"]').textContent(),translate('Home',code));
   assert.equal(await page.locator('.software-grid h3').first().textContent(),'SoraPhotos');
   assert((await page.locator('.software-grid [lang=ja]').first().textContent()).includes('Hikari · 光'));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Public fits '+code+' '+width);
   await page.goto(base+'/apps?lang='+code);await page.locator('[data-ui-language]').waitFor();
   await page.waitForFunction(tag=>document.documentElement.lang===tag,language.tag);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Workspace fits '+code+' '+width);
   await page.locator('#workspace-app-fumi').waitFor({state:'visible'});assert.equal(await page.locator('#workspace-app-fumi .app-title-line strong').textContent(),'SoraDocs');
   assert.equal(await page.locator('#workspace-app-fumi .app-legacy').textContent(),'Fumi · 文');
   // Private document titles and unmarked authored content never get translated.
   await page.evaluate(()=>{const node=document.createElement('article');node.dataset.userContent='';node.innerHTML='<span data-i18n="Home">Home</span>';document.querySelector('main').append(node);});
   await page.waitForTimeout(30);assert.equal(await page.locator('[data-user-content]').textContent(),'Home');
   if(width===320&&code==='de')await page.screenshot({path:'/workspace/reviews/soraspace-locales/workspace-de-320.png',fullPage:true});
  }
 }
 await page.goto(base+'/studio/signup?lang=ja');await page.waitForFunction(()=>document.documentElement.lang==='ja');assert.equal(await page.locator('main h1').textContent(),translate('Create your account.','ja'));
 await page.locator('[data-ui-language]').selectOption('pt-PT');assert.equal(await page.locator('html').getAttribute('lang'),'pt-PT');assert.equal(new URL(page.url()).searchParams.get('lang'),'pt-PT');
 await page.goto(base+'/hobbynest');await page.waitForFunction(()=>document.documentElement.lang==='pt-PT');assert.equal(await page.locator('[data-ui-language]').inputValue(),'pt-PT');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.goto(base+'/kobo?lang=__proto__');await page.waitForFunction(()=>document.querySelector('[data-ui-language]').value==='pt-PT');
 assert.deepEqual(errors,[]);console.log('PASS sixteen locale choices across catalogue/workspace at 320/768/1366px, signup labels, saved preference, invalid locale fallback and private-content exclusion.');
}finally{await browser.close();}
