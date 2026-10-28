import {AsyncLocalStorage} from 'node:async_hooks';
import {AccessError,CAPABILITIES,isOwnerIdentity} from './access.mjs';

// Astro SSR uses the same fresh authorization endpoint as the browser. Its
// Netlify runtime context is not interchangeable with a native v2 function's.
// A request-local promise avoids duplicate checks without caching across users.
const scope=new AsyncLocalStorage();
export const withActorRequest=(request,next)=>scope.run({request,promise:null},next);
export function scopedActor(options){const state=scope.getStore();if(!state)return null;return state.promise??=requestActor(state.request,options);}

export async function requestActor(request,{ownerIds=[],fetcher=fetch,siteURL=process.env.URL,timeoutMs=10000}={}){
 const origin=new URL(request.url).origin;
 const allowed=new Set(['https://www.claudiagilbert.com','https://claudiagilbert.com','https://explorebyclaudia.netlify.app']);
 if(siteURL){try{const site=new URL(siteURL);if(site.protocol==='https:'&&!site.username&&!site.password)allowed.add(site.origin);}catch{}}
 if(!allowed.has(origin))throw new AccessError(503,'This website address is not configured for sign-in.');
 const cookie=request.headers.get('cookie')||'';
 if(!/(?:^|;\s*)nf_jwt=[^;]+/.test(cookie))throw new AccessError(401,'Please sign in.');
 let response;
 try{response=await fetcher(new URL('/api/studio/session',origin),{headers:{Cookie:cookie,Accept:'application/json'},redirect:'error',cache:'no-store',signal:AbortSignal.timeout(timeoutMs)});}catch{throw new AccessError(503,'Your sign-in could not be checked. Please try again shortly.');}
 if(response.status===401)throw new AccessError(401,'Please sign in again.');
 if(response.status===403)throw new AccessError(403,'App access has not been granted, or this account is suspended.');
 if(!response.ok)throw new AccessError(503,'Your sign-in could not be checked. Please try again shortly.');
 let data;try{const text=await response.text();if(text.length>32000)throw Error();data=JSON.parse(text);}catch{throw new AccessError(503,'The sign-in service returned an invalid response.');}
 if(!data||data.setupRequired!==false||typeof data.id!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.id)||typeof data.email!=='string'||typeof data.isOwner!=='boolean'||!data.capabilities||typeof data.capabilities!=='object'||Array.isArray(data.capabilities)||Object.entries(data.capabilities).some(([key,value])=>!Object.hasOwn(CAPABILITIES,key)||typeof value!=='boolean'))throw new AccessError(503,'Your account setup could not be verified.');
 const owner=isOwnerIdentity(data.id,ownerIds);
 if(owner!==data.isOwner)throw new AccessError(503,'Owner access could not be verified.');
 return {user:{id:data.id,email:data.email},isOwner:owner,permissions:Object.fromEntries(Object.keys(CAPABILITIES).map(key=>[key,data.capabilities[key]===true]))};
}
