import {getStore} from '@netlify/blobs';
import {verifyRequestOrigin} from '@netlify/identity';
import {currentActor,errorResponse} from '../../../server/identity';
import {AccessError} from '../../../server/access.mjs';
import {contentFeatures} from '../../../server/content-features.mjs';
import {featureContent} from '../../lib/feature-content';
export const prerender=false;
export async function ALL({request}){try{
 const actor=await currentActor('settings.manage');
 const service=contentFeatures(getStore({name:'studio-content-features',consistency:'strong'}),()=>featureContent());
 if(request.method==='GET')return Response.json(await service.settings(actor),{headers:{'Cache-Control':'private, no-store'}});
 if(request.method!=='PUT')throw new AccessError(405,'Method not allowed.');
 verifyRequestOrigin(request);
 if(!request.headers.get('content-type')?.includes('application/json'))throw new AccessError(415,'Send JSON content.');
 const raw=await request.text();if(raw.length>4096)throw new AccessError(413,'Feature selection is too large.');
 let body;try{body=JSON.parse(raw);}catch{throw new AccessError(400,'Invalid selection.');}
 return Response.json(await service.save(actor,body),{headers:{'Cache-Control':'private, no-store'}});
}catch(error){return errorResponse(error);}}
