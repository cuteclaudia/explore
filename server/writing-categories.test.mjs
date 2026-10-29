import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {getStore} from '@netlify/blobs';
import {BlobsServer} from '@netlify/blobs/server';
import {writingCategories,DEFAULT_WRITING_CATEGORIES,writingCategoryFor} from './writing-categories.mjs';
import {contentService} from './content.mjs';
const owner={user:{id:'owner'},isOwner:true,permissions:{}};
async function fixture(run){
 const directory=await mkdtemp(join(tmpdir(),'writing-categories-')),server=new BlobsServer({directory,token:'test-only',logger:()=>{}});
 try{const address=await server.start(),url='http://127.0.0.1:'+address.port,store=getStore({name:'categories',siteID:'test',token:'test-only',apiURL:url,edgeURL:url,uncachedEdgeURL:url,consistency:'strong'});await run(writingCategories(store),store);}finally{await server.stop();await rm(directory,{recursive:true,force:true});}
}
const create=(etag,name)=>({expectedAccount:'owner',action:'create',etag,name});
test('writing categories create and rename with stable IDs and published article assignments',()=>fixture(async(service,store)=>{
 assert.deepEqual((await service.read()).categories,DEFAULT_WRITING_CATEGORIES);
 const initial=await service.save(owner,create(null,'Regional Outlook'));
 const custom=initial.categories.at(-1);assert.match(custom.id,/^[0-9a-f-]{36}$/);
 const api=contentService(store,async()=>[],async()=>(await service.read()).categories);
 const draft={title:'Pacific outlook',date:'2026-10-29',html:'<p>Public signals</p>',writingCategory:custom.id};
 let article=await api.save(owner,'essays/pacific-outlook',{version:0,action:'publish',draft});
 const renamed=await service.save(owner,{expectedAccount:'owner',etag:initial.etag,action:'rename',id:custom.id,name:'Asia-Pacific Outlook'});
 assert.equal(renamed.categories.at(-1).id,custom.id);
 assert.equal(writingCategoryFor(await api.publicEntry(article.key)),custom.id);
 article=await api.save(owner,article.key,{version:article.version,action:'draft',draft:{...draft,writingCategory:'osint'}});
 assert.equal(writingCategoryFor(await api.publicEntry(article.key)),custom.id,'private category changes must not leak');
 await api.save(owner,article.key,{version:article.version,action:'publish',draft:article.draft});
 assert.equal(writingCategoryFor(await api.publicEntry(article.key)),'osint');
 await assert.rejects(api.save(owner,'essays/invalid',{version:0,action:'draft',draft:{...draft,writingCategory:'11111111-1111-4111-8111-111111111111'}}),e=>e.status===400);
 assert.equal(writingCategoryFor({collection:'cyber'}),'reports');
 assert.equal(writingCategoryFor({collection:'journal'}),undefined);
}));
test('category management rejects non-owner, account changes, duplicates and invalid names',()=>fixture(async service=>{
 await assert.rejects(service.save({user:{id:'owner'},isOwner:false},create(null,'New')),e=>e.status===403);
 await assert.rejects(service.save(owner,{...create(null,'New'),expectedAccount:'other'}),e=>e.status===409);
 for(const name of ['', ' ', 'All Writing', 'china series', 'x'.repeat(61),'bad\u0000name'])await assert.rejects(service.save(owner,create(null,name)),e=>e.status===400);
 assert.equal((await service.read()).etag,null);
 await assert.rejects(service.save(owner,{expectedAccount:'owner',etag:null,action:'rename',id:'missing',name:'Valid'}),e=>e.status===404);
}));
test('concurrent category writes have one winner and stale edits preserve the registry',()=>fixture(async service=>{
 const results=await Promise.allSettled([service.save(owner,create(null,'A')),service.save(owner,create(null,'B'))]);
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
 assert.equal(results.filter(r=>r.status==='rejected'&&r.reason.status===409).length,1);
 const current=await service.read();assert.equal(current.categories.length,4);
 await assert.rejects(service.save(owner,create(null,'Stale')),e=>e.status===409);
 assert.deepEqual(await service.read(),current);
}));
test('deleting categories preserves articles and redirects retired IDs through later deletions',()=>fixture(async(service,store)=>{
 let registry=await service.save(owner,create(null,'Temporary category'));
 const custom=registry.categories.at(-1).id;
 const api=contentService(store,async()=>[],async()=>(await service.read()).categories);
 const draft={title:'Keep this brief',date:'2026-10-29',html:'<p>Keep these words.</p>',writingCategory:custom};
 const article=await api.save(owner,'osint/keep',{version:0,action:'publish',draft});
 registry=await service.save(owner,{expectedAccount:'owner',etag:registry.etag,action:'delete',id:custom,replacement:'osint'});
 assert(!registry.categories.some(c=>c.id===custom));
 assert.equal(writingCategoryFor(await api.publicEntry(article.key),registry),'osint');
 assert.deepEqual(await api.get(article.key),article,'deletion must not rewrite article snapshots or versions');
 registry=await service.save(owner,{expectedAccount:'owner',etag:registry.etag,action:'delete',id:'osint',replacement:'reports'});
 assert.equal(registry.aliases[custom],'reports');
 assert.equal(writingCategoryFor(article.published,registry),'reports');
 assert.equal(writingCategoryFor({collection:'osint'},registry),'reports','legacy assignments follow deletion too');
 await assert.rejects(api.save(owner,article.key,{version:article.version,action:'draft',draft}),e=>e.status===400,'an old editor must not reintroduce a deleted category');
 registry=await service.save(owner,{expectedAccount:'owner',etag:registry.etag,action:'delete',id:'essays',replacement:'reports'});
 await assert.rejects(service.save(owner,{expectedAccount:'owner',etag:registry.etag,action:'delete',id:'reports',replacement:'reports'}),e=>e.status===400);
 assert.equal((await service.read()).categories.length,1);
}));
test('category deletion refuses invalid destinations, non-owners and stale concurrent requests',()=>fixture(async service=>{
 const change={expectedAccount:'owner',etag:null,action:'delete',id:'osint',replacement:'reports'};
 await assert.rejects(service.save({user:{id:'owner'},isOwner:false},change),e=>e.status===403);
 await assert.rejects(service.save(owner,{...change,expectedAccount:'other'}),e=>e.status===409);
 for(const replacement of ['osint','missing',undefined])await assert.rejects(service.save(owner,{...change,replacement}),e=>e.status===400);
 const results=await Promise.allSettled([service.save(owner,change),service.save(owner,{...change,id:'essays'})]);
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
 assert.equal(results.filter(r=>r.status==='rejected'&&r.reason.status===409).length,1);
 assert.equal((await service.read()).categories.length,2);
}));
