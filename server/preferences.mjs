import {AccessError} from './access.mjs';
export const validColours=value=>Array.isArray(value)&&value.length===4&&value.every(c=>typeof c==='string'&&/^#[0-9a-f]{6}$/i.test(c));
export function mergePreferences(existing,input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new AccessError(400,'Invalid preferences.');
 const next={defaultDestination:'download',...existing};
 if(Object.hasOwn(input,'defaultDestination')){if(!['download','site','webdav'].includes(input.defaultDestination))throw new AccessError(400,'Choose device, private site storage or WebDAV.');next.defaultDestination=input.defaultDestination;}
 if(Object.hasOwn(input,'colours')){if(!validColours(input.colours))throw new AccessError(400,'Choose four valid colours.');next.colours=input.colours;}
 if(Object.hasOwn(input,'density')){if(!['comfortable','compact'].includes(input.density))throw new AccessError(400,'Choose comfortable or compact spacing.');next.density=input.density;}
 if(Object.hasOwn(input,'reducedMotion')){if(typeof input.reducedMotion!=='boolean')throw new AccessError(400,'Choose a valid motion preference.');next.reducedMotion=input.reducedMotion;}
 return next;
}
