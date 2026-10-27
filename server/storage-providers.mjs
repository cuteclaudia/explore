import {createHash,randomUUID} from 'node:crypto';
import {unseal} from './webdav.mjs';
import {davFiles} from './kobo-dav.mjs';
import {googleConnection} from './google-drive-connection.mjs';
import {googleDriveAPI} from './google-drive-http.mjs';
import {googleDriveFiles} from './google-drive-files.mjs';
import {KoboError} from '../src/lib/kobo-contract.mjs';
export function storageProviders({connections,index,fetcher=fetch,env=process.env}){
 const google=googleConnection({store:connections,fetcher,env});
 async function selected(user){return (await connections.get('active-provider/'+user,{type:'json'}))?.provider||'webdav';}
 async function load(user){if(await selected(user)==='google-drive')return google.load(user);const raw=await connections.get('webdav/'+user,{type:'json'});return raw?unseal(user,raw):null;}
 function files(config,app,options={}){if(config.provider!=='google-drive')return davFiles(config,app,options);
  // Refresh immediately before each provider operation; tokens never enter a frame.
  const api={};for(const name of ['meta','createFolder','createVersion','download'])api[name]=async(...args)=>{const live=await google.access(config.userId);if(live.connectionId!==config.connectionId)throw new KoboError('conflict','Your Google Drive account changed.');return googleDriveAPI(live.accessToken,{fetcher,signal:options.signal})[name](...args);};
  return googleDriveFiles(config,app,{store:index,api});
 }
 async function choose(user,provider){if(!['webdav','google-drive'].includes(provider))throw new KoboError('invalid','Choose WebDAV or Google Drive.');const config=provider==='google-drive'?await google.load(user):await (async()=>{const r=await connections.get('webdav/'+user,{type:'json'});return r?unseal(user,r):null;})();if(!config?.koboVerified?.protocol||config.authFailed)throw new KoboError('forbidden','Connect and verify this provider before selecting it.');await connections.setJSON('active-provider/'+user,{provider});return {provider};}
 async function verifyGoogle(user){const config=await google.access(user),api=files(config,'hikari'),path='_connection-check/'+randomUUID()+'.bin';let etag;
  const conflict=async fn=>{try{await fn();}catch(e){if(e.code==='conflict')return;throw e;}throw new KoboError('server','The Drive revision checks did not refuse a conflicting change.');};
  try{etag=(await api.put(path,new Uint8Array([1,2,3]),{ifNoneMatch:'*'})).etag;const read=await api.read(path);if(!read||read.etag!==etag||Buffer.compare(read.data,Buffer.from([1,2,3]))!==0)throw new KoboError('server','Drive read-back did not match.');await conflict(()=>api.put(path,new Uint8Array([9]),{ifNoneMatch:'*'}));const old=etag;etag=(await api.put(path,new Uint8Array([4]),{ifMatch:old})).etag;await conflict(()=>api.put(path,new Uint8Array([9]),{ifMatch:old}));await conflict(()=>api.remove(path,{ifMatch:old}));if((await api.stat(path)).size!==1||!(await api.list('_connection-check')).some(f=>f.name===path.split('/').pop()))throw new KoboError('server','Drive metadata checks did not match.');await api.remove(path,{ifMatch:etag});etag=undefined;if(await api.read(path)!==null)throw new KoboError('server','The removed Drive revision is still current.');await google.markVerified(user,config.connectionId);return {verified:true};}finally{if(etag)try{await api.remove(path,{ifMatch:etag});}catch{}}
 }
 return {google,load,files,selected,choose,verifyGoogle};
}
