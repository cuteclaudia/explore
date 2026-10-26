import {getStore} from '@netlify/blobs';
import {verifyRequestOrigin} from '@netlify/identity';
import {currentActor,errorResponse,ownerIds} from '../../../../server/identity';
import {tripService} from '../../../../server/trips.mjs';
import {AccessError} from '../../../../server/access.mjs';
export const prerender=false;
const json=value=>Response.json(value,{headers:{'Cache-Control':'private, no-store'}});
export async function ALL({params,request}){try{
 const path=(params.path||'').replace(/\/$/,'');const api=()=>tripService(getStore({name:'studio-trips',consistency:'strong'}),ownerIds());
 if(request.method==='GET'&&path==='public')return json(await api().publicList());
 const actor=await currentActor('trips.manage_own');const service=api();
 if(request.method==='GET'&&path==='mine')return json(await service.mine(actor));
 if(request.method==='GET')return json(await service.own(path,actor));
 verifyRequestOrigin(request);if(request.method!=='POST'&&request.method!=='PUT')throw new AccessError(405,'Method not allowed.');if(!request.headers.get('content-type')?.includes('application/json'))throw new AccessError(415,'Send JSON entry details.');const raw=await request.text();if(raw.length>14000)throw new AccessError(413,'Entry details are too large.');let body;try{body=JSON.parse(raw);}catch{throw new AccessError(400,'Invalid entry details.');}
 return json(await service.save(actor,path==='new'?null:path,body));
 }catch(error){return errorResponse(error);}}
