// Owner-only price/availability exercise. It never creates an order or payment.
export function testBasket(anchor,products,money){
 let items=[],version=0,authorized=true;
 const section=document.createElement('section');section.id='nest-test-basket';section.className='test-basket';anchor.before(section);
 const node=(parent,tag,text)=>{const n=document.createElement(tag);n.textContent=text;parent.append(n);return n;};
 node(section,'h2','Owner test basket');node(section,'p','Try products, colours, quantities, discounts and shipping. No orders, payments or stock movements are created.');
 const list=node(section,'div',''),form=node(section,'form','');form.className='basket-form';
 const stateLabel=node(form,'label','Delivery state'),state=node(stateLabel,'select','');state.name='state';for(const value of ['ACT','NSW','NT','QLD','SA','TAS','VIC','WA']){const o=node(state,'option',value);o.value=value;o.selected=value==='NSW';}
 const postcodeLabel=node(form,'label','Delivery postcode (Australia Post)'),postcode=node(postcodeLabel,'input','');postcode.name='postcode';postcode.type='text';postcode.inputMode='numeric';postcode.maxLength=4;
 const codeLabel=node(form,'label','Discount code'),code=node(codeLabel,'input','');code.type='text';code.maxLength=30;code.name='code';
 const calculate=node(form,'button','Calculate basket estimate');calculate.type='submit';const status=node(section,'p','Add a product below to start.');status.setAttribute('role','status');
 const result=node(section,'div','');result.id='nest-basket-result';
 function changed(){version++;result.replaceChildren();status.textContent='Basket changed. Calculate a fresh estimate.';}
 function render(){list.replaceChildren();for(const item of items){const p=products.find(p=>p.id===item.id),colour=p.colours.find(c=>c.id===item.colourId);const row=node(list,'div','');row.className='basket-item';node(row,'span',p.name+(colour?' · '+colour.name:''));const label=node(row,'label','Quantity'),input=node(label,'input','');input.type='number';input.min='1';input.max='100';input.step='1';input.value=item.quantity;input.onchange=()=>{const n=Number(input.value);if(!Number.isInteger(n)||n<1||n>100){status.textContent='Use quantities from 1 to 100.';input.value=item.quantity;return;}item.quantity=n;changed();};const remove=node(row,'button','Remove');remove.type='button';remove.setAttribute('aria-label','Remove '+p.name+(colour?' '+colour.name:''));remove.onclick=()=>{items=items.filter(i=>i!==item);changed();render();};}calculate.disabled=!items.length;}
 state.onchange=changed;code.oninput=changed;postcode.oninput=changed;
 form.onsubmit=async event=>{event.preventDefault();if(!items.length||!authorized)return;const expected=version;calculate.disabled=true;status.textContent='Checking latest prices, stock and shop availability…';try{
  const response=await fetch('/api/hobbynest/settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:items.map(i=>({...i})),code:code.value,state:state.value,postcode:postcode.value})});
  if([401,403].includes(response.status)){authorized=false;items=[];section.replaceChildren();node(section,'p','Your owner session changed. Sign in again and reopen the test shop.');return;}
  const q=await response.json();if(!response.ok)throw Error(q.error||'Could not estimate this basket.');if(version!==expected){status.textContent='Basket changed. Calculate again for the new quantities.';return;}
  result.replaceChildren();for(const line of q.lines){node(result,'p',`${line.name}${line.colourName?' · '+line.colourName:''} × ${line.quantity}: ${line.message}`);if(!line.channelOpen)node(result,'p',line.channelMessage);}
  node(result,'p',`Merchandise ${money(q.subtotalCents)} · Discount ${money(q.discountCents)}${q.discount?' ('+q.discount.name+')':''}`);
  if(code.value&&!q.codeAccepted)node(result,'p','The entered code is not applicable.');
  for(const rate of q.shipping)node(result,'p',`${rate.name}: ${money(rate.amountCents)} · Total ${money(q.subtotalCents-q.discountCents+rate.amountCents)} · ${rate.minDays===null?'Carrier transit estimate not provided':`Carrier transit ${rate.minDays}–${rate.maxDays} business days after dispatch`}`);
  if(q.shipping.some(rate=>rate.source==='Australia Post PAC'))node(result,'p',q.notice);
  if(q.shippingRequired)node(result,'p',`Combined physical dispatch: ${q.dispatchMinDays}–${q.dispatchMaxDays} business days.`);
  if(!q.shipping.length)node(result,'p','No shipping rate is configured for this destination.');
  status.textContent=q.canTestOrder?'Estimate ready. Real checkout is not enabled.':'This basket cannot proceed under the current shop, stock or shipping settings. No order has been created.';
 }catch(error){status.textContent=error.message;}finally{calculate.disabled=!authorized||!items.length;}};
 render();return {add(product,colourId,quantity){if(!authorized)return;const existing=items.find(i=>i.id===product.id&&i.colourId===colourId);if(existing){if(existing.quantity+quantity>100){status.textContent='Use no more than 100 of a product and colour.';return;}existing.quantity+=quantity;}else items.push({id:product.id,...(colourId?{colourId}:{}),quantity});changed();render();status.textContent=product.name+' added to the test basket.';}};
}
