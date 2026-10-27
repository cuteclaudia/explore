import {getStore} from '@netlify/blobs';
import {verifyRequestOrigin} from '@netlify/identity';
import {currentActor,errorResponse} from '../../server/identity';
import {conditionalBlobFetch} from '../../server/blob-fetch.mjs';
import {storageProviders} from '../../server/storage-providers.mjs';
import {mayUseKoboBeta} from '../../server/kobo-access.mjs';
import {koboApp,KoboError} from '../../src/lib/kobo-contract.mjs';
const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
async function body(request:Request){const reader=request.body?.getReader();if(!reader)return {};let size=0;const chunks=[];try{while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>3*1024*1024){await reader.cancel();throw new KoboError('too-large','Recovery requests are limited to 3 MiB.');}chunks.push(part.value);}}finally{reader.releaseLock();}try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new KoboError('invalid','Invalid recovery request.');}}
export default async(request:Request)=>{
 try{
  const url=new URL(request.url),op=url.pathname.split('/').pop();
  if(!['list','download','capture','upload','begin','step','publish','cancel'].includes(op||''))return new Response(null,{status:404,headers});
  const method=['list','download'].includes(op!)?'GET':'POST';if(request.method!==method)return new Response(null,{status:405,headers:{...headers,Allow:method}});
  if(method==='POST')verifyRequestOrigin(request);
  const actor=await currentActor(),args=method==='GET'?Object.fromEntries(url.searchParams):await body(request),app=args.app||'hikari',spec=koboApp(app);
  // Recovery never accepts a supplied user id, connection id or Drive object id.
  // Beta members can recover only their own account and connection.
  if(!actor.permissions[spec.capability]||process.env.KOBO_STORAGE_ENABLED!=='true'&&!mayUseKoboBeta(actor,app))throw new KoboError('forbidden','Index recovery requires beta access for this app.');
  const providers=storageProviders({connections:getStore({name:'studio-storage-connections',consistency:'strong',fetch:conditionalBlobFetch()}),index:getStore({name:'kobo-google-files',consistency:'strong',fetch:conditionalBlobFetch()}),backups:getStore({name:'kobo-google-recovery',consistency:'strong',fetch:conditionalBlobFetch()})});
  const config=await providers.google.access(actor.user.id),recovery=providers.recovery;
  if(['begin','step','publish'].includes(op!)&&!(config.koboVerified?.protocol===1&&config.koboVerified?.atomicChecks?.createOnly===true&&config.koboVerified?.atomicChecks?.compareAndSwap===true))throw new KoboError('forbidden','Run Google Drive Test connection and pass competing-save checks before restoring its index.');
  let result;
  if(op==='list')result=await recovery.list(config,app);
  if(op==='download')return Response.json(await recovery.download(config,app,args.id),{headers:{...headers,'Content-Disposition':'attachment; filename="kobo-drive-index-backup.json"'}});
  if(op==='capture')result=await recovery.capture(config,app);
  if(op==='upload')result=await recovery.upload(config,app,args.backup);
  if(op==='begin')result=await recovery.begin(config,app,args.id);
  if(op==='step')result=await recovery.step(config,app,args.id);
  if(op==='publish')result=await recovery.publish(config,app,args.id);
  if(op==='cancel')result=await recovery.cancel(config,app,args.id);
  return Response.json(result,{headers});
 }catch(error){if(error instanceof KoboError)return Response.json({error:error.message,code:error.code},{status:{invalid:400,forbidden:403,conflict:409,'too-large':413,offline:502,timeout:504}[error.code]||503,headers});return errorResponse(error);}
};
export const config={path:'/api/drive-index/*'};
