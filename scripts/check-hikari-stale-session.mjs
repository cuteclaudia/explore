// Real Hikari WASM, supplied CSP and actual shell; every app/shell HTTP request
// is intercepted. Identity and WebDAV are fixtures, not production acceptance.
// Requires a reviewed prepared static site and installed Chromium/Playwright.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';import {resolve,extname,relative} from 'node:path';import {build} from 'esbuild';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.argv[2];if(!root)throw Error('Usage: node scripts/check-hikari-stale-session.mjs PREPARED_STATIC_SITE');
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
 await page.goto(shellOrigin);const frameA=await launch(),pageA=page,contextA=context;
 const stats=frame=>frame.evaluate(async()=>JSON.parse(await lightcraft.command('web.stats','{}'))),info=frame=>frame.evaluate(async()=>JSON.parse(await lightcraft.command('library.info','{}')));
 const until=async(fn,label)=>{const start=Date.now();while(Date.now()-start<40000){if(await fn())return;await new Promise(r=>setTimeout(r,150));}throw Error('Timed out: '+label);};
 const synced=async frame=>until(async()=>{const s=await stats(frame);return !!s.kobo?.generation&&!s.kobo.dirty&&!s.kobo.busy&&!s.kobo.paused;},'synced');
 await synced(frameA);const baseline=await info(frameA),oldGeneration=(await stats(frameA)).kobo.generation,aLaunch=new URL(frameA.url()).hash.slice('#kobo-launch='.length);const aStart=events.length;
 context=await browser.newContext({viewport:{width:1280,height:900}});await installRoutes(context);page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.dismiss());await page.goto(shellOrigin);const frameB=await launch();await synced(frameB);
 const imported=await frameB.evaluate(async()=>{const c=document.createElement('canvas');c.width=1000;c.height=1000;const ctx=c.getContext('2d'),image=ctx.createImageData(1000,1000);let n=77;for(let i=0;i<image.data.length;i+=4){for(let k=0;k<3;k++){n=(Math.imul(n,1664525)+1013904223)>>>0;image.data[i+k]=n>>>24;}image.data[i+3]=255;}ctx.putImageData(image,0,0);const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',1)),bytes=await blob.arrayBuffer(),sha=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(n=>n.toString(16).padStart(2,'0')).join(''),dt=new DataTransfer();dt.items.add(new File([blob],'browser-b-large.jpg',{type:'image/jpeg'}));document.querySelector('canvas').dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:dt}));return {sha,size:blob.size};});
 assert(imported.size>1048576);const key=p=>'alice|connection-a|'+p;await until(()=>files.has(key('originals/'+imported.sha+'.parts/manifest.json')),'large original manifest');await until(async()=>(await info(frameB)).photos===baseline.photos+1,'imported catalog');await synced(frameB);
 // Wait until the committed catalog includes the original lookup as well.
 await until(()=>{const head=JSON.parse(files.get(key('library/head.json')).data),parts=head.files.filter(f=>f.file==='originals.json');return parts.length&&Buffer.concat(parts.map(p=>files.get(key('library/'+p.path)).data)).toString().includes(imported.sha);},'original lookup committed');const savedHead=files.get(key('library/head.json')),savedBytes=Buffer.from(savedHead.data),savedTag=savedHead.etag,newGeneration=JSON.parse(savedBytes).generation;assert.notEqual(oldGeneration,newGeneration);assert.equal((await info(frameA)).photos,baseline.photos);console.log('PASS B imported and synced a real multipart JPEG while A retained an older open catalog');
 await pageA.bringToFront();await pageA.mouse.click(170,740);
 // Deliver the app's own focus event; the shell must not reload the iframe for
 // library-generation changes. Headless windows do not reliably receive OS focus.
 await frameA.evaluate(()=>window.dispatchEvent(new Event('focus')));
 await until(async()=>(await info(frameA)).photos===baseline.photos+1,'older A adopts B catalog after focus');await synced(frameA);
 assert.equal((await stats(frameA)).kobo.paused,false);assert.equal((await stats(frameA)).kobo.generation,newGeneration);
 assert.equal(events.slice(aStart).filter(e=>e.launchId===aLaunch&&e.op==='put'&&e.path==='library/head.json').length,0,'A selection/focus must not PUT a shared head');
 assert.equal(files.get(key('library/head.json')).etag,savedTag);assert.deepEqual(files.get(key('library/head.json')).data,savedBytes);
 const head=JSON.parse(savedBytes);assert(!head.logical.some(f=>['view.json','ui.json'].includes(f.file)),'device view/UI files must not be synced');
 console.log('PASS older open A selects a photo, writes no head, never pauses, and adopts B new catalog/generation in place; B head is unchanged');
 const downloadEvent=pageA.waitForEvent('download',{timeout:15000});downloadEvent.catch(()=>{});await frameA.evaluate(()=>lightcraft.command('file.backupLibrary','{}'));const backup=await downloadEvent;assert((await readFile(await backup.path())).length>0);console.log('PASS refreshed A can still download a nonempty local library backup');
 await context.close();context=contextA;page=pageA;await page.goto(shellOrigin);const restored=await launch();await until(async()=>(await info(restored)).photos===baseline.photos+1,'reopened A retains latest catalog');await synced(restored);assert.equal((await stats(restored)).kobo.paused,false);console.log('PASS same-profile reopen remains current and unpaused');
 // A fresh profile has no paused local state; preserve the original profile.
 context=await browser.newContext({viewport:{width:1280,height:900}});await installRoutes(context);page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.dismiss());await page.goto(shellOrigin);const fresh=await launch();await until(async()=>(await info(fresh)).photos===baseline.photos+1,'fresh profile latest catalog');await synced(fresh);const original=await fresh.evaluate(async sha=>{const bytes=await KoboOriginals.get('hikari',sha);return {size:bytes.length,sha:Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(n=>n.toString(16).padStart(2,'0')).join('')};},imported.sha);assert.equal(original.size,imported.size);assert.equal(original.sha,imported.sha);assert.deepEqual(errors,[]);console.log('PASS fresh profile retrieves B committed photo and matching original bytes without clearing A profile.');

}catch(e){console.error(e);for(const f of page.frames()){if(f.url().startsWith(appOrigin))try{console.log('CURRENT APP',JSON.stringify(await f.evaluate(async()=>({stats:JSON.parse(await lightcraft.command('web.stats','{}')),info:JSON.parse(await lightcraft.command('library.info','{}'))}))));}catch{}}console.log('RECENT EVENTS',JSON.stringify(events.slice(-30)));process.exitCode=1;}finally{await browser.close();}
