import {getStore} from '@netlify/blobs';
import {verifyRequestOrigin} from '@netlify/identity';
import {currentActor,errorResponse} from '../../server/identity';
import {AccessError,requireCapability} from '../../server/access.mjs';
import {fileService,CHUNK_SIZE} from '../../server/cloud-files.mjs';
async function bodyJSON(request:Request){if(!request.headers.get('content-type')?.includes('application/json'))throw new AccessError(415,'Send JSON metadata.');const text=await request.text();if(text.length>16000)throw new AccessError(413,'Metadata is too large.');try{return JSON.parse(text);}catch{throw new AccessError(400,'Invalid JSON metadata.');}}
const json=value=>Response.json(value,{headers:{'Cache-Control':'private, no-store'}});
export default async(request:Request)=>{try{
 const makeAPI=()=>fileService(getStore({name:'studio-working-files',consistency:'strong'}));const url=new URL(request.url);const path=url.pathname.replace(/^\/api\/files\/?/,'').replace(/\/$/,'');
 if(request.method==='GET'&&path==='public')return json(await makeAPI().publicList());
 let match=path.match(/^public\/([^/]+)(?:\/parts\/(\d+))?$/);
 if(request.method==='GET'&&match){if(match[2]===undefined)return json(await makeAPI().published(match[1]));return new Response(await makeAPI().publicPart(match[1],Number(match[2])),{headers:{'Content-Type':'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
 const actor=await currentActor();const api=makeAPI();
 if(request.method!=='GET')verifyRequestOrigin(request);
 if(request.method==='GET'&&path==='list'){const tool=url.searchParams.get('tool');if(tool)requireCapability(actor,'tools.'+tool);return json((await api.list(actor,tool)).filter(file=>actor.permissions['tools.'+file.tool]===true));}
 if(request.method==='POST'&&path==='init'){const body=await bodyJSON(request);requireCapability(actor,'tools.'+body.tool);return json(await api.init(actor,body));}
 match=path.match(/^([^/]+)(?:\/(parts|finish|publish|unpublish)(?:\/(\d+))?)?$/);if(!match)throw new AccessError(404,'Not found.');
 const id=match[1];const file=await api.own(id,actor);requireCapability(actor,'tools.'+file.tool);
 if(request.method==='GET'&&!match[2])return json(file);
 if(match[2]==='parts'){const index=Number(match[3]);if(request.method==='GET')return new Response(await api.readPart(actor,id,index),{headers:{'Content-Type':'application/octet-stream','Cache-Control':'private, no-store'}});if(request.method==='PUT'){if(Number(request.headers.get('content-length')||0)>CHUNK_SIZE)throw new AccessError(413,'Chunk is too large.');const bytes=await request.arrayBuffer();if(bytes.byteLength>CHUNK_SIZE)throw new AccessError(413,'Chunk is too large.');await api.part(actor,id,index,bytes);return json({saved:true});}}
 if(request.method==='POST'&&match[2]==='finish')return json(await api.finish(actor,id));
 if(request.method==='POST'&&match[2]==='publish'){requireCapability(actor,'files.publish');return json(await api.publish(actor,id,await bodyJSON(request)));}
 if(request.method==='POST'&&match[2]==='unpublish'){requireCapability(actor,'files.publish');await api.unpublish(actor,id);return json({saved:true});}
 throw new AccessError(404,'Not found.');
 }catch(error){return errorResponse(error);}};
export const config={path:'/api/files/*'};
