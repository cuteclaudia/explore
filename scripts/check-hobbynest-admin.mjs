// Isolated local Astro + Blobs fixture only. Never points at a production store.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {CAPABILITIES} from '../server/access.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright'),base='http://127.0.0.1:4352';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox']});
try{
 const context=await browser.newContext({viewport:{width:1366,height:900}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await context.route('**/*',route=>{const u=new URL(route.request().url());if(u.origin!==base)return route.abort();if(u.pathname==='/api/studio/session')return route.fulfill({json:{id:'audit-owner',isOwner:true,capabilities:Object.fromEntries(Object.keys(CAPABILITIES).map(k=>[k,true]))}});if(u.pathname.startsWith('/api/hobbynest/'))return route.continue();if(u.pathname.startsWith('/api/')||u.pathname.startsWith('/.netlify/identity/'))return route.fulfill({status:401,json:{error:'Local fixture'}});return route.continue();});
 await page.goto(base+'/studio/hobbynest');await page.waitForFunction(()=>document.querySelector('#nest-status').textContent.includes('Store loaded'));
 const tab=async name=>page.getByRole('tab',{name,exact:true}).click();
 async function saved(action){await action();await page.waitForFunction(()=>document.querySelector('#nest-status').textContent.startsWith('Saved.'));}
 await tab('Collections');await page.locator('#nest-collection').getByLabel('Collection name').fill('Local fixture gifts');await saved(()=>page.locator('#nest-collection').getByRole('button',{name:'Create collection'}).click());
 await tab('Products');const form=page.locator('#nest-product');await form.getByLabel('Product name').fill('Browser fixture planter');await form.getByLabel('SKU / your reference').fill('BROWSER-1');await form.getByLabel('Price (AUD)',{exact:true}).fill('25.00');await form.getByLabel('Description',{exact:true}).fill('A local test, never a real product.');await saved(()=>form.getByRole('button',{name:'Create draft'}).click());
 assert.equal((await (await context.request.get(base+'/api/hobbynest/catalogue')).json()).products.length,0);
 await saved(()=>page.getByRole('button',{name:'Publish saved draft'}).click());
 await tab('Stock');await page.locator('#nest-colours').getByRole('button',{name:'Edit',exact:true}).click();await page.locator('#nest-colour').getByLabel('Colour name').fill('Blue');await page.locator('#nest-colour').getByLabel('Filament for printing').selectOption('true');await saved(()=>page.locator('#nest-colour').getByRole('button',{name:'Save colour'}).click());
 const stock=page.locator('#nest-stock');await stock.getByLabel('Units to add').fill('2');await stock.getByLabel('Note / reference').fill('Local batch one');await saved(()=>stock.getByRole('button',{name:'Apply stock adjustment'}).click());
 await page.getByRole('button',{name:'+ Add colour'}).click();await page.locator('#nest-colour').getByLabel('Colour name').fill('Red');await saved(()=>page.locator('#nest-colour').getByRole('button',{name:'Add colour',exact:true}).click());
 await tab('Products');await form.getByLabel('Needs printing: latest dispatch').fill('8');await saved(()=>form.getByRole('button',{name:'Save product draft'}).click());await saved(()=>page.getByRole('button',{name:'Publish saved draft'}).click());
 await tab('Discounts');const discount=page.locator('#nest-discount');await discount.getByLabel('Offer name').fill('Local offer');await discount.getByLabel('Discount code').fill('TEST25');await discount.getByLabel('Percentage or AUD amount').fill('25');await discount.getByLabel('Status').selectOption('true');await saved(()=>discount.getByRole('button',{name:'Create discount'}).click());
 await tab('Shipping');const rate=page.locator('#nest-rate');await rate.getByLabel('Rate / service name').fill('Manual parcel');await rate.getByLabel('Shipping charge').fill('10.00');await saved(()=>rate.getByRole('button',{name:'Add rate'}).click());
 await tab('Test estimate');const estimate=page.locator('#nest-estimate');await estimate.getByLabel('Quantity').fill('3');await estimate.getByLabel('Code (optional)').fill('TEST25');await estimate.getByRole('button',{name:'Calculate estimate'}).click();await page.locator('#nest-estimate-result').getByText('1 to print',{exact:false}).waitFor();assert((await page.locator('#nest-estimate-result').textContent()).includes('$56.25'));assert((await page.locator('#nest-estimate-result').textContent()).includes('$66.25'));
 const admin=(await (await context.request.get(base+'/api/hobbynest/settings')).json());assert.equal(admin.products[0].colours[0].stock,2);assert.equal(admin.movements.length,1);
 await page.goto(base+'/hobbynest');await page.locator('.shop-products h3').waitFor();assert((await page.locator('.availability').textContent()).includes('2 in stock'));await page.getByLabel('Colour for Browser fixture planter').selectOption(admin.products[0].colours[1].id);assert((await page.locator('.availability').textContent()).includes('Out of stock'));assert.equal(await page.locator('main button[type=submit],main a[href*=checkout]').count(),0);
 const exposed=await (await context.request.get(base+'/api/hobbynest/catalogue')).text();assert(!exposed.includes('TEST25'));assert(!exposed.includes('Local batch one'));
 await mkdir('/workspace/reviews/hobbynest',{recursive:true});
 for(const width of [320,390,768,1366]){
  await page.setViewportSize({width,height:900});await page.goto(base+'/studio/hobbynest');await page.waitForFunction(()=>document.querySelector('#nest-status').textContent.includes('Store loaded'));
  for(const name of ['Products','Stock','Collections','Discounts','Shipping','Test estimate']){await tab(name);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${name} overflows at ${width}`);}
  await tab('Products');await page.screenshot({path:`/workspace/reviews/hobbynest/admin-${width}.png`,fullPage:true});
  await page.goto(base+'/hobbynest');await page.locator('.shop-products h3').waitFor();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Shop overflows at ${width}`);await page.screenshot({path:`/workspace/reviews/hobbynest/catalogue-${width}.png`,fullPage:true});
  console.log(`PASS HobbyNest admin panels and published colour catalogue ${width}px`);
 }
 assert.deepEqual(errors,[]);console.log('PASS real local owner CRUD, explicit publication, colour stock, editable lead time, discount/shipping estimate, private data separation; checkout closed');
}finally{await browser.close();}
