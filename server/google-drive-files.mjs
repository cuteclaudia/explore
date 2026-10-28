import {createHash,randomUUID} from 'node:crypto';
import {KOBO_BYTES,KoboError,koboApp,koboPath,koboConditions} from '../src/lib/kobo-contract.mjs';
import {revision,commit,locked} from './blob-revisions.mjs';
import {indexContext} from './google-drive-recovery.mjs';
import {driveId} from './google-drive-http.mjs';
const hash=value=>createHash('sha256').update(value).digest('hex');
const folderType='application/vnd.google-apps.folder';
// Drive objects are immutable revisions. A conditional Blobs index commit publishes
// one current revision, so Drive need not provide WebDAV-style conditional updates.
export function googleDriveFiles(config,app,{store,api,recovery,expectedEpoch}){
 const methods=['read','stat','list','put','remove'];return Object.fromEntries(methods.map(method=>[method,async(...args)=>{
  const context=await indexContext(store,config,app);if(expectedEpoch!==undefined&&context.generation!==expectedEpoch)throw new KoboError('unauthorized','The private index was restored. Reopen the app.');await context.guard();
  const files=filesAtIndex(config,app,{store,api,recovery,context});const result=await files[method](...args);await context.guard();return result;
 }]));
}
function filesAtIndex(config,app,{store,api,recovery,context}){
 const spec=koboApp(app),owner=hash(config.userId),prefix=context.prefix;
 const key=path=>prefix+hash(path),tag=record=>'"gd1-'+record.version+'"';
 const scope={owner,connectionId:config.connectionId,app};
 function own(record,path){if(record&&(record.owner!==owner||record.connectionId!==config.connectionId||record.app!==app||record.path!==path))throw new KoboError('forbidden','This Drive record belongs to a different workspace.');return record;}
 async function current(path){const found=await revision(store,key(path));if(found)own(found.data,path);return found;}
 async function parents(path){
  const pieces=path.split('/').slice(0,-1);for(let n=1;n<=pieces.length;n++){
   const dir=pieces.slice(0,n).join('/');await locked('drive-dir:'+key(dir),async()=>{const before=await current(dir);if(before&&!before.data.deleted){if(before.data.kind!=='directory')throw new KoboError('forbidden','A parent path is a file.');return;}try{await commit(store,key(dir),{...scope,path:dir,kind:'directory',version:randomUUID(),modified:new Date().toISOString(),deleted:false},before);}catch(e){const winner=await current(dir);if(!winner||winner.data.deleted||winner.data.kind!=='directory')throw e;}});
  }
 }
 async function appFolder(){
  const k=context.folderKey;
  return locked(k,async()=>{const found=await revision(store,k);let folder;
   if(found){folder=await api.meta(found.data.id);}
   else{folder=await api.createFolder(spec.folder,config.rootId,{koboOwner:owner,koboApp:app});if(!driveId(folder.id))throw new KoboError('server','Google returned an invalid app folder.');try{await commit(store,k,{id:folder.id,...scope},null);}catch(e){const winner=await revision(store,k);if(!winner)throw e;folder=await api.meta(winner.data.id);}}
   if(!folder||folder.trashed||folder.mimeType!==folderType||!folder.parents?.includes(config.rootId)||folder.appProperties?.koboOwner!==owner||folder.appProperties?.koboApp!==app)throw new KoboError('conflict','The Google Drive app folder was moved or changed. Reconnect before continuing.');return folder.id;
  });
 }
 async function remote(record){
  const file=await api.meta(record.remoteId);
  if(!file||file.trashed||file.mimeType===folderType||!file.parents?.includes(record.parentId)||file.appProperties?.koboOwner!==owner||file.appProperties?.koboApp!==app||file.appProperties?.koboRevision!==record.version||file.appProperties?.koboHash!==record.sha256||Number(file.size)!==record.size)throw new KoboError('conflict','A working revision was changed or removed outside Kōbō. Your local work has not been overwritten.');return file;
 }
 return {
  async read(path,opts={}){koboPath(path);koboConditions(opts);const found=await current(path),record=found?.data;if(!record||record.deleted)return null;if(record.kind!=='file')throw new KoboError('forbidden','Choose an individual file.');if(opts.ifMatch&&opts.ifMatch!==tag(record))throw new KoboError('conflict','This Drive file changed.');await remote(record);const bytes=await api.download(record.remoteId);if(!bytes||bytes.byteLength!==record.size||hash(bytes)!==record.sha256)throw new KoboError('conflict','Drive file bytes do not match the saved revision.');return {data:bytes,etag:tag(record)};},
  async stat(path){koboPath(path);const record=(await current(path))?.data;if(!record||record.deleted)return null;if(record.kind==='file'){const file=await remote(record);
   // Drive's version includes internal metadata changes, not just file bytes.
   // A changed version requires a full bounded hash check, not an assumed
   // competing save. Logical CAS ETags still protect current-head publication.
   if(String(file.version)!==record.remoteVersion){const bytes=await api.download(record.remoteId);if(!bytes||bytes.byteLength!==record.size||hash(bytes)!==record.sha256)throw new KoboError('conflict','Drive file bytes do not match the saved revision.');}
  }return {size:record.size||0,etag:tag(record),modified:record.modified,isDir:record.kind==='directory'};},
  async list(dir){koboPath(dir,true);const start=dir?dir+'/':'',items=[];for await(const page of store.list({prefix,paginate:true}))for(const item of page.blobs){const r=await store.get(item.key,{type:'json'});if(!r||r.deleted||!r.path.startsWith(start)||r.path===dir||r.path.slice(start.length).includes('/'))continue;own(r,r.path);items.push({name:r.path.slice(start.length),isDir:r.kind==='directory',size:r.size||0,etag:tag(r),modified:r.modified});if(items.length>2048)throw new KoboError('too-large','This folder has too many direct children.');}return items.sort((a,b)=>a.name.localeCompare(b.name));},
  async put(path,data,opts={}){koboPath(path);koboConditions(opts);if(!(data instanceof Uint8Array)||data.byteLength>KOBO_BYTES)throw new KoboError('too-large','Drive operations accept at most 1 MiB.');await parents(path);
   return locked('drive-write:'+key(path),async()=>{const before=await current(path),old=before?.data;
    if(old&&!old.deleted&&old.kind!=='file')throw new KoboError('forbidden','A folder cannot be replaced by a file.');
    if(opts.ifNoneMatch==='*'&&old&&!old.deleted||opts.ifMatch&&(!old||old.deleted||tag(old)!==opts.ifMatch))throw new KoboError('conflict','Another Drive save completed first.');
    const version=randomUUID(),sha256=hash(data),parentId=await appFolder(),base=path.split('/').pop();
    const file=await api.createVersion(parentId,base.slice(0,170)+' — '+version,data,{koboOwner:owner,koboApp:app,koboRevision:version,koboHash:sha256});
    if(!driveId(file.id)||!/^\d+$/.test(String(file.version))||Number(file.size)!==data.byteLength)throw new KoboError('server','Google did not confirm the uploaded revision.');
    const record={...scope,path,kind:'file',version,remoteId:file.id,parentId,remoteVersion:String(file.version),size:data.byteLength,sha256,modified:new Date().toISOString(),deleted:false};
    // Only this atomic index update makes the uploaded object current. A losing
    // upload remains private/unreferenced; it never overwrites another revision.
    if(opts.signal?.aborted)throw new KoboError('timeout','This upload was cancelled before publishing its revision.');
    // A recovery snapshot must exist before a control head can become current.
    const checkpoint=recovery&&/(?:^|\/)(?:head|libraries|documents)\.json$/.test(path)?await recovery.capture(config,app,{context,replacement:record,reason:'before-control-publication',signal:opts.signal}):null;
    if(opts.signal?.aborted)throw new KoboError('cancelled','The save was cancelled before publishing its revision.');
    await context.guard();await commit(store,key(path),record,before);
    if(checkpoint)try{await recovery.confirmed(config,app,checkpoint);}catch{/* The complete prepared snapshot already exists; confirmation is informational. */}
    return {etag:tag(record)};
   });
  },
  async remove(path,opts={}){koboPath(path);koboConditions(opts);return locked('drive-write:'+key(path),async()=>{const before=await current(path),r=before?.data;if(!r||r.deleted)return;if(r.kind!=='file')throw new KoboError('forbidden','Only individual files can be removed.');if(opts.ifMatch&&opts.ifMatch!==tag(r))throw new KoboError('conflict','This file changed before removal.');await commit(store,key(path),{...r,version:randomUUID(),deleted:true,modified:new Date().toISOString()},before);});},
 };
}
