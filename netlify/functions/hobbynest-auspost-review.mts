import {getStore} from '@netlify/blobs';
import {reviewAuspost} from '../../server/hobbynest-auspost.mjs';
// Netlify invokes scheduled functions in published deployments; no HTTP route is exposed.
export default async()=>{const result=await reviewAuspost(getStore({name:'hobbynest-catalogue',consistency:'strong'}));return Response.json({status:result.status});};
export const config={schedule:'0 3 1 * *'};
