import { login, logout, getUser, getSettings, oauthLogin, handleAuthCallback, acceptInvite, updateUser, requestPasswordRecovery } from '@netlify/identity';
const status=document.querySelector<HTMLElement>('#auth-status')!;
const form=document.querySelector<HTMLFormElement>('#login-form')!;
const passwordForm=document.querySelector<HTMLFormElement>('#password-form')!;
const google=document.querySelector<HTMLButtonElement>('#google-login')!;
const signout=document.querySelector<HTMLButtonElement>('#logout')!;
let inviteToken='';
let busy=false;
const next=new URLSearchParams(location.search).get('next') || '/studio';
const destination=['/studio','/studio/photo-editor','/studio/users'].includes(next)?next:'/studio';
const message=(error:unknown)=>error instanceof Error?error.message:'Sign-in could not be completed. Please try again.';
async function session() {
  const response=await fetch('/api/studio/session',{cache:'no-store'});
  const data=await response.json();
  if(!response.ok) throw Error(data.error || 'You do not have access to this studio.');
  form.hidden=true;google.hidden=true;signout.hidden=false;
  if(data.setupRequired){document.querySelector('#owner-setup')!.removeAttribute('hidden');document.querySelector('#owner-id')!.textContent=data.id;status.textContent='Signed in. Your permanent owner ID still needs to be connected.';}
  else location.replace(destination);
}
async function initialize() {
  try {
    const callback=await handleAuthCallback();
    if(callback?.type==='invite') {inviteToken=callback.token || '';passwordForm.hidden=false;status.textContent='Welcome. Set your password to accept your invitation.';return;}
    if(callback?.type==='recovery') {passwordForm.hidden=false;signout.hidden=false;status.textContent='Choose a new password for your account.';return;}
    if(await getUser()){await session();return;}
    const settings=await getSettings();
    google.hidden=!settings.providers.google;
    form.hidden=false;status.textContent='Use your invited account to sign in.';
  } catch(error) {status.textContent=message(error);form.hidden=false;signout.hidden=false;}
}
form.addEventListener('submit',async event=>{event.preventDefault();if(busy)return;busy=true;status.textContent='Signing in…';try{await login((document.querySelector<HTMLInputElement>('#login-email')!.value).trim(),document.querySelector<HTMLInputElement>('#login-password')!.value);document.querySelector<HTMLInputElement>('#login-password')!.value='';await session();}catch(error){status.textContent=message(error);}finally{busy=false;}});
passwordForm.addEventListener('submit',async event=>{event.preventDefault();if(busy)return;const password=document.querySelector<HTMLInputElement>('#new-password')!.value;if(password!==document.querySelector<HTMLInputElement>('#confirm-password')!.value){status.textContent='The passwords do not match.';return;}if(new TextEncoder().encode(password).length>72){status.textContent='Please choose a password no longer than 72 UTF-8 bytes.';return;}busy=true;try{if(inviteToken){await acceptInvite(inviteToken,password);inviteToken='';}else await updateUser({password});passwordForm.reset();passwordForm.hidden=true;await session();}catch(error){status.textContent=message(error);}finally{busy=false;}});
document.querySelector('#recover-password')!.addEventListener('click',async()=>{const email=document.querySelector<HTMLInputElement>('#login-email')!;if(!email.reportValidity())return;try{await requestPasswordRecovery(email.value.trim());status.textContent='If this email belongs to an account, a password reset link has been requested.';}catch{status.textContent='The password reset request could not be sent. Please try again.';}});
google.addEventListener('click',()=>{try{oauthLogin('google');}catch(error){status.textContent=message(error);}});
signout.addEventListener('click',async()=>{try{await logout();location.replace('/studio/login');}catch(error){status.textContent=message(error);}});
initialize();
