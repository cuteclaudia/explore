// Real Hikari WASM, supplied CSP and actual shell; every app/shell HTTP request
// is intercepted. Identity and WebDAV are fixtures, not production acceptance.
// Requires a reviewed prepared static site and installed Chromium/Playwright.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';import {resolve,extname,relative} from 'node:path';import {build} from 'esbuild';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.argv[2];if(!root)throw Error('Usage: node scripts/check-hikari-photo-sync.mjs PREPARED_STATIC_SITE');
const shellOrigin='https://explorebyclaudia.netlify.app',appOrigin='https://cuteclaudia-hikari-test.netlify.app';
const bundle=await build({entryPoints:['src/scripts/kobo-shell.ts'],bundle:true,write:false,format:'iife',globalName:'Shell',plugins:[{name:'fixture-auth',setup(b){b.onResolve({filter:/^@netlify\/identity$/},()=>({path:'auth',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:'export function onAuthChange(callback){globalThis.testAuthCallback=callback;return ()=>{};}'}));}}]});
const headersText=await readFile(root+'/_headers','utf8'),csp=headersText.match(/^\s*Content-Security-Policy:\s*(.*)$/m)[1];
let storageAvailable=true,readOnly=false;let actor='alice',connection='connection-a',revision=0;const files=new Map(),events=[],launches=new Map();const errors=[],dialogs=[];
const status=()=>({available:storageAvailable,reason:storageAvailable?'ok':'no-connection',userKey:actor,connectionId:storageAvailable?connection:'',provider:process.env.KOBO_TEST_PROVIDER||'webdav',root:'/Kobo/Hikari',label:'Fixture storage',readOnly,maxPutBytes:1048576,maxGetBytes:1048576,settingsUrl:'/studio/storage'});
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
  events.push({op,path:url.searchParams.get('path'),method:req.method(),actor,connection});const launch=launches.get(h['x-kobo-launch']);if(!launch||launch.actor!==actor)return route.fulfill({status:401,json:{error:{code:'unauthorized',message:'Session changed',retryable:false}}});
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
 return route.fulfill({contentType:'text/html',body:`<!doctype html><iframe id="app" sandbox="allow-scripts allow-same-origin allow-downloads allow-popups allow-modals" allow="clipboard-read; clipboard-write; fullscreen" style="width:100%;height:850px;border:0"></iframe><p id="state"></p><script src="/shell.js"></script><script>window.launchApp=launch=>{window.shell?.close();window.shell=Shell.mountKoboShell({frame:document.querySelector('iframe'),launch,requireStorage:true,onStatus:s=>window.fixtureStatus=s,onClosed:m=>{document.querySelector('p').textContent=m;window.fixtureClosed=true;}})};</script>`});
});
}
await installRoutes(context);
let page=await context.newPage();page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE ERROR',e.message)});page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text().slice(0,250))});page.on('dialog',async d=>{dialogs.push(d.message());console.log('DIALOG',d.message());await d.dismiss()});
const launch=async()=>{const launchId=crypto.randomUUID();launches.set(launchId,{actor});const navigation=page.waitForEvent('framenavigated',{predicate:f=>f.url().startsWith(appOrigin),timeout:20000});await page.evaluate(data=>{window.fixtureClosed=false;window.launchApp(data)},{launchId,app:'hikari',origin:appOrigin});const frame=await navigation;await frame.waitForFunction(()=>typeof globalThis.lightcraft?.command==='function',{timeout:60000});await frame.waitForFunction(async()=>{try{const s=JSON.parse(await lightcraft.command('web.stats','{}'));return !!s.library;}catch{return false;}},{timeout:60000});return frame;};
try{
 await page.goto(shellOrigin);let frame=await launch();
 const stats=()=>frame.evaluate(async()=>JSON.parse(await lightcraft.command('web.stats','{}'))),info=()=>frame.evaluate(async()=>JSON.parse(await lightcraft.command('library.info','{}')));
 const until=async check=>{const start=Date.now();while(Date.now()-start<45000){if(await check())return;await page.waitForTimeout(150);}throw Error('Photo sync did not reach expected state: '+JSON.stringify(await stats()));};
 await until(async()=>{const s=await stats();return !!s.kobo?.generation&&!s.kobo.dirty&&!s.kobo.busy;});const before=(await info()).photos;
 await frame.evaluate(()=>{window.fixtureResumeKeys=[];const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k.startsWith('kobo-upload/'))window.fixtureResumeKeys.push(k);return original.call(this,k,v);};});
 const imported=await frame.evaluate(async()=>{const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=1000;const c=canvas.getContext('2d'),image=c.createImageData(1000,1000);let seed=1234567;for(let i=0;i<image.data.length;i+=4){for(let j=0;j<3;j++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;image.data[i+j]=seed>>>24;}image.data[i+3]=255;}c.putImageData(image,0,0);const large=await new Promise(r=>canvas.toBlob(r,'image/jpeg',1));canvas.width=40;canvas.height=40;c.fillStyle='pink';c.fillRect(0,0,40,40);const small=await new Promise(r=>canvas.toBlob(r,'image/jpeg',.9));const entries=[];for(const [name,blob] of [['review-small.jpg',small],['review-large.jpg',large]]){const bytes=new Uint8Array(await blob.arrayBuffer()),sha=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join('');entries.push({name,bytes:bytes.length,sha});}const transfer=new DataTransfer();transfer.items.add(new File([small],'review-small.jpg',{type:'image/jpeg'}));transfer.items.add(new File([large],'review-large.jpg',{type:'image/jpeg'}));document.querySelector('canvas').dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:transfer}));return entries;});
 assert(imported[0].bytes<1048576);assert(imported[1].bytes>1048576);await until(async()=>(await info()).photos===before+2);console.log('Imported real JPEGs',imported);
 const key=p=>'alice|connection-a|'+p;
 await until(()=>files.has(key('originals/'+imported[0].sha))&&files.has(key('originals/'+imported[1].sha+'.parts/manifest.json')));
 await until(async()=>{const s=await stats();return !s.kobo.dirty&&!s.kobo.busy&&!s.kobo.paused;});
 const resume=await frame.evaluate(async()=>({scoped:KoboOriginals.MAX_SIZE===256*1024*1024,keys:window.fixtureResumeKeys,library:JSON.parse(await lightcraft.command('web.stats','{}')).library}));
 if(resume?.scoped){assert(resume.keys.some(k=>k.startsWith('kobo-upload/'+resume.library+'/hikari/')));console.log('PASS native photo upload supplies its account/connection scope to the resume journal');}
 const committed=JSON.parse(files.get(key('library/head.json')).data.toString());assert(committed.logical.some(f=>f.file==='originals.json'));
 if(process.env.HIKARI_CACHE_INSPECT==='1')console.log('CACHE_TREE',JSON.stringify(await frame.evaluate(async()=>{const out=[];async function visit(dir,prefix='',depth=0){for await(const [name,h] of dir.entries()){const path=prefix+name;out.push(path+(h.kind==='directory'?'/':''));if(h.kind==='directory'&&depth<3)await visit(h,path+'/',depth+1);}}await visit(await navigator.storage.getDirectory());return out;})));
 const beforeReloadReads=events.length;await context.close();context=await browser.newContext({viewport:{width:1280,height:900}});await installRoutes(context);page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.dismiss());await page.goto(shellOrigin);frame=await launch();await until(async()=>{const s=await stats();return !!s.kobo?.generation&&!s.kobo.dirty&&!s.kobo.busy;});assert.equal((await info()).photos,before+2);
 await until(()=>events.slice(beforeReloadReads).some(e=>e.op==='read'&&e.path.startsWith('originals/')));console.log('PASS new browser context restores the catalog and Hikari automatically fetches the opened original from storage');
 const checks=await frame.evaluate(async data=>{const results=[];for(const photo of data){const bytes=await KoboOriginals.get('hikari',photo.sha);const sha=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join('');results.push({size:bytes.length,sha});}return results;},imported);for(let i=0;i<checks.length;i++){assert.equal(checks[i].sha,imported[i].sha);assert.equal(checks[i].size,imported[i].bytes);}assert.deepEqual(errors,[]);console.log('PASS actual JPEG drop -> background whole/multipart upload -> originals.json catalog commit -> new browser context catalog -> both original bytes/hash restored via real bridge under supplied CSP. Storage HTTP/identity are fixtures, not live providers.');
 readOnly=true;await frame.evaluate(()=>KoboStorage.status('hikari'));const initialWrites=events.filter(e=>e.op==='put').length,initialFiles=files.size;const denial=await frame.evaluate(async()=>{try{await KoboOriginals.put('hikari',new Uint8Array([7,8,9]));return 'unexpected-success';}catch(e){return e.code;}});assert.equal(denial,'forbidden');assert.equal(events.filter(e=>e.op==='put').length,initialWrites+1);assert.equal(files.size,initialFiles);console.log('PASS bridge preserves server readonly refusal for original upload; no fallback to another provider');
}catch(e){console.error(e);console.log('RECENT EVENTS',JSON.stringify(events.slice(-35)));process.exitCode=1;}finally{await browser.close();}
