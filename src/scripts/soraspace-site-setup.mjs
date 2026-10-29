import {SITE_TEMPLATES,SITE_PALETTES,recommendedSiteAnswers,validateSiteAnswers,createSiteDraft} from '../lib/soraspace-site-setup.mjs';
const root=document.getElementById('site-setup');
if(root){
 const form=root.querySelector('form'),steps=[...root.querySelectorAll('[data-step]')],back=root.querySelector('#setup-back'),next=root.querySelector('#setup-next'),status=root.querySelector('#setup-status'),preview=root.querySelector('#setup-preview');
 let step=0,pagesEdited=false,templateEdited=false,draft=null;
 const selected=name=>form.querySelector(`input[name="${name}"]:checked`)?.value;
 function answers(){const data=new FormData(form);return {purpose:selected('purpose'),pages:['home',...data.getAll('pages').filter(id=>id!=='home')],template:selected('template'),palette:selected('palette'),density:selected('density'),siteName:data.get('siteName'),tagline:data.get('tagline'),introduction:data.get('introduction')};}
 function show(index,focus=true){
  step=index;steps.forEach((section,i)=>section.hidden=i!==step);
  root.querySelectorAll('[data-progress]').forEach((item,i)=>{if(i===step)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');});
  back.hidden=step===0;next.hidden=step===3;next.textContent=step===2?'Generate draft →':'Continue →';root.querySelector('#setup-step-count').textContent=`Step ${step+1} of 4`;status.textContent='';
  if(focus)steps[step].querySelector('h2').focus();
 }
 function suggestions(){
  const preset=recommendedSiteAnswers(selected('purpose'));
  if(!pagesEdited)form.querySelectorAll('[name=pages]').forEach(input=>input.checked=preset.pages.includes(input.value));
  if(!templateEdited)form.querySelectorAll('[name=template]').forEach(input=>input.checked=input.value===preset.template);
 }
 form.addEventListener('change',event=>{if(event.target.name==='pages')pagesEdited=true;if(event.target.name==='template')templateEdited=true;if(event.target.name==='purpose')suggestions();});
 const element=(tag,text)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;};
 function render(){
  preview.replaceChildren();const site=element('div');site.className='draft-preview';site.dataset.template=draft.theme.template;site.dataset.palette=draft.theme.palette;site.dataset.density=draft.theme.density;
  const nav=element('nav');nav.setAttribute('aria-label','Example site navigation');nav.append(element('strong',draft.siteName));for(const entry of draft.navigation)nav.append(element('span',entry.label));
  const hero=element('div');hero.className='draft-hero';hero.append(element('small','UNPUBLISHED DRAFT'),element('h3',draft.siteName));if(draft.tagline)hero.append(element('p',draft.tagline));hero.append(element('p',draft.pages[0].sections[0].text||'Your introduction goes here.'));
  const sections=element('div');sections.className='draft-sections';for(const page of draft.pages.filter(p=>p.enabled&&p.id!=='home')){const card=element('article');card.append(element('h4',page.title),element('p',page.id==='journal'?'No entries are published. Choose individual entries later.':page.id==='contact'?'Add your contact details when ready.':`Add your ${page.id==='about'?'introduction':page.title.toLowerCase()} when ready.`));sections.append(card);}
  site.append(nav,hero,sections);preview.append(site);root.querySelector('#setup-summary').textContent=`${SITE_TEMPLATES[draft.theme.template].name} · ${SITE_PALETTES[draft.theme.palette].name} · ${draft.navigation.length} page${draft.navigation.length===1?'':'s'}. Nothing is published.`;
 }
 form.addEventListener('submit',event=>{
  event.preventDefault();if(step<2){show(step+1);return;}
  try{draft=createSiteDraft(answers());render();show(3);}catch(error){status.textContent=error.message;const field=form.elements.namedItem(error.field);if(field&&typeof field.focus==='function'){field.setAttribute('aria-invalid','true');field.setAttribute('aria-describedby','setup-status');field.focus();}}
 });
 form.addEventListener('input',event=>{if(event.target.hasAttribute('aria-invalid')){event.target.removeAttribute('aria-invalid');event.target.removeAttribute('aria-describedby');}status.textContent='';});
 back.addEventListener('click',()=>show(Math.max(0,step-1)));
 root.querySelector('#setup-download').addEventListener('click',()=>{
  try{
   const data=validateSiteAnswers(answers()),generated=createSiteDraft(data),url=URL.createObjectURL(new Blob([JSON.stringify({format:'soraspace-site-draft',schemaVersion:1,answers:data,draft:generated},null,2)],{type:'application/json'}));
   const link=element('a');link.href=url;link.download='soraspace-site-draft.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Draft download requested. Your site remains unpublished.';
  }catch(error){status.textContent=error.message;}
 });
 window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
 suggestions();show(0,false);root.querySelector('#setup-interactive').hidden=false;
}
