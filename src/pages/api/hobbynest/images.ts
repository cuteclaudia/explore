import {getStore} from '@netlify/blobs';
import {verifyRequestOrigin} from '@netlify/identity';
import {currentActor,errorResponse} from '../../../../server/identity';
import {AccessError} from '../../../../server/access.mjs';
import {hobbyNest} from '../../../../server/hobbynest.mjs';
export const prerender=false;
export async function POST({request}){try{
 const actor=await currentActor('settings.manage');verifyRequestOrigin(request);
 const limit=4*1024*1024;if(Number(request.headers.get('content-length')||0)>limit)throw new AccessError(413,'Use an image under 4 MiB after resizing.');
 const reader=request.body?.getReader();if(!reader)throw new AccessError(400,'Choose an image.');
 const parts=[];let size=0;try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw new AccessError(413,'Use an image under 4 MiB after resizing.');}parts.push(value);}}finally{reader.releaseLock();}
 const bytes=new Uint8Array(size);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.byteLength;}
 let alt;try{alt=decodeURIComponent(request.headers.get('X-Image-Alt')||'');}catch{throw new AccessError(400,'Invalid image description.');}
 const result=await hobbyNest(getStore({name:'hobbynest-catalogue',consistency:'strong'})).upload(actor,{productId:request.headers.get('X-Product-Id'),expectedAccount:request.headers.get('X-Store-Account'),etag:request.headers.get('X-Store-Etag')||null,alt},bytes,request.headers.get('content-type'));
 return Response.json(result,{headers:{'Cache-Control':'private, no-store'}});
}catch(error){return errorResponse(error);}}
