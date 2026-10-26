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
