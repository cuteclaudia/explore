import {randomUUID} from 'node:crypto';
import {AccessError} from './access.mjs';
import {revision,commit} from './blob-revisions.mjs';
export const DEFAULT_WRITING_CATEGORIES=Object.freeze([
 {id:'essays',name:'China Series'},
 {id:'reports',name:'Cyber Briefs'},
 {id:'osint',name:'OSINT Brief'},
]);
export const writingCategoryFor=entry=>entry.writingCategory||({essays:'essays',cyber:'reports',osint:'osint'}[entry.collection]);
export function writingCategories(store){
 const key='registry';
 async function read(){const record=await revision(store,key);return {categories:record?.data.categories||DEFAULT_WRITING_CATEGORIES.map(c=>({...c})),etag:record?.etag||null};}
 async function save(actor,input){
  if(!actor?.isOwner)throw new AccessError(403,'Only the site owner can manage writing categories.');
  if(input?.expectedAccount!==actor.user.id)throw new AccessError(409,'Your account changed. Reload before editing categories.');
  if(!['create','rename'].includes(input.action)||typeof input.name!=='string')throw new AccessError(400,'Choose a category name and action.');
  const name=input.name.trim().normalize('NFC');
  if(!name||name.toLocaleLowerCase('en')==='all writing'||name.length>60||/[\u0000-\u001f\u007f]/.test(name))throw new AccessError(400,'Use a category name between 1 and 60 characters.');
  try {
   const before=await revision(store,key);
   if(input.etag!==(before?.etag||null))throw new AccessError(409,'Categories changed in another tab. Reload before saving.');
   const categories=(before?.data.categories||DEFAULT_WRITING_CATEGORIES).map(c=>({...c}));
   const target=input.action==='rename'?categories.find(c=>c.id===input.id):null;
   if(input.action==='rename'&&!target)throw new AccessError(404,'Category not found. Reload the list.');
   if(categories.some(c=>c!==target&&c.name.toLocaleLowerCase('en')===name.toLocaleLowerCase('en')))throw new AccessError(400,'A category with that name already exists.');
   if(target)target.name=name;
   else {if(categories.length>=30)throw new AccessError(400,'Keep writing categories to 30 or fewer.');categories.push({id:randomUUID(),name});}
   await commit(store,key,{categories},before);return read();
  } catch(error){if(error.code==='conflict')throw new AccessError(409,'Categories changed or the save could not be confirmed. Reload before retrying.');throw error;}
 }
 return {read,save};
}
