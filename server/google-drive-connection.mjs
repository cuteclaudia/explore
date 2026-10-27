import {createHash,randomBytes,timingSafeEqual} from 'node:crypto';
import {seal,unseal} from './webdav.mjs';
import {revision,commit,locked} from './blob-revisions.mjs';
import {KoboError} from '../src/lib/kobo-contract.mjs';
import {DRIVE_SCOPE,driveId,googleFetch,googleJSON,googleDriveAPI} from './google-drive-http.mjs';
const hash=value=>createHash('sha256').update(value).digest('hex');
const bind=user=>user+'\0google-drive';
export function driveClient(env=process.env){
 const id=env.GOOGLE_DRIVE_CLIENT_ID,secret=env.GOOGLE_DRIVE_CLIENT_SECRET,redirect=env.GOOGLE_DRIVE_REDIRECT_URI;
 if(!id||!secret||!redirect)throw new KoboError('server','Google Drive needs administrator setup. Configure its client ID, secret and callback URL in Netlify Functions.');
 let uri;try{uri=new URL(redirect);}catch{throw new KoboError('server','The Google Drive callback URL is invalid.');}
 if(uri.protocol!=='https:'||uri.pathname!=='/api/google-drive/callback'||uri.search||uri.hash||uri.username||uri.password||uri.port)throw new KoboError('server','Use the exact HTTPS Google Drive callback URL.');
 return {id,secret,redirect:uri.href,origin:uri.origin};
}
function tokens(value,now=Date.now()){
 if(typeof value?.access_token!=='string'||value.access_token.length>8192||!Number.isFinite(value.expires_in)||value.expires_in<30||value.expires_in>86400||value.token_type?.toLowerCase()!=='bearer')throw new KoboError('server','Google returned an invalid authorization response.');
 if(value.scope&&!value.scope.split(' ').includes(DRIVE_SCOPE))throw new KoboError('forbidden','Google Drive file access was not granted.');
 if(value.scope?.split(' ').some(s=>/^https:\/\/www.googleapis.com\/auth\/drive(?:\.|$)/.test(s)&&s!==DRIVE_SCOPE))throw new KoboError('forbidden','The returned Google access is broader than the requested file permission. Use the dedicated Kōbō OAuth client.');
 return {accessToken:value.access_token,expiresAt:now+value.expires_in*1000,...(typeof value.refresh_token==='string'&&value.refresh_token.length<=8192?{refreshToken:value.refresh_token}:{})};
}
export function googleConnection({store,fetcher=fetch,env=process.env,now=()=>Date.now()}){
 const client=()=>driveClient(env);
 async function saved(user){const r=await revision(store,'google-drive/'+user);if(!r||r.data.deleted)return null;const config=unseal(bind(user),r.data.encrypted);if(config.userId!==user||config.provider!=='google-drive'||!driveId(config.rootId))throw new KoboError('forbidden','Invalid Google Drive connection binding.');return {record:r,config};}
 async function tokenPost(parameters){const c=client();const response=await googleFetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:c.id,client_secret:c.secret,...parameters})},fetcher);if(!response.ok)throw new KoboError('forbidden','Google authorization expired or was refused. Reconnect Google Drive.');return tokens(await googleJSON(response),now());}
 async function storeConfig(user,config,before){return commit(store,'google-drive/'+user,{encrypted:seal(bind(user),config),deleted:false},before);}
 return {
  client,
  async start(user,origin){const c=client();if(origin!==c.origin)throw new KoboError('forbidden','Open storage settings on the configured website address to connect Google Drive.');
   const connection=await revision(store,'google-drive/'+user);
   const state=randomBytes(32).toString('base64url'),browser=randomBytes(32).toString('base64url'),verifier=randomBytes(48).toString('base64url');
   await commit(store,'google-oauth/'+hash(state),{user,expires:now()+600000,consumed:false,encrypted:seal(user+'\0google-oauth',{verifier,browser:hash(browser),connectionWriteId:connection?.data.writeId||null})},null);
   const url=new URL('https://accounts.google.com/o/oauth2/v2/auth');for(const [key,value] of Object.entries({client_id:c.id,redirect_uri:c.redirect,response_type:'code',scope:DRIVE_SCOPE,access_type:'offline',prompt:'consent select_account',state,code_challenge:hashBase64(verifier),code_challenge_method:'S256',include_granted_scopes:'false'}))url.searchParams.set(key,value);
   return {authorizationUrl:url.href,browser};
  },
  async callback(user,{state,browser,code,denied=false}){
   if(!/^[A-Za-z0-9_-]{43}$/.test(state||'')||!/^[A-Za-z0-9_-]{43}$/.test(browser||''))throw new KoboError('forbidden','The Google connection request expired. Start again from Files & storage.');
   const flow=await locked('google-oauth:'+state,async()=>{const key='google-oauth/'+hash(state),before=await revision(store,key),r=before?.data;if(!r||r.user!==user||r.consumed||r.expires<now())throw new KoboError('forbidden','The Google connection request expired or belongs to another account.');const decoded=unseal(user+'\0google-oauth',r.encrypted);if(!timingSafeEqual(Buffer.from(decoded.browser),Buffer.from(hash(browser))))throw new KoboError('forbidden','The Google connection request belongs to a different browser session.');await commit(store,key,{user,expires:r.expires,consumed:true},before);return decoded;});
   if(denied)return {cancelled:true};
   const unchanged=async()=>{const r=await revision(store,'google-drive/'+user);if((r?.data.writeId||null)!==flow.connectionWriteId)throw new KoboError('conflict','Your storage connection changed while Google authorization was open. Start again.');return r;};await unchanged();if(typeof code!=='string'||!code||code.length>4096)throw new KoboError('invalid','Google did not return an authorization code.');
   const c=client(),auth=await tokenPost({code,code_verifier:flow.verifier,redirect_uri:c.redirect,grant_type:'authorization_code'});if(!auth.refreshToken)throw new KoboError('forbidden','Google did not grant offline access. Reconnect and approve the requested access.');
   const api=googleDriveAPI(auth.accessToken,{fetcher}),about=await api.about();if(typeof about.user?.permissionId!=='string'||about.user.permissionId.length>200)throw new KoboError('server','Google did not identify the connected Drive account.');
   const owner=hash(user),root=await api.root(owner);if(!driveId(root.id)||root.appProperties?.koboOwner!==owner||root.appProperties?.koboRoot!=='1'||root.trashed)throw new KoboError('server','Google did not confirm the private Kōbō folder.');
   return locked('google-connect:'+user,async()=>{const previous=await unchanged();const connectionId=hash(JSON.stringify([user,c.id,about.user.permissionId,root.id]));const config={provider:'google-drive',userId:user,clientId:c.id,accountId:about.user.permissionId,email:String(about.user.emailAddress||'').slice(0,250),rootId:root.id,connectionId,label:'Google Drive',connectedAt:new Date().toISOString(),quota:about.storageQuota||{},...auth};await storeConfig(user,config,previous);return {connected:true};});
  },
  load:async user=>(await saved(user))?.config||null,
  async access(user){return locked('google-refresh:'+user,async()=>{const found=await saved(user);if(!found)throw new KoboError('forbidden','Connect Google Drive in Files & storage first.');let {config}=found;const c=client();if(config.clientId!==c.id||config.authFailed)throw new KoboError('forbidden','Reconnect Google Drive in Files & storage.');if(config.expiresAt>now()+60000)return config;
   let refreshed;try{refreshed=await tokenPost({grant_type:'refresh_token',refresh_token:config.refreshToken});}catch(e){if(e.code==='forbidden')try{await storeConfig(user,{...config,authFailed:true},found.record);}catch{}throw e;}
   const next={...config,...refreshed};try{await storeConfig(user,next,found.record);return next;}catch(e){if(e.code!=='conflict')throw e;const fresh=await saved(user);if(fresh&&fresh.config.connectionId===config.connectionId&&!fresh.config.authFailed&&fresh.config.expiresAt>now()+30000)return fresh.config;throw new KoboError('forbidden','The Drive connection changed. Reopen storage settings.');}
  });},
  async markVerified(user,connectionId,atomicChecks){if(atomicChecks?.createOnly!==true||atomicChecks?.compareAndSwap!==true)throw new KoboError('invalid','Complete competing-save checks before verification.');return locked('google-connect:'+user,async()=>{const found=await saved(user);if(!found||found.config.connectionId!==connectionId)throw new KoboError('conflict','The Google account changed during verification.');await storeConfig(user,{...found.config,koboVerified:{protocol:1,strategy:'immutable-drive-objects',atomicChecks:{createOnly:true,compareAndSwap:true},checkedAt:new Date().toISOString()}},found.record);});},
  async clearVerification(user,connectionId){return locked('google-connect:'+user,async()=>{const found=await saved(user);if(found?.config.connectionId===connectionId)await storeConfig(user,{...found.config,koboVerified:found.config.koboVerified?.protocol===1?{...found.config.koboVerified,atomicChecks:{createOnly:false,compareAndSwap:false},atomicCheckFailedAt:new Date().toISOString()}:null},found.record);});},
  async disconnect(user){return locked('google-connect:'+user,async()=>{const found=await saved(user);if(!found){const before=await revision(store,'google-drive/'+user);await commit(store,'google-drive/'+user,{deleted:true},before);return {disconnected:true};}
   // Remove local authorization first. A delayed refresh cannot recreate this record.
   await commit(store,'google-drive/'+user,{deleted:true},found.record);let revoked=false;
   try{const r=await googleFetch('https://oauth2.googleapis.com/revoke',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({token:found.config.refreshToken})},fetcher);revoked=r.ok||r.status===400;}catch{}
   return {disconnected:true,revoked};
  });},
 };
}
const hashBase64=value=>createHash('sha256').update(value).digest('base64url');
