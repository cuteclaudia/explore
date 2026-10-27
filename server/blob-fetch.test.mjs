import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {getStore} from '@netlify/blobs';
import {conditionalBlobFetch} from './blob-fetch.mjs';
import {verifyAtomicIndex} from './verify-atomic-index.mjs';
import {commit,revision} from './blob-revisions.mjs';

test('only a conditional Blobs PUT conflict is normalized; other requests and statuses remain unchanged',async()=>{
 for(const [method,headers,raw,expected] of [['PUT',{'If-Match':'"base"'},409,412],['PUT',{'If-None-Match':'*'},409,412],['PUT',{},409,409],['GET',{'If-Match':'"base"'},409,409],['DELETE',{'If-Match':'"base"'},409,409],['PUT',{'If-Match':'"base"'},200,200],['PUT',{'If-Match':'"base"'},403,403],['PUT',{'If-Match':'"base"'},412,412],['PUT',{'If-Match':'"base"'},503,503]]){
  let calls=0;const original=new Response('Provider body not to be treated as a successful save',{status:raw});const fetcher=conditionalBlobFetch({fetcher:async()=>{calls++;return original;}}),result=await fetcher('https://blobs.test/key',{method,headers});assert.equal(result.status,expected);assert.equal(calls,1,'normalization must not retry');if(raw===expected)assert.equal(result,original);else assert.equal(await result.text(),'');
 }
});
// Atomic HTTP fixture exposes the live status combination: create losers get
// 412, CAS/stale losers get 409. Run the actual SDK and index code against it.
function backend(){const records=new Map(),statuses=[];const fetcher=async(input,options={})=>{
 const url=new URL(String(input)),method=options.method.toUpperCase(),key=url.pathname,h=new Headers(options.headers),old=records.get(key);
 if(method==='PUT'){
  if(h.get('if-none-match')==='*'&&old){statuses.push(412);return new Response(null,{status:412});}
  if(h.get('if-match')&&old?.etag!==h.get('if-match')){statuses.push(409);return new Response('CAS conflict',{status:409});}
  const data=String(options.body),etag='"'+createHash('sha256').update(data).digest('hex')+'"';records.set(key,{data,etag});statuses.push(200);return new Response(null,{status:200,headers:{etag}});
 }
 if(method==='GET')return old?new Response(old.data,{headers:{etag:old.etag,'Content-Type':'application/json'}}):new Response(null,{status:404});
 if(method==='DELETE'){records.delete(key);return new Response(null,{status:204});}
 throw Error('Unexpected fixture operation');
 };return {records,statuses,fetcher};}
function store(fetcher){return getStore({name:'index',siteID:'test',token:'test-only',edgeURL:'https://blobs.test',uncachedEdgeURL:'https://blobs.test',consistency:'strong',fetch:fetcher});}
test('reproduces the live 200/409 misclassification in the SDK, then passes the unchanged atomic probe with normalization',async()=>{
 const raw=backend();await assert.rejects(verifyAtomicIndex(store(raw.fetcher),'test'),e=>e.code==='server'&&/compare-and-swap: 2 reported accepted/.test(e.message));assert(raw.statuses.includes(409));
 const fixed=backend();assert.deepEqual(await verifyAtomicIndex(store(conditionalBlobFetch({fetcher:fixed.fetcher})),'test'),{createOnly:true,compareAndSwap:true});assert.equal(fixed.statuses.filter(s=>s===409).length,2,'CAS loser and stale retry refused by backend');assert.equal(fixed.records.size,0,'only temporary diagnostic data removed');
});
test('real conditional commits return conflict for a stale 409 and preserve the winning value',async()=>{
 const cloud=backend(),api=store(conditionalBlobFetch({fetcher:cloud.fetcher}));await commit(api,'head',{value:'initial'},null);const before=await revision(api,'head');await commit(api,'head',{value:'winner'},before);await assert.rejects(commit(api,'head',{value:'stale'},before),e=>e.code==='conflict');assert.equal((await api.get('head',{type:'json'})).value,'winner');
});
