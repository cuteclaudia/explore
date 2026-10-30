import {getStore} from '@netlify/blobs';
import {admin,verifyRequestOrigin} from '@netlify/identity';
import {currentActor,errorResponse,ownerIds} from '../../server/identity';
import {AccessError} from '../../server/access.mjs';
import {trialControls} from '../../server/soraspace-controls.mjs';
const json=value=>Response.json(value,{headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
export default async(request:Request)=>{try{
 const actor=await currentActor('settings.manage');if(!actor.isOwner)throw new AccessError(403,'Owner access required.');
 const path=new URL(request.url).pathname.replace(/\/$/,''),service=trialControls(getStore({name:'soraspace-controls',consistency:'strong'}),{owners:ownerIds});
 if(request.method==='GET'&&path==='/api/soraspace/control/settings')return json({account:actor.user.id,...await service.policy()});
 const target=path.match(/^\/api\/soraspace\/control\/trials\/([0-9a-f-]{36})$/i);
 if(request.method==='GET'&&target)return json(await service.loadTrial(actor,await admin.getUser(target[1])));
 if(request.method!=='POST')throw new AccessError(404,'Not found.');verifyRequestOrigin(request);
 if(!request.headers.get('content-type')?.includes('application/json'))throw new AccessError(415,'Send JSON content.');
 const reader=request.body?.getReader();if(!reader)throw new AccessError(400,'A request body is required.');let length=0;const chunks=[];try{while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>16000){await reader.cancel();throw new AccessError(413,'Request is too large.');}chunks.push(value);}}finally{reader.releaseLock();}
 let input;try{input=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new AccessError(400,'Invalid JSON.');}
 if(input?.expectedAccount!==actor.user.id)throw new AccessError(409,'Your administrator account changed. Reload first.');delete input.expectedAccount;
 if(path==='/api/soraspace/control/settings')return json(await service.savePolicy(actor,input));
 if(path==='/api/soraspace/control/invitations')return json(await service.createInvitation(actor,input));
 if(target)return json(await service.mutate(actor,await admin.getUser(target[1]),input));
 throw new AccessError(404,'Not found.');
}catch(error){return errorResponse(error);}};
export const config={path:'/api/soraspace/control/*'};
