// Copied beside the built function by scripts/check-netlify-build.mjs.
import assert from 'node:assert/strict';
import handler from './ssr.mjs';
const response=path=>handler(new Request('https://explorebyclaudia.netlify.app'+path),{ip:'127.0.0.1'});
for(const path of ['/about','/journal','/journal/deployment-check','/chinaseries','/dailycyberreport','/osint-brief','/osint-brief/deployment-brief','/api/writing-categories','/api/hobbynest/catalogue','/photography','/rss.xml','/prototype-content.json']){
 const r=await response(path);assert.equal(r.status,200,path+' should render');const body=await r.text();assert(!body.includes('BINNED BRIEF MUST NOT LEAK')&&!body.includes('PRIVATE DRAFT MUST NOT LEAK')&&!body.includes('PRIVATE OSINT DRAFT MUST NOT LEAK'),path+' leaked a draft');
 if(path==='/osint-brief/deployment-brief')assert(body.includes('Published OSINT build-check brief'));
 if(path==='/api/hobbynest/catalogue'){const catalogue=JSON.parse(body);assert.equal(catalogue.checkoutEnabled,false);assert.deepEqual(catalogue.products,[]);}
 if(path==='/api/writing-categories')assert.deepEqual(JSON.parse(body).categories.map(c=>c.name),['China Series','Cyber Briefs','OSINT Brief']);
 if(path==='/journal/deployment-check')assert(body.includes('Published build-check body'));
 if(path==='/rss.xml')assert(body.includes('Published build-check journal'));
 if(path==='/prototype-content.json'){const content=JSON.parse(body);assert(content.essays.length>0);assert.equal(content.osint[0].category,'osint');assert.equal(content.categories.length,3);assert.equal(content.features.home.title,'Published build-check journal');assert.equal(content.features.writing.title,'Published OSINT build-check brief');assert(!content.essays.some(x=>x.href==='/chinaseries/puertochancay'));}
 console.log('PASS packaged SSR',path);
}
const oldExplore=await response('/explore?place=3');assert.equal(oldExplore.status,301);assert.equal(oldExplore.headers.get('location'),'/places?place=3');
assert.equal((await response('/osint-brief/trashed-brief')).status,404,'Category-binned article must not be public');
assert.equal((await response('/chinaseries/puertochancay')).status,404,'Unpublished legacy page must remain hidden');
for(const path of ['/studio/soraspace-admin','/studio/soraspace-editor','/studio/soraspace-setup','/studio/hobbynest','/studio/hobbynest/products/new','/studio/about','/studio','/studio/content','/apps','/studio/kobo-test','/studio/irodori-test','/apps/irodori','/apps/irodori-legacy']){const r=await response(path);assert.equal(r.status,302,path+' requires sign-in');assert(r.headers.get('location').startsWith('/studio/login'));console.log('PASS packaged auth guard',path);}
assert.equal((await response('/api/content/list')).status,401);assert.equal((await response('/api/soraspace/editor-draft')).status,401);
assert.equal((await response('/api/hobbynest/images/fixture/11111111-1111-4111-8111-111111111111?draft=1')).status,401,'Draft photos require sign-in');
assert.equal((await handler(new Request('https://explorebyclaudia.netlify.app/api/hobbynest/images',{method:'POST',body:'not-an-image'}),{ip:'127.0.0.1'})).status,401,'Product photo upload requires authentication');
assert.equal((await handler(new Request('https://explorebyclaudia.netlify.app/api/hobbynest/carrier-check',{method:'POST',headers:{Origin:'https://explorebyclaudia.netlify.app','Content-Type':'application/json'},body:'{}'}),{ip:'127.0.0.1'})).status,401,'Carrier checks require owner authentication');
assert.equal((await handler(new Request('https://explorebyclaudia.netlify.app/api/hobbynest/import?action=preview',{method:'POST',headers:{Origin:'https://explorebyclaudia.netlify.app','Content-Type':'application/json'},body:'{}'}),{ip:'127.0.0.1'})).status,401,'Spreadsheet importing requires owner authentication');
assert.equal((await response('/api/hobbynest/settings')).status,401,'Store settings require owner authentication');
for(const method of ['PUT','POST'])assert.equal((await handler(new Request('https://explorebyclaudia.netlify.app/api/hobbynest/settings',{method,headers:{Origin:'https://explorebyclaudia.netlify.app','Content-Type':'application/json'},body:'{}'}),{ip:'127.0.0.1'})).status,401,'Store edits and estimates require authentication');
assert.equal((await response('/api/content-features')).status,401,'Feature controls require owner authentication');
assert.equal((await handler(new Request('https://explorebyclaudia.netlify.app/api/writing-categories',{method:'PUT',headers:{Origin:'https://explorebyclaudia.netlify.app','Content-Type':'application/json'},body:'{}'}),{ip:'127.0.0.1'})).status,401,'Category editing requires sign-in');
assert.equal((await response('/api/apps/irodori-preview')).status,401);
assert.equal((await response('/api/apps/irodori-session')).status,401);
// A custom-domain request can have a valid browser/session API login while the
// Astro runtime has no SDK identity global. Verify the real packaged middleware
// uses the native session endpoint, not an unverified decoded cookie or claims.
const originalFetch=globalThis.fetch,originalOwner=process.env.OWNER_IDENTITY_ID;
const owner='11111111-1111-4111-8111-111111111111';let sessionStatus=200,sessionChecks=0;
process.env.OWNER_IDENTITY_ID=owner;
globalThis.fetch=async(input,options)=>{
 const url=new URL(typeof input==='string'||input instanceof URL?input:input.url);
 if(['www.claudiagilbert.com','claudiagilbert.com'].includes(url.hostname)&&url.pathname==='/api/studio/session'){
  sessionChecks++;assert.equal(options.headers.Cookie,'nf_jwt=verified-by-session-service');assert.equal(options.redirect,'error');
  return sessionStatus===200?Response.json({setupRequired:false,id:owner,email:'owner@example.test',isOwner:true,capabilities:{'settings.manage':true,'users.manage':true,'tools.photocraft':true}}):new Response(null,{status:sessionStatus});
 }
 return originalFetch(input,options);
};
try{
 for(const origin of ['https://www.claudiagilbert.com','https://claudiagilbert.com'])for(const path of ['/studio/soraspace-admin','/studio/soraspace-editor','/studio/soraspace-setup','/studio','/studio/hobbynest','/studio/downloads','/studio/account','/studio/users','/apps']){
  const r=await handler(new Request(origin+path,{headers:{Cookie:'nf_jwt=verified-by-session-service'}}),{ip:'127.0.0.1'});
  assert.equal(r.status,200,origin+path+' must recognize the verified browser session');assert.equal(r.headers.get('Cache-Control'),'private, no-store');console.log('PASS packaged custom-domain account session',origin+path);
 }
 const origin='https://www.claudiagilbert.com',ownerRequest=(path,options={})=>handler(new Request(origin+path,{...options,headers:{Cookie:'nf_jwt=verified-by-session-service',Origin:origin,...options.headers}}),{ip:'127.0.0.1'});
 const editorModel={schemaVersion:2,status:'draft',visibility:'private',siteName:'Package draft',tagline:'',brandMark:'S',footer:'',theme:{template:'folio',palette:'system',density:'compact'},homePage:'home',featuredPage:null,pages:['home','about','blog','articles','journal','galleries','contact'].map(id=>({id,title:id,enabled:id==='home',heading:id,summary:'',body:'Private packaged draft'}))};
 const editorPayload={expectedAccount:owner,etag:null,mutationId:'22222222-2222-4222-8222-222222222222',draft:editorModel};
 assert.equal((await ownerRequest('/api/soraspace/editor-draft',{method:'PUT',headers:{Origin:'https://untrusted.invalid','Content-Type':'application/json'},body:JSON.stringify(editorPayload)})).status,403);
 const editorSave=await ownerRequest('/api/soraspace/editor-draft',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(editorPayload)});assert.equal(editorSave.status,200);const editorSaved=await editorSave.json();assert.equal(editorSaved.draft.visibility,'private');assert(editorSaved.etag);assert.equal(editorSaved.publishingEnabled,false);
 assert.equal((await ownerRequest('/api/soraspace/editor-draft',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...editorPayload,mutationId:'33333333-3333-4333-8333-333333333333'})})).status,409);
 assert.equal((await ownerRequest('/api/soraspace/editor-draft',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...editorPayload,mutationId:'44444444-4444-4444-8444-444444444444',etag:editorSaved.etag,draft:{...editorModel,status:'published'}})})).status,400);
 console.log('PASS packaged owner site draft authentication, CSRF, private save, stale-version and publication refusal');
 let nest=await (await ownerRequest('/api/hobbynest/settings')).json();
 const product={id:'fixture-print',name:'Packaged photo fixture',sku:'PACKAGE-1',kind:'physical',priceCents:2000,description:'Isolated package test only',collectionIds:[],licence:'',allowBackorder:true,printMinDays:3,printMaxDays:5,dispatchMinDays:1,dispatchMaxDays:2,weightGrams:0,lengthMm:0,widthMm:0,heightMm:0};
 let saved=await ownerRequest('/api/hobbynest/settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({expectedAccount:owner,etag:nest.etag,operation:'product.save',value:product})});assert.equal(saved.status,200);nest=await saved.json();
 assert.equal((await ownerRequest('/studio/hobbynest/products/fixture-print')).status,200);assert.equal((await ownerRequest('/studio/hobbynest/products/missing')).status,404);
 const imageHeaders={'Content-Type':'image/png','X-Product-Id':product.id,'X-Store-Account':owner,'X-Store-Etag':nest.etag,'X-Image-Alt':'Blue%20printed%20piece'};
 assert.equal((await ownerRequest('/api/hobbynest/images',{method:'POST',headers:{...imageHeaders,Origin:'https://untrusted.invalid'},body:Buffer.from(process.env.HOBBY_NEST_TEST_IMAGE,'base64')})).status,403,'Cross-origin photo uploads must be refused');
 const uploaded=await ownerRequest('/api/hobbynest/images',{method:'POST',headers:imageHeaders,body:Buffer.from(process.env.HOBBY_NEST_TEST_IMAGE,'base64')});assert.equal(uploaded.status,200,await uploaded.clone().text());nest=await uploaded.json();const photo=nest.products[0].draft.images[0];
 assert.equal((await ownerRequest(photo.url+'?draft=1')).headers.get('Content-Type'),'image/webp','The packaged native image decoder must work');assert.equal((await response(photo.url)).status,404,'An unpublished photo stays private');
 saved=await ownerRequest('/api/hobbynest/settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({expectedAccount:owner,etag:nest.etag,operation:'product.publish',value:{id:product.id}})});assert.equal(saved.status,200);assert.equal((await response(photo.url)).status,200);
 nest=await (await ownerRequest('/api/hobbynest/settings')).json();const importInput={expectedAccount:owner,etag:nest.etag,importId:'66666666-6666-4666-8666-666666666666',options:{updateExisting:false,openingStock:false},rows:[{row:2,fields:{sku:'PKG-IMPORT-1',name:'Imported build-check product',kind:'physical',price:'12.95'}}]};
 const planned=await ownerRequest('/api/hobbynest/import?action=preview',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(importInput)});assert.equal(planned.status,200);const preview=await planned.json();assert.equal(preview.errors.length,0);assert.equal(preview.counts.create,1);const applied=await ownerRequest('/api/hobbynest/import?action=apply',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...importInput,previewHash:preview.previewHash})});assert.equal(applied.status,200);assert.equal((await applied.json()).applied,true);
 assert.equal((await (await response('/api/hobbynest/catalogue')).json()).products.length,1,'Importing a draft must not publish it');
 console.log('PASS packaged HobbyNest product pages, owner image upload/native decode, import preview/apply, CSRF and publication boundary');
 const check=()=>handler(new Request('https://www.claudiagilbert.com/studio/downloads',{headers:{Cookie:'nf_jwt=verified-by-session-service'}}),{ip:'127.0.0.1'});
 sessionStatus=401;let r=await check();assert.equal(r.status,302);assert(new URL(r.headers.get('location'),'https://www.claudiagilbert.com').searchParams.get('reason')==='session');
 sessionStatus=403;assert.equal((await check()).status,403);
 sessionStatus=503;r=await check();assert.equal(r.status,503);assert(!r.headers.has('location'),'Identity outages must not redirect to login and loop');assert(sessionChecks>=13);
 console.log('PASS packaged expired/revoked/unavailable sessions fail closed without an automatic login loop');
}finally{globalThis.fetch=originalFetch;if(originalOwner===undefined)delete process.env.OWNER_IDENTITY_ID;else process.env.OWNER_IDENTITY_ID=originalOwner;}
console.log('PASS isolated deploy package: require(ESM) disabled, public SSR/RSS, private guards, published snapshots and legacy unpublish.');
