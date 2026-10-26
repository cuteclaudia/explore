import {getStore} from '@netlify/blobs';
import {mapDataService,parseBounds,OUTDOOR_TYPES} from '../../server/map-data.mjs';
import {AccessError} from '../../server/access.mjs';
import {errorResponse} from '../../server/identity';
export default async(request:Request)=>{try{if(request.method!=='GET')throw new AccessError(405,'Method not allowed.');const url=new URL(request.url),path=url.pathname.replace(/\/$/,'');const service=mapDataService(getStore({name:'map-public-data',consistency:'strong'}));let data;if(path==='/api/maps/search')data=await service.search(url.searchParams.get('q'));else if(path==='/api/maps/features'){const types=(url.searchParams.get('types')||'').split(',').filter(Boolean);if(!types.length||types.some(t=>!OUTDOOR_TYPES.includes(t)))throw new AccessError(400,'Choose outdoor layers to load.');data=await service.outdoors(parseBounds(url.searchParams.get('bbox')),types);}else throw new AccessError(404,'Not found.');return Response.json(data,{headers:{'Cache-Control':'public, max-age=300','X-Content-Type-Options':'nosniff'}});}catch(error){return errorResponse(error);}};
export const config={path:'/api/maps/*'};
