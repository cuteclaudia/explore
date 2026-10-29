import {randomUUID} from 'node:crypto';
import {AccessError} from './access.mjs';
import {revision,commit} from './blob-revisions.mjs';

// Catalogue/back-office only. No checkout, payment, stock reservation or paid-file grants.
const KEY='catalogue',MAX_PRODUCTS=150,MAX_COLLECTIONS=40,MAX_DISCOUNTS=80;
export const AU_STATES=['ACT','NSW','NT','QLD','SA','TAS','VIC','WA'];
const fail=message=>{throw new AccessError(400,message);};
function object(value,keys){if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!keys.includes(k)))fail('Invalid store fields.');return value;}
function text(value,max,required=false){if(typeof value!=='string'||value.length>max||required&&!value.trim()||/[\u0000-\u0008\u000b-\u001f]/.test(value))fail('Check the text fields and their lengths.');return value.trim();}
function integer(value,min,max){if(!Number.isSafeInteger(value)||value<min||value>max)fail(`Enter a whole number between ${min} and ${max}.`);return value;}
function boolean(value){if(typeof value!=='boolean')fail('Choose yes or no.');return value;}
function id(value){if(typeof value!=='string'||!/^[-a-z0-9]{1,64}$/.test(value))fail('Invalid store item.');return value;}
function uniqueIds(value,available){if(!Array.isArray(value)||value.length>40||new Set(value).size!==value.length||value.some(v=>!available.includes(v)))fail('Choose existing collections.');return value;}
function pair(min,max,limit){integer(min,0,limit);integer(max,min,limit);}
const blank=()=>({schema:1,currency:'AUD',products:[],collections:[],discounts:[],shipping:{originPostcode:'',rates:[]},movements:[]});
const stamp=()=>new Date().toISOString();
export function productAvailability(product,quantity=1,colourId){
 const p=product.published||product.draft;
 if(p.kind==='digital')return {available:true,ready:0,toPrint:0,minDays:0,maxDays:0,message:'Digital design · Download delivery will be available when checkout opens.'};
 const colours=product.colours||[],colour=colours.find(c=>c.id===colourId)||(colours.filter(c=>c.enabled).length===1?colours.find(c=>c.enabled):null);
 if(!colour)return {available:false,ready:0,toPrint:quantity,minDays:0,maxDays:0,message:'Choose a colour to see stock and dispatch time.'};
 const stock=colour.enabled?colour.stock:0,ready=Math.min(stock,quantity),toPrint=quantity-ready,available=colour.enabled&&(!toPrint||p.allowBackorder&&colour.filamentAvailable);
 const minDays=toPrint?p.printMinDays:p.dispatchMinDays,maxDays=toPrint?p.printMaxDays:p.dispatchMaxDays;
 return {available,ready,toPrint,minDays,maxDays,message:!available?'Out of stock':toPrint?`${ready?`${ready} ready; `:''}${toPrint} to print · Dispatch in ${minDays}–${maxDays} business days`:`${stock} in stock · Dispatch in ${minDays}–${maxDays} business days`};
}
function productInput(input,collections){
 object(input,['id','name','sku','description','kind','priceCents','collectionIds','allowBackorder','printMinDays','printMaxDays','dispatchMinDays','dispatchMaxDays','weightGrams','lengthMm','widthMm','heightMm','licence']);
 const p={id:id(input.id),name:text(input.name,120,true),sku:text(input.sku,60,true),description:text(input.description,4000),kind:input.kind,priceCents:integer(input.priceCents,1,10000000),collectionIds:uniqueIds(input.collectionIds,collections.map(c=>c.id)),licence:text(input.licence,2000)};
 if(!['physical','digital'].includes(p.kind))fail('Choose a physical product or digital STL.');
 if(p.kind==='digital'){
  if(!p.licence)fail('Add a licence description for this digital design.');
  return {...p,allowBackorder:false,printMinDays:0,printMaxDays:0,dispatchMinDays:0,dispatchMaxDays:0,weightGrams:0,lengthMm:0,widthMm:0,heightMm:0};
 }
 pair(input.printMinDays,input.printMaxDays,90);pair(input.dispatchMinDays,input.dispatchMaxDays,30);
 const packing=[input.weightGrams,input.lengthMm,input.widthMm,input.heightMm];if(packing.some(v=>v>0)&&packing.some(v=>!v))fail('Enter all packed measurements, or leave all four blank.');
 if(input.printMinDays<1)fail('Printing must allow at least one business day.');
 return {...p,allowBackorder:boolean(input.allowBackorder),printMinDays:input.printMinDays,printMaxDays:input.printMaxDays,dispatchMinDays:input.dispatchMinDays,dispatchMaxDays:input.dispatchMaxDays,weightGrams:integer(input.weightGrams,0,100000),lengthMm:integer(input.lengthMm,0,3000),widthMm:integer(input.widthMm,0,3000),heightMm:integer(input.heightMm,0,3000)};
}
function discountInput(input,collections){
 object(input,['id','name','code','type','value','minSubtotalCents','collectionId','startsAt','endsAt','enabled']);
 const d={id:id(input.id),name:text(input.name,100,true),code:text(input.code,30).toUpperCase(),type:input.type,value:input.value,minSubtotalCents:integer(input.minSubtotalCents,0,10000000),collectionId:input.collectionId,startsAt:input.startsAt,endsAt:input.endsAt,enabled:boolean(input.enabled)};
 if(d.code&&!/^[A-Z0-9_-]{3,30}$/.test(d.code))fail('Codes need 3–30 letters, numbers, underscores or hyphens.');
 if(!['percent','fixed'].includes(d.type))fail('Choose a percentage or fixed discount.');
 integer(d.value,1,d.type==='percent'?100:10000000);
 if(d.collectionId!==null&&!collections.some(c=>c.id===d.collectionId))fail('Choose an existing collection.');
 for(const key of ['startsAt','endsAt'])if(d[key]!==null&&(typeof d[key]!=='string'||!/^\d{4}-\d{2}-\d{2}T/.test(d[key])||!Number.isFinite(Date.parse(d[key]))))fail('Choose valid discount dates.');
 if(d.startsAt&&d.endsAt&&Date.parse(d.endsAt)<=Date.parse(d.startsAt))fail('The discount must finish after it starts.');
 return d;
}
function shippingInput(input){
 object(input,['originPostcode','rates']);const originPostcode=text(input.originPostcode,4);
 if(originPostcode&&!/^\d{4}$/.test(originPostcode))fail('Enter a four-digit Australian origin postcode.');
 if(!Array.isArray(input.rates)||input.rates.length>20)fail('Use up to 20 shipping rates.');
 const rates=input.rates.map(rate=>{
  object(rate,['id','name','states','amountCents','freeAboveCents','minDays','maxDays','enabled']);
  if(!Array.isArray(rate.states)||new Set(rate.states).size!==rate.states.length||rate.states.some(s=>!AU_STATES.includes(s)))fail('Choose Australian states or territories.');
  pair(rate.minDays,rate.maxDays,60);
  return {id:id(rate.id),name:text(rate.name,80,true),states:rate.states,amountCents:integer(rate.amountCents,0,1000000),freeAboveCents:rate.freeAboveCents===null?null:integer(rate.freeAboveCents,1,10000000),minDays:rate.minDays,maxDays:rate.maxDays,enabled:boolean(rate.enabled)};
 });
 if(new Set(rates.map(r=>r.id)).size!==rates.length)fail('Shipping rate identifiers must be unique.');
 return {originPostcode,rates};
}
export function storeQuote(catalogue,input,now=Date.now()){
 object(input,['items','code','state']);
 if(!Array.isArray(input.items)||!input.items.length||input.items.length>50)fail('Choose 1–50 products.');
 const seen=new Set();
 const lines=input.items.map(item=>{
  object(item,['id','quantity','colourId']);const key=id(item.id);const lineKey=key+':'+(item.colourId||'');if(seen.has(lineKey))fail('Combine quantities for the same product and colour.');seen.add(lineKey);
  const product=catalogue.products.find(p=>p.id===key&&p.published);if(!product)fail('A product is no longer listed.');
  const quantity=integer(item.quantity,1,100),p=product.published;
  let colour=null;if(p.kind==='physical'){colour=product.colours.find(c=>c.enabled&&(item.colourId?c.id===item.colourId:product.colours.filter(v=>v.enabled).length===1));if(!colour)fail('Choose an available product colour.');}
  return {id:key,colourId:colour?.id||null,colourName:colour?.name||null,name:p.name,kind:p.kind,collectionIds:p.collectionIds,quantity,subtotalCents:p.priceCents*quantity,...productAvailability(product,quantity,colour?.id)};
 });
 const subtotalCents=lines.reduce((sum,p)=>sum+p.subtotalCents,0),code=text(input.code||'',30).toUpperCase();
 if(input.state!==null&&!AU_STATES.includes(input.state))fail('Choose an Australian state or territory.');
 const collectionIds=new Set(catalogue.collections.filter(c=>c.visible).map(c=>c.id));
 const candidates=catalogue.discounts.filter(d=>d.enabled&&(!d.code||d.code===code)&&(!d.startsAt||now>=Date.parse(d.startsAt))&&(!d.endsAt||now<Date.parse(d.endsAt))&&subtotalCents>=d.minSubtotalCents&&(!d.collectionId||collectionIds.has(d.collectionId))).map(d=>{
  const eligible=lines.filter(p=>!d.collectionId||p.collectionIds.includes(d.collectionId)).reduce((sum,p)=>sum+p.subtotalCents,0);
  return {id:d.id,name:d.name,code:d.code,amountCents:d.type==='percent'?Math.floor(eligible*d.value/100):Math.min(eligible,d.value)};
 }).filter(d=>d.amountCents>0).sort((a,b)=>b.amountCents-a.amountCents);
 const discount=candidates[0]||null,discountCents=discount?.amountCents||0,physical=lines.filter(p=>p.kind==='physical');
 const shipping=physical.length?(input.state?catalogue.shipping.rates.filter(r=>r.enabled&&(!r.states.length||r.states.includes(input.state))).map(r=>({name:r.name,amountCents:r.freeAboveCents!==null&&subtotalCents-discountCents>=r.freeAboveCents?0:r.amountCents,minDays:r.minDays,maxDays:r.maxDays})):[]):[{name:'Digital delivery',amountCents:0,minDays:0,maxDays:0}];
 return {checkoutEnabled:false,estimateOnly:true,currency:'AUD',lines,subtotalCents,discount:discount?{name:discount.name,amountCents:discount.amountCents}:null,discountCents,codeAccepted:!!code&&candidates.some(d=>d.code===code),shipping,dispatchMinDays:Math.max(0,...physical.map(p=>p.minDays)),dispatchMaxDays:Math.max(0,...physical.map(p=>p.maxDays)),canFulfil:lines.every(p=>p.available),shippingRequired:!!physical.length,notice:'Estimate only. Orders and payments are not open. Dispatch excludes carrier transit; mixed physical orders are assumed to ship together.'};
}
export function hobbyNest(store){
 async function read(){const record=await revision(store,KEY);return {data:record?.data||blank(),etag:record?.etag||null,before:record};}
 const owner=actor=>{if(!actor?.isOwner)throw new AccessError(403,'Only the site owner can manage HobbyNest.');};
 async function settings(actor){owner(actor);const {data,etag}=await read();return {...data,etag,account:actor.user.id,checkoutEnabled:false,carrierStatus:'not-connected',inventoryHistoryLimit:500};}
 async function save(actor,input){
  owner(actor);object(input,['expectedAccount','etag','operation','value']);
  if(input.expectedAccount!==actor.user.id)throw new AccessError(409,'Your account changed. Reload before editing the store.');
  try{
   const {data,etag,before}=await read();if(input.etag!==etag)throw new AccessError(409,'The store changed elsewhere. Reload before saving.');
   const value=input.value;
   switch(input.operation){
    case 'product.save':{
     const p=productInput(value,data.collections),existing=data.products.find(v=>v.id===p.id);
     if(data.products.some(v=>v.id!==p.id&&[v.draft.sku,v.published?.sku].some(sku=>sku?.toLowerCase()===p.sku.toLowerCase())))fail('Use a unique SKU.');
     if(existing){if(existing.draft.kind!==p.kind&&(existing.colours.some(c=>c.stock)||existing.published))fail('Unpublish and remove stock before changing product type.');if(existing.draft.kind!==p.kind)existing.colours=p.kind==='physical'?[{id:'standard',name:'Standard',stock:0,enabled:true,filamentAvailable:false}]:[];existing.draft=p;existing.updatedAt=stamp();}
     else{if(data.products.length>=MAX_PRODUCTS)fail('This catalogue supports up to 150 products.');data.products.push({id:p.id,draft:p,published:null,colours:p.kind==='physical'?[{id:'standard',name:'Standard',stock:0,enabled:true,filamentAvailable:false}]:[],updatedAt:stamp()});}break;
    }
    case 'product.publish':case 'product.unpublish':{
     object(value,['id']);const p=data.products.find(v=>v.id===id(value.id));if(!p)fail('Product not found.');
     p.published=input.operation==='product.publish'?structuredClone(p.draft):null;p.updatedAt=stamp();break;
    }
    case 'colour.save':{
     object(value,['productId','id','name','enabled','filamentAvailable']);const p=data.products.find(p=>p.id===id(value.productId));if(!p||p.draft.kind!=='physical')fail('Choose a physical product.');
     const c={id:id(value.id),name:text(value.name,60,true),enabled:boolean(value.enabled),filamentAvailable:boolean(value.filamentAvailable)},existing=p.colours.find(v=>v.id===c.id);
     if(p.colours.some(v=>v.id!==c.id&&v.name.toLowerCase()===c.name.toLowerCase()))fail('Use a unique colour name for this product.');
     if(existing)Object.assign(existing,c);else{if(p.colours.length>=30)fail('Use up to 30 colours per product.');p.colours.push({...c,stock:0});}p.updatedAt=stamp();break;
    }
    case 'inventory.adjust':{
     object(value,['id','colourId','delta','reason','note']);const p=data.products.find(v=>v.id===id(value.id));if(!p||p.draft.kind!=='physical')fail('Choose a physical product.');
     const colour=p.colours.find(c=>c.id===id(value.colourId));if(!colour)fail('Choose a product colour.');
     const delta=integer(value.delta,-100000,100000);if(!delta)fail('Stock adjustment cannot be zero.');
     if(!['printed','received','correction','damaged','return','manual-sale'].includes(value.reason))fail('Choose a stock reason.');
     if(['printed','received','return'].includes(value.reason)&&delta<0||['damaged','manual-sale'].includes(value.reason)&&delta>0)fail('Check the adjustment direction.');
     const note=text(value.note,300,true),after=integer(colour.stock+delta,0,100000);colour.stock=after;p.updatedAt=stamp();
     data.movements.push({id:randomUUID(),productId:p.id,colourId:colour.id,colourName:colour.name,delta,after,reason:value.reason,note,at:stamp(),actor:actor.user.id});data.movements=data.movements.slice(-500);break;
    }
    case 'collection.save':{
     object(value,['id','name','description','visible']);const c={id:id(value.id),name:text(value.name,100,true),description:text(value.description,500),visible:boolean(value.visible)},existing=data.collections.find(v=>v.id===c.id);
     if(data.collections.some(v=>v.id!==c.id&&v.name.toLowerCase()===c.name.toLowerCase()))fail('Use a unique collection name.');
     if(existing)Object.assign(existing,c);else{if(data.collections.length>=MAX_COLLECTIONS)fail('Use up to 40 collections.');data.collections.push(c);}break;
    }
    case 'collection.delete':{
     object(value,['id']);const key=id(value.id);if(data.products.some(p=>p.draft.collectionIds.includes(key)||p.published?.collectionIds.includes(key))||data.discounts.some(d=>d.collectionId===key))fail('Remove this collection from products and discounts first.');data.collections=data.collections.filter(c=>c.id!==key);break;
    }
    case 'discount.save':{
     const d=discountInput(value,data.collections),existing=data.discounts.find(v=>v.id===d.id);
     if(d.code&&data.discounts.some(v=>v.id!==d.id&&v.code===d.code))fail('This discount code already exists.');
     if(existing)Object.assign(existing,d);else{if(data.discounts.length>=MAX_DISCOUNTS)fail('Use up to 80 discounts.');data.discounts.push(d);}break;
    }
    case 'discount.delete':object(value,['id']);data.discounts=data.discounts.filter(d=>d.id!==id(value.id));break;
    case 'shipping.save':data.shipping=shippingInput(value);break;
    default:fail('Unknown store operation.');
   }
   await commit(store,KEY,data,before);return settings(actor);
  }catch(error){if(error.code==='conflict')throw new AccessError(409,'This save could not be confirmed. Reload and check the latest values before retrying.');throw error;}
 }
 async function publicCatalogue(){const {data}=await read();return {currency:'AUD',checkoutEnabled:false,collections:data.collections.filter(c=>c.visible),products:data.products.filter(p=>p.published).map(p=>({...p.published,collectionIds:p.published.collectionIds.filter(key=>data.collections.some(c=>c.id===key&&c.visible)),stock:p.colours.reduce((sum,c)=>sum+(c.enabled?c.stock:0),0),colours:p.colours.filter(c=>c.enabled).map(c=>({...c,availability:productAvailability(p,1,c.id)})),availability:productAvailability(p)}))};}
 async function quote(actor,input){owner(actor);return storeQuote((await read()).data,input);}
 return {settings,save,publicCatalogue,quote};
}
