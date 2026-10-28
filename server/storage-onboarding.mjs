import {AccessError} from './access.mjs';
import {revision,commit} from './blob-revisions.mjs';
import {locationPreference} from '../src/lib/storage-onboarding.mjs';
// Independent planning metadata. Never reads or writes a provider connection.
export function storageOnboarding(store){
 const key=actor=>'location/'+actor.user.id;
 async function read(actor){const record=await revision(store,key(actor));return {locationPreference:record?locationPreference(record.data.locationPreference):null,etag:record?.etag||null};}
 async function save(actor,input){
  if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['expectedAccount','locationPreference','etag'].includes(k)))throw new AccessError(400,'Invalid storage planning preference.');
  if(input.expectedAccount!==actor.user.id)throw new AccessError(409,'Your account changed. Reload storage settings before saving.');
  if(input.etag!==null&&(typeof input.etag!=='string'||!input.etag||input.etag.length>1000))throw new AccessError(400,'Reload the planning preference before saving.');
  let preference;try{preference=locationPreference(input.locationPreference);}catch(error){throw new AccessError(400,error.message);}
  const before=await revision(store,key(actor));if((before?.etag||null)!==input.etag)throw new AccessError(409,'Your planning preference changed elsewhere. Reload before saving.');
  await commit(store,key(actor),{locationPreference:preference},before);return read(actor);
 }
 return {read,save};
}
