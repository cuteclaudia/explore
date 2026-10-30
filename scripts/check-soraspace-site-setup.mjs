// Owner-only UI fixture. No account provisioning, publication or live services.
import assert from 'node:assert/strict';
import {mkdir,readFile} from 'node:fs/promises';
import {CAPABILITIES} from '../server/access.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base='http://127.0.0.1:4352',browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox']});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},acceptDownloads:true}),page=await context.newPage(),errors=[],mutations=[];
 page.on('pageerror',e=>errors.push(e.message));
 await context.route('**/*',async route=>{
  const req=route.request(),url=new URL(req.url());if(url.origin!==base)return route.abort();
  if(!['GET','HEAD'].includes(req.method()))mutations.push(url.pathname);
  if(url.pathname==='/api/studio/session')return route.fulfill({json:{id:'audit-owner',isOwner:true,capabilities:Object.fromEntries(Object.keys(CAPABILITIES).map(k=>[k,true]))}});
  if(url.pathname.startsWith('/api/')||url.pathname.startsWith('/.netlify/identity/'))return route.fulfill({status:401,json:{error:'Not available in fixture'}});
  return route.continue();
 });
 const response=await page.goto(base+'/studio/soraspace-setup');assert.equal(response.status(),200);assert.equal(response.headers()['cache-control'],'private, no-store');
 await page.locator('#setup-interactive').waitFor({state:'visible'});
 assert.equal(await page.locator('[data-step="0"]').isVisible(),true);assert(await page.locator('[name=palette][value=system]').isChecked());
 await page.locator('[name=purpose][value=academic]').check();await page.locator('#setup-next').click();
 assert.equal(await page.locator('[name=template]:checked').inputValue(),'folio');
 assert.deepEqual(await page.locator('[name=pages]:checked').evaluateAll(nodes=>nodes.map(n=>n.value)),['home','about','articles','contact']);
 await page.locator('[name=pages][value=journal]').check();await page.locator('[name=template][value=horizon]').check();
 await page.locator('#setup-back').click();await page.locator('[name=purpose][value=creative]').check();await page.locator('#setup-next').click();
 assert(await page.locator('[name=pages][value=journal]').isChecked());assert(await page.locator('[name=pages][value=articles]').isChecked());assert.equal(await page.locator('[name=template]:checked').inputValue(),'horizon');
 await page.locator('#setup-next').click();await page.locator('#setup-next').click();
 assert.equal(await page.locator('[data-step="2"]').isVisible(),true);assert((await page.locator('#setup-status').textContent()).includes('site name'));assert.equal(await page.locator('[name=siteName]').getAttribute('aria-invalid'),'true');
 const attack='<img src=x onerror="window.setupXss=true">';await page.locator('[name=siteName]').fill(attack);await page.locator('[name=tagline]').fill('Ideas, research and creative work');await page.locator('[name=introduction]').fill('A place for work I choose to share.');await page.locator('[name=palette][value=ink]').check();await page.locator('[name=density][value=comfortable]').check();await page.locator('#setup-next').click();
 assert(await page.locator('[data-step="3"]').isVisible());assert.equal(await page.locator('.draft-hero h3').textContent(),attack);assert.equal(await page.locator('#setup-preview img, #setup-preview script, #setup-preview iframe').count(),0);assert.equal(await page.evaluate(()=>window.setupXss),undefined);assert.equal(await page.locator('.draft-preview').getAttribute('data-template'),'horizon');assert((await page.locator('#setup-preview').textContent()).includes('No entries are published'));
 const downloadPromise=page.waitForEvent('download');await page.locator('#setup-download').click();const download=await downloadPromise;assert.equal(download.suggestedFilename(),'soraspace-site-draft.json');const data=JSON.parse(await readFile(await download.path(),'utf8'));
 assert.equal(data.draft.visibility,'private');assert.equal(data.draft.status,'draft');assert.equal(data.answers.purpose,'creative');assert.equal(data.draft.siteName,attack);assert(data.draft.pages.every(p=>p.status==='draft'));assert(!Object.hasOwn(data.draft,'workspaceId'));assert(!Object.hasOwn(data.draft,'domain'));assert.deepEqual(mutations,[]);
 await page.locator('#setup-back').click();assert.equal(await page.locator('[name=siteName]').inputValue(),attack);await page.locator('[name=siteName]').fill('Research & ideas');await page.locator('#setup-next').click();assert.equal(await page.locator('.draft-hero h3').textContent(),'Research & ideas');
 await mkdir('/workspace/reviews/soraspace-setup',{recursive:true});
 for(const [width,height] of [[320,844],[390,844],[768,1024],[1024,768],[1366,768]]){
  await page.setViewportSize({width,height});
  for(let step=3;step>=0;step--){
   if(step<3)await page.locator('#setup-back').click();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`step ${step+1} fits ${width}`);
   const buttons=await page.locator('#site-setup button:visible').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().height));assert(buttons.every(height=>height>=44));
   if([390,768,1366].includes(width))await page.screenshot({path:`/workspace/reviews/soraspace-setup/${width}-step-${step+1}.png`,fullPage:true});
  }
  for(let i=0;i<3;i++)await page.locator('#setup-next').click();
 }
 // Each added template must also render safely at phone width, not just validate.
 await page.setViewportSize({width:390,height:844});
 for(const template of ['practice','canvas']){
  await page.locator('#setup-back').click();await page.locator('#setup-back').click();
  await page.locator(`[name=template][value=${template}]`).check();
  await page.locator('#setup-next').click();await page.locator('#setup-next').click();
  assert.equal(await page.locator('.draft-preview').getAttribute('data-template'),template);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 await page.locator('#setup-back').click();await page.locator('[name=palette][value=system]').check();await page.locator('#setup-next').click();
 assert.equal(await page.locator('.draft-preview').getAttribute('data-palette'),'system');
 const lightPreview=await page.locator('#setup-preview').evaluate(el=>getComputedStyle(el).backgroundColor);
 await page.emulateMedia({colorScheme:'dark'});
 const darkPreview=await page.locator('#setup-preview').evaluate(el=>getComputedStyle(el).backgroundColor);
 assert.notEqual(lightPreview,darkPreview,'System draft reacts to OS theme');await page.emulateMedia({colorScheme:'light'});
 await page.keyboard.press('Shift+Tab');assert(await page.locator('#site-setup').evaluate(root=>root.contains(document.activeElement)));
 await page.goto(base+'/studio');assert.equal(await page.locator('a[href="/studio/soraspace-setup"]').count(),1);
 assert.deepEqual(errors,[]);console.log('PASS suggested templates/pages, custom choice preservation, validation, edit/regenerate, XSS-safe preview, private JSON download, no mutations, keyboard and 320–1366px layouts');
}finally{await browser.close();}
