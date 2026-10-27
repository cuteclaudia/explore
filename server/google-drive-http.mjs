import {randomUUID} from 'node:crypto';
import {KOBO_BYTES,KoboError} from '../src/lib/kobo-contract.mjs';
export const DRIVE_SCOPE='https://www.googleapis.com/auth/drive.file';
export const driveId=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{6,200}$/.test(value);
export async function limitedBytes(response,max){
 if(Number(response.headers.get('content-length'))>max)throw new KoboError('too-large','Google returned more data than this operation supports.');
 const reader=response.body?.getReader();if(!reader)return new Uint8Array();const chunks=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>max){await reader.cancel();throw new KoboError('too-large','Google returned more data than this operation supports.');}chunks.push(value);}}finally{reader.releaseLock();}
 const data=new Uint8Array(size);let offset=0;for(const bytes of chunks){data.set(bytes,offset);offset+=bytes.byteLength;}return data;
}
export function googleError(response){
 if(response.status===401)throw new KoboError('forbidden','Reconnect Google Drive in Files & storage.');
 if(response.status===403)throw new KoboError('forbidden','Google Drive refused this operation. Check access, storage quota and Google account policies.');
 if(response.status===429||response.status===503)throw new KoboError('rate-limited','Google Drive asked us to wait before retrying.',true,Math.min(3600000,Math.max(1000,(Number(response.headers.get('retry-after'))||5)*1000)));
 if(response.status===409||response.status===412)throw new KoboError('conflict','Google Drive reports that this file changed.');
 if(response.status>=300&&response.status<400)throw new KoboError('forbidden','An unexpected Google redirect was refused.');
 throw new KoboError('server','Google Drive could not complete this operation (HTTP '+response.status+').',response.status>=500);
}
export async function googleFetch(url,options={},fetcher=fetch){
 const target=new URL(url);
 if(!['https://www.googleapis.com','https://oauth2.googleapis.com'].includes(target.origin)||target.username||target.password||target.hash)throw new KoboError('forbidden','Invalid Google service address.');
 const signal=options.signal?AbortSignal.any([options.signal,AbortSignal.timeout(12000)]):AbortSignal.timeout(12000);
 try{return await fetcher(target,{...options,redirect:'manual',signal});}catch{throw new KoboError(signal.aborted?'timeout':'offline','Google could not be reached. Please try again.',true);}
}
export async function googleJSON(response){
 const data=await limitedBytes(response,2*KOBO_BYTES);let value;try{value=JSON.parse(new TextDecoder().decode(data));}catch{throw new KoboError('server','Google returned an unreadable response.');}return value;
}
export function googleDriveAPI(accessToken,{fetcher=fetch,signal}={}){
 const fields='id,name,mimeType,size,version,modifiedTime,appProperties,parents,trashed';
 async function call(path,{method='GET',body,headers={},notFound=false}={}){
  const response=await googleFetch('https://www.googleapis.com/'+path,{method,body,signal,headers:{Authorization:'Bearer '+accessToken,...headers}},fetcher);
  if(response.status===404&&notFound)return null;
  if(!response.ok)googleError(response);return response;
 }
 return {
  async about(){return googleJSON(await call('drive/v3/about?fields=user(permissionId,emailAddress,displayName),storageQuota(limit,usage)'));},
  async meta(id){if(!driveId(id))throw new KoboError('forbidden','Invalid Drive file identifier.');const r=await call('drive/v3/files/'+id+'?fields='+fields,{notFound:true});return r?googleJSON(r):null;},
  async root(ownerHash){
   const q="trashed = false and mimeType = 'application/vnd.google-apps.folder' and appProperties has { key='koboOwner' and value='"+ownerHash+"' } and appProperties has { key='koboRoot' and value='1' }";
   const value=await googleJSON(await call('drive/v3/files?spaces=drive&pageSize=10&fields=files('+fields+')&q='+encodeURIComponent(q)));
   if(!Array.isArray(value.files))throw new KoboError('server','Google returned an invalid folder list.');
   const found=value.files.filter(f=>f.appProperties?.koboOwner===ownerHash&&f.appProperties?.koboRoot==='1'&&!f.trashed&&f.mimeType==='application/vnd.google-apps.folder').sort((a,b)=>String(a.id).localeCompare(String(b.id)))[0];
   return found||this.createFolder('Kōbō',null,{koboOwner:ownerHash,koboRoot:'1'});
  },
  async createFolder(name,parent,properties){
   if(parent&&!driveId(parent))throw new KoboError('forbidden','Invalid Drive folder identifier.');
   return googleJSON(await call('drive/v3/files?fields='+fields,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,mimeType:'application/vnd.google-apps.folder',...(parent?{parents:[parent]}:{}),appProperties:properties})}));
  },
  async createVersion(parent,name,bytes,properties){
   if(!driveId(parent)||!(bytes instanceof Uint8Array)||bytes.byteLength>KOBO_BYTES)throw new KoboError('too-large','Drive operations accept at most 1 MiB.');
   const boundary='kobo_'+randomUUID().replaceAll('-',''),metadata={name,parents:[parent],mimeType:'application/octet-stream',appProperties:properties};
   const body=Buffer.concat([Buffer.from('--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(metadata)+'\r\n--'+boundary+'\r\nContent-Type: application/octet-stream\r\n\r\n'),Buffer.from(bytes),Buffer.from('\r\n--'+boundary+'--\r\n')]);
   return googleJSON(await call('upload/drive/v3/files?uploadType=multipart&fields='+fields,{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body}));
  },
  async download(id){if(!driveId(id))throw new KoboError('forbidden','Invalid Drive file identifier.');const r=await call('drive/v3/files/'+id+'?alt=media',{notFound:true});return r?limitedBytes(r,KOBO_BYTES):null;},
 };
}
