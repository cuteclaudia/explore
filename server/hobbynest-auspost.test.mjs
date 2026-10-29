import test from 'node:test';
import assert from 'node:assert/strict';
import {auspostPAC,reviewAuspost} from './hobbynest-auspost.mjs';
const parcel={weightGrams:250,lengthMm:200,widthMm:150,heightMm:100};
const prices=(regular='11.15',express='15.65')=>({services:{service:[{code:'AUS_PARCEL_REGULAR',price:regular},{code:'AUS_PARCEL_EXPRESS',price:express}]}});
test('live carrier adapter converts measured units, keeps API keys server-side and uses fresh provider prices',async()=>{
 const calls=[],provider=auspostPAC({apiKey:'test-key-not-real',fetcher:async(url,options)=>{calls.push({url:new URL(url),options});return Response.json(prices());}});
 const rates=await provider.parcel('3000','2000',parcel);assert.equal(rates[0].amountCents,1115);assert.equal(rates[1].amountCents,1565);assert.equal(rates[0].minDays,null);
 const {url,options}=calls[0];assert.equal(url.origin,'https://digitalapi.auspost.com.au');assert.equal(url.searchParams.get('weight'),'0.25');assert.equal(url.searchParams.get('length'),'20');assert.equal(url.searchParams.get('width'),'15');assert.equal(url.searchParams.get('height'),'10');assert(!url.toString().includes('test-key'));assert.equal(options.headers['AUTH-KEY'],'test-key-not-real');assert.equal(options.redirect,'error');assert(!JSON.stringify(rates).includes('test-key'));
 await provider.parcel('3000','2000',parcel);assert.equal(calls.length,2,'basket estimates do not use a stale stored rate table');
});
test('missing credentials, invalid parcels and carrier failures fail closed without a free/manual fallback',async()=>{
 await assert.rejects(auspostPAC({apiKey:''}).parcel('3000','2000',parcel),e=>e.status===503);
 let calls=0;const provider=auspostPAC({apiKey:'test',fetcher:async()=>{calls++;return new Response(null,{status:403});}});
 await assert.rejects(provider.parcel('3000','bad',parcel),e=>e.status===400);await assert.rejects(provider.parcel('3000','2000',{...parcel,weightGrams:0}),e=>e.status===400);assert.equal(calls,0);
 await assert.rejects(provider.parcel('3000','2000',parcel),e=>e.status===503&&!e.message.includes('test'));
 for(const payload of [{error:'bad key'},prices('free'),prices('0'),prices('11.123')])await assert.rejects(auspostPAC({apiKey:'test',fetcher:async()=>Response.json(payload)}).parcel('3000','2000',parcel),e=>e.status===503);
});
test('separate-parcel packing multiplies quantities, intersects services, excludes digital items and bounds request count',async()=>{
 let calls=0;const provider=auspostPAC({apiKey:'test',fetcher:async()=>{calls++;return Response.json(prices());}}),catalogue={shipping:{originPostcode:'3000'},products:[{id:'print',published:parcel},{id:'stl',published:{}}]};
 const lines=[{id:'print',kind:'physical',quantity:2},{id:'stl',kind:'digital',quantity:1}],rates=await provider.basket(catalogue,lines,'2000');assert.equal(rates[0].amountCents,2230);assert.equal(calls,1);assert.match(rates[0].packing,/separate parcel/);
 const digital=await provider.basket(catalogue,[lines[1]],'2000');assert.equal(digital[0].amountCents,0);assert.equal(calls,1);
 await assert.rejects(provider.basket(catalogue,[{...lines[0],quantity:21}],'2000'),e=>e.status===400);
});
test('monthly checks are opt-in, detect sample changes and retain last success after an outage',async()=>{
 const data=new Map([['catalogue',{carrier:{enabled:true,monthlyEnabled:true,referencePostcode:'2000'},shipping:{originPostcode:'3000'}}]]),store={get:async key=>structuredClone(data.get(key)),setJSON:async(key,value)=>data.set(key,structuredClone(value))};let amount=1115,calls=0,offline=false;
 const provider={parcel:async()=>{calls++;if(offline)throw Error('DO NOT EXPOSE KEY');return [{code:'AUS_PARCEL_REGULAR',name:'Parcel Post',amountCents:amount}];}};
 let result=await reviewAuspost(store,{provider,now:new Date('2026-10-01T03:00:00Z')});assert.equal(result.status,'ok');assert.equal(result.changed,false);
 await reviewAuspost(store,{provider,now:new Date('2026-10-20T03:00:00Z')});assert.equal(calls,1,'successful scheduled checks run once per month');
 amount=1215;result=await reviewAuspost(store,{provider,now:new Date('2026-11-01T03:00:00Z')});assert.equal(result.changed,true);
 offline=true;result=await reviewAuspost(store,{provider,now:new Date('2026-12-01T03:00:00Z')});assert.equal(result.status,'failed');assert.equal(result.lastSuccessful.rates[0].amountCents,1215);assert(!JSON.stringify(result).includes('DO NOT EXPOSE'));
 data.get('catalogue').carrier.monthlyEnabled=false;const before=calls;assert.equal((await reviewAuspost(store,{provider})).status,'disabled');assert.equal(calls,before);
});
