// Independent public-site build and responsive/CSP smoke checks. No live service.
import assert from 'node:assert/strict';
import {LANGUAGES} from '../src/lib/locales/languages.mjs';
import {translate} from '../src/lib/locales/public-copy.mjs';
import {localePath} from '../src/lib/locales/static-page.mjs';
import {execFileSync} from 'node:child_process';
import {readFile,readdir,mkdir} from 'node:fs/promises';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {resolveConfig} from '@netlify/config';
const repo=fileURLToPath(new URL('../',import.meta.url)),site=fileURLToPath(new URL('../sites/soraspace/',import.meta.url));
execFileSync(process.execPath,[site+'build.mjs'],{cwd:site,stdio:'inherit'});
const resolved=await resolveConfig({cwd:repo,repositoryRoot:repo,base:'sites/soraspace',baseRelDir:true,offline:true,buffer:true});
assert.equal(resolved.configPath,site+'netlify.toml');
assert.equal(resolved.config.build.publish,site+'dist');
assert.equal(resolved.config.build.command,'npm run build');
const expected=['404.html','_headers','favicon.svg','index.html','robots.txt','sitemap.xml','styles.css','language.js','icons',...Object.keys(LANGUAGES).filter(code=>code!=='en')];
assert.deepEqual((await readdir(site+'dist')).sort(),expected.sort());
const iconFiles=['fumi','tsuzuri','hikari','irodori','tayori','goban'].map(id=>id+'.svg');
assert.deepEqual((await readdir(site+'dist/icons')).sort(),iconFiles.slice().sort());
const headers=await readFile(site+'dist/_headers','utf8'),csp=headers.match(/Content-Security-Policy: (.+)/)[1];
assert.match(csp,/script-src 'sha256-[A-Za-z0-9+/=]+'/);assert(csp.includes("connect-src 'none'"));
const html=await readFile(site+'dist/index.html','utf8');
assert(!/<form\b|<iframe\b/i.test(html));assert.equal((html.match(/<script\b/g)||[]).length,1);assert(html.includes('src="/language.js" integrity="sha256-'));assert.equal((html.match(/class="template-card"/g)||[]).length,5);
assert(!html.includes('app.soraspace.studio'));for(const path of ['/apps/files','/studio/soraspace-setup','/studio/soraspace-editor','/studio/soraspace-admin'])assert(html.includes('https://www.claudiagilbert.com'+path));assert(html.includes('Email verification and approval required'));
const server=createServer(async(req,res)=>{
 const path=new URL(req.url,'http://localhost').pathname;const filename=Object.keys(LANGUAGES).some(code=>localePath(code)===path)?(path==='/'?'index.html':path.slice(1)+'index.html'):path.slice(1);
 if(!expected.filter(file=>file!=='icons').includes(filename)&&!iconFiles.some(file=>filename==='icons/'+file)&&!Object.keys(LANGUAGES).filter(code=>code!=='en').some(code=>filename===code+'/index.html')||filename==='_headers'){res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');return;}
 res.writeHead(200,{'Content-Type':filename.endsWith('.js')?'text/javascript':filename.endsWith('.css')?'text/css':filename.endsWith('.svg')?'image/svg+xml':filename.endsWith('.xml')?'application/xml':'text/html','Content-Security-Policy':csp});res.end(await readFile(site+'dist/'+filename));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try{
 const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox']});
 const base='http://127.0.0.1:'+server.address().port,context=await browser.newContext(),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await context.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());
 await mkdir('/workspace/reviews/soraspace-landing',{recursive:true});
 await page.emulateMedia({colorScheme:'light'});
 for(const [width,height] of [[320,844],[390,844],[768,1024],[1024,768],[1280,720],[1366,768],[1920,1080]]){
  await page.setViewportSize({width,height});await page.goto(base);assert.equal(await page.title(),'SoraSpace — Space for everything you create');
  assert.equal(await page.locator('.upcoming-app').count(),8);assert.equal(await page.locator('.upcoming-app a').count(),0);assert.equal(await page.locator('.capability-links a').count(),4);assert((await page.locator('#research').innerText()).includes('Zotero'));assert((await page.locator('#research').innerText()).includes('invoices'));
  assert.equal(await page.locator('.tool-link').count(),6);assert.equal(await page.locator('.tool-web').count(),4);assert.equal(await page.locator('.tool-desktop').count(),2);assert.equal(await page.locator('.tool-title small[lang=ja]').count(),6);assert.equal(await page.locator('main>section:nth-child(2)').getAttribute('id'),'app-previews');
  assert(await page.locator('.tool-link>img').evaluateAll(images=>images.every(image=>image.complete&&image.naturalWidth>0)),'Tool icons load');
  if(width>=1280)assert((await page.locator('.tool-showcase').boundingBox()).y+(await page.locator('.tool-showcase').boundingBox()).height<height,'All six tool links visible before scrolling at '+width);
  assert.equal(await page.locator('.template-card').count(),5);assert.equal(await page.locator('.app-preview-card').count(),4);assert.equal(await page.locator('#pricing .pricing-grid article').count(),2);assert((await page.locator('#pricing').innerText()).includes('no card required'));assert.equal((await page.locator('.site-header .sign-in').innerText()).trim(),'Sign In');assert.equal(await page.locator('.site-header .sign-up').innerText(),'Sign Up');assert.equal(await page.locator('.app-mini[role=img]').count(),4);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Fits '+width);
  assert.equal(await page.locator('form,iframe').count(),0);assert.equal(await page.locator('.workspace-shortcuts article').count(),4);assert.equal(await page.locator('.workspace-shortcuts .shortcut-label').filter({hasText:'Approved trial'}).count(),2);for(const a of await page.locator('.workspace-shortcuts a').all())assert((await a.boundingBox()).height>=44);
  for(const link of await page.locator('a[target="_blank"]').all()){assert.equal(await link.getAttribute('rel'),'noopener');assert((await link.getAttribute('href')).startsWith('https://www.claudiagilbert.com/'));}
  await page.getByRole('link',{name:'Templates',exact:true}).click();assert.equal(new URL(page.url()).hash,'#templates');assert(await page.locator('#templates').isVisible());
  if([390,768,1366].includes(width))await page.screenshot({path:`/workspace/reviews/soraspace-landing/${width}.png`,fullPage:true});
 }
 // Every locale is an independent indexable page with reciprocal links, no JS.
 for(const [code,language] of Object.entries(LANGUAGES)){
  for(const width of [320,768,1366]){
   await page.setViewportSize({width,height:900});await page.goto(base+localePath(code));
   assert.equal(await page.locator('html').getAttribute('lang'),language.tag);
   assert.equal(await page.locator('h1').textContent(),translate('Space for everything you create.',code));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Locale fits '+code+' at '+width);
   await page.locator('.language-picker summary').click();
   assert.equal(await page.locator('.language-picker a[data-language-choice]:not([data-language-choice=system])').count(),Object.keys(LANGUAGES).length);assert.deepEqual(await page.locator('.language-picker a[hreflang]').evaluateAll(links=>links.map(link=>link.hreflang)),Object.values(LANGUAGES).map(language=>language.tag));
   assert.equal(await page.locator('.language-picker a[hreflang="en-AU"]').getAttribute('href'),'/?lang=en');
   assert.equal(await page.locator('.language-picker a[aria-current]').getAttribute('hreflang'),language.tag);
   assert.equal(await page.locator('link[rel=alternate]').count(),Object.keys(LANGUAGES).length+1);
   assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://www.soraspace.studio'+localePath(code));
   for(const link of await page.locator('.tool-link').all()){const target=new URL(await link.getAttribute('href'));assert.equal(target.origin,'https://www.claudiagilbert.com');if(code!=='en')assert.equal(target.searchParams.get('lang'),code);if(target.searchParams.has('desktop'))assert.equal(target.hash,'#workspace-app-'+target.searchParams.get('desktop'));}
   for(const [i,packageId] of ['workspace','workspace-website'].entries()){const signup=new URL(await page.locator('#pricing .pricing-grid article>a').nth(i).getAttribute('href'));assert.equal(signup.pathname,'/studio/signup');assert.equal(signup.searchParams.get('package'),packageId);if(code!=='en')assert.equal(signup.searchParams.get('lang'),code);}
   const login=new URL(await page.locator('.sign-in').getAttribute('href'));
   assert.equal(login.searchParams.get('next'),'/studio/welcome');if(code!=='en')assert.equal(login.searchParams.get('lang'),code);
  }
 }
 await page.goto(base);
 // Theme reacts to the system preference without cookies, storage or script.
 const luminance=colour=>{const divisor=colour.startsWith('color(srgb ')?1:255;const c=colour.match(/[\d.]+/g).slice(0,3).map(Number).map(n=>n/divisor).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
 const contrast=(a,b)=>{const l=[luminance(a),luminance(b)].sort((x,y)=>y-x);return (l[0]+.05)/(l[1]+.05);};
 await page.setViewportSize({width:1366,height:768});
 for(const scheme of ['light','dark']){
  await page.emulateMedia({colorScheme:scheme});await page.goto(base);
  const colours=await page.evaluate(()=>{const probe=document.createElement('span');probe.style.color='Canvas';document.body.append(probe);const canvas=getComputedStyle(probe).color;probe.remove();const targets=['.lede','.upcoming-tools .section-heading>p','.template-card p','.button'];return {canvas,background:getComputedStyle(document.documentElement).backgroundColor,text:getComputedStyle(document.documentElement).color,targets:targets.map(s=>{const el=document.querySelector(s),style=getComputedStyle(el);return {name:s,foreground:style.color,background:s==='.button'?style.backgroundColor:getComputedStyle(document.documentElement).backgroundColor};}),height:document.documentElement.scrollHeight,hero:document.querySelector('.hero').getBoundingClientRect().height};});
  assert.equal(colours.background,colours.canvas,'background uses system Canvas in '+scheme);
  assert(scheme==='light'?luminance(colours.background)>.9:luminance(colours.background)<.1);
  assert(contrast(colours.text,colours.background)>=7);
  for(const item of colours.targets)assert(contrast(item.foreground,item.background)>=4.5,item.name+' contrast in '+scheme+': '+JSON.stringify(item));
  assert(colours.hero<560,'compact desktop hero');assert(colours.height<2800,'compact desktop page: '+colours.height);
  await page.screenshot({path:`/workspace/reviews/soraspace-landing/system-${scheme}-1366.png`,fullPage:true});
 }
 // An OS theme change while already open also updates native colours.
 const dark=await page.evaluate(()=>getComputedStyle(document.documentElement).backgroundColor);await page.emulateMedia({colorScheme:'light'});assert.notEqual(await page.evaluate(()=>getComputedStyle(document.documentElement).backgroundColor),dark);
 await page.emulateMedia({colorScheme:'dark'});await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:'/workspace/reviews/soraspace-landing/system-dark-390.png',fullPage:true});
 await page.emulateMedia({forcedColors:'active'});assert(await page.evaluate(()=>matchMedia('(forced-colors: active)').matches));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:'/workspace/reviews/soraspace-landing/system-contrast-390.png',fullPage:true});
 await page.emulateMedia({forcedColors:'none',colorScheme:'light'});
 await page.goto(base);await context.route('https://www.claudiagilbert.com/apps',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><title>Protected workspace destination fixture</title>'}));
 const popupPromise=page.waitForEvent('popup');await page.locator('.actions a.button').click();const popup=await popupPromise;await popup.waitForLoadState();assert.equal(popup.url(),'https://www.claudiagilbert.com/apps');assert.equal(await popup.evaluate(()=>window.opener),null);assert.equal(new URL(page.url()).origin,base);await popup.close();
 await page.goto(base);await context.route('https://www.claudiagilbert.com/apps/fumi',route=>route.fulfill({contentType:'text/html',body:'<title>Protected SoraDocs fixture</title>'}));const docsPopup=page.waitForEvent('popup');await page.locator('.tool-web[href$="/fumi"]').click();const docs=await docsPopup;await docs.waitForLoadState();assert.equal(docs.url(),'https://www.claudiagilbert.com/apps/fumi');assert.equal(await docs.evaluate(()=>window.opener),null);await docs.close();
 // Actual hash-authorized bootstrap: device default, remembered override and reset.
 const jaContext=await browser.newContext({locale:'ja-JP'});await jaContext.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());const jaPage=await jaContext.newPage();
 await jaPage.goto(base+'/?next=%2Fstudio#pricing');await jaPage.waitForURL(url=>url.pathname==='/ja/');assert.equal(new URL(jaPage.url()).hash,'#pricing');assert.equal(new URL(jaPage.url()).searchParams.get('next'),'/studio');assert.equal(await jaPage.evaluate(()=>localStorage.getItem('soraspace.language')),null,'Detection must not freeze a preference');
 await jaPage.evaluate(()=>localStorage.setItem('soraspace.language','fr'));await jaPage.goto(base);await jaPage.waitForURL(url=>url.pathname==='/fr/');
 await jaPage.locator('.language-picker summary').click();await jaPage.locator('[data-language-choice=system]').click();await jaPage.waitForURL(url=>url.pathname==='/ja/');assert.equal(await jaPage.evaluate(()=>localStorage.getItem('soraspace.language')),'system');
 await jaPage.locator('.language-picker summary').click();await jaPage.locator('[data-language-choice=en]').click();await jaPage.waitForURL(url=>url.pathname==='/'&&url.searchParams.get('lang')==='en');assert.equal(await jaPage.evaluate(()=>localStorage.getItem('soraspace.language')),'en');await jaPage.goto(base);assert.equal(new URL(jaPage.url()).pathname,'/');await jaContext.close();
 const blocked=await browser.newContext({locale:'fr-FR'});await blocked.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('Storage blocked')};Storage.prototype.setItem=()=>{throw Error('Storage blocked')};});await blocked.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());const blockedPage=await blocked.newPage();await blockedPage.goto(base);await blockedPage.waitForURL(url=>url.pathname==='/fr/');await blockedPage.locator('.language-picker summary').click();await blockedPage.locator('[data-language-choice=en]').click();await blockedPage.waitForURL(url=>url.pathname==='/'&&url.searchParams.get('lang')==='en');await blocked.close();
 await page.goto(base);await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Skip to content');
 await page.evaluate(()=>{const script=document.createElement('script');script.textContent='window.unwantedScript=true';document.body.append(script);});assert.equal(await page.evaluate(()=>window.unwantedScript),undefined);
 assert.deepEqual(errors,[]);console.log('PASS isolated landing build/config/output, five templates, no forms/private endpoints, responsive 320–1920px, keyboard, safe sign-in links system light/dark/live changes/forced-colors, text contrast, compact desktop layout and hash-authorized local language bootstrap and blocked unapproved scripts');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
