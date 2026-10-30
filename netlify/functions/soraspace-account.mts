import {trialControls,readAccountTrial} from '../../server/soraspace-controls.mjs';
import {trialSummary} from '../../server/trial-access.mjs';
import {getUser,admin,getSettings,signup,verifyRequestOrigin} from '@netlify/identity';
import {getStore} from '@netlify/blobs';
import {AccessError,isOwnerIdentity} from '../../server/access.mjs';
import {ownerIds,errorResponse,currentActor} from '../../server/identity';
import {registrationFields,accountStatus,serviceRequests} from '../../server/soraspace-registration.mjs';
const json=value=>Response.json(value,{headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
async function body(request,max){const reader=request.body?.getReader();if(!reader)throw new AccessError(400,'A request body is required.');const chunks=[];let size=0;try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>max){await reader.cancel();throw new AccessError(413,'Request is too large.');}chunks.push(value);}}finally{reader.releaseLock();}return Buffer.concat(chunks).toString('utf8');}
export default async(request)=>{try{
 const path=new URL(request.url).pathname.replace(/\/$/,'');
 const controls=()=>trialControls(getStore({name:'soraspace-controls',consistency:'strong'}),{owners:ownerIds});
 if(path==='/api/soraspace/account/review'&&request.method==='GET'){
  const actor=await currentActor('users.manage');if(!actor.isOwner)throw new AccessError(403,'Owner access required.');
  const users=await admin.listUsers({page:1,perPage:100}),service=serviceRequests(getStore({name:'soraspace-service-requests',consistency:'strong'})),requests=[];
  for(let start=0;start<users.length;start+=10)for(const item of await Promise.all(users.slice(start,start+10).map(async user=>({id:user.id,verified:!!user.confirmedAt,...await service.load(user)}))))requests.push(item);
  return json({requests,limited:users.length===100});
 }
 if(path==='/api/soraspace/account/registration'&&request.method==='GET'){const p=await controls().policy();return json({enabled:p.signupEffective,approval:p.data.publicTrialsOpen?'trial-activation':'manual',publicTrialsOpen:p.data.publicTrialsOpen,defaultDays:p.data.defaultDays,billingEnabled:false});}
 if(path==='/api/soraspace/account/signup'&&request.method==='POST'){
  verifyRequestOrigin(request);if(process.env.SORASPACE_SIGNUP_ENABLED!=='true')throw new AccessError(403,'New registration is not open yet.');
  if(!request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded'))throw new AccessError(415,'Use the registration form.');
  const form=new URLSearchParams(await body(request,16000)),token=form.get('trialInvite');if(form.getAll('trialInvite').length>1)throw new AccessError(400,'Invalid invitation.');form.delete('trialInvite');const fields=registrationFields(form.toString()),settings=await getSettings();if(token)await controls().invitationSignup(token,fields.email);else if(!(await controls().policy()).signupEffective)throw new AccessError(403,'New registration is paused.');
  if(settings.disableSignup!==false||settings.autoconfirm!==false)throw new AccessError(503,'Registration is being prepared. Email confirmation must be enabled.');
  if(await getUser())throw new AccessError(409,'Sign out before creating another account.');
  try{await signup(fields.email,fields.password,fields.data);}catch{throw new AccessError(400,'Registration could not be completed. If you already have an account, sign in or use password recovery. Otherwise try again shortly.');}
  return new Response(null,{status:303,headers:{Location:'/studio/signup?check=email','Cache-Control':'private, no-store'}});
 }
 const session=await getUser();if(!session?.id)throw new AccessError(401,'Please sign in.');const user=await admin.getUser(session.id);if(user.id!==session.id||!user.confirmedAt)throw new AccessError(401,'Verify your email before continuing.');
 const trial=await readAccountTrial(getStore({name:'soraspace-controls',consistency:'strong'}),user.id),view=trialSummary(trial,user.id),policy=await controls().policy();
 const status={...accountStatus(user,ownerIds(),{trial,trialStatus:view.status}),trial:view,publicTrialAvailable:policy.data.publicTrialsOpen&&view.status==='none'&&!isOwnerIdentity(user.id,ownerIds()),trialDays:policy.data.defaultDays,availableTrialServices:policy.data.publicServices};
 if(path==='/api/soraspace/account/status'&&request.method==='GET')return json(status);
 if(status.status==='suspended')throw new AccessError(403,'Account access is suspended.');
 const service=serviceRequests(getStore({name:'soraspace-service-requests',consistency:'strong'}));
 if(path==='/api/soraspace/account/activate-trial'&&request.method==='POST'){verifyRequestOrigin(request);let input;try{input=JSON.parse(await body(request,4000));}catch{throw new AccessError(400,'Invalid activation request.');}if(!input||Object.keys(input).some(k=>k!=='expectedAccount')||input.expectedAccount!==user.id)throw new AccessError(409,'Your account changed. Reload first.');const choices=await service.load(user);return json(await controls().publicTrial(user,choices.requested));}
 if(path==='/api/soraspace/account/redeem-trial'&&request.method==='POST'){verifyRequestOrigin(request);let input;try{input=JSON.parse(await body(request,4000));}catch{throw new AccessError(400,'Invalid invitation request.');}if(!input||Object.keys(input).some(k=>!['token','expectedAccount'].includes(k))||input.expectedAccount!==user.id)throw new AccessError(400,'Invalid invitation request.');return json(await controls().redeem(user,input.token));}

 if(path==='/api/soraspace/account/services'&&request.method==='GET')return json(await service.load(user));
 if(path==='/api/soraspace/account/services'&&request.method==='PUT'){
  verifyRequestOrigin(request);if(!request.headers.get('content-type')?.includes('application/json'))throw new AccessError(415,'Send JSON content.');
  let input;try{input=JSON.parse(await body(request,16000));}catch(e){if(e instanceof AccessError)throw e;throw new AccessError(400,'Invalid service request.');}return json(await service.save(user,input));
 }
 throw new AccessError(404,'Not found.');
}catch(e){return errorResponse(e);}};
export const config={path:'/api/soraspace/account/*'};
