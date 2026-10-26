import sanitize from 'sanitize-html';
import {randomUUID} from 'node:crypto';
import {AccessError,requireCapability} from './access.mjs';
const entryLocks=new Map();
async function locked(key,action){const result=(entryLocks.get(key)||Promise.resolve()).catch(()=>{}).then(action);entryLocks.set(key,result);try{return await result;}finally{if(entryLocks.get(key)===result)entryLocks.delete(key);}}
export const COLLECTIONS=['journal','essays','cyber','photography'];
export const PREFIXES={journal:'journal',essays:'chinaseries',cyber:'dailycyberreport',photography:'photography'};
export const keyFor=(collection,slug)=>{
 if(!COLLECTIONS.includes(collection)||typeof slug!=='string'||!/^[a-z0-9][a-z0-9-]{0,199}$/.test(slug))throw new AccessError(400,'Choose a supported section and a URL name using lowercase letters, numbers and hyphens.');
 return collection+'/'+slug;
};
export const mediaURL=(id,key)=>'/api/content/media/'+id+'?entry='+encodeURIComponent(key);
export function safeImage(value,key){
 if(typeof value!=='string'||value.length>2000)return '';
 if(/^https:\/\//i.test(value)){try{const u=new URL(value);return u.username||u.password?'':u.href;}catch{return '';}}
 if(/^\/images\/[a-zA-Z0-9_./%-]+$/.test(value)&&!value.includes('..'))return value;
 const m=value.match(/^\/api\/content\/media\/([0-9a-f-]{36})\?entry=([^&]+)$/i);
 if(m){try{return decodeURIComponent(m[2])===key?mediaURL(m[1],key):'';}catch{}}
 return '';
}
export function cleanHTML(html,key){
 if(typeof html!=='string'||html.length>500000)throw new AccessError(400,'Article text must be under 500,000 characters.');
 return sanitize(html,{allowedTags:['p','br','h1','h2','h3','h4','strong','b','em','i','u','s','del','blockquote','ul','ol','li','a','img','figure','figcaption','hr','pre','code','table','thead','tbody','tr','th','td','sup','sub'],allowedAttributes:{a:['href','title'],img:['src','alt','title'],ol:['start'],td:['colspan','rowspan'],th:['colspan','rowspan']},allowedSchemes:['https','http','mailto'],allowProtocolRelative:false,transformTags:{img:(_tag,attrs)=>({tagName:'img',attribs:{src:safeImage(attrs.src,key),alt:String(attrs.alt||'').slice(0,1000)}})},exclusiveFilter:frame=>frame.tag==='img'&&!frame.attribs.src});
}
const text=(value,max=1000)=>typeof value==='string'?value.trim().slice(0,max):'';
const tags=value=>Array.isArray(value)?[...new Set(value.filter(x=>typeof x==='string').map(x=>text(x,80)).filter(Boolean))].slice(0,30):[];
export function cleanDraft(input,key){
 if(!input||typeof input!=='object')throw new AccessError(400,'Content is required.');
 const title=text(input.title,250);if(!title)throw new AccessError(400,'Add a title before saving.');
 const date=text(input.date,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||(!Number.isFinite(Date.parse(date+'T00:00:00Z'))||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date))throw new AccessError(400,'Choose a valid publication date.');
 const cover=safeImage(input.cover,key);if(input.cover&&!cover)throw new AccessError(400,'Choose an uploaded image or a supported HTTPS image URL.');
 if(input.photos&&!Array.isArray(input.photos))throw new AccessError(400,'Invalid photo collection.');
 if(input.photos?.length>100)throw new AccessError(400,'Keep each gallery to 100 photographs or fewer.');
 const photos=(input.photos||[]).map(p=>{const image=safeImage(p.image,key);if(!image)throw new AccessError(400,'A photograph has an unsupported image address.');return {id:text(p.id,80)||randomUUID(),image,alt:text(p.alt),caption:text(p.caption,2000),tags:tags(p.tags)};});
 return {title,date,summary:text(input.summary,3000),tags:tags(input.tags),location:text(input.location,250),locationPrecision:['hidden','exact','approximate'].includes(input.locationPrecision)?input.locationPrecision:'hidden',cover,coverAlt:text(input.coverAlt),html:cleanHTML(input.html||'',key),photos};
}
export function mayEdit(actor,record){
 if(actor.isOwner)return;
 if(record.collection==='photography'){requireCapability(actor,'galleries.manage_own');}
 else requireCapability(actor,record.ownerId===actor.user.id?'journal.edit_own':'articles.edit_any');
 if(record.ownerId!==actor.user.id)requireCapability(actor,'articles.edit_any');
}
function mayPublish(actor,record){if(actor.isOwner)return;requireCapability(actor,record.ownerId===actor.user.id?'journal.publish_own':'articles.publish_any');}
export function contentService(store,legacy=async()=>[]){
 async function source(key){return (await legacy()).find(x=>x.key===key);}
 async function stored(key){
  const path='entries/'+key;const result=await store.getWithMetadata(path,{type:'json'});
  if(!result||result.etag)return result;
  // Some Blobs runtimes (including the local emulator) omit ETags on GET.
  // Bracket a fresh strong read with matching list ETags; never pair stale data with a newer revision.
  const listed=async()=>((await store.list({prefix:path})).blobs.find(x=>x.key===path))?.etag;
  const before=await listed(),fresh=await store.getWithMetadata(path,{type:'json'}),after=await listed();
  if(!before||before!==after||!fresh)throw new AccessError(409,'The item changed while loading. Please retry.');
  return {...fresh,etag:after};
 }
 async function get(key){const [collection,slug,...rest]=String(key).split('/');if(rest.length)throw new AccessError(400,'Invalid content address.');keyFor(collection,slug);const saved=await stored(key);if(saved)return saved.data;const old=await source(key);if(old)return old;throw new AccessError(404,'Content not found.');}
 async function all(){const {blobs}=await store.list({prefix:'entries/'});const records=new Map((await legacy()).map(x=>[x.key,x]));for(const b of blobs){const r=await store.get(b.key,{type:'json'});if(r)records.set(r.key,r);}return [...records.values()];}
 async function publicList(collection){return (await all()).filter(r=>!r.deletedAt&&r.published&&(!collection||r.collection===collection)).map(r=>({key:r.key,collection:r.collection,slug:r.slug,...r.published})).sort((a,b)=>b.date.localeCompare(a.date));}
 async function publicEntry(key){const r=await get(key);if(r.deletedAt||!r.published)throw new AccessError(404,'This page is not published.');return {key:r.key,collection:r.collection,slug:r.slug,...r.published};}
 async function save(actor,key,body){return locked(key,async()=>{
  const [collection,slug]=key.split('/');keyFor(collection,slug);
  const existing=await stored(key);const before=existing?.data||await source(key);
  if(!before&&!actor.isOwner)requireCapability(actor,'journal.create');
  const record=before||{key,collection,slug,ownerId:actor.user.id,version:0,published:null};mayEdit(actor,record);
  if(record.deletedAt)throw new AccessError(409,'Restore this item from the bin before editing it.');
  if(body.version!==record.version)throw new AccessError(409,'This item changed in another tab. Reload it before saving so those changes are not overwritten.');
  if(!['draft','publish','unpublish'].includes(body.action))throw new AccessError(400,'Choose Save draft, Publish or Unpublish.');
  if(body.action!=='draft')mayPublish(actor,record);
  const draft=cleanDraft(body.draft,key);
  if(body.action==='publish'&&collection==='photography'&&!draft.photos.length)throw new AccessError(400,'Add at least one photograph before publishing a gallery.');
  const result={...record,draft,version:record.version+1,writeId:randomUUID(),updatedAt:new Date().toISOString(),published:body.action==='publish'?structuredClone(draft):body.action==='unpublish'?null:record.published};
  if(existing&&!existing.etag)throw new AccessError(503,'The storage revision could not be verified. Please retry.');
  const written=await store.setJSON('entries/'+key,result,existing?{onlyIfMatch:existing.etag}:{onlyIfNew:true});
  if(written?.modified===false)throw new AccessError(409,'Another save completed first. Reload before saving again.');
  if((await store.get('entries/'+key,{type:'json'}))?.writeId!==result.writeId)throw new AccessError(409,'The save could not be confirmed. Reload before retrying.');
  return result;
 });}
 async function upload(actor,key,bytes,type){const record=await get(key);mayEdit(actor,record);requireCapability(actor,'media.upload');const b=new Uint8Array(bytes);if(!b.length||b.length>4*1024*1024)throw new AccessError(400,'Use an image under 4 MiB after resizing.');
  const valid=type==='image/jpeg'&&b[0]===255&&b[1]===216&&b[2]===255||type==='image/png'&&b[0]===137&&b[1]===80&&b[2]===78&&b[3]===71||type==='image/webp'&&new TextDecoder().decode(b.slice(0,4))==='RIFF'&&new TextDecoder().decode(b.slice(8,12))==='WEBP';if(!valid)throw new AccessError(400,'Use a valid JPEG, PNG or WebP.');
  const id=randomUUID();await store.set('images/'+id,bytes,{metadata:{entry:key,type}});return {id,url:mediaURL(id,key)};
 }
 function references(draft,id,key){const url=mediaURL(id,key);return draft&&(draft.cover===url||draft.photos?.some(p=>p.image===url)||draft.html?.includes(url.replaceAll('&','&amp;'))||draft.html?.includes(url));}
 async function media(id,key,actor){if(!/^[0-9a-f-]{36}$/i.test(id))throw new AccessError(404,'Image not found.');const record=await get(key);if(actor)mayEdit(actor,record);const image=await store.getWithMetadata('images/'+id,{type:'arrayBuffer'});if(!image||image.metadata.entry!==key)throw new AccessError(404,'Image not found.');if(!actor&&!references(record.published,id,key))throw new AccessError(404,'Image is not published.');return image;}
 async function manage(actor,key,body){return locked(key,async()=>{
  const existing=await stored(key);const record=existing?.data||await source(key);if(!record)throw new AccessError(404,'Content not found.');mayEdit(actor,record);
  if(body.version!==record.version)throw new AccessError(409,'This item changed. Reload before continuing.');
  if(body.action==='copy'){
   if(!actor.isOwner)requireCapability(actor,'journal.create');
   const newSlug=record.slug.slice(0,150)+'-copy-'+randomUUID().slice(0,8),newKey=keyFor(record.collection,newSlug);
   const draft=structuredClone(record.draft);draft.title=(draft.title+' — copy').slice(0,250);
   // Give the copy independent image records, so unpublishing/deleting its source cannot break it.
   const serialized=JSON.stringify(draft);const urls=[...new Set(serialized.match(/\/api\/content\/media\/[0-9a-f-]{36}\?entry=[a-zA-Z0-9%/-]+/gi)||[])];
   for(const url of urls){const m=url.match(/media\/([^?]+)\?entry=(.+)/);if(!m||decodeURIComponent(m[2])!==key)continue;const image=await store.getWithMetadata('images/'+m[1],{type:'arrayBuffer'});if(!image||image.metadata.entry!==key)throw new AccessError(409,'A source photograph is missing. Restore it before copying.');const id=randomUUID();await store.set('images/'+id,image.data,{metadata:{entry:newKey,type:image.metadata.type}});const next=mediaURL(id,newKey);if(draft.cover===url)draft.cover=next;draft.html=draft.html.split(url).join(next);for(const p of draft.photos)if(p.image===url)p.image=next;}
   for(const photo of draft.photos)photo.id=randomUUID();
   return save(actor,newKey,{version:0,action:'draft',draft});
  }
  if(!['delete','restore'].includes(body.action))throw new AccessError(400,'Choose copy, delete or restore.');
  if(!actor.isOwner)requireCapability(actor,record.ownerId===actor.user.id?'content.delete_own':'content.delete_any');
  const result={...record,published:null,deletedAt:body.action==='delete'?new Date().toISOString():null,version:record.version+1,writeId:randomUUID(),updatedAt:new Date().toISOString()};
  if(existing&&!existing.etag)throw new AccessError(503,'The storage revision could not be verified. Please retry.');
  const written=await store.setJSON('entries/'+key,result,existing?{onlyIfMatch:existing.etag}:{onlyIfNew:true});if(written?.modified===false)throw new AccessError(409,'Another change completed first. Reload before continuing.');if((await store.get('entries/'+key,{type:'json'}))?.writeId!==result.writeId)throw new AccessError(409,'The change could not be confirmed. Reload before retrying.');return result;
 });}
 return {get,all,publicList,publicEntry,save,upload,media,manage};
}
