import {AccessError} from './access.mjs';
import {revision,commit} from './blob-revisions.mjs';
const all=['essays','cyber','osint','journal','photography','library'];
export const FEATURE_PAGES=Object.freeze([
 {slot:'home',label:'Home',path:'/'}, {slot:'writing',label:'Writing & analysis',path:'/#writing'},
 {slot:'chinaseries',label:'China Series',path:'/chinaseries'}, {slot:'cyber',label:'Cyber Briefs',path:'/dailycyberreport'},
 {slot:'osint',label:'OSINT Brief',path:'/osint-brief'}, {slot:'journal',label:'Journal',path:'/journal'},
 {slot:'photography',label:'Photography',path:'/photography'}, {slot:'library',label:'Published library',path:'/library'},
 {slot:'about',label:'About Claudia',path:'/about'}, {slot:'contact',label:'Contact',path:'/contact'},
 {slot:'places',label:'Places & map',path:'/places'}, {slot:'trips',label:'Trips',path:'/trips'},
 {slot:'apps-showcase',label:'SoraSpace apps showcase',path:'/kobo'}, {slot:'printing',label:'3D printing',path:'/3d-printing'},
]);
const allowed=Object.fromEntries(FEATURE_PAGES.map(page=>[page.slot,page.slot==='writing'?['essays','cyber','osint','library']:all]));
export const featureSlotForPath=path=>FEATURE_PAGES.find(page=>page.path===(path.replace(/\/$/,'')||'/'))?.slot;
export function contentFeatures(store,publicList){
 async function read(){const record=await revision(store,'selection');return {...Object.fromEntries(Object.keys(allowed).map(slot=>[slot,record?.data[slot]||null])),etag:record?.etag||null};}
 async function settings(actor){if(!actor?.isOwner)throw new AccessError(403,'Only the site owner can choose featured content.');const selection=await read(),entries=await publicList();return {...selection,pages:FEATURE_PAGES,options:entries.filter(e=>allowed.home.includes(e.collection)).map(e=>({key:e.key,title:e.title,collection:e.collection,date:e.date}))};}
 async function save(actor,input){
  if(!actor?.isOwner)throw new AccessError(403,'Only the site owner can choose featured content.');
  if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['expectedAccount','etag','slot','key'].includes(k)))throw new AccessError(400,'Invalid featured content selection.');
  if(input.expectedAccount!==actor.user.id)throw new AccessError(409,'Your account changed. Reload before pinning content.');
  if(!Object.hasOwn(allowed,input.slot)||input.key!==null&&(typeof input.key!=='string'||input.key.length>220))throw new AccessError(400,'Choose a feature slot and published item.');
  if(input.key!==null){const entry=(await publicList()).find(e=>e.key===input.key);if(!entry||!allowed[input.slot].includes(entry.collection))throw new AccessError(400,'Choose a published item from a supported section. Drafts and deleted items cannot be pinned.');}
  try{const before=await revision(store,'selection');if(input.etag!==(before?.etag||null))throw new AccessError(409,'Featured content changed elsewhere. Reload before saving.');
   await commit(store,'selection',{...Object.fromEntries(Object.keys(allowed).map(slot=>[slot,before?.data[slot]||null])),[input.slot]:input.key},before);return settings(actor);
  }catch(error){if(error.code==='conflict')throw new AccessError(409,'The selection changed or could not be confirmed. Reload before retrying.');throw error;}
 }
 async function resolve(entries){const selection=await read();return Object.fromEntries(Object.keys(allowed).map(slot=>[slot,entries.find(e=>e.key===selection[slot]&&allowed[slot].includes(e.collection))||null]));}
 async function forPage(slot){if(!Object.hasOwn(allowed,slot))return null;const selection=await read();if(!selection[slot])return null;return (await publicList()).find(e=>e.key===selection[slot]&&allowed[slot].includes(e.collection))||null;}
 return {settings,save,resolve,forPage};
}
