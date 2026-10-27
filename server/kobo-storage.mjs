import {createHash,randomUUID} from 'node:crypto';
import {KOBO_APPS,KOBO_BYTES,KoboError,koboApp,koboPath} from '../src/lib/kobo-contract.mjs';
import {appRoot,davFiles} from './kobo-dav.mjs';
export const connectionId=(user,config)=>config.provider==='google-drive'?config.connectionId:createHash('sha256').update(JSON.stringify([user,config.url,config.username,config.baseFolder??'Kobo'])).digest('hex');
export function registeredAppOrigin(app,shellOrigin,env=process.env){
  koboApp(app);const value=env['KOBO_'+app.toUpperCase()+'_ORIGIN'];
  if(!value)throw new KoboError('forbidden','This rebuilt app has no test origin configured yet.');
  let url;try{url=new URL(value);}catch{throw new KoboError('server','The app test origin is invalid.');}
  if(url.protocol!=='https:'||url.origin===shellOrigin||url.username||url.password||url.pathname!=='/'||url.search||url.hash||url.port)throw new KoboError('forbidden','An app must use its own approved HTTPS origin.');
  return url.origin;
}
export function storageStatus(actor,config,app){
  koboApp(app);
  const allowed=actor?.permissions?.[KOBO_APPS[app].capability]===true;
  const verified=config?.koboVerified?.protocol===1&&!config?.authFailed;
  const atomic=config?.provider!=='google-drive'||config?.koboVerified?.atomicChecks?.createOnly===true&&config?.koboVerified?.atomicChecks?.compareAndSwap===true;
  return {available:Boolean(actor&&allowed&&config&&verified),reason:!actor?'signed-out':!allowed?'app-not-permitted':!config?'no-connection':!verified?'provider-unavailable':'ok',userKey:actor?.user?.id||'',connectionId:config?connectionId(actor.user.id,config):'',provider:config?.provider==='google-drive'?'google-drive':'webdav',label:config?.label||'My WebDAV storage',root:config?(config.provider==='google-drive'?'Kōbō/'+koboApp(app).folder:decodeURIComponent(appRoot(config,app).pathname)):'',readOnly:!verified||!atomic,maxPutBytes:KOBO_BYTES,maxGetBytes:KOBO_BYTES,settingsUrl:'/studio/storage'};
}
export function koboStorageService({launchStore,loadConnection,files=davFiles,origin=registeredAppOrigin,now=()=>Date.now(),enabled=()=>process.env.KOBO_STORAGE_ENABLED==='true'}){
  function permit(actor,app){const spec=koboApp(app);if(!actor?.permissions?.[spec.capability]||!enabled()&&!actor.isOwner)throw new KoboError('forbidden','This storage integration is currently limited to owner testing.');}
  async function launch(actor,app,shellOrigin){
    permit(actor,app);const appOrigin=origin(app,shellOrigin);const id=randomUUID();
    const record={user:actor.user.id,app,appOrigin,shellOrigin,expires:now()+60*60*1000};
    await launchStore.setJSON('launch/'+id,record,{onlyIfNew:true});
    const status=storageStatus(actor,await loadConnection(actor.user.id),app);
    return {launchId:id,app,origin:appOrigin,expires:record.expires,experimental:true,storageStatus:status};
  }
  async function binding(actor,id,shellOrigin){
    if(typeof id!=='string'||!/^[-a-f0-9]{36}$/.test(id))throw new KoboError('forbidden','An app launch is required.');
    const record=await launchStore.get('launch/'+id,{type:'json'});
    if(!record||record.user!==actor.user.id||record.shellOrigin!==shellOrigin||record.expires<=now())throw new KoboError('unauthorized','This app launch has expired. Reopen the app.');
    permit(actor,record.app);if(origin(record.app,shellOrigin)!==record.appOrigin)throw new KoboError('unauthorized','The app origin changed. Reopen the app.');return record;
  }
  async function perform(actor,id,shellOrigin,op,args={}){
    const record=await binding(actor,id,shellOrigin);if(args.app!==undefined&&args.app!==record.app)throw new KoboError('forbidden','An app cannot access another app.');
    const config=await loadConnection(actor.user.id);const status=storageStatus(actor,config,record.app);
    if(op==='status')return status;
    if(!config)throw new KoboError('forbidden','Configure your storage connection in Account settings first.');
    if(!args.connectionId||args.connectionId!==status.connectionId)throw new KoboError('conflict','Your storage destination changed. Reopen the app before continuing.');
    if(!status.available)throw new KoboError('forbidden','Verify Kōbō sync in Files & storage before using this connection.');
    if(status.readOnly&&['put','remove'].includes(op))throw new KoboError('forbidden','Google Drive is read-only until competing-save checks pass. Run Test connection in Files & storage.');
    const api=files(config,record.app,{signal:args.signal}),opts={ifMatch:args.ifMatch,ifNoneMatch:args.ifNoneMatch,signal:args.signal};
    switch(op){
      case 'read':return api.read(koboPath(args.path),opts);
      case 'stat':return api.stat(koboPath(args.path),opts);
      case 'list':return api.list(koboPath(args.path,true),opts);
      case 'put':return api.put(koboPath(args.path),args.data,opts);
      case 'remove':return api.remove(koboPath(args.path),opts);
      default:throw new KoboError('invalid','Unknown storage operation.');
    }
  }
  return {launch,perform,binding};
}

// Opt-in probe. Existing WebDAV copy support does not imply safe multi-device sync.
export async function verifyKoboConnection(config,{files=davFiles}={}){
  const api=files(config,'hikari'),path='_kobo-connection-check/'+randomUUID()+'.bin';let etag;
  const expectConflict=async fn=>{try{await fn();}catch(e){if(e.code==='conflict')return;throw e;}throw new KoboError('forbidden','This provider did not honour a conditional request. Kōbō sync stays disabled.');};
  try{
    etag=(await api.put(path,new Uint8Array([1,2,3]),{ifNoneMatch:'*'})).etag;
    const value=await api.read(path,{ifMatch:etag});if(!value||Buffer.compare(value.data,Buffer.from([1,2,3]))!==0)throw new KoboError('server','Storage read-back did not match.');
    const stat=await api.stat(path);if(!stat||stat.size!==3||stat.etag!==etag)throw new KoboError('server','Storage metadata did not match.');
    const listing=await api.list('_kobo-connection-check');if(!listing.some(x=>x.name===path.split('/').pop()))throw new KoboError('server','Storage folder listing did not match.');
    await expectConflict(()=>api.put(path,new Uint8Array([9]),{ifNoneMatch:'*'}));
    const next=(await api.put(path,new Uint8Array([4,5,6]),{ifMatch:etag})).etag;if(next===etag)throw new KoboError('forbidden','This provider did not change its ETag after a replacement.');
    const stale=etag;etag=next;await expectConflict(()=>api.put(path,new Uint8Array([9]),{ifMatch:stale}));
    // Direct conditional DELETE, not just the client's metadata pre-check.
    if(api.probeDelete)await expectConflict(()=>api.probeDelete(path,stale));
    else throw new KoboError('server','Provider verification requires a conditional-delete probe.');
    await api.remove(path,{ifMatch:etag});etag=undefined;
    if(await api.read(path)!==null)throw new KoboError('server','Storage deletion could not be confirmed.');
    return {protocol:1,checkedAt:new Date().toISOString()};
  }finally{if(etag)try{await api.remove(path,{ifMatch:etag});}catch{/* Leave the isolated probe file rather than delete a changed file. */}}
}
