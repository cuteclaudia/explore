// Real Hikari WASM, supplied CSP and actual shell; every app/shell HTTP request
// is intercepted. Identity and WebDAV are fixtures, not production acceptance.
// Requires a reviewed prepared static site and installed Chromium/Playwright.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';import {resolve,extname,relative} from 'node:path';import {build} from 'esbuild';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.argv[2];if(!root)throw Error('Usage: node scripts/check-hikari-conflict-recovery.mjs PREPARED_STATIC_SITE');
const shellOrigin='https://explorebyclaudia.netlify.app',appOrigin='https://cuteclaudia-hikari-test.netlify.app';
const bundle=await build({entryPoints:['src/scripts/kobo-shell.ts'],bundle:true,write:false,format:'iife',globalName:'Shell',plugins:[{name:'fixture-auth',setup(b){b.onResolve({filter:/^@netlify\/identity$/},()=>({path:'auth',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:'export function onAuthChange(callback){globalThis.testAuthCallback=callback;return ()=>{};}'}));}}]});
const headersText=await readFile(root+'/_headers','utf8'),csp=headersText.match(/^\s*Content-Security-Policy:\s*(.*)$/m)[1];
let storageAvailable=true,readOnly=false;let actor='alice',connection='connection-a',revision=0;const files=new Map(),events=[],launches=new Map();const errors=[],dialogs=[];
const status=()=>({storageEpoch:'legacy',available:storageAvailable,reason:storageAvailable?'ok':'no-connection',userKey:actor,connectionId:storageAvailable?connection:'',provider:process.env.KOBO_TEST_PROVIDER||'webdav',root:'/Kobo/Hikari',label:'Fixture storage',readOnly,maxPutBytes:1048576,maxGetBytes:1048576,settingsUrl:'/studio/storage'});
const launchOptions={...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']};
// Playwright may disable third-party storage partitioning. Use the browser's normal
// partitioning for this cross-site storage test, retaining its other default flags.
const probe=await chromium.launch({...launchOptions,args:[...launchOptions.args,'--enable-automation']});let disableArg;
try{const cdp=await probe.newBrowserCDPSession();const data=await cdp.send('Browser.getBrowserCommandLine');disableArg=data.arguments.find(a=>a.startsWith('--disable-features=')&&a.includes('ThirdPartyStoragePartitioning'));}finally{await probe.close();}
if(disableArg&&process.env.KOBO_BLOCK_STORAGE!=='1'){
 launchOptions.ignoreDefaultArgs=[disableArg];
 launchOptions.args.push('--disable-features='+disableArg.slice('--disable-features='.length).split(',').filter(f=>f!=='ThirdPartyStoragePartitioning').join(','));
}
const browser=await chromium.launch(launchOptions);let context=await browser.newContext({viewport:{width:1280,height:900}});
async function installRoutes(context){
await context.route(appOrigin+'/**',async route=>{const url=new URL(route.request().url());const file=resolve(root,'.'+(url.pathname==='/'?'/index.html':url.pathname));if(relative(root,file).startsWith('..'))return route.abort();try{const type={'.html':'text/html','.js':'text/javascript','.json':'application/json','.wasm':'application/wasm','.otf':'font/otf','.png':'image/png','.svg':'image/svg+xml'}[extname(file)]||'application/octet-stream';await route.fulfill({path:file,contentType:type,headers:{'Content-Security-Policy':csp,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'}});}catch{await route.fulfill({status:404,body:'Missing fixture asset'});}});
await context.route(shellOrigin+'/**',async route=>{
 const req=route.request(),url=new URL(req.url()),op=url.pathname.split('/').pop(),h=req.headers();
 if(url.pathname==='/shell.js')return route.fulfill({contentType:'text/javascript',body:bundle.outputFiles[0].text});
 if(url.pathname.startsWith('/api/kobo/')){
  events.push({launchId:h['x-kobo-launch'],op,path:url.searchParams.get('path'),method:req.method(),actor,connection});const launch=launches.get(h['x-kobo-launch']);if(!launch||launch.actor!==actor)return route.fulfill({status:401,json:{error:{code:'unauthorized',message:'Session changed',retryable:false}}});
  if(op==='status')return route.fulfill({json:status()});
  if(h['x-kobo-connection']!==connection)return route.fulfill({status:412,json:{error:{code:'conflict',message:'Connection changed',retryable:false}}});
  const path=url.searchParams.get('path'),key=actor+'|'+connection+'|'+path,old=files.get(key);
  if(readOnly&&['put','remove'].includes(op))return route.fulfill({status:403,json:{error:{code:'forbidden',message:'Read-only fixture',retryable:false}}});
  if(op==='put'){
   if(h['if-none-match']==='*'&&old||h['if-match']&&h['if-match']!==old?.etag)return route.fulfill({status:412,json:{error:{code:'conflict',message:'Fixture conflict',retryable:false}}});
   const value={data:req.postDataBuffer()||Buffer.alloc(0),etag:'"v'+(++revision)+'"'};files.set(key,value);return route.fulfill({json:{etag:value.etag}});
  }
  if(op==='read')return old?route.fulfill({contentType:'application/octet-stream',body:old.data,headers:{ETag:old.etag}}):route.fulfill({status:404,body:''});
  if(op==='stat')return route.fulfill({json:old?{size:old.data.length,etag:old.etag,modified:new Date().toISOString()}:null});
  if(op==='list'){const prefix=actor+'|'+connection+'|'+(path?path+'/':'');return route.fulfill({json:[...files].filter(([k])=>k.startsWith(prefix)&&!k.slice(prefix.length).includes('/')).map(([k,v])=>({name:k.slice(prefix.length),isDir:false,size:v.data.length,etag:v.etag,modified:new Date().toISOString()}))});}
  if(op==='remove'){files.delete(key);return route.fulfill({json:null});}
 }
 return route.fulfill({contentType:'text/html',body:`<!doctype html><iframe id="app" sandbox="allow-scripts allow-same-origin allow-downloads allow-popups allow-modals" allow="clipboard-read; clipboard-write; fullscreen" style="width:100%;height:850px;border:0"></iframe><p id="state"></p><script src="/shell.js"></script><script>window.launchApp=launch=>{window.shell?.close();window.shell=Shell.mountKoboSession({frame:document.querySelector('iframe'),launch,requireStorage:true,onStatus:s=>window.fixtureStatus=s,onClosed:m=>{document.querySelector('p').textContent=m;window.fixtureClosed=true;}})};</script>`});
});
}
await installRoutes(context);
let page=await context.newPage();page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE ERROR',e.message)});page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text().slice(0,250))});page.on('dialog',async d=>{dialogs.push(d.message());console.log('DIALOG',d.message());await d.dismiss()});
const launch=async()=>{const launchId=crypto.randomUUID();launches.set(launchId,{actor});const navigation=page.waitForEvent('framenavigated',{predicate:f=>f.url().startsWith(appOrigin),timeout:20000});await page.evaluate(data=>{window.fixtureClosed=false;window.launchApp(data)},{launchId,app:'hikari',origin:appOrigin});const frame=await navigation;await frame.waitForFunction(()=>typeof globalThis.lightcraft?.command==='function',{timeout:60000});await frame.waitForFunction(async()=>{try{const s=JSON.parse(await lightcraft.command('web.stats','{}'));return !!s.library;}catch{return false;}},{timeout:60000});return frame;};
try{
 const stats=f=>f.evaluate(async()=>JSON.parse(await lightcraft.command('web.stats','{}'))),cmd=(f,id,args={})=>f.evaluate(async([id,args])=>JSON.parse(await lightcraft.command(id,JSON.stringify(args))),[id,args]);
 const until=async(fn,label)=>{const start=Date.now();while(Date.now()-start<45000){if(await fn())return;await new Promise(r=>setTimeout(r,200));}throw Error('Timed out: '+label);};
 const synced=f=>until(async()=>{const s=await stats(f);return !!s.kobo?.generation&&!s.kobo.dirty&&!s.kobo.busy&&!s.kobo.paused&&!s.switching;},'synced');
 const key=p=>'alice|connection-a|'+p,photoRating=async(f,id)=>(await cmd(f,'photo.inspect',{id})).rating||0;
 await page.goto(shellOrigin);const A=await launch(),pageA=page;await synced(A);const id=(await cmd(A,'photo.inspect')).id;
 context=await browser.newContext({viewport:{width:1280,height:900}});await installRoutes(context);page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.dismiss());await page.goto(shellOrigin);let B=await launch();await synced(B);
 await cmd(A,'photo.rate',{ids:[id],rating:5});await synced(A);const committed=files.get(key('library/head.json'));await cmd(B,'photo.rate',{ids:[id],rating:2});
 await until(async()=>{const s=await stats(B);return s.libConflict&&s.kobo.paused;},'real conflict');assert.equal(files.get(key('library/head.json')).etag,committed.etag);assert.equal(await photoRating(B,id),2);assert.equal((await cmd(B,'file.libraries')).conflict,true);console.log('PASS genuine stale edit pauses and preserves local rating without overwriting winner');
 await page.goto(shellOrigin);B=await launch();await until(async()=>(await stats(B)).libConflict,'persisted conflict');assert.equal((await stats(B)).kobo.paused,true);assert.equal(await photoRating(B,id),2);console.log('PASS genuine conflict and local edit survive a same-profile relaunch');
 await cmd(B,'file.libraries',{action:'keepBoth'});await until(async()=>{const s=await stats(B);return !s.switching&&!s.libConflict&&!s.kobo.paused;},'Keep both');await synced(B);assert.equal(await photoRating(B,id),5);const libs=await cmd(B,'file.libraries'),copy=libs.libraries.find(l=>l.name.includes("this device's copy"));assert(copy);await cmd(B,'file.libraries',{action:'open',id:copy.id});await until(async()=>(await stats(B)).libraryId===copy.id&&!(await stats(B)).switching,'open preserved copy');await synced(B);assert.equal(await photoRating(B,id),2);assert(files.has(key('libraries/'+copy.id+'/head.json')));assert.equal(files.get(key('library/head.json')).etag,committed.etag);console.log('PASS Keep both preserves losing edits in a separately synced named library and leaves main unchanged');
 await cmd(B,'file.libraries',{action:'rename',id:copy.id,name:'Recovered local edits'});await until(async()=>(await cmd(B,'file.libraries')).libraries.some(l=>l.id===copy.id&&l.name==='Recovered local edits'),'rename copy');await cmd(B,'file.libraries',{action:'open',id:'main'});await until(async()=>(await stats(B)).libraryId==='main'&&!(await stats(B)).switching,'return main');await synced(B);
 await cmd(B,'file.libraries',{action:'hide',id:copy.id});await until(async()=>(await cmd(B,'file.libraries')).libraries.some(l=>l.id===copy.id&&l.hidden),'hide copy');assert(files.has(key('libraries/'+copy.id+'/head.json')));await cmd(B,'file.libraries',{action:'show',id:copy.id});console.log('PASS named-library rename/hide/show preserves its data and the main root');
 // Reopen B to put its next periodic poll beyond this controlled stale edit.
 await page.goto(shellOrigin);B=await launch();await synced(B);await cmd(A,'photo.rate',{ids:[id],rating:3});await synced(A);const parent=JSON.parse(files.get(key('library/head.json')).data).generation;await cmd(B,'photo.rate',{ids:[id],rating:4});await until(async()=>(await stats(B)).libConflict,'second real conflict');await cmd(B,'file.libraries',{action:'useMine'});await synced(B);assert.equal(await photoRating(B,id),4);assert.equal(JSON.parse(files.get(key('library/head.json')).data).parent,parent);await A.evaluate(()=>window.dispatchEvent(new Event('focus')));await until(async()=>await photoRating(A,id)===4,'other session adopts chosen head');await synced(A);assert.deepEqual(errors,[]);console.log('PASS Use this device conditionally publishes a child of the current remote head; the other clean session adopts it');
 console.log('PASS release-candidate conflict and library checks use exact WASM/CSP/website shell with atomic fixture storage, not live providers');
}catch(error){console.error(error);console.log('RECENT EVENTS',JSON.stringify(events.slice(-25)));process.exitCode=1;}finally{await browser.close();}
