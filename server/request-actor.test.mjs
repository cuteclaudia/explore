import test from 'node:test';
import assert from 'node:assert/strict';
import {requestActor,withActorRequest,scopedActor} from './request-actor.mjs';
import {requireCapability} from './access.mjs';
const owner='11111111-1111-4111-8111-111111111111',member='22222222-2222-4222-8222-222222222222';
const request=(cookie='nf_jwt=owner',origin='https://www.claudiagilbert.com')=>new Request(origin+'/studio/downloads',{headers:cookie?{cookie}:{}});
const data=(id=owner)=>({setupRequired:false,id,email:id+'@example.test',isOwner:id===owner,capabilities:{'settings.manage':id===owner,'tools.lightcraft':true}});
const status=n=>e=>e.status===n;
test('SSR verifies the request cookie through the native session endpoint, with no redirects or shared cache',async()=>{
 let calls=0;const actor=await requestActor(request(),{ownerIds:[owner],fetcher:async(url,options)=>{calls++;assert.equal(url.href,'https://www.claudiagilbert.com/api/studio/session');assert.equal(options.headers.Cookie,'nf_jwt=owner');assert.equal(options.redirect,'error');assert.equal(options.cache,'no-store');assert(options.signal);return Response.json(data());}});
 assert.equal(calls,1);assert.equal(actor.isOwner,true);requireCapability(actor,'settings.manage');assert.equal(actor.permissions['users.manage'],false);
});
test('SSR rejects missing credentials, untrusted hosts, refused sessions, setup responses and service failures',async()=>{
 let called=false;const never=async()=>{called=true;throw Error('must not fetch');};
 await assert.rejects(requestActor(request(''),{fetcher:never}),status(401));await assert.rejects(requestActor(request('nf_jwt=secret','https://evil.test'),{fetcher:never,siteURL:''}),status(503));assert.equal(called,false);
 for(const code of [401,403,500,302])await assert.rejects(requestActor(request(),{fetcher:async()=>new Response(null,{status:code})}),status([401,403].includes(code)?code:503));
 for(const body of [{setupRequired:true,id:owner},{...data(),isOwner:false},{...data(),capabilities:{'users.manage':'true'}},{...data(),id:'forged'},{...data(),capabilities:{constructor:true}}])await assert.rejects(requestActor(request(),{ownerIds:[owner],fetcher:async()=>Response.json(body)}),status(503));
 await assert.rejects(requestActor(request(),{fetcher:async()=>{throw Error('timeout');}}),status(503));
});
test('request-local verification is shared only within a request; concurrent accounts and later revocation stay separate',async()=>{
 let calls=0;const options={ownerIds:[owner],fetcher:async(_url,options)=>{calls++;const id=options.headers.Cookie.endsWith('owner')?owner:member;await new Promise(resolve=>setTimeout(resolve,id===owner?8:1));return Response.json(data(id));}};
 const run=cookie=>withActorRequest(request(cookie),async()=>{const first=scopedActor(options),second=scopedActor(options);assert.equal(first,second);return first;});
 const [a,b]=await Promise.all([run('nf_jwt=owner'),run('nf_jwt=member')]);assert.equal(a.user.id,owner);assert.equal(b.user.id,member);assert.equal(b.isOwner,false);assert.throws(()=>requireCapability(b,'settings.manage'),status(403));assert.equal(calls,2);assert.equal(scopedActor(options),null);
 await withActorRequest(request(),()=>assert.rejects(scopedActor({ownerIds:[owner],fetcher:async()=>new Response(null,{status:403})}),status(403)));
});
