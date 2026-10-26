import {createHash} from 'node:crypto';
export function memoryDav({ignoreConditions=false,noEtags=false,noPutEtags=false}={}){
 const records=new Map(),calls=[];let counter=0;
 const etag=data=>'"'+createHash('sha256').update(data).update(String(++counter)).digest('hex')+'"';
 const xml=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
 const reply=(status,body='',headers={})=>({status,body:Buffer.from(body),headers});
 const transport=async(_config,url,method,{headers={},body=new Uint8Array(),signal}={})=>{
  signal?.throwIfAborted();const key=url.pathname;calls.push({key,method,headers});const old=records.get(key);
  const bad=()=>!ignoreConditions&&(headers['If-None-Match']==='*'&&old||headers['If-Match']&&headers['If-Match']!==old?.etag);
  if(method==='MKCOL'){if(old)return reply(405);records.set(key,{isDir:true,data:Buffer.alloc(0),etag:'"folder-'+(++counter)+'"'});return reply(201);}
  if(method==='PUT'){if(bad())return reply(412);const value={isDir:false,data:Buffer.from(body),etag:etag(body)};records.set(key,value);return reply(old?204:201,'',noEtags||noPutEtags?{}:{etag:value.etag});}
  if(method==='GET'){if(!old)return reply(404);if(bad())return reply(412);return reply(200,old.data,noEtags?{}:{etag:old.etag});}
  if(method==='DELETE'){if(bad())return reply(412);if(!old)return reply(404);records.delete(key);return reply(204);}
  if(method==='PROPFIND'){
   const parent=old||records.get(key+'/');if(!parent)return reply(404);const real=old?key:key+'/';
   const entries=[...[...records].filter(([k])=>k===real),...(headers.Depth==='1'?[...records].filter(([k])=>k!==real&&k.startsWith(real)&&!k.slice(real.length).replace(/\/$/,'').includes('/')):[])];
   return reply(207,'<d:multistatus xmlns:d="DAV:">'+entries.map(([path,file])=>'<d:response><d:href>'+xml(path)+'</d:href><d:propstat><d:prop><d:resourcetype>'+(file.isDir?'<d:collection/>':'')+'</d:resourcetype><d:getcontentlength>'+file.data.length+'</d:getcontentlength><d:getetag>'+xml(file.etag)+'</d:getetag><d:getlastmodified>Mon, 26 Oct 2026 12:00:00 GMT</d:getlastmodified></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat></d:response>').join('')+'</d:multistatus>');
  }
  throw Error('Unexpected DAV method '+method);
 };
 return {transport,records,calls};
}
