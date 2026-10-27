// Real Hikari WASM, supplied CSP and actual shell; every app/shell HTTP request
// is intercepted. Identity and WebDAV are fixtures, not production acceptance.
// Requires a reviewed prepared static site and installed Chromium/Playwright.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';import {resolve,extname,relative} from 'node:path';import {build} from 'esbuild';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const phone=process.env.HIKARI_PHONE==='1';
const contextOptions=phone?{viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1}:{viewport:{width:1280,height:900}};
const root=process.argv[2];if(!root)throw Error('Usage: node scripts/check-hikari-library-thumbnails.mjs PREPARED_STATIC_SITE');
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
const browser=await chromium.launch(launchOptions);let context=await browser.newContext(contextOptions);
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
 return route.fulfill({contentType:'text/html',body:`<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body{margin:0}iframe{max-width:100vw}</style><iframe id="app" sandbox="allow-scripts allow-same-origin allow-downloads allow-popups allow-modals" allow="clipboard-read; clipboard-write; fullscreen" style="width:100%;height:${phone?760:850}px;border:0"></iframe><p id="state"></p><script src="/shell.js"></script><script>window.launchApp=launch=>{window.shell?.close();window.shell=Shell.mountKoboSession({frame:document.querySelector('iframe'),launch,requireStorage:true,onStatus:s=>window.fixtureStatus=s,onClosed:m=>{document.querySelector('p').textContent=m;window.fixtureClosed=true;}})};</script>`});
});
}
await installRoutes(context);
let page=await context.newPage();page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE ERROR',e.message)});page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text().slice(0,250))});page.on('dialog',async d=>{dialogs.push(d.message());console.log('DIALOG',d.message());await d.dismiss()});
const launch=async()=>{const launchId=crypto.randomUUID();launches.set(launchId,{actor});const navigation=page.waitForEvent('framenavigated',{predicate:f=>f.url().startsWith(appOrigin),timeout:20000});await page.evaluate(data=>{window.fixtureClosed=false;window.launchApp(data)},{launchId,app:'hikari',origin:appOrigin});const frame=await navigation;await frame.waitForFunction(()=>typeof globalThis.lightcraft?.command==='function',{timeout:60000});await frame.waitForFunction(async()=>{try{const s=JSON.parse(await lightcraft.command('web.stats','{}'));return !!s.library;}catch{return false;}},{timeout:60000});return frame;};
try{
 await page.goto(shellOrigin);let frame=await launch();const cmd=(id,args={})=>frame.evaluate(async([id,args])=>JSON.parse(await lightcraft.command(id,JSON.stringify(args))),[id,args]),stats=()=>cmd('web.stats');
 const until=async(fn,label)=>{const start=Date.now();while(Date.now()-start<60000){if(await fn())return;await page.waitForTimeout(200);}throw Error('Timed out: '+label+' '+JSON.stringify(await stats()));};
 await until(async()=>!!(await stats()).kobo?.generation,'initial sync');await cmd('file.libraries',{action:'create',name:'Thumbnail restoration acceptance'});await until(async()=>{const s=await stats();return s.libraryId&&s.libraryId!=='main'&&!s.switching;},'empty named library');const id=(await stats()).libraryId;assert.equal((await cmd('library.info')).photos,0);
 await frame.evaluate(async()=>{const dt=new DataTransfer();for(const [name,colour] of [['restore-one.jpg','#d34770'],['restore-two.jpg','#2278b0']]){const c=document.createElement('canvas');c.width=160;c.height=120;const g=c.getContext('2d');g.fillStyle=colour;g.fillRect(0,0,160,120);const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.9));dt.items.add(new File([blob],name,{type:'image/jpeg'}));}document.querySelector('canvas').dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:dt}));});
 await until(async()=>{const s=await stats();return (await cmd('library.info')).photos===2&&s.kobo.generation&&!s.kobo.dirty&&!s.kobo.busy&&!s.dirty&&s.originals.inStorage>=2;},'two originals and named head committed');
 const committed=files.get('alice|connection-a|libraries/'+id+'/head.json');assert(committed);await context.close();context=await browser.newContext(contextOptions);await installRoutes(context);page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.dismiss());await page.goto(shellOrigin);frame=await launch();await until(async()=>(await cmd('file.libraries')).libraries?.some(l=>l.id===id),'fresh registry');await cmd('file.libraries',{action:'open',id});await until(async()=>(await stats()).libraryId===id&&!(await stats()).switching,'fresh profile opens named library');await cmd('view.photoGrid');
 await until(async()=>{const s=await stats();return s.thumbs?.['restore-one.jpg']==='drawn'&&s.thumbs?.['restore-two.jpg']==='drawn';},'both grid thumbnails drawn without opening each photo');assert.equal((await cmd('library.info')).photos,2);assert.deepEqual(errors,[]);console.log('PASS exact RC: two photos/originals committed to a named library, fresh browser opens it, both thumbnails draw automatically without opening individual photos; storage is a fixture');
}catch(error){console.error(error);process.exitCode=1;}finally{await browser.close();}
