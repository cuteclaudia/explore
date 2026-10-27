import {getStore} from '@netlify/blobs';
import {verifyRequestOrigin} from '@netlify/identity';
import {currentActor} from '../../server/identity';
import {conditionalBlobFetch} from '../../server/blob-fetch.mjs';
import {storageProviders} from '../../server/storage-providers.mjs';
import {koboStorageService} from '../../server/kobo-storage.mjs';
import {KOBO_BYTES,KoboError,koboFailure} from '../../src/lib/kobo-contract.mjs';
const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};
const json=value=>Response.json(value,{headers});
async function boundedBody(request,max){
  if(Number(request.headers.get('content-length'))>max)throw new KoboError('too-large','The operation exceeds its size limit.');
  const reader=request.body?.getReader();if(!reader)return new Uint8Array();let size=0;const chunks=[];
  try{while(true){const item=await reader.read();if(item.done)break;size+=item.value.byteLength;if(size>max){await reader.cancel();throw new KoboError('too-large','The operation exceeds its size limit.');}chunks.push(item.value);}}finally{reader.releaseLock();}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}return bytes;
}
export default async(request:Request)=>{
  try{
    const url=new URL(request.url),op=url.pathname.split('/').pop();
    if(!['launch','status','read','stat','list','put','remove'].includes(op||''))throw new KoboError('invalid','Unknown operation.');
    const expected=op==='launch'?'POST':op==='put'?'PUT':op==='remove'?'DELETE':'GET';if(request.method!==expected)return new Response(null,{status:405,headers:{...headers,Allow:expected}});
    if(!['GET','HEAD'].includes(request.method))verifyRequestOrigin(request);
    let actor;try{actor=await currentActor();}catch(error){throw new KoboError(error.status===403?'forbidden':'unauthorized','Sign in with a permitted account to use app storage.');}
    const providers=storageProviders({connections:getStore({name:'studio-storage-connections',consistency:'strong',fetch:conditionalBlobFetch()}),index:getStore({name:'kobo-google-files',consistency:'strong',fetch:conditionalBlobFetch()}),backups:getStore({name:'kobo-google-recovery',consistency:'strong',fetch:conditionalBlobFetch()})});
    const service=koboStorageService({launchStore:getStore({name:'kobo-launches',consistency:'strong',fetch:conditionalBlobFetch()}),loadConnection:providers.load,files:providers.files,indexState:providers.indexState});
    if(op==='launch'){let body;try{body=JSON.parse(new TextDecoder().decode(await boundedBody(request,1024)));}catch(error){if(error instanceof KoboError)throw error;throw new KoboError('invalid','Invalid launch request.');}return json(await service.launch(actor,body.app,url.origin));}
    const launch=request.headers.get('x-kobo-launch');const args={path:url.searchParams.get('path'),app:url.searchParams.get('app')??undefined,connectionId:request.headers.get('x-kobo-connection'),ifMatch:request.headers.get('if-match')??undefined,ifNoneMatch:request.headers.get('if-none-match')??undefined,signal:AbortSignal.any([request.signal,AbortSignal.timeout(25000)])};
    if(op==='put')args.data=await boundedBody(request,KOBO_BYTES);
    const result=await service.perform(actor,launch,url.origin,op,args);
    if(op==='read')return result?new Response(result.data,{headers:{...headers,'Content-Type':'application/octet-stream',ETag:result.etag}}):new Response(null,{status:404,headers});
    return json(result??null);
  }catch(error){
    // Origin validation errors from the Identity SDK must not become retryable server errors.
    if(!(error instanceof KoboError)&&error.status===403)error=new KoboError('forbidden','This storage request was refused.');
    const failure=koboFailure(error),status={unauthorized:401,forbidden:403,invalid:400,conflict:412,'too-large':413,quota:507,'rate-limited':429,offline:502,timeout:504,cancelled:499,server:503}[failure.code]||503;
    return Response.json({error:failure},{status,headers:{...headers,...(failure.retryAfterMs?{'Retry-After':String(Math.ceil(failure.retryAfterMs/1000))}:{})}});
  }
};
export const config={path:'/api/kobo/*'};
