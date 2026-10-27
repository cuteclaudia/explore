// Independent V8 isolate: no process-local locks are shared with the other writer.
import {parentPort,workerData} from 'node:worker_threads';
import {createHash} from 'node:crypto';
import {getStore} from '@netlify/blobs';
import {googleDriveFiles} from '../google-drive-files.mjs';
const {storeOptions,config,path,conditions,writer}=workerData;
const owner=createHash('sha256').update(config.userId).digest('hex');
const api={
 async meta(id){return {id,mimeType:'application/vnd.google-apps.folder',parents:[config.rootId],appProperties:{koboOwner:owner,koboApp:'hikari'}};},
 async createVersion(parent,name,bytes,appProperties){
  const id='uploaded_'+writer;
  parentPort.postMessage({ready:true,id});
  await new Promise(resolve=>parentPort.once('message',resolve));
  return {id,name,size:String(bytes.byteLength),version:'1',mimeType:'application/octet-stream',parents:[parent],appProperties};
 },
};
try{const files=googleDriveFiles(config,'hikari',{store:getStore(storeOptions),api});const result=await files.put(path,new Uint8Array([writer]),conditions);parentPort.postMessage({done:true,writer,result});}
catch(error){parentPort.postMessage({done:true,writer,error:{code:error.code,message:error.message}});}
finally{parentPort.close();}
