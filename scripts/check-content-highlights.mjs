// Actual local content/category/feature APIs with isolated storage, not live pins.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {CAPABILITIES} from '../server/access.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const fixtureSlug='feature-browser-'+Date.now();
const base='http://127.0.0.1:4352',browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox']});
try{
 const context=await browser.newContext(),page=await context.newPage(),errors=[],requests=[];
 page.on('pageerror',error=>errors.push(error.message));
 await context.route('**/*',route=>{const url=new URL(route.request().url());requests.push(url.href);if(url.origin!==base)return route.abort();if(url.pathname==='/api/studio/session')return route.fulfill({json:{id:'audit-owner',isOwner:true,capabilities:Object.fromEntries(Object.keys(CAPABILITIES).map(k=>[k,true]))}});return route.continue();});
 async function save(collection,slug,title,action='publish',version=0){const response=await context.request.put(base+'/api/content/entry?collection='+collection+'&slug='+slug,{headers:{Origin:base},data:{version,action,draft:{title,date:'2026-10-29',summary:'A concise introduction to the latest published work and why it matters.',html:'<p>Published body</p>',tags:['Signals']}}});assert.equal(response.status(),200,await response.text());return response.json();}
 let brief=await save('osint',fixtureSlug,'This week: signals to watch');const journal=await save('journal',fixtureSlug,'A morning above the clouds');
 brief=await save('osint',fixtureSlug,'PRIVATE NEXT BRIEF','draft',brief.version);
 await page.goto(base+'/studio/content');await page.locator('.feature-manager summary').click();await page.locator('[data-feature-slot="writing"] select').selectOption(brief.key);await page.locator('[data-feature-slot="home"] select').selectOption(journal.key);await page.getByRole('button',{name:'Save writing pin',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#feature-status').textContent.startsWith('Feature saved'));
 assert.equal(await page.locator('[data-feature-slot="home"] select').inputValue(),journal.key,'saving writing preserves unsaved home selection');await page.getByRole('button',{name:'Save home feature',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('[data-feature-slot="home"] button').disabled);
 assert(!(await page.locator('.feature-manager').textContent()).includes('PRIVATE NEXT BRIEF'));
 for(const width of [320,390,768,1366]){await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'expanded pin controls fit '+width);}
 await mkdir('/workspace/reviews/content-highlights',{recursive:true});
 for(const [width,height] of [[320,844],[390,844],[768,1024],[1024,768],[1280,720],[1366,768],[1440,900],[1920,1080],[2560,1440]]){
  await page.setViewportSize({width,height});await page.goto(base+'/#writing');await page.locator('#writing-results article').first().waitFor();await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('#writing-feature .eyebrow').textContent(),'Pinned document');assert((await page.locator('#writing-feature').textContent()).includes('This week: signals to watch'));assert(!(await page.locator('#app').textContent()).includes('PRIVATE NEXT BRIEF'));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'writing width '+width);
  if(width>1000){const main=await page.locator('.writing-main').boundingBox(),side=await page.locator('.writing-sidebar').boundingBox();assert(side.x>=main.x+main.width,'tools right of writing');}
  assert(await page.locator('#writing-results article').count()<=4);if(await page.locator('#writing-pagination button').count()){await page.getByRole('button',{name:'Next',exact:true}).click();assert((await page.locator('#writing-count').textContent()).startsWith('5'));}
  await page.locator('#writing-search').fill('no such article');assert.equal(await page.locator('#writing-results article').count(),0);assert(await page.locator('#writing-feature').isVisible());assert(await page.locator('.stratwatch-preview').isVisible());await page.locator('#writing-search').fill('');
  if([390,1366].includes(width))await page.screenshot({path:'/workspace/reviews/content-highlights/writing-'+width+'.png',fullPage:true});
  await page.goto(base+'/#home');await page.locator('#home-feature:not([hidden])').waitFor();assert((await page.locator('#home-feature').textContent()).includes('A morning above the clouds'));assert.equal(await page.locator('#home-feature .eyebrow').textContent(),'Featured now');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'home width '+width);assert((await page.locator('.hero').evaluate(el=>getComputedStyle(el).backgroundImage)).includes('dolomites-dusk.jpg'));
  if(width>1000){const hero=await page.locator('.hero').boundingBox(),feature=await page.locator('#home-feature').boundingBox(),copy=await page.locator('.hero-copy').boundingBox();assert(feature.x>=copy.x+copy.width,'feature does not cover hero copy');assert(feature.width/hero.width<=.3,'feature preserves the photograph');assert(feature.y>=hero.y&&feature.y+feature.height<=hero.y+hero.height+1,'feature stays inside photograph');}
  if([390,1366].includes(width))await page.screenshot({path:'/workspace/reviews/content-highlights/home-'+width+'.png',fullPage:true});
 }
 assert(!requests.some(url=>url.startsWith('https://www.stratwatch.net')),'no third-party embedded preview');
 await page.goto(base+'/studio/content');await page.locator('.feature-manager summary').click();
 const pageForm=page.locator('[data-feature-slot=""]');await pageForm.locator('[name="slot"]').selectOption('journal');await pageForm.locator('[name="key"]').selectOption(journal.key);await pageForm.getByRole('button',{name:'Save page highlight'}).click();await page.waitForFunction(()=>document.querySelector('#feature-status').textContent.startsWith('Feature saved'));
 await pageForm.locator('[name="slot"]').selectOption('photography');await pageForm.locator('[name="key"]').selectOption(brief.key);await pageForm.getByRole('button',{name:'Save page highlight'}).click();await page.waitForFunction(()=>!document.querySelector('[data-feature-slot=""] button').disabled);
 await page.goto(base+'/journal');assert((await page.locator('.page-spotlight').textContent()).includes('A morning above the clouds'));
 await page.goto(base+'/photography');assert((await page.locator('.page-spotlight').textContent()).includes('This week: signals to watch'));
 await page.goto(base+'/studio/content');await page.locator('.feature-manager summary').click();await pageForm.locator('[name="slot"]').selectOption('journal');await pageForm.locator('[name="key"]').selectOption('');await pageForm.getByRole('button',{name:'Save page highlight'}).click();await page.waitForFunction(()=>document.querySelector('#feature-status').textContent.startsWith('Feature saved'));
 await page.goto(base+'/journal');assert(await page.locator('.page-spotlight').isHidden());
 await save('osint',fixtureSlug,'PRIVATE NEXT BRIEF','unpublish',brief.version);
 const feed=await (await context.request.get(base+'/prototype-content.json')).json();assert.equal(feed.features.writing,null);assert(!JSON.stringify(feed).includes('PRIVATE NEXT BRIEF'));assert.equal(feed.features.photography,null);
 const selection=await (await context.request.get(base+'/api/content-features')).json();const pdfKey='library/22222222-2222-4222-8222-222222222222';assert(selection.options.some(x=>x.key===pdfKey));
 const pdfPin=await context.request.put(base+'/api/content-features',{headers:{Origin:base},data:{expectedAccount:'audit-owner',etag:selection.etag,slot:'writing',key:pdfKey}});assert.equal(pdfPin.status(),200);const pdfFeed=await (await context.request.get(base+'/prototype-content.json')).json();assert.equal(pdfFeed.features.writing.href,'/library/22222222-2222-4222-8222-222222222222');
 await page.goto(base+'/kobo');assert.equal(await page.locator('.app-heading[href="/apps/fumi"]').count(),1);const popupPromise=page.waitForEvent('popup');await page.locator('.app-heading[href="/apps/fumi"]').click();const popup=await popupPromise;await popup.waitForLoadState();assert.equal(new URL(popup.url()).pathname,'/apps/fumi');assert.equal(await popup.evaluate(()=>window.opener),null);await popup.close();
 assert.deepEqual(errors,[]);
 console.log('PASS owner pin controls, published-only feed, independent slot saves, responsive writing sidebar/home feature, image/copy preservation, filter independence, hidden unpublished selection and direct app opening; isolated local storage');
}finally{await browser.close();}
