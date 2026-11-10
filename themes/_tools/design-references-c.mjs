// Uplift batch C design references: consultant, musician-band, fitness-studio, community-group,
// maker-shop. Rendered by design-references.mjs (same page shell and rules).
import { esc, pic, txt } from './design-kit.mjs';

const hint = (ctx, v, h) => (ctx.empty ? `<span class="hint">${esc(h)}</span>` : esc(v));

// ---------------------------------------------------------------------------------------------
// 6 · Consultant
// ---------------------------------------------------------------------------------------------
const consultant = {
  id: 'consultant',
  scheme: 'light',
  css: `
.enquire .box .hint,.quote .hint{color:inherit;opacity:.85}
.head{border-bottom:1px solid var(--border);background:var(--bg)}.head .wrap{display:flex;align-items:center;gap:28px;padding-top:18px;padding-bottom:18px}
.brand{font:700 21px/1 var(--head);letter-spacing:-.01em}.brand small{display:block;font:500 13px/1.2 var(--body);color:var(--muted);margin-top:5px;letter-spacing:0}
.head nav{display:flex;gap:26px;margin-left:auto;font-weight:600;font-size:15px}
.hero .wrap{display:grid;grid-template-columns:7fr 5fr;gap:64px;align-items:center;padding-top:76px;padding-bottom:80px}
.hero h1{font-size:clamp(46px,6vw,82px);font-weight:700;letter-spacing:-.025em;margin:18px 0 22px}
.hero h1 em{font-style:normal;color:var(--accent)}
.hero p.lede{font-size:21px;color:var(--muted);max-width:560px}
.hero .btns{display:flex;gap:12px;margin-top:28px;flex-wrap:wrap}
.avail{display:inline-flex;align-items:center;gap:10px;padding:7px 14px 7px 12px;border-radius:999px;background:var(--surface);border:1px solid var(--border);font:600 13px/1 var(--body)}
.avail::before{content:"";width:9px;height:9px;border-radius:50%;background:#16a34a}
.portrait{position:relative}.portrait .pic,.portrait .slot{border-radius:calc(var(--radius) * 2)}
.portrait .tag{position:absolute;left:-28px;bottom:34px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:14px 18px;box-shadow:0 14px 34px #0f0f2a1f;font-size:14px;max-width:250px}
.portrait .tag b{display:block;font:700 26px/1 var(--head);color:var(--accent);margin-bottom:4px}
.shead{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:30px}.shead h2{font-size:clamp(32px,3.6vw,46px);font-weight:700;letter-spacing:-.02em}.shead a{font-weight:600;color:var(--accent);white-space:nowrap}
.help{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.help article{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:28px}
.help .n{font:700 14px/1 var(--head);color:var(--accent);letter-spacing:.08em}
.help h3{font-size:24px;margin:16px 0 10px;letter-spacing:-.01em}.help p{color:var(--muted);margin:0 0 14px}
.help ul{margin:0;padding:0;list-style:none;font-size:15px}.help li{padding:7px 0;border-top:1px solid var(--border)}
.work{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.case{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;display:flex;flex-direction:column}
.case .body{padding:22px 24px 26px}.case .meta{font:600 12px/1 var(--body);letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
.case h3{font-size:22px;margin:10px 0 8px}.case p{color:var(--muted);font-size:15px;margin:0}
.result{display:flex;align-items:baseline;gap:10px;margin-top:16px;padding-top:16px;border-top:1px solid var(--border)}.result b{font:700 34px/1 var(--head);color:var(--accent);letter-spacing:-.02em}.result span{font-size:14px;color:var(--muted)}
.steps{display:grid;grid-template-columns:repeat(4,1fr);gap:0;counter-reset:s;border-top:2px solid var(--text)}
.steps div{counter-increment:s;padding:22px 22px 0 0}.steps div::before{content:counter(s,decimal-leading-zero);display:block;font:700 15px/1 var(--head);color:var(--accent);margin-bottom:14px}
.steps b{display:block;font:700 20px/1.25 var(--head);margin-bottom:6px}.steps span{color:var(--muted);font-size:15px}
.quote{background:var(--heroShade);color:var(--heroText)}.quote .wrap{max-width:980px;padding-top:84px;padding-bottom:84px;text-align:center}
.quote .wrap::before{content:"“";display:block;font:700 96px/.6 var(--head);color:var(--art2);margin-bottom:10px}
.quote blockquote{margin:0;font:600 clamp(24px,3vw,40px)/1.3 var(--head);letter-spacing:-.01em}
.quote cite{display:block;margin-top:20px;font:normal 500 15px/1.4 var(--body);color:color-mix(in srgb,var(--heroText) 75%,transparent)}
.writing{display:grid;grid-template-columns:6fr 5fr;gap:56px;align-items:center}.writing .pic,.writing .slot{border-radius:var(--radius)}
.writing h3{font-size:clamp(28px,3vw,38px);margin:12px 0 12px;letter-spacing:-.01em}.writing p{color:var(--muted);font-size:18px}
.writing ol{margin:22px 0 0;padding:0;list-style:none}.writing li{padding:12px 0;border-top:1px solid var(--border);display:flex;justify-content:space-between;gap:16px;font-weight:600}.writing li span{color:var(--muted);font-weight:400;font-size:14px;white-space:nowrap}
.enquire{padding:0 5% 80px}.enquire .box{max-width:var(--max);margin:0 auto;padding:56px;border-radius:calc(var(--radius) * 2);background:var(--accent);color:var(--onAccent);display:grid;grid-template-columns:3fr 2fr;gap:48px;align-items:center}
.enquire h2{font-size:clamp(34px,4vw,54px);letter-spacing:-.02em;margin-bottom:14px}.enquire p{opacity:.9;font-size:18px;margin:0}
.enquire .card{background:var(--surface);color:var(--text);border-radius:var(--radius);padding:24px}
.enquire .card dl{margin:0 0 18px;display:grid;grid-template-columns:auto 1fr;gap:8px 16px;font-size:15px}.enquire .card dt{color:var(--muted)}.enquire .card dd{margin:0;font-weight:600}
.enquire .card .btn{width:100%;justify-content:center}
footer{border-top:1px solid var(--border);padding:34px 0 50px;font-size:14px;color:var(--muted)}footer .wrap{display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap}
.actionbar{display:none}
@media (max-width:760px){
 .head nav{display:none}.head .wrap{justify-content:space-between}.head .btn{min-height:40px;padding:0 16px}
 .hero .wrap{grid-template-columns:1fr;gap:34px;padding-top:40px;padding-bottom:48px}.hero h1{font-size:44px}.hero p.lede{font-size:18px}
 .portrait{order:-1;max-width:320px}.portrait .pic,.portrait .slot{aspect-ratio:1/1!important}.portrait .tag{left:auto;right:-10px;bottom:-16px;max-width:190px;padding:10px 14px}.portrait .tag b{font-size:20px}
 .help,.work{grid-template-columns:1fr}.case{display:grid;grid-template-columns:130px 1fr}.case .pic,.case .slot{aspect-ratio:auto!important;height:100%}.case .body{padding:16px}.case p{display:none}.result b{font-size:26px}
 .steps{grid-template-columns:1fr 1fr;gap:0 18px}.steps div{padding:18px 0 4px}
 .quote .wrap{padding-top:56px;padding-bottom:56px}
 .writing{grid-template-columns:1fr;gap:26px}
 .enquire{padding:0 0 48px}.enquire .box{border-radius:0;padding:40px 5%;grid-template-columns:1fr;gap:26px}
 .actionbar{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:10px 12px 14px;background:var(--surface);border-top:1px solid var(--border)}
 .actionbar::before{content:'Phone action bar · fixed to the bottom of the screen while scrolling';grid-column:1/-1;font-size:11px;color:var(--muted);text-align:center}
 .actionbar .btn{justify-content:center}
}`,
  body(ctx) {
    const s = (v, h) => txt(ctx, v, h);
    const cases = [['meeting', 'Regional health service', 'Halving onboarding time', 'A new intake process for 40 staff across three sites.', '−48 %', 'time to onboard'], ['sticky-notes', 'Not-for-profit', 'From spreadsheets to a system', 'Choosing and rolling out a booking platform in eight weeks.', '6 → 1', 'tools to manage bookings'], ['whiteboard', 'Leadership team', 'Planning days that stick', 'A facilitation format the team now runs every quarter.', '4 of 5', 'priorities delivered on time']];
    return `
<header class="head"><div class="wrap"><a class="brand" href="#">Rowan Ellis<small>${s('Strategy & operations', 'What you do, in a few words')}</small></a><nav aria-label="Main"><a href="#">Services</a><a href="#">Work</a><a href="#">Writing</a><a href="#">About</a></nav><a class="btn primary" href="#">Book a call</a></div></header>
<section class="hero" aria-label="Introduction"><div class="wrap">
 <div><span class="avail">${s('Taking new projects from February', 'Availability (optional)')}</span><h1>${ctx.empty ? '<span class="hint">Your headline: the change you help people make</span>' : 'Make the complicated feel <em>manageable.</em>'}</h1><p class="lede">${s('I help small organisations plan, prioritise and deliver change, without a 90-page report nobody reads.', 'Who you help and how, in one or two sentences')}</p><div class="btns"><a class="btn primary" href="#">Book a 20-minute call</a><a class="btn" href="#">See case studies</a></div></div>
 <div class="portrait">${pic(ctx, 'portrait', 'A portrait of you · upright, face in the top third', '4/5', '50% 30%')}<div class="tag"><b>${s('12 years', 'A figure')}</b>${s('in operations for health, housing and not-for-profits', 'What it means')}</div></div>
</div></section>
<section class="wrap section" aria-label="Services" style="padding-top:0">
 <div class="shead"><h2>What I help with</h2><a href="#">How I work →</a></div>
 <div class="help">${[['Strategy & priorities', 'Turning a long list into a plan the team believes in.', ['Planning days', 'Two-year roadmaps', 'Board papers']], ['Operations', 'Processes, systems and roles that make the work easier.', ['Process redesign', 'Choosing software', 'Team structure']], ['Delivering change', 'Staying alongside you while it actually happens.', ['Project leadership', 'Coaching managers', 'Reviews at 90 days']]].map(([h, p, l], i) => `<article><span class="n">0${i + 1}</span><h3>${s(h, 'Service')}</h3><p>${s(p, 'One sentence')}</p><ul>${(ctx.empty ? ['Up to three examples'] : l).map(x => `<li>${ctx.empty ? `<span class="hint">${x}</span>` : esc(x)}</li>`).join('')}</ul></article>`).join('')}</div>
</section>
<section class="wrap section" aria-label="Selected work" style="padding-top:0">
 <div class="shead"><h2>Selected work</h2><a href="#">All case studies →</a></div>
 <div class="work">${cases.map(([f, m, h, p, r, rl]) => `<article class="case">${pic(ctx, f, 'Case study photo (optional)', '3/2', '50% 45%')}<div class="body"><span class="meta">${s(m, 'Client or sector')}</span><h3>${s(h, 'Case study title')}</h3><p>${s(p, 'One line')}</p><div class="result"><b>${s(r, 'Result')}</b><span>${s(rl, 'what changed (optional)')}</span></div></div></article>`).join('')}</div>
</section>
<section class="wrap section" aria-label="How we would work together" style="padding-top:0">
 <div class="shead"><h2>How it works</h2></div>
 <div class="steps">${[['A 20-minute call', 'Free. We work out whether I can help.'], ['A short proposal', 'Scope, timing and a fixed fee within a week.'], ['The work', 'Weekly check-ins and nothing hidden.'], ['A 90-day review', 'We look at what stuck, and what didn’t.']].map(([b, sp]) => `<div><b>${s(b, 'Step')}</b><span>${s(sp, 'One sentence')}</span></div>`).join('')}</div>
</section>
<section class="quote" aria-label="What clients say"><div class="wrap"><div><blockquote>${s('Rowan got a room of very different people to agree on three priorities, and then helped us actually deliver them.', 'A genuine comment from a client, with permission')}</blockquote><cite>${s('Sample comment: replace with a real one, with permission', 'Name, role, organisation')}</cite></div></div></section>
<section class="wrap section writing" aria-label="Writing">
 ${pic(ctx, 'desk', 'Photo for your latest piece', '4/3', '50% 50%')}
 <div><span class="eyebrow">Latest writing</span><h3>${s('Five questions before any restructure', 'Title of your newest post')}</h3><p>${s('A short checklist I use with every new client, and the answers that tell me to slow down.', 'Its summary')}</p><a href="#" style="font-weight:600;color:var(--accent)">Read it →</a>
 <ol>${(ctx.empty ? [['Older posts appear here', '']] : [['Why your plan needs fewer priorities', '6 min'], ['Choosing software without regret', '8 min']]).map(([t, m]) => `<li>${ctx.empty ? `<span class="hint">${t}</span>` : esc(t)}<span>${m}</span></li>`).join('')}</ol></div>
</section>
<section class="enquire" aria-label="Book a call"><div class="box"><div><h2>${s('Let’s talk about your project', 'Call to action')}</h2><p>${s('Tell me what’s on your plate. If I’m not the right fit, I’ll say so and suggest someone who is.', 'What happens when someone gets in touch')}</p></div>
 <div class="card"><dl><dt>Call</dt><dd>${s('20 minutes, free', 'First conversation')}</dd><dt>Reply</dt><dd>${s('Within two working days', 'How soon you reply')}</dd><dt>Based</dt><dd>${s('Melbourne · works remotely', 'Where you work')}</dd></dl><a class="btn primary" href="#">Book a call</a></div></div></section>
<footer><div class="wrap"><span><b style="color:var(--text)">Rowan Ellis</b> · ${s('ABN shown here', 'Business details (optional)')}</span><span>${ctx.empty ? 'Social links' : 'LinkedIn · Newsletter'}</span>${ctx.empty ? '' : '<span class="credit" style="flex-basis:100%">Stock photographs on Pexels: cottonbro studio, Pavel Danilyuk, Jakub Zerdzicki, Mikhail Nilov.</span>'}</div></footer>
<div class="actionbar"><a class="btn" href="#">Email</a><a class="btn primary" href="#">Book a call</a></div>`;
  }
};

// ---------------------------------------------------------------------------------------------
// 9 · Musician & band (dark by default)
// ---------------------------------------------------------------------------------------------
const musician = {
  id: 'musician-band',
  scheme: 'dark',
  css: `
.hero .hint,.book .hint{color:inherit;opacity:.85}
.hero{position:relative;min-height:760px;color:var(--heroText);background:var(--heroShade);display:flex;flex-direction:column}
.hero .pic,.hero .slot{position:absolute;inset:0;aspect-ratio:auto!important;height:100%}.hero .slot{color:#ffffffaa;border-color:#ffffff44}
.hero .shade{position:absolute;inset:0;background:linear-gradient(0deg,var(--heroShade) 4%,color-mix(in srgb,var(--heroShade) 55%,transparent) 38%,color-mix(in srgb,var(--heroShade) 15%,transparent) 70%,color-mix(in srgb,var(--heroShade) 60%,transparent))}
.top{position:relative;z-index:2}.top .wrap{display:flex;align-items:center;gap:30px;padding-top:24px;padding-bottom:24px;max-width:1400px}
.top .brand{font:800 20px/1 var(--head);letter-spacing:.08em;text-transform:uppercase}
.top nav{display:flex;gap:28px;margin-left:auto;font:700 13px/1 var(--body);letter-spacing:.16em;text-transform:uppercase}
.hero .copy{position:relative;margin-top:auto;max-width:1400px;width:100%;margin-left:auto;margin-right:auto;padding:0 4% 56px}
.hero .eyebrow{color:var(--accent);font-weight:700}
.hero h1{font:800 clamp(64px,10vw,150px)/.86 var(--head);text-transform:uppercase;letter-spacing:-.005em;margin:16px 0 22px}
.hero p{font-size:19px;max-width:520px;color:color-mix(in srgb,var(--heroText) 85%,transparent)}
.hero .btns{display:flex;gap:12px;flex-wrap:wrap;margin-top:22px}.hero .btn:not(.primary){background:transparent;color:var(--heroText);border-color:#ffffff66}
.wide{max-width:1400px;padding-left:4%;padding-right:4%}
.shead{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:26px}.shead h2{font:800 clamp(40px,5vw,72px)/.95 var(--head);text-transform:uppercase}.shead a{font:700 13px/1 var(--body);letter-spacing:.14em;text-transform:uppercase;color:var(--accent);white-space:nowrap}
.gigs{list-style:none;margin:0;padding:0;border-top:1px solid var(--border)}
.gigs li{display:grid;grid-template-columns:110px 1fr 1fr auto;gap:24px;align-items:center;padding:20px 0;border-bottom:1px solid var(--border)}
.date{font:800 15px/1 var(--head);text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}.date b{display:block;font-size:44px;line-height:.9;color:var(--text);letter-spacing:0}
.gigs h3{font:800 26px/1.05 var(--head);text-transform:uppercase}.gigs .where{color:var(--muted)}
.status{font:700 12px/1 var(--body);letter-spacing:.14em;text-transform:uppercase;padding:7px 10px;border-radius:999px;border:1px solid var(--border);color:var(--muted);margin-right:12px}
.status.few{color:var(--accent);border-color:var(--accent)}.status.out{text-decoration:line-through}
.gigs .act{display:flex;align-items:center;justify-content:end}
.release{display:grid;grid-template-columns:5fr 7fr;gap:64px;align-items:center}
.art{aspect-ratio:1/1;background:linear-gradient(150deg,var(--art1),var(--art2));display:flex;flex-direction:column;justify-content:space-between;padding:36px;color:#fff;border-radius:var(--radius);box-shadow:0 30px 60px #0008}
.art b{font:800 clamp(44px,5vw,76px)/.9 var(--head);text-transform:uppercase}.art span{font:700 13px/1 var(--body);letter-spacing:.2em;text-transform:uppercase}
.release .slotart{aspect-ratio:1/1}
.release h2{font:800 clamp(44px,5vw,72px)/.95 var(--head);text-transform:uppercase;margin:12px 0 14px}
.release p{color:var(--muted);font-size:18px}
.tracks{list-style:none;margin:20px 0 24px;padding:0;columns:2;column-gap:28px;font-size:15px;counter-reset:t}.tracks li{counter-increment:t;padding:6px 0;break-inside:avoid}.tracks li::before{content:counter(t,decimal-leading-zero) "  ";color:var(--muted);font-variant-numeric:tabular-nums}
.listen{display:flex;gap:10px;flex-wrap:wrap}.listen a{padding:11px 16px;border:1px solid var(--border);border-radius:999px;font-weight:600;font-size:14px}.listen a::after{content:" ↗";color:var(--muted)}
.player{margin-top:22px;border:1px dashed var(--border);border-radius:var(--radius);padding:16px 18px;display:flex;justify-content:space-between;align-items:center;gap:16px;font-size:14px;color:var(--muted)}.player b{color:var(--text)}
.live{display:grid;grid-template-columns:2fr 1fr 1fr;grid-template-rows:300px 300px;gap:10px}
.live figure{margin:0;position:relative}.live figure:first-child{grid-row:span 2}.live .pic,.live .slot{height:100%;aspect-ratio:auto!important;border-radius:var(--radius)}
.live figcaption{position:absolute;left:12px;bottom:12px;background:#000a;color:#fff;font:700 11px/1 var(--body);letter-spacing:.14em;text-transform:uppercase;padding:7px 9px;border-radius:4px}
.video{aspect-ratio:21/7;border-radius:var(--radius);border:1px solid var(--border);background:radial-gradient(circle at 30% 40%,var(--art1),var(--bg) 70%);display:grid;place-items:center;text-align:center;color:var(--muted);font-size:14px;padding:24px;margin-top:10px}
.video b{display:block;color:var(--text);font:800 26px/1 var(--head);text-transform:uppercase;margin-bottom:8px}
.band{display:grid;grid-template-columns:6fr 5fr;gap:64px;align-items:center}.band .pic,.band .slot{border-radius:var(--radius)}
.band h2{font:800 clamp(40px,4.4vw,64px)/.95 var(--head);text-transform:uppercase;margin:12px 0 16px}.band p{color:var(--muted);font-size:18px}
.members{display:flex;flex-wrap:wrap;gap:8px;margin-top:20px}.members span{border:1px solid var(--border);border-radius:999px;padding:8px 14px;font-size:14px}
.book{position:relative;color:var(--heroText);overflow:hidden}.book .pic,.book .slot{position:absolute;inset:0;aspect-ratio:auto!important;height:100%}.book .pic img{filter:saturate(1.1)}
.book .dim{position:absolute;inset:0;background:color-mix(in srgb,var(--heroShade) 78%,transparent)}
.book .inner{position:relative;display:grid;grid-template-columns:3fr 2fr;gap:48px;align-items:end;max-width:1400px;margin:0 auto;padding:110px 4%}
.book h2{font:800 clamp(52px,7vw,110px)/.88 var(--head);text-transform:uppercase}
.book dl{margin:0;display:grid;grid-template-columns:auto 1fr;gap:10px 18px;font-size:15px}.book dt{color:color-mix(in srgb,var(--heroText) 65%,transparent);text-transform:uppercase;letter-spacing:.12em;font-size:12px;font-weight:700;padding-top:3px}.book dd{margin:0;font-weight:600}
.signup{border-top:1px solid var(--border);border-bottom:1px solid var(--border)}.signup .wrap{display:flex;justify-content:space-between;align-items:center;gap:30px;padding-top:40px;padding-bottom:40px}
.signup h2{font:800 34px/1 var(--head);text-transform:uppercase}.signup p{margin:6px 0 0;color:var(--muted)}
footer{padding:34px 0 50px;font-size:14px;color:var(--muted)}footer .wrap{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap}
@media (max-width:760px){
 .hero{min-height:640px}.top nav{display:none}.top .wrap{justify-content:space-between}.top .wrap::after{content:"☰ Menu";font:700 13px/1 var(--body);letter-spacing:.12em;text-transform:uppercase}
 .hero h1{font-size:68px}.hero p{font-size:17px}.hero .copy{padding-bottom:36px}
 .gigs li{grid-template-columns:70px 1fr;gap:6px 16px;padding:16px 0}.date b{font-size:32px}.date{grid-row:span 3}.gigs h3{font-size:21px}.gigs .act{justify-content:start;margin-top:8px}
 .release,.band{grid-template-columns:1fr;gap:28px}.tracks{columns:1}
 .live{grid-template-columns:1fr 1fr;grid-template-rows:240px 160px}.live figure:first-child{grid-column:1/-1;grid-row:auto}.live figure:nth-child(4){display:none}
 .video{aspect-ratio:16/9}
 .book .inner{grid-template-columns:1fr;padding:64px 5%;gap:28px}.book h2{font-size:58px}
 .signup .wrap{flex-direction:column;align-items:start}
}`,
  body(ctx) {
    const s = (v, h) => txt(ctx, v, h);
    const gigs = ctx.empty ? [['Date', '', 'Venue', 'Town · details', '']] : [['14', 'Sat · Dec', 'The Harbour Hotel', 'Wollongong · with special guests · doors 8 pm', 'few'], ['5', 'Sun · Jan', 'Riverside Festival', 'Nowra · main stage, 6:40 pm', ''], ['24', 'Fri · Jan', 'The Old Theatre', 'Kiama · album launch · all ages', ''], ['8', 'Sat · Feb', 'Corner Hotel', 'Melbourne · 18+', 'out']];
    return `
<section class="hero" aria-label="The Night Ferries">
 ${pic(ctx, 'hero-stage', 'Your best live or band photo · landscape, at least 2400 px, room above the heads', '16/9', '50% 35%')}
 ${ctx.empty ? '' : '<div class="shade"></div>'}
 <header class="top"><div class="wrap"><a class="brand" href="#">The Night Ferries</a><nav aria-label="Main"><a href="#">Gigs</a><a href="#">Music</a><a href="#">Photos</a><a href="#">About</a><a href="#">Bookings</a></nav></div></header>
 <div class="copy"><span class="eyebrow">${s('New album · out now', 'News line (optional)')}</span><h1>${ctx.empty ? '<span class="hint">Band or artist name</span>' : 'The Night<br>Ferries'}</h1><p>${s('Four-piece indie rock from the south coast. Louder by the water.', 'One line about your music')}</p><div class="btns"><a class="btn primary" href="#">Gig dates</a><a class="btn" href="#">Listen</a></div></div>
</section>
<section class="wrap wide section" aria-label="Upcoming gigs">
 <div class="shead"><h2>On tour</h2><a href="#">All dates →</a></div>
 <ul class="gigs">${gigs.map(([d, m, v, w, st]) => `<li><span class="date">${ctx.empty ? '<span class="hint">Date</span>' : `<b>${d}</b>${m}`}</span><h3>${hint(ctx, v, 'Venue')}</h3><span class="where">${hint(ctx, w, 'Town · details')}</span><span class="act">${st === 'few' ? '<span class="status few">Few left</span>' : st === 'out' ? '<span class="status out">Sold out</span>' : ''}${st === 'out' ? '' : '<a class="btn primary" href="#">Tickets ↗</a>'}</span></li>`).join('')}</ul>
</section>
<section class="wrap wide section release" aria-label="Latest release" style="padding-top:0">
 ${ctx.empty ? '<div class="slot slotart"><span>Release artwork · square, at least 1400 px<br><small>1:1 · or SoraSpace sets the title in your theme</small></span></div>' : '<div class="art" role="img" aria-label="Typeset cover: Louder by the Water"><span>The Night Ferries</span><b>Louder<br>by the<br>water</b><span>LP · 2026</span></div>'}
 <div><span class="eyebrow">${s('Album · 10 tracks · out now', 'Release type · tracks')}</span><h2>${s('Louder by the Water', 'Release title')}</h2><p>${s('Recorded live to tape in a shearing shed outside Berry, over one very loud week in winter.', 'A few sentences about it')}</p>
 <ol class="tracks">${(ctx.empty ? ['Track list (optional)'] : ['Low Tide Lights', 'Ferryman', 'Salt in the Speakers', 'Kiama Blowhole', 'Last Boat Home', 'Long Way Round']).map(t => `<li>${ctx.empty ? `<span class="hint">${t}</span>` : esc(t)}</li>`).join('')}</ol>
 <div class="listen">${(ctx.empty ? ['Listening link'] : ['Bandcamp', 'Spotify', 'Apple Music', 'Vinyl & merch']).map(l => `<a href="#">${ctx.empty ? `<span class="hint" style="border:0">${l}</span>` : l}</a>`).join('')}</div>
 <div class="player"><span><b>Audio player</b> · optional outside widget, click-to-load</span><span class="btn">Load player</span></div></div>
</section>
<section class="wrap wide section" aria-label="Live photos" style="padding-top:0">
 <div class="shead"><h2>Live</h2><a href="#">All photos →</a></div>
 <div class="live">${[['guitarist', 'Wollongong', '50% 30%'], ['drummer', 'Riverside', '50% 50%'], ['crowd', 'Kiama', '50% 60%'], ['rehearsal', 'Rehearsal', '50% 50%'], ['vinyl', 'On vinyl', '50% 50%']].map(([f, c, focal]) => `<figure>${pic(ctx, f, 'Photo', '4/3', focal)}${ctx.empty ? '' : `<figcaption>${c}</figcaption>`}</figure>`).join('')}</div>
 <div class="video"><div><b>Video</b>${ctx.empty ? 'Optional outside widget (YouTube or Vimeo), click-to-load' : 'Loads from the video provider only when you choose “Play”.'}<br><br><span class="btn">Play video</span></div></div>
</section>
<section class="wrap wide section band" aria-label="About the band" style="padding-top:0">
 ${pic(ctx, 'van', 'Photo of the band (optional)', '3/2', '50% 55%')}
 <div><span class="eyebrow">The band</span><h2>${s('Four friends, two vans, a lot of reverb', 'About heading')}</h2><p>${s('We started in a garage in Gerringong in 2019 and have played every pub on the coast since. The new record is the closest we’ve come to sounding like we do live.', 'A short story from your About page')}</p><div class="members">${(ctx.empty ? ['Member · instrument'] : ['Jess · vocals, guitar', 'Tom · guitar', 'Ana · bass', 'Kai · drums']).map(m => `<span>${ctx.empty ? `<span class="hint" style="border:0">${m}</span>` : m}</span>`).join('')}</div></div>
</section>
<section class="book" aria-label="Bookings">${pic(ctx, 'crowd', 'Background photo (optional)', '16/9', '50% 50%')}${ctx.empty ? '' : '<div class="dim"></div>'}<div class="inner"><h2>${s('Book the band', 'Call to action')}</h2><dl><dt>For</dt><dd>${s('Venues, festivals and private events', 'What you play')}</dd><dt>Agent</dt><dd>${s('bookings@example.com', 'Booking contact')}</dd><dt>Press</dt><dd>${s('Press kit & tech rider', 'Download (optional)')}</dd></dl></div></section>
<section class="signup" aria-label="Mailing list"><div class="wrap wide"><div><h2>${s('First to hear', 'Mailing list heading')}</h2><p>${s('New dates and releases, about once a month.', 'What people get')}</p></div><a class="btn primary" href="#">Join the list</a></div></section>
<footer><div class="wrap wide"><span><b style="color:var(--text)">The Night Ferries</b></span><span>${ctx.empty ? 'Social links' : 'Instagram · Bandcamp · YouTube'}</span>${ctx.empty ? '' : '<span class="credit" style="flex-basis:100%">Stock photographs on Pexels: ANTONI SHKRABA production, Ethan Strunk, Ferat Söylemez, Mark Angelo Sampan, Miguel Á. Padriñán, Connor Scott McManus.</span>'}</div></footer>`;
  }
};

// ---------------------------------------------------------------------------------------------
// 10 · Fitness & studio
// ---------------------------------------------------------------------------------------------
const fitness = {
  id: 'fitness-studio',
  scheme: 'light',
  css: `
.free .hint{color:inherit;opacity:.85}
.head .wrap{display:flex;align-items:center;gap:28px;padding-top:20px;padding-bottom:20px}
.brand{font:700 23px/1 var(--head);display:flex;align-items:center;gap:10px}.brand::before{content:"";width:26px;height:26px;border-radius:50%;background:conic-gradient(var(--accent) 0 60%,var(--art1) 60% 85%,var(--art2) 85%)}
.head nav{display:flex;gap:24px;margin-left:auto;font-weight:600}
.hero .wrap{display:grid;grid-template-columns:5fr 6fr;gap:56px;align-items:center;padding-top:40px;padding-bottom:70px}
.hero h1{font-size:clamp(50px,6.4vw,92px);font-weight:700;letter-spacing:-.02em;margin:16px 0 20px;line-height:1}
.hero p{font-size:20px;color:var(--muted);max-width:480px}.hero .btns{display:flex;gap:12px;flex-wrap:wrap;margin-top:26px}
.chips{display:flex;gap:8px;flex-wrap:wrap}.chips span{background:color-mix(in srgb,var(--art1) 22%,var(--surface));color:var(--text);border-radius:999px;padding:7px 14px;font:700 13px/1 var(--body)}
.photo{position:relative}.photo .pic,.photo .slot{border-radius:calc(var(--radius) * 1.6)}
.offer{position:absolute;left:-30px;bottom:30px;background:var(--art2);color:#1f1300;border-radius:var(--radius);padding:16px 20px;font:700 15px/1.3 var(--body);box-shadow:0 18px 36px #0f2a2226;transform:rotate(-3deg)}.offer b{display:block;font:700 28px/1 var(--head)}
.facts{background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}.facts .wrap{display:grid;grid-template-columns:repeat(4,1fr)}
.facts .wrap>div{padding:24px 24px 24px 0}.facts b{display:block;font:700 30px/1 var(--head);color:var(--accent);margin-bottom:6px}.facts span{color:var(--muted);font-size:15px}
.shead{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:28px}.shead h2{font-size:clamp(34px,4vw,54px);font-weight:700;letter-spacing:-.015em}.shead a{font-weight:700;color:var(--accent);white-space:nowrap}
.classes{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.cls{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden}.cls .body{padding:20px 22px 24px}
.cls h3{font-size:25px;margin:0 0 6px}.cls p{color:var(--muted);margin:0 0 14px;font-size:15px}
.level{display:flex;gap:6px;flex-wrap:wrap}.level span{font:700 12px/1 var(--body);padding:6px 10px;border-radius:999px;border:1px solid var(--border)}
.tt-wrap{background:var(--surface);border-radius:calc(var(--radius) * 1.4);border:1px solid var(--border);padding:28px}
.days{display:grid;grid-template-columns:repeat(7,1fr);gap:10px}
.day h4{font:700 13px/1 var(--body);letter-spacing:.14em;text-transform:uppercase;color:var(--muted);padding-bottom:12px;border-bottom:2px solid var(--border);margin-bottom:10px}
.day.today h4{color:var(--accent);border-color:var(--accent)}
.slotc{border-radius:12px;padding:10px 11px;margin-bottom:8px;font-size:13px;line-height:1.35;background:var(--bg);border-left:4px solid var(--accent)}.slotc b{display:block;font-size:14px}.slotc span{color:var(--muted)}
.slotc.p{border-color:var(--art2)}.slotc.st{border-color:#e76f51}.slotc.full{opacity:.55}.slotc.full span::after{content:" · full"}
.tt-foot{display:flex;justify-content:space-between;gap:16px;align-items:center;margin-top:16px;font-size:14px;color:var(--muted);flex-wrap:wrap}
.key{display:flex;gap:16px}.key i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px;background:var(--accent)}.key i.p{background:var(--art2)}.key i.st{background:#e76f51}
.daytabs{display:none}
.team{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.coach{display:flex;gap:18px;align-items:center}.coach .pic,.coach .slot{width:112px;flex:none;border-radius:50%}.coach .slot{font-size:11px;padding:6px}
.coach h3{font-size:21px}.coach .role{color:var(--accent);font-weight:700;font-size:14px;margin:4px 0}.coach p{color:var(--muted);font-size:14px;margin:0}
.prices{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.price{border:1px solid var(--border);border-radius:var(--radius);padding:26px;background:var(--surface)}.price.pop{border:2px solid var(--accent)}
.price h3{font-size:20px}.price .amt{font:700 44px/1 var(--head);margin:14px 0 4px}.price .amt small{font:500 15px/1 var(--body);color:var(--muted)}.price p{color:var(--muted);font-size:15px;margin:0}
.free{position:relative;margin:0 5% 80px;border-radius:calc(var(--radius) * 1.6);overflow:hidden;color:#fff}.free .pic,.free .slot{position:absolute;inset:0;aspect-ratio:auto!important;height:100%}
.free .dim{position:absolute;inset:0;background:linear-gradient(90deg,color-mix(in srgb,var(--heroShade) 88%,transparent),color-mix(in srgb,var(--heroShade) 35%,transparent))}
.free .inner{position:relative;padding:76px 56px;max-width:640px}.free h2{font-size:clamp(36px,4.6vw,62px);letter-spacing:-.015em}.free p{font-size:18px;opacity:.9;margin:14px 0 24px}
footer{padding:30px 0 50px;font-size:14px;color:var(--muted)}footer .wrap{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap}
.actionbar{display:none}
@media (max-width:760px){
 .head nav{display:none}.head .wrap{justify-content:space-between}.head .btn{min-height:40px;padding:0 16px}
 .brand{font-size:19px}.brand::before{width:22px;height:22px}
 .hero .wrap{grid-template-columns:1fr;gap:30px;padding-top:16px;padding-bottom:44px}.hero h1{font-size:48px}.hero p{font-size:17px}
 .photo{order:-1}.photo .pic,.photo .slot{aspect-ratio:4/3!important}.offer{left:auto;right:12px;bottom:-18px;padding:10px 14px;font-size:13px}.offer b{font-size:20px}
 .facts .wrap{grid-template-columns:1fr 1fr}.facts .wrap>div{padding:16px 12px 16px 0}.facts b{font-size:24px}
 .classes,.team,.prices{grid-template-columns:1fr}.cls{display:grid;grid-template-columns:120px 1fr}.cls .pic,.cls .slot{aspect-ratio:auto!important;height:100%}.cls .body{padding:14px}.cls p{display:none}.cls h3{font-size:20px}
 .tt-wrap{padding:16px}.days{grid-template-columns:1fr}.day{display:none}.day.today{display:block}.day h4{display:none}
 .daytabs{display:flex;gap:6px;overflow-x:auto;margin-bottom:14px}.daytabs span{padding:8px 13px;border-radius:999px;border:1px solid var(--border);font:700 13px/1 var(--body);white-space:nowrap}.daytabs span.on{background:var(--accent);color:var(--onAccent);border-color:var(--accent)}
 .free{margin:0 0 48px;border-radius:0}.free .inner{padding:56px 5%}
 .actionbar{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:10px 12px 14px;background:var(--surface);border-top:1px solid var(--border)}
 .actionbar::before{content:'Phone action bar · fixed to the bottom of the screen while scrolling';grid-column:1/-1;font-size:11px;color:var(--muted);text-align:center}
 .actionbar .btn{justify-content:center}
}`,
  body(ctx) {
    const s = (v, h) => txt(ctx, v, h);
    const week = { Mon: [['6:30', 'Morning flow', '60 min', ''], ['5:30', 'Reformer', '45 min', 'p'], ['7:00', 'Strength', '50 min', 'st']], Tue: [['6:30', 'Reformer', '45 min', 'p full'], ['12:15', 'Lunch flow', '40 min', ''], ['5:30', 'Reformer', '45 min', 'p']], Wed: [['6:30', 'Morning flow', '60 min', ''], ['6:00', 'Strength', '50 min', 'st']], Thu: [['9:30', 'Gentle yoga', '60 min', ''], ['5:30', 'Reformer', '45 min', 'p'], ['7:00', 'Yin', '60 min', '']], Fri: [['6:30', 'Morning flow', '60 min', ''], ['5:30', 'Strength', '50 min', 'st']], Sat: [['8:00', 'Strength basics', '50 min', 'st'], ['9:30', 'Reformer', '45 min', 'p']], Sun: [['9:00', 'Slow flow', '75 min', '']] };
    const days = Object.entries(week);
    return `
<header class="head"><div class="wrap"><a class="brand" href="#">Saltbush Movement</a><nav aria-label="Main"><a href="#">Classes</a><a href="#">Timetable</a><a href="#">Teachers</a><a href="#">Prices</a><a href="#">The studio</a></nav><a class="btn primary" href="#">Book a class</a></div></header>
<section class="hero" aria-label="Welcome"><div class="wrap">
 <div><div class="chips">${(ctx.empty ? ['What you teach'] : ['Yoga', 'Reformer pilates', 'Strength']).map(c => `<span>${ctx.empty ? `<span class="hint" style="border:0">${c}</span>` : c}</span>`).join('')}</div><h1>${s('Move well. Feel good.', 'Your headline')}</h1><p>${s('Small classes for every body and every level, upstairs on Example Lane.', 'Who it’s for, and where')}</p><div class="btns"><a class="btn primary" href="#">Book a free class</a><a class="btn" href="#">See the timetable</a></div></div>
 <div class="photo">${pic(ctx, 'hero-class', 'Photo of a class in your studio · landscape', '5/4', '55% 50%')}<div class="offer"><b>${s('First class free', 'Offer (optional)')}</b>${s('No sign-up needed', 'Detail')}</div></div>
</div></section>
<section class="facts" aria-label="Key facts"><div class="wrap">${[['20+', 'classes a week'], ['8', 'people per reformer class, at most'], ['6:30 am', 'first class, weekdays'], ['Upstairs', '8 Example Lane · lift access']].map(([b, sp]) => `<div><b>${s(b, 'Figure')}</b><span>${s(sp, 'What it means')}</span></div>`).join('')}</div></section>
<section class="wrap section" aria-label="Classes">
 <div class="shead"><h2>Classes</h2><a href="#">All classes →</a></div>
 <div class="classes">${[['studio', 'Yoga & flow', 'Breath-led classes from gentle to strong.', ['All levels', '40–75 min']], ['reformer', 'Reformer pilates', 'Eight machines, small groups, plenty of help.', ['Beginner friendly', '45 min']], ['kettlebells', 'Strength', 'Kettlebells and bodyweight, taught carefully.', ['Small group', '50 min']]].map(([f, h, p, l]) => `<article class="cls">${pic(ctx, f, 'Photo of this class', '4/3', '50% 50%')}<div class="body"><h3>${s(h, 'Class type')}</h3><p>${s(p, 'One sentence')}</p><div class="level">${(ctx.empty ? ['Level', 'Length'] : l).map(x => `<span>${x}</span>`).join('')}</div></div></article>`).join('')}</div>
</section>
<section class="wrap section" aria-label="This week" style="padding-top:0">
 <div class="shead"><h2>This week</h2><a href="#">Full timetable →</a></div>
 <div class="tt-wrap"><div class="daytabs">${days.map(([d], i) => `<span class="${i === 1 ? 'on' : ''}">${d}</span>`).join('')}</div>
 <div class="days">${(ctx.empty ? [['Mon', [['Time', 'Class', 'Length', '']]], ...days.slice(1).map(([d]) => [d, []])] : days).map(([d, list], i) => `<div class="day ${i === 1 ? 'today' : ''}"><h4>${d}</h4>${list.map(([tm, c, len, k]) => `<div class="slotc ${k}">${ctx.empty ? '<span class="hint">Time · class · length</span>' : `<b>${tm} · ${c}</b><span>${len}</span>`}</div>`).join('')}</div>`).join('')}</div>
 <div class="tt-foot"><span class="key"><span><i></i>Yoga</span><span><i class="p"></i>Reformer</span><span><i class="st"></i>Strength</span></span><span>${ctx.empty ? 'Timetable is built from your classes; bookings open your booking link' : 'Book through our booking page ↗ · cancel up to 12 hours before'}</span></div></div>
</section>
<section class="wrap section" aria-label="Teachers" style="padding-top:0">
 <div class="shead"><h2>Teachers</h2><a href="#">Meet the team →</a></div>
 <div class="team">${[['instructor-1', 'Mia Torres', 'Yoga', 'Teaching since 2014. Loves a long hold.', '50% 25%'], ['instructor-2', 'Dan Okoro', 'Strength', 'Strength coach with a soft spot for beginners.', '50% 25%'], ['instructor-3', 'Helen Park', 'Gentle yoga', 'Runs the Thursday morning class for over-60s.', '50% 20%']].map(([f, n, r, p, focal]) => `<article class="coach">${pic(ctx, f, 'Portrait', '1/1', focal)}<div><h3>${s(n, 'Name')}</h3><div class="role">${s(r, 'What they teach')}</div><p>${s(p, 'One line')}</p></div></article>`).join('')}</div>
</section>
<section class="wrap section" aria-label="Prices" style="padding-top:0">
 <div class="shead"><h2>Prices</h2></div>
 <div class="prices">${[['Casual', '$28', 'a class', 'Any class, no commitment.'], ['10-class pass', '$240', '', 'Valid for six months. Share with a friend.', 'pop'], ['Unlimited', '$45', 'a week', 'All classes. Pause any time.']].map(([h, a, u, p, k]) => `<article class="price ${k ?? ''}"><h3>${s(h, 'Option')}</h3><div class="amt">${ctx.empty ? '<span class="hint">Price</span>' : `${a} <small>${u}</small>`}</div><p>${s(p, 'One line')}</p></article>`).join('')}</div>
</section>
<section class="free" aria-label="Your first class">${pic(ctx, 'studio', 'Background photo (optional)', '16/9', '50% 50%')}${ctx.empty ? '' : '<div class="dim"></div>'}<div class="inner"><h2>${s('Your first class is on us', 'Call to action')}</h2><p>${s('Bring water and comfortable clothes. Mats and towels provided.', 'What to bring')}</p><a class="btn primary" href="#">Book a free class</a></div></section>
<footer><div class="wrap"><span><b style="color:var(--text)">Saltbush Movement</b> · ${s('Upstairs, 8 Example Lane', 'Address')}</span><span>${ctx.empty ? 'Social links' : 'Instagram · Newsletter'}</span>${ctx.empty ? '' : '<span class="credit" style="flex-basis:100%">Stock photographs on Pexels: Yan Krukau, MART PRODUCTION, Gustavo Fring, Vitaly Gariev, Thirdman, Asso Myron, RDNE Stock project.</span>'}</div></footer>
<div class="actionbar"><a class="btn" href="#">Timetable</a><a class="btn primary" href="#">Book a class</a></div>`;
  }
};

// ---------------------------------------------------------------------------------------------
// 13 · Community group
// ---------------------------------------------------------------------------------------------
const community = {
  id: 'community-group',
  scheme: 'light',
  css: `
.banner .copy .hint,.help .hint{color:inherit;opacity:.85}
.head{background:var(--bg)}.head .wrap{display:flex;align-items:center;gap:28px;padding:18px 4%;max-width:1400px}
.brand{display:flex;align-items:center;gap:12px;font:700 21px/1.1 var(--head)}.brand i{width:42px;height:42px;border-radius:50%;background:radial-gradient(circle at 35% 35%,var(--art1),var(--accent));flex:none}.brand small{display:block;font:500 13px/1 var(--body);color:var(--muted);margin-top:4px}
.head nav{display:flex;gap:24px;margin-left:auto;font-weight:600}
.banner{position:relative;margin:0 auto;max-width:1400px;padding:0 4%}
.banner .frame{position:relative;border-radius:calc(var(--radius) * 2);overflow:hidden;color:var(--heroText);min-height:560px;display:flex;align-items:end;background:var(--heroShade)}
.banner .pic,.banner .slot{position:absolute;inset:0;aspect-ratio:auto!important;height:100%}.banner .slot{color:#ffffffbb;border-color:#ffffff55}
.banner .shade{position:absolute;inset:0;background:linear-gradient(20deg,color-mix(in srgb,var(--heroShade) 88%,transparent) 15%,transparent 65%)}
.banner .copy{position:relative;padding:56px;max-width:720px}.banner h1{font-size:clamp(46px,6vw,84px);letter-spacing:-.015em;margin:14px 0 14px}.banner p{font-size:20px;color:color-mix(in srgb,var(--heroText) 90%,transparent);max-width:540px}
.banner .eyebrow{color:color-mix(in srgb,var(--heroText) 85%,transparent)}.banner .btns{display:flex;gap:12px;flex-wrap:wrap;margin-top:20px}.banner .btn:not(.primary){background:#ffffff1f;color:var(--heroText);border-color:#ffffff70}
.next{position:absolute;right:calc(4% + 40px);bottom:-60px;width:360px;background:var(--surface);color:var(--text);border-radius:var(--radius);box-shadow:0 22px 50px #2b211833;padding:24px;border-top:6px solid var(--art2)}
.next .eyebrow{color:var(--accent);font-weight:700}.next h3{font-size:24px;margin:10px 0 12px}
.next dl{margin:0 0 16px;display:grid;grid-template-columns:auto 1fr;gap:6px 14px;font-size:15px}.next dt{color:var(--muted)}.next dd{margin:0;font-weight:600}
.next .row{display:flex;gap:8px}.next .btn:not(.primary){background:var(--bg);color:var(--text);border-color:var(--border)}.next .btn{flex:1;justify-content:center;min-height:42px;padding:0 12px;font-size:14px}
.gap{height:96px}
.shead{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:28px}.shead h2{font-size:clamp(32px,3.8vw,50px);letter-spacing:-.01em}.shead a{font-weight:700;color:var(--accent);white-space:nowrap}
.what{display:grid;grid-template-columns:5fr 6fr;gap:64px;align-items:start}.what p.big{font:500 clamp(22px,2.4vw,30px)/1.4 var(--head);margin:14px 0 0}
.ways{display:grid;gap:14px}
.way{display:grid;grid-template-columns:56px 1fr auto;gap:18px;align-items:center;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px 22px}
.way i{width:56px;height:56px;border-radius:50%;display:grid;place-items:center;font:700 20px/1 var(--head);font-style:normal;background:color-mix(in srgb,var(--art1) 30%,var(--surface))}
.way:nth-child(2) i{background:color-mix(in srgb,var(--art2) 25%,var(--surface))}.way:nth-child(3) i{background:color-mix(in srgb,var(--accent) 18%,var(--surface))}
.way h3{font-size:21px}.way p{margin:4px 0 0;color:var(--muted);font-size:15px}.way a{font-weight:700;color:var(--accent);white-space:nowrap}
.events{display:grid;grid-template-columns:5fr 7fr;gap:40px;align-items:stretch}.events .pic,.events .slot{border-radius:var(--radius);height:100%;aspect-ratio:auto!important;min-height:380px}
.evlist{list-style:none;margin:0;padding:0}
.evlist li{display:grid;grid-template-columns:78px 1fr;gap:20px;padding:18px 0;border-bottom:1px solid var(--border)}.evlist li:first-child{padding-top:0}
.cal{border-radius:12px;border:1px solid var(--border);text-align:center;overflow:hidden;background:var(--surface);align-self:start}.cal span{display:block;background:var(--accent);color:var(--onAccent);font:700 12px/1 var(--body);letter-spacing:.14em;text-transform:uppercase;padding:6px 0}.cal b{display:block;font:700 30px/1 var(--head);padding:8px 0}
.evlist h3{font-size:21px}.evlist p{margin:4px 0 0;color:var(--muted);font-size:15px}.evlist .tag{display:inline-block;margin-top:8px;font:700 12px/1 var(--body);padding:5px 9px;border-radius:999px;background:color-mix(in srgb,var(--art2) 18%,var(--surface));color:var(--text)}
.news{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}.news article .pic,.news article .slot{border-radius:var(--radius);margin-bottom:14px}
.news .meta{font:700 12px/1 var(--body);letter-spacing:.14em;text-transform:uppercase;color:var(--accent)}.news h3{font-size:23px;margin:8px 0 6px}.news p{color:var(--muted);font-size:15px;margin:0}
.thanks{background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}.thanks .wrap{display:flex;flex-wrap:wrap;gap:10px 28px;align-items:center;padding-top:26px;padding-bottom:26px;font-size:15px;color:var(--muted)}.thanks b{color:var(--text)}
.help{display:grid;grid-template-columns:1fr 1fr;gap:0;border-radius:calc(var(--radius) * 2);overflow:hidden;background:var(--accent);color:var(--onAccent);margin:0 auto}
.help .pic,.help .slot{border-radius:0;height:100%;aspect-ratio:auto!important;min-height:360px}.help .slot{color:#ffffffbb;border-color:#ffffff55}
.help .inner{padding:56px}.help h2{font-size:clamp(36px,4.2vw,58px)}.help p{font-size:18px;opacity:.92;margin:14px 0 24px}.help .btn{background:var(--surface);color:var(--text);border-color:var(--surface)}
footer{padding:44px 0 56px;font-size:14px;color:var(--muted)}footer .wrap{display:grid;grid-template-columns:2fr 1fr 1fr;gap:30px}footer b{color:var(--text)}
.ack{grid-column:1/-1;border-top:1px solid var(--border);padding-top:18px;font-size:14px}
@media (max-width:760px){
 .head nav{display:none}.head .btn{display:none}.head .wrap{justify-content:space-between}.head .wrap::after{content:"☰ Menu";font-weight:700;font-size:15px}.brand i{width:34px;height:34px}.brand{font-size:18px}.brand small{display:none}
 .banner{padding:0}.banner .frame{border-radius:0;min-height:520px}.banner .copy{padding:28px 5% 36px}.banner h1{font-size:44px}.banner p{font-size:17px}
 .banner .shade{background:linear-gradient(0deg,color-mix(in srgb,var(--heroShade) 90%,transparent) 25%,transparent 80%)}
 .next{position:relative;right:auto;bottom:auto;width:auto;margin:-24px 5% 0}
 .gap{height:16px}
 .what,.events,.help{grid-template-columns:1fr;gap:26px}.way{grid-template-columns:44px 1fr;padding:16px}.way i{width:44px;height:44px;font-size:17px}.way a{grid-column:2}
 .events .pic,.events .slot{min-height:200px;order:2}
 .news{grid-template-columns:1fr}.news article{display:grid;grid-template-columns:120px 1fr;gap:14px}.news article .pic,.news article .slot{margin:0;aspect-ratio:1/1!important}.news p{display:none}.news h3{font-size:19px}
 .help{border-radius:0}.help .pic,.help .slot{min-height:220px}.help .inner{padding:36px 5%}
 footer .wrap{grid-template-columns:1fr}
}`,
  body(ctx) {
    const s = (v, h) => txt(ctx, v, h);
    const ev = ctx.empty ? [['Mon', '—', 'Event title', 'When · where', '']] : [['Sat', '16', 'Working bee', '9 am – 12 pm at the garden · morning tea provided', 'All welcome'], ['Tue', '19', 'Seed-saving workshop', '6:30 pm in the hall · bring a jar', 'Free · book a place'], ['Sun', '24', 'Produce swap', '10 am at the front gate', 'Bring what you’ve grown'], ['Wed', '4', 'Members’ meeting', '7 pm in the hall · agenda on the News page', 'Members']];
    return `
<header class="head"><div class="wrap"><a class="brand" href="#"><i></i><span>Northside Community Garden<small>${s('Grow · Share · Belong', 'Motto (optional)')}</small></span></a><nav aria-label="Main"><a href="#">About</a><a href="#">Events</a><a href="#">News</a><a href="#">Photos</a></nav><a class="btn primary" href="#">Get involved</a></div></header>
<section class="banner" aria-label="Welcome"><div class="frame">
 ${pic(ctx, 'hero-garden', 'Photo of your group in action · landscape, people doing what you do', '21/9', '50% 60%')}
 ${ctx.empty ? '' : '<div class="shade"></div>'}
 <div class="copy"><span class="eyebrow">${s('Volunteer-run since 2009', 'Since when, or who runs it')}</span><h1>${s('A garden for everyone.', 'Your headline')}</h1><p>${s('Shared plots, workshops and a weekly produce swap on Example Street.', 'What you do, and where')}</p><div class="btns"><a class="btn primary" href="#">Come along</a><a class="btn" href="#">What’s on</a></div></div>
 </div>
 <aside class="next" aria-label="Next get-together"><span class="eyebrow">Next get-together</span><h3>${s('Working bee', 'Name of your next meeting or event')}</h3><dl><dt>When</dt><dd>${s('Sat 16 Nov · 9 am – 12 pm', 'Date and time')}</dd><dt>Where</dt><dd>${s('The garden, 40 Example St', 'Place')}</dd><dt>Bring</dt><dd>${s('A hat and water. Gloves provided.', 'What to bring (optional)')}</dd></dl><div class="row"><a class="btn primary" href="#">I’ll come</a><a class="btn" href="#">Add to calendar</a></div></aside>
</section>
<div class="gap"></div>
<section class="wrap section what" aria-label="What we do">
 <div><span class="eyebrow">What we do</span><p class="big">${s('Members grow food together on shared and private plots, and share what they harvest with neighbours. No experience needed, just turn up.', 'A few sentences about your group')}</p></div>
 <div class="ways">${[['1', 'Come to a working bee', 'Second Saturday of the month, any age, any skill.', 'Dates →'], ['2', 'Become a member', '$20 a year. Members can apply for a plot.', 'Join →'], ['3', 'Give or swap', 'Seeds, seedlings, tools, or an hour of your time.', 'Ways to help →']].map(([n, h, p, a]) => `<div class="way"><i>${n}</i><div><h3>${s(h, 'Way to take part')}</h3><p>${s(p, 'One sentence')}</p></div><a href="#">${ctx.empty ? '<span class="hint">Link</span>' : a}</a></div>`).join('')}</div>
</section>
<section class="wrap section" aria-label="What’s on" style="padding-top:0">
 <div class="shead"><h2>What’s on</h2><a href="#">All events →</a></div>
 <div class="events">${pic(ctx, 'hall', 'Photo of where you meet (optional)', '4/5', '50% 50%')}<ul class="evlist">${ev.map(([d, n, h, w, t]) => `<li><div class="cal"><span>${ctx.empty ? 'Day' : d}</span><b>${ctx.empty ? '–' : n}</b></div><div><h3>${hint(ctx, h, 'Event title')}</h3><p>${hint(ctx, w, 'When · where')}</p>${t ? `<span class="tag">${esc(t)}</span>` : ''}</div></li>`).join('')}</ul></div>
</section>
<section class="wrap section" aria-label="Latest news" style="padding-top:0">
 <div class="shead"><h2>Latest news</h2><a href="#">All news →</a></div>
 <div class="news">${[['raised-beds', 'News', 'New raised beds are in', 'Accessible plots for members who need them, thanks to a council grant.'], ['seedlings', 'Workshop', 'Saving your own seed', 'Notes and photos from last month’s session.'], ['harvest', 'Swap', 'A record autumn swap', 'Forty households and far too many zucchini.']].map(([f, m, h, p]) => `<article>${pic(ctx, f, 'Photo for this post', '3/2', '50% 50%')}<div><span class="meta">${s(m, 'Kind')}</span><h3>${s(h, 'Post title')}</h3><p>${s(p, 'One line')}</p></div></article>`).join('')}</div>
</section>
<section class="thanks" aria-label="Supported by"><div class="wrap"><b>Thanks to</b>${(ctx.empty ? ['Supporters (optional, names as text)'] : ['City of Example community grants', 'Northside Hardware', 'Example Primary School P&C']).map(x => `<span>${ctx.empty ? `<span class="hint">${x}</span>` : esc(x)}</span>`).join('')}</div></section>
<section class="wrap section" aria-label="Lend a hand"><div class="help">${pic(ctx, 'produce', 'Photo (optional)', '4/3', '50% 50%')}<div class="inner"><h2>${s('Lend a hand', 'Call to action')}</h2><p>${s('No experience needed. Come along to a working bee and we’ll find you a job.', 'How to start')}</p><a class="btn" href="#">Volunteer with us</a></div></div></section>
<footer><div class="wrap"><div><b>Northside Community Garden</b><p style="margin-top:8px">${s('40 Example Street · Inc. association', 'Address and registration (optional)')}</p></div><div><b>Contact</b><p style="margin-top:8px">${s('hello@example.org', 'Email')}</p></div><div><b>Follow</b><p style="margin-top:8px">${ctx.empty ? 'Social links' : 'Facebook group · Newsletter'}</p></div>
 <p class="ack">${s('We acknowledge the Traditional Custodians of the land on which our garden grows, and pay our respects to Elders past and present.', 'Acknowledgement of Country (optional, in your own words)')}</p>${ctx.empty ? '' : '<p class="credit" style="grid-column:1/-1">Stock photographs on Pexels: Zack Gilbert, Jan van der Wolf, Gene Samit, Helena Lopes, Kampus Production, Jelena Kazak.</p>'}</div></footer>`;
  }
};

// ---------------------------------------------------------------------------------------------
// 14 · Maker & small shop
// ---------------------------------------------------------------------------------------------
const maker = {
  id: 'maker-shop',
  scheme: 'light',
  css: `
.util{background:var(--accent);color:var(--onAccent);font-size:13px;text-align:center;padding:9px 5%}
.head{border-bottom:1px solid var(--border)}.head .wrap{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding-top:22px;padding-bottom:22px}
.head nav{display:flex;gap:24px;font-size:15px}.head nav.r{justify-content:end}
.brand{text-align:center;font:500 28px/1 var(--head);letter-spacing:.04em}.brand small{display:block;font:500 11px/1 var(--body);letter-spacing:.24em;text-transform:uppercase;color:var(--muted);margin-top:8px}
.hero .wrap{display:grid;grid-template-columns:5fr 7fr;gap:56px;align-items:center;padding-top:48px;padding-bottom:72px}
.hero h1{font-size:clamp(44px,5.4vw,76px);font-weight:500;letter-spacing:-.015em;margin:16px 0 18px;line-height:1.05}
.hero p{font-size:19px;color:var(--muted);max-width:440px}.hero .btns{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}
.hero .note{margin-top:28px;padding-top:18px;border-top:1px solid var(--border);font-size:14px;color:var(--muted);display:flex;flex-direction:column;gap:6px}.hero .note b{color:var(--text)}
.shead{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:26px}.shead h2{font-size:clamp(30px,3.4vw,44px);font-weight:500}.shead a{font-size:15px;border-bottom:1px solid currentColor;white-space:nowrap}
.filters{display:flex;gap:8px;flex-wrap:nowrap;overflow-x:auto;margin-bottom:22px}.filters span{padding:8px 14px;border:1px solid var(--border);border-radius:999px;font-size:14px;white-space:nowrap}.filters span.on{background:var(--text);color:var(--bg);border-color:var(--text)}
.products{display:grid;grid-template-columns:repeat(3,1fr);gap:34px 26px}
.prod figure{margin:0;position:relative}.prod .pic,.prod .slot{border-radius:var(--radius)}
.badge{position:absolute;top:12px;left:12px;font:600 12px/1 var(--body);padding:6px 9px;border-radius:3px;background:var(--surface);color:var(--text)}.badge.out{background:var(--text);color:var(--bg)}.badge.mto{background:var(--art1);color:#1f1f1c}
.prod .line{display:flex;justify-content:space-between;gap:12px;margin-top:14px;align-items:baseline}.prod h3{font:500 20px/1.25 var(--head)}.prod .price{font-weight:600;white-space:nowrap}
.prod p{color:var(--muted);font-size:14px;margin:4px 0 10px}.prod a.enq{font-size:14px;font-weight:600;color:var(--accent)}
.prod.custom{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:30px;display:flex;flex-direction:column;justify-content:center}.prod.custom h3{font-size:26px;margin-bottom:10px}
.process{background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
.steps3{display:grid;grid-template-columns:repeat(3,1fr);gap:26px;counter-reset:s}.steps3 article{counter-increment:s}.steps3 .pic,.steps3 .slot{border-radius:var(--radius)}
.steps3 h3{font:500 22px/1.2 var(--head);margin:14px 0 6px}.steps3 h3::before{content:counter(s) " · ";color:var(--accent)}.steps3 p{color:var(--muted);font-size:15px;margin:0}
.journal{display:grid;grid-template-columns:7fr 5fr;gap:56px;align-items:center}.journal .pic,.journal .slot{border-radius:var(--radius)}
.journal h2{font-size:clamp(30px,3.4vw,46px);font-weight:500;margin:12px 0 14px}.journal p{color:var(--muted);font-size:18px}
.where{display:grid;grid-template-columns:1fr 1fr;gap:48px}
.markets{list-style:none;margin:0;padding:0}.markets li{display:flex;justify-content:space-between;gap:16px;padding:14px 0;border-bottom:1px solid var(--border)}.markets b{font-weight:600}.markets span{color:var(--muted);font-size:15px;text-align:right}
.shops{display:grid;gap:12px}.shops a{display:flex;justify-content:space-between;align-items:center;border:1px solid var(--border);border-radius:var(--radius);padding:16px 18px;background:var(--surface)}.shops a b{font-weight:600}.shops a span{color:var(--muted);font-size:14px}.shops a::after{content:"↗";color:var(--muted)}
.order{text-align:center;padding:76px 5%;border-top:1px solid var(--border)}.order h2{font-size:clamp(32px,4vw,52px);font-weight:500}.order p{color:var(--muted);max-width:540px;margin:12px auto 24px}
.order ol{display:flex;justify-content:center;gap:28px;list-style:none;padding:0;margin:0 0 28px;font-size:15px;counter-reset:o;flex-wrap:wrap}.order li{counter-increment:o}.order li::before{content:counter(o);display:inline-grid;place-items:center;width:26px;height:26px;border-radius:50%;background:var(--art2);margin-right:8px;font-weight:700;font-size:13px}
footer{padding:34px 0 50px;font-size:14px;color:var(--muted);border-top:1px solid var(--border)}footer .wrap{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap}
@media (max-width:760px){
 .head .wrap{grid-template-columns:1fr auto 1fr}.head nav{display:none}.head .wrap::before{content:"☰";font-size:20px}.head .wrap::after{content:"Order";text-align:right;font-weight:600;font-size:14px}.brand{font-size:22px}
 .hero .wrap{grid-template-columns:1fr;gap:26px;padding-top:0;padding-bottom:44px}.hero .pic,.hero .slot{order:-1;margin:0 -5.3%;border-radius:0;aspect-ratio:4/3!important}.hero h1{font-size:42px}
 .products{grid-template-columns:1fr 1fr;gap:24px 14px}.prod h3{font-size:16px}.prod .line{flex-direction:column;gap:2px;margin-top:10px}.prod p{display:none}.prod.custom{grid-column:1/-1;padding:22px}
 .steps3{grid-template-columns:1fr}.steps3 article{display:grid;grid-template-columns:110px 1fr;gap:14px;align-items:center}.steps3 .pic,.steps3 .slot{aspect-ratio:1/1!important}.steps3 h3{margin:0 0 4px;font-size:19px}
 .journal,.where{grid-template-columns:1fr;gap:26px}.markets li{flex-direction:column;gap:2px}.markets span{text-align:left}
}`,
  body(ctx) {
    const s = (v, h) => txt(ctx, v, h);
    const products = ctx.empty ? [['', 'Product photo', 'Name', 'Price', 'Short description', '']] : [['cups', 'Speckle latte cups', 'Set of four', '$120', 'Oatmeal glaze, 250 ml. Dishwasher safe.', ''], ['bowls', 'Breakfast bowls', 'Each', '$48', 'Satin white, 15 cm. Thrown to order.', 'mto'], ['vases', 'Bud vases', 'Pair', '$85', 'Raw clay band, cream glaze.', 'out'], ['blue-mug', 'Harbour mug', 'Each', '$42', 'Our blue, 350 ml. Comfortable handle.', ''], ['shelf', 'Studio seconds box', 'Mixed', '$60', 'Small marks, fully usable. Released monthly.', '']];
    const badge = k => (k === 'out' ? '<span class="badge out">Sold out</span>' : k === 'mto' ? '<span class="badge mto">Made to order · 3 weeks</span>' : '');
    return `
<div class="util">${s('Free local pick-up from the studio · postage Australia-wide', 'Shipping or pick-up note (optional)')}</div>
<header class="head"><div class="wrap"><nav aria-label="Shop"><a href="#">Shop</a><a href="#">Journal</a></nav><a class="brand" href="#">Kestrel Clay Co.<small>${s('Handmade ceramics', 'What you make')}</small></a><nav class="r" aria-label="More"><a href="#">About</a><a href="#">Markets</a><a href="#">Order</a></nav></div></header>
<section class="hero" aria-label="Welcome"><div class="wrap">
 <div><span class="eyebrow">${s('New batch · November', 'What’s new (optional)')}</span><h1>${s('Everyday pieces, made slowly.', 'Your headline')}</h1><p>${s('Mugs, bowls and vases thrown by hand in small batches in our backyard studio.', 'What you make, and how')}</p><div class="btns"><a class="btn primary" href="#">Browse the shop</a><a class="btn" href="#">How ordering works</a></div>
 <div class="note">${ctx.empty ? '<span class="hint">Up to three short promises (optional)</span>' : '<span><b>Small batches</b> · about 40 pieces a month</span><span><b>Local clay</b> where we can</span>'}</div></div>
 ${pic(ctx, 'hero-mugs', 'Your best product photo · landscape, natural light', '4/3', '45% 50%')}
</div></section>
<section class="wrap section" aria-label="Shop" style="padding-top:0">
 <div class="shead"><h2>${s('In the shop', 'Shop heading')}</h2><a href="#">See everything</a></div>
 <div class="filters">${(ctx.empty ? ['Category'] : ['All', 'Mugs & cups', 'Bowls', 'Vases', 'Seconds']).map((c, i) => `<span class="${i === 0 ? 'on' : ''}">${c}</span>`).join('')}</div>
 <div class="products">${products.map(([f, h, u, p, d, k]) => `<article class="prod"><figure>${pic(ctx, f || 'cups', 'Product photo · plain background', '4/5', '50% 55%')}${ctx.empty ? '' : badge(k)}</figure><div class="line"><h3>${hint(ctx, h, 'Name')}</h3><span class="price">${ctx.empty ? '<span class="hint">Price</span>' : `${p}${u ? ` <small class="muted" style="font-weight:400">· ${u}</small>` : ''}`}</span></div><p>${hint(ctx, d, 'Short description')}</p><a class="enq" href="#">${k === 'out' ? 'Ask about the next batch →' : 'Enquire →'}</a></article>`).join('')}
 <article class="prod custom"><span class="eyebrow">Commissions</span><h3>${s('Custom & wholesale', 'Something else you offer (optional)')}</h3><p style="display:block">${s('Dinner sets, café cups and gifts, made to your size and glaze. Tell us what you have in mind.', 'One or two sentences')}</p><a class="btn" href="#" style="align-self:start;margin-top:8px">Start a conversation</a></article></div>
</section>
<section class="process" aria-label="How it’s made"><div class="wrap section">
 <div class="shead"><h2>How it’s made</h2><a href="#">Our process</a></div>
 <div class="steps3">${[['wheel', 'Thrown', 'Every piece is thrown and trimmed by hand.'], ['glaze', 'Glazed', 'Our own glazes, mixed and tested in the studio.'], ['kiln', 'Fired', 'Twice: a bisque firing, then glaze to 1280 °C.']].map(([f, h, p]) => `<article>${pic(ctx, f, 'Process photo', '4/3', '50% 50%')}<div><h3>${s(h, 'Step')}</h3><p>${s(p, 'One sentence')}</p></div></article>`).join('')}</div>
</div></section>
<section class="wrap section journal" aria-label="From the journal">
 ${pic(ctx, 'bisque', 'Photo for your latest journal post', '3/2', '50% 50%')}
 <div><span class="eyebrow">From the journal</span><h2>${s('Firing day', 'Newest journal post')}</h2><p>${s('Twelve hours, one kiln and a lot of waiting. What happens to a mug between the wheel and your shelf.', 'Its summary')}</p><a href="#" style="border-bottom:1px solid currentColor">Read the post</a></div>
</section>
<section class="wrap section where" aria-label="Where to find us" style="padding-top:0">
 <div><div class="shead"><h2>Find us at markets</h2></div><ul class="markets">${(ctx.empty ? [['Market', 'Date · place']] : [['Saturday Makers Market', 'Sat 23 Nov · Example Showground'], ['Twilight Christmas Market', 'Fri 13 Dec · Harbour Park'], ['Open studio', 'First Sunday of the month · by appointment']]).map(([b, sp]) => `<li><b>${hint(ctx, b, b)}</b><span>${hint(ctx, sp, sp)}</span></li>`).join('')}</ul></div>
 <div><div class="shead"><h2>Also available at</h2></div><div class="shops">${(ctx.empty ? [['Your other shop (optional)', 'Link to a shop you already use']] : [['Our Etsy shop', 'Ships worldwide'], ['The Corner Store, Example St', 'Stockist · mugs and bowls']]).map(([b, sp]) => `<a href="#"><span><b>${hint(ctx, b, b)}</b><br><span>${hint(ctx, sp, sp)}</span></span></a>`).join('')}</div></div>
</section>
<section class="order" aria-label="Order"><h2>${s('Ordering', 'Ordering heading')}</h2><p>${s('Tell us which pieces you’d like. We’ll confirm availability, price and postage, then send a payment link.', 'How ordering works')}</p><ol>${(ctx.empty ? ['Step'] : ['Send an enquiry', 'We confirm by email', 'Pay & collect or post']).map(x => `<li>${ctx.empty ? `<span class="hint">${x}</span>` : x}</li>`).join('')}</ol><a class="btn primary" href="#">Send an enquiry</a></section>
<footer><div class="wrap"><span><b style="color:var(--text)">Kestrel Clay Co.</b> · ${s('Studio visits by appointment', 'Footer line')}</span><span>${ctx.empty ? 'Social links' : 'Instagram · Newsletter'}</span>${ctx.empty ? '' : '<span class="credit" style="flex-basis:100%">Stock photographs on Pexels: Yan Krukau, Diana Light, Cem Nisan, Vinícius Borralho, Natalie Goodwin, Deniz ŞENGÜL, Kampus Production, KoolShooters, ROMAN ODINTSOV.</span>'}</div></footer>`;
  }
};

export const DESIGNS_C = [consultant, musician, fitness, community, maker];
