// Trusted server-ledger grants only. Browser metadata is never an entitlement.
export const TRIAL_SERVICES=Object.freeze({website:'beta.soraspace',docs:'tools.wordcraft',pdf:'tools.pdfcraft',photos:'tools.lightcraft',image:'tools.photocraft'});
export function trialSummary(record,account,now=Date.now()){
 if(!record)return {status:'none',services:[]};
 const valid=record.schema===1&&record.account===account&&typeof record.id==='string'&&['active','revoked'].includes(record.state)&&Array.isArray(record.services)&&record.services.length>0&&new Set(record.services).size===record.services.length&&record.services.every(id=>typeof id==='string'&&Object.hasOwn(TRIAL_SERVICES,id))&&typeof record.startsAt==='string'&&typeof record.endsAt==='string'&&Number.isFinite(Date.parse(record.startsAt))&&Number.isFinite(Date.parse(record.endsAt))&&Date.parse(record.endsAt)>Date.parse(record.startsAt);
 if(!valid)return {status:'invalid',services:[]};
 const status=record.state==='revoked'?'revoked':now<Date.parse(record.startsAt)?'scheduled':now>=Date.parse(record.endsAt)?'expired':'active';
 return {id:record.id,status,services:[...record.services],startsAt:record.startsAt,endsAt:record.endsAt,source:record.source};
}
export function trialPermissions(record,account,now=Date.now()){
 const view=trialSummary(record,account,now);return view.status==='active'?view.services.map(id=>TRIAL_SERVICES[id]):[];
}
