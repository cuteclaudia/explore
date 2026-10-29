import {randomUUID} from 'node:crypto';
import {AccessError} from './access.mjs';
import {revision,commit} from './blob-revisions.mjs';
import sharp from 'sharp';
import {auspostPAC,carrierDefaults,reviewAuspost} from './hobbynest-auspost.mjs';
import {validateCosting,calculateCosting} from '../src/lib/hobbynest-costing.mjs';
import {planImport,validateImportRequest} from './hobbynest-import.mjs';

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
const storefrontDefaults=()=>({physicalOpen:false,digitalOpen:false,physicalMessage:'Printed products are temporarily paused.',digitalMessage:'Digital designs are temporarily paused.'});
export const productImageUrl=(productId,imageId)=>`/api/hobbynest/images/${productId}/${imageId}`;
const imageKey=(productId,imageId)=>`product-images/${productId}/${imageId}`;
const imageId=value=>{if(typeof value!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(value))fail('Invalid product image.');return value;};
function photos(product){return {...product,images:(product.images||[]).map(image=>({...image,url:productImageUrl(product.id,image.id)}))};}
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
 object(input,['items','code','state','postcode']);if(input.postcode!==undefined&&input.postcode!==''&&(typeof input.postcode!=='string'||!/^\d{4}$/.test(input.postcode)))fail('Enter a four-digit destination postcode.');
 if(!Array.isArray(input.items)||!input.items.length||input.items.length>50)fail('Choose 1–50 products.');
 const seen=new Set();
 const lines=input.items.map(item=>{
  object(item,['id','quantity','colourId']);const key=id(item.id);const lineKey=key+':'+(item.colourId||'');if(seen.has(lineKey))fail('Combine quantities for the same product and colour.');seen.add(lineKey);
  const product=catalogue.products.find(p=>p.id===key&&p.published);if(!product)fail('A product is no longer listed.');
  const quantity=integer(item.quantity,1,100),p=product.published;
  let colour=null;if(p.kind==='physical'){colour=product.colours.find(c=>c.enabled&&(item.colourId?c.id===item.colourId:product.colours.filter(v=>v.enabled).length===1));if(!colour)fail('Choose an available product colour.');}
  const storefront={...storefrontDefaults(),...catalogue.storefront},channelOpen=p.kind==='physical'?storefront.physicalOpen:storefront.digitalOpen;
  return {id:key,colourId:colour?.id||null,colourName:colour?.name||null,name:p.name,kind:p.kind,collectionIds:p.collectionIds,quantity,subtotalCents:p.priceCents*quantity,channelOpen,channelMessage:channelOpen?'':p.kind==='physical'?storefront.physicalMessage:storefront.digitalMessage,...productAvailability(product,quantity,colour?.id)};
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
 return {checkoutEnabled:false,estimateOnly:true,currency:'AUD',lines,subtotalCents,discount:discount?{name:discount.name,amountCents:discount.amountCents}:null,discountCents,codeAccepted:!!code&&candidates.some(d=>d.code===code),shipping,dispatchMinDays:Math.max(0,...physical.map(p=>p.minDays)),dispatchMaxDays:Math.max(0,...physical.map(p=>p.maxDays)),canFulfil:lines.every(p=>p.available),channelsOpen:lines.every(p=>p.channelOpen),canTestOrder:lines.every(p=>p.available&&p.channelOpen)&&shipping.length>0,shippingRequired:!!physical.length,notice:'Estimate only. Orders and payments are not open. Dispatch excludes carrier transit; mixed physical orders are assumed to ship together.'};
}
export function hobbyNest(store,{carrier=auspostPAC()}={}){
 async function read(){const record=await revision(store,KEY),data=record?.data||blank();data.storefront={...storefrontDefaults(),...data.storefront};data.carrier={...carrierDefaults(),...data.carrier};return {data,etag:record?.etag||null,before:record};}
 const owner=actor=>{if(!actor?.isOwner)throw new AccessError(403,'Only the site owner can manage HobbyNest.');};
 async function settings(actor){owner(actor);const {data,etag}=await read();return {...data,products:data.products.map(p=>({...p,draft:photos(p.draft),published:p.published?photos(p.published):null})),etag,account:actor.user.id,checkoutEnabled:false,carrierConfigured:carrier.configured,carrierStatus:carrier.configured?'API key configured · live account test still required':'API key not configured',carrierReview:await store.get('auspost-review',{type:'json'}),inventoryHistoryLimit:500};}
 async function save(actor,input){
  owner(actor);object(input,['expectedAccount','etag','operation','value']);
  if(input.expectedAccount!==actor.user.id)throw new AccessError(409,'Your account changed. Reload before editing the store.');
  try{
   const {data,etag,before}=await read();if(input.etag!==etag)throw new AccessError(409,'The store changed elsewhere. Reload before saving.');
   const value=input.value;
   switch(input.operation){
    case 'product.save':{
     const p=productInput(value,data.collections),existing=data.products.find(v=>v.id===p.id);
     p.images=existing?.draft.images||[];
     if(data.products.some(v=>v.id!==p.id&&[v.draft.sku,v.published?.sku].some(sku=>sku?.toLowerCase()===p.sku.toLowerCase())))fail('Use a unique SKU.');
     if(existing){if(existing.draft.kind!==p.kind&&(existing.colours.some(c=>c.stock)||existing.published))fail('Unpublish and remove stock before changing product type.');if(existing.draft.kind!==p.kind)existing.colours=p.kind==='physical'?[{id:'standard',name:'Standard',stock:0,enabled:true,filamentAvailable:false}]:[];existing.draft=p;existing.updatedAt=stamp();}
     else{if(data.products.length>=MAX_PRODUCTS)fail('This catalogue supports up to 150 products.');data.products.push({id:p.id,draft:p,published:null,colours:p.kind==='physical'?[{id:'standard',name:'Standard',stock:0,enabled:true,filamentAvailable:false}]:[],updatedAt:stamp()});}break;
    }
    case 'product.publish':case 'product.unpublish':{
     object(value,['id']);const p=data.products.find(v=>v.id===id(value.id));if(!p)fail('Product not found.');
     p.published=input.operation==='product.publish'?structuredClone(p.draft):null;p.updatedAt=stamp();break;
    }
    case 'costing.save':{
     object(value,['productId','model','applyPrice']);const p=data.products.find(p=>p.id===id(value.productId));if(!p)fail('Save the product first.');
     let model,result;try{model=validateCosting(value.model);result=calculateCosting(model,p.draft.priceCents);}catch(error){fail(error.message);}
     p.costing=model;if(boolean(value.applyPrice)){if(result.suggestedPriceCents<1)fail('Add your costs before applying a suggested price.');p.draft.priceCents=result.suggestedPriceCents;}p.updatedAt=stamp();break;
    }
    case 'image.update':{
     object(value,['productId','images']);const p=data.products.find(p=>p.id===id(value.productId));if(!p)fail('Product not found.');
     if(!Array.isArray(value.images)||value.images.length>12)fail('Use up to 12 images per product.');
     const seen=new Set();p.draft.images=value.images.map(image=>{object(image,['id','alt']);const key=imageId(image.id);if(seen.has(key)||!p.draft.images?.some(i=>i.id===key))fail('Choose an image already attached to this product.');seen.add(key);return {id:key,alt:text(image.alt,240,true)};});p.updatedAt=stamp();break;
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
    case 'carrier.save':{object(value,['enabled','monthlyEnabled','referencePostcode']);if(typeof value.referencePostcode!=='string'||!/^\d{4}$/.test(value.referencePostcode))fail('Enter a four-digit reference postcode.');if(value.enabled&&!carrier.configured)fail('Configure AUSPOST_PAC_API_KEY in Netlify before enabling live estimates.');data.carrier={enabled:boolean(value.enabled),monthlyEnabled:boolean(value.monthlyEnabled),referencePostcode:value.referencePostcode};break;}
    case 'storefront.save':{
     object(value,['physicalOpen','digitalOpen','physicalMessage','digitalMessage']);data.storefront={physicalOpen:boolean(value.physicalOpen),digitalOpen:boolean(value.digitalOpen),physicalMessage:text(value.physicalMessage,200,true),digitalMessage:text(value.digitalMessage,200,true)};break;
    }
    default:fail('Unknown store operation.');
   }
   await commit(store,KEY,data,before);return settings(actor);
  }catch(error){if(error.code==='conflict')throw new AccessError(409,'This save could not be confirmed. Reload and check the latest values before retrying.');throw error;}
 }
 async function publicCatalogue(){const {data}=await read();return {currency:'AUD',checkoutEnabled:false,storefront:data.storefront,collections:data.collections.filter(c=>c.visible),products:data.products.filter(p=>p.published).map(p=>({...photos(p.published),collectionIds:p.published.collectionIds.filter(key=>data.collections.some(c=>c.id===key&&c.visible)),stock:p.colours.reduce((sum,c)=>sum+(c.enabled?c.stock:0),0),colours:p.colours.filter(c=>c.enabled).map(c=>({...c,availability:productAvailability(p,1,c.id)})),availability:productAvailability(p)}))};}
 async function upload(actor,input,bytes,type){
  owner(actor);object(input,['productId','expectedAccount','etag','alt']);
  if(input.expectedAccount!==actor.user.id)throw new AccessError(409,'Your account changed. Reload before adding images.');
  const {data,etag,before}=await read();if(input.etag!==etag)throw new AccessError(409,'The store changed elsewhere. Reload before adding images.');
  const p=data.products.find(p=>p.id===id(input.productId));if(!p)fail('Save the product before adding images.');
  if((p.draft.images||[]).length>=12)fail('Use up to 12 images per product.');
  const alt=text(input.alt,240,true),buffer=Buffer.from(bytes);if(!buffer.length||buffer.length>4*1024*1024)throw new AccessError(413,'Use an image under 4 MiB after resizing.');
  const formats={'image/jpeg':'jpeg','image/png':'png','image/webp':'webp'};if(!Object.hasOwn(formats,type))fail('Use a JPEG, PNG or WebP image.');
  let output;try{const image=sharp(buffer,{limitInputPixels:40000000,failOn:'warning'}),metadata=await image.metadata();if(metadata.format!==formats[type]||(metadata.pages||1)!==1)fail('Use a still JPEG, PNG or WebP image matching its file type.');output=await image.rotate().resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).webp({quality:85}).toBuffer();}catch(error){if(error instanceof AccessError)throw error;fail('This image could not be read. Use a valid still JPEG, PNG or WebP under 40 megapixels.');}
  const image={id:randomUUID(),alt};await store.set(imageKey(p.id,image.id),output,{onlyIfNew:true,metadata:{productId:p.id,type:'image/webp'}});
  p.draft.images=[...(p.draft.images||[]),image];p.updatedAt=stamp();
  try{await commit(store,KEY,data,before);}catch(error){if(error.code==='conflict')throw new AccessError(409,'The image attachment could not be confirmed. Reload and check the gallery before retrying.');throw error;}
  return settings(actor);
 }
 async function media(productId,key,actor){
  if(actor)owner(actor);id(productId);imageId(key);const {data}=await read(),p=data.products.find(p=>p.id===productId),snapshot=actor?p?.draft:p?.published;
  if(!snapshot?.images?.some(i=>i.id===key))throw new AccessError(404,'Image not found.');
  const image=await store.getWithMetadata(imageKey(productId,key),{type:'arrayBuffer'});if(!image||image.metadata.productId!==productId)throw new AccessError(404,'Image not found.');return image.data;
 }
 async function quote(actor,input){owner(actor);const {data}=await read(),q=storeQuote(data,input);if(data.carrier.enabled&&q.shippingRequired){q.shipping=await carrier.basket(data,q.lines,input.postcode);q.canTestOrder=q.lines.every(l=>l.available&&l.channelOpen)&&q.shipping.length>0;q.notice+=' Australia Post PAC estimates are provider-reported, with one parcel per physical unit; contract prices, extras and GST presentation must be verified before sales.';}return q;}
 async function carrierCheck(actor){owner(actor);return reviewAuspost(store,{provider:carrier,force:true});}
 async function importProducts(actor,input,apply=false){
  owner(actor);let hash;try{hash=validateImportRequest(input);}catch(error){fail(error.message);}
  if(input.expectedAccount!==actor.user.id)throw new AccessError(409,'Your account changed. Reload before importing.');
  const {data,etag,before}=await read();
  if(apply&&data.lastImport?.id===input.importId&&data.lastImport.hash===hash)return {applied:true,alreadyApplied:true,settings:await settings(actor),counts:data.lastImport.counts};
  if(input.etag!==etag)throw new AccessError(409,'The catalogue changed. Preview the spreadsheet again before importing.');
  let plan;try{plan=planImport(data,input,productInput);}catch(error){fail(error.message);}
  const preview={etag,previewHash:hash,summary:plan.summary,errors:plan.errors,warnings:plan.warnings,counts:plan.counts};if(!apply||plan.errors.length)return {...preview,applied:false};
  if(input.previewHash!==hash)throw new AccessError(409,'The mapping or import options changed. Preview again before importing.');
  for(const item of plan.products){if(item.existing){if(!input.options.updateExisting)continue;item.existing.draft={...item.draft,images:item.existing.draft.images||[]};if(item.existing.draft.kind==='digital')item.existing.colours=[];else if(!item.existing.colours.length)item.existing.colours=[{id:'standard',name:'Standard',enabled:true,filamentAvailable:false,stock:0}];item.existing.updatedAt=stamp();}
   else{data.products.push({id:item.id,draft:{...item.draft,images:[]},published:null,colours:item.colours,updatedAt:stamp()});for(const c of item.colours)if(c.stock)data.movements.push({id:randomUUID(),productId:item.id,colourId:c.id,colourName:c.name,delta:c.stock,after:c.stock,reason:'received',note:'Opening stock from spreadsheet import '+input.importId,at:stamp(),actor:actor.user.id});}}
  data.movements=data.movements.slice(-500);data.lastImport={id:input.importId,hash,at:stamp(),actor:actor.user.id,counts:plan.counts};
  try{await commit(store,KEY,data,before);}catch(error){if(error.code==='conflict')throw new AccessError(409,'The import could not be confirmed. Reload and check the catalogue before retrying.');throw error;}
  return {applied:true,counts:plan.counts,settings:await settings(actor)};
 }
 return {settings,save,publicCatalogue,quote,upload,media,carrierCheck,importProducts};
}
