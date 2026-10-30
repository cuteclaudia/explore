import {onAuthChange} from '@netlify/identity';
import {recommendedSiteAnswers} from '../lib/soraspace-site-setup.mjs';
import {editableSiteFromSetup,validateEditableSite,readSiteDraftExport} from '../lib/soraspace-site-editor.mjs';
const root=document.getElementById('site-editor');
if(root){
 const $=id=>root.querySelector('#'+id),account=root.dataset.account,panels=$('editor-panels'),status=$('editor-status');
 let draft=null,etag=null,selected='home',previewPage='home',dirty=false,busy=false,blocked=false,ended=false,epoch=0;
 const node=(tag,text)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;return el;};
 function say(text){status.textContent=text;}
 function state(){const ready=!!draft&&!ended;$('editor-save').disabled=!ready||busy||blocked||!dirty;$('editor-export').disabled=!ready||busy;$('editor-import').disabled=!ready||busy||blocked;$('editor-reload').disabled=busy||ended;panels.inert=busy||ended;}
 function stop(){ended=true;epoch++;draft=null;etag=null;dirty=false;panels.replaceChildren();panels.hidden=true;state();say('Your account access changed. Reopen the editor after signing in.');}
 async function session(){const r=await fetch('/api/studio/session',{cache:'no-store',signal:AbortSignal.timeout(10000)});if(!r.ok)throw Object.assign(Error('Your sign-in could not be verified.'),{denied:[401,403].includes(r.status)});const data=await r.json();if(data.id!==account||data.capabilities?.['beta.soraspace']!==true)throw Object.assign(Error('Your account access changed.'),{denied:true});}
 async function response(r){let data;try{data=await r.json();}catch{throw Error('Unexpected response. Reload to check what saved.');}if(!r.ok)throw Object.assign(Error(data.error||'Draft request failed.'),{denied:[401,403].includes(r.status)});if(data.account!==account)throw Object.assign(Error('Your account changed.'),{denied:true});return data;}
 function changed(){dirty=true;state();preview();say('Unsaved changes · Your site remains private.');}
 const bindings=[['editor-name','siteName'],['editor-tagline','tagline'],['editor-mark','brandMark'],['editor-footer','footer']];
 function render(){
  for(const [id,key] of bindings)$(id).value=draft[key];for(const key of ['template','palette','density'])$('editor-'+key).value=draft.theme[key];pages();content();preview();state();
 }
 function pages(){
  const list=$('editor-page-list');list.replaceChildren();
  draft.pages.forEach((p,index)=>{
   const row=node('div');row.className='editor-page-row';const check=node('input');check.type='checkbox';check.checked=p.enabled;check.disabled=p.id===draft.homePage;check.setAttribute('aria-label','Show '+p.title);check.dataset.pageToggle=p.id;
   check.addEventListener('change',()=>{p.enabled=check.checked;if(!p.enabled&&draft.featuredPage===p.id)draft.featuredPage=null;if(!p.enabled&&previewPage===p.id)previewPage=draft.homePage;pages();changed();});
   const choose=node('button',p.title);choose.type='button';choose.className='editor-page-select';choose.dataset.pageSelect=p.id;if(p.id===selected)choose.setAttribute('aria-current','page');choose.append(node('small',p.id===draft.homePage?'Homepage':p.enabled?'Shown in draft':'Hidden · content kept'));choose.addEventListener('click',()=>{selected=p.id;if(p.enabled)previewPage=p.id;pages();content();preview();$('editor-page-title').focus();});
   const order=node('div');order.className='editor-page-order';for(const [label,delta] of [['↑',-1],['↓',1]]){const b=node('button',label);b.type='button';b.disabled=index+delta<0||index+delta>=draft.pages.length;b.setAttribute('aria-label',(delta<0?'Move up ':'Move down ')+p.title);b.addEventListener('click',()=>{[draft.pages[index],draft.pages[index+delta]]=[draft.pages[index+delta],draft.pages[index]];pages();changed();list.querySelector(`[data-page-select="${p.id}"]`).focus();});order.append(b);}
   row.append(check,choose);if(p.id===selected)row.append(order);list.append(row);
  });
  for(const [id,value,none] of [['editor-home',draft.homePage,false],['editor-featured',draft.featuredPage,true]]){const select=$(id);select.replaceChildren();if(none){const o=node('option','No highlight');o.value='';select.append(o);}for(const p of draft.pages.filter(p=>p.enabled)){const o=node('option',p.title);o.value=p.id;select.append(o);}select.value=value||'';}
 }
 function content(){const p=draft.pages.find(p=>p.id===selected)||draft.pages[0];selected=p.id;$('editor-page-heading').textContent='Editing '+p.title;for(const [id,key] of [['title','title'],['name','heading'],['summary','summary'],['body','body']])$('editor-page-'+id).value=p[key];}
 function preview(){
  if(!draft)return;const container=$('editor-preview');container.replaceChildren();const p=draft.pages.find(p=>p.id===previewPage&&p.enabled)||draft.pages.find(p=>p.id===draft.homePage);previewPage=p.id;
  const view=node('div');view.className='site-draft-view';Object.assign(view.dataset,draft.theme);
  const header=node('header'),brand=node('div');brand.className='site-draft-brand';const mark=node('span',draft.brandMark);mark.className='site-draft-mark';brand.append(mark,node('span',draft.siteName));const nav=node('nav');nav.className='site-draft-nav';nav.setAttribute('aria-label','Draft site navigation');for(const page of draft.pages.filter(v=>v.enabled)){const b=node('button',page.title);b.type='button';b.dataset.previewPage=page.id;if(page.id===p.id)b.setAttribute('aria-current','page');b.addEventListener('click',()=>{previewPage=page.id;preview();});nav.append(b);}header.append(brand,nav);
  const main=node('div');main.className='site-draft-content';const badge=node('span','PRIVATE DRAFT');badge.className='site-draft-badge';main.append(badge,node('h3',p.heading||p.title));if(draft.tagline){const line=node('p',draft.tagline);line.className='site-draft-tagline';main.append(line);}if(p.summary)main.append(node('p',p.summary));main.append(node('p',p.body||'Add your page text in the editor.'));
  view.append(header,main);if(draft.featuredPage&&draft.featuredPage!==p.id){const featured=draft.pages.find(v=>v.id===draft.featuredPage&&v.enabled),aside=node('aside');aside.className='site-draft-feature';aside.append(node('small','Featured page'));const b=node('button',featured.title);b.type='button';b.addEventListener('click',()=>{previewPage=featured.id;preview();});aside.append(b);view.append(aside);}if(draft.footer)view.append(node('footer',draft.footer));container.append(view);
 }
 async function load(){
  if(ended||busy)return;if(dirty&&!confirm('Reload the saved draft and discard unsaved edits? Export first if you want to keep them.'))return;
  const current=++epoch;busy=true;state();say('Loading private draft…');try{await session();const data=await response(await fetch('/api/soraspace/editor-draft',{cache:'no-store',signal:AbortSignal.timeout(15000)}));await session();if(current!==epoch||ended)return;draft=data.draft?validateEditableSite(data.draft):editableSiteFromSetup({...recommendedSiteAnswers(),siteName:'Your site'});etag=data.etag;dirty=!data.draft;blocked=false;selected=previewPage=draft.homePage;panels.hidden=false;render();say(data.draft?'Saved private draft loaded.':'Start editing, import a draft or return to site setup. Save when ready.');}catch(e){if(e.denied){stop();return;}blocked=true;say(e.message);}finally{busy=false;state();}
 }
 async function save(){
  if(busy||blocked||ended)return;let clean;try{clean=validateEditableSite(draft);}catch(e){say(e.message);return;}
  const current=epoch;busy=true;state();say('Saving private draft…');try{await session();const data=await response(await fetch('/api/soraspace/editor-draft',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({expectedAccount:account,etag,mutationId:crypto.randomUUID(),draft:clean}),signal:AbortSignal.timeout(20000)}));await session();if(current!==epoch||ended)return;draft=validateEditableSite(data.draft);etag=data.etag;dirty=false;render();say('Draft saved privately. Nothing has been published.');}catch(e){if(e.denied){stop();return;}if(current!==epoch||ended)return;blocked=true;say(e.message+' Your edits remain here. Export them before reloading the latest saved draft.');}finally{busy=false;state();}
 }
 for(const [id,key] of bindings)$(id).addEventListener('input',()=>{if(!draft)return;draft[key]=$(id).value;changed();});
 for(const key of ['template','palette','density'])$('editor-'+key).addEventListener('change',()=>{draft.theme[key]=$('editor-'+key).value;changed();});
 for(const [id,key] of [['title','title'],['name','heading'],['summary','summary'],['body','body']])$('editor-page-'+id).addEventListener('input',()=>{const p=draft.pages.find(p=>p.id===selected);p[key]=$('editor-page-'+id).value;if(key==='title')pages();changed();});
 $('editor-home').addEventListener('change',()=>{draft.homePage=$('editor-home').value;selected=previewPage=draft.homePage;pages();content();changed();});$('editor-featured').addEventListener('change',()=>{draft.featuredPage=$('editor-featured').value||null;changed();});
 $('editor-reload').addEventListener('click',()=>void load());$('editor-save').addEventListener('click',()=>void save());
 $('editor-export').addEventListener('click',()=>{try{const clean=validateEditableSite(draft),url=URL.createObjectURL(new Blob([JSON.stringify({format:'soraspace-site-draft',schemaVersion:2,draft:clean},null,2)],{type:'application/json'}));const a=node('a');a.href=url;a.download='soraspace-edited-site.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);say('Draft export requested. No publishing changes.');}catch(e){say(e.message);}});
 $('editor-import').addEventListener('change',async event=>{const file=event.target.files?.[0];event.target.value='';if(!file||ended||busy)return;const current=epoch;try{if(file.size>128*1024)throw Error('Choose a JSON draft smaller than 128 KiB.');const next=readSiteDraftExport(JSON.parse(await file.text()));if(current!==epoch||ended||busy)return;if(dirty&&!confirm('Replace unsaved edits with this imported draft? Export first to keep them.'))return;draft=next;selected=previewPage=draft.homePage;dirty=true;render();say('Draft imported for review. Save explicitly to keep it on the site.');}catch(e){say(e.message);}});
 root.querySelectorAll('[data-preview-size]').forEach(b=>b.addEventListener('click',()=>{$('editor-preview').dataset.size=b.dataset.previewSize;root.querySelectorAll('[data-preview-size]').forEach(other=>other.setAttribute('aria-pressed',String(other===b)));}));
 onAuthChange((event,user)=>{if(event==='logout'||event==='login'&&user?.id!==account)stop();});
 window.addEventListener('focus',()=>{if(!ended)void session().catch(e=>e.denied?stop():say('Session could not be checked. Your edits are kept; saving will verify access again.'));});
 window.addEventListener('beforeunload',event=>{if(dirty&&!ended){event.preventDefault();event.returnValue='';}});
 window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
 void load();
}
