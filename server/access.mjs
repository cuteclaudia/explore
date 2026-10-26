export const CAPABILITIES = Object.freeze({
  'tools.photocraft': 'Use PhotoCraft advanced image editor',
  'tools.lightcraft': 'Use LightCraft photo development',
  'tools.wordcraft': 'Use WordCraft document editor',
  'tools.pdfcraft': 'Use PdfCraft PDF workbench',
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
export function permissionsFor(user, ownerId) {
  const owner = isOwnerIdentity(user.id, ownerId);
  const stored = user.appMetadata?.capabilities || {};
  return Object.fromEntries(Object.keys(CAPABILITIES).map(key => [key, owner || (!OWNER_ONLY_CAPABILITIES.includes(key) && stored[key] === true)]));
}
export async function resolveActor({ session, getFreshUser, ownerId, communityEnabled = false }) {
  if (!session?.id) throw new AccessError(401, 'Please sign in.');
  let user;
  try { user = await getFreshUser(session.id); } catch { throw new AccessError(401, 'Your session could not be verified. Please sign in again.'); }
  if (!user || user.id !== session.id || !user.confirmedAt) throw new AccessError(401, 'A verified account is required.');
  if (!(Array.isArray(ownerId) ? ownerId.some(Boolean) : ownerId)) throw new AccessError(503, 'Owner access has not been configured yet.');
  const isOwner = isOwnerIdentity(user.id, ownerId);
  if (!isOwner && (!communityEnabled || user.appMetadata?.suspended === true)) throw new AccessError(403, 'This site is currently owner-only.');
  return { user, isOwner, permissions: permissionsFor(user, ownerId) };
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
