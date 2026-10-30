import {currentAppLanguage,watchAppLanguage} from './app-language.mjs';
import {onAuthChange} from '@netlify/identity';
import {KOBO_BYTES,KoboError,koboApp,koboPath,koboConditions,koboFailure} from '../lib/kobo-contract.mjs';

// Experimental v1.2 shell. The adapter and local library remain owned by each app.
export function mountKoboShell({frame,launch,onStatus,onClosed,onOperationError,requireStorage=false,onRelaunch}:{frame:HTMLIFrameElement;launch:any;onStatus?:(s:any)=>void;onClosed?:(s:string)=>void;onOperationError?:(e:{operation:string;path:string;code:string;message:string})=>void;requireStorage?:boolean;onRelaunch?:(reason:string)=>void}){
  const app=launch.app;let port:MessagePort|null=null,used=false,closed=false,status:any=null,polling=false;
  const pending=new Map<string|number,AbortController>();
  const post=(value:any,transfer:Transferable[]=[])=>{if(!closed&&port)port.postMessage(value,transfer);};
  function close(message='Your app session ended. Reopen the app to continue.'){
    if(closed)return;post({type:'close',reason:'signed-out'});
    for(const [id,abort] of pending){post({id,ok:false,error:koboFailure(new KoboError('unauthorized',message))});abort.abort();}pending.clear();
    closed=true;port?.close();clearInterval(timer);offAuth();offLanguage();window.removeEventListener('message',hello);window.removeEventListener('focus',refresh);window.removeEventListener('pagehide',pagehide);
    // Destroy the old app's browsing context rather than leave its library on screen.
    frame.src='about:blank';onClosed?.(message);
  }
  const changed=(next:any)=>{const previous=status||launch.storageStatus;return previous&&(previous.userKey!==next.userKey||previous.connectionId!==next.connectionId||(previous.storageEpoch||'legacy')!==(next.storageEpoch||'legacy'));};
  function restart(reason:string){if(closed)return;close('Your account or storage destination changed. Opening a freshly authorized app…');onRelaunch?.(reason);}
  async function request(op:string,args:any={},signal?:AbortSignal){
    const path=op==='status'?'':koboPath(op==='list'?(args.dir??args.path):args.path,op==='list');
    const url=new URL('/api/kobo/'+op,location.origin);if(path)url.searchParams.set('path',path);else if(op==='list')url.searchParams.set('path','');url.searchParams.set('app',app);
    const headers:Record<string,string>={'X-Kobo-Launch':launch.launchId};if(status?.connectionId)headers['X-Kobo-Connection']=status.connectionId;
    Object.assign(headers,koboConditions(args));
    const method=op==='put'?'PUT':op==='remove'?'DELETE':'GET';
    if(op==='put'){
      if(!(args.data instanceof ArrayBuffer)||args.data.byteLength>KOBO_BYTES)throw new KoboError('too-large','Put payloads must be ArrayBuffers no larger than 1 MiB.');
      return new Promise((resolve,reject)=>{
        const xhr=new XMLHttpRequest();xhr.open(method,url);xhr.timeout=30000;
        for(const [key,value] of Object.entries(headers))xhr.setRequestHeader(key,value);xhr.setRequestHeader('Content-Type','application/octet-stream');
        const abort=()=>xhr.abort();signal?.addEventListener('abort',abort,{once:true});
        xhr.upload.onprogress=event=>post({type:'progress',id:args.requestId,sent:event.loaded,total:args.data.byteLength});
        const done=(error?:any,result?:any)=>{signal?.removeEventListener('abort',abort);error?reject(error):resolve(result);};
        xhr.onload=()=>{let value;try{value=JSON.parse(xhr.responseText);}catch{return done(new KoboError('server','Storage returned an invalid response.'));}if(xhr.status>=200&&xhr.status<300)done(null,value);else done(Object.assign(new KoboError('server','Storage save failed.'),value.error));};
        xhr.onerror=()=>done(new KoboError('offline','The website could not be reached.',true));xhr.ontimeout=()=>done(new KoboError('timeout','The save timed out.',true));xhr.onabort=()=>done(new KoboError('cancelled','The save was cancelled.'));
        if(signal?.aborted)return done(new KoboError('cancelled','The save was cancelled.'));xhr.send(args.data);
      });
    }
    const combined=signal?AbortSignal.any([signal,AbortSignal.timeout(30000)]):AbortSignal.timeout(30000);
    let response;try{response=await fetch(url,{method,headers,cache:'no-store',signal:combined});}catch(error){throw new KoboError(signal?.aborted?'cancelled':combined.aborted?'timeout':'offline','The storage request did not complete.',!signal?.aborted);}
    if(op==='read'&&response.status===404)return null;
    if(!response.ok){let detail;try{detail=(await response.json()).error;}catch{}throw Object.assign(new KoboError('server','The storage request failed.'),detail);}
    if(op==='read'){const data=await response.arrayBuffer();if(data.byteLength>KOBO_BYTES)throw new KoboError('too-large','The storage response exceeded 1 MiB.');return {data,etag:response.headers.get('etag')};}
    return response.json();
  }
  async function refresh(){
    if(closed||!port||polling)return;polling=true;
    try{
      const next=await request('status');if(closed)return;
      if(requireStorage&&!next.available){close('Connect and verify your chosen storage provider in Files & storage before opening this experimental app. The current build needs a configured connection to keep local account libraries separate.');return;}
      if(changed(next)){restart('binding-changed');return;}
      if(!status||JSON.stringify(status)!==JSON.stringify(next)){status=next;post({type:'change',status});onStatus?.(status);}
    }catch(error){if(closed)return;if(error.code==='unauthorized'&&onRelaunch)restart('authorization-changed');else if(['unauthorized','forbidden'].includes(error.code))close(error.message);else onStatus?.({available:false,reason:'provider-unavailable',message:error.message});}finally{polling=false;}
  }
  async function receive(event:MessageEvent){
    const msg=event.data;if(closed||!msg||typeof msg!=='object'||!(Number.isSafeInteger(msg.id)&&msg.id>0||typeof msg.id==='string'&&msg.id.length>0&&msg.id.length<=100))return;
    const {id,op}=msg;
    if(op==='cancel'){pending.get(msg.target)?.abort();return;}
    if(pending.has(id))return;
    const abort=new AbortController();
    try{
      if(pending.size>=4)throw new KoboError('rate-limited','Wait for an existing storage operation to finish.',true,1000);
      pending.set(id,abort);
      const args=msg.args??{};if(!args||typeof args!=='object'||Array.isArray(args))throw new KoboError('invalid','Use named arguments.');
      if(args.app!==app&&!(op==='openSettings'&&args.app===undefined))throw new KoboError('forbidden','An app cannot select another app.');koboApp(app);
      if(op==='openSettings'){window.open('/studio/storage','_blank','noopener');post({id,ok:true,result:null});return;}
      if(!['status','read','stat','list','put','remove'].includes(op))throw new KoboError('invalid','Unknown storage operation.');
      if(!status&&op!=='status')throw new KoboError('invalid','Read storage status before accessing files.');
      const result:any=await request(op,{...args,requestId:id},abort.signal);
      if(op==='status'){
        if(requireStorage&&!result.available){close('Connect and verify your chosen storage provider before opening this experimental app.');return;}
        if(changed(result)){restart('binding-changed');return;}status=result;onStatus?.(status);
      }
      if(closed||abort.signal.aborted)return;
      post({id,ok:true,result},op==='read'&&result?[result.data]:[]);
    }catch(error){const failure=koboFailure(error);try{onOperationError?.({operation:typeof op==='string'?op.slice(0,30):'unknown',path:typeof msg.args?.path==='string'?msg.args.path.slice(0,1600):typeof msg.args?.dir==='string'?msg.args.dir.slice(0,1600):'',code:failure.code,message:failure.message});}catch{}post({id,ok:false,error:failure});if(error.code==='unauthorized'){if(onRelaunch)restart('authorization-changed');else close(error.message);}else if(error.code==='forbidden')refresh();}
    finally{pending.delete(id);}
  }
  function hello(event:MessageEvent){
    const msg=event.data;
    if(closed||used||event.source!==frame.contentWindow||event.origin!==launch.origin||msg?.type!=='kobo-hello'||msg.launchId!==launch.launchId||msg.app!==app||msg.bridgeVersion!==1)return;
    used=true;const channel=new MessageChannel();port=channel.port1;port.onmessage=receive;port.start();
    frame.contentWindow!.postMessage({type:'kobo-welcome',launchId:launch.launchId,app,bridgeVersion:1,uiLanguage:currentAppLanguage(),fallbackLanguage:'en'},launch.origin,[channel.port2]);refresh();
  }
  const offAuth=onAuthChange((event,user)=>{if(event==='logout')close();else if(event==='login'&&user?.id&&user.id!==(status||launch.storageStatus)?.userKey)restart('account-changed');else refresh();});
  const timer=setInterval(refresh,15000),pagehide=()=>close();
  window.addEventListener('message',hello);window.addEventListener('focus',refresh);window.addEventListener('pagehide',pagehide,{once:true});
  const offLanguage=watchAppLanguage(language=>{if(!closed)frame.contentWindow?.postMessage({type:'soraspace:language',language,fallbackLanguage:'en'},launch.origin);});
  const url=new URL(launch.origin);url.searchParams.set('lang',currentAppLanguage());url.hash='kobo-launch='+encodeURIComponent(launch.launchId);frame.src=url.href;
  return {close};
}


// The session controller owns replacement launches. Never reuse an old launch id,
// leave its port alive, or resume automatically after a sign-out/manual close.
export function mountKoboSession(options:Parameters<typeof mountKoboShell>[0]&{onLaunch?:(launch:any)=>void}){
 const usedLaunches=new Set([options.launch.launchId]);
 let active=true,serial=0,controller:AbortController|null=null,shell:ReturnType<typeof mountKoboShell>;
 const stop=(message?:string)=>{if(!active)return;active=false;serial++;controller?.abort();offAuth();shell?.close(message);};
 const offAuth=onAuthChange(event=>{if(event==='logout')stop('Signed out. Open the app again after signing in.');else if(event==='login'&&controller)void relaunch();});
 function attach(launch:any){shell=mountKoboShell({...options,launch,onRelaunch:()=>void relaunch()});options.onLaunch?.(launch);}
 async function relaunch(){
  if(!active)return;const attempt=++serial;controller?.abort();controller=new AbortController();shell?.close('Opening a freshly authorized app…');
  try{
   const response=await fetch('/api/kobo/launch',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({app:options.launch.app}),cache:'no-store',signal:AbortSignal.any([controller.signal,AbortSignal.timeout(30000)])});
   const launch=await response.json();if(!active||attempt!==serial)return;
   if(!response.ok)throw Error(launch.error?.message||'Sign in with a permitted account before reopening the app.');
   if(usedLaunches.has(launch.launchId)||!launch.launchId||launch.app!==options.launch.app)throw Error('A fresh app launch could not be verified.');
   if(options.requireStorage&&!launch.storageStatus?.available)throw Error('Connect and verify the chosen storage provider before reopening the app.');
   usedLaunches.add(launch.launchId);controller=null;attach(launch);
  }catch(error){if(active&&attempt===serial){controller=null;options.onClosed?.(error instanceof Error?error.message:'The app could not be reopened.');}}
 }
 attach(options.launch);return {close:stop};
}
