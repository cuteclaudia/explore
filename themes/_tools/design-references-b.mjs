// Uplift batch B design references: restaurant-cafe, professional-practice, writer-author,
// wellness-clinic, stay. Rendered by design-references.mjs (same page shell and rules).
import { FONT_STACKS } from './catalogue.mjs';
import { esc, pic, txt } from './design-kit.mjs';

// ---------------------------------------------------------------------------------------------
// 3 · Restaurant & café
// ---------------------------------------------------------------------------------------------
const restaurant = {
  id: 'restaurant-cafe',
  scheme: 'light',
  css: `
.info{background:var(--accent);color:var(--onAccent);font-size:13px;font-weight:600}.info .wrap{display:flex;justify-content:space-between;gap:16px;padding-top:9px;padding-bottom:9px}
.info .open::before{content:"";display:inline-block;width:8px;height:8px;border-radius:50%;background:#9be29b;margin-right:8px;vertical-align:1px}
.head{background:var(--bg);border-bottom:1px solid var(--border)}.head .wrap{display:flex;align-items:center;gap:30px;padding-top:16px;padding-bottom:16px}
.logo{font:700 26px/1 var(--head);letter-spacing:-.01em}.logo small{display:block;font:600 11px/1 var(--body);letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-top:6px}
.head nav{display:flex;gap:26px;margin-left:auto;font-weight:600}
.hero{position:relative;min-height:640px;color:var(--heroText);background:var(--heroShade)}
.hero .pic,.hero .slot{position:absolute;inset:0;aspect-ratio:auto!important;height:100%}.hero .slot{color:#ffffffbb;border-color:#ffffff55}
.hero .shade{position:absolute;inset:0;background:linear-gradient(90deg,color-mix(in srgb,var(--heroShade) 86%,transparent),color-mix(in srgb,var(--heroShade) 20%,transparent) 65%)}
.hero .wrap{position:relative;display:flex;flex-direction:column;justify-content:center;min-height:540px;padding-top:56px;padding-bottom:40px}
.hero h1{font-size:clamp(48px,6.4vw,92px);font-weight:700;letter-spacing:-.015em;margin:14px 0 18px;max-width:780px}
.hero p{font-size:20px;max-width:560px;color:color-mix(in srgb,var(--heroText) 90%,transparent)}
.hero .eyebrow{color:var(--art2)}.hero .btns{display:flex;gap:12px;margin-top:22px;flex-wrap:wrap}.hero .btn:not(.primary){background:#ffffff1a;color:var(--heroText);border-color:#ffffff70}
.facts{position:relative;max-width:var(--max);margin:0 auto;padding:0 5%;transform:translateY(50%)}
.facts .row{display:grid;grid-template-columns:repeat(3,1fr);background:var(--surface);color:var(--text);border-radius:var(--radius);box-shadow:0 18px 40px #0003}
.facts .row div{padding:20px 24px;border-right:1px solid var(--border)}.facts .row div:last-child{border:0}
.facts b{display:block;font:700 13px/1 var(--body);letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin-bottom:8px}
.after-hero{height:70px}
.menu-wrap{display:grid;grid-template-columns:7fr 5fr;gap:56px;align-items:start}.menu-wrap>*{min-width:0}
.shead{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:22px}.shead h2{font-size:clamp(34px,4vw,52px);font-weight:700}.shead a{white-space:nowrap}
.tabs{display:flex;gap:8px;flex-wrap:nowrap;overflow-x:auto;margin-bottom:22px}.tabs span{padding:8px 16px;border-radius:999px;border:1px solid var(--border);font-weight:600;font-size:14px;white-space:nowrap;background:var(--surface)}.tabs span.on{background:var(--text);color:var(--bg);border-color:var(--text)}
.menu{list-style:none;margin:0;padding:0}.menu li{padding:16px 0;border-bottom:1px dashed var(--border)}
.menu .line{display:flex;align-items:baseline;gap:10px;font:700 21px/1.25 var(--head)}.menu .line::after{content:"";order:2;flex:1;border-bottom:2px dotted color-mix(in srgb,var(--muted) 50%,transparent);transform:translateY(-5px)}
.menu .price{order:3;font:700 19px/1 var(--body);color:var(--accent)}.menu p{margin:6px 0 0;color:var(--muted);font-size:15px}
.menu-wrap .pic,.menu-wrap .slot{border-radius:var(--radius)}
.note{font-size:13px;color:var(--muted);margin-top:16px}
.pizza{background:var(--heroShade);color:var(--heroText)}.pizza .wrap{display:grid;grid-template-columns:6fr 5fr;gap:56px;align-items:center;padding-top:72px;padding-bottom:72px}
.pizza .pic,.pizza .slot{border-radius:var(--radius)}.pizza .slot{color:#ffffffbb;border-color:#ffffff55}
.pizza h2{font-size:clamp(36px,4vw,56px);margin:14px 0 14px}.pizza p{color:color-mix(in srgb,var(--heroText) 85%,transparent);font-size:18px}.pizza .eyebrow{color:var(--art2)}
.pizza ul{list-style:none;padding:0;margin:20px 0 26px;display:grid;gap:8px}.pizza li::before{content:"— ";color:var(--art2)}
.bake{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}.bake figure{margin:0}.bake .pic,.bake .slot{border-radius:var(--radius)}
.bake figcaption{margin-top:12px}.bake figcaption b{display:block;font:700 22px/1.2 var(--head)}.bake figcaption span{color:var(--muted);font-size:15px}
.story{display:grid;grid-template-columns:4fr 7fr;gap:64px;align-items:center}.story .pic,.story .slot{border-radius:var(--radius)}
.story h2{font-size:clamp(34px,3.8vw,48px);margin:12px 0 16px}.story p{font-size:18px;color:var(--muted)}
.story blockquote{margin:22px 0 0;padding-left:18px;border-left:3px solid var(--accent);font:italic 400 20px/1.4 ${FONT_STACKS.serif}}
.find{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:stretch}
.hours{width:100%;border-collapse:collapse;font-size:15px}.hours td{padding:10px 0;border-bottom:1px solid var(--border)}.hours td:last-child{text-align:right;font-weight:600}.hours tr.today td{color:var(--accent)}
.mapbox{border-radius:var(--radius);border:1px solid var(--border);background:var(--surface);display:grid;place-items:center;text-align:center;min-height:220px;padding:20px;color:var(--muted);font-size:14px;margin-top:20px}
.mapbox b{display:block;color:var(--text);font-size:16px;margin-bottom:6px}
.find .pic,.find .slot{border-radius:var(--radius);height:100%;aspect-ratio:auto!important;min-height:420px}
.book{background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border);text-align:center;padding:72px 5%}
.book h2{font-size:clamp(36px,4.4vw,58px)}.book p{color:var(--muted);margin:12px auto 24px;max-width:520px}
footer{padding:40px 0 60px;font-size:14px;color:var(--muted)}footer .wrap{display:grid;grid-template-columns:2fr 1fr 1fr;gap:30px}footer b{color:var(--text)}
.actionbar{display:none}
@media (max-width:760px){
 .info .wrap{justify-content:center}.info .wrap>span:last-child{display:none}
 .head nav{display:none}.head .wrap{justify-content:space-between}.logo{font-size:22px}
 .hero{min-height:560px}.hero .wrap{min-height:470px}.hero h1{font-size:46px}.hero p{font-size:17px}
 .hero .shade{background:linear-gradient(0deg,color-mix(in srgb,var(--heroShade) 88%,transparent) 15%,color-mix(in srgb,var(--heroShade) 25%,transparent) 85%)}
 .facts{transform:none;margin-top:-30px}.facts .row{grid-template-columns:1fr}.facts .row div{border-right:0;border-bottom:1px solid var(--border);padding:14px 18px}
 .after-hero{height:0}
 .menu-wrap,.pizza .wrap,.story,.find{grid-template-columns:1fr;gap:28px}.menu-wrap>.pic,.menu-wrap>.slot{order:-1}
 .bake{grid-template-columns:1fr 1fr}.bake figure:last-child{display:none}.bake figcaption b{font-size:18px}
 .find .pic,.find .slot{min-height:240px}
 footer .wrap{grid-template-columns:1fr}
 .actionbar{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:10px 12px 14px;background:var(--surface);border-top:1px solid var(--border)}
 .actionbar::before{content:'Phone action bar · fixed to the bottom of the screen while scrolling';grid-column:1/-1;font-size:11px;color:var(--muted);text-align:center}
 .actionbar .btn{justify-content:center}
}`,
  body(ctx) {
    const s = (v, h) => txt(ctx, v, h);
    const menu = ctx.empty ? [['Dish name', 'Short description', 'Price']] : [['Sourdough & cultured butter', 'House sourdough, whipped butter, sea salt.', '$9'], ['Big breakfast', 'Eggs your way, bacon, mushrooms, greens, toast.', '$24'], ['Smashed avocado', 'Lemon, chilli, feta and dukkah on rye.', '$19'], ['Pumpkin & ricotta tart', 'Seasonal leaves, toasted seeds.', '$19'], ['Bircher muesli', 'Apple, yoghurt, poached rhubarb.', '$15']];
    return `
<div class="info"><div class="wrap"><span class="open">${s('Open today · 7 am – 3 pm', 'Today’s hours (from your opening hours)')}</span><span>${s('Friday pizza nights from 5 pm', 'Something worth knowing (optional)')}</span></div></div>
<header class="head"><div class="wrap"><a class="logo" href="#">Harbour &amp; Pine<small>${s('Café · Kitchen · Bakery', 'What you are')}</small></a><nav aria-label="Main"><a href="#">Menu</a><a href="#">Gallery</a><a href="#">About</a><a href="#">Bookings</a></nav><a class="btn primary" href="#">Book a table</a></div></header>
<section class="hero" aria-label="Welcome">
 ${pic(ctx, 'hero-cafe', 'Photo of your café or your food · landscape, at least 2400 px wide', '16/9', '60% 50%')}
 ${ctx.empty ? '' : '<div class="shade"></div>'}
 <div class="wrap"><span class="eyebrow">${s('Since 2014 · by the harbour', 'Short tagline')}</span><h1>${s('Good bread. Strong coffee.', 'Your headline')}</h1><p>${s('Breakfast and lunch every day, wood-fired pizza on Friday nights.', 'What you serve, and when')}</p><div class="btns"><a class="btn primary" href="#">See the menu</a><a class="btn" href="#">Book a table</a></div></div>
 <div class="facts"><div class="row">${[['Open', 'Daily 7 am – 3 pm · Fri until 9 pm', 'Opening hours'], ['Find us', '12 Example Street, Harbourtown', 'Address'], ['Call', '(02) 5550 0123', 'Phone']].map(([b, v, h]) => `<div><b>${b}</b>${s(v, h)}</div>`).join('')}</div></div>
</section>
<div class="after-hero"></div>
<section class="wrap section menu-wrap" aria-label="Menu">
 <div><div class="shead"><h2>From the kitchen</h2><a href="#" style="font-weight:700">Full menu →</a></div>
 <div class="tabs">${(ctx.empty ? ['Menu section'] : ['Breakfast', 'Lunch', 'Bakery', 'Friday pizza', 'Drinks']).map((t, i) => `<span class="${i === 0 ? 'on' : ''}">${t}</span>`).join('')}</div>
 <ul class="menu">${menu.map(([n, d, p]) => `<li><div class="line"><span>${ctx.empty ? `<span class="hint">${n}</span>` : esc(n)}</span><span class="price">${ctx.empty ? `<span class="hint">${p}</span>` : p}</span></div><p>${ctx.empty ? `<span class="hint">${d}</span>` : esc(d)}</p></li>`).join('')}</ul>
 <p class="note">${s('Gluten-free bread available. Tell us about allergies when you order.', 'Dietary note (optional)')}</p></div>
 ${pic(ctx, 'breakfast', 'Photo of your food', '4/5', '50% 50%')}
</section>
<section class="pizza" aria-label="Friday pizza"><div class="wrap">
 ${pic(ctx, 'pizza-oven', 'Photo for your special night or event', '4/3', '45% 55%')}
 <div><span class="eyebrow">${s('Every Friday from 5 pm', 'When')}</span><h2>${s('Friday pizza nights', 'Feature heading')}</h2><p>${s('The wood oven gets lit at three. Long-fermented dough, local toppings, and a short list of wine and beer.', 'A few sentences about it')}</p><ul>${ctx.empty ? '<li><span class="hint" style="color:inherit">Up to three short points</span></li>' : '<li>Walk-ins welcome, bookings for six or more</li><li>Takeaway from the side window</li><li>Kids’ pizzas until 7 pm</li>'}</ul><a class="btn primary" href="#">Book Friday</a></div>
</div></section>
<section class="wrap section" aria-label="From the bakery">
 <div class="shead"><h2>From the bakery</h2><a href="#" style="font-weight:700">Gallery →</a></div>
 <div class="bake">${[['sourdough', 'Sourdough', 'Baked every morning from 5 am.', '50% 50%'], ['pastry-counter', 'Pastries', 'Gone by eleven, most days.', '50% 50%'], ['latte', 'Coffee', 'Roasted two streets away.', '50% 45%']].map(([f, b, sp, focal]) => `<figure>${pic(ctx, f, 'Photo', '1/1', focal)}<figcaption><b>${s(b, 'Caption')}</b><span>${s(sp, 'One line')}</span></figcaption></figure>`).join('')}</div>
</section>
<section class="wrap section story" aria-label="About" style="padding-top:0">
 ${pic(ctx, 'chef', 'Photo of you or your team', '4/5', '50% 35%')}
 <div><span class="eyebrow">Our story</span><h2>${s('A neighbourhood café since 2014', 'About heading')}</h2><p>${s('We started with one oven and a borrowed coffee machine. Ten years on, we still bake everything here, buy from growers we know by name, and keep a table by the window for regulars.', 'A short story from your About page')}</p><blockquote>${s('“Come early for the cinnamon scrolls.”', 'A line you are known for (optional)')}</blockquote></div>
</section>
<section class="wrap section find" aria-label="Find us" style="padding-top:0">
 <div><div class="shead"><h2>Find us</h2></div><table class="hours"><tbody>${(ctx.empty ? [['Day', 'Hours']] : [['Monday – Thursday', '7 am – 3 pm'], ['Friday', '7 am – 9 pm'], ['Saturday', '7 am – 3 pm'], ['Sunday', '8 am – 2 pm'], ['Public holidays', 'Check our socials']]).map(([d, h], i) => `<tr class="${i === 1 && !ctx.empty ? 'today' : ''}"><td>${ctx.empty ? `<span class="hint">${d}</span>` : d}</td><td>${ctx.empty ? `<span class="hint">${h}</span>` : h}</td></tr>`).join('')}</tbody></table>
 <div class="mapbox"><div><b>Map</b>${ctx.empty ? 'Optional outside widget' : 'Loads from the map provider when you choose “Show map”.'}<br><br><span class="btn">Show map</span></div></div></div>
 ${pic(ctx, 'street-tables', 'Photo of your front or your tables', '4/5', '50% 50%')}
</section>
<section class="book" aria-label="Book a table"><h2>${s('Book a table', 'Booking heading')}</h2><p>${s('Bookings for groups of six or more. Walk-ins are always welcome.', 'How bookings work')}</p><a class="btn primary" href="#">Request a booking</a></section>
<footer><div class="wrap"><div><b>Harbour &amp; Pine</b><p>${s('12 Example Street, Harbourtown', 'Address')}</p>${ctx.empty ? '' : '<p class="credit">Stock photographs on Pexels: Nguyễn Khanh, Lauren Heaton, Roman Odintsov, Quang Nguyen Vinh, Katie Barget, Faheem Ahamad, Anastasia Shuraeva, Willians Huerta.</p>'}</div><div><b>Contact</b><p>${s('(02) 5550 0123', 'Phone')}<br>${s('hello@example.com', 'Email')}</p></div><div><b>Follow</b><p>${ctx.empty ? 'Social links' : 'Instagram · Newsletter'}</p></div></div></footer>
<div class="actionbar"><a class="btn" href="#">Call</a><a class="btn primary" href="#">Book a table</a></div>`;
  }
};

// ---------------------------------------------------------------------------------------------
// 5 · Professional practice
// ---------------------------------------------------------------------------------------------
const practice = {
  id: 'professional-practice',
  scheme: 'light',
  css: `
.head{border-bottom:1px solid var(--border)}.head .wrap{display:flex;align-items:center;gap:30px;padding-top:22px;padding-bottom:22px}
.mark{font:500 26px/1 var(--head);letter-spacing:.01em}.mark small{display:block;font:500 11px/1 var(--body);letter-spacing:.26em;text-transform:uppercase;color:var(--muted);margin-top:8px}
.head nav{display:flex;gap:30px;margin-left:auto;font-size:15px}
.hero .wrap{display:grid;grid-template-columns:7fr 4fr;gap:60px;align-items:end;padding-top:96px;padding-bottom:56px}
.hero h1{font-size:clamp(46px,5.6vw,80px);font-weight:500;letter-spacing:-.015em;line-height:1.05}
.hero p{font-size:19px;color:var(--muted);margin:0 0 22px}
.hero .btns{display:flex;gap:12px;flex-wrap:wrap}
.band .pic,.band .slot{aspect-ratio:21/8;width:100%}
.areas{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--text)}
.areas a{padding:28px 28px 30px 0;border-bottom:1px solid var(--border);display:grid;grid-template-columns:44px 1fr;gap:6px 14px}
.areas a:nth-child(3n+2),.areas a:nth-child(3n){padding-left:28px;border-left:1px solid var(--border)}
.areas span{font:500 14px/1.8 var(--body);color:var(--accent)}.areas h3{font-size:26px;font-weight:500}.areas p{grid-column:2;margin:0;color:var(--muted);font-size:15px}
.shead{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:30px}.shead h2{font-size:clamp(32px,3.6vw,46px);font-weight:500}
.how{display:grid;grid-template-columns:6fr 5fr;gap:64px;align-items:center}
.how ol{list-style:none;margin:22px 0 0;padding:0;counter-reset:h}.how li{counter-increment:h;display:grid;grid-template-columns:52px 1fr;padding:18px 0;border-top:1px solid var(--border)}
.how li::before{content:counter(h,decimal-leading-zero);font:500 22px/1.2 var(--head);color:var(--accent)}.how b{display:block;font:500 21px/1.3 var(--head);margin-bottom:4px}.how li p{margin:0;color:var(--muted)}
.ins{display:grid;grid-template-columns:7fr 5fr;gap:40px}
.ins .lead .pic,.ins .lead .slot{margin-bottom:18px}.ins .lead h3{font-size:32px;font-weight:500;margin:10px 0}
.ins .more a{display:block;padding:20px 0;border-top:1px solid var(--border)}.ins .more h3{font-size:22px;font-weight:500;margin:8px 0 6px}.ins p{color:var(--muted);margin:0}
.meta{font:600 12px/1 var(--body);letter-spacing:.14em;text-transform:uppercase;color:var(--accent)}
.people{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}.people .pic,.people .slot{filter:grayscale(.2);margin-bottom:14px}
.people b{display:block;font:500 20px/1.3 var(--head)}.people span{color:var(--muted);font-size:14px}
.office{background:var(--heroShade);color:var(--heroText)}.office .wrap{display:grid;grid-template-columns:4fr 7fr;gap:64px;align-items:center;padding-top:72px;padding-bottom:72px}
.office .slot{color:#ffffffbb;border-color:#ffffff55}
.office h2{font-size:clamp(34px,4vw,52px);font-weight:500;margin-bottom:14px}.office p{color:color-mix(in srgb,var(--heroText) 82%,transparent);font-size:18px}
.office dl{display:grid;grid-template-columns:1fr 1fr;gap:18px 30px;margin:26px 0;font-size:15px}.office dt{font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:color-mix(in srgb,var(--heroText) 70%,transparent)}.office dd{margin:4px 0 0}
.office .btn{background:var(--heroText);color:var(--heroShade);border-color:var(--heroText)}
footer{padding:36px 0 56px;font-size:13px;color:var(--muted)}footer .wrap{display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap}
@media (max-width:760px){
 .head nav{display:none}.head .wrap{justify-content:space-between}.mark{font-size:22px}
 .hero .wrap{grid-template-columns:1fr;gap:20px;padding-top:44px;padding-bottom:36px}.hero h1{font-size:42px}
 .band .pic,.band .slot{aspect-ratio:4/3}
 .areas{grid-template-columns:1fr}.areas a,.areas a:nth-child(3n+2),.areas a:nth-child(3n){padding:20px 0;border-left:0}.areas h3{font-size:22px}
 .how,.ins,.office .wrap{grid-template-columns:1fr;gap:28px}
 .people{grid-template-columns:1fr 1fr;gap:16px}
 .office dl{grid-template-columns:1fr}
}`,
  body(ctx) {
    const s = (v, h) => txt(ctx, v, h);
    const areas = [['Property', 'Buying, selling and leasing, from contract to settlement.'], ['Wills & estates', 'Wills, powers of attorney and estate administration.'], ['Business', 'Structures, agreements and the paperwork behind growth.'], ['Family', 'Separation, property settlements and parenting arrangements.'], ['Employment', 'Advice for employers and employees, contracts to disputes.'], ['Tax & accounting', 'Returns, planning and compliance with our accounting team.']];
    return `
<header class="head"><div class="wrap"><a class="mark" href="#">Whitfield Lane<small>${s('Lawyers & advisers', 'What you do')}</small></a><nav aria-label="Main"><a href="#">Our firm</a><a href="#">Services</a><a href="#">Insights</a><a href="#">Contact</a></nav><a class="btn" href="#">Arrange a meeting</a></div></header>
<section class="hero"><div class="wrap"><h1>${s('Clear advice for important decisions.', 'Your headline')}</h1><div><p>${s('Property, wills and estates, business and family law for local families and small businesses, explained in plain English.', 'Who you help and how')}</p><div class="btns"><a class="btn primary" href="#">Arrange a meeting</a><a class="btn" href="#">Our services</a></div></div></div></section>
<section class="band" aria-label="The practice">${pic(ctx, 'hero-meeting-room', 'Wide photo of your office or meeting room', '21/8', '50% 55%')}</section>
<section class="wrap section" aria-label="Services">
 <div class="shead"><h2>How we can help</h2><a href="#">All services →</a></div>
 <div class="areas">${(ctx.empty ? areas.slice(0, 3).map(() => ['Service', 'One sentence about this service']) : areas).map(([h, p], i) => `<a href="#"><span>${String(i + 1).padStart(2, '0')}</span><h3>${ctx.empty ? `<span class="hint">${h}</span>` : h}</h3><p>${ctx.empty ? `<span class="hint">${p}</span>` : p}</p></a>`).join('')}</div>
</section>
<section class="wrap section how" aria-label="How we work" style="padding-top:0">
 ${pic(ctx, 'consultation', 'Photo of your office or a meeting', '4/3', '45% 50%')}
 <div><span class="eyebrow">How we work</span><h2 style="font-size:clamp(32px,3.6vw,46px);font-weight:500;margin-top:12px">${s('No surprises, start to finish', 'Heading')}</h2>
 <ol>${[['Plain English', 'We explain your options and their risks before you decide anything.'], ['Fees agreed up front', 'A written estimate, and we tell you before anything changes.'], ['Updates at every step', 'One contact, who replies within one business day.']].map(([b, p]) => `<li><div><b>${s(b, 'Principle')}</b><p>${s(p, 'One sentence')}</p></div></li>`).join('')}</ol></div>
</section>
<section class="wrap section" aria-label="Insights" style="padding-top:0">
 <div class="shead"><h2>Recent insights</h2><a href="#">All insights →</a></div>
 <div class="ins"><a class="lead" href="#">${pic(ctx, 'signing', 'Photo for your latest article', '16/9', '50% 50%')}<span class="meta">${s('Estates · 6 min read', 'Topic · reading time')}</span><h3>${s('Five life changes that mean it’s time to update your will', 'Article title')}</h3><p>${s('Marriage, separation, a new business or a move interstate can all change what your will does.', 'Summary')}</p></a>
 <div class="more">${[['Property · 4 min', 'What to check before you sign a contract'], ['Business · 5 min', 'The partnership agreement worth having in writing'], ['Employment · 3 min', 'Casual or part-time? What the difference means']].map(([m, h]) => `<a href="#"><span class="meta">${s(m, 'Topic · time')}</span><h3>${s(h, 'Article title')}</h3></a>`).join('')}</div></div>
</section>
<section class="wrap section" aria-label="Our people" style="padding-top:0">
 <div class="shead"><h2>Our people</h2><a href="#">Meet the team →</a></div>
 <div class="people">${[['person-1', 'A. Whitfield', 'Principal · Property & estates'], ['person-2', 'R. Lane', 'Partner · Business'], ['person-3', 'S. Okafor', 'Senior associate · Family'], ['person-4', 'J. Chen', 'Accountant · Tax']].map(([f, n, r]) => `<div>${pic(ctx, f, 'Portrait', '4/5', '50% 25%')}<b>${s(n, 'Name')}</b><span>${s(r, 'Role · area')}</span></div>`).join('')}</div>
</section>
<section class="office" aria-label="Contact"><div class="wrap">
 ${pic(ctx, 'building', 'Photo of your building or street', '3/4', '50% 40%')}
 <div><span class="eyebrow" style="color:inherit;opacity:.75">Arrange a first meeting</span><h2>${s('A first conversation is free and confidential.', 'Contact heading')}</h2><p>${s('Tell us a little about what you need and we’ll suggest the right person and a time.', 'What happens next')}</p>
 <dl><div><dt>Office</dt><dd>${s('Level 2, 40 Example Street, Riverbend', 'Address')}</dd></div><div><dt>Hours</dt><dd>${s('Mon–Fri 8.30 am – 5.30 pm', 'Hours')}</dd></div><div><dt>Phone</dt><dd>${s('(02) 5550 0789', 'Phone')}</dd></div><div><dt>Email</dt><dd>${s('enquiries@example.com', 'Email')}</dd></div></dl>
 <a class="btn" href="#">Contact the firm</a></div>
</div></section>
<footer><div class="wrap"><span>© 2026 Whitfield Lane Partners</span><span>${s('Information on this site is general and isn’t legal advice for your situation.', 'Disclaimer your profession requires')}</span>${ctx.empty ? '' : '<span class="credit" style="flex-basis:100%">Stock photographs on Pexels: Ksenia Chernaya, Kindel Media, Matthias Zomer, Caio Mantovani, Timur Weber, Zoe Galarza, Speak Media Uganda, Mikhail Nilov.</span>'}</div></footer>`;
  }
};

// ---------------------------------------------------------------------------------------------
// 7 · Writer & author
// ---------------------------------------------------------------------------------------------
const writer = {
  id: 'writer-author',
  scheme: 'light',
  css: `
.read{max-width:700px;margin:0 auto;padding-left:6%;padding-right:6%}
.head{text-align:center;padding:40px 0 20px}.head .name{font:400 34px/1 var(--head);letter-spacing:.01em}
.head nav{display:flex;justify-content:center;gap:28px;margin-top:18px;font-size:15px;font-style:italic;font-family:var(--head)}.head nav a.on{color:var(--accent)}
.rule{width:56px;height:1px;background:var(--text);margin:26px auto 0}
.intro{text-align:center;padding:72px 0 64px}.intro h1{font-size:clamp(42px,5.4vw,72px);font-weight:400;font-style:italic;max-width:880px;margin:0 auto}
.intro p{font-size:20px;color:var(--muted);max-width:560px;margin:20px auto 0}
.feature{max-width:1100px;margin:0 auto;padding:0 5%}.feature .pic,.feature .slot{aspect-ratio:2/1}
.feature .card{max-width:700px;margin:-90px auto 0;position:relative;background:var(--bg);padding:36px 44px 8px;text-align:center}
.feature .meta{font:600 12px/1 var(--body);letter-spacing:.18em;text-transform:uppercase;color:var(--accent)}
.feature h2{font-size:clamp(34px,4vw,52px);font-weight:400;margin:14px 0 12px}.feature p{font-size:19px;color:var(--muted)}
.feature .more{font-family:var(--head);font-style:italic;color:var(--accent);font-size:18px}
.list h2{font:400 15px/1 var(--body);letter-spacing:.2em;text-transform:uppercase;text-align:center;color:var(--muted);margin-bottom:26px}
.list a{display:block;padding:26px 0;border-top:1px solid var(--border)}.list a:last-child{border-bottom:1px solid var(--border)}
.list .m{font-size:13px;color:var(--muted);letter-spacing:.06em}.list h3{font-size:30px;font-weight:400;margin:8px 0 8px}.list p{margin:0;color:var(--muted);font-size:17px}
.list .all{text-align:center;margin-top:26px;font-style:italic;font-family:var(--head);font-size:18px;color:var(--accent)}
.book{background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}.book .wrap{display:grid;grid-template-columns:4fr 7fr;gap:72px;align-items:center;padding-top:80px;padding-bottom:80px;max-width:1000px}
.cover{aspect-ratio:2/3;background:var(--art1);color:#f6f1e6;display:flex;flex-direction:column;justify-content:space-between;padding:34px 30px;box-shadow:12px 16px 0 color-mix(in srgb,var(--art1) 30%,transparent),0 20px 50px #0003}
.cover b{font:400 34px/1.1 var(--head);font-style:italic}.cover span{font:500 12px/1.4 var(--body);letter-spacing:.24em;text-transform:uppercase}
.cover i{display:block;width:44px;height:1px;background:currentColor;margin:18px 0}
.book h2{font-size:clamp(34px,4vw,50px);font-weight:400;font-style:italic;margin:12px 0 14px}.book p{font-size:18px;color:var(--muted)}
.book blockquote{margin:22px 0;font:italic 400 20px/1.45 var(--head)}.book cite{display:block;font:normal 13px/1 var(--body);color:var(--muted);margin-top:8px}
.buy{display:flex;gap:10px;flex-wrap:wrap}
.letters{display:grid;grid-template-columns:5fr 6fr;gap:56px;align-items:center;max-width:1000px;margin:0 auto;padding-left:5%;padding-right:5%}
.letters h2{font-size:clamp(32px,3.6vw,44px);font-weight:400;font-style:italic;margin:10px 0 12px}.letters p{color:var(--muted);font-size:17px}
.field{min-height:46px;border:1px solid var(--border);background:var(--surface);display:flex;align-items:center;padding:0 16px;color:var(--muted);font-size:15px;margin:18px 0 10px}
.about{display:grid;grid-template-columns:4fr 6fr;gap:56px;align-items:center;max-width:1000px;margin:0 auto;padding-left:5%;padding-right:5%}
.about .pic,.about .slot{filter:grayscale(1)}.about h2{font-size:40px;font-weight:400;margin:10px 0 14px}.about p{color:var(--muted);font-size:18px}
footer{text-align:center;padding:56px 5% 64px;font-size:14px;color:var(--muted)}footer .name{font:400 24px/1 var(--head);color:var(--text);margin-bottom:12px}
@media (max-width:760px){
 .head{padding:26px 0 12px}.head .name{font-size:28px}.head nav{gap:18px}
 .intro{padding:44px 0 40px}.intro h1{font-size:38px}.intro p{font-size:17px}
 .feature{padding:0}.feature .pic,.feature .slot{aspect-ratio:4/3}.feature .card{margin:-40px 4% 0;padding:24px 20px 4px}
 .list h3{font-size:24px}
 .book .wrap,.letters,.about{grid-template-columns:1fr;gap:30px}.cover{max-width:220px;margin:0 auto}
}`,
  body(ctx) {
    const s = (v, h) => txt(ctx, v, h);
    return `
<header class="head"><a class="name" href="#">Ellen Moray</a><nav aria-label="Main"><a class="on" href="#">Essays</a><a href="#">Notes</a><a href="#">Books</a><a href="#">About</a><a href="#">Contact</a></nav><div class="rule"></div></header>
<section class="read intro" aria-label="Introduction" style="max-width:none"><h1>${s('Small stories about large places.', 'A line that sums up your writing')}</h1><p>${s('Essays and fiction on landscape, memory and the towns people leave.', 'One sentence about what you write')}</p></section>
<section class="feature" aria-label="Latest essay">
 ${pic(ctx, 'foggy-town', 'Image for your latest piece · wide', '2/1', '50% 55%')}
 <div class="card"><span class="meta">${s('New essay · 14 min read', 'Type · reading time')}</span><h2>${s('Winter at the edge of town', 'Title of your latest piece')}</h2><p>${s('On fog, footy ovals, and the people who stay when everyone else has left for the city.', 'Opening line or summary')}</p><p class="more">Read the essay →</p></div>
</section>
<section class="read section list" aria-label="Recent essays">
 <h2>Recent essays</h2>
 ${(ctx.empty ? [['Date · reading time', 'Essay title', 'Summary']] : [['October 2026 · 12 min', 'The river remembers its floods', 'On living somewhere that keeps changing shape.'], ['August 2026 · 8 min', 'A year of letters', 'What happened when I stopped texting and started posting things.'], ['June 2026 · 20 min', 'The last bus to Greywater', 'A short story.'], ['April 2026 · 6 min', 'In praise of the second-hand bookshop', 'Notes from the shelves where nothing is in order.']]).map(([m, h, p]) => `<a href="#"><span class="m">${ctx.empty ? `<span class="hint">${m}</span>` : m}</span><h3>${ctx.empty ? `<span class="hint">${h}</span>` : h}</h3><p>${ctx.empty ? `<span class="hint">${p}</span>` : p}</p></a>`).join('')}
 <p class="all">All essays →</p>
</section>
<section class="book" aria-label="Book"><div class="wrap">
 ${ctx.empty ? '<div class="slot" style="aspect-ratio:2/3"><span>Your book cover<br><small>2:3 · upload the cover, or let SoraSpace set the title in type</small></span></div>' : '<div class="cover" role="img" aria-label="Book cover: The Weather Inside"><span>Ellen Moray</span><div><i></i><b>The Weather Inside</b><i></i></div><span>Essays</span></div>'}
 <div><span class="eyebrow">${s('New book · March 2027', 'Book news')}</span><h2>${s('The Weather Inside', 'Book title')}</h2><p>${s('Twelve essays about small towns, big skies and the long work of staying put.', 'One or two sentences about the book')}</p><blockquote>${s('“Quietly devastating, and very funny.”', 'A short review quote (optional, genuine)')}<cite>${s('Sample quote — use a real, attributed review', 'Source')}</cite></blockquote><div class="buy"><a class="btn primary" href="#">Where to buy</a><a class="btn" href="#">Read an extract</a></div></div>
</div></section>
<section class="section letters" aria-label="Newsletter">
 ${pic(ctx, 'letters', 'Image for your newsletter (optional)', '4/3', '50% 50%')}
 <div><span class="eyebrow">Letters</span><h2>${s('A letter, once a month', 'Newsletter heading')}</h2><p>${s('New essays, what I’m reading, and the occasional photograph of a cloud. No tracking.', 'What readers will get')}</p><div class="field">Email address</div><a class="btn primary" href="#">Subscribe</a></div>
</section>
<section class="section about" aria-label="About" style="padding-top:0">
 ${pic(ctx, 'author', 'Portrait of you', '4/5', '50% 30%')}
 <div><span class="eyebrow">About</span><h2>${s('Ellen Moray', 'Your name')}</h2><p>${s('Writer and editor. My essays have appeared in small magazines and one large anthology. I live by a river that floods every few years, which explains a lot.', 'A short biography')}</p><a class="btn" href="#">Get in touch</a></div>
</section>
<footer><div class="name">Ellen Moray</div>${ctx.empty ? 'Social links' : 'Letters · Instagram · Contact'}${ctx.empty ? '' : '<p class="credit" style="margin-top:14px">Stock photographs on Pexels: Erik Mclean, Suzy Hazelwood, Tima Miroshnichenko.</p>'}</footer>`;
  }
};

// ---------------------------------------------------------------------------------------------
// 11 · Wellness clinic
// ---------------------------------------------------------------------------------------------
const wellness = {
  id: 'wellness-clinic',
  scheme: 'light',
  css: `
.info{background:var(--surface);border-bottom:1px solid var(--border);font-size:13px;color:var(--muted)}.info .wrap{display:flex;justify-content:space-between;gap:16px;padding-top:9px;padding-bottom:9px}
.head .wrap{display:flex;align-items:center;gap:30px;padding-top:18px;padding-bottom:18px}
.logo{display:flex;align-items:center;gap:12px;font:600 22px/1 var(--head)}.logo i{width:38px;height:38px;border-radius:50%;background:radial-gradient(circle at 35% 35%,var(--art1),var(--accent));display:block}
.head nav{display:flex;gap:26px;margin-left:auto;font-weight:500}
.hero .wrap{display:grid;grid-template-columns:6fr 5fr;gap:64px;align-items:center;padding-top:40px;padding-bottom:80px}
.hero h1{font-size:clamp(44px,5.4vw,74px);font-weight:600;letter-spacing:-.02em;margin:16px 0 18px}
.hero p.lede{font-size:19px;color:var(--muted);max-width:520px}
.hero .btns{display:flex;gap:12px;flex-wrap:wrap;margin:26px 0}
.reassure{display:flex;gap:20px;flex-wrap:wrap;list-style:none;margin:0;padding:0;font-size:14px;color:var(--muted)}.reassure li::before{content:"";display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--art2);margin-right:8px;box-shadow:0 0 0 3px color-mix(in srgb,var(--art2) 40%,transparent)}
.hero figure{position:relative;margin:0}.hero .pic,.hero .slot{border-radius:var(--radius)}
.float{position:absolute;right:-18px;bottom:30px;background:var(--surface);border-radius:var(--radius);padding:16px 20px;box-shadow:0 14px 34px #16303f26;font-size:14px;max-width:240px}.float b{display:block;font:600 18px/1.3 var(--head);margin-bottom:2px}
.soft{background:var(--surface)}
.shead{text-align:center;max-width:640px;margin:0 auto 36px}.shead h2{font-size:clamp(32px,3.6vw,46px);font-weight:600;margin:10px 0}.shead p{color:var(--muted);margin:0}
.svc{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.svc article{background:var(--bg);border-radius:var(--radius);overflow:hidden}.svc .pic,.svc .slot{border-radius:0}
.svc .body{padding:22px 24px 26px}.svc h3{font-size:24px;font-weight:600;margin-bottom:8px}.svc p{color:var(--muted);font-size:15px}
.chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px}.chips span{font-size:13px;padding:4px 10px;border-radius:999px;background:color-mix(in srgb,var(--art1) 30%,var(--surface));color:var(--text)}
.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;counter-reset:s;list-style:none;margin:0;padding:0}
.steps li{counter-increment:s;position:relative;padding:28px 26px;border-radius:var(--radius);border:1px solid var(--border);background:var(--surface)}
.steps li::before{content:counter(s);display:grid;place-items:center;width:40px;height:40px;border-radius:50%;background:color-mix(in srgb,var(--art1) 40%,var(--surface));color:var(--accent);font:600 18px/1 var(--head);margin-bottom:14px}
.steps h3{font-size:21px;font-weight:600;margin-bottom:6px}.steps p{margin:0;color:var(--muted);font-size:15px}
.team{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}.team article{text-align:center}
.team .pic,.team .slot{width:180px;margin:0 auto 16px;border-radius:50%}.team h3{font-size:22px;font-weight:600}.team span{display:block;color:var(--accent);font-size:14px;margin:4px 0 8px}.team p{color:var(--muted);font-size:15px;max-width:300px;margin:0 auto}
.visit{display:grid;grid-template-columns:6fr 5fr;gap:56px;align-items:center}.visit .pic,.visit .slot{border-radius:var(--radius)}
.visit dl{display:grid;grid-template-columns:1fr 1fr;gap:18px 28px;margin:20px 0 0}.visit dt{font-weight:600}.visit dd{margin:4px 0 0;color:var(--muted);font-size:15px}
.book{max-width:820px;margin:0 auto;text-align:center;background:var(--surface);border-radius:calc(var(--radius) * 1.6);padding:56px 6%;border:1px solid var(--border)}
.book h2{font-size:clamp(32px,3.6vw,46px);font-weight:600;margin-bottom:10px}.book p{color:var(--muted)}
.notice{margin:22px auto 0;max-width:560px;font-size:14px;background:color-mix(in srgb,var(--art2) 35%,var(--surface));border-radius:12px;padding:12px 16px;color:var(--text)}
footer{padding:44px 0 60px;font-size:14px;color:var(--muted)}footer .wrap{display:grid;grid-template-columns:2fr 1fr 1fr;gap:30px}footer b{color:var(--text)}
@media (max-width:760px){
 .info .wrap{justify-content:center}.info .wrap>span:last-child{display:none}
 .head nav{display:none}.head .wrap{justify-content:space-between}
 .hero .wrap{grid-template-columns:1fr;gap:28px;padding-top:20px;padding-bottom:48px}.hero h1{font-size:42px}.float{right:12px;bottom:12px}
 .svc,.steps,.team{grid-template-columns:1fr}.team .pic,.team .slot{width:140px}
 .visit{grid-template-columns:1fr;gap:26px}.visit dl{grid-template-columns:1fr}
 footer .wrap{grid-template-columns:1fr}
}`,
  body(ctx) {
    const s = (v, h) => txt(ctx, v, h);
    return `
<div class="info"><div class="wrap"><span>${s('Mon–Fri 7 am – 7 pm · Sat 8 am – 12 pm', 'Opening hours')}</span><span>${s('(02) 5550 0456 · 3 Example Road, Riverbend', 'Phone · address')}</span></div></div>
<header class="head"><div class="wrap"><a class="logo" href="#"><i aria-hidden="true"></i>Riverbend Physio</a><nav aria-label="Main"><a href="#">Services</a><a href="#">Our team</a><a href="#">Your first visit</a><a href="#">Contact</a></nav><a class="btn primary" href="#">Book an appointment</a></div></header>
<section class="hero"><div class="wrap">
 <div><span class="eyebrow">${s('Physiotherapy · Pilates · Massage', 'Your services in a few words')}</span><h1>${s('Care that helps you move.', 'Your headline')}</h1><p class="lede">${s('Friendly, experienced practitioners for everyday aches, sports injuries and getting back on your feet after surgery.', 'Who you help, in one or two sentences')}</p>
 <div class="btns"><a class="btn primary" href="#">Book an appointment</a><a class="btn" href="#">Our services</a></div>
 <ul class="reassure">${ctx.empty ? '<li><span class="hint">Up to three practical points</span></li>' : '<li>No referral needed</li><li>On-street parking</li><li>Step-free access</li>'}</ul></div>
 <figure>${pic(ctx, 'hero-physio', 'Calm photo of your clinic or a session', '4/5', '45% 40%')}<div class="float"><b>${s('New patients welcome', 'A short note')}</b>${s('Same-week appointments most weeks.', 'One line')}</div></figure>
</div></section>
<section class="soft section" aria-label="Services"><div class="wrap">
 <div class="shead"><span class="eyebrow">Services</span><h2>${s('How we can help', 'Services heading')}</h2><p>${s('Every first appointment starts with a full assessment and a plan you understand.', 'One line about your approach')}</p></div>
 <div class="svc">${[['physio', 'Physiotherapy', 'Assessment and treatment for back and neck pain, sports injuries and rehabilitation.', ['45 min first visit', '30 min follow-up'], '50% 45%'], ['pilates', 'Clinical pilates', 'Small, supervised reformer classes, tailored after a one-on-one assessment.', ['Max 4 per class', '55 min'], '50% 50%'], ['massage', 'Remedial massage', 'Deep tissue and relaxation massage to ease tension and support recovery.', ['30, 45 or 60 min'], '50% 50%']].map(([f, h, p, chips, focal]) => `<article>${pic(ctx, f, 'Service photo', '3/2', focal)}<div class="body"><h3>${s(h, 'Service')}</h3><p>${s(p, 'One or two sentences about this service')}</p><div class="chips">${ctx.empty ? '<span>Length · price (optional)</span>' : chips.map(c => `<span>${c}</span>`).join('')}</div></div></article>`).join('')}</div>
</div></section>
<section class="wrap section" aria-label="Your first visit">
 <div class="shead"><span class="eyebrow">Your first visit</span><h2>${s('What to expect', 'Heading')}</h2></div>
 <ol class="steps">${[['Book a time', 'Online or by phone. Tell us briefly what’s bothering you.'], ['Assessment', 'We listen, assess how you move and explain what we find.'], ['Your plan', 'Treatment, exercises to do at home, and when to come back.']].map(([h, p]) => `<li><h3>${s(h, 'Step')}</h3><p>${s(p, 'What happens')}</p></li>`).join('')}</ol>
</section>
<section class="soft section" aria-label="Our team"><div class="wrap">
 <div class="shead"><span class="eyebrow">Our team</span><h2>${s('Our practitioners', 'Team heading')}</h2></div>
 <div class="team">${[['practitioner-1', 'Daniel Reyes', 'Physiotherapist', 'Sports injuries and running. Coaches the local under-12s.'], ['practitioner-2', 'Mia Tanaka', 'Physiotherapist · Pilates', 'Back pain, pregnancy and post-natal care.'], ['practitioner-3', 'Ruth Adeyemi', 'Remedial massage therapist', 'Deep tissue and recovery massage.']].map(([f, n, r, p]) => `<article>${pic(ctx, f, 'Portrait', '1/1', '50% 25%')}<h3>${s(n, 'Name')}</h3><span>${s(r, 'Role')}</span><p>${s(p, 'One line about their interests')}</p></article>`).join('')}</div>
</div></section>
<section class="wrap section visit" aria-label="Visiting the clinic">
 ${pic(ctx, 'reception', 'Photo of your reception or rooms', '4/3', '50% 50%')}
 <div><span class="eyebrow">Visiting us</span><h2 style="font-size:clamp(30px,3.4vw,42px);font-weight:600;margin-top:10px">${s('A quiet, easy place to visit', 'Heading')}</h2>
 <dl>${[['Hours', 'Mon–Fri 7 am – 7 pm, Sat 8 am – 12 pm'], ['Address', '3 Example Road, Riverbend'], ['Parking', 'Free on-street parking, two hours'], ['Access', 'Step-free entry and accessible bathroom']].map(([t, d]) => `<div><dt>${t}</dt><dd>${s(d, t)}</dd></div>`).join('')}</dl></div>
</section>
<section class="wrap section" aria-label="Make a booking" style="padding-top:0"><div class="book"><h2>${s('Make a booking', 'Booking heading')}</h2><p>${s('Call us, or send a request and we’ll call you back to find a time.', 'How booking works')}</p><a class="btn primary" href="#">Request a call back</a><p class="notice">Please don’t include health details in the form. We’ll talk about those when we call.</p></div></section>
<footer><div class="wrap"><div><b>Riverbend Physio</b><p>${s('In an emergency, call 000.', 'Emergency note (recommended)')}</p>${ctx.empty ? '' : '<p class="credit">Stock photographs on Pexels: Yan Krukau, Funkcinės Terapijos Centras, Gustavo Fring, KoolShooters, Kaboompics.</p>'}</div><div><b>Contact</b><p>${s('(02) 5550 0456', 'Phone')}<br>${s('reception@example.com', 'Email')}</p></div><div><b>Hours</b><p>${s('Mon–Fri 7–7 · Sat 8–12', 'Hours')}</p></div></div></footer>`;
  }
};

// ---------------------------------------------------------------------------------------------
// 12 · Stay
// ---------------------------------------------------------------------------------------------
const stay = {
  id: 'stay',
  scheme: 'light',
  css: `
.top{position:absolute;inset:0 0 auto 0;z-index:5;color:var(--heroText)}.top .wrap{display:flex;justify-content:space-between;align-items:center;padding-top:24px;padding-bottom:24px;max-width:1300px}
.brand{font:400 24px/1 var(--head)}.top nav{display:flex;gap:28px;font-size:15px;font-weight:500}
.hero{position:relative;min-height:760px;color:var(--heroText);background:var(--heroShade)}
.hero .pic,.hero .slot{position:absolute;inset:0;aspect-ratio:auto!important;height:100%}.hero .slot{color:#ffffffbb;border-color:#ffffff55}
.hero .shade{position:absolute;inset:0;background:linear-gradient(270deg,color-mix(in srgb,var(--heroShade) 78%,transparent) 0%,color-mix(in srgb,var(--heroShade) 10%,transparent) 58%),linear-gradient(180deg,color-mix(in srgb,var(--heroShade) 45%,transparent) 0%,transparent 30%)}
.hero .copy{position:relative;padding:150px 0 0;max-width:600px;margin:0 6% 0 auto}
.hero h1{font-size:clamp(50px,6.6vw,96px);font-weight:400;letter-spacing:-.01em;margin:14px 0 14px}
.hero p{font-size:20px;color:color-mix(in srgb,var(--heroText) 92%,transparent)}
.booking{position:absolute;left:50%;bottom:44px;transform:translateX(-50%);width:min(980px,90%);background:var(--surface);color:var(--text);border-radius:var(--radius);display:grid;grid-template-columns:repeat(4,1fr) auto;align-items:center;box-shadow:0 20px 50px #0004}
.booking div{padding:18px 22px;border-right:1px solid var(--border)}.booking b{display:block;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-bottom:4px}
.booking .btn{margin:0 16px}
.welcome{display:grid;grid-template-columns:5fr 6fr;gap:72px;align-items:center}
.welcome h2{font-size:clamp(36px,4vw,54px);font-weight:400;margin:12px 0 16px}.welcome p{font-size:18px;color:var(--muted)}.welcome .pic,.welcome .slot{border-radius:var(--radius)}
.shead{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:26px}.shead h2{font-size:clamp(32px,3.6vw,48px);font-weight:400}
.rooms{display:grid;grid-template-columns:2fr 1fr 1fr;grid-template-rows:260px 260px;gap:12px}
.rooms figure{margin:0;position:relative}.rooms figure:first-child{grid-row:span 2}
.rooms .pic,.rooms .slot{height:100%;aspect-ratio:auto!important;border-radius:var(--radius)}
.rooms figcaption{position:absolute;left:12px;bottom:12px;background:color-mix(in srgb,var(--surface) 92%,transparent);padding:6px 12px;border-radius:999px;font-size:13px;font-weight:600}
.know{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border-top:1px solid var(--border);border-left:1px solid var(--border)}
.know div{padding:22px 24px;border-right:1px solid var(--border);border-bottom:1px solid var(--border)}.know b{display:block;font:400 22px/1.2 var(--head);margin-bottom:6px}.know span{color:var(--muted);font-size:15px}
.near{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}.near .pic,.near .slot{border-radius:var(--radius);margin-bottom:14px}
.near h3{font-size:24px;font-weight:400}.near .d{font-size:13px;color:var(--accent);font-weight:600;letter-spacing:.06em;text-transform:uppercase;display:block;margin:4px 0 6px}.near p{color:var(--muted);font-size:15px;margin:0}
.quote{background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border);text-align:center;padding:84px 6%}
.quote blockquote{margin:0 auto;max-width:800px;font:italic 400 clamp(26px,3vw,38px)/1.35 var(--head)}.quote cite{display:block;margin-top:18px;font-style:normal;color:var(--muted);font-size:14px}
.cta{position:relative;color:var(--heroText);background:var(--heroShade)}.cta .pic,.cta .slot{position:absolute;inset:0;height:100%;aspect-ratio:auto!important;opacity:.55}
.cta .inner{position:relative;text-align:center;padding:110px 5%}.cta h2{font-size:clamp(38px,4.6vw,62px);font-weight:400}.cta p{margin:12px auto 24px;max-width:520px}
footer{padding:40px 0 56px;font-size:14px;color:var(--muted)}footer .wrap{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;max-width:1300px}footer b{color:var(--text);font:400 22px/1 var(--head)}
.wrap.w{max-width:1300px}
@media (max-width:760px){
 .top nav a:not(:last-child){display:none}.top nav a:last-child::before{content:"☰  "}.brand{font-size:20px}
 .hero{min-height:720px}.hero .copy{padding:110px 6% 0;margin:0}.hero h1{font-size:46px}.hero p{font-size:17px}
 .hero .shade{background:linear-gradient(180deg,color-mix(in srgb,var(--heroShade) 70%,transparent) 0%,color-mix(in srgb,var(--heroShade) 10%,transparent) 55%,color-mix(in srgb,var(--heroShade) 40%,transparent) 100%)}
 .booking{grid-template-columns:1fr 1fr;bottom:20px}.booking div{padding:12px 14px}.booking div:nth-child(2n){border-right:0}.booking div{border-bottom:1px solid var(--border)}.booking .btn{grid-column:1/-1;margin:12px;justify-content:center}
 .welcome{grid-template-columns:1fr;gap:26px}
 .rooms{grid-template-columns:1fr 1fr;grid-template-rows:220px 160px 160px}.rooms figure:first-child{grid-column:1/-1;grid-row:auto}.rooms figure:nth-child(5){display:none}
 .know{grid-template-columns:1fr 1fr}.know b{font-size:18px}
 .near{grid-template-columns:1fr}
}`,
  body(ctx) {
    const s = (v, h) => txt(ctx, v, h);
    return `
<header class="top"><div class="wrap"><a class="brand" href="#">Stringybark Cottage</a><nav aria-label="Main"><a href="#">The cottage</a><a href="#">Rooms</a><a href="#">Nearby</a><a href="#">Book</a></nav></div></header>
<section class="hero" aria-label="Welcome">
 ${pic(ctx, 'hero-cottage', 'Your property in its landscape · wide, with sky above', '16/9', '50% 70%')}
 ${ctx.empty ? '' : '<div class="shade"></div>'}
 <div class="copy"><span class="eyebrow" style="color:inherit;opacity:.85">${s('Farm stay · Southern Tablelands', 'Type of stay · area')}</span><h1>${s('Slow mornings in the hills.', 'Your headline')}</h1><p>${s('A restored stone cottage on a working sheep farm.', 'One line about the place')}</p></div>
 <div class="booking" aria-label="Stay details">${[['Sleeps', '6 guests', 'Guests'], ['Bedrooms', '3 · 1 bathroom', 'Rooms'], ['From', '$280 a night', 'Price (optional)'], ['Minimum', '2 nights', 'Minimum stay']].map(([b, v, h]) => `<div><b>${b}</b>${s(v, h)}</div>`).join('')}<a class="btn primary" href="#">Check availability</a></div>
</section>
<section class="wrap w section welcome" aria-label="Welcome">
 <div><span class="eyebrow">Welcome</span><h2>${s('Wood fire, deep bath, long views.', 'Welcome heading')}</h2><p>${s('The cottage was built from the farm’s own stone in 1880 and restored by us in 2019. Walk to the creek, collect eggs for breakfast, or simply sit on the verandah and do nothing at all.', 'A few sentences about the place, from your property page')}</p><a class="btn" href="#">About the property →</a></div>
 ${pic(ctx, 'verandah', 'Photo of an outdoor space', '4/3', '50% 55%')}
</section>
<section class="wrap w section" aria-label="Rooms and spaces" style="padding-top:0">
 <div class="shead"><h2>Rooms &amp; spaces</h2><a href="#" style="font-weight:600">All photos →</a></div>
 <div class="rooms">${[['bedroom', 'Main bedroom · queen', '50% 55%'], ['bath', 'Freestanding bath', '50% 60%'], ['linen', 'Second bedroom', '50% 50%'], ['living-room', 'Living room & fire', '50% 50%'], ['wood-stove', 'Wood stove', '50% 50%']].map(([f, c, focal]) => `<figure>${pic(ctx, f, 'Room photo', '4/3', focal)}${ctx.empty ? '' : `<figcaption>${c}</figcaption>`}</figure>`).join('')}</div>
</section>
<section class="wrap w section" aria-label="Good to know" style="padding-top:0">
 <div class="shead"><h2>Good to know</h2></div>
 <div class="know">${[['Check-in', 'From 3 pm, self check-in'], ['Check-out', 'By 10 am'], ['Pets', 'Dogs welcome by arrangement'], ['Wi-Fi', 'Starlink, fast enough for video calls'], ['Getting here', '20 minutes from town, sealed road'], ['Accessibility', 'Step-free entry, one step to bathroom']].map(([b, v]) => `<div><b>${b}</b><span>${s(v, b)}</span></div>`).join('')}</div>
</section>
<section class="wrap w section" aria-label="On the farm and nearby" style="padding-top:0">
 <div class="shead"><h2>On the farm &amp; nearby</h2></div>
 <div class="near">${[['sheep', 'The flock', 'On the farm', 'Help at feeding time in lambing season.'], ['eggs', 'Breakfast eggs', 'At the door', 'From the hens behind the cottage, most mornings.'], ['creek', 'Stringybark Creek', '10 min walk', 'Swimming holes in summer, platypus at dusk.']].map(([f, h, d, p]) => `<article>${pic(ctx, f, 'Photo', '4/3', '50% 50%')}<span class="d">${s(d, 'Distance')}</span><h3>${s(h, 'Place or activity')}</h3><p>${s(p, 'One line')}</p></article>`).join('')}</div>
</section>
<section class="quote" aria-label="Guest book"><blockquote>${s('“We came for two nights and stayed five. The kids still talk about the lambs.”', 'A genuine guest comment (optional, with permission)')}</blockquote><cite>${s('Sample guest comment — replace with a real one, with permission', 'Guest name, month')}</cite></section>
<section class="cta" aria-label="Plan your stay">${pic(ctx, 'living-room', 'Background photo (optional)', '16/9', '50% 50%')}<div class="inner"><h2>${s('Plan your stay', 'Call to action')}</h2><p>${s('Send your dates and we’ll confirm availability within a day.', 'How booking works')}</p><a class="btn primary" href="#">Check availability</a></div></section>
<footer><div class="wrap"><div><b>Stringybark Cottage</b><p style="margin-top:8px">${s('Farm stay · bookings by request', 'Footer line')}</p></div><div>${ctx.empty ? 'Social links' : 'Instagram · Guest guide'}</div>${ctx.empty ? '' : '<p class="credit" style="flex-basis:100%">Stock photographs on Pexels: Michał Robak, Luis Zambrano, Pavel Danilyuk, Vlada Karpovich, Jan van der Wolf, Jonathan Cooper, Rachel Claire, Sophia Martin, Han-Chieh Lee, Hai Vu.</p>'}</div></footer>`;
  }
};

export const DESIGNS_B = [restaurant, practice, writer, wellness, stay];
