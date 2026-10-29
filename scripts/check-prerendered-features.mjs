// Built static pages + actual compiled highlight controller; public feed is a fixture.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox']});
const base='https://static-feature.test',directory=resolve('dist');
const mime={'.js':'text/javascript','.css':'text/css','.html':'text/html','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg'};
try{
 const context=await browser.newContext(),page=await context.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await context.route('**/*',async route=>{const url=new URL(route.request().url());if(url.origin!==base)return route.abort();
  if(url.pathname==='/prototype-content.json')return route.fulfill({json:{features:Object.fromEntries(['contact','apps-showcase','printing'].map(slot=>[slot,{title:'Feature for '+slot,summary:'A published highlight',href:'/library/22222222-2222-4222-8222-222222222222'}]))}});
  if(url.pathname.startsWith('/api/')||url.pathname.startsWith('/.netlify/'))return route.fulfill({status:401,json:{error:'Signed out fixture'}});
  const file=resolve(directory,'.'+decodeURIComponent(url.pathname)+(extname(url.pathname)?'':'/index.html'));if(!file.startsWith(directory+'/'))return route.abort();
  try{return route.fulfill({contentType:mime[extname(file)]||'application/octet-stream',body:await readFile(file)});}catch{return route.fulfill({status:404,body:'Fixture file unavailable'});}
 });
 for(const width of [320,768,1366]){await page.setViewportSize({width,height:900});for(const [path,slot] of [['/contact','contact'],['/kobo','apps-showcase'],['/3d-printing','printing']]){
  await page.goto(base+path);const card=page.locator('[data-feature-page="'+slot+'"]');await card.waitFor({state:'visible'});assert.equal(await card.locator('[data-feature-title]').textContent(),'Feature for '+slot);assert.equal(await card.locator('[data-feature-title]').getAttribute('href'),'/library/22222222-2222-4222-8222-222222222222');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  if(path==='/contact'){assert.equal(await page.locator('form[name="contact"]').getAttribute('method'),'POST');assert.equal(await page.locator('form[name="contact"] [name="form-name"]').inputValue(),'contact');}
 }}
 assert.deepEqual(errors,[]);console.log('PASS actual built static contact/apps/printing pages hydrate the correct page-specific feature at 320/768/1366px; contact form remains present, published feed is a fixture');
}finally{await browser.close();}
