import { onAuthChange, logout } from '@netlify/identity';
const signIn=document.querySelector<HTMLAnchorElement>('[data-account-signin]')!;
const studio=document.querySelector<HTMLAnchorElement>('[data-account-studio]')!;
const menu=document.querySelector<HTMLDetailsElement>('[data-account-menu]')!;
const permissions=document.querySelector<HTMLAnchorElement>('[data-account-permissions]')!;
const status=document.querySelector<HTMLElement>('[data-account-status]')!;
let revision=0,preferencesFor='';
function setStudioLabel(label:string){studio.querySelector('[data-account-label]')!.textContent=label;studio.setAttribute('aria-label',label);studio.dataset.tooltip=label;}
function applyPreferences(data){if(!data?.id||data.setupRequired||data.id===preferencesFor||location.pathname.replace(/\/$/,'')==='/settings')return;preferencesFor=data.id;fetch('/api/storage/preferences',{cache:'no-store'}).then(async r=>{if(!r.ok)return;const p=await r.json();const theme=(window as any).exploreTheme;if(theme?.valid?.(p.colours)){theme.apply(p.colours);try{localStorage.setItem('explore-colours',JSON.stringify(p.colours));}catch{}}if(p.density){localStorage.setItem('explore-density',p.density);document.documentElement.dataset.density=p.density;}if(typeof p.reducedMotion==='boolean'){localStorage.setItem('explore-motion',String(p.reducedMotion));document.documentElement.dataset.reducedMotion=String(p.reducedMotion);}}).catch(()=>{});}
function show(signedIn:boolean,owner=false){signIn.hidden=signedIn;studio.hidden=!signedIn;menu.hidden=false;document.querySelectorAll<HTMLElement>('[data-auth-link],[data-account-logout]').forEach(x=>x.hidden=!signedIn);permissions.hidden=!owner;document.querySelector<HTMLElement>('[data-account-apps]')!.hidden=!signedIn;document.querySelector<HTMLElement>('[data-owner-studio-link]')!.hidden=!owner;if(!signedIn)menu.open=false;}
async function refresh(){
  const current=++revision;
  try{
    const response=await fetch('/api/studio/session',{cache:'no-store',signal:AbortSignal.timeout(6000)});
    const data=response.ok?await response.json():null;
    if(current!==revision)return;
    show(Boolean(data),data?.isOwner===true);document.querySelectorAll<HTMLElement>('[data-owner-settings]').forEach(x=>x.hidden=!data?.isOwner);applyPreferences(data);
    if(data?.setupRequired){document.querySelector<HTMLElement>('[data-account-apps]')!.hidden=true;studio.href='/studio/login';setStudioLabel('Finish owner setup');}
    else{studio.href='/studio';setStudioLabel('My Studio');document.querySelector<HTMLElement>('[data-account-apps]')!.hidden=!data;}
  }catch{if(current===revision)show(false);}
}
onAuthChange(event=>{if(event==='logout'){revision++;show(false);}else refresh();});
window.addEventListener('pageshow',event=>{if(event.persisted)refresh();});
window.addEventListener('focus',refresh);
document.addEventListener('click',event=>{if(!menu.contains(event.target as Node))menu.open=false;});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.open){menu.open=false;menu.querySelector('summary')?.focus();}});
document.querySelector('[data-account-logout]')!.addEventListener('click',async()=>{status.textContent='Signing out…';try{await logout();revision++;show(false);location.replace('/');}catch{status.textContent='Sign-out could not be completed. Please try again.';}});
refresh();

let openedByHover=false;menu.querySelector('summary')!.addEventListener('click',event=>{if(openedByHover&&menu.open)event.preventDefault();openedByHover=false;});
const hover=matchMedia('(hover:hover) and (pointer:fine)');let closeTimer:ReturnType<typeof setTimeout>;menu.addEventListener('pointerenter',()=>{if(hover.matches){clearTimeout(closeTimer);if(!menu.open){menu.open=true;openedByHover=true;}}});menu.addEventListener('pointerleave',()=>{if(hover.matches)closeTimer=setTimeout(()=>{if(!menu.contains(document.activeElement))menu.open=false;},180);});
