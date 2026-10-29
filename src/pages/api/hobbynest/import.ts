import {getStore} from '@netlify/blobs';
import {verifyRequestOrigin} from '@netlify/identity';
import {currentActor,errorResponse} from '../../../../server/identity';
import {AccessError} from '../../../../server/access.mjs';
import {hobbyNest} from '../../../../server/hobbynest.mjs';
export const prerender=false;
export async function POST({request,url}){try{
 const actor=await currentActor('settings.manage');verifyRequestOrigin(request);
 if(!request.headers.get('content-type')?.includes('application/json'))throw new AccessError(415,'Send mapped rows as JSON.');
 const reader=request.body?.getReader();if(!reader)throw new AccessError(400,'Choose a spreadsheet.');const chunks=[];let size=0;try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>1024*1024){await reader.cancel();throw new AccessError(413,'Mapped rows exceed 1 MiB. Split the spreadsheet into smaller imports.');}chunks.push(value);}}finally{reader.releaseLock();}
 let input;try{input=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new AccessError(400,'Invalid import data.');}
 if(!['preview','apply'].includes(url.searchParams.get('action')||''))throw new AccessError(400,'Choose preview or apply.');
 const result=await hobbyNest(getStore({name:'hobbynest-catalogue',consistency:'strong'})).importProducts(actor,input,url.searchParams.get('action')==='apply');
 return Response.json(result,{headers:{'Cache-Control':'private, no-store'}});
}catch(error){return errorResponse(error);}}
