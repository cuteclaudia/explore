import {getStore} from '@netlify/blobs';
import {verifyRequestOrigin} from '@netlify/identity';
import {currentActor,errorResponse} from '../../server/identity';
import {conditionalBlobFetch} from '../../server/blob-fetch.mjs';
import {stravaConnection} from '../../server/strava.mjs';
const headers={'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'};
const cookie=(value='',age=0)=>'explore_strava_oauth='+value+'; Secure; HttpOnly; SameSite=Lax; Path=/api/fitness/strava; Max-Age='+age;
export default async(request:Request)=>{
 const url=new URL(request.url),op=url.pathname.replace(/\/$/,'').split('/').pop();
 if(!/^\/api\/fitness\/strava\/(status|start|callback|activities|route|disconnect)\/?$/.test(url.pathname))return new Response(null,{status:404,headers});
 try{
  const actor=await currentActor();
  const api=stravaConnection({store:getStore({name:'explore-fitness-connections',consistency:'strong',fetch:conditionalBlobFetch()})});
  if(op==='callback'){
   if(request.method!=='GET')return new Response(null,{status:405,headers});
   if(url.origin!==api.client().origin)throw Object.assign(new Error(),{status:403});
   const browser=request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith('explore_strava_oauth='))?.slice('explore_strava_oauth='.length);
   const result=await api.callback(actor.user.id,{state:url.searchParams.get('state'),browser,code:url.searchParams.get('code'),scope:url.searchParams.get('scope'),denied:url.searchParams.has('error')});
   return new Response(null,{status:303,headers:{...headers,'Set-Cookie':cookie(),Location:'/settings/connections?strava='+(result.cancelled?'cancelled':'connected')}});
  }
  if(request.method==='GET'){
   if(op==='status')return Response.json({...await api.status(actor.user.id),isOwner:actor.isOwner},{headers});
   if(op==='activities')return Response.json(await api.activities(actor.user.id,Number(url.searchParams.get('page')||'1')),{headers});
   if(op==='route')return Response.json(await api.route(actor.user.id,url.searchParams.get('id')),{headers});
  }
  if(request.method==='POST'){
   verifyRequestOrigin(request);
   if(op==='start'){const result=await api.start(actor.user.id,url.origin);return Response.json({authorizationUrl:result.authorizationUrl},{headers:{...headers,'Set-Cookie':cookie(result.browser,600)}});}
   if(op==='disconnect')return Response.json(await api.disconnect(actor.user.id),{headers});
  }
  return new Response(null,{status:['start','disconnect','status','activities','route'].includes(op||'')?405:404,headers});
 }catch(error){
  if(op==='callback')return new Response(null,{status:303,headers:{...headers,'Set-Cookie':cookie(),Location:'/settings/connections?strava=failed'}});
  if((error as any)?.code==='conflict')return Response.json({error:'Your activity connection changed. Please try again.'},{status:409,headers});
  return errorResponse(error);
 }
};
export const config={path:'/api/fitness/strava/*'};
