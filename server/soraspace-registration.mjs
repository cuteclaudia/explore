import {AccessError,permissionsFor,isOwnerIdentity} from './access.mjs';
import {requestedServices} from '../src/lib/soraspace-services.mjs';
import {createHash} from 'node:crypto';import {revision,commit} from './blob-revisions.mjs';
export function registrationFields(raw){
 const f=new URLSearchParams(raw);if([...f.keys()].some(k=>!['email','password','name','services'].includes(k))||['email','password','name'].some(k=>f.getAll(k).length!==1))throw new AccessError(400,'Invalid registration fields.');
 const email=f.get('email').trim(),password=f.get('password'),name=f.get('name').trim();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||name.length>80||!name||password.length<12||new TextEncoder().encode(password).length>72)throw new AccessError(400,'Use a valid email, a name up to 80 characters and a password of at least 12 characters and at most 72 UTF-8 bytes.');
 let services;try{services=requestedServices(f.getAll('services'));}catch(e){throw new AccessError(400,e.message);}
 return {email,password,data:{full_name:name,requested_services:services}};
}
export function accountStatus(user,owners,options={}){
 const owner=isOwnerIdentity(user.id,owners),permissions=permissionsFor(user,owners,options),suspended=!owner&&user.appMetadata?.suspended===true;
 const approved=!suspended&&(owner||permissions['beta.soraspace']===true||Object.entries(permissions).some(([key,value])=>value&&(key.startsWith('tools.')||key.startsWith('desktop.'))));
 return {id:user.id,email:user.email,status:suspended?'suspended':approved?'approved':['expired','revoked'].includes(options.trialStatus)?'expired':'pending',websiteTrial:!suspended&&permissions['beta.soraspace']===true,services:permissions};
}
export function serviceRequests(store){
 const key=user=>'requests/'+createHash('sha256').update(user.id).digest('hex');
 async function read(user){const record=await revision(store,key(user));if(record&&record.data.account!==user.id)throw new AccessError(409,'Account binding failed.');return record;}
 function preferences(user){try{return requestedServices(user.userMetadata?.requested_services||[]);}catch{return [];}}
 function result(user,r){return {account:user.id,etag:r?.etag||null,requested:r?.data.requested||preferences(user),savedAt:r?.data.savedAt||null,approvalRequired:true,billingEnabled:false};}
 return {async load(user){return result(user,await read(user));},async save(user,input){
  if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['expectedAccount','etag','requested'].includes(k)))throw new AccessError(400,'Invalid service request.');
  if(input.expectedAccount!==user.id)throw new AccessError(409,'Your account changed.');let selected;try{selected=requestedServices(input.requested);}catch(e){throw new AccessError(400,e.message);}
  const before=await read(user);if(input.etag!==(before?.etag||null))throw new AccessError(409,'Your service choices changed elsewhere. Reload first.');
  try{await commit(store,key(user),{account:user.id,requested:selected,savedAt:new Date().toISOString()},before);}catch(e){if(e.code==='conflict')throw new AccessError(409,'The save could not be confirmed. Reload first.');throw e;}
  return result(user,await read(user));
 }};
}
