const area=document.querySelector('#nest-shop-products');
if(area){
 const status=document.querySelector('#nest-shop-status'),filters=document.querySelector('#nest-shop-filters');
 const money=cents=>new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD'}).format(cents/100);
 function node(parent,tag,text){const element=document.createElement(tag);element.textContent=text;parent.append(element);return element;}
 fetch('/api/hobbynest/catalogue',{cache:'no-store'}).then(async response=>{if(!response.ok)throw Error('The collection is temporarily unavailable. Please try again later.');return response.json();}).then(data=>{
  function render(collection=null){
   area.replaceChildren();const products=data.products.filter(p=>!collection||p.collectionIds.includes(collection));status.textContent=products.length?`${products.length} listing${products.length===1?'':'s'} · Preview only`:'The first products are being prepared.';
   for(const p of products){const card=node(area,'article','');node(card,'small',p.kind==='physical'?'Printed product':'Digital STL');node(card,'h3',p.name);node(card,'strong',money(p.priceCents));node(card,'p',p.description);
    const availability=node(card,'p',p.availability.message);availability.className='availability';
    if(p.kind==='physical'){
     const label=node(card,'label','Colour'),select=node(label,'select','');select.setAttribute('aria-label',`Colour for ${p.name}`);
     for(const c of p.colours){const option=node(select,'option',`${c.name} · ${c.stock} ready${!c.stock&&c.availability.available?' · To print':!c.availability.available?' · Unavailable':''}`);option.value=c.id;}
     function choose(){const colour=p.colours.find(c=>c.id===select.value);availability.textContent=colour?`${colour.name}: ${colour.availability.message}`:'Currently unavailable';}
     select.addEventListener('change',choose);choose();
     node(card,'small','Business days to dispatch, then carrier transit. Print-to-order is offered only when filament is available.');
    }else if(p.licence){const licence=node(card,'details','');node(licence,'summary','Licence & permitted use');node(licence,'p',p.licence);}
    node(card,'p','Orders opening later');
   }
   for(const b of filters.querySelectorAll('button'))b.setAttribute('aria-pressed',String((b.dataset.collection||null)===collection));
  }
  for(const c of [{id:'',name:'All products'},...data.collections]){const button=node(filters,'button',c.name);button.type='button';button.dataset.collection=c.id;button.addEventListener('click',()=>render(c.id||null));}
  render();
 }).catch(error=>{status.textContent=error.message;});
}
