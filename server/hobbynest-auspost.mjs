import {AccessError} from './access.mjs';
const HOST='https://digitalapi.auspost.com.au/postage/parcel/domestic/service.json';
export const carrierDefaults=()=>({enabled:false,monthlyEnabled:false,referencePostcode:'2000'});
const postcode=value=>{if(typeof value!=='string'||!/^\d{4}$/.test(value))throw new AccessError(400,'Enter four-digit Australian dispatch and destination postcodes.');return value;};
function cents(value){const raw=String(value);if(!/^\d+(?:\.\d{1,2})?$/.test(raw))throw new AccessError(503,'Australia Post returned an unsupported price.');const [whole,fraction='']=raw.split('.'),amount=Number(whole)*100+Number(fraction.padEnd(2,'0'));if(!Number.isSafeInteger(amount)||amount<=0||amount>1000000)throw new AccessError(503,'Australia Post returned an unsupported price.');return amount;}
async function boundedJSON(response){const reader=response.body?.getReader();if(!reader)throw new Error('Empty carrier response');let size=0;const chunks=[];try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>128*1024){await reader.cancel();throw new Error('Carrier response too large');}chunks.push(value);}}finally{reader.releaseLock();}return JSON.parse(Buffer.concat(chunks).toString('utf8'));}
export function auspostPAC({apiKey=process.env.AUSPOST_PAC_API_KEY,fetcher=globalThis.fetch}={}){
 async function parcel(origin,destination,p){
  if(!apiKey)throw new AccessError(503,'Australia Post is not configured. Add its server-side API key before enabling live estimates.');
  const from=postcode(origin),to=postcode(destination);
  for(const key of ['weightGrams','lengthMm','widthMm','heightMm'])if(!Number.isSafeInteger(p[key])||p[key]<=0)throw new AccessError(400,'Add all packed weights and dimensions before requesting Australia Post rates.');
  const url=new URL(HOST);for(const [key,value] of Object.entries({from_postcode:from,to_postcode:to,weight:p.weightGrams/1000,length:p.lengthMm/10,width:p.widthMm/10,height:p.heightMm/10}))url.searchParams.set(key,String(value));
  let payload;try{const response=await fetcher(url,{headers:{'AUTH-KEY':apiKey,Accept:'application/json'},redirect:'error',signal:AbortSignal.timeout(8000)});if(!response.ok)throw new Error('Carrier refused request');payload=await boundedJSON(response);}catch{throw new AccessError(503,'Australia Post could not provide a quote. Check the API access, postcodes and parcel limits, then try again. No free-postage fallback was applied.');}
  const services=payload?.services?.service;if(!Array.isArray(services))throw new AccessError(503,'Australia Post returned an unsupported service response. Verify API access and current response format.');
  const rates=services.filter(s=>['AUS_PARCEL_REGULAR','AUS_PARCEL_EXPRESS'].includes(s.code)).map(s=>({code:s.code,name:s.code==='AUS_PARCEL_REGULAR'?'Australia Post · Parcel Post':'Australia Post · Express Post',amountCents:cents(s.price),minDays:null,maxDays:null,source:'Australia Post PAC',quotedAt:new Date().toISOString()}));
  if(!rates.length)throw new AccessError(503,'Australia Post returned no supported service for this parcel.');return rates;
 }
 async function basket(catalogue,lines,destination){
  const physical=lines.filter(l=>l.kind==='physical');if(!physical.length)return [{name:'Digital delivery',amountCents:0,minDays:0,maxDays:0}];
  if(physical.reduce((sum,l)=>sum+l.quantity,0)>20||new Set(physical.map(l=>l.id)).size>8)throw new AccessError(400,'Request a manual shipping quote for this larger basket. Live testing supports up to 20 separate parcels and 8 product types.');
  // Explicit first packing policy: each finished product unit ships in its own measured parcel.
  const groups=new Map();for(const line of physical){const p=catalogue.products.find(p=>p.id===line.id)?.published;if(!p)throw new AccessError(400,'Product no longer available.');const group=groups.get(line.id)||{p,quantity:0};group.quantity+=line.quantity;groups.set(line.id,group);}
  const quoted=await Promise.all([...groups.values()].map(async group=>({group,rates:await parcel(catalogue.shipping.originPostcode,destination,group.p)})));
  let combined=null;for(const {group,rates} of quoted){combined=combined===null?rates.map(r=>({...r,amountCents:r.amountCents*group.quantity})):combined.flatMap(r=>{const match=rates.find(v=>v.code===r.code);return match?[{...r,amountCents:r.amountCents+match.amountCents*group.quantity}]:[];});}
  if(!combined.length)throw new AccessError(503,'No common Australia Post service covers all parcels.');return combined.map(r=>({...r,packing:'Each physical unit is a separate parcel. Combining items is not configured.'}));
 }
 return {parcel,basket,configured:!!apiKey};
}
export async function reviewAuspost(store,{provider=auspostPAC(),force=false,now=new Date()}={}){
 const record=await store.get('catalogue',{type:'json'}),config={...carrierDefaults(),...record?.carrier};
 if(!config.enabled||!config.monthlyEnabled&&!force)return {status:'disabled'};
 const previous=await store.get('auspost-review',{type:'json'}),month=now.toISOString().slice(0,7);
 if(!force&&previous?.month===month&&previous.status==='ok')return previous;
 let review;try{const rates=await provider.parcel(record.shipping.originPostcode,config.referencePostcode,{weightGrams:1000,lengthMm:200,widthMm:150,heightMm:100});const basis={origin:record.shipping.originPostcode,destination:config.referencePostcode,weightGrams:1000,lengthMm:200,widthMm:150,heightMm:100};const comparable=previous?.lastSuccessful&&JSON.stringify(previous.lastSuccessful.basis)===JSON.stringify(basis),changed=!!comparable&&JSON.stringify(previous.lastSuccessful.rates.map(r=>[r.code,r.amountCents]).sort((a,b)=>a[0].localeCompare(b[0])))!==JSON.stringify(rates.map(r=>[r.code,r.amountCents]).sort((a,b)=>a[0].localeCompare(b[0])));review={status:'ok',month,checkedAt:now.toISOString(),changed,lastSuccessful:{checkedAt:now.toISOString(),basis,rates},message:changed?'Reference parcel rates changed. Basket estimates use fresh live quotes.':'Reference parcel connection and rates checked. This does not verify every tariff, region or contract rate.'};}catch{review={status:'failed',month,checkedAt:now.toISOString(),changed:false,lastSuccessful:previous?.lastSuccessful||null,message:'Australia Post check failed. Verify the API key, origin postcode and account access. Last successful sample, if any, is retained; it is not a fallback quote.'};}
 await store.setJSON('auspost-review',review);return review;
}
