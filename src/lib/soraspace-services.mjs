// Requested services are preferences, never entitlements or payment proof.
export const SORASPACE_SERVICES=Object.freeze({
 website:Object.freeze({name:'Website & journal',description:'Guided site setup and a private editor trial.',capability:'beta.soraspace'}),
 docs:Object.freeze({name:'Documents',description:'SoraSpace Docs / Fumi.',capability:'tools.wordcraft'}),
 pdf:Object.freeze({name:'PDF tools',description:'SoraSpace PDF / Tsuzuri.',capability:'tools.pdfcraft'}),
 photos:Object.freeze({name:'Photos',description:'SoraSpace Photos / Hikari; release checks apply.',capability:'tools.lightcraft'}),
 image:Object.freeze({name:'Image editing',description:'SoraSpace Image Editor / Irodori.',capability:'tools.photocraft'})
});
export function requestedServices(value){if(!Array.isArray(value)||value.length>Object.keys(SORASPACE_SERVICES).length||value.some(id=>typeof id!=='string'||!Object.hasOwn(SORASPACE_SERVICES,id))||new Set(value).size!==value.length)throw Error('Choose listed services without duplicates.');return Object.keys(SORASPACE_SERVICES).filter(id=>value.includes(id));}
