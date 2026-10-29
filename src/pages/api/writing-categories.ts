import {getStore} from '@netlify/blobs';
import {verifyRequestOrigin} from '@netlify/identity';
import {currentActor,errorResponse} from '../../../server/identity';
import {AccessError} from '../../../server/access.mjs';
import {writingCategories} from '../../../server/writing-categories.mjs';
export const prerender=false;
export async function ALL({request}){
 try {
  const service=writingCategories(getStore({name:'studio-writing-categories',consistency:'strong'}));
  if(request.method==='GET')return Response.json(await service.read(),{headers:{'Cache-Control':'no-store'}});
  if(request.method!=='PUT')throw new AccessError(405,'Method not allowed.');
  const actor=await currentActor('settings.manage');verifyRequestOrigin(request);
  if(!request.headers.get('content-type')?.includes('application/json'))throw new AccessError(415,'Send JSON content.');
  const raw=await request.text();if(raw.length>4096)throw new AccessError(413,'Category request is too large.');
  let input;try{input=JSON.parse(raw);}catch{throw new AccessError(400,'Invalid category request.');}
  return Response.json(await service.save(actor,input),{headers:{'Cache-Control':'private, no-store'}});
 }catch(error){return errorResponse(error);}
}
