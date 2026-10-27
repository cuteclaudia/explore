import {randomUUID} from 'node:crypto';
import {KoboError} from '../src/lib/kobo-contract.mjs';
const queues=new Map();
export async function locked(key,fn){const before=queues.get(key)||Promise.resolve();let done;const next=new Promise(resolve=>done=resolve);queues.set(key,next);await before;try{return await fn();}finally{done();if(queues.get(key)===next)queues.delete(key);}}
export async function revision(store,key){
 const result=await store.getWithMetadata(key,{type:'json'});if(!result||result.etag)return result;
 const tag=async()=>((await store.list({prefix:key})).blobs.find(b=>b.key===key))?.etag;
 const before=await tag(),fresh=await store.getWithMetadata(key,{type:'json'}),after=await tag();
 if(!before||before!==after||!fresh)throw new KoboError('conflict','This record changed while loading. Please retry.');return {...fresh,etag:after};
}
export async function commit(store,key,value,before){
 if(before&&!before.etag)throw new KoboError('server','The record version could not be verified.');
 const next={...value,writeId:randomUUID()};const result=await store.setJSON(key,next,before?{onlyIfMatch:before.etag}:{onlyIfNew:true});
 if(result?.modified===false||(await store.get(key,{type:'json'}))?.writeId!==next.writeId)throw new KoboError('conflict','Another change completed first. Reload before retrying.');return next;
}
