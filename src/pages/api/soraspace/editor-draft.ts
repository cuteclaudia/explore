import {getStore} from '@netlify/blobs';
import {verifyRequestOrigin} from '@netlify/identity';
import {currentActor,errorResponse} from '../../../../server/identity';
import {AccessError} from '../../../../server/access.mjs';
import {siteEditorTrial} from '../../../../server/soraspace-editor.mjs';
export const prerender=false;
export async function ALL({request}){try{
 const actor=await currentActor('beta.soraspace');const service=siteEditorTrial(getStore({name:'soraspace-owner-editor',consistency:'strong'}));
 if(request.method==='GET')return Response.json(await service.load(actor),{headers:{'Cache-Control':'private, no-store'}});
 if(request.method!=='PUT')throw new AccessError(405,'Method not allowed.');verifyRequestOrigin(request);
 if(!request.headers.get('content-type')?.includes('application/json'))throw new AccessError(415,'Send JSON content.');
 const reader=request.body?.getReader();if(!reader)throw new AccessError(400,'A draft is required.');const chunks=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>128*1024){await reader.cancel();throw new AccessError(413,'The draft request is too large.');}chunks.push(value);}}finally{reader.releaseLock();}
 let input;try{input=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new AccessError(400,'Invalid draft request.');}
 // Re-verify after reading the request, before writing the account-bound draft.
 const fresh=await currentActor('beta.soraspace');if(fresh.user.id!==actor.user.id)throw new AccessError(409,'Your account changed.');
 return Response.json(await service.save(fresh,input),{headers:{'Cache-Control':'private, no-store'}});
}catch(error){return errorResponse(error);}}
