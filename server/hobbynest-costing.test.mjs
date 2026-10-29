import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateCosting,costDefaults} from '../src/lib/hobbynest-costing.mjs';
test('unit costing separates materials, energy, machine time, labour and packaging; margin differs from markup',()=>{
 const m={...costDefaults(),filamentGrams:50,filamentPerKgCents:2500,printMinutes:120,printerWatts:100,kwhCents:30,labourMinutes:10,labourHourlyCents:2400,machineHourlyCents:100,packagingCents:100,otherCents:69};
 const q=calculateCosting(m,2000);assert.equal(q.filamentCents,125);assert.equal(q.powerCents,6);assert.equal(q.labourCents,400);assert.equal(q.machineCents,200);assert.equal(q.unitCostCents,900);assert.equal(q.suggestedPriceCents,1500);assert.equal(q.profitCents,1100);assert(Math.abs(q.marginPercent-55)<1e-8);
 assert.equal(calculateCosting({...costDefaults(),printerWatts:1000,printMinutes:60,kwhCents:30.57}).powerCents,31,'electricity tariffs support fractions of a cent per kWh');
 assert.equal(calculateCosting({...costDefaults(),otherCents:1000}).suggestedPriceCents,1667,'40% margin on $10 cost is $16.67, not a $14 markup');
});
test('failed prints affect print costs only; payment fees and GST use explicit assumptions',()=>{
 const m={...costDefaults(),filamentGrams:100,filamentPerKgCents:1000,failurePercent:20,packagingCents:100,labourMinutes:60,labourHourlyCents:1000,feePercent:2,feeFixedCents:30,unitsPerPayment:2,addGst:true,gstPercent:10};
 const q=calculateCosting(m);assert.equal(q.failureCents,25);assert.equal(q.unitCostCents,1225);assert.equal(q.fixedFeePerItemCents,15);assert(q.marginPercent>=m.targetMarginPercent-.1);assert(q.suggestedPriceCents>q.netSuggestedCents);
 const withoutFees=calculateCosting({...m,feePercent:0,feeFixedCents:0});assert(q.suggestedPriceCents>withoutFees.suggestedPriceCents);
});
test('invalid costs, impossible fee/margin combinations and unsupported prices are refused',()=>{
 assert.throws(()=>calculateCosting({...costDefaults(),filamentGrams:1000000,filamentPerKgCents:10000000},1000),/suggested price exceeds/);
 for(const changes of [{filamentGrams:-1},{targetMarginPercent:95,feePercent:20},{feeFixedCents:1.5},{addGst:'yes'},{printerWatts:Infinity},{extra:1},{unitsPerPayment:0}])assert.throws(()=>calculateCosting({...costDefaults(),...changes}));
});
