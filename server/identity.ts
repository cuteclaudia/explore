import { getUser, admin, AuthError } from '@netlify/identity';
import { AccessError, resolveActor, requireCapability } from './access.mjs';
import { scopedActor } from './request-actor.mjs';
export const ownerId = () => process.env.OWNER_IDENTITY_ID?.trim().toLowerCase() || '';
export const ownerIds = () => [ownerId(), process.env.OWNER_GOOGLE_IDENTITY_ID?.trim().toLowerCase() || ''].filter(Boolean);
export const setupVariableFor = (email: string) => email.toLowerCase() === 'claudiaegilbert@gmail.com' ? 'OWNER_GOOGLE_IDENTITY_ID' : email.toLowerCase() === ownerEmail() ? 'OWNER_IDENTITY_ID' : null;
export const ownerEmail = () => (process.env.OWNER_EMAIL || 'claudia@claudiagilbert.com').trim().toLowerCase();
export async function currentActor(capability?: string) {
  const scoped=scopedActor({ownerIds:ownerIds()});
  const actor = scoped ? await scoped : await resolveActor({session:await getUser(), getFreshUser:admin.getUser, ownerId:ownerIds(), communityEnabled:false, appsEnabled:true, tripsEnabled:true});
  if (capability) requireCapability(actor, capability);
  return actor;
}
export function errorResponse(error: unknown) {
  const status = error instanceof AccessError ? error.status : error instanceof AuthError && error.status === 403 ? 403 : 503;
  const message = error instanceof AccessError ? error.message : status === 403 ? 'This request was refused.' : 'The requested service is temporarily unavailable.';
  return Response.json({error:message}, {status,headers:{'Cache-Control':'private, no-store'}});
}
export async function protectPage(path: string, capability?: string) {
  try { return await currentActor(capability); }
  catch (error) {
    if (error instanceof AccessError && error.status===401) return new Response(null,{status:302,headers:{Location:'/studio/login?reason=session&next='+encodeURIComponent(path),'Cache-Control':'private, no-store'}});
    return errorResponse(error);
  }
}
