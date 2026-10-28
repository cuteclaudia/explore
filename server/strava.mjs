import {createHash,randomBytes,timingSafeEqual,randomUUID} from 'node:crypto';
import {AccessError} from './access.mjs';
import {seal,unseal} from './webdav.mjs';
import {revision,commit,locked} from './blob-revisions.mjs';

const hash=value=>createHash('sha256').update(value).digest('hex');
const id=value=>Number.isSafeInteger(value)&&value>0;
const token=value=>typeof value==='string'&&value.length>0&&value.length<=8192&&!/[\u0000-\u001f\u007f]/.test(value);
const binding=user=>user+'\0fitness:strava';
const key=user=>'strava/'+hash(user);
export function stravaClient(env=process.env){
 if(env.STRAVA_ENABLED!=='true')throw new AccessError(503,'Strava connection setup is not enabled yet.');
 const clientId=String(env.STRAVA_CLIENT_ID||'').trim(),secret=String(env.STRAVA_CLIENT_SECRET||'').trim();let redirect;
 try{redirect=new URL(env.STRAVA_REDIRECT_URI);}catch{throw new AccessError(503,'Strava needs its client ID, client secret and callback URL configured.');}
 if(!/^\d{1,20}$/.test(clientId)||!token(secret)||redirect.protocol!=='https:'||redirect.pathname!=='/api/fitness/strava/callback'||redirect.search||redirect.hash||redirect.username||redirect.password||redirect.port||!['www.claudiagilbert.com','claudiagilbert.com','explorebyclaudia.netlify.app'].includes(redirect.hostname))throw new AccessError(503,'The Strava application settings are incomplete or invalid.');
 if(!/^[A-Za-z0-9+/]{43}=$/.test(env.FILE_STORAGE_ENCRYPTION_KEY||''))throw new AccessError(503,'The existing storage encryption key must be configured for Strava.');
 return {clientId,secret,redirect:redirect.href,origin:redirect.origin};
}

async function json(response,limit=5*1024*1024){
 const size=Number(response.headers.get('content-length'));if(size>limit){try{await response.body?.cancel();}catch{}throw new AccessError(502,'Strava returned more data than this preview can handle.');}
 const reader=response.body?.getReader();if(!reader)throw new AccessError(502,'Strava returned an empty response.');const parts=[];let total=0;
 try{for(;;){const {value,done}=await reader.read();if(done)break;total+=value.byteLength;if(total>limit)throw new AccessError(502,'Strava returned more data than this preview can handle.');parts.push(value);}}finally{try{await reader.cancel();}catch{}}
 try{return JSON.parse(Buffer.concat(parts).toString('utf8'));}catch{throw new AccessError(502,'Strava returned an invalid response.');}
}
export function decodePolyline(encoded,maxPoints=20000){
 if(typeof encoded!=='string'||encoded.length>200000)throw new AccessError(422,'This route is too large to preview.');let offset=0,lat=0,lng=0;const points=[];
 function next(){let value=0,shift=0,b;do{if(offset>=encoded.length||shift>30)throw new AccessError(502,'Strava returned an invalid route.');b=encoded.charCodeAt(offset++)-63;if(b<0||b>63)throw new AccessError(502,'Strava returned an invalid route.');value+=(b&31)*2**shift;shift+=5;}while(b>=32);return value%2?-(Math.floor(value/2)+1):Math.floor(value/2);}
 while(offset<encoded.length){if(points.length>=maxPoints)throw new AccessError(422,'This route has too many points to preview.');lat+=next();lng+=next();const p=[lng/1e5,lat/1e5];if(Math.abs(p[0])>180||Math.abs(p[1])>90)throw new AccessError(502,'Strava returned an invalid coordinate.');points.push(p);}return points;
}
function summary(value,athleteId){
 if(!value||!id(value.id)||String(value.athlete?.id)!==athleteId)throw new AccessError(403,'This activity does not belong to your connected Strava account.');
 if(value.private===true||value.visibility==='only_me')throw new AccessError(403,'This connection does not import private-only Strava activities.');
 const date=new Date(typeof value.start_date==='string'&&value.start_date.length<80?value.start_date:'invalid');if(!Number.isFinite(date.getTime()))throw new AccessError(502,'Strava returned an invalid activity date.');
 const metric=(key,max)=>typeof value[key]==='number'&&Number.isFinite(value[key])&&value[key]>=0&&value[key]<=max?value[key]:null;
 return {id:String(value.id),name:String(value.name||'Strava activity').slice(0,180),type:String(value.sport_type||value.type||'Activity').slice(0,50),startedAt:date.toISOString(),distance:metric('distance',1e8),movingSeconds:metric('moving_time',1e8),elapsedSeconds:metric('elapsed_time',1e8),ascent:metric('total_elevation_gain',1e6),sourceUrl:'https://www.strava.com/activities/'+value.id};
}
function auth(value,now,athleteId){
 if(!token(value?.access_token)||!token(value.refresh_token)||String(value.token_type).toLowerCase()!=='bearer'||!Number.isSafeInteger(value.expires_at)||value.expires_at*1000<now+30000||value.expires_at*1000>now+7*86400000||value.athlete&&String(value.athlete.id)!==athleteId)throw new AccessError(502,'Strava returned invalid authorization details.');
 return {accessToken:value.access_token,refreshToken:value.refresh_token,expiresAt:value.expires_at*1000};
}
export function stravaConnection({store,fetcher=fetch,env=process.env,now=()=>Date.now(),mutex=locked}){
 const client=()=>stravaClient(env);
 async function request(path,{method='GET',accessToken,body}={}){
  const url=new URL(path,'https://www.strava.com');if(url.origin!=='https://www.strava.com'||!/^\/(?:oauth\/(?:token|deauthorize)|api\/v3\/)/.test(url.pathname))throw new AccessError(503,'Invalid Strava service address.');
  let response;try{response=await fetcher(url.href,{method,redirect:'error',signal:AbortSignal.timeout(15000),headers:{Accept:'application/json',...(accessToken?{Authorization:'Bearer '+accessToken}:{}),...(body?{'Content-Type':'application/x-www-form-urlencoded'}:{})},...(body?{body:new URLSearchParams(body)}:{})});}catch{throw new AccessError(502,'Strava could not be reached. Try again shortly.');}
  if(!response.ok)try{await response.body?.cancel();}catch{}
  if(response.status===429)throw new AccessError(429,'Strava’s request limit was reached. Please try again later.');
  if([400,401,403].includes(response.status))throw new AccessError(403,'Strava access expired or was refused. Reconnect your account.');
  if(response.status===404)throw new AccessError(404,'This Strava activity or route is not available.');
  if(!response.ok)throw new AccessError(502,'Strava is temporarily unavailable. Please try again later.');return json(response,path==='/oauth/token'?65536:5*1024*1024);
 }
 async function saved(user){const record=await revision(store,key(user));if(!record||record.data.deleted)return null;let config;try{config=unseal(binding(user),record.data.encrypted);}catch{throw new AccessError(503,'The saved Strava connection could not be opened.');}if(config.userId!==user||config.provider!=='strava'||!id(Number(config.athleteId)))throw new AccessError(403,'Invalid Strava connection binding.');return {record,config};}
 const save=(user,config,before)=>commit(store,key(user),{encrypted:seal(binding(user),config),deleted:false},before);
 async function access(user){client();return mutex('strava-refresh:'+user,async()=>{
  for(let attempt=0;attempt<24;attempt++){
   const found=await saved(user);if(!found)throw new AccessError(409,'Connect Strava before selecting an activity.');const {record,config}=found,c=client();if(config.clientId!==c.clientId||config.authFailed)throw new AccessError(403,'Reconnect your Strava account.');
   const lease=record.data.refreshLease;
   if(lease){if(!Number.isFinite(lease.expires)||lease.expires<=now())throw new AccessError(403,'The previous Strava refresh could not be confirmed. Reconnect your account.');await new Promise(resolve=>setTimeout(resolve,100));continue;}
   if(config.expiresAt>now()+60000)return config;
   let claimed;try{claimed=await commit(store,key(user),{encrypted:record.data.encrypted,deleted:false,refreshLease:{id:randomUUID(),expires:now()+45000}},record);}catch(error){if(error.code==='conflict')continue;throw error;}
   const owned=await revision(store,key(user));if(owned?.data.writeId!==claimed.writeId)throw new AccessError(409,'Your Strava connection changed. Reopen activity settings.');
   try{const next={...config,...auth(await request('/oauth/token',{method:'POST',body:{client_id:c.clientId,client_secret:c.secret,grant_type:'refresh_token',refresh_token:config.refreshToken}}),now(),config.athleteId)};await save(user,next,owned);return next;}
   catch(error){
    const fresh=await saved(user);
    if(fresh&&fresh.record.data.writeId!==owned.data.writeId&&fresh.config.connectionId===config.connectionId&&!fresh.record.data.refreshLease&&!fresh.config.authFailed&&fresh.config.expiresAt>now()+30000)return fresh.config;
    // A failed/lost rotation is ambiguous. Do not retry an old refresh token or
    // replace a reconnect/disconnect that won while this request was running.
    if(fresh?.record.data.writeId===owned.data.writeId)try{await save(user,{...config,...(error.status===429?{}:{authFailed:true})},owned);}catch{}
    if(error.code==='conflict')throw new AccessError(409,'Your Strava connection changed. Reopen activity settings.');throw error;
   }
  }
  throw new AccessError(503,'Strava authorization is being refreshed. Try again shortly.');
 });}
 async function stillCurrent(user,config){const fresh=await saved(user);if(!fresh||fresh.config.connectionId!==config.connectionId||fresh.config.authFailed)throw new AccessError(409,'Your Strava account changed during the request. Please try again.');}
 return {
  client,
  async status(user){let configured=true;try{client();}catch{configured=false;}const found=await saved(user);return {configured,connected:!!found,reconnectRequired:!!found?.config.authFailed||!!(found?.record.data.refreshLease&&found.record.data.refreshLease.expires<=now()),athleteId:found?.config.athleteId||'',previewOnly:true};},
  async start(user,origin){const c=client();if(origin!==c.origin)throw new AccessError(403,'Use the configured website address to connect Strava.');const before=await revision(store,key(user)),state=randomBytes(32).toString('base64url'),browser=randomBytes(32).toString('base64url');await commit(store,'oauth/'+hash(state),{owner:hash(user),expires:now()+600000,consumed:false,encrypted:seal(binding(user)+'\0oauth',{browser:hash(browser),connectionWriteId:before?.data.writeId||null})},null);const url=new URL('https://www.strava.com/oauth/authorize');for(const [k,v] of Object.entries({client_id:c.clientId,redirect_uri:c.redirect,response_type:'code',approval_prompt:'force',scope:'read,activity:read',state}))url.searchParams.set(k,v);return {authorizationUrl:url.href,browser};},
  async callback(user,{state,browser,code,scope,denied=false}){
   const c=client();if(!/^[A-Za-z0-9_-]{43}$/.test(state||'')||!/^[A-Za-z0-9_-]{43}$/.test(browser||''))throw new AccessError(403,'Start a new Strava connection from activity settings.');
   const flow=await mutex('strava-oauth:'+state,async()=>{const path='oauth/'+hash(state),before=await revision(store,path),record=before?.data;if(!record||record.owner!==hash(user)||record.consumed||record.expires<now())throw new AccessError(403,'This Strava request expired or belongs to another account.');const decoded=unseal(binding(user)+'\0oauth',record.encrypted);if(!timingSafeEqual(Buffer.from(decoded.browser),Buffer.from(hash(browser))))throw new AccessError(403,'This Strava request belongs to another browser session.');await commit(store,path,{owner:hash(user),consumed:true,expires:record.expires},before);return decoded;});
   if(denied)return {cancelled:true};const scopes=typeof scope==='string'&&scope.length<=300?scope.split(',').map(s=>s.trim()):[];if(!scopes.includes('activity:read')||scopes.some(s=>!['read','activity:read'].includes(s)))throw new AccessError(403,'Approve only the requested read-only Strava activity access.');if(typeof code!=='string'||!/^[-A-Za-z0-9_]{1,4096}$/.test(code))throw new AccessError(400,'Strava did not return an authorization code.');
   const unchanged=async()=>{const r=await revision(store,key(user));if((r?.data.writeId||null)!==flow.connectionWriteId)throw new AccessError(409,'Your Strava connection changed while consent was open. Start again.');return r;};await unchanged();const result=await request('/oauth/token',{method:'POST',body:{client_id:c.clientId,client_secret:c.secret,code,grant_type:'authorization_code'}});if(!id(result.athlete?.id))throw new AccessError(502,'Strava did not identify the connected athlete.');const athleteId=String(result.athlete.id),credentials=auth(result,now(),athleteId);
   await mutex('strava-connect:'+user,async()=>{const before=await unchanged();await save(user,{provider:'strava',userId:user,athleteId,clientId:c.clientId,connectionId:randomUUID(),connectedAt:new Date(now()).toISOString(),...credentials},before);});return {connected:true};
  },
  async activities(user,page=1){if(!Number.isInteger(page)||page<1||page>50)throw new AccessError(400,'Choose a valid activity page.');const config=await access(user),rows=await request('/api/v3/athlete/activities?page='+page+'&per_page=20',{accessToken:config.accessToken});if(!Array.isArray(rows)||rows.length>20)throw new AccessError(502,'Strava returned an invalid activity list.');if(rows.some(row=>String(row?.athlete?.id)!==config.athleteId))throw new AccessError(403,'Strava returned an activity for a different athlete.');const activities=rows.filter(row=>row.private!==true&&row.visibility!=='only_me').map(row=>summary(row,config.athleteId));await stillCurrent(user,config);return {activities,page,hasMore:rows.length===20&&page<50};},
  async route(user,activityId){if(!/^[1-9]\d{0,15}$/.test(activityId||'')||!id(Number(activityId)))throw new AccessError(400,'Choose a valid Strava activity.');const config=await access(user),detail=await request('/api/v3/activities/'+activityId,{accessToken:config.accessToken}),activity=summary(detail,config.athleteId);if(activity.id!==activityId)throw new AccessError(502,'Strava returned a different activity.');let segments=[];
   try{const streams=await request('/api/v3/activities/'+activityId+'/streams?keys=latlng,altitude&key_by_type=true',{accessToken:config.accessToken}),points=streams?.latlng?.data,heights=streams?.altitude?.data;if(Array.isArray(points)&&points.length>20000)throw new AccessError(422,'This route has too many points to preview.');if(Array.isArray(points)&&points.length>=2){segments=[points.map((p,i)=>{if(!Array.isArray(p)||p.length!==2||!p.every(Number.isFinite)||Math.abs(p[0])>90||Math.abs(p[1])>180)throw new AccessError(502,'Strava returned an invalid coordinate.');const height=Array.isArray(heights)&&heights.length===points.length&&Number.isFinite(heights[i])&&heights[i]>=-12000&&heights[i]<=100000?heights[i]:undefined;return height===undefined?[p[1],p[0]]:[p[1],p[0],height];})];}}catch(error){if(error.status!==404)throw error;}
   if(!segments.length&&detail.map?.summary_polyline){const points=decodePolyline(detail.map.summary_polyline);if(points.length>=2)segments=[points];}if(!segments.length)throw new AccessError(422,'This activity has no GPS route to preview.');await stillCurrent(user,config);return {activity,segments,source:'Strava',ephemeral:true};
  },
  async disconnect(user){return mutex('strava-connect:'+user,async()=>{const found=await saved(user),before=found?.record||await revision(store,key(user));await commit(store,key(user),{deleted:true},before);let revoked=!found;if(found)try{await request('/oauth/deauthorize',{method:'POST',body:{access_token:found.config.accessToken}});revoked=true;}catch{}return {disconnected:true,revoked};});},
 };
}
