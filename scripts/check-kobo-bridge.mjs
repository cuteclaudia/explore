// Browser integration with Claude's reviewed client. Identity and WebDAV HTTP responses are fixtures.
// PLAYWRIGHT_MODULE may be a file:// URL; CHROMIUM_PATH selects an installed browser.
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const bundle=await build({entryPoints:['src/scripts/kobo-shell.ts'],bundle:true,write:false,format:'iife',globalName:'Shell',plugins:[{name:'auth-fixture',setup(b){b.onResolve({filter:/^@netlify\/identity$/},()=>({path:'auth',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:'export function onAuthChange(callback){globalThis.testAuthCallback=callback;return ()=>{};}'}));}}]});
const scripts={'/kobo-bridge.js':await readFile(new URL('../server/fixtures/kobo-client-v1.js',import.meta.url)),'/kobo-sync.js':await readFile(new URL('../server/fixtures/kobo-sync-v1.js',import.meta.url))};
let actor=true,revision=0,hostOrigin,appOrigin;const files=new Map();
const status={available:true,reason:'ok',userKey:'test-owner',connectionId:'test-connection',provider:'webdav',root:'/Kobo/Hikari',label:'Test fixture',readOnly:false,maxPutBytes:1048576,maxGetBytes:1048576,settingsUrl:'/studio/storage'};
const host=createServer(async(req,res)=>{
 if(req.url==='/shell.js'){res.setHeader('Content-Type','text/javascript');res.end(bundle.outputFiles[0].text);return;}
 if(req.url.startsWith('/api/kobo/')){
  res.setHeader('Content-Type','application/json');if(!actor){res.writeHead(401);res.end(JSON.stringify({error:{code:'unauthorized',message:'Session expired.',retryable:false}}));return;}
  const url=new URL(req.url,hostOrigin),op=url.pathname.split('/').pop(),key=url.searchParams.get('path'),old=files.get(key);
  if(op==='status'){res.end(JSON.stringify(status));return;}
  if(op==='put'){
   const parts=[];for await(const part of req)parts.push(part);
   if(req.headers['if-none-match']==='*'&&old||req.headers['if-match']&&req.headers['if-match']!==old?.etag){res.writeHead(412);res.end(JSON.stringify({error:{code:'conflict',message:'Fixture conflict.',retryable:false}}));return;}
   const record={data:Buffer.concat(parts),etag:'"etag-'+(++revision)+'"'};files.set(key,record);res.end(JSON.stringify({etag:record.etag}));return;
  }
  if(op==='read'){if(!old){res.writeHead(404);res.end();return;}res.setHeader('ETag',old.etag);res.setHeader('Content-Type','application/octet-stream');res.end(old.data);return;}
  if(op==='stat'){res.end(JSON.stringify(old?{size:old.data.length,etag:old.etag,modified:new Date().toISOString()}:null));return;}
  if(op==='list'){const prefix=key?key+'/':'';res.end(JSON.stringify([...files].filter(([k])=>k.startsWith(prefix)&&!k.slice(prefix.length).includes('/')).map(([k,v])=>({name:k.slice(prefix.length),isDir:false,size:v.data.length,etag:v.etag,modified:new Date().toISOString()}))));return;}
  if(op==='remove'){files.delete(key);res.end('null');return;}
 }
 res.setHeader('Content-Type','text/html');res.end('<!doctype html><iframe id="app" sandbox="allow-scripts allow-same-origin allow-downloads"></iframe><p id="state"></p><script src="/shell.js"></script><script>globalThis.shell=Shell.mountKoboShell({frame:document.querySelector("iframe"),launch:{app:"hikari",launchId:"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",origin:'+JSON.stringify(appOrigin)+'},onStatus:s=>{globalThis.koboStatus=s},onClosed:m=>{document.querySelector("p").textContent=m;globalThis.koboClosed=true}})</script>');
});
const app=createServer((req,res)=>{
 if(scripts[req.url]){res.setHeader('Content-Type','text/javascript');res.end(scripts[req.url]);return;}
 if(req.url==='/kobo.json'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({app:'hikari',shellOrigins:[hostOrigin]}));return;}
 res.setHeader('Content-Type','text/html');res.end('<!doctype html><script src="/kobo-bridge.js"></script><script src="/kobo-sync.js"></script>');
});
await new Promise(resolve=>host.listen(0,'127.0.0.1',resolve));await new Promise(resolve=>app.listen(0,'127.0.0.1',resolve));hostOrigin='http://127.0.0.1:'+host.address().port;appOrigin='http://127.0.0.1:'+app.address().port;
let browser;try{
 browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),headless:true,args:['--no-sandbox']});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(hostOrigin);await page.waitForFunction(()=>globalThis.koboStatus?.available===true);
 const frame=page.frames().find(f=>f.url().startsWith(appOrigin));assert.ok(frame);
 assert.equal(await frame.evaluate(()=>{try{return parent.document.body.textContent}catch{return 'blocked'}}),'blocked');
 const basic=await frame.evaluate(async()=>{
  const S=window.KoboStorage;const status=await S.status('hikari');let wrongApp,pathError,tooLarge;try{await S.read('fumi','private')}catch(e){wrongApp=e.code;}try{await S.read('hikari','../private')}catch(e){pathError=e.code;}
  let progress=false,changes=0;const unsubscribe=S.onChange('hikari',()=>changes++);const bytes=new Uint8Array([42,0,255]);const put=await S.put('hikari','library/state',bytes,{ifNoneMatch:'*',onProgress:()=>progress=true});const read=await S.read('hikari','library/state');const list=await S.list('hikari','library');
  try{await S.put('hikari','huge',new Uint8Array(1048577))}catch(e){tooLarge=e.code;}
  await S.status('hikari');unsubscribe();const local=await window.KoboLocal.detect();
  return {status:status.available,wrongApp,pathError,tooLarge,put,read:{etag:read.etag,data:[...read.data]},caller:[...bytes],progress,changes,list,storageClass:local.cls};
 });
 assert.equal(basic.status,true);assert.equal(basic.wrongApp,'forbidden');assert.equal(basic.pathError,'forbidden');assert.equal(basic.tooLarge,'too-large');assert.deepEqual(basic.read,{etag:basic.put.etag,data:[42,0,255]});assert.deepEqual(basic.caller,[42,0,255]);assert.equal(basic.progress,true);assert.ok(basic.changes>0);assert.ok(basic.list.some(x=>x.name==='state'));assert.ok(['persistent','best-effort','session-only','unavailable'].includes(basic.storageClass));
 const sync=await frame.evaluate(async()=>{
  const bytes=new Uint8Array(1048576+17).fill(42),input={'catalog.snap':bytes,'catalog.log':new Uint8Array([1,2])};const base=await KoboSync.commit('hikari',input,null);const read=await KoboSync.pull('hikari');
  const results=await Promise.allSettled([KoboSync.commit('hikari',{'catalog.log':new Uint8Array([1,2,3])},base,{appendOnly:['catalog.log']}),KoboSync.commit('hikari',{'catalog.log':new Uint8Array([1,2,4])},base,{appendOnly:['catalog.log']})]);
  return {size:read.files['catalog.snap'].length,first:read.files['catalog.snap'][0],last:read.files['catalog.snap'].at(-1),callerSize:bytes.length,uploaded:base.uploaded,winners:results.filter(x=>x.status==='fulfilled').length,failures:results.filter(x=>x.status==='rejected').map(x=>x.reason.code)};
 });
 assert.equal(sync.size,1048593);assert.equal(sync.first,42);assert.equal(sync.last,42);assert.equal(sync.callerSize,1048593);assert.equal(sync.uploaded,3);assert.equal(sync.winners,1);assert.deepEqual(sync.failures,['conflict']);
 // A hostile head must be rejected before allocating a logical library or trusting its names.
 const originalHead=files.get('library/head.json');
 const emptyHash='e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
 const emptyFile={file:'catalog.log',size:0,sha256:emptyHash};
 const baseHead={format:'kobo-library',version:1,generation:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',parent:null,files:[],logical:[]};
 for(const logical of [[{...emptyFile,file:'constructor'}],[emptyFile,emptyFile],[{...emptyFile,size:268435457}],[{...emptyFile,size:.5}]]){
  files.set('library/head.json',{data:Buffer.from(JSON.stringify({...baseHead,logical})),etag:'"malformed"'});
  assert.equal(await frame.evaluate(async()=>{try{await KoboSync.pull('hikari');return 'accepted';}catch(e){return e.code;}}),'server');
 }
 files.set('library/head.json',{data:Buffer.alloc(1000001,32),etag:'"oversized"'});
 assert.equal(await frame.evaluate(async()=>{try{await KoboSync.pull('hikari');return 'accepted';}catch(e){return e.code;}}),'server');
 files.set('library/head.json',originalHead);
 actor=false;await frame.evaluate(()=>{KoboStorage.status('hikari').catch(()=>{});return true;});await page.waitForFunction(()=>globalThis.koboClosed===true);assert.equal(await page.locator('iframe').getAttribute('src'),'about:blank');assert.deepEqual(errors,[]);
 console.log('PASS actual Claude bridge + sync: cross-origin handshake/isolation, status/change, binary read/write/progress, caller buffer retained, dir listing, path/app/size refusal, browser storage probe, segmented library commit/pull/hash validation, concurrent-save conflict and expired-session teardown. Identity and WebDAV responses are fixtures; kDrive and Safari remain unverified.');
}finally{await browser?.close();host.closeAllConnections();app.closeAllConnections();await new Promise(resolve=>host.close(resolve));await new Promise(resolve=>app.close(resolve));}
