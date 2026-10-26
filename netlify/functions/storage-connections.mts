import {getStore} from '@netlify/blobs';
import {verifyRequestOrigin} from '@netlify/identity';
import {currentActor,errorResponse} from '../../server/identity';
import {AccessError,requireCapability} from '../../server/access.mjs';
import {connectionURL,seal,unseal,testConnection,davRequest} from '../../server/webdav.mjs';
import {fileService} from '../../server/cloud-files.mjs';
const json=value=>Response.json(value,{headers:{'Cache-Control':'private, no-store'}});
export default async(request:Request)=>{try{
 const actor=await currentActor();const store=getStore({name:'studio-storage-connections',consistency:'strong'});const key='webdav/'+actor.user.id;const path=new URL(request.url).pathname.replace(/\/$/,'');
 if(path==='/api/storage/preferences'){
  const preferenceKey='preferences/'+actor.user.id;
  if(request.method==='GET')return json((await store.get(preferenceKey,{type:'json'}))||{defaultDestination:'download'});
  if(request.method==='POST'){verifyRequestOrigin(request);const raw=await request.text();if(raw.length>2000)throw new AccessError(413,'Preferences are too large.');let input;try{input=JSON.parse(raw);}catch{throw new AccessError(400,'Invalid preferences.');}if(!['download','site','webdav'].includes(input.defaultDestination))throw new AccessError(400,'Choose device, private site storage or WebDAV.');const preferences={defaultDestination:input.defaultDestination};await store.setJSON(preferenceKey,preferences);return json(preferences);}
  throw new AccessError(405,'Method not allowed.');
 }
 if(!['/api/storage/webdav','/api/storage/webdav/copy'].includes(path))throw new AccessError(404,'Not found.');
 if(request.method==='GET'){const saved=await store.get(key,{type:'json'});if(!saved)return json({connected:false});const config=unseal(actor.user.id,saved);return json({connected:true,url:config.url,username:config.username});}
 verifyRequestOrigin(request);
 if(request.method==='DELETE'){await store.delete(key);return json({removed:true});}
 if(request.method==='POST'&&path.endsWith('/copy')){
  const text=await request.text();if(text.length>2000)throw new AccessError(413,'Request too large.');const{id}=JSON.parse(text);const saved=await store.get(key,{type:'json'});if(!saved)throw new AccessError(409,'Connect WebDAV first.');const config=unseal(actor.user.id,saved);
  const api=fileService(getStore({name:'studio-working-files',consistency:'strong'}));const file=await api.own(id,actor);requireCapability(actor,'tools.'+file.tool);if(!file.ready)throw new AccessError(409,'Save this file to cloud first.');const parts=await Promise.all(Array.from({length:file.chunks},(_,i)=>api.readPart(actor,id,i)));await davRequest(config,'PUT',file.id+'-'+file.name,Buffer.concat(parts.map(x=>Buffer.from(x))));return json({copied:true});
 }
 if(request.method==='POST'){
  const text=await request.text();if(text.length>12000)throw new AccessError(413,'Connection details too large.');const input=JSON.parse(text);const url=connectionURL(input.url).href;
  if(typeof input.username!=='string'||!input.username.trim()||input.username.includes(':')||typeof input.password!=='string'||!input.password)throw new AccessError(400,'Enter a WebDAV username and app password.');
  const config={url,username:input.username.trim(),password:input.password};const encrypted=seal(actor.user.id,config);await testConnection(config);await store.setJSON(key,encrypted);return json({connected:true,url,username:config.username});
 }
 throw new AccessError(405,'Method not allowed.');
 }catch(error){return errorResponse(error);}};
export const config={path:'/api/storage/*'};
