// Copied beside the built function by scripts/check-netlify-build.mjs.
import assert from 'node:assert/strict';
import handler from './ssr.mjs';
const response=path=>handler(new Request('https://explorebyclaudia.netlify.app'+path),{ip:'127.0.0.1'});
for(const path of ['/about','/journal','/journal/deployment-check','/chinaseries','/dailycyberreport','/photography','/rss.xml','/prototype-content.json']){
 const r=await response(path);assert.equal(r.status,200,path+' should render');const body=await r.text();assert(!body.includes('PRIVATE DRAFT MUST NOT LEAK'),path+' leaked a draft');
 if(path==='/journal/deployment-check')assert(body.includes('Published build-check body'));
 if(path==='/rss.xml')assert(body.includes('Published build-check journal'));
 if(path==='/prototype-content.json'){const content=JSON.parse(body);assert(content.essays.length>0);assert(!content.essays.some(x=>x.href==='/chinaseries/puertochancay'));}
 console.log('PASS packaged SSR',path);
}
assert.equal((await response('/chinaseries/puertochancay')).status,404,'Unpublished legacy page must remain hidden');
for(const path of ['/studio/about','/studio','/studio/content','/apps','/studio/kobo-test','/studio/irodori-test']){const r=await response(path);assert.equal(r.status,302,path+' requires sign-in');assert(r.headers.get('location').startsWith('/studio/login'));console.log('PASS packaged auth guard',path);}
assert.equal((await response('/api/content/list')).status,401);
assert.equal((await response('/api/apps/irodori-preview')).status,401);
console.log('PASS isolated deploy package: require(ESM) disabled, public SSR/RSS, private guards, published snapshots and legacy unpublish.');
