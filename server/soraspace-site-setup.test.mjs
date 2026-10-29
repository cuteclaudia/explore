import test from 'node:test';
import assert from 'node:assert/strict';
import {SITE_PAGES,SITE_PURPOSES,SITE_TEMPLATES,recommendedSiteAnswers,validateSiteAnswers,createSiteDraft} from '../src/lib/soraspace-site-setup.mjs';
const input=extra=>({...recommendedSiteAnswers('academic'),siteName:'Research by Alex',...extra});
test('each purpose produces an editable private draft with only the selected navigation and no invented work',()=>{
 for(const purpose of Object.keys(SITE_PURPOSES)){
  const answers=input({...recommendedSiteAnswers(purpose),siteName:'My site'}),draft=createSiteDraft(answers);
  assert.equal(draft.status,'draft');assert.equal(draft.visibility,'private');assert.equal(draft.homePage,'home');
  assert.deepEqual(draft.navigation.map(n=>n.page),answers.pages);
  assert(draft.pages.every(p=>p.status==='draft'));assert(!draft.pages.find(p=>p.id==='journal').enabled);
  assert(!JSON.stringify(draft).includes('published'));assert(!Object.hasOwn(draft,'domain'));
 }
});
test('page selection and style are independent of recommended purpose; later regeneration preserves explicit choices',()=>{
 const answers=input({pages:['journal','home'],template:'horizon',palette:'clay',density:'comfortable'});
 const before=JSON.stringify(answers),draft=createSiteDraft(answers);
 assert.deepEqual(draft.navigation.map(n=>n.page),['home','journal']);assert.equal(draft.theme.template,'horizon');
 assert.equal(draft.pages.find(p=>p.id==='articles').enabled,false);assert.equal(draft.pages.find(p=>p.id==='journal').status,'draft');
 assert.equal(JSON.stringify(answers),before);assert.deepEqual(createSiteDraft(answers),draft);
});
test('site setup rejects forged publication, identity, domain, CSS and page values',()=>{
 const invalid=[{published:true},{workspaceId:'other-customer'},{domain:'other.example'},{palette:'url(https://example.test)'},{template:'__proto__'},{purpose:'constructor'},{pages:['home','shop']},{pages:['home','home']},{pages:['articles']},{siteName:''},{siteName:'X'.repeat(81)},{siteName:'Bad\0name'},{introduction:'X'.repeat(501)},JSON.parse('{"__proto__":{"published":true}}')];
 for(const change of invalid)assert.throws(()=>createSiteDraft(input(change)),/./);
 assert.throws(()=>recommendedSiteAnswers('__proto__'));
});
test('user text stays plain data; defaults and catalogue cannot be mutated by an earlier customer',()=>{
 const title='<img src=x onerror=alert(1)>',draft=createSiteDraft(input({siteName:title}));
 assert.equal(draft.siteName,title);assert.equal(draft.pages[0].sections[0].heading,title);
 const one=recommendedSiteAnswers('student');one.pages.push('journal');assert(!recommendedSiteAnswers('student').pages.includes('journal'));
 assert.throws(()=>SITE_PURPOSES.student.pages.push('journal'));assert(Object.isFrozen(SITE_PAGES));
 assert.equal(validateSiteAnswers(input({siteName:'  A site  '})).siteName,'A site');
});

test('all five starter templates preserve selected pages and private draft status',()=>{
 assert.equal(Object.keys(SITE_TEMPLATES).length,5);
 for(const template of Object.keys(SITE_TEMPLATES)){
  const draft=createSiteDraft(input({template,pages:['home','articles','journal']}));
  assert.equal(draft.theme.template,template);assert.equal(draft.visibility,'private');
  assert.deepEqual(draft.navigation.map(item=>item.page),['home','articles','journal']);
 }
 assert.equal(recommendedSiteAnswers('business').template,'practice');
 assert.equal(recommendedSiteAnswers('personal').template,'canvas');
});
