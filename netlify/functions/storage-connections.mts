import {mergePreferences} from '../../server/preferences.mjs';
import {getStore} from '@netlify/blobs';
import {verifyRequestOrigin} from '@netlify/identity';
import {currentActor,errorResponse} from '../../server/identity';
import {AccessError,requireCapability} from '../../server/access.mjs';
import {connectionURL,seal,unseal,testConnection,davRequest} from '../../server/webdav.mjs';
import {fileService} from '../../server/cloud-files.mjs';
import {verifyKoboConnection} from '../../server/kobo-storage.mjs';
import {koboPath,KoboError} from '../../src/lib/kobo-contract.mjs';
const json=value=>Response.json(value,{headers:{'Cache-Control':'private, no-store'}});
export default async(request:Request)=>{try{
 const actor=await currentActor();const store=getStore({name:'studio-storage-connections',consistency:'strong'});const key='webdav/'+actor.user.id;const path=new URL(request.url).pathname.replace(/\/$/,'');
 if(path==='/api/storage/preferences'){
  const preferenceKey='preferences/'+actor.user.id;
  if(request.method==='GET')return json((await store.get(preferenceKey,{type:'json'}))||{defaultDestination:'download'});
  if(request.method==='POST'){verifyRequestOrigin(request);const raw=await request.text();if(raw.length>2000)throw new AccessError(413,'Preferences are too large.');let input;try{input=JSON.parse(raw);}catch{throw new AccessError(400,'Invalid preferences.');}const preferences=mergePreferences((await store.get(preferenceKey,{type:'json'}))||{},input);await store.setJSON(preferenceKey,preferences);return json(preferences);}
  throw new AccessError(405,'Method not allowed.');
 }
 if(!['/api/storage/webdav','/api/storage/webdav/copy','/api/storage/webdav/verify-kobo'].includes(path))throw new AccessError(404,'Not found.');
 if(request.method==='GET'){const saved=await store.get(key,{type:'json'});if(!saved)return json({connected:false});const config=unseal(actor.user.id,saved);return json({connected:true,url:config.url,username:config.username,baseFolder:config.baseFolder??'Kobo',label:config.label||'My WebDAV storage',koboVerified:config.koboVerified?.protocol===1});}
 verifyRequestOrigin(request);
 if(request.method==='POST'&&path.endsWith('/verify-kobo')){
  const original=await store.get(key,{type:'json'});if(!original)throw new AccessError(409,'No WebDAV connection is saved for this signed-in account. Enter the connection details and complete Test & save first.');
  const config=unseal(actor.user.id,original);const verified=await verifyKoboConnection(config);
  let latest=await store.getWithMetadata(key,{type:'json'});
  if(latest&&!latest.etag){const listed=async()=>((await store.list({prefix:key})).blobs.find(b=>b.key===key))?.etag;const before=await listed(),fresh=await store.getWithMetadata(key,{type:'json'}),after=await listed();if(before&&before===after&&fresh)latest={...fresh,etag:after};}
  if(!latest||JSON.stringify(latest.data)!==JSON.stringify(original)||!latest.etag)throw new AccessError(409,'The connection changed or its revision could not be checked. Reload before testing again.');
  config.koboVerified=verified;const result=await store.setJSON(key,seal(actor.user.id,config),{onlyIfMatch:latest.etag});if(result?.modified===false)throw new AccessError(409,'The connection changed while testing. Please test again.');
  return json({verified:true,checkedAt:verified.checkedAt});
 }
 if(request.method==='DELETE'){await store.delete(key);return json({removed:true});}
 if(request.method==='POST'&&path.endsWith('/copy')){
  const text=await request.text();if(text.length>2000)throw new AccessError(413,'Request too large.');const{id}=JSON.parse(text);const saved=await store.get(key,{type:'json'});if(!saved)throw new AccessError(409,'Connect WebDAV first.');const config=unseal(actor.user.id,saved);
  const api=fileService(getStore({name:'studio-working-files',consistency:'strong'}));const file=await api.own(id,actor);requireCapability(actor,'tools.'+file.tool);if(!file.ready)throw new AccessError(409,'Save this file to cloud first.');const parts=await Promise.all(Array.from({length:file.chunks},(_,i)=>api.readPart(actor,id,i)));await davRequest(config,'PUT',file.id+'-'+file.name,Buffer.concat(parts.map(x=>Buffer.from(x))));return json({copied:true});
 }
 if(request.method==='POST'){
  const text=await request.text();if(text.length>12000)throw new AccessError(413,'Connection details too large.');const input=JSON.parse(text);const url=connectionURL(input.url).href;
  if(typeof input.username!=='string'||!input.username.trim()||input.username.includes(':')||typeof input.password!=='string'||!input.password)throw new AccessError(400,'Enter a WebDAV username and app password.');
  const baseFolder=koboPath(input.baseFolder??'Kobo',true);const label=String(input.label||'My WebDAV storage').trim().slice(0,120);
  const config={url,username:input.username.trim(),password:input.password,baseFolder,label};const encrypted=seal(actor.user.id,config);await testConnection(config);await store.setJSON(key,encrypted);return json({connected:true,url,username:config.username,baseFolder,label,koboVerified:false});
 }
 throw new AccessError(405,'Method not allowed.');
 }catch(error){if(error instanceof KoboError)return Response.json({error:error.message,code:error.code},{status:error.code==='conflict'?409:400,headers:{'Cache-Control':'private, no-store'}});return errorResponse(error);}};
export const config={path:'/api/storage/*'};
