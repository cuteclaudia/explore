// Private site configuration only. No public routes, raw HTML or remote assets.
import {SITE_PAGES,SITE_TEMPLATES,SITE_PALETTES,validateSiteAnswers} from './soraspace-site-setup.mjs';
export class SiteEditorError extends Error{constructor(message){super(message);this.name='SiteEditorError';}}
const fail=message=>{throw new SiteEditorError(message);};
const object=(value,keys)=>{if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!keys.includes(k)))fail('Use the supported site draft fields.');};
function text(value,max,required=false){if(typeof value!=='string'||[...value].length>max||/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value)||required&&!value.trim())fail('Check the text lengths and required names.');return value.trim();}
export function editableSiteFromSetup(input){
 const a=validateSiteAnswers(input);
 return validateEditableSite({schemaVersion:2,status:'draft',visibility:'private',siteName:a.siteName,tagline:a.tagline,brandMark:'空',footer:'',theme:{template:a.template,palette:a.palette,density:a.density},homePage:'home',featuredPage:null,pages:Object.entries(SITE_PAGES).map(([id,title])=>({id,title,enabled:a.pages.includes(id),heading:id==='home'?a.siteName:title,summary:'',body:id==='home'?a.introduction:''}))});
}
export function validateEditableSite(input){
 object(input,['schemaVersion','status','visibility','siteName','tagline','brandMark','footer','theme','homePage','featuredPage','pages']);
 if(input.schemaVersion!==2||input.status!=='draft'||input.visibility!=='private')fail('Only private, unpublished editor drafts can be loaded here.');
 object(input.theme,['template','palette','density']);
 if(!Object.hasOwn(SITE_TEMPLATES,input.theme.template)||!Object.hasOwn(SITE_PALETTES,input.theme.palette)||!['compact','comfortable'].includes(input.theme.density))fail('Choose a supported template, palette and density.');
 if(!Array.isArray(input.pages)||input.pages.length!==Object.keys(SITE_PAGES).length)fail('Keep each standard page exactly once.');
 const seen=new Set();const pages=input.pages.map(p=>{
  object(p,['id','title','enabled','heading','summary','body']);
  if(typeof p.id!=='string'||!Object.hasOwn(SITE_PAGES,p.id)||seen.has(p.id)||typeof p.enabled!=='boolean')fail('Keep each standard page exactly once.');seen.add(p.id);
  return {id:p.id,title:text(p.title,32,true),enabled:p.enabled,heading:text(p.heading,100),summary:text(p.summary,240),body:text(p.body,3000)};
 });
 const enabled=pages.filter(p=>p.enabled),labels=enabled.map(p=>p.title.toLocaleLowerCase('en-AU'));
 if(!enabled.length||new Set(labels).size!==labels.length)fail('Enable at least one page and use distinct navigation names.');
 if(!enabled.some(p=>p.id===input.homePage))fail('Choose an enabled page as your homepage.');
 if(input.featuredPage!==null&&!enabled.some(p=>p.id===input.featuredPage))fail('Choose an enabled featured page, or no highlight.');
 const result={schemaVersion:2,status:'draft',visibility:'private',siteName:text(input.siteName,80,true),tagline:text(input.tagline,160),brandMark:text(input.brandMark,4),footer:text(input.footer,160),theme:{...input.theme},homePage:input.homePage,featuredPage:input.featuredPage,pages};
 if(new TextEncoder().encode(JSON.stringify(result)).length>60000)fail('This site draft exceeds the supported size.');return result;
}
export function readSiteDraftExport(input){
 object(input,['format','schemaVersion','answers','draft']);
 if(input.format!=='soraspace-site-draft')fail('Choose a SoraSpace site draft export.');
 if(input.schemaVersion===1)return editableSiteFromSetup(input.answers);
 if(input.schemaVersion===2)return validateEditableSite(input.draft);
 fail('This draft version is not supported.');
}
