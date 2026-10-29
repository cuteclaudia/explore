import {getStore} from '@netlify/blobs';
import {currentActor,errorResponse} from '../../../../../server/identity';
import {AccessError} from '../../../../../server/access.mjs';
import {hobbyNest} from '../../../../../server/hobbynest.mjs';
export const prerender=false;
export async function GET({params,url}){try{
 const parts=(params.path||'').split('/');if(parts.length!==2)throw new AccessError(404,'Image not found.');
 const actor=url.searchParams.get('draft')==='1'?await currentActor('settings.manage'):undefined;
 const bytes=await hobbyNest(getStore({name:'hobbynest-catalogue',consistency:'strong'})).media(parts[0],parts[1],actor);
 return new Response(bytes,{headers:{'Content-Type':'image/webp','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Disposition':'inline'}});
}catch(error){return errorResponse(error);}}
