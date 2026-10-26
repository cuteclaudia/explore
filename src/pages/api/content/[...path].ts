import {verifyRequestOrigin} from '@netlify/identity';
import {currentActor,errorResponse} from '../../../../server/identity';
import {AccessError} from '../../../../server/access.mjs';
import {keyFor,mayEdit} from '../../../../server/content.mjs';
import {siteContent} from '../../../lib/studio-content';
export const prerender=false;
const json=value=>Response.json(value,{headers:{'Cache-Control':'private, no-store'}});
export async function ALL({request,params,url}){try{
 const path=params.path||'';
 if(request.method==='GET'&&path.startsWith('media/')){
  const api=siteContent(),key=url.searchParams.get('entry')||'';let actor;
  // Public requests use only the published snapshot. Explicit draft requests require authentication.
  if(url.searchParams.get('draft')==='1')actor=await currentActor();
  let image;try{image=await api.media(path.slice(6),key,actor);}catch(error){if(actor||url.searchParams.get('draft')==='1')throw error;actor=await currentActor();image=await api.media(path.slice(6),key,actor);}
  return new Response(image.data,{headers:{'Content-Type':String(image.metadata.type),'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Disposition':'inline'}});
 }
 const actor=await currentActor();const api=siteContent();
 if(request.method!=='GET')verifyRequestOrigin(request);
 if(request.method==='GET'&&path==='list'){
  const records=await api.all();return json(records.filter(r=>{try{mayEdit(actor,r);return true;}catch{return false;}}).map(({draft,published,...r})=>({...r,title:draft.title,tags:draft.tags,isPublished:!!published,hasChanges:JSON.stringify(draft)!==JSON.stringify(published)})));
 }
 const collection=url.searchParams.get('collection')||'',slug=url.searchParams.get('slug')||'';const key=keyFor(collection,slug);
 if(request.method==='GET'&&path==='entry'){const r=await api.get(key);mayEdit(actor,r);return json(r);}
 if((request.method==='PUT'&&path==='entry')||(request.method==='POST'&&path==='manage')){
  if(!request.headers.get('content-type')?.includes('application/json'))throw new AccessError(415,'Send JSON content.');
  const raw=await request.text();if(raw.length>800000)throw new AccessError(413,'This content is too large.');let body;try{body=JSON.parse(raw);}catch{throw new AccessError(400,'Invalid content.');}return json(await (path==='manage'?api.manage(actor,key,body):api.save(actor,key,body)));
 }
 if(request.method==='POST'&&path==='image'){
  if(Number(request.headers.get('content-length')||0)>4*1024*1024)throw new AccessError(413,'Use an image under 4 MiB.');
  return json(await api.upload(actor,key,await request.arrayBuffer(),request.headers.get('content-type')));
 }
 throw new AccessError(405,'Method not allowed.');
 }catch(error){return errorResponse(error);}}
