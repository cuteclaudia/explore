// Real SSR signup page: pricing choice is editable UI preference, not a grant.
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox']});
try{
 const context=await browser.newContext(),page=await context.newPage(),base='http://127.0.0.1:4352';
 await context.route('**/*',route=>{const url=new URL(route.request().url());if(url.origin!==base)return route.abort();if(url.pathname.startsWith('/api/')||url.pathname.startsWith('/.netlify/identity/'))return route.fulfill({status:401,json:{error:'Offline fixture'}});return route.continue();});
 for(const [id,label,website] of [['workspace','Workspace',false],['workspace-website','Workspace + Website',true]]){
  for(const width of [320,768,1366]){
   await page.setViewportSize({width,height:900});await page.goto(base+'/studio/signup?package='+id);
   assert.equal(await page.locator('.signup-package strong').textContent(),label);
   assert.equal(await page.locator('[name=services][value=website]').isChecked(),website);
   await page.locator('[name=services][value=website]').setChecked(!website);assert.equal(await page.locator('[name=services][value=website]').isChecked(),!website);
   await page.locator('[name=services][value=docs]').check();assert(await page.locator('[name=services][value=docs]').isChecked());
   assert.equal(await page.locator('[name=package],[name=price],[name=capabilities]').count(),0);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  }
 }
 await page.goto(base+'/studio/signup?package='+encodeURIComponent('<script>window.packageXss=true</script>'));assert.equal(await page.locator('.signup-package').count(),0);assert.equal(await page.evaluate(()=>window.packageXss),undefined);assert(await page.locator('[name=services][value=website]').isChecked());
 console.log('PASS pricing signup starting packages at 320/768/1366px, editable services, ignored invalid selection, no client billing/grant fields.');
}finally{await browser.close();}
