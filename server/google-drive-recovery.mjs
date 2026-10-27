import {createHash,randomUUID} from 'node:crypto';
import {seal,unseal} from './webdav.mjs';
import {revision,commit} from './blob-revisions.mjs';
import {KOBO_BYTES,KoboError,koboApp,koboPath} from '../src/lib/kobo-contract.mjs';
import {driveId} from './google-drive-http.mjs';
const hash=v=>createHash('sha256').update(v).digest('hex');
const uuid=v=>typeof v==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(v);
const bad=message=>{throw new KoboError('invalid',message);};
export const INDEX_BACKUP_MAX_BYTES=2*1024*1024,INDEX_BACKUP_MAX_RECORDS=4096;
export function indexScope(config,app){koboApp(app);if(!config.userId||!/^\w{1,128}$/.test(config.connectionId)||!driveId(config.rootId))bad('Invalid index connection.');const owner=hash(config.userId),base=owner+'/'+config.connectionId+'/'+app;return {owner,base,app,connectionId:config.connectionId,rootId:config.rootId};}
export async function indexContext(store,config,app){
 const scope=indexScope(config,app),rootKey='active-index/'+scope.base,root=await revision(store,rootKey),generation=root?root.data.generation:'legacy';
 if(generation!=='legacy'&&!uuid(generation)||root&&root.data.recovering!==null&&!uuid(root.data.recovering))throw new KoboError('server','The private index pointer is invalid. Administrator recovery is required.');
 const prefix=generation==='legacy'?'entries/'+scope.base+'/':'recovered/'+scope.base+'/'+generation+'/entries/';
 const folderKey=generation==='legacy'?'folders/'+scope.base:'recovered/'+scope.base+'/'+generation+'/folder';
 async function guard(){const next=await revision(store,rootKey);if(next?.data.recovering||next?.data.writeId!==root?.data.writeId)throw new KoboError('conflict','The private index is changing. Keep local work and reopen the app after recovery.');}
 return {...scope,rootKey,root,generation,prefix,folderKey,guard};
}
function cleanRecord(record,scope){
 if(!record||record.owner!==scope.owner||record.connectionId!==scope.connectionId||record.app!==scope.app)bad('Backup record belongs to another workspace.');
 koboPath(record.path);if(!['file','directory'].includes(record.kind)||!uuid(record.version)||typeof record.deleted!=='boolean'||typeof record.modified!=='string'||!Number.isFinite(Date.parse(record.modified)))bad('Invalid backup record.');
 const r={owner:scope.owner,connectionId:scope.connectionId,app:scope.app,path:record.path,kind:record.kind,version:record.version,modified:record.modified,deleted:record.deleted};
 if(r.kind==='file'){
  if(!driveId(record.remoteId)||!driveId(record.parentId)||!/^\d{1,30}$/.test(record.remoteVersion)||!Number.isSafeInteger(record.size)||record.size<0||record.size>KOBO_BYTES||!/^[a-f0-9]{64}$/.test(record.sha256))bad('Invalid backup file reference.');
  Object.assign(r,{remoteId:record.remoteId,parentId:record.parentId,remoteVersion:record.remoteVersion,size:record.size,sha256:record.sha256});
 }
 return r;
}
function validate(payload,scope){
 if(!payload||payload.format!=='kobo-drive-index'||payload.version!==1||payload.owner!==scope.owner||payload.connectionId!==scope.connectionId||payload.app!==scope.app||payload.rootId!==scope.rootId||!uuid(payload.id)||!Number.isFinite(Date.parse(payload.createdAt)))bad('This backup is not for the current account, app and Drive connection.');
 if(!Array.isArray(payload.records)||payload.records.length>INDEX_BACKUP_MAX_RECORDS)bad('Backup contains too many records.');
 if(payload.folder!==null&&(!payload.folder||!driveId(payload.folder.id)||payload.folder.owner!==scope.owner||payload.folder.connectionId!==scope.connectionId||payload.folder.app!==scope.app))bad('Invalid app folder mapping.');
 const seen=new Set();payload.records=payload.records.map(r=>{const record=cleanRecord(r,scope);if(seen.has(record.path))bad('Duplicate backup path.');seen.add(record.path);if(record.kind==='file'&&record.parentId!==payload.folder?.id)bad('File belongs to another app folder.');return record;});
 if(Buffer.byteLength(JSON.stringify(payload))>INDEX_BACKUP_MAX_BYTES)bad('Index backup exceeds 2 MiB.');return payload;
}
export function googleDriveRecovery({index,backups,apiFor}){
 const binding=scope=>'kobo-index-backup\0'+scope.base;
 const snapshotKey=(scope,id)=>{if(!uuid(id))bad('Invalid backup identifier.');return 'snapshots/'+scope.base+'/'+id;};
 const catalogKey=(scope,time,id)=>'catalog/'+scope.base+'/'+new Date(time).toISOString()+'--'+id;
 const jobKey=(scope,id)=>{if(!uuid(id))bad('Invalid recovery identifier.');return 'jobs/'+scope.base+'/'+id;};
 async function readSnapshot(scope,id){const row=await backups.get(snapshotKey(scope,id),{type:'json'});if(!row)bad('Backup was not found for this account.');let payload;try{payload=unseal(binding(scope),row.encrypted);}catch{bad('Backup authentication failed. Keep the original storage encryption key.');}return validate(payload,scope);}
 async function capture(config,app,{context,replacement,reason='manual',signal}={}){
  const c=context||await indexContext(index,config,app),records=[],versions=[];
  const items=[];for await(const page of index.list({prefix:c.prefix,paginate:true}))for(const item of page.blobs){if(items.length>=INDEX_BACKUP_MAX_RECORDS)throw new KoboError('too-large','Private index backup limit reached. Do not publish until index backup capacity is increased.');items.push(item);}
  // Bounded parallel reads keep a 200-part original's checkpoint within a
  // function request, rather than serially paying every index round trip.
  for(let offset=0;offset<items.length;offset+=16){
   if(signal?.aborted)throw new KoboError('cancelled','Index backup was cancelled before publication.');
   await Promise.all(items.slice(offset,offset+16).map(async item=>{
    const found=await revision(index,item.key);if(!found||!item.etag||found.etag!==item.etag)throw new KoboError('conflict','Index changed during backup. Retry after saves finish.');versions.push(item.key+'|'+item.etag);const record=cleanRecord(found.data,c);if(item.key!==c.prefix+hash(record.path))bad('Invalid private index key.');records.push(record);
   }));
  }
  const after=[];for await(const page of index.list({prefix:c.prefix,paginate:true}))for(const item of page.blobs)after.push(item.key+'|'+item.etag);if(JSON.stringify(versions.sort())!==JSON.stringify(after.sort()))throw new KoboError('conflict','Index changed during backup. Retry after saves finish.');
  if(replacement){const row=cleanRecord(replacement,c),at=records.findIndex(r=>r.path===row.path);if(at<0)records.push(row);else records[at]=row;}
  records.sort((a,b)=>a.path.localeCompare(b.path));const f=await index.get(c.folderKey,{type:'json'});
  const folder=f?{id:f.id,owner:f.owner,connectionId:f.connectionId,app:f.app}:null;
  const payload=validate({format:'kobo-drive-index',version:1,id:randomUUID(),createdAt:new Date().toISOString(),owner:c.owner,connectionId:c.connectionId,rootId:c.rootId,app,folder,records},c);
  if(!c.root?.data.recovering)await c.guard();
  const summary={id:payload.id,createdAt:payload.createdAt,count:records.length,reason,publication:replacement?'prepared':'manual'};
  await backups.setJSON(snapshotKey(c,payload.id),{...summary,encrypted:seal(binding(c),payload)},{onlyIfNew:true});
  await backups.setJSON(catalogKey(c,payload.createdAt,payload.id),summary,{onlyIfNew:true});
  return {id:payload.id,createdAt:payload.createdAt,count:records.length};
 }
 async function confirmed(config,app,checkpoint){const scope=indexScope(config,app),key=catalogKey(scope,checkpoint.createdAt,checkpoint.id),before=await revision(backups,key);if(before)await commit(backups,key,{...before.data,publication:'confirmed'},before);}
 async function list(config,app){const c=await indexContext(index,config,app),keys=[];for await(const page of backups.list({prefix:'catalog/'+c.base+'/',paginate:true}))for(const item of page.blobs)keys.push(item.key);const items=await Promise.all(keys.sort().reverse().slice(0,50).map(key=>backups.get(key,{type:'json'})));return {snapshots:items.filter(Boolean).map(({id,createdAt,count,reason,publication})=>({id,createdAt,count,reason,publication})),recovering:c.root?.data.recovering||null};}
 async function download(config,app,id){const c=indexScope(config,app);await readSnapshot(c,id);const row=await backups.get(snapshotKey(c,id),{type:'json'});return {format:'kobo-drive-index-encrypted',version:1,encrypted:row.encrypted};}
 async function upload(config,app,envelope){const c=indexScope(config,app);if(envelope?.format!=='kobo-drive-index-encrypted'||envelope.version!==1||typeof envelope.encrypted?.body!=='string'||envelope.encrypted.body.length>3*INDEX_BACKUP_MAX_BYTES/2)bad('Invalid encrypted backup.');let payload;try{payload=unseal(binding(c),envelope.encrypted);}catch{bad('Backup authentication failed or belongs to another account.');}payload=validate(payload,c);const key=snapshotKey(c,payload.id),before=await backups.get(key,{type:'json'});if(before){const existing=await readSnapshot(c,payload.id);if(JSON.stringify(existing)!==JSON.stringify(payload))throw new KoboError('conflict','This backup id already identifies different content.');}else await backups.setJSON(key,{id:payload.id,createdAt:payload.createdAt,encrypted:seal(binding(c),payload)},{onlyIfNew:true});await backups.setJSON(catalogKey(c,payload.createdAt,payload.id),{id:payload.id,createdAt:payload.createdAt,count:payload.records.length,reason:'imported',publication:'imported'},{onlyIfNew:true});return {id:payload.id};}
 async function job(config,app,id){const c=await indexContext(index,config,app),key=jobKey(c,id),before=await revision(backups,key);if(!before)bad('Recovery was not found for this account.');return {c,key,before,r:before.data};}
 async function begin(config,app,snapshotId){
  const c=await indexContext(index,config,app),payload=await readSnapshot(c,snapshotId);
  if(c.root?.data.recovering){const old=await job(config,app,c.root.data.recovering);if(old.r.snapshotId===snapshotId)return {id:old.r.id,cursor:old.r.cursor,total:payload.records.length};throw new KoboError('conflict','Finish or cancel the existing index recovery first.');}
  const id=randomUUID(),generation=randomUUID(),key=jobKey(c,id);
  await commit(backups,key,{id,snapshotId,generation,previous:c.generation,cursor:0,total:payload.records.length,state:'validating'},null);
  await commit(index,c.rootKey,{generation:c.generation,recovering:id},c.root);
  return {id,cursor:0,total:payload.records.length};
 }
 async function verifyFolder(payload,api){if(!payload.folder)return;if(!api)throw new KoboError('server','Recovery verification is unavailable.');const f=await api.meta(payload.folder.id);if(!f||f.trashed||f.mimeType!=='application/vnd.google-apps.folder'||!f.parents?.includes(payload.rootId)||f.appProperties?.koboOwner!==payload.owner||f.appProperties?.koboApp!==payload.app)throw new KoboError('conflict','The backed-up Drive app folder is missing or changed. Nothing has been activated.');}
 async function stage(key,value){const result=await index.setJSON(key,value,{onlyIfNew:true});if(result?.modified===false&&JSON.stringify(await index.get(key,{type:'json'}))!==JSON.stringify(value))throw new KoboError('conflict','The recovery staging area changed.');}
 async function step(config,app,id){
  const {c,key,before,r}=await job(config,app,id);
  if(c.generation===r.generation&&!c.root.data.recovering)return {id,cursor:r.total,total:r.total,complete:true};
  if(c.root?.data.recovering!==id||c.generation!==r.previous)throw new KoboError('conflict','This recovery no longer owns the private index.');
  const payload=await readSnapshot(c,r.snapshotId),api=apiFor(config,app);await verifyFolder(payload,api);
  const prefix='recovered/'+c.base+'/'+r.generation+'/';
  if(payload.folder)await stage(prefix+'folder',payload.folder);
  const batch=payload.records.slice(r.cursor,r.cursor+4);
  await Promise.all(batch.map(async record=>{
   if(record.kind==='file'&&!record.deleted){const f=await api.meta(record.remoteId);if(!f||f.trashed||f.mimeType==='application/vnd.google-apps.folder'||!f.parents?.includes(record.parentId)||f.appProperties?.koboOwner!==c.owner||f.appProperties?.koboApp!==app||f.appProperties?.koboRevision!==record.version||f.appProperties?.koboHash!==record.sha256||Number(f.size)!==record.size)throw new KoboError('conflict','A backed-up Drive revision is missing or changed. Nothing has been activated.');const bytes=await api.download(record.remoteId);if(!bytes||bytes.byteLength!==record.size||hash(bytes)!==record.sha256)throw new KoboError('conflict','A backed-up Drive revision failed byte verification. Nothing has been activated.');}
   await stage(prefix+'entries/'+hash(record.path),record);
  }));
  const cursor=r.cursor+batch.length;await commit(backups,key,{...r,cursor,state:cursor===r.total?'ready':'validating'},before);return {id,cursor,total:r.total,ready:cursor===r.total};
 }
 async function publish(config,app,id){const {c,key,before,r}=await job(config,app,id);
  if(c.generation===r.generation&&!c.root.data.recovering)return {restored:true,id};
  if(c.root?.data.recovering!==id||r.state!=='ready'||r.cursor!==r.total)throw new KoboError('conflict','Complete all recovery checks before activating the index.');
  const payload=await readSnapshot(c,r.snapshotId),prefix='recovered/'+c.base+'/'+r.generation+'/',expected=new Set(payload.records.map(row=>prefix+'entries/'+hash(row.path)));if(payload.folder)expected.add(prefix+'folder');
  for await(const page of index.list({prefix,paginate:true}))for(const item of page.blobs){if(!expected.delete(item.key))throw new KoboError('conflict','The staged recovery index changed. Nothing has been activated.');}
  if(expected.size)throw new KoboError('conflict','The staged recovery index is incomplete. Resume verification before activation.');
  await commit(index,c.rootKey,{generation:r.generation,recovering:null},c.root);
  // Publication is the single pointer CAS. A lost job-status reply is resumable.
  try{await commit(backups,key,{...r,state:'complete'},before);}catch{}
  return {restored:true,id};
 }
 async function cancel(config,app,id){const {c,r}=await job(config,app,id);if(c.root?.data.recovering!==id)throw new KoboError('conflict','This recovery is no longer active.');await commit(index,c.rootKey,{generation:r.previous,recovering:null},c.root);return {cancelled:true};}
 return {capture,confirmed,list,download,upload,begin,step,publish,cancel};
}
