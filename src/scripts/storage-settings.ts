const form=document.querySelector<HTMLFormElement>('#webdav-form')!;
const status=document.querySelector<HTMLElement>('#storage-status')!;
const verification=document.querySelector<HTMLElement>('#kobo-verification')!;
const verify=document.querySelector<HTMLButtonElement>('#verify-kobo')!;
const save=form.querySelector<HTMLButtonElement>('button[type=submit]')!;
const remove=document.querySelector<HTMLButtonElement>('#webdav-remove')!;
let connected=false,dirty=false,busy=false,revision=0;
function controls(){verify.disabled=busy||!connected||dirty;save.disabled=busy;remove.disabled=busy||!connected;}
function note(message:string,error=false){status.textContent=message;verification.textContent=message;status.dataset.state=verification.dataset.state=error?'error':'normal';}
async function request(path:string,options:RequestInit={}){
 let response:Response;
 try{response=await fetch(path,{...options,cache:'no-store',signal:AbortSignal.timeout(30000)});}
 catch(error){throw Error((error as Error).name==='TimeoutError'?'The request timed out. Refresh to check whether the connection was saved before retrying.':'The website could not be reached. Check your connection and try again.');}
 let data;try{data=await response.json();}catch{throw Error('The website returned HTTP '+response.status+' without a readable result. Check the Netlify storage-connections function log.');}
 if(!response.ok)throw Error(data.error||'Storage request failed (HTTP '+response.status+').');return data;
}
function show(data:any){
 connected=data.connected===true;dirty=false;controls();
 document.querySelector('.connection-details summary')!.textContent=connected?'Manage connection':'Connect WebDAV';
 status.textContent=connected?'WebDAV connection saved for your current account.':'No WebDAV connection saved for your current account.';status.dataset.state='normal';
 for(const name of ['url','username','baseFolder','label'])if(typeof data[name]==='string')(form.elements.namedItem(name) as HTMLInputElement).value=data[name];
 verification.textContent=!connected?'Step 1: enter your connection details, then click Test & save.':data.koboVerified?'Connection checks passed. Full app sync remains experimental.':'Step 2: connection saved. You can now test Kōbō sync.';verification.dataset.state='normal';
}
controls();
const initialRevision=revision;
request('/api/storage/webdav').then(data=>{if(initialRevision!==revision)return;if(!dirty)show(data);else{connected=data.connected===true;controls();}}).catch(e=>{if(initialRevision===revision)note(e.message,true);});
form.addEventListener('input',()=>{dirty=true;controls();verification.textContent='Connection details changed. Click Test & save before testing Kōbō sync.';verification.dataset.state='normal';});
form.addEventListener('invalid',event=>{const field=event.target as HTMLInputElement;const name={url:'HTTPS WebDAV URL',username:'username',password:'app password'}[field.name]||'required field';note('Complete the '+name+' in Connection details, then click Test & save.',true);},true);
form.addEventListener('submit',async event=>{
 event.preventDefault();if(busy)return;revision++;busy=true;controls();note('Testing your WebDAV folder, writing a temporary file and saving the connection…');
 try{const data=await request('/api/storage/webdav',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form)))});show(data);}
 catch(e){note('Test & save did not complete: '+(e instanceof Error?e.message:'Connection failed.'),true);}
 finally{(form.elements.namedItem('password') as HTMLInputElement).value='';busy=false;controls();}
});
verify.onclick=async()=>{
 if(busy||!connected||dirty){note('Complete Test & save successfully for this account before testing Kōbō sync.',true);return;}
 busy=true;controls();verification.textContent='Checking conditional writes and reading back a temporary file…';verification.dataset.state='normal';
 try{await request('/api/storage/webdav/verify-kobo',{method:'POST'});verification.textContent='Connection checks passed. Full app sync remains experimental.';}
 catch(e){verification.textContent=e instanceof Error?e.message:'Verification failed.';verification.dataset.state='error';}
 finally{busy=false;controls();}
};
remove.onclick=async()=>{if(busy||!connected)return;revision++;busy=true;controls();try{await request('/api/storage/webdav',{method:'DELETE'});form.reset();show({connected:false});}catch(e){note(e instanceof Error?e.message:'Connection could not be removed.',true);}finally{busy=false;controls();}};

const preference=document.querySelector<HTMLSelectElement>('#save-destination')!,preferenceStatus=document.querySelector<HTMLElement>('#preference-status')!;
request('/api/storage/preferences').then(p=>preference.value=p.defaultDestination).catch(e=>preferenceStatus.textContent=e.message);
document.querySelector<HTMLButtonElement>('#save-preferences')!.onclick=async()=>{try{await request('/api/storage/preferences',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({defaultDestination:preference.value})});preferenceStatus.textContent='Your default save destination is saved on your account.';}catch(e){preferenceStatus.textContent=e instanceof Error?e.message:'Preference could not be saved.';}};
document.querySelector('#generate-storage-key')?.addEventListener('click',()=>{const bytes=crypto.getRandomValues(new Uint8Array(32));document.querySelector<HTMLInputElement>('#storage-key')!.value=btoa(String.fromCharCode(...bytes));});
document.querySelector('#copy-storage-key')?.addEventListener('click',async()=>{const input=document.querySelector<HTMLInputElement>('#storage-key')!;if(input.value)try{await navigator.clipboard.writeText(input.value);status.textContent='Setup key copied. Save it in Netlify; it is not stored by this page.';}catch{input.focus();input.select();}});

const googleStatus=document.querySelector<HTMLElement>('#google-drive-status')!,googleConnect=document.querySelector<HTMLButtonElement>('#google-drive-connect')!,googleVerify=document.querySelector<HTMLButtonElement>('#google-drive-verify')!,googleDisconnect=document.querySelector<HTMLButtonElement>('#google-drive-disconnect')!,googleFolder=document.querySelector<HTMLAnchorElement>('#google-drive-folder')!;
const provider=document.querySelector<HTMLSelectElement>('#kobo-provider')!,providerStatus=document.querySelector<HTMLElement>('#kobo-provider-status')!,providerSave=document.querySelector<HTMLButtonElement>('#kobo-provider-save')!;
let googleBusy=false,driveConfigured=false;
async function refreshGoogle(){const d=await request('/api/google-drive/status');driveConfigured=d.configured;googleConnect.disabled=!d.configured;googleConnect.textContent=d.connected?'Reconnect Google Drive':'Connect Google Drive';googleVerify.hidden=googleDisconnect.hidden=googleFolder.hidden=!d.connected;if(d.folderUrl)googleFolder.href=d.folderUrl;provider.value=d.selected;document.querySelector<HTMLElement>('#google-drive-setup')?.toggleAttribute('hidden',d.configured);googleStatus.textContent=!d.configured?'Google Drive needs administrator setup before connecting.':!d.connected?'No Google Drive connected for this account.':d.reconnectRequired?'Google authorization expired. Reconnect this account.':d.verified?'Connected'+(d.email?' as '+d.email:'')+(d.concurrentIndexVerified?' · connection and competing-save checks passed.':' · read-only until competing-save checks pass. Run Test connection.')+' Full app sync remains experimental.':'Connected'+(d.email?' as '+d.email:'')+' · test the connection before selecting it.';providerStatus.textContent='Current provider: '+(d.selected==='google-drive'?'Google Drive':'WebDAV')+'.';}
async function googleRun(fn){if(googleBusy)return;googleBusy=true;for(const b of [googleConnect,googleVerify,googleDisconnect,providerSave])b.disabled=true;try{await fn();}catch(e){googleStatus.textContent=e instanceof Error?e.message:'Google Drive request failed.';}finally{googleBusy=false;for(const b of [googleConnect,googleVerify,googleDisconnect,providerSave])b.disabled=false;googleConnect.disabled=!driveConfigured;}}
googleConnect.onclick=()=>googleRun(async()=>{const d=await request('/api/google-drive/start',{method:'POST'});const u=new URL(d.authorizationUrl);if(u.origin!=='https://accounts.google.com')throw Error('The authorization address could not be verified.');location.assign(u.href);});
googleVerify.onclick=()=>googleRun(async()=>{googleStatus.textContent='Testing a private Drive revision and competing saves…';await request('/api/google-drive/verify',{method:'POST'});await refreshGoogle();});
googleDisconnect.onclick=()=>{if(confirm('Disconnect Google Drive from your Explore account? Your Drive files will be kept.'))googleRun(async()=>{const result=await request('/api/google-drive/disconnect',{method:'POST'});await refreshGoogle();if(result.revoked===false)googleStatus.textContent='Disconnected here. Google could not confirm revocation; you can also remove access in your Google account security settings.';});};
providerSave.onclick=()=>googleRun(async()=>{if(!confirm('Use '+(provider.value==='google-drive'?'Google Drive':'WebDAV')+' for new Kōbō app sessions? Libraries are separate and will not be copied.'))return;await request('/api/google-drive/select',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({provider:provider.value})});await refreshGoogle();providerStatus.textContent+=' Reopen any app to use this connection.';});
refreshGoogle().then(()=>{const u=new URL(location.href),result=u.searchParams.get('googleDrive');if(result){if(result==='failed')googleStatus.textContent='Google authorization was not completed. Start again from Connect Google Drive. If it repeats, check the OAuth client and callback setup.';if(result==='cancelled')googleStatus.textContent='Google authorization was cancelled. Your connection was not changed.';u.searchParams.delete('googleDrive');history.replaceState(null,'',u.pathname+u.search);}}).catch(e=>googleStatus.textContent=e.message);
