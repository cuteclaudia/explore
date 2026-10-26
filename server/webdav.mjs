import {createCipheriv,createDecipheriv,randomBytes,randomUUID} from 'node:crypto';
import {lookup} from 'node:dns/promises';
import https from 'node:https';
import {isIP} from 'node:net';
import {AccessError} from './access.mjs';
export function publicAddress(address){
 if(isIP(address)===4){const a=address.split('.').map(Number);return !(a[0]===0||a[0]===10||a[0]===127||a[0]>=224||a[0]===169&&a[1]===254||a[0]===172&&a[1]>=16&&a[1]<=31||a[0]===192&&(a[1]===168||a[1]===0)||a[0]===100&&a[1]>=64&&a[1]<=127||a[0]===198&&[18,19,51].includes(a[1])||a[0]===203&&a[1]===0&&a[2]===113);}
 if(isIP(address)===6){const first=parseInt(address.split(':')[0],16);return first>=0x2000&&first<=0x3fff&&!['2001:db8:','2001:0:','2001::','2002:','2001:10:','2001:20:'].some(prefix=>address.toLowerCase().startsWith(prefix));}
 return false;
}
export function connectionURL(value,allowed=process.env.WEBDAV_ALLOWED_HOSTS||''){
 let url;try{url=new URL(value);}catch{throw new AccessError(400,'Enter a valid HTTPS WebDAV folder URL.');}
 const hosts=allowed.split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
 if(!hosts.length)throw new AccessError(503,'WebDAV is not enabled. Configure approved WebDAV hosts in Netlify first.');
 if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.port&&url.port!=='443'||!hosts.includes(url.hostname.toLowerCase())||isIP(url.hostname))throw new AccessError(400,'Use an HTTPS folder on an approved WebDAV hostname, without embedded credentials or query parameters.');
 if(!url.pathname.endsWith('/'))url.pathname+='/';return url;
}
function key(){const value=process.env.FILE_STORAGE_ENCRYPTION_KEY||'';const bytes=Buffer.from(value,'base64');if(!/^[A-Za-z0-9+/]{43}=$/.test(value)||bytes.length!==32)throw new AccessError(503,'Private storage connections require FILE_STORAGE_ENCRYPTION_KEY in Netlify.');return bytes;}
export function seal(owner,config){const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key(),iv);cipher.setAAD(Buffer.from(owner));const body=Buffer.concat([cipher.update(JSON.stringify(config),'utf8'),cipher.final()]);return {iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),body:body.toString('base64')};}
export function unseal(owner,record){const cipher=createDecipheriv('aes-256-gcm',key(),Buffer.from(record.iv,'base64'));cipher.setAAD(Buffer.from(owner));cipher.setAuthTag(Buffer.from(record.tag,'base64'));return JSON.parse(Buffer.concat([cipher.update(Buffer.from(record.body,'base64')),cipher.final()]).toString('utf8'));}
export async function davRequest(config,method,name='',body){
 const base=connectionURL(config.url);const target=new URL(name?encodeURIComponent(name):'',base);
 const addresses=await lookup(target.hostname,{all:true});if(!addresses.length||addresses.some(x=>!publicAddress(x.address)))throw new AccessError(400,'The WebDAV hostname must resolve only to public Internet addresses.');
 const chosen=addresses[0];
 return new Promise((resolve,reject)=>{
  const req=https.request(target,{method,servername:target.hostname,lookup:(_host,options,callback)=>{if(options?.all)callback(null,[chosen]);else callback(null,chosen.address,chosen.family);},headers:{Authorization:'Basic '+Buffer.from(config.username+':'+config.password).toString('base64'),Depth:'0',...(body?{'Content-Length':String(body.length),'Content-Type':'application/octet-stream'}:{})}},res=>{let size=0;res.on('data',chunk=>{size+=chunk.length;if(size>2*1024*1024)req.destroy(Error('Response too large'));});res.on('end',()=>{if(res.statusCode>=200&&res.statusCode<300)resolve(res.statusCode);else reject(new AccessError(502,'WebDAV refused the operation ('+res.statusCode+'). Check the folder and app password.'));});});
  req.setTimeout(45000,()=>req.destroy(Error('WebDAV request timed out')));req.on('error',()=>reject(new AccessError(502,'WebDAV could not be reached securely. Check the hostname, TLS certificate and connection.')));if(body)req.write(body);req.end();
 });
}
export async function testConnection(config){await davRequest(config,'PROPFIND');const name='.explore-connection-check-'+randomUUID()+'.txt';await davRequest(config,'PUT',name,Buffer.from('Explore by Claudia connection test'));await davRequest(config,'DELETE',name);}
