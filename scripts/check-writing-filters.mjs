// Real writing page and editor with fixture publication data; no live publishing.
import assert from 'node:assert/strict';
import {writingCategoryFor} from '../server/writing-categories.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base='http://127.0.0.1:4352';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox']});
try {
 const context=await browser.newContext(),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const item=(title,date,href)=>({title,date,href,summary:'Published analysis',tags:['Security']});
 let custom=null;
 await context.route('**/*',async route=>{
  const u=new URL(route.request().url());if(u.origin!==base)return route.abort();
  if(u.pathname==='/api/writing-categories')return route.continue();
  if(u.pathname==='/prototype-content.json'){
   const registry=await (await context.request.get(base+'/api/writing-categories')).json();
   return route.fulfill({json:{categories:registry.categories,essays:[item('China perspective','2026-10-27','/chinaseries/perspective')],reports:[item('Cyber update','2026-10-28','/dailycyberreport/update')],osint:[{...item('Weekly OSINT Brief','2026-10-29','/osint-brief/weekly'),category:writingCategoryFor({collection:'osint',writingCategory:custom||undefined},registry)}],galleries:[]}});
  }
  if(u.pathname==='/api/content/entry'&&u.searchParams.get('slug')==='reassigned')return route.fulfill({json:{version:3,draft:{title:'Reassigned article',date:'2026-10-29',summary:'',tags:[],location:'',locationPrecision:'hidden',cover:'',coverAlt:'',photos:[],html:'<p>Kept content</p>',writingCategory:custom}}});
  if(u.pathname.startsWith('/api/')||u.pathname.startsWith('/.netlify/identity/'))return route.fulfill({status:401,json:{error:'Fixture unavailable'}});
  return route.continue();
 });
 await page.goto(base+'/#writing');await page.locator('#writing-results article').first().waitFor();
 assert.deepEqual(await page.locator('[data-writing]').allTextContents(),['All Writing','China Series','Cyber Briefs','OSINT Brief']);
 assert.deepEqual(await page.locator('#writing-results h3').allTextContents(),['Weekly OSINT Brief','Cyber update','China perspective']);
 for(const [filter,title] of [['essays','China perspective'],['reports','Cyber update'],['osint','Weekly OSINT Brief']]){
  await page.locator(`[data-writing="${filter}"]`).click();
  assert.deepEqual(await page.locator('#writing-results h3').allTextContents(),[title]);
  assert.equal(await page.locator('[data-writing][aria-pressed="true"]').count(),1);
 }
 await page.locator('#writing-search').fill('does not exist');assert.equal(await page.locator('#writing-results article').count(),0);
 assert((await page.locator('#writing-results').textContent()).includes('No matching articles'));
 await page.locator('#writing-search').fill('security');assert.equal(await page.locator('#writing-results article').count(),1);
 for(const [width,height] of [[320,844],[390,844],[768,1024],[1024,768],[1440,900]]){
  await page.setViewportSize({width,height});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert(await page.locator('[data-writing="osint"]').isVisible());
 }
 await page.goto(base+'/studio/content');assert.equal(await page.getByRole('link',{name:'New OSINT brief'}).getAttribute('href'),'/studio/content/edit?collection=osint');
 await page.getByRole('link',{name:'New OSINT brief'}).click();await page.locator('#content-form').waitFor({state:'visible'});
 assert.equal(await page.locator('#editor-section').textContent(),'OSINT Brief');
 await page.locator('.editor-panel').first().locator('summary').click();await page.locator('#entry-writing-category').selectOption('osint');assert.equal(await page.locator('#entry-writing-category').inputValue(),'osint');
 await page.goto(base+'/studio/content');await page.locator('.category-manager summary').click();
 await page.locator('#category-name').fill('Regional Outlook');await page.getByRole('button',{name:'Add category',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('#category-status').textContent.startsWith('Category saved'));
 const registry=await (await context.request.get(base+'/api/writing-categories')).json();custom=registry.categories.at(-1).id;
 await page.goto(base+'/#writing');await page.locator(`[data-writing="${custom}"]`).click();
 assert.deepEqual(await page.locator('#writing-results h3').allTextContents(),['Weekly OSINT Brief']);
 await page.goto(base+'/studio/content');await page.locator('.category-manager summary').click();
 const row=page.locator('.category-row').filter({has:page.getByLabel('Category name: Regional Outlook',{exact:true})});
 await row.locator('input').fill('Regional & strategic outlook');await row.getByRole('button',{name:'Save name'}).click();
 await page.waitForFunction(()=>document.querySelector('#category-status').textContent.startsWith('Category saved'));
 await page.goto(base+'/#writing');assert.equal(await page.locator(`[data-writing="${custom}"]`).textContent(),'Regional & strategic outlook');
 await page.locator(`[data-writing="${custom}"]`).click();assert.equal(await page.locator('#writing-results article').count(),1);
 await page.goto(base+'/studio/content/edit?collection=essays');await page.locator('#content-form').waitFor({state:'visible'});
 await page.locator('.editor-panel').first().locator('summary').click();await page.locator('#entry-writing-category').selectOption(custom);assert.equal(await page.locator('#entry-writing-category').inputValue(),custom);assert.equal(await page.locator('#editor-section').textContent(),'Regional & strategic outlook');
 for(const width of [320,390,768,1024]){await page.setViewportSize({width,height:900});await page.goto(base+'/studio/content');await page.locator('.category-manager summary').click();await page.locator('.category-row').first().waitFor();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
 await page.goto(base+'/studio/content');await page.locator('.category-manager summary').click();
 const categoryItem=page.locator('.category-item').filter({has:page.getByLabel('Category name: Regional & strategic outlook',{exact:true})});
 await categoryItem.getByRole('button',{name:'Delete Regional & strategic outlook',exact:true}).click();
 for(const width of [320,390,768]){await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
 await categoryItem.getByRole('button',{name:'Cancel',exact:true}).click();assert(await categoryItem.locator('.category-delete').isHidden());
 await categoryItem.getByRole('button',{name:'Delete Regional & strategic outlook',exact:true}).click();
 await categoryItem.getByRole('combobox').selectOption('reports');await categoryItem.getByRole('button',{name:'Confirm delete'}).click();
 await page.waitForFunction(()=>document.querySelector('#category-status').textContent.startsWith('Category deleted'));
 assert.equal(await page.getByLabel('Category name: Regional & strategic outlook',{exact:true}).count(),0);
 await page.goto(base+'/#writing');await page.locator('[data-writing="reports"]').click();
 assert.deepEqual(await page.locator('#writing-results h3').allTextContents(),['Weekly OSINT Brief','Cyber update']);assert.equal(await page.locator(`[data-writing="${custom}"]`).count(),0);
 await page.locator('[data-writing="all"]').click();assert.equal(await page.locator('#writing-results article').count(),3);
 await page.goto(base+'/studio/content/edit?entry=essays/reassigned');await page.locator('#content-form').waitFor({state:'visible'});assert.equal(await page.locator('#entry-writing-category').inputValue(),'reports');
 await page.goto(base+'/osint-brief');assert.equal(await page.locator('h1').textContent(),'OSINT Brief');
 assert((await page.locator('main').textContent()).includes('No OSINT briefs published yet'));
 const unpublished=await context.request.get(base+'/osint-brief/not-published');assert.equal(unpublished.status(),404);
 assert.deepEqual(errors,[]);
 console.log('PASS create/rename/delete categories, explicit move/cancel, retained articles, retired assignments in editor, and category API through real isolated Blobs API, automatic public filters and editor options, stable assignments, four initial writing filters, date order, isolated categories, search/empty state, accessible pressed state, 320–1440px layouts, OSINT authoring entry and unpublished 404; publication data is a fixture');
} finally {await browser.close();}
