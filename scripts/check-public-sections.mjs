import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base='http://127.0.0.1:4352',output='/workspace/reviews/public-sections';await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox']});
try{
 for(const width of [320,390,768,1024,1366,1440]){
  const context=await browser.newContext({viewport:{width,height:960},hasTouch:width<1100}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await context.route('**/*',route=>{const url=new URL(route.request().url());if(url.origin!==base)return route.abort();if(url.pathname.startsWith('/api/')||url.pathname.startsWith('/.netlify/identity/'))return route.fulfill({status:401,json:{error:'Signed out fixture'}});return route.continue();});
  for(const path of ['/kobo','/3d-printing']){
   const r=await page.goto(base+path);assert.equal(r.status(),200);await page.locator('main h1').waitFor({timeout:15000});assert.equal(await page.locator('main h1').count(),1);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   const toggle=page.locator('.explore-menu');if(await toggle.isVisible())await toggle.click();const nav=page.getByRole('navigation',{name:'Main navigation'});assert(await nav.locator('a[href="'+path+'"]').isVisible());assert.equal(await nav.locator('a[href="'+path+'"]').getAttribute('aria-current'),'page');assert(await nav.locator('a[href="/kobo"]').isVisible());assert(await nav.locator('a[href="/3d-printing"]').isVisible());assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Expanded navigation fits '+width);if(await toggle.isVisible())await toggle.click();
   if(path==='/kobo'){assert.equal(await page.locator('.platforms .planned').count(),4);assert((await page.locator('.store-status').textContent()).includes('Forthcoming'));assert.equal(await page.locator('a[href*="apps.microsoft.com"]').count(),0);assert.equal(await page.locator('.intro-actions a').first().getAttribute('href'),'/apps');}else assert((await page.locator('.portfolio-status').textContent()).includes('preparation'));
   if([390,768,1440].includes(width))await page.screenshot({path:output+'/'+path.slice(1)+'-'+width+'.png',fullPage:true});
  }
  await page.goto(base+'/settings/connections');assert.equal(await page.locator('.service-list article').count(),6);await page.locator('.service-list details').evaluateAll(rows=>rows.forEach(row=>row.open=true));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert((await page.locator('main').textContent()).includes('not connected yet'));assert.deepEqual(errors,[]);await context.close();console.log('PASS public sections '+width+'px');
 }
 console.log('PASS public Apps and 3D Printing pages, active/expanded navigation, honest release/macOS/portfolio states and six fitness providers at 320–1440px');
}finally{await browser.close();}
