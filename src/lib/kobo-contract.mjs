// Shared validation only. Authentication and app/connection binding are server-side.
export const KOBO_BYTES = 1_048_576;
export const KOBO_APPS = Object.freeze({
  hikari: {folder:'Hikari', tool:'lightcraft', capability:'tools.lightcraft'},
  fumi: {folder:'Fumi', tool:'wordcraft', capability:'tools.wordcraft'},
  irodori: {folder:'Irodori', tool:'photocraft', capability:'tools.photocraft'},
  tsuzuri: {folder:'Tsuzuri', tool:'pdfcraft', capability:'tools.pdfcraft'},
});
export class KoboError extends Error {
  constructor(code, message, retryable=false, retryAfterMs) {
    super(message); this.code=code; this.retryable=retryable;
    if(retryAfterMs!==undefined)this.retryAfterMs=retryAfterMs;
  }
}
export function koboApp(app) {
  if(typeof app!=='string'||!Object.hasOwn(KOBO_APPS,app))throw new KoboError('forbidden','This app is not registered.');
  return KOBO_APPS[app];
}
export function koboPath(path,root=false) {
  if(root&&path==='')return '';
  if(typeof path!=='string'||!path||path.length>1600||/[\\%\u0000-\u001f\u007f]/.test(path)||path.split('/').length>32||path.split('/').some(p=>!p||p==='.'||p==='..'||p.length>255))throw new KoboError('forbidden','Use a relative file path inside this app.');
  // Literal percent signs are deliberately disallowed, including double-encoded traversal.
  return path;
}
export function koboConditions(opts={}) {
  if(opts.ifMatch!==undefined&&opts.ifNoneMatch!==undefined)throw new KoboError('invalid','Use either ifMatch or ifNoneMatch, not both.');
  if(opts.ifNoneMatch!==undefined&&opts.ifNoneMatch!=='*')throw new KoboError('invalid','ifNoneMatch must be "*".');
  if(opts.ifMatch!==undefined&&!strongETag(opts.ifMatch))throw new KoboError('invalid','A strong, quoted ETag is required.');
  return {...(opts.ifMatch!==undefined?{'If-Match':opts.ifMatch}:{}),...(opts.ifNoneMatch!==undefined?{'If-None-Match':'*'}:{})};
}
export const strongETag=value=>typeof value==='string'&&/^"[\x21\x23-\x7e\x80-\xff]*"$/.test(value)&&value.length<=1000;
export function koboFailure(error) {
  if(error instanceof KoboError)return {code:error.code,message:error.message,retryable:error.retryable,...(error.retryAfterMs!==undefined?{retryAfterMs:error.retryAfterMs}:{})};
  return {code:'server',message:'The storage operation could not be completed.',retryable:false};
}
