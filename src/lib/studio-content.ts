import {getCollection} from 'astro:content';
import Markdoc from '@markdoc/markdoc';
import {getStore} from '@netlify/blobs';
import {contentService,cleanDraft} from '../../server/content.mjs';
let legacyPromise;
export function legacyContent(){return legacyPromise||=(async()=>{
 const records=[];
 for(const collection of ['journal','essays','cyber','photography'] as const){
  for(const item of await getCollection(collection)){
   const d:any=item.data,key=collection+'/'+item.id;
   const html=Markdoc.renderers.html(Markdoc.transform(Markdoc.parse(item.body||'')));
   const draft=cleanDraft({...d,date:d.date.toISOString().slice(0,10),cover:d.cover||d.heroImage||d.legacyHeroImage||'',coverAlt:d.coverAlt||d.heroAlt||'',photos:(d.photos||[]).map((p,i)=>({...p,id:p.id||'legacy-photo-'+(i+1)})),html},key);
   records.push({key,collection,slug:item.id,ownerId:'legacy',version:0,updatedAt:d.date.toISOString(),draft,published:d.draft?null:structuredClone(draft)});
  }
 }
 // Credited photographs already displayed in the prototype; these are not Claudia's originals.
 const key='photography/landscape-inspiration';
 const draft=cleanDraft({title:'Landscape inspiration',date:'2026-04-01',summary:'Credited reference photographs from the Explore prototype.',tags:['Landscape'],locationPrecision:'hidden',html:'<p>Reference photographs supplied with the prototype. Photographer credits are preserved below.</p>',photos:[
  {id:'blue-mountains',image:'/images/blue-mountains.jpg',alt:'The Three Sisters, Blue Mountains',caption:'Celia Ferreira / Pexels — Blue Mountains, NSW',tags:['Blue Mountains']},
  {id:'twelve-apostles',image:'/images/twelve-apostles.jpg',alt:'Sunrise at the Twelve Apostles',caption:'Kaiser Concha / Pexels — Great Ocean Road, VIC',tags:['Coast']},
  {id:'torres',image:'/images/torres.jpg',alt:'Torres del Paine',caption:'William Warby / Pexels — Patagonia, Chile',tags:['Patagonia']}
 ]},key);
 if(!records.some(r=>r.key===key))records.push({key,collection:'photography',slug:'landscape-inspiration',ownerId:'legacy',version:0,updatedAt:'2026-04-01T00:00:00Z',draft,published:structuredClone(draft)});
 return records;
})();}
export function siteContent(){return contentService(getStore({name:'studio-content',consistency:'strong'}),legacyContent);}
export const contentHref=(collection,slug)=>'/' + ({journal:'journal',essays:'chinaseries',cyber:'dailycyberreport',photography:'photography'}[collection])+'/'+slug;
export async function liveCollection(collection){return (await siteContent().publicList(collection)).map(item=>({id:item.slug,body:item.html,studioHTML:item.html,data:{...item,date:new Date(item.date+'T00:00:00Z'),draft:false,heroImage:item.cover,heroAlt:item.coverAlt,region:item.location||'Australia – Japan – Asia'}}));}
