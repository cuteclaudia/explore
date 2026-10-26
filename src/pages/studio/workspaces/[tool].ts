import {CRAFT_TOOLS} from '../../../../server/craft-tools.mjs';
import {protectPage} from '../../../../server/identity';
export const prerender=false;
const pages=import.meta.glob('../../../generated/craft/*.html',{query:'?raw',import:'default',eager:true});
export async function GET({params,url}){
 const id=params.tool||'';
 if(!Object.hasOwn(CRAFT_TOOLS,id))return new Response('Not found',{status:404});
 const tool=CRAFT_TOOLS[id];
 const access=await protectPage(`/studio/tools/${id}`,tool.capability);
 if(access instanceof Response)return access;
 const html=pages[`../../../generated/craft/${id}.html`];
 if(typeof html!=='string')return new Response('Workspace build unavailable',{status:503});
 return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':`sandbox allow-scripts allow-downloads allow-modals; default-src 'none'; script-src 'unsafe-inline' 'wasm-unsafe-eval' ${url.origin} blob:; style-src 'unsafe-inline' ${url.origin}; connect-src ${url.origin} blob: data:; img-src ${url.origin} blob: data:; font-src ${url.origin} data:; worker-src ${url.origin} blob:; frame-ancestors 'self'; form-action 'none'`}});
}
