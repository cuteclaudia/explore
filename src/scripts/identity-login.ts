import {LANGUAGES} from '../lib/locales/languages.mjs';
import { login, logout, getUser, getSettings, oauthLogin, handleAuthCallback, acceptInvite, updateUser, requestPasswordRecovery, refreshSession } from '@netlify/identity';
const status=document.querySelector<HTMLElement>('#auth-status')!;
const form=document.querySelector<HTMLFormElement>('#login-form')!;
const passwordForm=document.querySelector<HTMLFormElement>('#password-form')!;
const google=document.querySelector<HTMLButtonElement>('#google-login')!;
const signout=document.querySelector<HTMLButtonElement>('#logout')!;
const resume=document.querySelector<HTMLButtonElement>('#continue-session')!;
const returnedByGuard=new URLSearchParams(location.search).get('reason')==='session';
let inviteToken='';
let busy=false;
let afterGoogle='';
const googleRequested=new URLSearchParams(location.search).get('provider')==='google';
const next=new URLSearchParams(location.search).get('next') || '/studio';
const allowedDestinations=['/studio/welcome','/studio/soraspace-setup','/studio/soraspace-editor','/studio/soraspace-admin','/apps/files','/apps/irodori-legacy','/studio/downloads','/studio/irodori-test','/settings','/settings/connections','/studio/about','/studio/kobo-test','/trips','/places','/','/apps/hikari','/apps/fumi','/apps/irodori','/apps/tsuzuri','/studio/tools/hikari','/studio/tools/fumi','/studio/tools/irodori','/studio/tools/tsuzuri','/apps','/apps/photocraft','/apps/lightcraft','/apps/wordcraft','/apps/pdfcraft','/studio','/studio/photo-editor','/studio/users','/studio/account','/studio/storage','/studio/content','/studio/content/edit','/studio/content/preview','/studio/tools/photocraft','/studio/tools/lightcraft','/studio/tools/wordcraft','/studio/tools/pdfcraft'];
let destination='/studio';try{const target=new URL(next,location.origin);const path=target.pathname.replace(/\/$/,'')||'/';if(target.origin===location.origin&&allowedDestinations.includes(path)){destination=path;const file=target.searchParams.get('file');const query=new URLSearchParams();const language=new URLSearchParams(location.search).get('lang')||target.searchParams.get('lang');if(language&&Object.hasOwn(LANGUAGES,language))query.set('lang',language);if(file&&/^[0-9a-f-]{36}$/i.test(file))query.set('file',file);const entry=target.searchParams.get('entry');if(entry&&(entry==='pages/about'||/^(journal|essays|cyber|osint|photography)\/[a-z0-9][a-z0-9-]{0,199}$/.test(entry)))query.set('entry',entry);const collection=target.searchParams.get('collection');if(collection&&['journal','essays','cyber','osint','photography'].includes(collection))query.set('collection',collection);if(path==='/apps'){const desktop=target.searchParams.get('desktop');if(desktop&&['tayori','goban'].includes(desktop))query.set('desktop',desktop);}if(path==='/trips'){const eventId=target.searchParams.get('event');if(eventId&&/^[0-9a-f-]{36}$/i.test(eventId))query.set('event',eventId);const view=target.searchParams.get('view');if(['mine','public','bin'].includes(view||''))query.set('view',view!);if(target.searchParams.get('new')==='1')query.set('new','1');for(const key of ['lat','lng']){const value=target.searchParams.get(key);if(value!==null&&Number.isFinite(Number(value))&&Math.abs(Number(value))<=(key==='lat'?85.05112878:180))query.set(key,value);}}if(path==='/places'){const activity=target.searchParams.get('stravaActivity');if(activity&&/^[1-9]\d{0,15}$/.test(activity)&&Number.isSafeInteger(Number(activity)))query.set('stravaActivity',activity);}if(query.size)destination+='?'+query.toString();}}catch{}
const loginError=new URLSearchParams(location.search).get('error');
if(loginError)status.textContent='Sign-in could not be completed. Check your email and password, or use password recovery.';
const message=(error:unknown)=>error instanceof Error?error.message:'Sign-in could not be completed. Please try again.';
async function session(allowRedirect=true) {
  const response=await fetch('/api/studio/session',{cache:'no-store',signal:AbortSignal.timeout(10000)});
  const data=await response.json();
  if(response.status===403){try{const pending=await fetch('/api/soraspace/account/status',{cache:'no-store',signal:AbortSignal.timeout(10000)});const info=await pending.json();if(pending.ok&&['pending','suspended'].includes(info.status)){location.replace('/studio/welcome');return;}}catch{}}
  if(!response.ok) throw Error(data.error || 'You do not have access to this studio.');
  form.hidden=true;google.hidden=true;signout.hidden=false;
  if(!data.setupRequired&&!allowRedirect){resume.hidden=false;status.textContent='You are signed in, but the account page could not confirm your session. Continue to retry, or sign out and sign in again.';return;}
  if(data.setupRequired){document.querySelector('#owner-setup')!.removeAttribute('hidden');document.querySelector('#owner-id')!.textContent=data.id;document.querySelector('#owner-variable')!.textContent=data.variable==='OWNER_GOOGLE_IDENTITY_ID'?'OWNER_GOOGLE_IDENTITY_ID':'OWNER_IDENTITY_ID';status.textContent='Signed in. Your permanent owner ID still needs to be connected.';}
  else{let landing='/studio';if(!new URLSearchParams(location.search).has('next')&&!afterGoogle){try{const response=await fetch('/api/storage/preferences',{cache:'no-store'}),p=await response.json();const preferred=response.ok?p.landingPage:localStorage.getItem('explore-landing-page');if(preferred==='home')landing='/';}catch{try{if(localStorage.getItem('explore-landing-page')==='home')landing='/';}catch{}}}location.replace(afterGoogle||(new URLSearchParams(location.search).has('next')?destination:landing));}
}
async function initialize() {
  form.hidden=true;if(!loginError)status.textContent='Checking your sign-in…';
  if(/^#(?:confirmation_token|recovery_token|invite_token|email_change_token|access_token)=/.test(location.hash))form.hidden=true;
  try {
    const callback=await handleAuthCallback();
    if(callback?.type==='invite') {inviteToken=callback.token || '';passwordForm.hidden=false;status.textContent='Welcome. Set your password to accept your invitation.';return;}
    if(callback?.type==='recovery') {passwordForm.hidden=false;signout.hidden=false;status.textContent='Choose a new password for your account.';return;}
    if(callback?.type==='confirmation')afterGoogle='/studio/welcome';
    if(callback?.type==='oauth'){
      try{afterGoogle=sessionStorage.getItem('explore-google-return')==='/studio/account'?'/studio/account':'';sessionStorage.removeItem('explore-google-return');}catch{}
    }
    if(googleRequested&&!callback){
      const url=new URL(location.href);url.searchParams.delete('provider');history.replaceState(null,'',url.pathname+url.search);
      const settings=await getSettings();
      if(!settings.providers.google){status.textContent='Google sign-in is not enabled yet. Enable Google under Netlify Identity → Registration → External providers.';form.hidden=false;return;}
      try{sessionStorage.setItem('explore-google-return','/studio/account');}catch{}
      oauthLogin('google');
      return;
    }
    if(await getUser()){await refreshSession();await session(!returnedByGuard);return;}
    form.hidden=false;
    if(!loginError)status.textContent='Use your invited account to sign in.';
    // Provider discovery must never prevent email/password sign-in.
    getSettings().then(settings=>{if(!form.hidden)google.hidden=!settings.providers.google;}).catch(()=>{google.hidden=true;});
  } catch(error) {status.textContent=message(error);form.hidden=false;signout.hidden=false;}
}
form.addEventListener('submit',async event=>{event.preventDefault();if(busy)return;busy=true;status.textContent='Signing in…';try{await login((document.querySelector<HTMLInputElement>('#login-email')!.value).trim(),document.querySelector<HTMLInputElement>('#login-password')!.value);document.querySelector<HTMLInputElement>('#login-password')!.value='';await session();}catch(error){status.textContent=message(error);}finally{busy=false;}});
passwordForm.addEventListener('submit',async event=>{event.preventDefault();if(busy)return;const password=document.querySelector<HTMLInputElement>('#new-password')!.value;if(password!==document.querySelector<HTMLInputElement>('#confirm-password')!.value){status.textContent='The passwords do not match.';return;}if(new TextEncoder().encode(password).length>72){status.textContent='Please choose a password no longer than 72 UTF-8 bytes.';return;}busy=true;try{if(inviteToken){await acceptInvite(inviteToken,password);inviteToken='';}else await updateUser({password});passwordForm.reset();passwordForm.hidden=true;await session();}catch(error){status.textContent=message(error);}finally{busy=false;}});
document.querySelector('#recover-password')!.addEventListener('click',async()=>{const email=document.querySelector<HTMLInputElement>('#login-email')!;if(!email.reportValidity())return;try{await requestPasswordRecovery(email.value.trim());status.textContent='If this email belongs to an account, a password reset link has been requested.';}catch{status.textContent='The password reset request could not be sent. Please try again.';}});
google.addEventListener('click',()=>{location.assign('/studio/login?provider=google');});
signout.addEventListener('click',async()=>{try{await logout();location.replace('/studio/login');}catch(error){status.textContent=message(error);}});
resume.addEventListener('click',async()=>{if(busy)return;busy=true;resume.disabled=true;status.textContent='Checking your account…';try{await session();}catch(error){status.textContent=message(error);}finally{busy=false;resume.disabled=false;}});
initialize();
