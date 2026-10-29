// Real login controller; simulated Identity/provider replies, no real credentials.
// Guard navigation uses a controlled document redirect: Chromium can follow a mocked
// HTTP redirect outside request interception. Actual HTTP guards have packaged SSR tests.
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {build} from 'esbuild';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const directory=await mkdtemp(join(tmpdir(),'login-browser-'));
const html=(await readFile('src/pages/studio/login.astro','utf8')).match(/<section class="wrap login-wrap">([\s\S]*?)<\/section>/)[1];
await build({entryPoints:['src/scripts/identity-login.ts'],outfile:join(directory,'login.js'),bundle:true,format:'iife',plugins:[{name:'identity-fixture',setup(b){b.onResolve({filter:/^@netlify\/identity$/},()=>({path:'identity',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:`export const getUser=async()=>{window.refreshReady=false;return window.signedIn?{id:'user'}:null;};export const refreshSession=async()=>{await new Promise(resolve=>setTimeout(resolve,30));window.refreshReady=true;};export const handleAuthCallback=async()=>null;export const getSettings=async()=>({providers:{google:false}});export const login=async()=>{window.signedIn=true;};export const logout=async()=>{window.signedIn=false;};export const oauthLogin=()=>{};export const acceptInvite=async()=>{};export const updateUser=async()=>{};export const requestPasswordRecovery=async()=>{};`}));}}]});
const script=await readFile(join(directory,'login.js'),'utf8');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox']});
try{
 const context=await browser.newContext();let denyPage=false,sessionCode=200,visits=0;
 await context.addInitScript(()=>{window.signedIn=true;});
 await context.route('https://www.claudiagilbert.com/**',async route=>{const url=new URL(route.request().url());if(url.pathname==='/api/studio/session'){if(!await route.request().frame().evaluate(()=>window.refreshReady))return route.fulfill({status:401,json:{error:'Expired cookie pending refresh'}});return route.fulfill({status:sessionCode,json:sessionCode===200?{setupRequired:false,id:'user'}:{error:'Sign-in temporarily unavailable.'}});}if(url.pathname==='/api/storage/preferences')return route.fulfill({json:{landingPage:'studio'}});if(!url.pathname.startsWith('/studio/login')){visits++;return route.fulfill(denyPage?{contentType:'text/html',body:'<script>location.replace('+JSON.stringify('/studio/login?reason=session&next='+encodeURIComponent(url.pathname))+')</script>'}:{contentType:'text/html',body:'<h1>Protected account page</h1>'});}return route.fulfill({contentType:'text/html',body:'<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}</style><main>'+html+'</main><script>'+script+'</script>'});});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('https://www.claudiagilbert.com/studio/login?next=%2Fstudio%2Fdownloads');await page.waitForURL('**/studio/downloads');assert.equal(visits,1);
 denyPage=true;visits=0;await page.goto('https://www.claudiagilbert.com/studio/login?next=%2Fstudio');await page.locator('#continue-session').waitFor({state:'visible'});await page.waitForTimeout(500);assert.equal(visits,1,'A protected-page/session mismatch must not bounce forever');assert((await page.locator('#auth-status').textContent()).includes('could not confirm'));assert(await page.locator('#login-form').isHidden());
 denyPage=false;await page.locator('#continue-session').click();await page.waitForURL('**/studio');assert.equal(visits,2);
 sessionCode=503;await page.goto('https://www.claudiagilbert.com/studio/login?next=%2Fstudio%2Fdownloads');await page.locator('#login-form').waitFor({state:'visible'});assert((await page.locator('#auth-status').textContent()).includes('unavailable'));assert.equal(visits,2,'Service failures must not trigger navigation');
 sessionCode=200;await page.locator('#login-email').fill('person@example.test');await page.locator('#login-password').fill('a-test-password');await page.locator('#login-form button[type=submit]').click();await page.waitForURL('**/studio/downloads');assert.equal(visits,3);assert.deepEqual(errors,[]);
 await page.goto('https://www.claudiagilbert.com/studio/login?next='+encodeURIComponent('/places?stravaActivity=101'));await page.waitForURL('**/places?stravaActivity=101');
 await page.goto('https://www.claudiagilbert.com/studio/login?next='+encodeURIComponent('/apps/files'));await page.waitForURL('**/apps/files');
 await page.goto('https://www.claudiagilbert.com/studio/login?next='+encodeURIComponent('/apps/irodori-legacy?file=11111111-1111-4111-8111-111111111111'));await page.waitForURL('**/apps/irodori-legacy?file=11111111-1111-4111-8111-111111111111');
 await page.goto('https://www.claudiagilbert.com/studio/login?next='+encodeURIComponent('/studio/content/edit?collection=osint'));await page.waitForURL('**/studio/content/edit?collection=osint');
 await page.goto('https://www.claudiagilbert.com/studio/login?next='+encodeURIComponent('/studio/content/edit?entry=osint/weekly-brief'));await page.waitForURL('**/studio/content/edit?entry=osint%2Fweekly-brief');
 await page.goto('https://www.claudiagilbert.com/studio/login?next='+encodeURIComponent('/apps/fumi'));await page.waitForURL('**/apps/fumi');
 await page.goto('https://www.claudiagilbert.com/studio/login?next='+encodeURIComponent('/apps?desktop=tayori'));await page.waitForURL('**/apps?desktop=tayori');
 console.log('PASS real login controller: awaited cookie refresh, exact Desktop installers destination, repeated-redirect recovery, explicit retry, service failure stability and successful password submission');
}finally{await browser.close();await rm(directory,{recursive:true,force:true});}
