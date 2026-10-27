import {getStore} from '@netlify/blobs';
import {verifyRequestOrigin} from '@netlify/identity';
import {currentActor,errorResponse} from '../../server/identity';
import {conditionalBlobFetch} from '../../server/blob-fetch.mjs';
import {storageProviders} from '../../server/storage-providers.mjs';
import {KoboError} from '../../src/lib/kobo-contract.mjs';
const headers={'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'};
const cookie=(value='',age=0)=>'kobo_drive_oauth='+value+'; Secure; HttpOnly; SameSite=Lax; Path=/api/google-drive; Max-Age='+age;
export default async(request:Request)=>{
 const url=new URL(request.url),op=url.pathname.split('/').pop();let providers;
 try{
  const actor=await currentActor();const indexWrites:{status:number}[]=[];
  const index=getStore({name:'kobo-google-files',consistency:'strong',fetch:conditionalBlobFetch({fetcher:async(input,options)=>{
   const response=await fetch(input,options);
   // Record only response status codes for disposable diagnostic writes. Never
   // retain URLs, signed queries, credentials, headers, payloads or file names.
   try{if(options?.method?.toLowerCase()==='put'&&new URL(String(input)).pathname.includes('/_atomic-checks/')&&!new Headers(options.headers).get('accept')?.includes('type=signed-url')&&indexWrites.length<16)indexWrites.push({status:response.status});}catch{}
   return response;
  }})});
  providers=storageProviders({connections:getStore({name:'studio-storage-connections',consistency:'strong',fetch:conditionalBlobFetch()}),index,indexWriteAudit:()=>indexWrites});
  if(op==='callback'){
   if(request.method!=='GET')return new Response(null,{status:405,headers});
   const c=providers.google.client();if(url.origin!==c.origin)throw new KoboError('forbidden','Invalid callback origin.');
   const browser=request.headers.get('cookie')?.split(';').map(v=>v.trim()).find(v=>v.startsWith('kobo_drive_oauth='))?.slice('kobo_drive_oauth='.length);
   const result=await providers.google.callback(actor.user.id,{state:url.searchParams.get('state'),browser,code:url.searchParams.get('code'),denied:url.searchParams.has('error')});
   return new Response(null,{status:303,headers:{...headers,'Set-Cookie':cookie(),Location:'/studio/storage?googleDrive='+(result.cancelled?'cancelled':'connected')}});
  }
  if(op==='status'&&request.method==='GET'){
   let configured=true;try{providers.google.client();}catch{configured=false;}
   const config=await providers.google.load(actor.user.id);
   return Response.json({configured,connected:!!config,email:config?.email||'',verified:config?.koboVerified?.protocol===1&&!config?.authFailed,reconnectRequired:config?.authFailed===true,concurrentIndexVerified:config?.koboVerified?.atomicChecks?.createOnly===true&&config?.koboVerified?.atomicChecks?.compareAndSwap===true,folderUrl:config?'https://drive.google.com/drive/folders/'+config.rootId:'',selected:await providers.selected(actor.user.id)},{headers});
  }
  if(request.method!=='POST')return new Response(null,{status:405,headers});verifyRequestOrigin(request);
  if(op==='start'){const result=await providers.google.start(actor.user.id,url.origin);return Response.json({authorizationUrl:result.authorizationUrl},{headers:{...headers,'Set-Cookie':cookie(result.browser,600)}});}
  if(op==='verify')return Response.json(await providers.verifyGoogle(actor.user.id),{headers});
  if(op==='disconnect')return Response.json(await providers.google.disconnect(actor.user.id),{headers});
  if(op==='select'){const raw=await request.text();if(raw.length>200)throw new KoboError('invalid','Invalid provider selection.');let body;try{body=JSON.parse(raw);}catch{throw new KoboError('invalid','Invalid provider selection.');}return Response.json(await providers.choose(actor.user.id,body.provider),{headers});}
  return new Response(null,{status:404,headers});
 }catch(error){
  if(op==='callback')return new Response(null,{status:303,headers:{...headers,'Set-Cookie':cookie(),Location:'/studio/storage?googleDrive=failed'}});
  if(error instanceof KoboError)return Response.json({error:error.message,code:error.code},{status:{forbidden:403,invalid:400,conflict:409,'rate-limited':429,offline:502,timeout:504}[error.code]||503,headers});return errorResponse(error);
 }
};
export const config={path:'/api/google-drive/*'};
