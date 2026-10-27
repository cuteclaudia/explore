import {getStore} from '@netlify/blobs';
import {verifyRequestOrigin} from '@netlify/identity';
import {currentActor,errorResponse} from '../../server/identity';
import {AccessError} from '../../server/access.mjs';
import {desktopDownloads} from '../../server/desktop-downloads.mjs';
import {conditionalBlobFetch} from '../../server/blob-fetch.mjs';
const headers={'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'};
export default async(request:Request)=>{try{
 const url=new URL(request.url),op=url.pathname.split('/').pop();if(!['settings','available','download'].includes(op||''))throw new AccessError(404,'Not found.');
 if(request.method!=='GET'&&!(op==='settings'&&request.method==='POST'))throw new AccessError(405,'Method not allowed.');
 if(request.method==='POST')verifyRequestOrigin(request);
 const actor=await currentActor(op==='settings'?'settings.manage':undefined),api=desktopDownloads(getStore({name:'kobo-desktop-installers',consistency:'strong',fetch:conditionalBlobFetch()}));
 if(op==='settings'){if(!actor.isOwner)throw new AccessError(403,'Only the owner can configure installers.');if(request.method==='GET')return Response.json({installers:await api.settings()},{headers});const raw=await request.text();if(raw.length>5000)throw new AccessError(413,'Installer settings are too large.');let input;try{input=JSON.parse(raw);}catch{throw new AccessError(400,'Invalid installer settings.');}return Response.json(await api.save(input),{headers});}
 if(op==='available')return Response.json({apps:await api.available(actor)},{headers});
 return new Response(null,{status:302,headers:{...headers,Location:await api.download(actor,url.searchParams.get('app'),url.searchParams.get('platform'))}});
 }catch(error){if(error.code==='conflict')return Response.json({error:error.message},{status:409,headers});return errorResponse(error);}
};
export const config={path:'/api/desktop/*'};
