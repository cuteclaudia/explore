// Proposal only. No checkout, API, access-control or app-shell module imports this.
// Keep identifiers independent of the suite's eventual commercial name.
export const CATALOGUE_REVISION='2026-10-29-draft-1';
export const SUBSCRIPTION_POLICY=Object.freeze({
 currency:'AUD',trialDays:30,deviceLimit:5,offlineDays:30,refreshHours:24,
 paymentFailureGraceDays:7,founderPercent:25,founderAnnualPayments:1,
});
export const SUBSCRIPTION_APPS=Object.freeze({
 fumi:Object.freeze({desktop:'desktop.wordcraft',web:'tools.wordcraft'}),
 goban:Object.freeze({desktop:'desktop.goban',web:null}),
 tayori:Object.freeze({desktop:'desktop.tayori',web:null}),
 tsuzuri:Object.freeze({desktop:'desktop.pdfcraft',web:'tools.pdfcraft'}),
 hikari:Object.freeze({desktop:'desktop.lightcraft',web:'tools.lightcraft'}),
 irodori:Object.freeze({desktop:'desktop.photocraft',web:'tools.photocraft'}),
});
export const SUBSCRIPTION_BUNDLES=Object.freeze({
 office:Object.freeze({name:'Office',apps:Object.freeze(['fumi','goban','tayori']),desktop:Object.freeze({monthly:499,annual:4900}),webDesktop:Object.freeze({monthly:799,annual:7900})}),
 'office-pro':Object.freeze({name:'Office Pro',apps:Object.freeze(['fumi','goban','tayori','tsuzuri']),desktop:Object.freeze({monthly:799,annual:7900}),webDesktop:Object.freeze({monthly:1199,annual:11900})}),
 photography:Object.freeze({name:'Photography',apps:Object.freeze(['hikari','irodori']),desktop:Object.freeze({monthly:699,annual:6900}),webDesktop:Object.freeze({monthly:1099,annual:10900})}),
 complete:Object.freeze({name:'Complete',apps:Object.freeze(['fumi','goban','tayori','tsuzuri','hikari','irodori']),desktop:Object.freeze({monthly:1299,annual:12900}),webDesktop:Object.freeze({monthly:1999,annual:19900})}),
});
export function subscriptionPlan(id){
 if(typeof id!=='string')return null;
 const [bundle,tier,...extra]=id.split('.');
 if(extra.length||!Object.hasOwn(SUBSCRIPTION_BUNDLES,bundle)||!['desktop','web-desktop'].includes(tier))return null;
 return {id,bundle,tier,revision:CATALOGUE_REVISION,apps:SUBSCRIPTION_BUNDLES[bundle].apps,sellable:false};
}
// Suggested tax-inclusive AUD amounts in cents, not provider checkout quotes.
export function proposedPrice(planId,interval,{founder=false}={}){
 const plan=subscriptionPlan(planId);if(!plan||!['monthly','annual'].includes(interval))throw Error('Unknown proposed plan or interval.');
 const prices=SUBSCRIPTION_BUNDLES[plan.bundle][plan.tier==='desktop'?'desktop':'webDesktop'];
 const standard=prices[interval],discount=founder&&interval==='annual'?SUBSCRIPTION_POLICY.founderPercent:0;
 return {currency:'AUD',standard,firstPayment:Math.round(standard*(100-discount)/100),renewal:standard,discountPercent:discount,sellable:false};
}
