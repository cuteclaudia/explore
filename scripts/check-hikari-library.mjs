// Real Hikari WASM, supplied CSP and actual shell; every app/shell HTTP request
// is intercepted. Identity and WebDAV are fixtures, not production acceptance.
// Requires a reviewed prepared static site and installed Chromium/Playwright.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';import {resolve,extname,relative} from 'node:path';import {build} from 'esbuild';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.argv[2];if(!root)throw Error('Usage: node scripts/check-hikari-library.mjs PREPARED_STATIC_SITE');
const shellOrigin='https://explorebyclaudia.netlify.app',appOrigin='https://cuteclaudia-hikari-test.netlify.app';
const bundle=await build({entryPoints:['src/scripts/kobo-shell.ts'],bundle:true,write:false,format:'iife',globalName:'Shell',plugins:[{name:'fixture-auth',setup(b){b.onResolve({filter:/^@netlify\/identity$/},()=>({path:'auth',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:'export function onAuthChange(callback){globalThis.testAuthCallback=callback;return ()=>{};}'}));}}]});
const headersText=await readFile(root+'/_headers','utf8'),csp=headersText.match(/^\s*Content-Security-Policy:\s*(.*)$/m)[1];
let storageAvailable=true;let actor='alice',connection='connection-a',revision=0;const files=new Map(),events=[],launches=new Map();const errors=[],dialogs=[];
const status=()=>({available:storageAvailable,reason:storageAvailable?'ok':'no-connection',userKey:actor,connectionId:storageAvailable?connection:'',provider:'webdav',root:'/Kobo/Hikari',label:'Fixture storage',readOnly:false,maxPutBytes:1048576,maxGetBytes:1048576,settingsUrl:'/studio/storage'});
const launchOptions={...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']};
// Playwright may disable third-party storage partitioning. Use the browser's normal
// partitioning for this cross-site storage test, retaining its other default flags.
const probe=await chromium.launch({...launchOptions,args:[...launchOptions.args,'--enable-automation']});let disableArg;
try{const cdp=await probe.newBrowserCDPSession();const data=await cdp.send('Browser.getBrowserCommandLine');disableArg=data.arguments.find(a=>a.startsWith('--disable-features=')&&a.includes('ThirdPartyStoragePartitioning'));}finally{await probe.close();}
if(disableArg&&process.env.KOBO_BLOCK_STORAGE!=='1'){
 launchOptions.ignoreDefaultArgs=[disableArg];
 launchOptions.args.push('--disable-features='+disableArg.slice('--disable-features='.length).split(',').filter(f=>f!=='ThirdPartyStoragePartitioning').join(','));
}
const browser=await chromium.launch(launchOptions);const context=await browser.newContext({viewport:{width:1280,height:900}});
await context.route(appOrigin+'/**',async route=>{const url=new URL(route.request().url());const file=resolve(root,'.'+(url.pathname==='/'?'/index.html':url.pathname));if(relative(root,file).startsWith('..'))return route.abort();try{const type={'.html':'text/html','.js':'text/javascript','.json':'application/json','.wasm':'application/wasm','.otf':'font/otf','.png':'image/png','.svg':'image/svg+xml'}[extname(file)]||'application/octet-stream';await route.fulfill({path:file,contentType:type,headers:{'Content-Security-Policy':csp,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'}});}catch{await route.fulfill({status:404,body:'Missing fixture asset'});}});
await context.route(shellOrigin+'/**',async route=>{
 const req=route.request(),url=new URL(req.url()),op=url.pathname.split('/').pop(),h=req.headers();
 if(url.pathname==='/shell.js')return route.fulfill({contentType:'text/javascript',body:bundle.outputFiles[0].text});
 if(url.pathname.startsWith('/api/kobo/')){
  events.push({op,path:url.searchParams.get('path'),method:req.method(),actor,connection});const launch=launches.get(h['x-kobo-launch']);if(!launch||launch.actor!==actor)return route.fulfill({status:401,json:{error:{code:'unauthorized',message:'Session changed',retryable:false}}});
  if(op==='status')return route.fulfill({json:status()});
  if(h['x-kobo-connection']!==connection)return route.fulfill({status:412,json:{error:{code:'conflict',message:'Connection changed',retryable:false}}});
  const path=url.searchParams.get('path'),key=actor+'|'+connection+'|'+path,old=files.get(key);
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
const page=await context.newPage();page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE ERROR',e.message)});page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text().slice(0,250))});page.on('dialog',async d=>{dialogs.push(d.message());console.log('DIALOG',d.message());await d.dismiss()});
const launch=async()=>{const launchId=crypto.randomUUID();launches.set(launchId,{actor});const navigation=page.waitForEvent('framenavigated',{predicate:f=>f.url().startsWith(appOrigin),timeout:20000});await page.evaluate(data=>{window.fixtureClosed=false;window.launchApp(data)},{launchId,app:'hikari',origin:appOrigin});const frame=await navigation;await frame.waitForFunction(()=>typeof globalThis.lightcraft?.command==='function',{timeout:60000});await frame.waitForFunction(async()=>{try{const s=JSON.parse(await lightcraft.command('web.stats','{}'));return !!s.library;}catch{return false;}},{timeout:60000});return frame;};
try{
 await page.goto(shellOrigin);let frame=await launch();
 const stats=()=>frame.evaluate(async()=>JSON.parse(await lightcraft.command('web.stats','{}')));
 const info=()=>frame.evaluate(async()=>JSON.parse(await lightcraft.command('library.info','{}')));
 const until=async check=>{const start=Date.now();while(Date.now()-start<30000){if(await check())return;await page.waitForTimeout(150);}throw Error('Hikari state did not reach expected value: '+JSON.stringify(await stats()));};const waitSynced=async()=>{await until(async()=>{const s=await stats();return !!s.kobo?.generation&&!s.kobo.dirty&&!s.kobo.busy&&!s.kobo.paused;});return stats();};
 if(process.env.KOBO_BLOCK_STORAGE==='1'){
   const first=await stats();assert.equal(first.storage,'memory');assert.equal(first.kobo,null);assert.ok(first.storageNote.includes('not saved'));assert.ok(!events.some(e=>e.op==='put'));console.log('PASS storage-blocked scenario: explicit not-saved warning, memory fallback and no false sync claim. Cloud sync is not started in this mode.');
 }else{
 const first=await waitSynced();assert.equal(first.storage,'opfs');assert.ok(first.storageNote.startsWith('Synced to storage'));const initialAlbums=(await info()).albums;const aliceLibrary=first.library;
 await frame.evaluate(()=>lightcraft.command('album.create',JSON.stringify({name:'Alice private album'})));
 await until(async()=>{const s=await stats();return !!s.kobo?.generation&&s.kobo.generation!==first.kobo.generation&&!s.kobo.dirty&&!s.kobo.busy;});
 assert.equal((await info()).albums,initialAlbums+1);const saved=await stats();console.log('PASS real Hikari edit auto-commits a new library generation',saved.kobo.generation);if(process.env.HIKARI_SCREENSHOT)await page.screenshot({path:process.env.HIKARI_SCREENSHOT});
 const aliceHead=files.get('alice|connection-a|library/head.json');assert.ok(aliceHead);
 await page.evaluate(()=>window.shell.close('Fixture reload'));const cdp=await context.newCDPSession(page);await cdp.send('Storage.clearDataForOrigin',{origin:appOrigin,storageTypes:'all'});const beforeReads=events.length;frame=await launch();await waitSynced();assert.equal((await info()).albums,initialAlbums+1);assert.ok(events.slice(beforeReads).some(e=>e.op==='read'&&e.path.startsWith('library/gen/')));assert.equal((await stats()).library,aliceLibrary);console.log('PASS fresh local library restores the committed remote album');
 actor='bob';await page.evaluate(()=>window.testAuthCallback('login'));await page.waitForFunction(()=>window.fixtureClosed===true);assert.equal(await page.locator('iframe').getAttribute('src'),'about:blank');frame=await launch();const bob=await waitSynced();assert.notEqual(bob.library,aliceLibrary);assert.equal((await info()).albums,initialAlbums);console.log('PASS account switch closes old iframe and opens a separate library');
 const bobHead=files.get('bob|connection-a|library/head.json'),body=Buffer.from(bobHead.data);bobHead.etag='"other-device"';
 await frame.evaluate(()=>lightcraft.command('album.create',JSON.stringify({name:'Bob uncommitted album'})));
 await until(async()=>(await stats()).kobo?.paused===true);assert.deepEqual(files.get('bob|connection-a|library/head.json').data,body);assert.equal(files.get('bob|connection-a|library/head.json').etag,'"other-device"');console.log('PASS conflicting save pauses sync without overwriting remote head',await stats());
 connection='connection-b';await page.evaluate(()=>window.testAuthCallback('login'));await page.waitForFunction(()=>window.fixtureClosed===true);frame=await launch();const changed=await waitSynced();assert.notEqual(changed.library,bob.library);assert.equal((await info()).albums,initialAlbums);console.log('PASS connection switch does not silently copy the old local library');
 actor=null;await page.evaluate(()=>window.testAuthCallback('logout'));await page.waitForFunction(()=>window.fixtureClosed===true);assert.equal(await page.locator('iframe').getAttribute('src'),'about:blank');assert.deepEqual(errors,[]);console.log('PASS sign-out teardown; no app exceptions. API and Identity are fixtures, not live kDrive.');storageAvailable=false;actor='unconfigured-user';const launchId=crypto.randomUUID();launches.set(launchId,{actor});await page.evaluate(data=>{window.fixtureClosed=false;window.launchApp(data)},{launchId,app:'hikari',origin:appOrigin});await page.waitForFunction(()=>window.fixtureClosed===true);assert.equal(await page.locator('iframe').getAttribute('src'),'about:blank');assert.ok(![...files.keys()].some(key=>key.startsWith(actor+'|')));console.log('PASS website storage-required guard closes an unconfigured launch before library use.');
 }
}catch(e){console.error(e);console.log('EVENTS',JSON.stringify(events));process.exitCode=1;}finally{await browser.close();}
