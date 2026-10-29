// Isolated policy prototype, NOT a production authorization boundary.
// Inputs must eventually come from fresh identity + a verified server-side ledger,
// never browser fields or a webhook payload passed directly to this function.
import {CATALOGUE_REVISION,SUBSCRIPTION_APPS,SUBSCRIPTION_POLICY,subscriptionPlan} from './subscription-catalogue.mjs';
const day=86400000;
function timestamp(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value))return NaN;
 const time=Date.parse(value);return Number.isFinite(time)&&new Date(time).toISOString()===value?time:NaN;
}
export function evaluateSubscriptionAccess({account,grants=[],blockedApps=[],rollout={},now}){
 if(!Number.isSafeInteger(now)||now<0)throw Error('Pass trusted server time in milliseconds.');
 const apps=Object.fromEntries(Object.keys(SUBSCRIPTION_APPS).map(id=>[id,{desktop:false,web:false,desktopUntil:null,webUntil:null,sources:[]}]));
 const result={accountId:account?.id||null,status:'no-access',apps,capabilities:{},ignored:[]};
 if(!account?.id||account.verified!==true)return {...result,status:'unverified'};
 if(account.suspended===true&&account.owner!==true)return {...result,status:'suspended'};
 const ends=Object.fromEntries(Object.keys(apps).map(id=>[id,{desktop:0,web:0}]));
 const blocked=new Set(blockedApps),ids=new Map();
 for(const g of grants)if(g&&typeof g.id==='string')ids.set(g.id,(ids.get(g.id)||0)+1);
 function include(id,tier,end,source){
  if(account.owner!==true&&blocked.has(id))return;
  if(rollout[id]?.desktop===true){ends[id].desktop=Math.max(ends[id].desktop,end);apps[id].sources.push(source);}
  if(tier==='web-desktop'&&SUBSCRIPTION_APPS[id].web&&rollout[id]?.web===true){ends[id].web=Math.max(ends[id].web,end);apps[id].sources.push(source);}
 }
 if(account.owner===true)for(const id of Object.keys(apps))include(id,'web-desktop',Infinity,'owner');
 else for(const grant of grants){
  const ignore=reason=>result.ignored.push({id:typeof grant?.id==='string'?grant.id:null,reason});
  if(!grant||typeof grant.id!=='string'||!grant.id||ids.get(grant.id)!==1){ignore('invalid-or-duplicate-id');continue;}
  if(grant.accountId!==account.id){ignore('wrong-account');continue;}
  if(grant.state!=='active'){ignore('inactive');continue;}
  if(!['subscription','manual','trial'].includes(grant.kind)){ignore('unknown-source');continue;}
  const start=timestamp(grant.startsAt);
  let end=grant.kind==='manual'&&grant.endsAt===null?Infinity:timestamp(grant.endsAt);
  if(!Number.isFinite(start)||!(Number.isFinite(end)||end===Infinity)||end<=start){ignore('invalid-period');continue;}
  if(grant.kind==='trial')end=Math.min(end,start+SUBSCRIPTION_POLICY.trialDays*day);
  if(start>now||end<=now){ignore('outside-period');continue;}
  let appIds,tier;
  if(grant.kind==='subscription'){
   const plan=subscriptionPlan(grant.planId);
   if(!plan||grant.catalogueRevision!==CATALOGUE_REVISION){ignore('unknown-plan-version');continue;}
   appIds=plan.apps;tier=plan.tier;
  } else {appIds=grant.apps;tier=grant.tier;}
  if(!Array.isArray(appIds)||!appIds.length||appIds.some(id=>!Object.hasOwn(SUBSCRIPTION_APPS,id))||!['desktop','web-desktop'].includes(tier)){ignore('invalid-scope');continue;}
  for(const id of new Set(appIds))include(id,tier,end,grant.id);
 }
 for(const [id,period] of Object.entries(ends)){
  const rights=apps[id];rights.sources=[...new Set(rights.sources)].sort();
  for(const platform of ['desktop','web']){
   rights[platform]=period[platform]>now;
   rights[platform+'Until']=rights[platform]&&Number.isFinite(period[platform])?new Date(period[platform]).toISOString():null;
   if(rights[platform])result.capabilities[SUBSCRIPTION_APPS[id][platform]]=true;
  }
 }
 result.status=Object.values(apps).some(a=>a.desktop||a.web)?'editing':'no-access';
 return result;
}
// A desktop ticket is scoped to one app. It must never outlive that app's grant.
export function proposedDesktopTicketEnd(access,appId,now){
 if(!Number.isSafeInteger(now)||now<0)throw Error('Pass trusted server time.');
 if(!Object.hasOwn(SUBSCRIPTION_APPS,appId)||access.status!=='editing'||access.apps[appId]?.desktop!==true)return null;
 const end=access.apps[appId].desktopUntil;
 const expires=Math.min(now+SUBSCRIPTION_POLICY.offlineDays*day,end===null?Infinity:timestamp(end));
 return Number.isFinite(expires)&&expires>now?new Date(expires).toISOString():null;
}
