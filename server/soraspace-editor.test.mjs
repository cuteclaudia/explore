import test from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
import {mkdtemp,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {getStore} from '@netlify/blobs';import {BlobsServer} from '@netlify/blobs/server';
import {siteEditorTrial} from './soraspace-editor.mjs';import {editableSiteFromSetup,validateEditableSite,readSiteDraftExport} from '../src/lib/soraspace-site-editor.mjs';import {recommendedSiteAnswers} from '../src/lib/soraspace-site-setup.mjs';
const owner={isOwner:true,user:{id:'alice'}},other={isOwner:true,user:{id:'bob'}},make=()=>editableSiteFromSetup({...recommendedSiteAnswers('academic'),siteName:'Research space'});
async function fixture(run){const directory=await mkdtemp(join(tmpdir(),'soraspace-editor-')),server=new BlobsServer({directory,token:'fixture',logger:()=>{}});try{const address=await server.start(),url='http://127.0.0.1:'+address.port,store=getStore({name:'editor',siteID:'fixture',token:'fixture',apiURL:url,edgeURL:url,uncachedEdgeURL:url,consistency:'strong'});await run(siteEditorTrial(store));}finally{await server.stop();await rm(directory,{recursive:true,force:true});}}
const input=(draft=make(),etag=null)=>({expectedAccount:'alice',etag,mutationId:randomUUID(),draft});
test('editor model preserves hidden page content and explicit navigation order, homepage and highlights',()=>{
 const d=make();d.pages.find(p=>p.id==='home').enabled=false;d.homePage='about';d.pages.find(p=>p.id==='journal').body='PRIVATE journal draft';d.pages.reverse();d.featuredPage='articles';
 const result=validateEditableSite(d);assert.equal(result.pages.find(p=>p.id==='journal').body,'PRIVATE journal draft');assert.deepEqual(result.pages.map(p=>p.id),d.pages.map(p=>p.id));assert.equal(result.homePage,'about');assert.equal(result.visibility,'private');
 d.theme.template='horizon';assert.equal(validateEditableSite(d).pages.find(p=>p.id==='journal').body,'PRIVATE journal draft');
});
test('editor import refuses public states, domain/identity/asset injection and malformed page bindings',()=>{
 const mutations=[d=>d.status='published',d=>d.visibility='public',d=>d.domain='evil.test',d=>d.ownerAccountId='bob',d=>d.logoUrl='https://private.invalid',d=>d.theme.css='bad',d=>d.pages.pop(),d=>d.pages[1].id='home',d=>d.homePage='journal',d=>d.featuredPage='journal',d=>d.pages[0].title='',d=>d.pages[0].body='x'.repeat(3001),d=>d.pages[1].title=d.pages[0].title];
 for(const mutate of mutations){const d=make();mutate(d);assert.throws(()=>validateEditableSite(d));}
 const answers={...recommendedSiteAnswers(),siteName:'Old export'};assert.equal(readSiteDraftExport({format:'soraspace-site-draft',schemaVersion:1,answers,draft:{status:'published',owner:'forged'}}).siteName,'Old export');
 assert.deepEqual(readSiteDraftExport({format:'soraspace-site-draft',schemaVersion:2,draft:make()}),make());
});
test('owner trial drafts are private, account-bound and use a separate store scope',()=>fixture(async service=>{
 assert.equal((await service.load(owner)).draft,null);await assert.rejects(()=>service.load({isOwner:false,user:{id:'alice'}}),e=>e.status===403);
 await assert.rejects(()=>service.save(owner,{...input(),expectedAccount:'bob'}),e=>e.status===409);
 const saved=await service.save(owner,input());assert(saved.etag);assert.equal(saved.publishingEnabled,false);assert.equal((await service.load(other)).draft,null);assert.equal((await service.load(owner)).draft.siteName,'Research space');
 await assert.rejects(()=>service.save(owner,input()),e=>e.status===409);
}));
test('save retries are idempotent and altered/reused save IDs cannot overwrite newer changes',()=>fixture(async service=>{
 const request=input(),saved=await service.save(owner,request);assert.equal((await service.save(owner,request)).etag,saved.etag);
 const next=structuredClone(saved.draft);next.siteName='Newer version';const updated=await service.save(owner,input(next,saved.etag));
 assert.equal((await service.save(owner,request)).etag,updated.etag);assert.equal((await service.load(owner)).draft.siteName,'Newer version');
 await assert.rejects(()=>service.save(owner,{...request,draft:next}),e=>e.status===409);
}));
test('concurrent owner saves have one winner and reject stale forms without losing content',()=>fixture(async service=>{
 const saved=await service.save(owner,input());const a=structuredClone(saved.draft),b=structuredClone(saved.draft);a.tagline='Writer one';b.tagline='Writer two';
 const results=await Promise.allSettled([service.save(owner,input(a,saved.etag)),service.save(owner,input(b,saved.etag))]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.find(r=>r.status==='rejected').reason.status,409);
 assert(['Writer one','Writer two'].includes((await service.load(owner)).draft.tagline));
}));
