import {getStore} from '@netlify/blobs';
import {hobbyNest} from '../../../../server/hobbynest.mjs';
export const prerender=false;
export async function GET(){try{return Response.json(await hobbyNest(getStore({name:'hobbynest-catalogue',consistency:'strong'})).publicCatalogue(),{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({error:'The collection is temporarily unavailable. Please try again.'},{status:503,headers:{'Cache-Control':'no-store'}});}}
