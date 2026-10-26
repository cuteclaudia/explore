import https from 'node:https';
import {lookup} from 'node:dns/promises';
import sax from 'sax';
import {connectionURL,publicAddress} from './webdav.mjs';
import {KOBO_BYTES,KoboError,koboApp,koboPath,koboConditions,strongETag} from '../src/lib/kobo-contract.mjs';

export function appRoot(config,app){
  const base=connectionURL(config.url); const folder=koboPath(config.baseFolder??'Kobo',true);
  base.pathname+=(folder?folder.split('/').map(encodeURIComponent).join('/')+'/':'')+koboApp(app).folder+'/';return base;
}
export function davError(status,headers={}) {
  if(status===412)throw new KoboError('conflict','This file changed. Reload before saving again.');
  if(status===401||status===403)throw new KoboError('forbidden','The storage provider refused access. Check your app password and folder permissions.');
  if(status===507)throw new KoboError('quota','Your storage provider is full.');
  if(status===413)throw new KoboError('too-large','The storage provider refused this file size.');
  if(status===429||status===503){const value=headers['retry-after'];const seconds=Number(value);const delay=value?(Number.isFinite(seconds)?seconds*1000:Date.parse(value)-Date.now()):5000;throw new KoboError('rate-limited','Your storage provider asked us to wait.',true,Math.min(3600000,Math.max(1000,delay||5000)));}
  if(status>=300&&status<400)throw new KoboError('forbidden','Storage redirects are not permitted. Use the final WebDAV address.');
  throw new KoboError('server','The storage provider could not complete the operation ('+status+').',status>=500);
}
// No fetch redirects, proxy-selected destinations, private DNS addresses or caller-controlled headers.
export async function davTransport(config,url,method,{headers={},body,limit=KOBO_BYTES,signal}={}){
  const approved=connectionURL(config.url);
  if(url.origin!==approved.origin||!url.pathname.startsWith(approved.pathname)||url.search||url.hash)throw new KoboError('forbidden','Storage path is outside the configured folder.');
  if(signal?.aborted)throw new KoboError('cancelled','The storage operation was cancelled.');
  signal=signal?AbortSignal.any([signal,AbortSignal.timeout(25000)]):AbortSignal.timeout(25000);
  const addresses=await new Promise((resolve,reject)=>{
    const abort=()=>reject(new KoboError(signal.reason?.name==='TimeoutError'?'timeout':'cancelled','The storage hostname lookup was interrupted.',signal.reason?.name==='TimeoutError'));
    signal.addEventListener('abort',abort,{once:true});
    lookup(url.hostname,{all:true}).then(resolve,()=>reject(new KoboError('offline','The storage hostname could not be reached.',true))).finally(()=>signal.removeEventListener('abort',abort));
    if(signal.aborted)abort();
  });
  if(!addresses.length||addresses.some(a=>!publicAddress(a.address)))throw new KoboError('forbidden','Storage must resolve only to public Internet addresses.');
  const chosen=addresses[0];
  return new Promise((resolve,reject)=>{
    let finished=false;const done=(error,result)=>{if(finished)return;finished=true;clearTimeout(timer);signal?.removeEventListener('abort',abort);error?reject(error):resolve(result);};
    const req=https.request(url,{method,servername:url.hostname,lookup:(_host,options,cb)=>options?.all?cb(null,[chosen]):cb(null,chosen.address,chosen.family),headers:{Authorization:'Basic '+Buffer.from(config.username+':'+config.password).toString('base64'),Accept:'*/*',...headers,...(body!==undefined?{'Content-Length':body.byteLength}:{})}},res=>{
      const chunks=[];let size=0;
      res.on('data',chunk=>{size+=chunk.length;if(size>limit){const e=new KoboError('too-large','The provider response exceeds the supported operation limit.');done(e);req.destroy();res.destroy();}else chunks.push(chunk);});
      res.on('error',()=>done(new KoboError('offline','The provider response was interrupted.',true)));
      res.on('end',()=>done(null,{status:res.statusCode,headers:res.headers,body:Buffer.concat(chunks)}));
    });
    const abort=()=>{done(new KoboError(signal?.reason?.name==='TimeoutError'?'timeout':'cancelled','The storage operation was interrupted.',signal?.reason?.name==='TimeoutError'));req.destroy();};
    const timer=setTimeout(()=>{done(new KoboError('timeout','The storage provider did not respond in time.',true));req.destroy();},25000);
    signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)abort();
    req.on('error',()=>done(new KoboError('offline','Storage could not be reached securely.',true)));
    if(body!==undefined)req.write(body);req.end();
  });
}

const PROP_BODY=Buffer.from('<?xml version="1.0"?><d:propfind xmlns:d="DAV:"><d:prop><d:resourcetype/><d:getcontentlength/><d:getetag/><d:getlastmodified/></d:prop></d:propfind>');
// Strict namespace-aware SAX, no DTDs/entities, bounded response, depth and entry count.
export function parseDav(xml,requested,root){
  if(xml.byteLength>4*KOBO_BYTES)throw new KoboError('too-large','The folder listing is too large.');
  const source=Buffer.from(xml).toString('utf8');
  if(/<!\s*(?:DOCTYPE|ENTITY)/i.test(source))throw new KoboError('forbidden','External XML declarations are not permitted.');
  const parser=sax.parser(true,{xmlns:true,trim:false});const result=[];let stack=[],entry=null,prop=null,text='',rootSeen=false;
  const fail=()=>{throw new KoboError('server','The provider returned an invalid WebDAV listing.');};
  parser.ondoctype=fail;parser.onerror=fail;
  parser.onopentag=node=>{
    if(!rootSeen){if(node.uri!=='DAV:'||node.local!=='multistatus')fail();rootSeen=true;}
    stack.push(node);if(stack.length>32)fail();text='';
    if(node.uri==='DAV:'&&node.local==='response'){if(entry)fail();entry={href:'',props:{}};}
    if(entry&&node.uri==='DAV:'&&node.local==='propstat')prop={values:{},status:''};
    if(prop&&node.uri==='DAV:'&&node.local==='collection')prop.values.isDir=true;
  };
  parser.ontext=value=>{text+=value;if(text.length>16384)fail();};parser.oncdata=parser.ontext;
  parser.onclosetag=()=>{
    const node=stack.pop();if(node.uri==='DAV:'&&entry){
      if(node.local==='href')entry.href=text.trim();
      if(prop){if(['getetag','getcontentlength','getlastmodified'].includes(node.local))prop.values[node.local]=text.trim();if(node.local==='status')prop.status=text.trim();if(node.local==='propstat'){if(/^HTTP\/\d(?:\.\d)? 200(?:\s|$)/.test(prop.status))Object.assign(entry.props,prop.values);prop=null;}}
      if(node.local==='response'){result.push(entry);if(result.length>2049)throw new KoboError('too-large','This folder has too many direct children.');entry=null;}
    }text='';
  };
  try{parser.write(source).close();}catch(error){if(error instanceof KoboError)throw error;fail();}
  if(!rootSeen||!result.length)fail();
  const seen=new Set();return result.map(item=>{
    if(item.href.split(/[/?#]/).some(segment=>{try{const d=decodeURIComponent(segment);return d==='.'||d==='..'||d.includes('\\');}catch{return true;}}))throw new KoboError('forbidden','The provider returned an unsafe path.');
    let url;try{url=new URL(item.href,requested);}catch{fail();}
    if(url.pathname===root.pathname.slice(0,-1))url.pathname+='/';
    if(!item.href||url.origin!==root.origin||url.username||url.password||url.search||url.hash||!url.pathname.startsWith(root.pathname))throw new KoboError('forbidden','The provider returned a path outside this app.');
    let relative;try{relative=decodeURIComponent(url.pathname.slice(root.pathname.length)).replace(/\/$/,'');}catch{fail();}
    koboPath(relative,true);if(seen.has(relative))fail();seen.add(relative);
    const {props}=item,size=props.isDir?0:Number(props.getcontentlength),modified=new Date(props.getlastmodified);
    if(!props.isDir&&(!Number.isSafeInteger(size)||size<0)||!Number.isFinite(modified.valueOf()))fail();
    // Some DAV servers omit the quotes in XML while returning quoted HTTP ETags.
    let etag=props.getetag||'';if(etag&&!strongETag(etag)&&!etag.startsWith('W/')&&strongETag('"'+etag+'"'))etag='"'+etag+'"';
    return {path:relative,isDir:props.isDir===true,size,etag,modified:modified.toISOString()};
  });
}

export function davFiles(config,app,{transport=davTransport}={}){
  const root=appRoot(config,app),knownFolders=new Set();
  const target=(path,allowRoot=false)=>new URL(koboPath(path,allowRoot).split('/').map(encodeURIComponent).join('/'),root);
  const request=(url,method,options)=>transport(config,url,method,options);
  async function properties(path,depth,signal){
    const url=target(path,depth==='1');const response=await request(url,'PROPFIND',{headers:{Depth:depth,'Content-Type':'application/xml'},body:PROP_BODY,limit:4*KOBO_BYTES,signal});
    if(response.status===404)return [];
    if(response.status!==207)davError(response.status,response.headers);
    const entries=parseDav(response.body,url,root);
    if(depth==='0'&&entries.some(e=>e.path!==path))throw new KoboError('forbidden','Unexpected file in storage metadata.');
    if(depth==='1'&&entries.some(e=>e.path!==path&&!(e.path.startsWith(path?path+'/':'')&&!e.path.slice(path?path.length+1:0).includes('/'))))throw new KoboError('forbidden','The provider returned more than direct children.');
    return entries;
  }
  async function stat(path,{signal}={}){return (await properties(koboPath(path),'0',signal))[0]||null;}
  async function list(path,{signal}={}){return (await properties(koboPath(path,true),'1',signal)).filter(e=>e.path!==path).map(e=>({name:e.path.split('/').pop(),isDir:e.isDir,size:e.size,etag:e.etag,modified:e.modified}));}
  async function read(path,opts={}){
    const response=await request(target(path),'GET',{headers:koboConditions(opts),signal:opts.signal,limit:KOBO_BYTES});
    if(response.status===404)return null;if(response.status!==200)davError(response.status,response.headers);
    const etag=response.headers.etag;if(!strongETag(etag)||opts.ifMatch&&etag!==opts.ifMatch)throw new KoboError('conflict','The provider did not return the requested file version.');
    return {data:new Uint8Array(response.body),etag};
  }
  async function parents(path,signal){
    const base=connectionURL(config.url);const pieces=root.pathname.slice(base.pathname.length).split('/').filter(Boolean).concat(koboPath(path).split('/').slice(0,-1).map(encodeURIComponent));let url=base;
    for(const piece of pieces){url=new URL(piece+'/',url);if(knownFolders.has(url.href))continue;const r=await request(url,'MKCOL',{signal,limit:KOBO_BYTES});if(r.status===405){const check=await request(url,'PROPFIND',{headers:{Depth:'0','Content-Type':'application/xml'},body:PROP_BODY,signal,limit:KOBO_BYTES});if(check.status!==207)davError(check.status,check.headers);const entries=parseDav(check.body,url,base);const path=decodeURIComponent(url.pathname.slice(base.pathname.length)).replace(/\/$/,'');if(entries.length!==1||entries[0].path!==path||!entries[0].isDir)throw new KoboError('forbidden','A parent path is not a WebDAV folder.');}else if(r.status!==201)davError(r.status,r.headers);knownFolders.add(url.href);}
  }
  async function put(path,data,opts={}){
    const conditions=koboConditions(opts);if(!(data instanceof Uint8Array)||data.byteLength>KOBO_BYTES)throw new KoboError('too-large','Save files in parts of at most 1 MiB.');
    koboPath(path);await parents(path,opts.signal);
    const response=await request(target(path),'PUT',{headers:{...conditions,'Content-Type':'application/octet-stream'},body:data,signal:opts.signal,limit:KOBO_BYTES});
    if(![200,201,204].includes(response.status))davError(response.status,response.headers);
    // Never use a subsequent PROPFIND: another writer could already have replaced our bytes.
    if(!strongETag(response.headers.etag))throw new KoboError('server','The provider saved the file without a strong response ETag. Sync cannot be confirmed.');
    return {etag:response.headers.etag};
  }
  async function remove(path,opts={}){
    const conditions=koboConditions(opts);const file=await stat(path,opts);if(!file)return;
    if(file.isDir)throw new KoboError('forbidden','Only individual files can be removed.');
    // Providers verified below must honour conditions and refuse recursive folder deletes.
    if(!strongETag(file.etag))throw new KoboError('forbidden','This file has no strong ETag for safe deletion.');
    if(opts.ifMatch&&opts.ifMatch!==file.etag)throw new KoboError('conflict','This file changed before removal.');
    const response=await request(target(path),'DELETE',{headers:{...conditions,'If-Match':opts.ifMatch||file.etag},signal:opts.signal,limit:KOBO_BYTES});
    if(response.status===404)return;if(![200,204].includes(response.status))davError(response.status,response.headers);
  }
  async function probeDelete(path,etag){const response=await request(target(path),'DELETE',{headers:koboConditions({ifMatch:etag}),limit:KOBO_BYTES});if(![200,204].includes(response.status))davError(response.status,response.headers);}
  return {root,read,put,list,stat,remove,probeDelete};
}
