import {randomUUID} from 'node:crypto';
import {currentActor,errorResponse} from '../../../../server/identity';
import {irodoriPreviewOrigin} from '../../../../server/app-preview.mjs';
export const prerender=false;
// A device-only app session. No storage launch, provider token or cloud operation
// is enabled by granting normal Irodori web access.
export const GET=async({request})=>{try{
 const actor=await currentActor('tools.photocraft'),origin=irodoriPreviewOrigin(new URL(request.url).origin);
 return Response.json({configured:!!origin,origin,userKey:actor.user.id,launchId:randomUUID(),app:'irodori',storageConnected:false},{headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
}catch(error){return errorResponse(error);}};
