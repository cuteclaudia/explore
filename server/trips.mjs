import {randomUUID} from 'node:crypto';
import {AccessError,isOwnerIdentity,requireCapability} from './access.mjs';
const locks=new Map();
async function locked(key,fn){const pending=(locks.get(key)||Promise.resolve()).catch(()=>{}).then(fn);locks.set(key,pending);try{return await pending;}finally{if(locks.get(key)===pending)locks.delete(key);}}
const uuid=id=>typeof id==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
const text=(v,n)=>typeof v==='string'?v.trim().slice(0,n):'';
function date(v,required=false){if(!v&&!required)return '';if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v+'T00:00:00Z'))||new Date(v+'T00:00:00Z').toISOString().slice(0,10)!==v)throw new AccessError(400,'Choose a valid date.');return v;}
export function cleanTrip(input){
 if(!input||typeof input!=='object')throw new AccessError(400,'Enter trip or event details.');const title=text(input.title,180);if(!title)throw new AccessError(400,'A title is required.');
 const startDate=date(input.startDate,true),endDate=date(input.endDate);if(endDate&&endDate<startDate)throw new AccessError(400,'The end date must be on or after the start date.');
 let location=null;if(input.location){const p=input.location;if(typeof p.lat!=='number'||typeof p.lng!=='number'||!Number.isFinite(p.lat)||!Number.isFinite(p.lng)||Math.abs(p.lat)>85.05112878||Math.abs(p.lng)>180)throw new AccessError(400,'Enter valid latitude and longitude values.');if(!['approximate','exact','hidden'].includes(p.precision))throw new AccessError(400,'Choose a location visibility setting.');location={lat:p.lat,lng:p.lng,label:text(p.label,250),precision:p.precision};}
 return {type:input.type==='event'?'event':'trip',title,startDate,endDate,description:text(input.description,4000),tags:Array.isArray(input.tags)?[...new Set(input.tags.filter(t=>typeof t==='string').map(t=>text(t,60)).filter(Boolean))].slice(0,20):[],location};
}
function publicSnapshot(draft){const copy=structuredClone(draft);if(copy.location?.precision==='hidden')copy.location=null;else if(copy.location?.precision==='approximate'){copy.location.lat=Math.round(copy.location.lat*100)/100;copy.location.lng=Math.round(copy.location.lng*100)/100;}return copy;}
export function tripService(store,ownerIds){
 async function stored(id){if(!uuid(id))throw new AccessError(400,'Invalid entry ID.');const key='entries/'+id;const found=await store.getWithMetadata(key,{type:'json'});if(!found||found.etag)return found;const etag=async()=>((await store.list({prefix:key})).blobs.find(b=>b.key===key))?.etag;const before=await etag(),fresh=await store.getWithMetadata(key,{type:'json'}),after=await etag();if(!before||before!==after||!fresh)throw new AccessError(409,'The entry changed while loading. Please retry.');return {...fresh,etag:after};}
 const allowed=(record,actor)=>record.ownerId===actor.user.id||(actor.isOwner&&isOwnerIdentity(record.ownerId,ownerIds));
 async function own(id,actor){requireCapability(actor,'trips.manage_own');const saved=await stored(id);if(!saved||!allowed(saved.data,actor))throw new AccessError(404,'Entry not found.');return saved.data;}
 async function all(){const{blobs}=await store.list({prefix:'entries/'});return (await Promise.all(blobs.map(b=>store.get(b.key,{type:'json'})))).filter(Boolean);}
 async function publicList(){return (await all()).filter(r=>!r.deletedAt&&r.published&&isOwnerIdentity(r.ownerId,ownerIds)).map(r=>({id:r.id,...r.published})).sort((a,b)=>b.startDate.localeCompare(a.startDate));}
 async function mine(actor){requireCapability(actor,'trips.manage_own');return (await all()).filter(r=>allowed(r,actor)).sort((a,b)=>b.draft.startDate.localeCompare(a.draft.startDate));}
 async function save(actor,id,body){requireCapability(actor,'trips.manage_own');const nextId=id||randomUUID();return locked(nextId,async()=>{
  const before=await stored(nextId);if(id&&(!before||!allowed(before.data,actor)))throw new AccessError(404,'Entry not found.');
  const old=before?.data||{id:nextId,ownerId:actor.user.id,version:0,published:null,createdAt:new Date().toISOString()};
  if(before&&!allowed(old,actor))throw new AccessError(404,'Entry not found.');if(body.version!==old.version)throw new AccessError(409,'This entry changed in another tab. Reload it before saving.');
  if(!['draft','publish','unpublish','delete','restore'].includes(body.action))throw new AccessError(400,'Choose a valid entry action.');
  if(['publish','unpublish'].includes(body.action)&&(!actor.isOwner||!isOwnerIdentity(old.ownerId,ownerIds)))throw new AccessError(403,'Only Claudia can publish site events. User entries always stay private.');
  if(old.deletedAt&&body.action!=='restore')throw new AccessError(409,'Restore this entry from the bin first.');
  const draft=['delete','restore'].includes(body.action)?old.draft:cleanTrip(body.draft);if(!draft)throw new AccessError(400,'Entry details are missing.');
  const record={...old,draft,version:old.version+1,writeId:randomUUID(),updatedAt:new Date().toISOString(),deletedAt:body.action==='delete'?new Date().toISOString():body.action==='restore'?null:old.deletedAt||null,published:body.action==='publish'?publicSnapshot(draft):['delete','restore','unpublish'].includes(body.action)?null:old.published};
  if(before&&!before.etag)throw new AccessError(503,'The entry revision could not be verified.');const result=await store.setJSON('entries/'+nextId,record,before?{onlyIfMatch:before.etag}:{onlyIfNew:true});if(result?.modified===false)throw new AccessError(409,'Another change completed first. Reload before retrying.');if((await store.get('entries/'+nextId,{type:'json'}))?.writeId!==record.writeId)throw new AccessError(409,'The save could not be confirmed. Reload before retrying.');return record;
 });}
 return {own,mine,publicList,save};
}
