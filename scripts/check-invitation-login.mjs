// Real Identity SDK + real login controller; synthetic HTTP account/tokens only.
import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {build} from 'esbuild';
const raw=await readFile('src/pages/studio/login.astro','utf8'),markup=raw.match(/<section class="wrap login-wrap">([\s\S]*?)<\/section>/)[1],bundle=(await build({entryPoints:['src/scripts/identity-login.ts'],bundle:true,format:'iife',platform:'browser',write:false})).outputFiles[0].text;
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright'),browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox']});
const origin='https://invitation.test',email='invited@example.test',id='11111111-1111-4111-8111-111111111111';
const b64=value=>Buffer.from(JSON.stringify(value)).toString('base64url'),token=b64({alg:'HS256',typ:'JWT'})+'.'+b64({sub:id,email,exp:Math.floor(Date.now()/1000)+3600})+'.fixture-signature';
const user={id,email,confirmed_at:'2026-10-30T00:00:00Z',app_metadata:{},user_metadata:{}};
const auth={access_token:token,token_type:'bearer',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,refresh_token:'fixture-refresh-token',user};
try{
 for(const scenario of ['success','recovery-success','server-session-fails','password-login-fails','invalid-invitation']){
  const context=await browser.newContext(),page=await context.newPage(),errors=[];let verifies=0,logins=0,cookieObserved=false;page.on('pageerror',e=>errors.push(e.message));
  await context.route(origin+'/**',async route=>{const req=route.request(),url=new URL(req.url());if(url.pathname==='/.netlify/identity/verify'){verifies++;return route.fulfill(scenario==='invalid-invitation'?{status:400,json:{msg:'Invitation expired'}}:{json:auth});}
   if(url.pathname==='/.netlify/identity/token'){logins++;const input=new URLSearchParams(req.postData());assert.equal(input.get('username'),email);assert.equal(input.get('password'),'synthetic-password-123');return route.fulfill(scenario==='password-login-fails'?{status:400,json:{error:'invalid_grant',error_description:'Login unavailable'}}:{json:auth});}
   if(url.pathname==='/.netlify/identity/settings')return route.fulfill({json:{external:{google:false}}});
   if(url.pathname==='/.netlify/identity/user')return route.fulfill({json:user});
   if(url.pathname==='/api/studio/session'){cookieObserved=!!req.headers().cookie?.includes('nf_jwt=');return route.fulfill(scenario==='server-session-fails'||!cookieObserved?{status:401,json:{error:'Please sign in.'}}:{json:{setupRequired:true,id,email,variable:'OWNER_IDENTITY_ID'}});}
   if(url.pathname==='/login.js')return route.fulfill({contentType:'text/javascript',body:bundle});
   return route.fulfill({contentType:'text/html',body:'<!doctype html><style>[hidden]{display:none!important}</style>'+markup+'<script src="/login.js"></script>'});
  });
  await page.goto(origin+'/studio/login#'+(scenario==='recovery-success'?'recovery_token':'invite_token')+'=synthetic-invitation');await page.locator('#password-form').waitFor({state:'visible'});await page.locator('#new-password').fill('synthetic-password-123');await page.locator('#confirm-password').fill('synthetic-password-123');await page.locator('#password-form button[type=submit]').click();
  if(scenario==='success'||scenario==='recovery-success'){await page.locator('#owner-setup').waitFor({state:'visible'});assert.equal(await page.locator('#owner-id').textContent(),id);assert(cookieObserved,'Invitation must establish the browser cookie before the server session check');assert.equal(logins,1);}
  else if(scenario==='invalid-invitation'){await page.waitForFunction(()=>document.getElementById('auth-status').textContent.includes('expired'));assert(await page.locator('#email-signin').isVisible());await page.locator('#email-signin').click();assert(await page.locator('#login-form').isVisible());assert.equal(logins,0);}
  else{await page.locator('#login-form').waitFor({state:'visible'});assert(await page.locator('#password-form').isHidden());assert.equal(await page.locator('#login-email').inputValue(),email);assert.equal(await page.locator('#login-password').inputValue(),'');assert(await page.locator('#owner-setup').isHidden());}
  assert.equal(verifies,1);assert.deepEqual(errors,[]);await context.close();
 }
 console.log('PASS real Identity SDK invitation acceptance establishes cookie; owner setup works; server/login failures restore email form; expired invitation has a usable fallback. No real email/account/password used.');
}finally{await browser.close();}
