import test,{before,after,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {randomBytes,randomUUID} from 'node:crypto';
import {getStore} from '@netlify/blobs';
import {BlobsServer} from '@netlify/blobs/server';
import {seal,unseal} from './webdav.mjs';
import {davFiles,appRoot} from './kobo-dav.mjs';
import {connectionId} from './kobo-storage.mjs';
import {memoryDav} from './fixtures/kobo-dav.mjs';
const owner='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',other='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const shell='https://shell.test';let directory,server,options,handler,storageHandler,connections,config,memory;
const names=['OWNER_IDENTITY_ID','OWNER_GOOGLE_IDENTITY_ID','FILE_STORAGE_ENCRYPTION_KEY','WEBDAV_ALLOWED_HOSTS','KOBO_HIKARI_ORIGIN','KOBO_FUMI_ORIGIN','KOBO_STORAGE_ENABLED'],old=Object.fromEntries(names.map(n=>[n,process.env[n]]));
before(async()=>{
 directory=await mkdtemp(join(tmpdir(),'kobo-api-'));server=new BlobsServer({directory:join(directory,'blobs'),token:'test-only',logger:()=>{}});const address=await server.start(),url='http://127.0.0.1:'+address.port;options={siteID:'test',token:'test-only',apiURL:url,edgeURL:url,uncachedEdgeURL:url,consistency:'strong'};
 Object.assign(process.env,{OWNER_IDENTITY_ID:owner,OWNER_GOOGLE_IDENTITY_ID:other,FILE_STORAGE_ENCRYPTION_KEY:randomBytes(32).toString('base64'),WEBDAV_ALLOWED_HOSTS:'dav.example.test',KOBO_HIKARI_ORIGIN:'https://hikari.test',KOBO_FUMI_ORIGIN:'https://fumi.test',KOBO_STORAGE_ENABLED:'false'});
 for(const file of ['kobo-storage','storage-connections']){const outfile=join(directory,file+'.mjs');await build({entryPoints:[resolve('netlify/functions/'+file+'.mts')],outfile,bundle:true,platform:'node',format:'esm',plugins:[{name:'test-services',setup(b){
  b.onResolve({filter:/^@netlify\/identity$/},()=>({path:'identity',namespace:'test'}));b.onLoad({filter:/identity/,namespace:'test'},()=>({contents:`export class AuthError extends Error {};export const getUser=async()=>globalThis.koboApiTest.user?{id:globalThis.koboApiTest.user}:null;export const admin={getUser:async id=>({id,confirmedAt:'2026-01-01',appMetadata:globalThis.koboApiTest.metadata||{}})};export function verifyRequestOrigin(r){if(r.headers.get('origin')!==new URL(r.url).origin){const e=new AuthError('Refused');e.status=403;throw e;}}`}));
  b.onResolve({filter:/^@netlify\/blobs$/},()=>({path:'blobs',namespace:'test'}));b.onLoad({filter:/blobs/,namespace:'test'},()=>({contents:'export const getStore=opts=>globalThis.koboApiTest.store(opts.name);'}));
  b.onResolve({filter:/kobo-dav\.mjs$/},()=>({path:'dav',namespace:'test'}));b.onLoad({filter:/dav/,namespace:'test'},()=>({contents:'export const appRoot=(...args)=>globalThis.koboApiTest.appRoot(...args);export const davFiles=(...args)=>globalThis.koboApiTest.files(...args);'}));
 }}]});const fn=(await import(pathToFileURL(outfile).href)).default;if(file==='kobo-storage')handler=fn;else storageHandler=fn;}
});
after(async()=>{await server?.stop();await rm(directory,{recursive:true,force:true});for(const n of names)if(old[n]===undefined)delete process.env[n];else process.env[n]=old[n];delete globalThis.koboApiTest;});
beforeEach(async()=>{const suffix=randomUUID();memory=memoryDav();globalThis.koboApiTest={user:owner,store:name=>getStore({...options,name:name+'-'+suffix}),appRoot,files:(c,a)=>davFiles(c,a,memory)};connections=globalThis.koboApiTest.store('studio-storage-connections');config={url:'https://dav.example.test/owner/',username:'owner',password:'SECRET_NOT_FOR_APP',baseFolder:'Kobo',koboVerified:{protocol:1}};await connections.setJSON('webdav/'+owner,seal(owner,config));await connections.setJSON('webdav/'+other,seal(other,{...config,url:'https://dav.example.test/other/'}));});
const req=(op,{method='GET',id,body,path,connection=connectionId(owner,config),origin=shell,extra={}}={})=>handler(new Request(shell+'/api/kobo/'+op+(path!==undefined?'?path='+encodeURIComponent(path):''),{method,headers:{...(method!=='GET'?{Origin:origin}:{}),...(id?{'X-Kobo-Launch':id}:{}),'X-Kobo-Connection':connection,...extra},...(body!==undefined?{body:body instanceof Uint8Array?body:JSON.stringify(body)}:{})}));
const launch=async()=>{const response=await req('launch',{method:'POST',body:{app:'hikari'}});assert.equal(response.status,200);return (await response.json()).launchId;};
test('API round-trip returns bytes and exact ETag; status has no WebDAV credentials',async()=>{const id=await launch();const status=await(await req('status',{id})).json();assert.equal(status.available,true);assert.equal(status.connectionId,connectionId(owner,config));assert.ok(!JSON.stringify(status).includes(config.password));const response=await req('put',{id,method:'PUT',path:'library/state',body:new Uint8Array([0,42,255]),extra:{'If-None-Match':'*'}});assert.equal(response.status,200);const {etag}=await response.json();const read=await req('read',{id,path:'library/state'});assert.equal(read.status,200);assert.equal(read.headers.get('etag'),etag);assert.deepEqual(new Uint8Array(await read.arrayBuffer()),new Uint8Array([0,42,255]));assert.equal((await req('remove',{id,method:'DELETE',path:'library/state',extra:{'If-Match':etag}})).status,200);assert.equal((await req('read',{id,path:'library/state'})).status,404);});
test('API enforces CSRF, account binding, path checks, methods, payload limit and revocation',async()=>{const id=await launch();assert.equal((await req('put',{id,method:'PUT',path:'x',body:new Uint8Array([1]),origin:'https://evil.test'})).status,403);assert.equal((await req('put',{id,method:'PUT',path:'../x',body:new Uint8Array([1])})).status,403);assert.equal((await req('put',{id,method:'PUT',path:'x',body:new Uint8Array(1048577)})).status,413);assert.equal((await req('read',{id,method:'POST',path:'x'})).status,405);globalThis.koboApiTest.user=other;assert.equal((await req('status',{id})).status,401);globalThis.koboApiTest.user=null;assert.equal((await req('status',{id})).status,401);assert.equal(memory.calls.length,0);});
test('unconfigured and unverified providers cannot receive writes; changed destination invalidates a launch operation',async()=>{const id=await launch();await connections.delete('webdav/'+owner);assert.equal((await(await req('status',{id})).json()).reason,'no-connection');const preflight=await(await req('launch',{method:'POST',body:{app:'hikari'}})).json();assert.equal(preflight.storageStatus.available,false);assert.equal(preflight.storageStatus.reason,'no-connection');assert.equal((await req('put',{id,method:'PUT',path:'x',body:new Uint8Array([1])})).status,403);await connections.setJSON('webdav/'+owner,seal(owner,{...config,koboVerified:null}));assert.equal((await(await req('status',{id})).json()).available,false);assert.equal((await req('put',{id,method:'PUT',path:'x',body:new Uint8Array([1])})).status,403);await connections.setJSON('webdav/'+owner,seal(owner,{...config,baseFolder:'Different'}));assert.equal((await req('put',{id,method:'PUT',path:'x',body:new Uint8Array([1])})).status,412);assert.equal(memory.calls.length,0);});

test('connection verification endpoint persists only an encrypted verified configuration',async()=>{await connections.setJSON('webdav/'+owner,seal(owner,{...config,koboVerified:null}));const request=origin=>storageHandler(new Request(shell+'/api/storage/webdav/verify-kobo',{method:'POST',headers:{Origin:origin}}));assert.equal((await request('https://evil.test')).status,403);const verified=await request(shell);assert.equal(verified.status,200,await verified.clone().text());assert.equal((await verified.json()).verified,true);const encrypted=await connections.get('webdav/'+owner,{type:'json'});assert.ok(!JSON.stringify(encrypted).includes(config.password));assert.equal(unseal(owner,encrypted).koboVerified.protocol,1);assert.equal([...memory.records.values()].filter(x=>!x.isDir).length,0);});
test('Test & save names missing key/host settings and preserves an existing connection on failure',async()=>{const original=await connections.get('webdav/'+owner,{type:'json'});const key=process.env.FILE_STORAGE_ENCRYPTION_KEY,hosts=process.env.WEBDAV_ALLOWED_HOSTS;const save=()=>storageHandler(new Request(shell+'/api/storage/webdav',{method:'POST',headers:{Origin:shell,'Content-Type':'application/json'},body:JSON.stringify({...config})}));try{delete process.env.FILE_STORAGE_ENCRYPTION_KEY;let response=await save();assert.equal(response.status,503);assert.match((await response.json()).error,/FILE_STORAGE_ENCRYPTION_KEY/);process.env.FILE_STORAGE_ENCRYPTION_KEY=key;process.env.WEBDAV_ALLOWED_HOSTS='different.example.test';response=await save();assert.equal(response.status,400);assert.match((await response.json()).error,/WEBDAV_ALLOWED_HOSTS/);assert.deepEqual(await connections.get('webdav/'+owner,{type:'json'}),original);assert.equal(memory.calls.length,0);}finally{process.env.FILE_STORAGE_ENCRYPTION_KEY=key;process.env.WEBDAV_ALLOWED_HOSTS=hosts;}});
test('the verification endpoint accepts byte-confirmed saves when PUT omits its ETag',async()=>{memory=memoryDav({noPutEtags:true});globalThis.koboApiTest.files=(c,a)=>davFiles(c,a,memory);await connections.setJSON('webdav/'+owner,seal(owner,{...config,koboVerified:null}));const response=await storageHandler(new Request(shell+'/api/storage/webdav/verify-kobo',{method:'POST',headers:{Origin:shell}}));assert.equal(response.status,200,await response.clone().text());assert.equal((await response.json()).verified,true);assert.equal(unseal(owner,await connections.get('webdav/'+owner,{type:'json'})).koboVerified.protocol,1);assert.equal([...memory.records.values()].filter(x=>!x.isDir).length,0);});


test('a non-admin beta member cannot read owner files, borrow a launch, target the owner connection, or retain revoked access',async()=>{
 const member='cccccccc-cccc-4ccc-8ccc-cccccccccccc';
 const ownerLaunch=await launch();
 assert.equal((await req('put',{id:ownerLaunch,method:'PUT',path:'library/owner-only',body:new Uint8Array([11]),extra:{'If-None-Match':'*'}})).status,200);
 const memberConfig={...config,url:'https://dav.example.test/member/',username:'member'};
 await connections.setJSON('webdav/'+member,seal(member,memberConfig));
 globalThis.koboApiTest.user=member;
 globalThis.koboApiTest.metadata={capabilities:{'tools.lightcraft':true}};
 assert.equal((await req('launch',{method:'POST',body:{app:'hikari'}})).status,403);
 globalThis.koboApiTest.metadata.capabilities['beta.hikari']=true;
 const memberLaunch=await launch(),connection=connectionId(member,memberConfig);
 assert.equal((await req('status',{id:ownerLaunch,connection})).status,401);
 const status=await(await req('status',{id:memberLaunch,connection})).json();
 assert.equal(status.userKey,member);assert.equal(status.connectionId,connection);
 assert.ok(!JSON.stringify(status).includes(config.password));assert.notEqual(connection,connectionId(owner,config));
 assert.equal((await req('read',{id:memberLaunch,connection,path:'library/owner-only'})).status,404);
 assert.equal((await req('read',{id:memberLaunch,path:'library/owner-only'})).status,412);
 assert.equal((await req('put',{id:memberLaunch,connection,method:'PUT',path:'library/member-only',body:new Uint8Array([22]),extra:{'If-None-Match':'*'}})).status,200);
 globalThis.koboApiTest.metadata.capabilities['beta.hikari']=false;
 assert.equal((await req('read',{id:memberLaunch,connection,path:'library/member-only'})).status,403);
 globalThis.koboApiTest.metadata.capabilities['beta.hikari']=true;globalThis.koboApiTest.metadata.suspended=true;
 assert.equal((await req('status',{id:memberLaunch,connection})).status,403);
 globalThis.koboApiTest.user=owner;globalThis.koboApiTest.metadata={};
 assert.equal((await req('read',{id:ownerLaunch,path:'library/member-only'})).status,404);
 const own=await req('read',{id:ownerLaunch,path:'library/owner-only'});assert.deepEqual(new Uint8Array(await own.arrayBuffer()),new Uint8Array([11]));
});
