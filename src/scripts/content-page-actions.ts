const area=document.querySelector<HTMLElement>('[data-content-actions]');
if(area){const key=area.dataset.contentActions!,[collection,slug]=key.split('/'),status=area.querySelector<HTMLElement>('[role=status]')!;
fetch('/api/studio/session',{cache:'no-store'}).then(async r=>{const data=await r.json();if(r.ok&&data.isOwner)area.hidden=false;}).catch(()=>{});
area.querySelectorAll<HTMLButtonElement>('[data-content-action]').forEach(button=>button.onclick=async()=>{
 const action=button.dataset.contentAction;
 if(action==='delete'&&!confirm('Remove this page from public view and move it to Deleted items? You can restore it as a draft in Studio.'))return;
 button.disabled=true;try{const query='?collection='+collection+'&slug='+encodeURIComponent(slug);const r=await fetch('/api/content/entry'+query,{cache:'no-store'}),record=await r.json();if(!r.ok)throw Error(record.error);
 const result=await fetch('/api/content/manage'+query,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,version:record.version})});const data=await result.json();if(!result.ok)throw Error(data.error);
 location.assign(action==='copy'?'/studio/content/edit?entry='+encodeURIComponent(data.key):'/'+({journal:'journal',essays:'chinaseries',cyber:'dailycyberreport',photography:'photography'}[collection]));
 }catch(error){status.textContent=error instanceof Error?error.message:'The change could not be completed.';button.disabled=false;}
});}
