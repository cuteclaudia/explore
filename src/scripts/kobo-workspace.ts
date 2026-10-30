import './app-launch.mjs';
import './workspace-navigation.mjs';
import {onAuthChange,logout} from '@netlify/identity';
const root=document.querySelector<HTMLElement>('[data-workspace-owner]')!,owner=root.dataset.workspaceOwner!,state=document.getElementById('workspace-session')!,list=document.getElementById('workspace-files-list'),note=document.getElementById('workspace-files-status'),folders=document.getElementById('workspace-folder-list'),fileFilter=document.getElementById('workspace-file-filter') as HTMLSelectElement|null;
let epoch=0,active=true,abort:AbortController|undefined;let recordsCache:any[]=[];
const fileSort=document.getElementById('workspace-file-sort') as HTMLSelectElement|null,more=document.getElementById('workspace-files-more') as HTMLButtonElement|null;
const pageSize=Number(list?.dataset.limit)||30;let visibleLimit=pageSize;
function resetFileView(){visibleLimit=pageSize;renderFiles();}
fileSort?.addEventListener('change',resetFileView);
more?.addEventListener('click',()=>{visibleLimit+=pageSize;renderFiles();});
const tools=JSON.parse(list?.getAttribute('data-tools')||'{}');
const folderQuery=new URLSearchParams(location.search).get('app');if(fileFilter&&folderQuery){const id=Object.keys(tools).find(id=>tools[id].slug===folderQuery);if(id)fileFilter.value=id;}
fileFilter?.addEventListener('change',resetFileView);
function clear(message=''){epoch++;abort?.abort();recordsCache=[];if(more)more.hidden=true;list?.replaceChildren();folders?.replaceChildren();if(note)note.textContent=message;}
function block(message){window.dispatchEvent(new Event('soraspace:access-ended'));active=false;clear('');root.hidden=true;state.replaceChildren(document.createTextNode(message+' '));const link=document.createElement('a');link.href='/studio/login?next='+encodeURIComponent(location.pathname);link.textContent='Sign in to reopen your workspace.';state.append(link);}
async function session(){const response=await fetch('/api/studio/session',{cache:'no-store',signal:AbortSignal.timeout(10000)});if(!response.ok)throw Object.assign(Error('Your account could not be verified.'),{denied:[401,403].includes(response.status)});const data=await response.json();if(data.id!==owner||data.setupRequired)throw Object.assign(Error('Your account changed.'),{denied:true});return data;}
async function refresh(){recordsCache=[];visibleLimit=pageSize;if(more)more.hidden=true;const current=++epoch;abort?.abort();abort=new AbortController();list?.replaceChildren();folders?.replaceChildren();if(note)note.textContent='Loading saved site revisions…';try{await session();if(!active||current!==epoch)return;if(!list)return;const response=await fetch('/api/files/list',{cache:'no-store',signal:AbortSignal.any([abort.signal,AbortSignal.timeout(15000)])}),files=await response.json();if(current!==epoch||!active)return;if(!response.ok)throw Error(files.error||'Saved revisions could not be loaded.');if(!Array.isArray(files)||files.length>10000)throw Error('Saved revisions could not be listed.');const verified=await session();if(current!==epoch||!active)return;list.replaceChildren();const records=files.filter(file=>file?.ownerId===owner&&Object.hasOwn(tools,file.tool)&&verified.capabilities?.['tools.'+file.tool]===true&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(file.id)&&typeof file.name==='string'&&typeof file.createdAt==='string'&&Number.isFinite(Date.parse(file.createdAt))).sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt));
folders?.replaceChildren();if(folders){for(const [id,tool] of Object.entries(tools) as [string,{name:string,slug:string}][]){const count=records.filter(file=>file.tool===id).length;if(!count||verified.capabilities?.['tools.'+id]!==true)continue;const link=document.createElement('a'),label=document.createElement('strong'),total=document.createElement('small');link.href='/apps/files?app='+encodeURIComponent(tool.slug);label.textContent=tool.name;total.textContent=count+' site file'+(count===1?'':'s');link.append(label,total);folders.append(link);}}
recordsCache=records;renderFiles();}catch(error){if(current===epoch&&active){if((error as any)?.denied){block('Your account access ended.');return;}if(note)note.textContent=error instanceof Error?error.message:'Saved revisions are temporarily unavailable.';}}}

function renderFiles(){
 if(!active||!list)return 0;
 list.replaceChildren();
 const query=(document.querySelector<HTMLInputElement>('#workspace-app-search')?.value||'').trim().toLowerCase();
 const matches=recordsCache.filter(file=>(!fileFilter?.value||file.tool===fileFilter.value)&&(!query||[file.name,tools[file.tool].name,tools[file.tool].slug].join(' ').toLowerCase().includes(query)));
 const compareName=(a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true,sensitivity:'base'})||a.id.localeCompare(b.id);
 matches.sort((a,b)=>fileSort?.value==='name'?compareName(a,b):fileSort?.value==='app'?tools[a.tool].name.localeCompare(tools[b.tool].name)||compareName(a,b):fileSort?.value==='oldest'?Date.parse(a.createdAt)-Date.parse(b.createdAt)||compareName(a,b):Date.parse(b.createdAt)-Date.parse(a.createdAt)||compareName(a,b));
 const shown=matches.slice(0,visibleLimit);
 for(const file of shown){
  const row=document.createElement('article'),copy=document.createElement('div'),name=document.createElement('a'),meta=document.createElement('small');
  name.textContent=file.name.slice(0,250);name.title=file.name.slice(0,250);name.className='workspace-file-name';
  meta.textContent=tools[file.tool].name+' · '+new Date(file.createdAt).toLocaleString();copy.append(name,meta);
  const app=file.tool==='photocraft'?'irodori-legacy':tools[file.tool].slug;
  const href='/apps/'+app+(file.tool==='lightcraft'&&/\.zip$/i.test(file.name)?'':'?file='+encodeURIComponent(file.id));
  name.setAttribute('href',href);name.target='_blank';name.rel='noopener';name.dataset.appLaunch='';name.setAttribute('aria-label','Open '+file.name.slice(0,250)+' (new tab)');
  row.append(copy);list.append(row);
 }
 if(more)more.hidden=shown.length>=matches.length;
 if(note)note.textContent=shown.length?(list.dataset.compact==='true'?'':`Showing ${shown.length} of ${matches.length} saved revision${matches.length===1?'':'s'}${fileFilter?.value||query?' matching your filters':''}.`):(query||fileFilter?.value?'No saved site revisions match these filters.':'No saved site revisions to show. Open an app to work with its files and libraries.');
 return matches.length;
}
const search=document.querySelector<HTMLInputElement>('#workspace-app-search');search?.addEventListener('input',()=>{const query=search.value.trim().toLowerCase();let shown=0;root.querySelectorAll<HTMLElement>('[data-desktop-app]').forEach(tile=>{tile.hidden=!tile.textContent?.toLowerCase().includes(query);if(!tile.hidden)shown++;});const result=document.getElementById('workspace-search-status');visibleLimit=pageSize;const fileMatches=renderFiles();if(result)result.textContent=shown?'':fileMatches?fileMatches+' matching saved file'+(fileMatches===1?'':'s')+'.':'No matching apps or saved site files.';});
document.getElementById('workspace-logout')?.addEventListener('click',async()=>{state.textContent='Signing out…';try{await logout();block('You have signed out.');location.replace('/kobo');}catch{state.textContent='Sign-out could not be completed. Please try again.';}});
document.getElementById('workspace-files-refresh')?.addEventListener('click',()=>void refresh());
onAuthChange((event,user)=>{if(event==='logout'||event==='login'&&user?.id!==owner)block('Your account changed.');});
window.addEventListener('pagehide',()=>clear());window.addEventListener('pageshow',event=>{if(event.persisted){root.hidden=true;location.reload();}});document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();else if(active)void refresh();});window.addEventListener('focus',()=>{if(active)void refresh();});
void refresh();

const selectedDesktop=new URLSearchParams(location.search).get('desktop');if(selectedDesktop&&['tayori','goban'].includes(selectedDesktop)){const tile=document.getElementById('workspace-app-'+selectedDesktop);tile?.scrollIntoView({block:'center'});tile?.focus({preventScroll:true});}
