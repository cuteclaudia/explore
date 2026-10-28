import {currentActor,errorResponse} from '../../../../server/identity';
import {AccessError} from '../../../../server/access.mjs';
import {irodoriPreviewOrigin} from '../../../../server/app-preview.mjs';
export const prerender=false;
export const GET=async({request})=>{try{
 const actor=await currentActor('settings.manage');if(!actor.isOwner)throw new AccessError(403,'This Irodori preview is owner-only.');
 const origin=irodoriPreviewOrigin(new URL(request.url).origin);
 return Response.json({configured:!!origin,origin,userKey:actor.user.id,app:'irodori',version:'0.16.0',storageConnected:false},{headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
}catch(error){return errorResponse(error);}};
