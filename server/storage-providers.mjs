import {createHash,randomUUID} from 'node:crypto';
import {unseal} from './webdav.mjs';
import {davFiles} from './kobo-dav.mjs';
import {googleConnection} from './google-drive-connection.mjs';
import {googleDriveAPI} from './google-drive-http.mjs';
import {googleDriveFiles} from './google-drive-files.mjs';
import {googleDriveRecovery,indexContext} from './google-drive-recovery.mjs';
import {verifyAtomicIndex} from './verify-atomic-index.mjs';
import {KoboError} from '../src/lib/kobo-contract.mjs';
export function storageProviders({connections,index,backups,fetcher=fetch,env=process.env,indexWriteAudit=()=>[]}){
 const google=googleConnection({store:connections,fetcher,env});
 async function selected(user){return (await connections.get('active-provider/'+user,{type:'json'}))?.provider||'webdav';}
 async function load(user){if(await selected(user)==='google-drive')return google.load(user);const raw=await connections.get('webdav/'+user,{type:'json'});return raw?unseal(user,raw):null;}
 function googleAPI(config,options={}){const api={};for(const name of ['meta','createFolder','createVersion','download'])api[name]=async(...args)=>{const live=await google.access(config.userId);if(live.connectionId!==config.connectionId)throw new KoboError('conflict','Your Google Drive account changed.');return googleDriveAPI(live.accessToken,{fetcher,signal:options.signal})[name](...args);};return api;}
 const recovery=backups?googleDriveRecovery({index,backups,apiFor:config=>googleAPI(config,{signal:AbortSignal.timeout(22000)})}):null;
 async function indexState(config,app){if(config?.provider!=='google-drive')return {epoch:'legacy',recovering:false};const c=await indexContext(index,config,app);return {epoch:c.generation,recovering:!!c.root?.data.recovering};}
 function files(config,app,options={}){if(config.provider!=='google-drive')return davFiles(config,app,options);
  // Refresh immediately before each provider operation; tokens never enter a frame.
  return googleDriveFiles(config,app,{store:index,api:googleAPI(config,options),recovery,expectedEpoch:options.storageEpoch});
 }
 async function choose(user,provider){if(!['webdav','google-drive'].includes(provider))throw new KoboError('invalid','Choose WebDAV or Google Drive.');const config=provider==='google-drive'?await google.load(user):await (async()=>{const r=await connections.get('webdav/'+user,{type:'json'});return r?unseal(user,r):null;})();if(!config?.koboVerified?.protocol||config.authFailed||provider==='google-drive'&&!(config.koboVerified.atomicChecks?.createOnly===true&&config.koboVerified.atomicChecks?.compareAndSwap===true))throw new KoboError('forbidden','Connect and verify this provider before selecting it.');await connections.setJSON('active-provider/'+user,{provider});return {provider};}
 async function verifyGoogle(user){const config=await google.access(user),api=files(config,'hikari'),path='_connection-check/'+randomUUID()+'.bin';let etag;
  const conflict=async fn=>{try{await fn();}catch(e){if(e.code==='conflict')return;throw e;}throw new KoboError('server','The Drive revision checks did not refuse a conflicting change.');};
  try{await google.clearVerification(user,config.connectionId);etag=(await api.put(path,new Uint8Array([1,2,3]),{ifNoneMatch:'*'})).etag;const read=await api.read(path);if(!read||read.etag!==etag||Buffer.compare(read.data,Buffer.from([1,2,3]))!==0)throw new KoboError('server','Drive read-back did not match.');await conflict(()=>api.put(path,new Uint8Array([9]),{ifNoneMatch:'*'}));const old=etag;etag=(await api.put(path,new Uint8Array([4]),{ifMatch:old})).etag;await conflict(()=>api.put(path,new Uint8Array([9]),{ifMatch:old}));await conflict(()=>api.remove(path,{ifMatch:old}));if((await api.stat(path)).size!==1||!(await api.list('_connection-check')).some(f=>f.name===path.split('/').pop()))throw new KoboError('server','Drive metadata checks did not match.');await api.remove(path,{ifMatch:etag});etag=undefined;if(await api.read(path)!==null)throw new KoboError('server','The removed Drive revision is still current.');const atomicChecks=await verifyAtomicIndex(index,user+'\0'+config.connectionId,{writeAudit:indexWriteAudit});await google.markVerified(user,config.connectionId,atomicChecks);return {verified:true,atomicChecks};}catch(error){try{await google.clearVerification(user,config.connectionId);}catch{}throw error;}finally{if(etag)try{await api.remove(path,{ifMatch:etag});}catch{}}
 }
 return {google,load,files,selected,choose,verifyGoogle,recovery,indexState};
}
