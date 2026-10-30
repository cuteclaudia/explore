// OWNER-ONLY trial store. Not the tenant backend and not a public publisher.
import {createHash} from 'node:crypto';
import {AccessError} from './access.mjs';
import {revision,commit} from './blob-revisions.mjs';
import {validateEditableSite} from '../src/lib/soraspace-site-editor.mjs';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function siteEditorTrial(store){
 function scope(actor){if(!actor?.isOwner||typeof actor.user?.id!=='string'||!actor.user.id)throw new AccessError(403,'Only the owner can try this editor.');return 'owner-drafts/'+createHash('sha256').update(actor.user.id).digest('hex');}
 async function read(actor){const key=scope(actor),before=await revision(store,key);if(before&&before.data.account!==actor.user.id)throw new AccessError(409,'Draft account binding failed.');return {key,before};}
 function response(actor,record){return {account:actor.user.id,etag:record?.etag||null,draft:record?.data.draft||null,savedAt:record?.data.savedAt||null,publishingEnabled:false};}
 return {
  async load(actor){return response(actor,(await read(actor)).before);},
  async save(actor,input){
   scope(actor);
   if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['expectedAccount','etag','mutationId','draft'].includes(k)))throw new AccessError(400,'Invalid draft save.');
   if(input.expectedAccount!==actor.user.id)throw new AccessError(409,'Your account changed. Reopen the editor.');
   if(!uuid.test(input.mutationId||'')||input.etag!==null&&(typeof input.etag!=='string'||!input.etag||input.etag.length>500))throw new AccessError(400,'A draft version and save identifier are required.');
   let draft;try{draft=validateEditableSite(input.draft);}catch(error){throw new AccessError(400,error.message);}
   const digest=createHash('sha256').update(JSON.stringify({etag:input.etag,draft})).digest('hex');
   try{
    const {key,before}=await read(actor),receipts=before?.data.receipts||[];
    const previous=receipts.find(r=>r.id===input.mutationId);
    if(previous){if(previous.digest!==digest)throw new AccessError(409,'This save identifier belongs to different changes.');return response(actor,before);}
    if(input.etag!==(before?.etag||null))throw new AccessError(409,'The draft changed elsewhere. Reload before saving.');
    await commit(store,key,{account:actor.user.id,draft,savedAt:new Date().toISOString(),receipts:[...receipts,{id:input.mutationId,digest}].slice(-32)},before);
    return response(actor,(await read(actor)).before);
   }catch(error){if(error.code==='conflict')throw new AccessError(409,'The save could not be confirmed. Reload the latest draft before trying again.');throw error;}
  }
 };
}
