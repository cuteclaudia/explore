// Independent public-site build and responsive/CSP smoke checks. No live service.
import assert from 'node:assert/strict';
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
const expected=['404.html','_headers','favicon.svg','index.html','robots.txt','sitemap.xml','styles.css'];
assert.deepEqual((await readdir(site+'dist')).sort(),expected.sort());
const headers=await readFile(site+'dist/_headers','utf8'),csp=headers.match(/Content-Security-Policy: (.+)/)[1];
assert(csp.includes("script-src 'none'"));assert(csp.includes("connect-src 'none'"));
const html=await readFile(site+'dist/index.html','utf8');
assert(!/<script\b|<form\b|<iframe\b/i.test(html));assert.equal((html.match(/class="template-card"/g)||[]).length,5);
assert(!html.includes('app.soraspace.studio'));assert(html.includes('New account registration is not open yet'));
const server=createServer(async(req,res)=>{
 const path=new URL(req.url,'http://localhost').pathname;const filename=path==='/'?'index.html':path.slice(1);
 if(!expected.includes(filename)||filename==='_headers'){res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');return;}
 res.writeHead(200,{'Content-Type':filename.endsWith('.css')?'text/css':filename.endsWith('.svg')?'image/svg+xml':filename.endsWith('.xml')?'application/xml':'text/html','Content-Security-Policy':csp});res.end(await readFile(site+'dist/'+filename));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try{
 const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox']});
 const base='http://127.0.0.1:'+server.address().port,context=await browser.newContext(),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await context.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());
 await mkdir('/workspace/reviews/soraspace-landing',{recursive:true});
 for(const [width,height] of [[320,844],[390,844],[768,1024],[1024,768],[1366,768],[1920,1080]]){
  await page.setViewportSize({width,height});await page.goto(base);assert.equal(await page.title(),'SoraSpace — Space for everything you create');
  assert.equal(await page.locator('.template-card').count(),5);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Fits '+width);
  assert.equal(await page.locator('form,script,iframe').count(),0);
  for(const link of await page.locator('a[target="_blank"]').all()){assert.equal(await link.getAttribute('rel'),'noopener');assert((await link.getAttribute('href')).startsWith('https://www.claudiagilbert.com/'));}
  await page.getByRole('link',{name:'Templates',exact:true}).click();assert.equal(new URL(page.url()).hash,'#templates');assert(await page.locator('#templates').isVisible());
  if([390,768,1366].includes(width))await page.screenshot({path:`/workspace/reviews/soraspace-landing/${width}.png`,fullPage:true});
 }
 await page.goto(base);await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Skip to content');
 await page.evaluate(()=>{const script=document.createElement('script');script.textContent='window.unwantedScript=true';document.body.append(script);});assert.equal(await page.evaluate(()=>window.unwantedScript),undefined);
 assert.deepEqual(errors,[]);console.log('PASS isolated landing build/config/output, five templates, no forms/private endpoints, responsive 320–1920px, keyboard, safe sign-in links and enforced no-script CSP');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
