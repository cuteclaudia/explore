import test from 'node:test';
import assert from 'node:assert/strict';
import {createTenantDatabase,createTenantService} from './soraspace-tenant.mjs';
const id='11111111-1111-4111-8111-111111111111',scope={session:{signedCookie:'fixture'},workspaceId:id};
const reject=status=>e=>e.status===status;
function fixture(account={id:'alice',verified:true,suspended:false}){
 let calls=0;
 return {service:createTenantService({database:{transaction(){calls++;throw Error('Unexpected database call');}},verifySession:async()=>account}),calls:()=>calls};
}
test('tenant input cannot supply identities, namespaces, roles or publication state as resource fields',async()=>{
 const f=fixture();
 for(const extra of [{ownerAccountId:'bob'},{workspaceId:id},{storageKey:'../beta/secret'},{role:'owner'},{published:true},JSON.parse('{"__proto__":{"owner":true}}')]){
  await assert.rejects(()=>f.service.create(scope,'document',{title:'Research',...extra}),reject(400));
 }
 assert.equal(f.calls(),0);
});
test('tenant service rejects missing, suspended and unverified identity before touching the database',async()=>{
 for(const account of [null,{id:'alice',verified:false,suspended:false},{id:'alice',verified:true,suspended:true},{id:'alice',verified:true},{id:'',verified:true,suspended:false}]){
  const f=fixture(account);await assert.rejects(()=>f.service.list(scope),reject(401));assert.equal(f.calls(),0);
 }
 const service=createTenantService({database:{transaction(){assert.fail('No database access');}},verifySession:async()=>{throw Error('Provider unavailable');}});
 await assert.rejects(()=>service.read(scope,id),reject(401));
});
test('tenant listing and mutations reject malformed identifiers, unbounded pages, stale version shapes and non-JSON content',async()=>{
 const f=fixture();
 for(const call of [
  ()=>f.service.list({...scope,workspaceId:'../beta'}),
  ()=>f.service.list(scope,{limit:10001}),
  ()=>f.service.list(scope,{limit:0}),
  ()=>f.service.list(scope,{after:"' OR true --"}),
  ()=>f.service.list(scope,{resourceType:'__proto__'}),
  ()=>f.service.read(scope,'not-an-id'),
  ()=>f.service.update(scope,id,'1',{title:'Copy'}),
  ()=>f.service.remove(scope,id,-1),
  ()=>f.service.create(scope,'document',{title:'',body:{}}),
  ()=>f.service.create(scope,'document',{title:'Research',body:[]}),
  ()=>f.service.create(scope,'document',{title:'Research',body:{data:'X'.repeat(60001)}}),
  ()=>f.service.create(scope,'unknown',{title:'Research'})
 ])await assert.rejects(call,reject(400));
 assert.equal(f.calls(),0);
});
test('unsafe database roles fail closed and the connection is discarded',async()=>{
 for(const changed of [{rolsuper:true},{rolbypassrls:true},{rolcreaterole:true},{rolcreatedb:true},{owns:true},{runtime:false},{runtime:undefined}]){
  const calls=[];let released;
  const safe={rolsuper:false,rolbypassrls:false,rolcreaterole:false,rolcreatedb:false,owns:false,runtime:true};
  const db=createTenantDatabase({async connect(){return {async query(sql){calls.push(sql);return {rows:[{...safe,...changed}]};},release(discard){released=discard;}};}});
  await assert.rejects(()=>db.transaction('alice',id,()=>assert.fail('Unsafe callback')),reject(503));
  assert.equal(calls.length,1);assert.equal(released,true);
 }
});
test('rollback failure preserves the original error and destroys the broken pooled connection',async()=>{
 let discarded=false;const failure=Error('Original failure'),queries=[];
 const db=createTenantDatabase({async connect(){return {
  async query(sql){queries.push(sql);if(sql==='ROLLBACK')throw Error('Connection lost');return {rows:[{rolsuper:false,rolbypassrls:false,rolcreaterole:false,rolcreatedb:false,owns:false,runtime:true}]};},release(discard){discarded=discard;}
 };}});
 await assert.rejects(()=>db.transaction('alice',id,()=>{throw failure;}),e=>e===failure);
 assert(queries.includes('ROLLBACK'));assert.equal(discarded,true);
});
