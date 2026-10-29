import {getStore} from '@netlify/blobs';
import {fileService} from '../../server/cloud-files.mjs';
import {siteContent} from './studio-content';
// Only published PDF metadata; never list private working revisions or download bytes.
export async function featureContent(published?) {
 const entries=published||await siteContent().publicList();
 const files=await fileService(getStore({name:'studio-working-files',consistency:'strong'})).publicList();
 return [...entries,...files.filter(file=>file.type==='application/pdf'&&/^[0-9a-f-]{36}$/i.test(file.id)&&Number.isFinite(Date.parse(file.publishedAt))).map(file=>({key:'library/'+file.id,collection:'library',slug:file.id,title:file.title||file.name,summary:'Published PDF document',tags:file.tags||[],date:new Date(file.publishedAt).toISOString().slice(0,10)}))];
}
