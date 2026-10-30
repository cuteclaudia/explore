// Shared, deterministic draft generator. No provisioning, publishing or network I/O.
function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
export const SITE_PAGES=freeze({home:'Home',about:'About',blog:'Blog',articles:'Articles',journal:'Journal',galleries:'Galleries',contact:'Contact'});
export const SITE_TEMPLATES=freeze({
 folio:{name:'Folio',description:'A clear introduction with space for research, articles and projects.'},
 editorial:{name:'Editorial',description:'Writing first, with a featured introduction and a compact reading list.'},
 horizon:{name:'Horizon',description:'A visual introduction with room for galleries and creative work.'},
 practice:{name:'Practice',description:'A focused introduction for independent businesses and professional services.'},
 canvas:{name:'Canvas',description:'A simple, flexible personal space with a compact collection of pages.'}
});
export const SITE_PALETTES=freeze({system:{name:'System',accent:'Highlight',wash:'ButtonFace'},moss:{name:'Moss',accent:'#36594a',wash:'#e7eee9'},ink:{name:'Ink',accent:'#344e72',wash:'#e8edf5'},clay:{name:'Clay',accent:'#854a36',wash:'#f4e9e3'}});
export const SITE_PURPOSES=freeze({
 student:{name:'Study & projects',description:'Introduce yourself and share coursework or projects.',pages:['home','about','articles'],template:'folio'},
 academic:{name:'Research & academic work',description:'Present your interests, articles and ways to get in touch.',pages:['home','about','articles','contact'],template:'folio'},
 writer:{name:'Writing & blogging',description:'Give your writing a home and help readers find what is new.',pages:['home','about','blog','contact'],template:'editorial'},
 creative:{name:'Photography & creative work',description:'Show your work through a visual portfolio.',pages:['home','about','galleries','contact'],template:'horizon'},
 business:{name:'A business or independent practice',description:'Introduce your work and help people contact you.',pages:['home','about','contact'],template:'practice'},
 personal:{name:'A personal space',description:'Start simply, then add pages as your interests grow.',pages:['home','about','blog'],template:'canvas'}
});
export class SiteSetupError extends Error{constructor(field,message){super(message);this.name='SiteSetupError';this.field=field;}}
function text(value,key,max,required=false){
 if(typeof value!=='string'||[...value].length>max||/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value)||required&&!value.trim())throw new SiteSetupError(key,`Enter ${required?'1–':'up to '}${max} characters for ${key==='siteName'?'your site name':key}.`);
 return value.trim();
}
export function recommendedSiteAnswers(purpose='personal'){
 if(!Object.hasOwn(SITE_PURPOSES,purpose))throw new SiteSetupError('purpose','Choose a site purpose.');
 const preset=SITE_PURPOSES[purpose];return {purpose,pages:[...preset.pages],template:preset.template,palette:'system',density:'compact',siteName:'',tagline:'',introduction:''};
}
export function validateSiteAnswers(input){
 const keys=['purpose','pages','template','palette','density','siteName','tagline','introduction'];
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(key=>!keys.includes(key)))throw new SiteSetupError('setup','Use the supported site setup fields.');
 for(const [field,catalogue] of [['purpose',SITE_PURPOSES],['template',SITE_TEMPLATES],['palette',SITE_PALETTES]])if(typeof input[field]!=='string'||!Object.hasOwn(catalogue,input[field]))throw new SiteSetupError(field,'Choose a listed '+field+'.');
 if(!['compact','comfortable'].includes(input.density))throw new SiteSetupError('density','Choose a layout density.');
 if(!Array.isArray(input.pages)||input.pages.length>Object.keys(SITE_PAGES).length||input.pages.some(id=>typeof id!=='string'||!Object.hasOwn(SITE_PAGES,id))||new Set(input.pages).size!==input.pages.length||!input.pages.includes('home'))throw new SiteSetupError('pages','Choose listed pages, including Home, without duplicates.');
 return {purpose:input.purpose,pages:Object.keys(SITE_PAGES).filter(id=>input.pages.includes(id)),template:input.template,palette:input.palette,density:input.density,siteName:text(input.siteName,'siteName',80,true),tagline:text(input.tagline??'','tagline',160),introduction:text(input.introduction??'','introduction',500)};
}
export function createSiteDraft(input){
 const answers=validateSiteAnswers(input);
 const pages=Object.entries(SITE_PAGES).map(([id,title])=>({id,title,enabled:answers.pages.includes(id),status:'draft',sections:id==='home'?[{type:'introduction',heading:answers.siteName,text:answers.introduction},...answers.pages.filter(page=>!['home','about','contact'].includes(page)).map(page=>({type:'collection',page,heading:SITE_PAGES[page]}))]:id==='about'?[{type:'text',heading:'About',text:''}]:[{type:'collection',page:id,heading:title}]}));
 return {schemaVersion:1,status:'draft',visibility:'private',siteName:answers.siteName,tagline:answers.tagline,theme:{template:answers.template,palette:answers.palette,density:answers.density},homePage:'home',navigation:pages.filter(page=>page.enabled).map(({id,title})=>({page:id,label:title})),pages};
}
