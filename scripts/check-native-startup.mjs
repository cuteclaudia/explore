// Actual pinned local WASM builds in authenticated wrapper fixture; no live accounts.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {CAPABILITIES} from '../server/access.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
try{
 const base='http://127.0.0.1:4352',context=await browser.newContext({viewport:{width:1366,height:768}}),page=await context.newPage();
 await context.route('**/*',route=>{const url=new URL(route.request().url());if(url.origin!==base)return route.abort();if(url.pathname.startsWith('/vendor/craft/'))return route.fulfill({path:fileURLToPath(new URL('../public'+url.pathname,import.meta.url)),headers:{'Access-Control-Allow-Origin':'*','Cross-Origin-Resource-Policy':'cross-origin'},...(url.pathname.endsWith('.wasm')?{contentType:'application/wasm'}:url.pathname.endsWith('.js')?{contentType:'text/javascript'}:{})});if(url.pathname==='/api/studio/session')return route.fulfill({json:{id:'audit-owner',isOwner:true,capabilities:Object.fromEntries(Object.keys(CAPABILITIES).map(k=>[k,true]))}});if(url.pathname==='/api/files/list')return route.fulfill({json:[]});if(url.pathname==='/api/storage/preferences')return route.fulfill({json:{defaultDestination:'download'}});if(url.pathname.startsWith('/api/')||url.pathname.startsWith('/.netlify/identity/'))return route.fulfill({status:401,json:{error:'Fixture'}});return route.continue();});
 await mkdir('/workspace/reviews/startup',{recursive:true});
 for(const [slug,id] of [['fumi','wordcraft'],['tsuzuri','pdfcraft'],['hikari','lightcraft'],['irodori-legacy','photocraft']]){
  const start=Date.now();await page.goto(base+'/apps/'+slug);const frame=page.frames().find(f=>f.url().includes('/studio/workspaces/'+id))||await page.waitForEvent('framenavigated',{predicate:f=>f.url().includes('/studio/workspaces/'+id)});
  await frame.waitForFunction(()=>{const canvas=document.querySelector('canvas');return canvas?.width>0&&!document.querySelector('[id$="_loading"]');},null,{timeout:120000});
  await page.waitForFunction(()=>document.getElementById('app-startup').hidden,null,{timeout:15000});
  assert.equal(await page.locator('#workspace-navigation').count(),1);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:'/workspace/reviews/startup/'+slug+'.png'});console.log('PASS actual '+slug+' engine starts, removes loader and signals parent; local fixture cold run '+(Date.now()-start)+' ms (not a production speed benchmark).');
 }
}finally{await browser.close();}
