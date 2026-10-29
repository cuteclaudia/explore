const manager=document.querySelector<HTMLElement>('[data-category-owner]');
if(manager){
 const list=document.getElementById('category-list')!,status=document.getElementById('category-status')!;
 const form=document.getElementById('category-create') as HTMLFormElement,name=document.getElementById('category-name') as HTMLInputElement;
 const reload=document.getElementById('category-reload') as HTMLButtonElement;
 let etag:string|null=null,busy=false,ready=false;
 const controls=()=>{manager.querySelectorAll<HTMLInputElement|HTMLButtonElement|HTMLSelectElement>('input,button,select').forEach(el=>el.disabled=busy||(!ready&&el!==reload)||el.dataset.unavailable==='true');};
 async function load(){busy=true;controls();try{const r=await fetch('/api/writing-categories',{cache:'no-store',signal:AbortSignal.timeout(15000)}),d=await r.json();if(!r.ok)throw Error(d.error||'Categories could not be loaded.');render(d);status.textContent='Add, rename or delete a category. Deleting keeps your articles.';}catch(error){ready=false;status.textContent=(error as Error).message;}finally{busy=false;controls();}}
 function render(data){
  etag=data.etag;ready=true;list.replaceChildren();
  for(const category of data.categories){
   const item=document.createElement('div'),row=document.createElement('div');item.className='category-item';row.className='category-row';
   const input=document.createElement('input');input.value=category.name;input.maxLength=60;input.setAttribute('aria-label','Category name: '+category.name);
   const button=document.createElement('button');button.type='button';button.className='btn ghost';button.textContent='Save name';button.onclick=()=>save({action:'rename',id:category.id,name:input.value});
   const remove=document.createElement('button');remove.type='button';remove.className='btn ghost';remove.textContent='Delete';remove.setAttribute('aria-label','Delete '+category.name);
   if(data.categories.length===1){remove.dataset.unavailable='true';remove.title='Keep at least one writing category.';}
   const panel=document.createElement('div');panel.className='category-delete';panel.hidden=true;
   const explanation=document.createElement('p');explanation.textContent='Delete “'+category.name+'”? Move any articles to another category. Articles and their addresses will be kept.';
   const label=document.createElement('label');label.textContent='Move articles to';const replacement=document.createElement('select');replacement.setAttribute('aria-label','Move articles from '+category.name+' to');
   for(const destination of data.categories)if(destination.id!==category.id)replacement.add(new Option(destination.name,destination.id));label.append(replacement);
   const confirm=document.createElement('button');confirm.type='button';confirm.className='btn';confirm.textContent='Confirm delete';confirm.onclick=()=>save({action:'delete',id:category.id,replacement:replacement.value});
   const cancel=document.createElement('button');cancel.type='button';cancel.className='btn ghost';cancel.textContent='Cancel';cancel.onclick=()=>{panel.hidden=true;remove.focus();};
   remove.onclick=()=>{panel.hidden=false;replacement.focus();};panel.append(explanation,label,confirm,cancel);row.append(input,button,remove);item.append(row,panel);list.append(item);
  }
 }

 async function save(change){if(busy||!ready)return;busy=true;controls();status.textContent='Saving category…';try{const r=await fetch('/api/writing-categories',{method:'PUT',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({...change,etag,expectedAccount:manager.dataset.categoryOwner}),signal:AbortSignal.timeout(15000)}),d=await r.json();if(!r.ok){if(r.status===409||r.status===401||r.status===403)ready=false;throw Error(d.error||'Category could not be saved.');}render(d);if(change.action==='create')name.value='';status.textContent=change.action==='delete'?'Category deleted. Existing articles use the selected category. Reload the writing page to see the change.':'Category saved. The writing page and article category list update on their next load.';}catch(error){if(error instanceof TypeError||['TimeoutError','AbortError'].includes((error as Error).name)){ready=false;status.textContent='The save result could not be confirmed. Reload categories before retrying.';}else status.textContent=(error as Error).message;}finally{busy=false;controls();}}
 form.onsubmit=event=>{event.preventDefault();void save({action:'create',name:name.value});};reload.onclick=()=>void load();
 void load();
}
