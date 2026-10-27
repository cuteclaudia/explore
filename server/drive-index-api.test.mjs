import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
let handler,directory;const owner='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',oldOwner=process.env.OWNER_IDENTITY_ID;
before(async()=>{process.env.OWNER_IDENTITY_ID=owner;globalThis.indexAPITest={session:{id:owner},calls:[]};directory=await mkdtemp(join(tmpdir(),'drive-index-api-'));await build({entryPoints:['netlify/functions/drive-index-recovery.mts'],outfile:join(directory,'api.mjs'),bundle:true,platform:'node',format:'esm',packages:'external',plugins:[{name:'fixtures',setup(b){b.onResolve({filter:/\/access\.mjs$/},()=>({path:resolve('server/access.mjs'),external:true}));b.onResolve({filter:/^@netlify\/identity$/},()=>({path:'identity',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},({path})=>({contents:path==='identity'?`export class AuthError extends Error{};export const getUser=async()=>globalThis.indexAPITest.session;export const admin={getUser:async id=>({id,confirmedAt:'2026-01-01',appMetadata:globalThis.indexAPITest.metadata||{}})};export function verifyRequestOrigin(r){if(r.headers.get('origin')!==new URL(r.url).origin){const e=new AuthError('Forbidden');e.status=403;throw e;}}`:path==='blobs'?'export const getStore=()=>({});':`export const storageProviders=()=>({google:{access:async user=>({userId:user,connectionId:'server-selected',koboVerified:globalThis.indexAPITest.unverified?null:{protocol:1,atomicChecks:{createOnly:true,compareAndSwap:true}}})},recovery:Object.fromEntries(['list','download','capture','upload','begin','step','publish','cancel'].map(op=>[op,async(config,app,...args)=>{globalThis.indexAPITest.calls.push({op,config,app,args});return {ok:true};}]))});`}));b.onResolve({filter:/^@netlify\/blobs$/},()=>({path:'blobs',namespace:'fixture'}));b.onResolve({filter:/storage-providers\.mjs$/},()=>({path:'providers',namespace:'fixture'}));}}]});handler=(await import(pathToFileURL(join(directory,'api.mjs')).href)).default;});
after(async()=>{if(oldOwner===undefined)delete process.env.OWNER_IDENTITY_ID;else process.env.OWNER_IDENTITY_ID=oldOwner;delete globalThis.indexAPITest;await rm(directory,{recursive:true,force:true});});
const call=(op,options={})=>handler(new Request('https://example.test/api/drive-index/'+op,options));
test('index recovery requires fresh sign-in, same-origin mutations, correct methods and registered app',async()=>{globalThis.indexAPITest.session=null;assert.equal((await call('list')).status,401);globalThis.indexAPITest.session={id:owner};for(const op of ['capture','upload','begin','step','publish','cancel'])assert.equal((await call(op,{method:'POST',headers:{Origin:'https://evil.test'}})).status,403);assert.equal((await call('publish')).status,405);assert.equal((await call('list?app=unknown')).status,403);assert.equal((await call('capture',{method:'POST',headers:{Origin:'https://example.test'},body:'{broken'})).status,400);});
test('recovery derives account and connection server-side; export is private and contains no credentials',async()=>{globalThis.indexAPITest.calls=[];const r=await call('begin',{method:'POST',headers:{Origin:'https://example.test'},body:JSON.stringify({app:'hikari',id:'backup',userId:'bob',connectionId:'attacker'})});assert.equal(r.status,200);const [actual]=globalThis.indexAPITest.calls;assert.equal(actual.config.userId,owner);assert.equal(actual.config.connectionId,'server-selected');const response=await call('download?app=hikari&id=backup');assert.equal(response.headers.get('Cache-Control'),'private, no-store');assert(response.headers.get('Content-Disposition').includes('attachment'));assert.equal(response.headers.get('Referrer-Policy'),'no-referrer');});
test('recovery rejects over-limit streamed requests before parsing or provider access',async()=>{const r=await call('upload',{method:'POST',headers:{Origin:'https://example.test'},body:' '.repeat(3*1024*1024+1)});assert.equal(r.status,413);});

test('recovery activation remains gated by the connected provider competing-save verification',async()=>{globalThis.indexAPITest.unverified=true;try{for(const op of ['begin','step','publish'])assert.equal((await call(op,{method:'POST',headers:{Origin:'https://example.test'},body:'{"app":"hikari","id":"backup"}'})).status,403);assert.equal((await call('capture',{method:'POST',headers:{Origin:'https://example.test'},body:'{"app":"hikari"}'})).status,200);}finally{globalThis.indexAPITest.unverified=false;}});


test('beta recovery uses the member account and refuses a removed beta grant',async()=>{
 const member='cccccccc-cccc-4ccc-8ccc-cccccccccccc';
 globalThis.indexAPITest.session={id:member};globalThis.indexAPITest.metadata={capabilities:{'tools.lightcraft':true}};
 try{
  assert.equal((await call('list?app=hikari')).status,403);
  globalThis.indexAPITest.metadata.capabilities['beta.hikari']=true;globalThis.indexAPITest.calls=[];
  const response=await call('capture',{method:'POST',headers:{Origin:'https://example.test'},body:JSON.stringify({app:'hikari',userId:owner,connectionId:'owner'})});
  assert.equal(response.status,200);assert.equal(globalThis.indexAPITest.calls[0].config.userId,member);
  globalThis.indexAPITest.metadata.capabilities['beta.hikari']=false;
  assert.equal((await call('download?app=hikari&id=owner-backup')).status,403);
 }finally{globalThis.indexAPITest.session={id:owner};delete globalThis.indexAPITest.metadata;}
});
