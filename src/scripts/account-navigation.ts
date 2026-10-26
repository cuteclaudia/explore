import { onAuthChange, logout } from '@netlify/identity';
const signIn=document.querySelector<HTMLAnchorElement>('[data-account-signin]')!;
const studio=document.querySelector<HTMLAnchorElement>('[data-account-studio]')!;
const menu=document.querySelector<HTMLDetailsElement>('[data-account-menu]')!;
const permissions=document.querySelector<HTMLAnchorElement>('[data-account-permissions]')!;
const status=document.querySelector<HTMLElement>('[data-account-status]')!;
let revision=0;
function show(signedIn:boolean,owner=false){signIn.hidden=signedIn;studio.hidden=!signedIn;menu.hidden=!signedIn;permissions.hidden=!owner;if(!signedIn)menu.open=false;}
async function refresh(){
  const current=++revision;
  try{
    const response=await fetch('/api/studio/session',{cache:'no-store',signal:AbortSignal.timeout(6000)});
    const data=response.ok?await response.json():null;
    if(current!==revision)return;
    show(Boolean(data),data?.isOwner===true);
    if(data?.setupRequired){studio.href='/studio/login';studio.textContent='Finish owner setup';}
    else{studio.href='/studio';studio.textContent='My Studio';}
  }catch{if(current===revision)show(false);}
}
onAuthChange(event=>{if(event==='logout'){revision++;show(false);}else refresh();});
window.addEventListener('pageshow',event=>{if(event.persisted)refresh();});
window.addEventListener('focus',refresh);
document.addEventListener('click',event=>{if(!menu.contains(event.target as Node))menu.open=false;});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.open){menu.open=false;menu.querySelector('summary')?.focus();}});
document.querySelector('[data-account-logout]')!.addEventListener('click',async()=>{status.textContent='Signing out…';try{await logout();revision++;show(false);location.replace('/');}catch{status.textContent='Sign-out could not be completed. Please try again.';}});
refresh();
