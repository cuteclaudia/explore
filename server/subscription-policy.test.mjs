import test from 'node:test';
import assert from 'node:assert/strict';
import {CAPABILITIES} from './access.mjs';
import {CATALOGUE_REVISION,SUBSCRIPTION_APPS,SUBSCRIPTION_BUNDLES,subscriptionPlan,proposedPrice} from './subscription-catalogue.mjs';
import {evaluateSubscriptionAccess,proposedDesktopTicketEnd} from './subscription-policy.mjs';
const now=Date.parse('2026-10-29T00:00:00.000Z'),day=86400000,iso=n=>new Date(n).toISOString();
const account={id:'alice',verified:true,owner:false,suspended:false};
const rollout=Object.fromEntries(Object.keys(SUBSCRIPTION_APPS).map(id=>[id,{desktop:true,web:true}]));
const paid=(extra={})=>({id:'paid-1',accountId:'alice',state:'active',kind:'subscription',startsAt:iso(now-day),endsAt:iso(now+10*day),planId:'photography.desktop',catalogueRevision:CATALOGUE_REVISION,...extra});
const manual=(extra={})=>({id:'manual-1',accountId:'alice',state:'active',kind:'manual',startsAt:iso(now-day),endsAt:null,apps:['fumi','tsuzuri'],tier:'web-desktop',...extra});
const evaluate=(extra={})=>evaluateSubscriptionAccess({account,grants:[paid()],rollout,now,...extra});
test('proposed prices remain disabled and first-year annual discount never repeats in the renewal amount',()=>{
 assert.deepEqual(proposedPrice('complete.web-desktop','annual',{founder:true}),{currency:'AUD',standard:19900,firstPayment:14925,renewal:19900,discountPercent:25,sellable:false});
 assert.equal(proposedPrice('complete.desktop','annual',{founder:true}).firstPayment,9675);
 assert.equal(proposedPrice('office.desktop','monthly',{founder:true}).discountPercent,0);
 assert.equal(subscriptionPlan('complete.web-desktop').sellable,false);
 for(const bundle of Object.values(SUBSCRIPTION_BUNDLES))for(const id of bundle.apps)assert(Object.hasOwn(SUBSCRIPTION_APPS,id));
 assert.equal(subscriptionPlan('__proto__.desktop'),null);assert.throws(()=>proposedPrice('missing.desktop','annual'));
});
test('desktop plans do not grant web; web plans include registered desktop apps without inventing routes',()=>{
 const desktop=evaluate();assert(desktop.apps.hikari.desktop);assert.equal(desktop.apps.hikari.web,false);
 const web=evaluate({grants:[paid({planId:'office-pro.web-desktop'})]});
 assert(web.apps.fumi.web&&web.apps.fumi.desktop&&web.apps.tsuzuri.web&&web.apps.tsuzuri.desktop);
 assert(web.apps.goban.desktop&&web.apps.tayori.desktop);assert.equal(web.apps.goban.web,false);assert.equal(web.apps.tayori.web,false);
 for(const capability of Object.keys(web.capabilities))assert(Object.hasOwn(CAPABILITIES,capability));
 assert(!Object.hasOwn(web.capabilities,'settings.manage'));assert(!Object.hasOwn(web.capabilities,'files.publish'));
});
test('paid expiry leaves independent manual grants and overlapping paid bundles intact',()=>{
 const access=evaluate({grants:[paid({endsAt:iso(now)}),manual(),paid({id:'paid-2',planId:'photography.web-desktop',endsAt:iso(now+day)})]});
 assert(access.apps.fumi.web&&access.apps.tsuzuri.web&&access.apps.hikari.web);
 const expired=evaluate({grants:[paid({state:'revoked'}),manual()]});assert(expired.apps.fumi.web);assert.equal(expired.apps.hikari.desktop,false);
 assert.equal(expired.apps.fumi.desktopUntil,null,'permanent manual grant has no commercial expiry');
});
test('unverified or suspended ordinary accounts receive no grants; per-app blocks override all ordinary sources',()=>{
 for(const changed of [{verified:false},{suspended:true}])assert.equal(Object.keys(evaluate({account:{...account,...changed},grants:[paid(),manual()]}).capabilities).length,0);
 const blocked=evaluate({grants:[paid({planId:'complete.web-desktop'}),manual()],blockedApps:['fumi']});assert.equal(blocked.apps.fumi.web,false);assert.equal(blocked.apps.fumi.desktop,false);assert(blocked.apps.hikari.web);
 const owner=evaluate({account:{...account,owner:true,suspended:true},grants:[],blockedApps:['fumi']});assert(owner.apps.fumi.web);assert(!Object.hasOwn(owner.capabilities,'users.manage'),'this prototype emits app rights only');
});
test('unknown plans, forged scope, wrong accounts, malformed periods and duplicate ledger IDs fail closed',()=>{
 const invalid=[paid({accountId:'bob'}),paid({planId:'unknown.desktop'}),paid({catalogueRevision:'future'}),paid({state:'checkout-success'}),paid({endsAt:null}),paid({startsAt:iso(now+day)}),paid({endsAt:'2026-02-31T00:00:00.000Z'}),manual({apps:['settings.manage']}),manual({tier:'all'}),manual({kind:'browser-profile'})];
 for(const grant of invalid)assert.equal(evaluate({grants:[grant]}).status,'no-access');
 assert.equal(evaluate({grants:[paid(),paid()]}).status,'no-access');
 assert.throws(()=>evaluate({now:NaN}));
});
test('trial lasts at most 30 days and exact expiry removes editing',()=>{
 const trial={...manual({id:'trial',kind:'trial',endsAt:iso(now+100*day)}),startsAt:iso(now-29*day)};
 const access=evaluate({grants:[trial]});assert.equal(access.apps.fumi.desktopUntil,iso(now+day));
 assert.equal(proposedDesktopTicketEnd(access,'fumi',now),iso(now+day));
 assert.equal(evaluate({grants:[trial],now:now+day}).status,'no-access');
});
test('ticket expiry follows the requested app, paid period and 30-day offline cap, not a different bundle',()=>{
 const access=evaluate({grants:[paid({endsAt:iso(now+day)}),manual()]});
 assert.equal(proposedDesktopTicketEnd(access,'hikari',now),iso(now+day));
 assert.equal(proposedDesktopTicketEnd(access,'fumi',now),iso(now+30*day));
 assert.equal(proposedDesktopTicketEnd(evaluate({grants:[]}), 'hikari',now),null);
 assert.equal(proposedDesktopTicketEnd(access,'settings.manage',now),null);
});
test('rollout gates default off and grant evaluation is independent of array order',()=>{
 assert.equal(evaluate({rollout:{}}).status,'no-access');
 const grants=[paid(),manual(),paid({id:'longer',endsAt:iso(now+20*day),planId:'photography.web-desktop'})];
 assert.deepEqual(evaluate({grants}),evaluate({grants:[...grants].reverse()}),'same grant union must yield the same result');
});
