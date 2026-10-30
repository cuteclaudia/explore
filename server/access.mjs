import {trialPermissions} from './trial-access.mjs';
export const CAPABILITIES = Object.freeze({
  'trips.manage_own': 'Create and manage private trips/events',
  'tools.photocraft': 'Use Irodori image editor',
  'tools.lightcraft': 'Use Hikari photo development',
  'tools.wordcraft': 'Use Fumi document editor',
  'tools.pdfcraft': 'Use Tsuzuri PDF workbench',
  'beta.soraspace': 'Trial SoraSpace website setup and private editor',
  'beta.hikari': 'Test the rebuilt Hikari web beta',
  'desktop.photocraft': 'Download Irodori desktop',
  'desktop.lightcraft': 'Download Hikari desktop',
  'desktop.wordcraft': 'Download Fumi desktop',
  'desktop.pdfcraft': 'Download Tsuzuri desktop',
  'desktop.tayori': 'Download Tayori desktop',
  'desktop.goban': 'Download Goban desktop',
  'files.publish': 'Publish finished exports to the site',
  'photo.edit': 'Use photo editor',
  'media.upload': 'Upload photographs',
  'galleries.manage_own': 'Manage own galleries',
  'journal.create': 'Create journal drafts',
  'journal.edit_own': 'Edit own journal entries',
  'journal.publish_own': 'Publish own journal entries',
  'articles.edit_any': 'Edit other articles',
  'articles.publish_any': 'Publish other articles',
  'content.delete_own': 'Delete own content',
  'content.delete_any': 'Delete other content',
  'users.manage': 'Manage user access',
  'settings.manage': 'Manage site settings',
});
export const OWNER_ONLY_CAPABILITIES = Object.freeze(['users.manage', 'settings.manage']);
export class AccessError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export const isOwnerIdentity = (id, owners) => (Array.isArray(owners) ? owners : [owners]).filter(Boolean).some(value => value.toLowerCase() === id.toLowerCase());
export function permissionsFor(user, ownerId, {trial=null,now=Date.now()}={}) {
  const owner = isOwnerIdentity(user.id, ownerId);
  const stored = user.appMetadata?.capabilities || {};
  const temporary=new Set(owner?[]:trialPermissions(trial,user.id,now));
  return Object.fromEntries(Object.keys(CAPABILITIES).map(key => [key, owner || (!OWNER_ONLY_CAPABILITIES.includes(key) && (stored[key] === true||temporary.has(key)))]));
}
export async function resolveActor({ session, getFreshUser, ownerId, communityEnabled = false, appsEnabled = false, tripsEnabled = false, getTrial=async()=>null, now=undefined }) {
  if (!session?.id) throw new AccessError(401, 'Please sign in.');
  let user;
  try { user = await getFreshUser(session.id); } catch { throw new AccessError(401, 'Your session could not be verified. Please sign in again.'); }
  if (!user || user.id !== session.id || !user.confirmedAt) throw new AccessError(401, 'A verified account is required.');
  if (!(Array.isArray(ownerId) ? ownerId.some(Boolean) : ownerId)) throw new AccessError(503, 'Owner access has not been configured yet.');
  const isOwner = isOwnerIdentity(user.id, ownerId);
  let trial=null,trialUnavailable=false;
  if(!isOwner&&user.appMetadata?.suspended!==true){try{trial=await getTrial(user.id);}catch{trialUnavailable=true;}}
  const permissions=permissionsFor(user,ownerId,{trial,now:now??Date.now()});
  const tripAccess=tripsEnabled&&permissions['trips.manage_own']===true;
  const trialAccess=appsEnabled&&permissions['beta.soraspace']===true;
  const appAccess=appsEnabled&&Object.keys(CAPABILITIES).some(key=>(key.startsWith('tools.')||key.startsWith('desktop.'))&&permissions[key]===true);
  if(!isOwner&&trialUnavailable&&!communityEnabled&&!appAccess&&!tripAccess&&!trialAccess&&user.appMetadata?.suspended!==true)throw new AccessError(503,'Trial access could not be verified. Please try again shortly.');
  if (!isOwner && ((!communityEnabled&&!appAccess&&!tripAccess&&!trialAccess) || user.appMetadata?.suspended === true)) throw new AccessError(403, 'App access has not been granted, or this account is suspended.');
  if(!isOwner&&!communityEnabled)for(const key of Object.keys(permissions))if(!key.startsWith('tools.')&&!key.startsWith('desktop.')&&!(appsEnabled&&['beta.hikari','beta.soraspace'].includes(key))&&!(tripsEnabled&&key==='trips.manage_own'))permissions[key]=false;
  return { user, isOwner, permissions };
}
export function requireCapability(actor, capability) {
  if (!Object.hasOwn(CAPABILITIES, capability) || !actor.permissions[capability]) throw new AccessError(403, 'You do not have access to this feature.');
}
export function parseAccessUpdate(body, targetId, ownerId) {
  if (isOwnerIdentity(targetId, ownerId)) throw new AccessError(403, 'The owner’s full access cannot be changed here.');
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(k => !['capabilities','suspended'].includes(k))) throw new AccessError(400, 'Invalid access update.');
  if (!body.capabilities || typeof body.capabilities !== 'object' || Array.isArray(body.capabilities)) throw new AccessError(400, 'A capability list is required.');
  for (const [key,value] of Object.entries(body.capabilities)) {
    if (OWNER_ONLY_CAPABILITIES.includes(key) && value === true) throw new AccessError(400, 'This capability is reserved to the owner.');
    if (!Object.hasOwn(CAPABILITIES,key) || typeof value !== 'boolean') throw new AccessError(400, 'Unknown capability or invalid value.');
  }
  if (typeof body.suspended !== 'boolean') throw new AccessError(400, 'An account status is required.');
  return { capabilities: Object.fromEntries(Object.keys(CAPABILITIES).map(key=>[key,body.capabilities[key] === true])), suspended:body.suspended };
}
