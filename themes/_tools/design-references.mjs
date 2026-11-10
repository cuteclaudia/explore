// Design references for uplifted themes (batch A: magazine, photography-portfolio,
// trades-services, artist-studio, travel-journal).
//
// Writes themes/<id>/design/content.html and empty.html. These are design references for
// review and for the SoraWebSite implementation, not tenant starter content: a new tenant
// still starts with empty pages (see empty.html, which shows the Website Manager's guided
// placeholders). Sample names, places and text are fictional. Photographs are stock images
// from Pexels, stored beside each reference (design/images/, credits in design/CREDITS.md).
//
// No scripts, nothing loaded from outside the folder. Run: node themes/_tools/design-references.mjs
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { THEMES, FONT_STACKS } from './catalogue.mjs';
import { CREDITS } from './design-credits.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const esc = v => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const theme = id => THEMES.find(t => t.id === id);

// ---------------------------------------------------------------------------------------------
// Shared building blocks
// ---------------------------------------------------------------------------------------------

/** Image slot. In the empty reference it becomes a labelled placeholder showing the crop. */
function pic(ctx, file, alt, ratio = '3/2', focal = '50% 50%', cls = '') {
  if (ctx.empty) return `<div class="slot ${cls}" style="aspect-ratio:${ratio}"><span>${esc(alt)}<br><small>${ratio.replace('/', ':')}</small></span></div>`;
  return `<figure class="pic ${cls}" style="aspect-ratio:${ratio}"><img src="images/${file}.jpg" alt="${esc(alt)}" style="object-position:${focal}"></figure>`;
}

/** Text that only exists once the tenant has written it; the empty reference shows a hint. */
const txt = (ctx, value, hint) => (ctx.empty ? `<span class="hint">${esc(hint)}</span>` : esc(value));

function tokens(mode) {
  return Object.entries(mode).map(([k, v]) => `--${k}:${v}`).join(';');
}

function page(t, kind, { body, css, scheme = 'light', title }) {
  const c = scheme === 'dark' ? t.dark : t.light;
  const csp = "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'";
  return `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<meta name="robots" content="noindex">
<title>${esc(title)} · ${esc(t.name)} design reference (${kind})</title>
<style>
:root{${tokens(c)};--head:${FONT_STACKS[t.font.heading]};--body:${FONT_STACKS[t.font.body]};--radius:${t.radius ?? 8}px;--btn:${t.buttonRadius ?? t.radius ?? 8}px;--max:${t.width ?? 1180}px;color-scheme:${scheme}}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--text);font:16px/1.6 var(--body)}
img{display:block;max-width:100%}a{color:inherit;text-decoration:none}
h1,h2,h3,h4{font-family:var(--head);line-height:1.1;margin:0}
p{margin:0 0 1em}
.wrap{max-width:var(--max);margin:0 auto;padding:0 5%}
.section{padding-top:72px;padding-bottom:72px}
.eyebrow{font:600 12px/1.4 var(--body);letter-spacing:.18em;text-transform:uppercase;color:var(--muted)}
.muted{color:var(--muted)}
.btn{display:inline-flex;align-items:center;gap:8px;min-height:46px;padding:0 22px;border-radius:var(--btn);border:1px solid var(--border);background:var(--surface);color:var(--text);font:600 15px/1 var(--body)}
.btn.primary{background:var(--accent);border-color:var(--accent);color:var(--onAccent)}
.pic{margin:0;overflow:hidden;background:var(--surface)}.pic img{width:100%;height:100%;object-fit:cover}
.slot{display:grid;place-items:center;text-align:center;border:1.5px dashed color-mix(in srgb,var(--muted) 55%,transparent);background:repeating-linear-gradient(135deg,transparent 0 14px,color-mix(in srgb,var(--muted) 7%,transparent) 14px 15px);color:var(--muted);font:500 13px/1.4 var(--body);padding:12px}
.slot small{font-weight:400;opacity:.8}
.hint{display:inline-block;color:var(--muted);font-family:var(--body);font-weight:400;font-style:normal;letter-spacing:0;text-transform:none;border-bottom:1.5px dashed color-mix(in srgb,var(--muted) 60%,transparent)}
.manager{position:sticky;top:0;z-index:50;display:flex;gap:12px;align-items:center;justify-content:center;flex-wrap:wrap;padding:8px 16px;background:#1d2b3a;color:#f3f6f9;font:13px/1.4 system-ui,sans-serif}
.manager b{font-weight:600}
.credit{font-size:11px;color:var(--muted)}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
@media (max-width:760px){.section{padding-top:48px;padding-bottom:48px}}
${css}
</style>
</head>
<body>
${kind === 'empty' ? '<div class="manager"><b>Website Manager preview · new site</b><span>Dashed areas are guides for the owner. They are never published: an empty section is left out of the public page.</span></div>' : ''}
${body}
</body>
</html>
`;
}

// ---------------------------------------------------------------------------------------------
// 8 · Magazine
// ---------------------------------------------------------------------------------------------
const magazine = {
  id: 'magazine',
  scheme: 'light',
  css: `
.util{border-bottom:1px solid var(--border);font-size:13px}.util .wrap{display:flex;justify-content:space-between;gap:16px;padding-top:10px;padding-bottom:10px}
.util a{color:var(--accent);font-weight:600}
.mast{text-align:center;padding:34px 0 18px}.mast h1{font-size:clamp(40px,7vw,84px);font-weight:700;letter-spacing:-.01em}
.mast p{margin:10px 0 0;font:500 12px/1 var(--body);letter-spacing:.32em;text-transform:uppercase;color:var(--muted)}
.nav{border-top:3px double var(--text);border-bottom:1px solid var(--text)}.nav .wrap{display:flex;justify-content:center;gap:34px;padding-top:12px;padding-bottom:12px;font:600 12px/1 var(--body);letter-spacing:.16em;text-transform:uppercase;overflow-x:auto;white-space:nowrap}
.nav a.on{color:var(--accent)}
.lead{display:grid;grid-template-columns:8fr 4fr;gap:40px;padding:40px 0 56px;border-bottom:1px solid var(--border)}
.kicker{font:700 12px/1 var(--body);letter-spacing:.16em;text-transform:uppercase;color:var(--accent)}
.lead h2{font-size:clamp(34px,4.2vw,56px);font-weight:700;margin:14px 0 14px;letter-spacing:-.01em}
.stand{font:italic 400 20px/1.5 ${FONT_STACKS.serif};color:var(--text);max-width:640px}
.by{font-size:13px;color:var(--muted);margin-top:14px}
.lead .pic,.lead .slot{margin-bottom:22px}
.rail{display:flex;flex-direction:column;gap:26px;border-left:1px solid var(--border);padding-left:34px}
.rail article h3{font-size:24px;font-weight:700;margin:10px 0 6px}
.rail .pic,.rail .slot{margin-bottom:12px}
.brief h4{font:700 12px/1 var(--body);letter-spacing:.16em;text-transform:uppercase;border-top:3px solid var(--text);padding-top:12px;margin-bottom:6px}
.brief ol{margin:0;padding:0;list-style:none;counter-reset:b}.brief li{counter-increment:b;display:grid;grid-template-columns:28px 1fr;padding:12px 0;border-bottom:1px solid var(--border);font-weight:600;line-height:1.35}
.brief li::before{content:counter(b);font:700 22px/1 var(--head);color:var(--accent)}
.shead{display:flex;justify-content:space-between;align-items:end;border-top:3px solid var(--text);padding-top:12px;margin-bottom:26px}
.shead h3{font-size:30px;font-weight:700}.shead a{font-weight:600;font-size:14px}
.issue{display:grid;grid-template-columns:repeat(3,1fr) 1.05fr;gap:30px}
.issue article h3{font-size:23px;font-weight:700;margin:10px 0 8px}.issue article p{font-size:15px;color:var(--muted)}
.issue .pic,.issue .slot{margin-bottom:14px}
.opinion{background:var(--surface);padding:28px;display:flex;flex-direction:column;justify-content:space-between}
.opinion blockquote{margin:14px 0;font:italic 400 26px/1.3 var(--head)}
.most{border-left:1px solid var(--border);padding-left:26px}
.band{position:relative;color:var(--heroText);margin:8px 0}.band .pic,.band .slot{aspect-ratio:21/9}
.band .cap{position:absolute;inset:auto 0 0 0;padding:48px 5% 34px;background:linear-gradient(0deg,color-mix(in srgb,var(--heroShade) 88%,transparent),transparent)}
.band h3{font-size:clamp(30px,4vw,52px);font-weight:700;margin:12px 0 8px;max-width:760px}.band .kicker{color:var(--heroText)}
.band .credit{color:color-mix(in srgb,var(--heroText) 80%,transparent)}
.interview{display:grid;grid-template-columns:5fr 7fr;gap:56px;align-items:center}
.interview blockquote{margin:16px 0 22px;font:italic 400 clamp(28px,3.2vw,40px)/1.25 var(--head)}
.news{text-align:center;border-top:3px double var(--text);border-bottom:1px solid var(--text);padding:46px 5%}
.news h3{font-size:34px;font-weight:700;margin-bottom:8px}.news .row{display:flex;justify-content:center;gap:10px;margin-top:18px;flex-wrap:wrap}
.field{min-height:46px;width:min(340px,100%);border:1px solid var(--border);background:var(--surface);display:flex;align-items:center;padding:0 16px;color:var(--muted);font-size:15px}
footer{padding:44px 0 56px;font-size:14px}footer .wrap{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:30px}
footer h4{font:700 12px/1 var(--body);letter-spacing:.16em;text-transform:uppercase;margin-bottom:12px}footer .m{font:700 30px/1 var(--head)}
footer ul{list-style:none;margin:0;padding:0;line-height:2}
.menu{display:none}
@media (max-width:980px){.issue{grid-template-columns:1fr 1fr}.most{border:0;padding:0}}
@media (max-width:760px){
 .util .wrap>span:first-child{display:none}.util .wrap{justify-content:center}
 .mast{padding:22px 0 12px}.mast h1{font-size:40px}.mast p{letter-spacing:.2em;font-size:11px}
 .nav .wrap{justify-content:flex-start;gap:22px}
 .lead{grid-template-columns:1fr;gap:30px;padding:24px 0 36px}.lead h2{font-size:34px}.stand{font-size:18px}
 .rail{border:0;padding:0}.rail article{display:grid;grid-template-columns:120px 1fr;gap:14px;align-items:start}.rail article .pic,.rail article .slot{margin:0;aspect-ratio:1/1!important}.rail article h3{font-size:19px;margin-top:6px}.rail article p{display:none}
 .issue{grid-template-columns:1fr}.issue article{display:block}
 .band .pic,.band .slot{aspect-ratio:4/5}.band .cap{padding:40px 6% 26px}
 .interview{grid-template-columns:1fr;gap:26px}
 footer .wrap{grid-template-columns:1fr 1fr}footer .wrap>div:first-child{grid-column:1/-1}
}`,
  body(ctx) {
    const t = theme('magazine');
    const s = (v, h) => txt(ctx, v, h);
    const name = 'The Valley Review';
    return `
<div class="util"><div class="wrap"><span>Tuesday 10 November 2026 · ${ctx.empty ? '<span class="hint">Issue number</span>' : 'Issue 41'}</span><span><a href="#">Subscribe</a> · <a href="#">Search</a></span></div></div>
<header class="mast"><h1>${name}</h1><p>${s('Arts · Ideas · Local life', 'Tagline (optional)')}</p></header>
<nav class="nav" aria-label="Sections"><div class="wrap"><a class="on" href="#">Stories</a><a href="#">News</a>${ctx.empty ? '' : '<a href="#">Arts</a><a href="#">Food</a><a href="#">Ideas</a><a href="#">Architecture</a>'}<a href="#">About</a></div></nav>
<main class="wrap">
 <section class="lead" aria-label="Cover story">
  <article>
   ${pic(ctx, 'cover-street', 'Lead story photograph', '3/2', '50% 55%')}
   <span class="kicker">${s('Cover story', 'Category')}</span>
   <h2>${s('The slow return of the main street', 'Your lead story’s headline appears here')}</h2>
   <p class="stand">${s('Empty shopfronts are filling again, one bakery, bookshop and bike repairer at a time. We spent a month on the street to find out why.', 'The standfirst: one or two sentences that make readers want to start.')}</p>
   <p class="by">${s('Words by Hana Oduya · Photographs by the Review', 'Byline')}</p>
  </article>
  <aside class="rail" aria-label="Also in this issue">
   <article>${pic(ctx, 'library-concrete', 'Story photograph', '16/9', '50% 40%')}<div><span class="kicker">${s('Architecture', 'Category')}</span><h3>${s('Saving the concrete library', 'Second story')}</h3><p class="muted">${s('Loved, loathed and listed: the fight over a brutalist landmark.', 'Short summary')}</p></div></article>
   <article>${pic(ctx, 'cafe-reader', 'Story photograph', '16/9', '50% 50%')}<div><span class="kicker">${s('Ideas', 'Category')}</span><h3>${s('Why we still read the paper', 'Third story')}</h3><p class="muted">${s('Print is shrinking. Its readers are not going anywhere.', 'Short summary')}</p></div></article>
   <div class="brief"><h4>In brief</h4><ol>${ctx.empty ? '<li><span class="hint">Your latest News posts are listed here</span></li>' : '<li>Council approves the riverside walk</li><li>Open studios trail returns in March</li><li>New bus timetable from Monday</li><li>Library extends weekend hours</li>'}</ol></div>
  </aside>
 </section>
 <section class="section" aria-label="This issue">
  <div class="shead"><h3>This issue</h3><a href="#">All stories →</a></div>
  <div class="issue">
   <article>${pic(ctx, 'pottery-hands', 'Story photograph', '4/5', '45% 50%')}<span class="kicker">${s('Arts', 'Category')}</span><h3>${s('Twelve studios, one weekend', 'Story headline')}</h3><p>${s('A field guide to the open studios trail, from wheel to kiln.', 'Short summary')}</p></article>
   <article>${pic(ctx, 'market', 'Story photograph', '4/5', '55% 50%')}<span class="kicker">${s('Food', 'Category')}</span><h3>${s('The Saturday market at fifty', 'Story headline')}</h3><p>${s('Half a century of tomatoes, gossip and very early starts.', 'Short summary')}</p></article>
   <article class="opinion"><div><span class="kicker">${s('Opinion', 'Category')}</span><blockquote>${s('“A town that cannot sit still on a bench has forgotten what a town is for.”', 'A pull quote from an opinion piece')}</blockquote></div><p class="by">${s('Mere Tamati on public seating', 'Writer · topic')}</p></article>
   <div class="most brief"><h4>Most read</h4><ol>${ctx.empty ? '<li><span class="hint">Filled automatically once stories are published</span></li>' : '<li>Who owns the old mill?</li><li>The orchard that came back</li><li>Grand final day, in pictures</li><li>A cheaper way to heat old houses</li><li>The last dairy in the valley</li>'}</ol></div>
  </div>
 </section>
</main>
<section class="band" aria-label="Photo essay">
 ${pic(ctx, 'night-bus', 'Full-width photo essay image', '21/9', '50% 55%')}
 <div class="cap"><div class="wrap" style="padding:0"><span class="kicker">${s('Photo essay', 'Category')}</span><h3>${s('The last bus home', 'Photo essay title')}</h3>${ctx.empty ? '' : '<p class="credit">Night routes across the valley, from 11 pm to the depot.</p>'}</div></div>
</section>
<main class="wrap">
 <section class="section interview" aria-label="Interview">
  ${pic(ctx, 'portrait-window', 'Portrait for an interview', '4/5', '50% 30%')}
  <div><span class="kicker">${s('Interview', 'Category')}</span><blockquote>${s('“I paint the river because it never agrees to stay the same.”', 'A pull quote from the interview')}</blockquote><h3 style="font-size:28px;margin-bottom:10px">${s('In the studio with Ama Oyelaran', 'Interview headline')}</h3><p class="muted">${s('The painter on light, patience and the sound of the weir.', 'Short summary')}</p><a class="btn" href="#">Read the interview →</a></div>
 </section>
</main>
<section class="wrap"><div class="news"><h3>${s('The Review, once a month', 'Newsletter heading')}</h3><p class="muted">${s('One email on the first Sunday of the month. No tracking, unsubscribe any time.', 'One line about what readers will get')}</p><div class="row"><span class="field">Email address</span><a class="btn primary" href="#">Subscribe</a></div></div></section>
<footer><div class="wrap"><div><div class="m">${name}</div><p class="muted" style="margin-top:12px;max-width:340px">${s('An independent, volunteer-run magazine about the valley and the people in it.', 'About the publication (from your About page)')}</p></div><div><h4>Sections</h4><ul><li>Stories</li><li>News</li><li>About</li></ul></div><div><h4>Contact</h4><ul><li>${s('editor@example.com', 'Email')}</li><li>Write for us</li></ul></div><div><h4>Follow</h4><ul><li>Newsletter</li><li>Social links</li></ul></div></div>
${ctx.empty ? '' : '<div class="wrap"><p class="credit" style="margin-top:28px">Photographs: Jesse Hauck, Rick Han, Thomas Balabaud, Vitaly Gariev, Brett Sayles, Artem Saranin and Mr Kafui on Pexels.</p></div>'}</footer>`;
  }
};

// ---------------------------------------------------------------------------------------------
// 1 · Photography portfolio
// ---------------------------------------------------------------------------------------------
const photography = {
  id: 'photography-portfolio',
  scheme: 'dark',
  css: `
.top{position:absolute;inset:0 0 auto 0;z-index:5;color:#f4f4f2}.top .wrap{display:flex;justify-content:space-between;align-items:center;padding-top:26px;padding-bottom:26px;max-width:none;padding-left:4%;padding-right:4%}
.brand{font:500 13px/1 var(--body);letter-spacing:.32em;text-transform:uppercase}
.top nav{display:flex;gap:30px;font:500 13px/1 var(--body);letter-spacing:.14em;text-transform:uppercase}
.hero{position:relative;height:100vh;min-height:620px;max-height:980px;color:#f4f4f2;background:#111}
.hero .pic,.hero .slot{position:absolute;inset:0;aspect-ratio:auto!important;height:100%}
.hero .slot{border-color:#ffffff55;color:#ffffffaa}
.hero .shade{position:absolute;inset:0;background:linear-gradient(0deg,#000a 0%,#0000 45%),linear-gradient(180deg,#0006 0%,#0000 22%)}
.hero .copy{position:absolute;left:4%;right:4%;bottom:56px;display:flex;justify-content:space-between;align-items:end;gap:30px}
.hero h1{font-size:clamp(52px,8vw,112px);font-weight:200;letter-spacing:-.02em}
.hero p{margin:14px 0 0;font-size:17px;max-width:520px;color:#e7e7e3}
.hero small{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#d6d6d0;white-space:nowrap}
.intro{display:grid;grid-template-columns:1fr 2fr;gap:40px;align-items:end;padding-top:96px;padding-bottom:44px}
.intro h2{font-size:clamp(32px,3.6vw,48px);font-weight:200}
.intro p{font-size:18px;color:var(--muted);max-width:620px;margin:0}
.grid{columns:3 320px;column-gap:14px;padding:0 4%}.grid figure{break-inside:avoid;margin:0 0 14px}
.grid .pic,.grid .slot{width:100%}
.grid figcaption{display:flex;justify-content:space-between;font-size:12px;letter-spacing:.06em;color:var(--muted);padding:8px 2px 4px}
.series{border-top:1px solid var(--border)}.series a{display:grid;grid-template-columns:220px 1fr auto;gap:30px;align-items:center;padding:22px 0;border-bottom:1px solid var(--border)}
.series .pic,.series .slot{aspect-ratio:16/9}.series h3{font-size:30px;font-weight:200}.series span{color:var(--muted);font-size:14px}
.about{display:grid;grid-template-columns:6fr 5fr;gap:64px;align-items:center}
.about h2{font-size:42px;font-weight:200;margin-bottom:18px}.about p{color:var(--muted);font-size:17px}
.facts{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:26px;border-top:1px solid var(--border);padding-top:20px;font-size:14px}.facts b{display:block;font-weight:500;color:var(--text)}
.contact{background:#000;color:#f2f2f2;text-align:center;padding:110px 5%}.contact h2{font-size:clamp(34px,5vw,64px);font-weight:200}
.contact p{color:#b9b9b4;margin:16px auto 28px;max-width:520px}.contact .btn{background:transparent;color:#f2f2f2;border-color:#f2f2f2}
footer{display:flex;justify-content:space-between;gap:20px;padding:26px 4%;font-size:12px;color:var(--muted);letter-spacing:.06em;flex-wrap:wrap}
@media (max-width:760px){
 .top .wrap{padding-top:18px;padding-bottom:18px}.top nav a:not(:last-child){display:none}.top nav a:last-child::before{content:"☰  "}
 .hero{height:86vh;min-height:560px}.hero .copy{flex-direction:column;align-items:flex-start;bottom:30px;gap:16px}.hero h1{font-size:54px}
 .intro{grid-template-columns:1fr;gap:14px;padding-top:56px}
 .grid{columns:2 140px;column-gap:8px;padding:0 3%}.grid figure{margin-bottom:8px}.grid figcaption{display:none}
 .series a{grid-template-columns:96px 1fr;gap:16px}.series a>span:last-child{display:none}.series h3{font-size:22px}
 .about{grid-template-columns:1fr;gap:26px}.contact{padding:72px 6%}
}`,
  body(ctx) {
    const s = (v, h) => txt(ctx, v, h);
    const works = [
      ['mountain-reflection', 'Still water, Ashby Pass', '2025', '3/2', '50% 50%'],
      ['rain-night', 'After the rain', '2026', '2/3', '50% 50%'],
      ['wave-mono', 'The southerly', '2024', '3/2', '50% 50%'],
      ['fox', 'Visitor, first snow', '2025', '4/3', '55% 50%'],
      ['misty-pines', 'Pines in cloud', '2026', '2/3', '50% 50%'],
      ['dunes', 'Red sand, late light', '2024', '3/2', '50% 50%'],
      ['glacier', 'Ice field', '2023', '16/10', '50% 50%'],
      ['dusk-lake', 'Blue hour', '2025', '3/2', '50% 60%']
    ];
    return `
<header class="top"><div class="wrap"><a class="brand" href="#">Mara Quill</a><nav aria-label="Main"><a href="#">Portfolio</a><a href="#">About</a><a href="#">Contact</a></nav></div></header>
<section class="hero" aria-label="Opening photograph">
 ${pic(ctx, 'hero-misty-lake', 'Your opening photograph · landscape, at least 2400 px wide', '16/9', '45% 50%')}
 ${ctx.empty ? '' : '<div class="shade"></div>'}
 <div class="copy"><div><h1>${s('Quiet light', 'Your name or series title')}</h1><p>${s('Coastlines, high country and the people in between.', 'One line about your work')}</p></div><small>${s('Lake Ashby, before dawn · 2025', 'Caption for the opening photograph')}</small></div>
</section>
<section class="wrap intro"><h2>${s('Selected work', 'Selected work')}</h2><p>${s('I photograph slowly, mostly at the edges of the day, and print every series on archival cotton rag.', 'Two sentences about how and what you photograph (from your About page)')}</p></section>
<section class="grid" aria-label="Selected work">
 ${works.map(([f, title, year, ratio, focal]) => `<figure>${pic(ctx, f, ctx.empty ? 'Portfolio photograph' : title, ratio, focal)}${ctx.empty ? '' : `<figcaption><span>${esc(title)}</span><span>${year}</span></figcaption>`}</figure>`).join('\n ')}
</section>
<section class="wrap section" aria-label="Series">
 <p class="eyebrow" style="margin-bottom:18px">Series</p>
 <div class="series">
  ${[['glacier', 'Cold country', '2023–24', '32 photographs'], ['wave-mono', 'Southerly', '2024', '18 photographs'], ['rain-night', 'Wet streets', '2026', '24 photographs']].map(([f, n, y, c]) => `<a href="#">${pic(ctx, f, 'Series cover', '16/9')}<div><h3>${s(n, 'Series title')}</h3><span>${s(y, 'Years')}</span></div><span>${s(c, 'Number of photographs')} →</span></a>`).join('\n  ')}
 </div>
</section>
<section class="wrap section about" aria-label="About">
 ${pic(ctx, 'photographer', 'Portrait of you at work', '4/3', '72% 50%')}
 <div><p class="eyebrow">About</p><h2>${s('Mara Quill', 'Your name')}</h2><p>${s('Landscape and portrait photographer working across the Southern Tablelands and the coast. Commissions for editorial, tourism and private clients; limited-edition prints of every series.', 'A short biography from your About page')}</p>
 <div class="facts"><div><b>Based in</b>${s('Southern Tablelands', 'Where you work')}</div><div><b>Available for</b>${s('Editorial · Prints · Portraits', 'What people can hire you for')}</div></div></div>
</section>
<section class="contact" aria-label="Contact"><p class="eyebrow" style="color:#b9b9b4">Contact</p><h2>${s('Commissions & prints', 'Contact heading')}</h2><p>${s('For commissions, licensing and print enquiries, write to me. I reply within two days.', 'How people should get in touch')}</p><a class="btn" href="#">${ctx.empty ? 'Contact button' : 'hello@example.com'}</a></section>
<footer><span>© 2026 ${ctx.empty ? 'Your name' : 'Mara Quill'}</span><span>${ctx.empty ? 'Social links' : 'Instagram · Prints · Newsletter'}</span>${ctx.empty ? '' : '<span>Stock photographs on Pexels: Isaak Cole, eberhard grossgasteiger, Chen Te, Stijn Dijkstra, Beyza Kaplan, Igor Dudkovskiy, Chad Hicks, Quang Nguyen Vinh, Harry Xie</span>'}</footer>`;
  }
};

// ---------------------------------------------------------------------------------------------
// 4 · Trades & local services
// ---------------------------------------------------------------------------------------------
const trades = {
  id: 'trades-services',
  scheme: 'light',
  css: `
.bar{background:var(--heroShade);color:var(--heroText);font-size:13px}.bar .wrap{display:flex;justify-content:space-between;gap:16px;padding-top:9px;padding-bottom:9px}
.bar b{color:var(--art2)}
.head{background:var(--surface);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:20}.head .wrap{display:flex;align-items:center;gap:28px;padding-top:14px;padding-bottom:14px}
.logo{display:flex;align-items:center;gap:12px;font:700 22px/1 var(--head);text-transform:uppercase;letter-spacing:.02em}
.logo i{display:grid;place-items:center;width:42px;height:42px;background:var(--accent);color:var(--onAccent);font-style:normal;border-radius:var(--radius)}
.head nav{display:flex;gap:26px;margin-left:auto;font-weight:600;font-size:15px}
.hero{background:var(--heroShade);color:var(--heroText)}.hero .wrap{display:grid;grid-template-columns:6fr 5fr;gap:56px;align-items:center;padding-top:72px;padding-bottom:72px}
.hero .eyebrow{color:var(--art2)}
.hero h1{font-size:clamp(44px,5vw,70px);font-weight:700;text-transform:uppercase;letter-spacing:.01em;margin:16px 0 18px}
.hero p.lede{font-size:19px;max-width:560px;color:color-mix(in srgb,var(--heroText) 86%,transparent)}
.hero .btns{display:flex;gap:12px;flex-wrap:wrap;margin:26px 0 30px}.hero .btn:not(.primary){background:transparent;color:var(--heroText);border-color:color-mix(in srgb,var(--heroText) 50%,transparent)}
.ticks{display:flex;gap:22px;flex-wrap:wrap;list-style:none;margin:0;padding:0;font-size:14px;font-weight:600}.ticks li::before{content:"✓ ";color:var(--art2)}
.hero figure{position:relative}.hero .pic,.hero .slot{border-radius:var(--radius)}
.hero .slot{color:#ffffffbb;border-color:#ffffff66}
.card-float{position:absolute;left:-28px;bottom:28px;background:var(--surface);color:var(--text);border-radius:var(--radius);padding:16px 20px;box-shadow:0 12px 30px #0003;max-width:260px}
.card-float b{display:block;font:700 20px/1.1 var(--head);text-transform:uppercase}
.shead{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:28px}.shead h2{font-size:clamp(32px,3.6vw,46px);text-transform:uppercase}
.services{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.svc{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;display:flex;flex-direction:column}
.svc .body{padding:20px 20px 22px}.svc h3{font-size:24px;text-transform:uppercase;margin-bottom:8px}.svc p{font-size:15px;color:var(--muted)}.svc a{font-weight:700;color:var(--accent)}
.nums{background:var(--accent);color:var(--onAccent)}.nums .wrap{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;padding-top:34px;padding-bottom:34px}
.nums b{display:block;font:700 46px/1 var(--head)}.nums span{font-size:14px;font-weight:600}
.jobs{display:grid;grid-template-columns:2fr 1fr;grid-template-rows:250px 250px;gap:16px}
.jobs figure{margin:0;position:relative}.jobs figure:first-child{grid-row:span 2}
.jobs figcaption{position:absolute;left:12px;bottom:12px;background:var(--surface);color:var(--text);padding:7px 12px;border-radius:var(--radius);font-size:13px;font-weight:600}
.jobs .pic,.jobs .slot{height:100%;aspect-ratio:auto!important;border-radius:var(--radius)}
.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;counter-reset:s}
.steps li{list-style:none;counter-increment:s;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:24px}
.steps li::before{content:counter(s);display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:var(--heroShade);color:var(--heroText);font:700 20px/1 var(--head);margin-bottom:16px}
.steps h3{font-size:22px;text-transform:uppercase;margin-bottom:6px}.steps p{color:var(--muted);font-size:15px;margin:0}
.team{display:grid;grid-template-columns:5fr 6fr;gap:56px;align-items:center}
.quote{border-left:4px solid var(--accent);padding:6px 0 6px 20px;margin:22px 0;font-size:19px}
.quote cite{display:block;font-size:14px;color:var(--muted);font-style:normal;margin-top:8px}
.facts{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:20px}.facts div{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:14px;font-size:14px}.facts b{display:block}
.cta{background:var(--heroShade);color:var(--heroText)}.cta .wrap{display:flex;justify-content:space-between;align-items:center;gap:30px;padding-top:56px;padding-bottom:56px}
.cta h2{font-size:clamp(34px,4vw,52px);text-transform:uppercase}.cta p{margin:8px 0 0;color:color-mix(in srgb,var(--heroText) 82%,transparent)}
footer{padding:40px 0 60px;font-size:14px;color:var(--muted)}footer .wrap{display:grid;grid-template-columns:2fr 1fr 1fr;gap:30px}footer b{color:var(--text)}
.callbar{display:none}
@media (max-width:1000px){.services{grid-template-columns:1fr 1fr}}
@media (max-width:760px){
 .bar .wrap>span:first-child{display:none}.bar .wrap{justify-content:center}
 .head nav{display:none}.head .wrap{justify-content:space-between}.head .menu{display:inline-flex}
 .hero .wrap{grid-template-columns:1fr;gap:30px;padding-top:40px;padding-bottom:48px}.hero h1{font-size:44px}.hero p.lede{font-size:17px}
 .card-float{left:12px;bottom:12px}
 .services{grid-template-columns:1fr}.svc{flex-direction:row}.svc .pic,.svc .slot{width:38%;aspect-ratio:1/1!important;flex:none}.svc .body{padding:14px}.svc h3{font-size:19px}.svc p{display:none}
 .nums .wrap{grid-template-columns:1fr 1fr}.nums b{font-size:36px}
 .jobs{grid-template-columns:1fr;grid-template-rows:none}.jobs figure:first-child{grid-row:auto}.jobs .pic,.jobs .slot{aspect-ratio:3/2!important}
 .steps{grid-template-columns:1fr;padding:0}
 .team{grid-template-columns:1fr;gap:26px}.facts{grid-template-columns:1fr}
 .cta .wrap{flex-direction:column;align-items:flex-start}
 footer .wrap{grid-template-columns:1fr}
 .callbar{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:10px 12px 14px;background:var(--surface);border-top:1px solid var(--border)}
 .callbar::before{content:'Phone action bar · fixed to the bottom of the screen while scrolling';grid-column:1/-1;font-size:11px;color:var(--muted);text-align:center}
 .callbar .btn{justify-content:center}
 body{padding-bottom:0}
}
.menu{display:none}`,
  body(ctx) {
    const s = (v, h) => txt(ctx, v, h);
    const svc = [
      ['carpentry', 'Carpentry', 'Framing, doors, stairs and custom joinery made on site or in our workshop.', '45% 50%'],
      ['kitchen-timber', 'Kitchens', 'Full renovations: design, cabinetry, benchtops, plumbing and power.', '50% 50%'],
      ['deck-pergola', 'Decks & pergolas', 'Hardwood and composite decks, pergolas and outdoor rooms.', '40% 60%'],
      ['electrical', 'Electrical', 'Lighting, power, switchboards and safety checks by our licensed electrician.', '40% 40%']
    ];
    return `
<div class="bar"><div class="wrap"><span>${s('Licensed builder & electrical contractor · Lic. 000000 (example)', 'Licence or registration (optional)')}</span><span><b>${s('0400 000 000', 'Phone')}</b> · ${s('Mon–Fri 7am–5pm', 'Hours')}</span></div></div>
<header class="head"><div class="wrap"><a class="logo" href="#"><i>${ctx.empty ? '◆' : 'RR'}</i>Ridgeline Renovations</a><nav aria-label="Main"><a href="#">Services</a><a href="#">Our work</a><a href="#">About</a><a href="#">Get a quote</a></nav><a class="btn primary" href="#" style="min-height:40px">Get a quote</a></div></header>
<section class="hero" aria-label="Introduction"><div class="wrap">
 <div><span class="eyebrow">${s('Carpentry · Kitchens · Decks · Electrical', 'What you do, in a few words')}</span>
 <h1>${s('Built properly. Finished on time.', 'Your headline')}</h1>
 <p class="lede">${s('A small local team for renovations, repairs and new work across the district. One quote, one point of contact, no surprises.', 'One or two sentences about who you help and where')}</p>
 <div class="btns"><a class="btn primary" href="#">Get a free quote</a><a class="btn" href="#">Call ${s('0400 000 000', 'phone')}</a></div>
 <ul class="ticks">${ctx.empty ? '<li><span class="hint" style="color:inherit">Up to three reasons to choose you</span></li>' : '<li>Fully insured</li><li>Fixed-price quotes</li><li>Clean, tidy sites</li>'}</ul></div>
 <figure>${pic(ctx, 'hero-workshop', 'Photo of your team or your work', '4/5', '58% 45%')}<div class="card-float"><span class="eyebrow">Quotes</span><b>${s('Within one business day', 'Response time')}</b></div></figure>
</div></section>
<section class="wrap section" aria-label="Services">
 <div class="shead"><h2>What we do</h2><a href="#" style="font-weight:700">All services →</a></div>
 <div class="services">${svc.map(([f, n, d, focal]) => `<article class="svc">${pic(ctx, f, 'Service photo', '3/2', focal)}<div class="body"><h3>${s(n, 'Service name')}</h3><p>${s(d, 'One sentence about this service')}</p><a href="#">${ctx.empty ? 'Learn more' : 'Learn more →'}</a></div></article>`).join('')}</div>
</section>
<section class="nums" aria-label="Key numbers"><div class="wrap">${(ctx.empty ? [['—', 'Years in business'], ['—', 'Jobs completed'], ['—', 'Service area'], ['—', 'Quote turnaround']] : [['18', 'years in business'], ['640+', 'jobs completed'], ['80 km', 'service area'], ['1 day', 'to get your quote']]).map(([b, l]) => `<div><b>${b}</b><span>${l}</span></div>`).join('')}</div></section>
<section class="wrap section" aria-label="Recent jobs">
 <div class="shead"><h2>Recent jobs</h2><a href="#" style="font-weight:700">See all work →</a></div>
 <div class="jobs">
  <figure>${pic(ctx, 'kitchen-island', 'Your best recent job', '4/3', '50% 55%')}${ctx.empty ? '' : '<figcaption>Kitchen renovation · Riverbend</figcaption>'}</figure>
  <figure>${pic(ctx, 'deck-firepit', 'Recent job', '3/2', '50% 50%')}${ctx.empty ? '' : '<figcaption>Deck & fire pit · Hilltop</figcaption>'}</figure>
  <figure>${pic(ctx, 'workbench', 'Recent job', '3/2', '50% 50%')}${ctx.empty ? '' : '<figcaption>Custom joinery · Workshop</figcaption>'}</figure>
 </div>
</section>
<section class="wrap section" aria-label="How it works" style="padding-top:0">
 <div class="shead"><h2>How it works</h2></div>
 <ol class="steps" style="padding:0;margin:0">${[['Tell us about the job', 'Call, or send a few photos and measurements.'], ['Get a fixed price', 'We visit if needed and quote in writing.'], ['We do the work', 'On the agreed dates, and leave the site clean.']].map(([h, p]) => `<li><h3>${s(h, 'Step')}</h3><p>${s(p, 'What happens at this step')}</p></li>`).join('')}</ol>
</section>
<section class="wrap section team" aria-label="About us" style="padding-top:0">
 ${pic(ctx, 'team-hivis', 'Photo of you or your team', '4/3', '50% 30%')}
 <div><span class="eyebrow">About us</span><h2 style="font-size:40px;text-transform:uppercase;margin:12px 0 14px">${s('Local, licensed and easy to reach', 'About heading')}</h2><p class="muted">${s('Ridgeline is a team of five: two carpenters, a kitchen installer, an electrician and Sam, who answers the phone and keeps every job on schedule.', 'A short introduction to your business')}</p>
 <blockquote class="quote">${s('“They turned up when they said they would and left the place cleaner than they found it.”', 'A genuine quote from a customer (optional)')}<cite>${s('Sample testimonial — replace with a real, attributed customer quote', 'Name and suburb, with permission')}</cite></blockquote>
 <div class="facts"><div><b>Service area</b>${s('80 km from town', 'Where you work')}</div><div><b>Insurance</b>${s('Public liability $20m', 'Cover (optional)')}</div><div><b>Licence</b>${s('Shown on request', 'Licence (optional)')}</div></div></div>
</section>
<section class="cta" aria-label="Get a quote"><div class="wrap"><div><h2>${s('Need a quote?', 'Call to action')}</h2><p>${s('Tell us about the job and we will reply within one business day.', 'What happens next')}</p></div><a class="btn primary" href="#">Request a quote</a></div></section>
<footer><div class="wrap"><div><b>Ridgeline Renovations</b><p>${s('Carpentry, kitchens, decks and electrical across the district.', 'One line about the business')}</p>${ctx.empty ? '' : '<p class="credit">Stock photographs on Pexels: cottonbro studio, Yudha Aprilian, Elvan Lam, Max Vakhtbovych, Nasim Didar, Kindel Media, Tima Miroshnichenko.</p>'}</div><div><b>Contact</b><p>${s('0400 000 000', 'Phone')}<br>${s('quotes@example.com', 'Email')}</p></div><div><b>Hours</b><p>${s('Mon–Fri 7am–5pm', 'Opening hours')}</p></div></div></footer>
<div class="callbar"><a class="btn" href="#">Call</a><a class="btn primary" href="#">Get a quote</a></div>`;
  }
};

// ---------------------------------------------------------------------------------------------
// 2 · Artist studio
// ---------------------------------------------------------------------------------------------
const artist = {
  id: 'artist-studio',
  scheme: 'light',
  css: `
.head{text-align:center;padding:30px 0 22px;border-bottom:1px solid var(--border)}
.head .name{font:500 30px/1 var(--head);letter-spacing:.01em}.head .name small{display:block;font:400 12px/1 var(--body);letter-spacing:.3em;text-transform:uppercase;color:var(--muted);margin-top:10px}
.head nav{display:flex;justify-content:center;gap:30px;margin-top:20px;font-size:15px}.head nav a.on{color:var(--accent);border-bottom:1px solid currentColor}
.hero .wrap{display:grid;grid-template-columns:5fr 6fr;gap:64px;align-items:center;padding-top:64px;padding-bottom:80px}
.hero h1{font-size:clamp(48px,6vw,86px);font-weight:500;letter-spacing:-.015em;margin:16px 0 20px}
.hero h1 em{color:var(--accent)}
.hero p{font-size:19px;color:var(--muted);max-width:480px}
.hero .btns{display:flex;gap:12px;margin-top:26px;flex-wrap:wrap}
.hero .pic,.hero .slot{border-radius:var(--radius)}
.series-head{display:flex;justify-content:space-between;align-items:end;gap:24px;margin-bottom:32px;border-bottom:1px solid var(--border);padding-bottom:18px}
.series-head h2{font-size:clamp(34px,4vw,52px);font-weight:500}.series-head p{margin:8px 0 0;color:var(--muted);max-width:560px}
.works{display:grid;grid-template-columns:repeat(3,1fr);gap:44px 38px}
.work .mat{background:var(--surface);padding:22px;border:1px solid var(--border);box-shadow:0 1px 0 var(--border)}
.work h3{font:italic 400 21px/1.3 var(--head);margin:16px 0 4px}.work p{font-size:14px;color:var(--muted);margin:0}
.dot{display:inline-flex;align-items:center;gap:6px;font-size:13px;margin-top:6px}.dot::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--art2)}.dot.sold::before{background:var(--accent)}
.statement{background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border);text-align:center;padding:96px 6%}
.statement blockquote{margin:0 auto;max-width:880px;font:italic 400 clamp(28px,3.4vw,42px)/1.3 var(--head)}.statement p{margin-top:22px;color:var(--muted)}
.notes{display:grid;grid-template-columns:1fr 1fr;gap:34px}.note .pic,.note .slot{border-radius:var(--radius);margin-bottom:16px}
.note h3{font-size:28px;font-weight:500;margin:8px 0}.note p{color:var(--muted)}
.ex{display:grid;grid-template-columns:5fr 6fr;gap:56px;align-items:start}
.ex ul{list-style:none;margin:0;padding:0}.ex li{display:grid;grid-template-columns:70px 1fr;gap:18px;padding:16px 0;border-bottom:1px solid var(--border)}.ex li b{font:500 18px/1.4 var(--head)}.ex li span{color:var(--muted);font-size:14px;display:block}
.about{display:grid;grid-template-columns:6fr 5fr;gap:64px;align-items:center}
.about h2{font-size:44px;font-weight:500;margin:10px 0 16px}.about p{color:var(--muted);font-size:17px}
.facts{display:flex;gap:30px;margin-top:22px;font-size:14px;flex-wrap:wrap}.facts b{display:block;color:var(--text)}
footer{border-top:1px solid var(--border);padding:34px 0 50px;text-align:center;font-size:14px;color:var(--muted)}footer .name{font:500 22px/1 var(--head);color:var(--text);margin-bottom:10px}
@media (max-width:900px){.works{grid-template-columns:1fr 1fr;gap:30px 20px}}
@media (max-width:760px){
 .head{padding:20px 0 14px}.head .name{font-size:24px}.head nav{gap:18px;font-size:14px;overflow-x:auto;justify-content:flex-start;padding:0 5%;white-space:nowrap}
 .hero .wrap{grid-template-columns:1fr;gap:28px;padding-top:32px;padding-bottom:48px}.hero .wrap>figure,.hero .wrap>.slot{order:-1}.hero h1{font-size:46px}
 .series-head .btn{display:none}
 .works{grid-template-columns:1fr 1fr;gap:22px 14px}.work .mat{padding:10px}.work h3{font-size:17px}.work p{font-size:12px}
 .statement{padding:60px 7%}
 .notes,.ex,.about{grid-template-columns:1fr;gap:26px}
}`,
  body(ctx) {
    const s = (v, h) => txt(ctx, v, h);
    const works = [
      ['work-tide', 'Tideline I', 'Acrylic on canvas · 60 × 80 cm', 'Available', false],
      ['work-meadow', 'Late meadow', 'Acrylic on canvas · 60 × 80 cm', 'Sold', true],
      ['work-undertow', 'Undertow', 'Acrylic and ink · 45 × 60 cm', 'Available', false],
      ['work-fence', 'Paddock fence', 'Oil on linen · 60 × 80 cm', 'Available', false],
      ['work-plaster', 'Lime wash', 'Acrylic and plaster · 45 × 60 cm', 'Sold', true],
      ['work-dusk', 'Dusk garden', 'Oil on canvas · 90 × 120 cm', 'Available', false]
    ];
    return `
<header class="head"><a class="name" href="#">Juniper &amp; Ash<small>${s('Painting · Studio', 'What you make')}</small></a><nav aria-label="Main"><a class="on" href="#">Work</a><a href="#">Studio notes</a><a href="#">About</a><a href="#">Contact</a></nav></header>
<section class="hero"><div class="wrap">
 <div><span class="eyebrow">${s('New series · 2026', 'What’s new')}</span><h1>${ctx.empty ? '<span class="hint">Your headline</span>' : 'Colour, <em>made</em> by hand.'}</h1><p>${s('Abstract paintings about water, weather and the edges of paddocks, made in a small studio by the river.', 'One or two sentences about your work')}</p><div class="btns"><a class="btn primary" href="#">See the work</a><a class="btn" href="#">Commissions</a></div></div>
 ${pic(ctx, 'studio-wide', 'Your studio, or you at work', '5/4', '55% 50%')}
</div></section>
<section class="wrap section" aria-label="Work" style="padding-top:24px">
 <div class="series-head"><div><span class="eyebrow">Current series</span><h2>${s('Tidelines', 'Series or collection title')}</h2><p>${s('Six paintings made over one wet winter, built up in thin layers and scraped back.', 'A sentence about this series')}</p></div><a class="btn" href="#">All work →</a></div>
 <div class="works">${works.map(([f, n, m, a, sold]) => `<article class="work"><div class="mat">${pic(ctx, f, 'Artwork photograph', '3/4', '50% 50%')}</div><h3>${s(n, 'Title')}</h3><p>${s(m, 'Medium · size')}</p>${ctx.empty ? '<p class="dot"><span class="hint">Available / Sold</span></p>' : `<p class="dot${sold ? ' sold' : ''}">${a}</p>`}</article>`).join('')}</div>
</section>
<section class="statement" aria-label="Artist statement"><blockquote>${s('“I want a painting to feel like the moment the tide turns: nothing has happened yet, but everything is about to.”', 'A line from your artist statement')}</blockquote><p>${s('From the artist statement', 'Source')}</p></section>
<section class="wrap section" aria-label="Studio notes"><div class="series-head"><div><span class="eyebrow">Studio notes</span><h2>From the studio</h2></div><a class="btn" href="#">All notes →</a></div>
 <div class="notes">${[['palette', 'Mixing a new blue', 'Six weeks chasing the colour of the river after rain.', '3 November 2026'], ['hero-studio', 'Studio visit: Rafael Ortiz', 'An afternoon with a painter who works on the floor, never the easel.', '18 October 2026']].map(([f, h, p, d]) => `<article class="note">${pic(ctx, f, 'Studio photograph', '3/2', '50% 50%')}<span class="eyebrow">${s(d, 'Date')}</span><h3>${s(h, 'Note title')}</h3><p>${s(p, 'Short summary')}</p></article>`).join('')}</div></section>
<section class="wrap section ex" aria-label="Exhibitions" style="padding-top:0">
 ${pic(ctx, 'exhibition', 'Exhibition or installation photograph', '4/3', '50% 50%')}
 <div><span class="eyebrow">Exhibitions</span><h2 style="font-size:40px;font-weight:500;margin:10px 0 14px">Shows &amp; stockists</h2><ul>${(ctx.empty ? [['Year', 'Exhibition title', 'Venue, town']] : [['2026', 'Tidelines', 'Riverside Gallery, Harbourtown · solo'], ['2025', 'Weather Systems', 'Old Mill Arts · group'], ['2024', 'Small Works Prize', 'Regional Art Society · finalist']]).map(([y, h, v]) => `<li><b>${ctx.empty ? '<span class="hint">' + y + '</span>' : y}</b><div>${ctx.empty ? '<span class="hint">' + h + '</span>' : esc(h)}<span>${esc(v)}</span></div></li>`).join('')}</ul></div>
</section>
<section class="wrap section about" aria-label="About" style="padding-top:0">
 <div><span class="eyebrow">About the artist</span><h2>${s('Juno Marlowe', 'Your name')}</h2><p>${s('Painter working in acrylic and oil. Juno studied printmaking, worked as a set painter for ten years and has painted full time since 2019. Originals, commissions and studio visits by appointment.', 'Your biography from the About page')}</p><div class="facts"><div><b>Studio visits</b>${s('By appointment', 'Studio visits')}</div><div><b>Commissions</b>${s('Open for 2027', 'Commissions')}</div><div><b>Email</b>${s('studio@example.com', 'Email')}</div></div></div>
 ${pic(ctx, 'artist-easel', 'Portrait of you in the studio', '4/5', '55% 40%')}
</section>
<footer><div class="name">Juniper &amp; Ash</div>${ctx.empty ? 'Social links' : 'Instagram · Newsletter · Stockists'}${ctx.empty ? '' : '<p class="credit" style="margin-top:14px">Stock photographs on Pexels: Alina Rossoshanska, Steve A Johnson, Vitaly Gariev, Josue Canceco.</p>'}</footer>`;
  }
};

// ---------------------------------------------------------------------------------------------
// 26 · Travel journal
// ---------------------------------------------------------------------------------------------
const travel = {
  id: 'travel-journal',
  scheme: 'light',
  css: `
.top{position:absolute;inset:0 0 auto 0;z-index:5;color:var(--heroText)}.top .wrap{display:flex;justify-content:space-between;align-items:center;padding-top:22px;padding-bottom:22px;max-width:1300px}
.brand{display:flex;align-items:center;gap:10px;font:500 22px/1 var(--head)}.brand i{font-style:normal;display:grid;place-items:center;width:34px;height:34px;border:1.5px solid currentColor;border-radius:50%;font-size:16px}
.top nav{display:flex;gap:28px;font-size:15px;font-weight:500}
.hero{position:relative;min-height:700px;color:var(--heroText);background:var(--heroShade)}
.hero .pic,.hero .slot{position:absolute;inset:0;aspect-ratio:auto!important;height:100%}.hero .slot{color:#ffffffbb;border-color:#ffffff55}
.hero .pic img{width:138%;max-width:none}
.hero .shade{position:absolute;inset:0;background:linear-gradient(90deg,color-mix(in srgb,var(--heroShade) 82%,transparent) 0%,color-mix(in srgb,var(--heroShade) 10%,transparent) 62%),linear-gradient(0deg,color-mix(in srgb,var(--heroShade) 55%,transparent),transparent 40%)}
.hero .wrap{position:relative;display:grid;grid-template-columns:7fr 3.4fr;gap:60px;align-items:end;min-height:720px;padding-bottom:56px;padding-top:120px;max-width:1300px}
.hero .panel{margin-bottom:-8px}
.hero .eyebrow{color:color-mix(in srgb,var(--heroText) 82%,transparent)}
.hero h1{font-size:clamp(50px,6.4vw,88px);font-weight:500;margin:16px 0 18px;letter-spacing:-.01em}
.hero p{font-size:19px;max-width:560px;color:color-mix(in srgb,var(--heroText) 90%,transparent)}
.hero .btns{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}.hero .btn:not(.primary){background:#ffffff1f;color:var(--heroText);border-color:#ffffff66}
.panel{background:color-mix(in srgb,var(--surface) 94%,transparent);color:var(--text);border-radius:var(--radius);padding:22px;box-shadow:0 18px 40px #0004}
.panel .now{display:flex;gap:10px;align-items:center;font-size:13px;font-weight:600;color:var(--accent)}.panel .now::before{content:"";width:9px;height:9px;border-radius:50%;background:currentColor}
.panel h3{font-size:24px;font-weight:500;margin:10px 0 6px}.panel p{font-size:14px;color:var(--muted)}
.panel nav{display:grid;gap:8px;margin-top:14px;border-top:1px solid var(--border);padding-top:14px;font-size:14px;font-weight:600}
.latest{display:grid;grid-template-columns:7fr 5fr;gap:56px;align-items:center}
.latest .pic,.latest .slot{border-radius:var(--radius)}
.meta{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0 18px}.meta span{border:1px solid var(--border);border-radius:999px;padding:5px 12px;font-size:13px;font-weight:600;background:var(--surface)}
.latest h2{font-size:clamp(34px,3.6vw,48px);font-weight:500}.latest p{font-size:17px;color:var(--muted)}
.shead{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:26px}.shead h2{font-size:clamp(32px,3.4vw,44px);font-weight:500}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.card{background:var(--surface);border-radius:var(--radius);overflow:hidden;border:1px solid var(--border)}
.card .body{padding:22px}.card h3{font-size:25px;font-weight:500;margin:8px 0}.card p{font-size:15px;color:var(--muted);margin:0}
.strip{display:grid;grid-template-columns:1.4fr 1fr 1.2fr 1fr 1.3fr;gap:10px;padding:0 10px}
.strip .pic,.strip .slot{height:300px;aspect-ratio:auto!important;border-radius:calc(var(--radius) * .6)}
.mapw{display:grid;grid-template-columns:2fr 1fr;gap:24px}
.map{position:relative;min-height:440px;border-radius:var(--radius);overflow:hidden;background:color-mix(in srgb,var(--art1) 22%,var(--surface));background-image:repeating-linear-gradient(23deg,transparent,transparent 70px,color-mix(in srgb,var(--art1) 22%,transparent) 71px,color-mix(in srgb,var(--art1) 22%,transparent) 73px)}
.land{position:absolute;background:color-mix(in srgb,var(--art2) 45%,var(--surface));border:2px solid color-mix(in srgb,var(--art2) 70%,var(--surface));border-radius:45% 30% 40% 22%;width:66%;height:72%;left:12%;top:12%;transform:rotate(-10deg)}
.route{position:absolute;inset:0}
.pin{position:absolute;display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:var(--accent);color:var(--onAccent);border:3px solid var(--surface);font-weight:700;font-size:13px;box-shadow:0 3px 10px #0003}
.map small{position:absolute;left:14px;bottom:12px;background:var(--surface);padding:4px 10px;font-size:12px;border-radius:4px}
.stops{list-style:none;margin:0;padding:0}.stops li{padding:14px 0;border-bottom:1px solid var(--border)}.stops b{display:block;font:500 19px/1.3 var(--head)}.stops span{font-size:14px;color:var(--muted)}
.about{display:grid;grid-template-columns:5fr 6fr;gap:56px;align-items:center}.about .pic,.about .slot{border-radius:var(--radius)}
.about h2{font-size:40px;font-weight:500;margin:10px 0 14px}.about p{color:var(--muted);font-size:17px}
footer{padding:40px 0 56px;font-size:14px;color:var(--muted)}footer .wrap{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;max-width:1300px}footer b{color:var(--text);font:500 20px/1 var(--head)}
.wrap.w{max-width:1300px}
@media (max-width:900px){.cards{grid-template-columns:1fr 1fr}.strip{grid-template-columns:repeat(3,1fr)}.strip>*:nth-child(n+4){display:none}}
@media (max-width:760px){
 .top nav a:not(:last-child){display:none}.top nav a:last-child::before{content:"☰  "}.brand{font-size:19px}
 .hero,.hero .wrap{min-height:640px}.hero .panel{margin:0}.hero .wrap{grid-template-columns:1fr;padding-top:96px;padding-bottom:28px;gap:22px}.hero h1{font-size:46px}.hero p{font-size:17px}
 .hero .shade{background:linear-gradient(0deg,color-mix(in srgb,var(--heroShade) 85%,transparent) 0%,color-mix(in srgb,var(--heroShade) 20%,transparent) 75%)}
 .hero .pic img{width:100%;object-position:48% 50%!important}
 .panel{padding:18px}.panel nav{display:none}
 .latest,.mapw,.about{grid-template-columns:1fr;gap:24px}
 .cards{grid-template-columns:1fr}.card{display:grid;grid-template-columns:120px 1fr}.card .pic,.card .slot{aspect-ratio:auto!important;height:100%}.card .body{padding:14px}.card h3{font-size:20px;margin:4px 0}.card p{display:none}
 .strip{grid-template-columns:1fr 1fr;padding:0 5%}.strip>*:nth-child(n+3){display:none}.strip .pic,.strip .slot{height:200px}
 .map{min-height:300px}
}`,
  body(ctx) {
    const s = (v, h) => txt(ctx, v, h);
    return `
<header class="top"><div class="wrap"><a class="brand" href="#"><i>✦</i>Two Packs and a Map</a><nav aria-label="Main"><a href="#">Journal</a><a href="#">Photos</a><a href="#">About</a></nav></div></header>
<section class="hero" aria-label="Introduction">
 ${pic(ctx, 'hero-van-dusk', 'Your opening landscape · at least 2400 px wide, subject on the right', '16/9', '0% 92%')}
 ${ctx.empty ? '' : '<div class="shade"></div>'}
 <div class="wrap">
  <div><span class="eyebrow">${s('Travel journal · since 2019', 'Short tagline')}</span><h1>${s('Notes from the long way round.', 'Your headline')}</h1><p>${s('Slow travel, long walks and the occasional wrong turn. Written on the road, posted when we get home.', 'One or two sentences about your travels')}</p><div class="btns"><a class="btn primary" href="#">Read the journal</a><a class="btn" href="#">Photos</a></div></div>
  <aside class="panel" aria-label="Where we are now">${ctx.empty ? '<span class="hint">Featured panel: your latest trip appears here automatically</span>' : '<span class="now">On the road · day 42</span><h3>Coast road, autumn</h3><p>Slowly north with a borrowed van and a very old map.</p><nav aria-label="Quick links"><a href="#">Latest entry →</a><a href="#">All trips →</a><a href="#">Photo stories →</a></nav>'}</aside>
 </div>
</section>
<section class="wrap w section latest" aria-label="Latest trip">
 ${pic(ctx, 'coastal-village', 'Photo from your latest trip', '3/2', '50% 50%')}
 <div><span class="eyebrow">Latest trip</span><div class="meta">${ctx.empty ? '<span><span class="hint">Days · distance · season</span></span>' : '<span>12 days</span><span>840 km</span><span>Autumn 2026</span>'}</div><h2>${s('Five villages, no car', 'Trip title')}</h2><p>${s('Cliff paths, slow trains and far too much focaccia. How we walked the whole coast with one small pack each.', 'Opening lines of the journal entry')}</p><a class="btn" href="#">Read the journal →</a></div>
</section>
<section class="wrap w section" aria-label="Earlier journeys" style="padding-top:0">
 <div class="shead"><h2>Earlier journeys</h2><a href="#" style="font-weight:600">All trips →</a></div>
 <div class="cards">${[['lake-red-boat', 'Lakes', 'A week of lakes and long lunches', 'Ferries, lemon trees and one very wet afternoon.', '50% 60%'], ['hiker-ridge', 'Mountains', 'Hut to hut, nine days', 'Bread, cheese and very steep mornings.', '50% 40%'], ['train-window', 'Rail', 'Sleeper train north', 'Two nights, one bunk, a lot of tea.', '50% 45%']].map(([f, m, h, p, focal]) => `<article class="card">${pic(ctx, f, 'Trip photo', '4/3', focal)}<div class="body"><span class="eyebrow">${s(m, 'Place')}</span><h3>${s(h, 'Trip title')}</h3><p>${s(p, 'Short summary')}</p></div></article>`).join('')}</div>
</section>
<section class="strip" aria-label="Photos">${[['switchbacks', '50% 50%'], ['caravan-meadow', '40% 55%'], ['lake-shore-boat', '50% 55%'], ['village-steps', '50% 50%'], ['map-coffee', '50% 50%']].map(([f, focal]) => pic(ctx, f, 'Photo', '4/3', focal)).join('')}</section>
<section class="wrap w section mapw" aria-label="Places map">
 <div class="map"><div class="land"></div>${ctx.empty ? '<span class="hint" style="position:absolute;left:24px;top:24px">Illustrated map: pins come from the places named in your journal</span>' : '<span class="pin" style="left:30%;top:58%">1</span><span class="pin" style="left:46%;top:40%">2</span><span class="pin" style="left:61%;top:30%">3</span><span class="pin" style="left:70%;top:52%">4</span>'}<small>Illustrated map · places are approximate</small></div>
 <div><span class="eyebrow">Places</span><h2 style="font-size:36px;font-weight:500;margin:10px 0 12px">Where we’ve been</h2><ul class="stops">${(ctx.empty ? [['Place', 'Trip']] : [['1 · The five villages', 'Autumn 2026'], ['2 · Lake country', 'Spring 2025'], ['3 · High huts', 'Summer 2024'], ['4 · The sleeper line', 'Winter 2024']]).map(([b, sp]) => `<li><b>${ctx.empty ? '<span class="hint">' + b + '</span>' : b}</b><span>${sp}</span></li>`).join('')}</ul></div>
</section>
<section class="wrap w section about" aria-label="About" style="padding-top:0">
 ${pic(ctx, 'compass-map', 'Photo of you, or something you always pack', '4/3', '50% 50%')}
 <div><span class="eyebrow">About</span><h2>${s('Two people, two packs', 'About heading')}</h2><p>${s('We save up, pack light and go for as long as we can. We post after we get home and never share exact campsites or where we are right now.', 'A short introduction from your About page')}</p><a class="btn" href="#">More about us →</a></div>
</section>
<footer><div class="wrap"><div><b>Two Packs and a Map</b><p style="margin-top:8px">${s('Travel journal · posts after we get home', 'Footer line')}</p></div><div>${ctx.empty ? 'Social links' : 'Newsletter · Instagram'}</div>${ctx.empty ? '' : '<p class="credit" style="flex-basis:100%">Stock photographs on Pexels: Stephen Leonardi, 臻 宋, Manish Jain, Guduru Ajay bhargav, Ali Ramazan Çiftçi, Stelian Fratila, Matheus Bertelli, Mathias Reding, Vero Lova, ArtHouse Studio, Ylanite Koppens.</p>'}</div></footer>`;
  }
};

export const DESIGNS = [magazine, photography, trades, artist, travel];

/** The reference page for one design: kind is 'content' or 'empty'. */
export function renderDesign(d, kind) {
  const t = theme(d.id);
  if (!t) throw Error(`unknown theme ${d.id}`);
  return page(t, kind, { body: d.body({ empty: kind === 'empty' }), css: d.css, scheme: d.scheme, title: kind === 'content' ? 'With content' : 'New, empty site' });
}

/** design/CREDITS.md for one theme. */
export function creditsMarkdown(id) {
  const rows = CREDITS[id] ?? [];
  return `# Stock photographs: ${theme(id).name}

Photographs in \`images/\` come from [Pexels](https://www.pexels.com) under the [Pexels licence](https://www.pexels.com/license/): free to use and modify, no permission needed. Credit is given here and in the reference footer. Conditions to keep: don't sell unaltered copies; don't redistribute them on a stock-photo or wallpaper platform (so SoraWebSite offers each theme's small set inside that theme, never as a browsable photo library); don't imply that the people shown endorse a tenant; don't use them in a logo or business name.

Each file was downloaded at the width needed for its slot and re-saved as a progressive JPEG (quality 78).

| File | Photographer | Pexels photo |
| --- | --- | --- |
${rows.map(([f, id, who]) => `| \`images/${f}.jpg\` | ${who} | https://www.pexels.com/photo/${id}/ |`).join('\n')}
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const d of DESIGNS) {
    const dir = join(ROOT, d.id, 'design');
    await mkdir(dir, { recursive: true });
    for (const kind of ['content', 'empty']) await writeFile(join(dir, `${kind}.html`), renderDesign(d, kind));
    await writeFile(join(dir, 'CREDITS.md'), creditsMarkdown(d.id));
  }
  console.log(`Wrote design references for ${DESIGNS.length} themes.`);
}
