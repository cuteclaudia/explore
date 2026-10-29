import {getStore} from '@netlify/blobs';
import {verifyRequestOrigin} from '@netlify/identity';
import {currentActor,errorResponse} from '../../../../server/identity';
import {AccessError} from '../../../../server/access.mjs';
import {hobbyNest} from '../../../../server/hobbynest.mjs';
export const prerender=false;
export async function POST({request}){try{
 const actor=await currentActor('settings.manage');verifyRequestOrigin(request);
 if(!request.headers.get('content-type')?.includes('application/json'))throw new AccessError(415,'Send JSON content.');
 const raw=await request.text();if(raw.length>1024)throw new AccessError(413,'Request too large.');
 let body;try{body=JSON.parse(raw);}catch{throw new AccessError(400,'Invalid request.');}
 if(!body||Object.keys(body).some(k=>k!=='expectedAccount')||body.expectedAccount!==actor.user.id)throw new AccessError(409,'Your account changed. Reload before checking the carrier.');
 return Response.json(await hobbyNest(getStore({name:'hobbynest-catalogue',consistency:'strong'})).carrierCheck(actor),{headers:{'Cache-Control':'private, no-store'}});
}catch(error){return errorResponse(error);}}
