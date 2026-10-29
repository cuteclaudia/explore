export const COST_FIELDS=[
 ['filamentGrams','Filament used incl. supports (g)',0,1000000,'quantity'],['filamentPerKgCents','Filament price per kg (AUD)',0,10000000,'money'],
 ['printMinutes','Print time (minutes)',0,100000,'quantity'],['printerWatts','Average printer draw (watts)',0,100000,'quantity'],['kwhCents','Electricity per kWh (AUD)',0,100000,'rate'],
 ['labourMinutes','Hands-on labour (minutes)',0,100000,'quantity'],['labourHourlyCents','Labour per hour (AUD)',0,10000000,'money'],['machineHourlyCents','Printer wear / overhead per hour (AUD)',0,1000000,'money'],
 ['packagingCents','Packaging per item (AUD)',0,10000000,'money'],['otherCents','Other per-item costs (AUD)',0,10000000,'money'],
 ['failurePercent','Failed-print allowance (%)',0,90,'percent'],['targetMarginPercent','Target margin after fees (%)',0,95,'percent'],['feePercent','Payment fee (%)',0,20,'percent'],['feeFixedCents','Fixed fee per payment (AUD)',0,100000,'money'],['unitsPerPayment','Items sharing fixed fee',1,100,'integer'],['gstPercent','GST allowance (%)',0,30,'percent'],
];
export const costDefaults=()=>Object.fromEntries([...COST_FIELDS.map(([key])=>[key,key==='targetMarginPercent'?40:key==='unitsPerPayment'?1:key==='gstPercent'?10:0]),['addGst',false]]);
export function validateCosting(input){
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!COST_FIELDS.some(([field])=>field===k)&&k!=='addGst'))throw Error('Invalid costing fields.');
 const model={};for(const [key,label,min,max,unit] of COST_FIELDS){const v=input[key];if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max||['money','integer'].includes(unit)&&!Number.isSafeInteger(v)||Math.abs(v*100-Math.round(v*100))>1e-6)throw Error(`Check ${label}.`);model[key]=v;}
 if(typeof input.addGst!=='boolean')throw Error('Choose whether to add a GST allowance.');model.addGst=input.addGst;
 if(model.targetMarginPercent+model.feePercent>=100)throw Error('Target margin plus percentage fee must be below 100%.');return model;
}
export function calculateCosting(input,actualPriceCents){
 const m=validateCosting(input),filamentCents=Math.ceil(m.filamentGrams*m.filamentPerKgCents/1000),powerCents=Math.ceil(m.printerWatts/1000*m.printMinutes/60*m.kwhCents),machineCents=Math.ceil(m.printMinutes/60*m.machineHourlyCents),labourCents=Math.ceil(m.labourMinutes/60*m.labourHourlyCents),printBase=filamentCents+powerCents+machineCents,failureCents=Math.ceil(printBase*m.failurePercent/(100-m.failurePercent)),fixedFeePerItemCents=Math.ceil(m.feeFixedCents/m.unitsPerPayment),unitCostCents=printBase+failureCents+labourCents+m.packagingCents+m.otherCents;
 const gstMultiplier=m.addGst?1+m.gstPercent/100:1,denominator=1-m.targetMarginPercent/100-m.feePercent/100*gstMultiplier;
 if(denominator<=0)throw Error('Margin and payment fees leave no room for a selling price.');
 const correctedNet=Math.ceil((unitCostCents+fixedFeePerItemCents+(m.feePercent>0?1:0))/denominator),correctedGross=Math.ceil(correctedNet*gstMultiplier);
 if(!Number.isSafeInteger(correctedGross)||correctedGross>10000000)throw Error('The suggested price exceeds the supported AUD 100,000 limit.');
 const price=actualPriceCents??correctedGross;if(!Number.isSafeInteger(price)||price<0||price>10000000)throw Error('The calculated or entered price exceeds the supported AUD 100,000 limit.');
 const netRevenueCents=price/gstMultiplier,feeCents=Math.ceil(price*m.feePercent/100)+fixedFeePerItemCents,profitCents=Math.floor(netRevenueCents-unitCostCents-feeCents),marginPercent=netRevenueCents?profitCents/netRevenueCents*100:null;
 return {filamentCents,powerCents,machineCents,labourCents,failureCents,packagingCents:m.packagingCents,otherCents:m.otherCents,unitCostCents,fixedFeePerItemCents,suggestedPriceCents:correctedGross,netSuggestedCents:correctedNet,actualPriceCents:price,netRevenueCents:Math.floor(netRevenueCents),feeCents,profitCents,marginPercent};
}
