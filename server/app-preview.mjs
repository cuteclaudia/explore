import {AccessError} from './access.mjs';
const shellOrigins=['https://explorebyclaudia.netlify.app','https://www.claudiagilbert.com','https://claudiagilbert.com'];
// Device-only Irodori (preview and normal workspace) is deliberately separate from KOBO_IRODORI_ORIGIN: this binary has no
// storage bridge and must never be offered as a connected Kōbō storage app.
export function irodoriPreviewOrigin(shellOrigin,env=process.env){
 const value=env.IRODORI_PREVIEW_ORIGIN;if(!value)return null;
 let url;try{url=new URL(value);}catch{throw new AccessError(503,'IRODORI_PREVIEW_ORIGIN must be a separate HTTPS origin.');}
 const otherApps=['HIKARI','FUMI','TSUZURI'].map(app=>env['KOBO_'+app+'_ORIGIN']).filter(Boolean).map(value=>{try{return new URL(value).origin;}catch{return value;}});
 if(url.protocol!=='https:'||url.username||url.password||url.port||url.pathname!=='/'||url.search||url.hash||[shellOrigin,...shellOrigins,...otherApps].includes(url.origin))throw new AccessError(503,'Irodori must use its own HTTPS origin, separate from the website, Hikari and the other apps.');
 return url.origin;
}
