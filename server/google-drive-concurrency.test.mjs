import test from 'node:test';
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {getStore} from '@netlify/blobs';
import {BlobsServer} from '@netlify/blobs/server';
const hash=value=>createHash('sha256').update(value).digest('hex');
async function competingWrites(storeOptions,config,path,conditions){
 const workers=[],ready=[];let timer;
 try{return await new Promise((resolve,reject)=>{
  const results=[];timer=setTimeout(()=>reject(Error('Independent Drive writers timed out.')),15000);
  for(const writer of [1,2]){const w=new Worker(new URL('./fixtures/google-drive-writer.mjs',import.meta.url),{workerData:{storeOptions,config,path,conditions,writer}});workers.push(w);w.on('error',reject);w.on('message',m=>{if(m.ready){ready.push(m.id);if(ready.length===2)workers.forEach(w=>w.postMessage('commit'));}if(m.done){results.push(m);if(results.length===2)resolve({results,uploads:ready});}});}
 });}finally{clearTimeout(timer);await Promise.all(workers.map(w=>w.terminate()));}
}
test('separate Drive writer isolates enforce atomic create-only and CAS through Blobs, without a shared lock',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'drive-concurrency-')),server=new BlobsServer({directory,token:'test-only',logger:()=>{}});
 try{
  const address=await server.start(),url='http://127.0.0.1:'+address.port;
  const options={name:'drive-index',siteID:'test',token:'test-only',apiURL:url,edgeURL:url,uncachedEdgeURL:url,consistency:'strong'},store=getStore(options);
  const config={provider:'google-drive',userId:'alice',connectionId:hash('connection'),rootId:'root_123'},owner=hash(config.userId),scope={owner,connectionId:config.connectionId,app:'hikari'};
  await store.setJSON('folders/'+owner+'/'+config.connectionId+'/hikari',{...scope,id:'folder_123'});
  const path='library/head.json',key='entries/'+owner+'/'+config.connectionId+'/hikari/'+hash(path);
  const check=async conditions=>{const {results,uploads}=await competingWrites(options,config,path,conditions);assert.equal(uploads.length,2,'both writers passed preconditions before committing');const wins=results.filter(r=>r.result),loses=results.filter(r=>r.error);assert.equal(wins.length,1);assert.equal(loses.length,1);assert.equal(loses[0].error.code,'conflict');const current=await store.get(key,{type:'json'});assert.equal(current.remoteId,'uploaded_'+wins[0].writer);assert.equal(current.sha256,hash(new Uint8Array([wins[0].writer])));assert.equal(wins[0].result.etag,'"gd1-'+current.version+'"');return current;};
  const created=await check({ifNoneMatch:'*'});
  const changed=await check({ifMatch:'"gd1-'+created.version+'"'});
  assert.notEqual(created.version,changed.version);
  // An existing head cannot be recreated, and a stale CAS cannot change it.
  for(const conditions of [{ifNoneMatch:'*'},{ifMatch:'"gd1-'+created.version+'"'}]){
   const w=new Worker(new URL('./fixtures/google-drive-writer.mjs',import.meta.url),{workerData:{storeOptions:options,config,path,conditions,writer:3}});
   try{const result=await new Promise((resolve,reject)=>{w.on('message',resolve);w.on('error',reject);});assert.equal(result.error.code,'conflict');}finally{await w.terminate();}
  }
  assert.equal((await store.get(key,{type:'json'})).version,changed.version);
 }finally{await server.stop();await rm(directory,{recursive:true,force:true});}
});
