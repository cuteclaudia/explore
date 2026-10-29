// Copied beside the built function by scripts/check-netlify-build.mjs.
import assert from 'node:assert/strict';
import handler from './ssr.mjs';
const response=path=>handler(new Request('https://explorebyclaudia.netlify.app'+path),{ip:'127.0.0.1'});
for(const path of ['/about','/journal','/journal/deployment-check','/chinaseries','/dailycyberreport','/osint-brief','/osint-brief/deployment-brief','/api/writing-categories','/photography','/rss.xml','/prototype-content.json']){
 const r=await response(path);assert.equal(r.status,200,path+' should render');const body=await r.text();assert(!body.includes('BINNED BRIEF MUST NOT LEAK')&&!body.includes('PRIVATE DRAFT MUST NOT LEAK')&&!body.includes('PRIVATE OSINT DRAFT MUST NOT LEAK'),path+' leaked a draft');
 if(path==='/osint-brief/deployment-brief')assert(body.includes('Published OSINT build-check brief'));
 if(path==='/api/writing-categories')assert.deepEqual(JSON.parse(body).categories.map(c=>c.name),['China Series','Cyber Briefs','OSINT Brief']);
 if(path==='/journal/deployment-check')assert(body.includes('Published build-check body'));
 if(path==='/rss.xml')assert(body.includes('Published build-check journal'));
 if(path==='/prototype-content.json'){const content=JSON.parse(body);assert(content.essays.length>0);assert.equal(content.osint[0].category,'osint');assert.equal(content.categories.length,3);assert.equal(content.features.home.title,'Published build-check journal');assert.equal(content.features.writing.title,'Published OSINT build-check brief');assert(!content.essays.some(x=>x.href==='/chinaseries/puertochancay'));}
 console.log('PASS packaged SSR',path);
}
const oldExplore=await response('/explore?place=3');assert.equal(oldExplore.status,301);assert.equal(oldExplore.headers.get('location'),'/places?place=3');
assert.equal((await response('/osint-brief/trashed-brief')).status,404,'Category-binned article must not be public');
assert.equal((await response('/chinaseries/puertochancay')).status,404,'Unpublished legacy page must remain hidden');
for(const path of ['/studio/about','/studio','/studio/content','/apps','/studio/kobo-test','/studio/irodori-test','/apps/irodori','/apps/irodori-legacy']){const r=await response(path);assert.equal(r.status,302,path+' requires sign-in');assert(r.headers.get('location').startsWith('/studio/login'));console.log('PASS packaged auth guard',path);}
assert.equal((await response('/api/content/list')).status,401);
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
 for(const origin of ['https://www.claudiagilbert.com','https://claudiagilbert.com'])for(const path of ['/studio','/studio/downloads','/studio/account','/studio/users','/apps']){
  const r=await handler(new Request(origin+path,{headers:{Cookie:'nf_jwt=verified-by-session-service'}}),{ip:'127.0.0.1'});
  assert.equal(r.status,200,origin+path+' must recognize the verified browser session');assert.equal(r.headers.get('Cache-Control'),'private, no-store');console.log('PASS packaged custom-domain account session',origin+path);
 }
 const check=()=>handler(new Request('https://www.claudiagilbert.com/studio/downloads',{headers:{Cookie:'nf_jwt=verified-by-session-service'}}),{ip:'127.0.0.1'});
 sessionStatus=401;let r=await check();assert.equal(r.status,302);assert(new URL(r.headers.get('location'),'https://www.claudiagilbert.com').searchParams.get('reason')==='session');
 sessionStatus=403;assert.equal((await check()).status,403);
 sessionStatus=503;r=await check();assert.equal(r.status,503);assert(!r.headers.has('location'),'Identity outages must not redirect to login and loop');assert(sessionChecks>=13);
 console.log('PASS packaged expired/revoked/unavailable sessions fail closed without an automatic login loop');
}finally{globalThis.fetch=originalFetch;if(originalOwner===undefined)delete process.env.OWNER_IDENTITY_ID;else process.env.OWNER_IDENTITY_ID=originalOwner;}
console.log('PASS isolated deploy package: require(ESM) disabled, public SSR/RSS, private guards, published snapshots and legacy unpublish.');
