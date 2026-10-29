import {getStore} from '@netlify/blobs';
import {verifyRequestOrigin} from '@netlify/identity';
import {currentActor,errorResponse} from '../../../../server/identity';
import {AccessError} from '../../../../server/access.mjs';
import {hobbyNest} from '../../../../server/hobbynest.mjs';
export const prerender=false;
export async function ALL({request}){try{
 const actor=await currentActor('settings.manage'),service=hobbyNest(getStore({name:'hobbynest-catalogue',consistency:'strong'}));
 if(request.method==='GET')return Response.json(await service.settings(actor),{headers:{'Cache-Control':'private, no-store'}});
 if(request.method!=='PUT'&&request.method!=='POST')throw new AccessError(405,'Method not allowed.');
 verifyRequestOrigin(request);
 if(!request.headers.get('content-type')?.includes('application/json'))throw new AccessError(415,'Send JSON content.');
 const raw=await request.text();if(raw.length>20000)throw new AccessError(413,'Store request is too large.');
 let body;try{body=JSON.parse(raw);}catch{throw new AccessError(400,'Invalid store request.');}
 const result=request.method==='POST'?await service.quote(actor,body):await service.save(actor,body);
 return Response.json(result,{headers:{'Cache-Control':'private, no-store'}});
}catch(error){return errorResponse(error);}}
