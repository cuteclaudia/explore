import { getUser, admin, AuthError } from '@netlify/identity';
import { AccessError, resolveActor, requireCapability } from './access.mjs';
export const ownerId = () => process.env.OWNER_IDENTITY_ID?.trim().toLowerCase() || '';
export const ownerEmail = () => (process.env.OWNER_EMAIL || 'claudia@claudiagilbert.com').trim().toLowerCase();
export async function currentActor(capability?: string) {
  const actor = await resolveActor({session:await getUser(), getFreshUser:admin.getUser, ownerId:ownerId(), communityEnabled:false});
  if (capability) requireCapability(actor, capability);
  return actor;
}
export function errorResponse(error: unknown) {
  const status = error instanceof AccessError ? error.status : error instanceof AuthError && error.status === 403 ? 403 : 503;
  const message = error instanceof AccessError ? error.message : status === 403 ? 'This request was refused.' : 'The sign-in service is temporarily unavailable.';
  return Response.json({error:message}, {status,headers:{'Cache-Control':'private, no-store'}});
}
export async function protectPage(path: string, capability?: string) {
  try { return await currentActor(capability); }
  catch (error) {
    if (error instanceof AccessError && [401,503].includes(error.status)) return new Response(null,{status:302,headers:{Location:'/studio/login?next='+encodeURIComponent(path),'Cache-Control':'private, no-store'}});
    return errorResponse(error);
  }
}
