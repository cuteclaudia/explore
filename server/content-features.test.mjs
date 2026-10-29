import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {getStore} from '@netlify/blobs';
import {BlobsServer} from '@netlify/blobs/server';
import {contentFeatures} from './content-features.mjs';
import {contentService} from './content.mjs';
const owner={user:{id:'owner'},isOwner:true,permissions:{}};
const draft={title:'Public brief',date:'2026-10-29',html:'<p>Published signals</p>',tags:[]};
async function fixture(run){const directory=await mkdtemp(join(tmpdir(),'content-features-')),server=new BlobsServer({directory,token:'test-only',logger:()=>{}});try{const address=await server.start(),url='http://127.0.0.1:'+address.port,options={siteID:'test',token:'test-only',apiURL:url,edgeURL:url,uncachedEdgeURL:url,consistency:'strong'},content=contentService(getStore({...options,name:'content'})),features=contentFeatures(getStore({...options,name:'features'}),()=>content.publicList());await run(features,content);}finally{await server.stop();await rm(directory,{recursive:true,force:true});}}
const select=(slot,key,etag=null)=>({expectedAccount:'owner',etag,slot,key});
test('independent home and writing pins retain published-only content and do not publish drafts',()=>fixture(async(features,content)=>{
 let brief=await content.save(owner,'osint/weekly',{version:0,action:'publish',draft});
 const journal=await content.save(owner,'journal/mountains',{version:0,action:'publish',draft:{...draft,title:'Mountain journal'}});
 await content.save(owner,'essays/private',{version:0,action:'draft',draft:{...draft,title:'PRIVATE TITLE'}});
 let settings=await features.settings(owner);assert.equal(settings.home,null);assert(!JSON.stringify(settings).includes('PRIVATE TITLE'));
 settings=await features.save(owner,select('writing',brief.key));
 settings=await features.save(owner,select('home',journal.key,settings.etag));
 assert.equal(settings.writing,brief.key);assert.equal(settings.home,journal.key);
 assert.equal((await features.resolve(await content.publicList())).writing.title,draft.title);
 brief=await content.save(owner,brief.key,{version:brief.version,action:'draft',draft:{...draft,title:'SECRET NEXT REVISION'}});
 assert.equal((await features.resolve(await content.publicList())).writing.title,draft.title);
 await content.save(owner,brief.key,{version:brief.version,action:'unpublish',draft:brief.draft});
 const publicFeatures=await features.resolve(await content.publicList());assert.equal(publicFeatures.writing,null);assert.equal(publicFeatures.home.title,'Mountain journal');assert(!JSON.stringify(publicFeatures).includes('SECRET'));
 settings=await features.save(owner,select('home',null,settings.etag));assert.equal(settings.home,null);
}));
test('pins reject non-owner, wrong account, unsupported or unpublished items',()=>fixture(async(features,content)=>{
 const entry=await content.save(owner,'journal/entry',{version:0,action:'publish',draft});
 await assert.rejects(features.settings({isOwner:false}),e=>e.status===403);
 await assert.rejects(features.save({isOwner:false},select('home',entry.key)),e=>e.status===403);
 await assert.rejects(features.save(owner,{...select('home',entry.key),expectedAccount:'other'}),e=>e.status===409);
 await assert.rejects(features.save(owner,select('writing',entry.key)),e=>e.status===400);
 for(const value of [select('__proto__',entry.key),select('home','essays/missing'),{...select('home',entry.key),html:'bad'},null])await assert.rejects(features.save(owner,value),e=>e.status===400);
}));
test('simultaneous selections have one winner and a stale form cannot erase another slot',()=>fixture(async(features,content)=>{
 const brief=await content.save(owner,'osint/weekly',{version:0,action:'publish',draft});
 const results=await Promise.allSettled([features.save(owner,select('home',brief.key)),features.save(owner,select('writing',brief.key))]);
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.filter(r=>r.status==='rejected'&&r.reason.status===409).length,1);
 const current=await features.settings(owner),nextSlot=current.home?'writing':'home';
 const next=await features.save(owner,select(nextSlot,brief.key,current.etag));assert.equal(next.home,brief.key);assert.equal(next.writing,brief.key);
}));
test('a deleted feature stops appearing without deleting its stored selection',()=>fixture(async(features,content)=>{
 const brief=await content.save(owner,'osint/weekly',{version:0,action:'publish',draft});await features.save(owner,select('writing',brief.key));
 await content.manage(owner,brief.key,{version:brief.version,action:'delete'});
 assert.equal((await features.resolve(await content.publicList())).writing,null);assert.equal((await features.settings(owner)).writing,brief.key);
}));
test('page-specific choices can be reused or cleared without changing other pages',()=>fixture(async(features,content)=>{
 const brief=await content.save(owner,'osint/per-page',{version:0,action:'publish',draft});
 let selection=await features.save(owner,select('home',brief.key));
 selection=await features.save(owner,select('journal',brief.key,selection.etag));
 selection=await features.save(owner,select('photography',brief.key,selection.etag));
 assert.equal((await features.forPage('journal')).key,brief.key);assert.equal((await features.forPage('photography')).key,brief.key);
 selection=await features.save(owner,select('journal',null,selection.etag));
 assert.equal(await features.forPage('journal'),null);assert.equal((await features.forPage('photography')).key,brief.key);assert.equal(selection.home,brief.key);
 assert.equal(await features.forPage('studio'),null);
}));
