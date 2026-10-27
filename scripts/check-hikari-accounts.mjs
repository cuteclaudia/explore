// Account-isolation verification with real Hikari WASM and its strict CSP. Every app/shell HTTP request
// is intercepted. Identity and WebDAV are fixtures, not production acceptance.
// Requires a reviewed prepared static site and installed Chromium/Playwright.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';import {resolve,extname,relative} from 'node:path';import {build} from 'esbuild';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.argv[2],upgradeFrom=process.argv[3];let servedRoot=upgradeFrom||root;if(!root)throw Error('Usage: node scripts/check-hikari-accounts.mjs PREPARED_STATIC_SITE [PREVIOUS_STATIC_SITE]');
const shellOrigin='https://explorebyclaudia.netlify.app',appOrigin='https://cuteclaudia-hikari-test.netlify.app';
const bundle=await build({entryPoints:['src/scripts/kobo-shell.ts'],bundle:true,write:false,format:'iife',globalName:'Shell',plugins:[{name:'fixture-auth',setup(b){b.onResolve({filter:/^@netlify\/identity$/},()=>({path:'auth',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:'export function onAuthChange(callback){globalThis.testAuthCallback=callback;return ()=>{};}'}));}}]});
const headersText=await readFile(root+'/_headers','utf8'),csp=headersText.match(/^\s*Content-Security-Policy:\s*(.*)$/m)[1];
let storageAvailable=false,knownConnection=false;let actor='alice',connection='connection-a',revision=0;const files=new Map(),events=[],launches=new Map();const errors=[],dialogs=[];
const status=()=>({available:storageAvailable,reason:storageAvailable?'ok':knownConnection?'provider-unavailable':actor?'no-connection':'signed-out',userKey:actor,connectionId:knownConnection?connection:'',provider:process.env.KOBO_TEST_PROVIDER||'webdav',root:'/Kobo/Hikari',label:'Fixture storage',readOnly:false,maxPutBytes:1048576,maxGetBytes:1048576,settingsUrl:'/studio/storage'});
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
await context.route(appOrigin+'/**',async route=>{const url=new URL(route.request().url());const file=resolve(servedRoot,'.'+(url.pathname==='/'?'/index.html':url.pathname));if(relative(servedRoot,file).startsWith('..'))return route.abort();try{const type={'.html':'text/html','.js':'text/javascript','.json':'application/json','.wasm':'application/wasm','.otf':'font/otf','.png':'image/png','.svg':'image/svg+xml'}[extname(file)]||'application/octet-stream';await route.fulfill({path:file,contentType:type,headers:{'Content-Security-Policy':csp,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'}});}catch{await route.fulfill({status:404,body:'Missing fixture asset'});}});
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
 return route.fulfill({contentType:'text/html',body:`<!doctype html><iframe id="app" sandbox="allow-scripts allow-same-origin allow-downloads allow-popups allow-modals" allow="clipboard-read; clipboard-write; fullscreen" style="width:100%;height:850px;border:0"></iframe><p id="state"></p><script src="/shell.js"></script><script>window.launchApp=launch=>{window.shell?.close();window.shell=Shell.mountKoboShell({frame:document.querySelector('iframe'),launch,requireStorage:false,onStatus:s=>window.fixtureStatus=s,onClosed:m=>{document.querySelector('p').textContent=m;window.fixtureClosed=true;}})};</script>`});
});
const page=await context.newPage();page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE ERROR',e.message)});page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text().slice(0,250))});page.on('dialog',async d=>{dialogs.push(d.message());console.log('DIALOG',d.message());await d.dismiss()});
const launch=async()=>{const launchId=crypto.randomUUID();launches.set(launchId,{actor});const navigation=page.waitForEvent('framenavigated',{predicate:f=>f.url().startsWith(appOrigin),timeout:20000});await page.evaluate(data=>{window.fixtureClosed=false;window.launchApp(data)},{launchId,app:'hikari',origin:appOrigin});const frame=await navigation;await frame.waitForFunction(()=>typeof globalThis.lightcraft?.command==='function',{timeout:60000});await frame.waitForFunction(async()=>{try{const s=JSON.parse(await lightcraft.command('web.stats','{}'));return !!s.library;}catch{return false;}},{timeout:60000});return frame;};
try{
 if(upgradeFrom){actor='upgrade-owner';storageAvailable=true;knownConnection=true;}
 await page.goto(shellOrigin);let frame=await launch();
 const stats=()=>frame.evaluate(async()=>JSON.parse(await lightcraft.command('web.stats','{}')));
 const info=()=>frame.evaluate(async()=>JSON.parse(await lightcraft.command('library.info','{}')));
 const settle=async()=>{const start=Date.now();while(Date.now()-start<30000){const s=await stats();if(s.library)return s;await page.waitForTimeout(100);}throw Error('Library did not open.');};
 const reopen=async()=>{await page.evaluate(()=>window.shell.close('Fixture switch'));frame=await launch();return settle();};
 if(upgradeFrom){const old=await settle(),oldAlbums=(await info()).albums;await frame.evaluate(()=>lightcraft.command('album.create',JSON.stringify({name:'Before upgrade private album'})));await frame.waitForFunction(async()=>{const s=JSON.parse(await lightcraft.command('web.stats','{}'));return !!s.kobo?.generation&&!s.kobo.dirty&&!s.kobo.busy;},{timeout:30000});servedRoot=root;await reopen();await frame.waitForFunction(async()=>{const s=JSON.parse(await lightcraft.command('web.stats','{}'));return !!s.kobo?.generation&&!s.kobo.dirty&&!s.kobo.busy;},{timeout:30000});assert.equal((await stats()).library,old.library);assert.equal((await info()).albums,oldAlbums+1);console.log('PASS previous → current build upgrade keeps the connected local namespace and saved album');actor='alice';storageAvailable=false;knownConnection=false;await reopen();}
 const a=await settle(),base=(await info()).albums;assert.ok(a.library.startsWith('library-user-'));
 await frame.evaluate(()=>lightcraft.command('album.create',JSON.stringify({name:'Alice private offline album'})));await page.waitForTimeout(1200);assert.equal((await info()).albums,base+1);
 actor='bob';const b=await reopen();assert.ok(b.library.startsWith('library-user-'));assert.notEqual(a.library,b.library);assert.equal((await info()).albums,base);
 await frame.evaluate(()=>lightcraft.command('album.create',JSON.stringify({name:'Bob private offline album'})));await page.waitForTimeout(1200);
 actor='alice';assert.equal((await reopen()).library,a.library);assert.equal((await info()).albums,base+1);console.log('PASS unconfigured Alice/Bob libraries remain separate and reopen with their own albums');
 actor=null;const guest=await reopen();assert.equal(guest.library,'library');assert.equal((await info()).albums,base);console.log('PASS signed-out guest never opens the account library');
 actor='alice';knownConnection=true;const offlineA=await reopen();assert.ok(offlineA.library.startsWith('library-kobo-'));assert.notEqual(offlineA.library,a.library);assert.equal((await info()).albums,base);
 await frame.evaluate(()=>lightcraft.command('album.create',JSON.stringify({name:'Alice connection-offline album'})));await page.waitForTimeout(1200);
 actor='bob';const offlineB=await reopen();assert.notEqual(offlineA.library,offlineB.library);assert.equal((await info()).albums,base);
 actor='alice';assert.equal((await reopen()).library,offlineA.library);assert.equal((await info()).albums,base+1);console.log('PASS unavailable-provider libraries remain isolated by account and connection');
 storageAvailable=true;await page.evaluate(()=>window.testAuthCallback('login'));await frame.waitForFunction(async()=>{try{const s=JSON.parse(await lightcraft.command('web.stats','{}'));return !!s.kobo?.generation&&!s.kobo.dirty&&!s.kobo.busy&&!s.kobo.paused;}catch{return false;}},{timeout:30000});assert.equal((await stats()).library,offlineA.library);assert.equal((await info()).albums,base+1);assert.equal(dialogs.length,0,'no automatic guest or other-account copy prompt');console.log('PASS storage returning uses the same connection library without a reload or implicit copy');
 assert.deepEqual(errors,[]);console.log('PASS supplied Hikari build account separation under the supplied CSP. Identity and storage HTTP are simulated. Photo-original isolation and live providers are not tested here.');
}catch(e){console.error(e);console.log('EVENTS',JSON.stringify(events));process.exitCode=1;}finally{await browser.close();}
