import {testBasket} from './hobbynest-test-basket.mjs';
const area=document.querySelector('#nest-shop-products');
if(area){
 const status=document.querySelector('#nest-shop-status'),filters=document.querySelector('#nest-shop-filters');
 const money=cents=>new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD'}).format(cents/100);
 function node(parent,tag,text){const element=document.createElement(tag);element.textContent=text;parent.append(element);return element;}
 fetch('/api/hobbynest/catalogue',{cache:'no-store'}).then(async response=>{if(!response.ok)throw Error('The collection is temporarily unavailable. Please try again later.');return response.json();}).then(async data=>{
  let tester=null;if(new URLSearchParams(location.search).get('test')==='1'){const response=await fetch('/api/hobbynest/settings',{cache:'no-store'});if(response.ok)tester=testBasket(area.closest('.catalogue'),data.products,money);else{const p=document.createElement('p');p.textContent='The test basket requires an owner sign-in. Open it from Settings → HobbyNest store → Store controls.';area.closest('.catalogue').before(p);}}
  const storefront=data.storefront||{physicalOpen:false,digitalOpen:false};
  function render(collection=null){
   area.replaceChildren();const products=data.products.filter(p=>!collection||p.collectionIds.includes(collection));status.textContent=products.length?`${products.length} listing${products.length===1?'':'s'} · Preview only`:'The first products are being prepared.';
   for(const p of products){const card=node(area,'article','');
    if(p.images?.length){const gallery=node(card,'div','');gallery.className='product-gallery';const photo=node(gallery,'img','');photo.className='product-photo';photo.src=p.images[0].url;photo.alt=p.images[0].alt;photo.width=600;photo.height=450;photo.loading='lazy';photo.decoding='async';if(p.images.length>1){const thumbs=node(gallery,'div','');thumbs.className='product-thumbs';thumbs.setAttribute('role','group');thumbs.setAttribute('aria-label',`Images for ${p.name}`);for(const [index,image] of p.images.entries()){const button=node(thumbs,'button','');button.type='button';button.setAttribute('aria-label',`View image ${index+1} for ${p.name}`);button.setAttribute('aria-pressed',String(index===0));const thumb=node(button,'img','');thumb.src=image.url;thumb.alt='';thumb.width=44;thumb.height=44;thumb.loading='lazy';button.onclick=()=>{photo.src=image.url;photo.alt=image.alt;for(const b of thumbs.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b===button));};}}}
    node(card,'small',p.kind==='physical'?'Printed product':'Digital STL');node(card,'h3',p.name);node(card,'strong',money(p.priceCents));node(card,'p',p.description);
    const channelOpen=p.kind==='physical'?storefront.physicalOpen:storefront.digitalOpen;node(card,'p',channelOpen?'Available in the test shop · Real checkout coming later':p.kind==='physical'?storefront.physicalMessage:storefront.digitalMessage).className='shop-channel-status';
    const availability=node(card,'p',p.availability.message);availability.className='availability';
    let selectedColour=null,add=null;
    if(p.kind==='physical'){
     const label=node(card,'label','Colour'),select=node(label,'select','');select.setAttribute('aria-label',`Colour for ${p.name}`);
     for(const c of p.colours){const option=node(select,'option',`${c.name} · ${c.stock} ready${!c.stock&&c.availability.available?' · To print':!c.availability.available?' · Unavailable':''}`);option.value=c.id;}
     function choose(){const colour=p.colours.find(c=>c.id===select.value);selectedColour=colour;if(add)add.disabled=!channelOpen||!colour?.availability.available;availability.textContent=colour?`${colour.name}: ${colour.availability.message}`:'Currently unavailable';}
     select.addEventListener('change',choose);choose();
     node(card,'small','Business days to dispatch, then carrier transit. Print-to-order is offered only when filament is available.');
    }else if(p.licence){const licence=node(card,'details','');node(licence,'summary','Licence & permitted use');node(licence,'p',p.licence);}
    if(tester){const controls=node(card,'div','');controls.className='test-product-controls';const label=node(controls,'label','Quantity'),quantity=node(label,'input','');quantity.type='number';quantity.min='1';quantity.max='100';quantity.step='1';quantity.value='1';quantity.setAttribute('aria-label',`Quantity for ${p.name}`);add=node(controls,'button','Add to test basket');add.type='button';add.disabled=!channelOpen||(p.kind==='physical'&&!selectedColour?.availability.available);add.onclick=()=>{const n=Number(quantity.value);if(!Number.isInteger(n)||n<1||n>100){quantity.reportValidity();return;}tester.add(p,selectedColour?.id||null,n);};}else node(card,'p','Orders opening later');
   }
   for(const b of filters.querySelectorAll('button'))b.setAttribute('aria-pressed',String((b.dataset.collection||null)===collection));
  }
  for(const c of [{id:'',name:'All products'},...data.collections]){const button=node(filters,'button',c.name);button.type='button';button.dataset.collection=c.id;button.addEventListener('click',()=>render(c.id||null));}
  render();
 }).catch(error=>{status.textContent=error.message;});
}
