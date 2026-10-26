import { getUser, admin, login, verifyRequestOrigin } from '@netlify/identity';
import { currentActor, errorResponse, ownerIds, setupVariableFor } from '../../server/identity';
import { CAPABILITIES, OWNER_ONLY_CAPABILITIES, AccessError, isOwnerIdentity, permissionsFor, parseAccessUpdate } from '../../server/access.mjs';
const json = (value: unknown) => Response.json(value,{headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
export default async (request: Request) => {
  try {
    const path = new URL(request.url).pathname.replace(/\/$/,'');
    if (request.method === 'POST' && path === '/api/studio/login') {
      verifyRequestOrigin(request);
      if (!request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded')) throw new AccessError(415,'Use the sign-in form.');
      const body=await request.text();
      if(body.length>16000) throw new AccessError(413,'Sign-in request is too large.');
      const fields=new URLSearchParams(body);
      const email=(fields.get('email') || '').trim();
      const password=fields.get('password') || '';
      if(!email || !password || email.length>254 || new TextEncoder().encode(password).length>72) {
        return new Response(null,{status:303,headers:{Location:'/studio/login?error=credentials','Cache-Control':'private, no-store'}});
      }
      try {
        await login(email,password);
        return new Response(null,{status:303,headers:{Location:'/studio/login','Cache-Control':'private, no-store'}});
      } catch {
        return new Response(null,{status:303,headers:{Location:'/studio/login?error=credentials','Cache-Control':'private, no-store'}});
      }
    }
    if (request.method === 'GET' && path === '/api/studio/session') {
      // Display setup IDs only to the two explicitly designated, verified owner emails.
      const session = await getUser();
      if (!session?.id) throw new AccessError(401,'Please sign in.');
      const fresh = await admin.getUser(session.id);
      if (fresh.id !== session.id || !fresh.confirmedAt) throw new AccessError(401,'A verified account is required.');
      const variable = setupVariableFor(fresh.email);
      if (!isOwnerIdentity(fresh.id, ownerIds()) && variable) {
        return json({setupRequired:true,id:fresh.id,email:fresh.email,variable});
      }
      if (!isOwnerIdentity(fresh.id, ownerIds()) && !variable) throw new AccessError(403,'This site is currently owner-only.');
      const actor = await currentActor();
      return json({setupRequired:false,id:actor.user.id,email:actor.user.email,isOwner:actor.isOwner,capabilities:actor.permissions});
    }
    const actor = await currentActor('users.manage');
    // User management stays owner-only even if a future account has a users.manage flag.
    if (!actor.isOwner) throw new AccessError(403,'Only the owner can manage access.');
    if (request.method === 'GET' && path === '/api/studio/users') {
      const result = [];
      for (let page=1;page<=100;page++) {
        const batch = await admin.listUsers({page,perPage:100});
        result.push(...batch.map(user=>({id:user.id,email:user.email,name:user.name,isOwner:isOwnerIdentity(user.id,ownerIds()),suspended:user.appMetadata?.suspended===true,capabilities:permissionsFor(user,ownerIds())})));
        if(batch.length<100) return json({capabilityLabels:CAPABILITIES,ownerOnlyCapabilities:OWNER_ONLY_CAPABILITIES,users:result});
      }
      throw new AccessError(503,'User list is too large to load safely.');
    }
    const match = path.match(/^\/api\/studio\/users\/([0-9a-f-]{36})\/access$/i);
    if (request.method === 'PUT' && match) {
      verifyRequestOrigin(request);
      if (!request.headers.get('content-type')?.includes('application/json')) throw new AccessError(415,'Send a JSON access update.');
      if (Number(request.headers.get('content-length') || 0)>16000) throw new AccessError(413,'Access update is too large.');
      const text = await request.text();
      if(text.length>16000) throw new AccessError(413,'Access update is too large.');
      let body; try { body=JSON.parse(text); } catch { throw new AccessError(400,'Invalid JSON.'); }
      const update=parseAccessUpdate(body,match[1],ownerIds());
      const target=await admin.getUser(match[1]);
      await admin.updateUser(target.id,{app_metadata:{...target.appMetadata,...update}});
      return json({saved:true});
    }
    throw new AccessError(404,'Not found.');
  } catch (error) { return errorResponse(error); }
};
export const config = { path:'/api/studio/*' };
