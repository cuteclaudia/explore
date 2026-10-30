// Real bridge + banner, simulated native startup. No production documents/requests.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const bridge=await readFile('scripts/craft-file-bridge.js','utf8'),banner=await readFile('src/scripts/app-startup.mjs','utf8');
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox']});
try{
 const context=await browser.newContext(),page=await context.newPage();await page.clock.install();
 await context.route('https://startup.test/**',route=>{
  if(new URL(route.request().url()).pathname==='/editor')return route.fulfill({contentType:'text/html',body:`<script>${bridge}</script><div id="wordcraft_loading">Starting</div><canvas width="900" height="700"></canvas><script>window.dropped=[];document.querySelector('canvas').addEventListener('drop',e=>window.dropped.push(e.dataTransfer.files[0].name));</script>`});
  return route.fulfill({contentType:'text/html',body:`<div id="app-startup" data-app-name="SoraDocs"><span id="app-startup-text">Starting SoraDocs…</span><button id="app-startup-dismiss">Dismiss</button></div><iframe src="/editor" sandbox="allow-scripts"></iframe><script>const channel='a'.repeat(36);window.phases=[];window.messages=[];addEventListener('message',e=>{const frame=document.querySelector('iframe');if(e.source!==frame.contentWindow||e.origin!=='null')return;const d=e.data;if(d.type==='explore.bridgeReady'&&d.channel!==channel){frame.contentWindow.postMessage({type:'explore.configure',channel},'*');return;}if(d.channel!==channel)return;messages.push(d.type);if(d.type==='explore.startup'){phases.push(d.phase);dispatchEvent(new CustomEvent('soraspace:startup',{detail:d}));}});window.sendFile=()=>{const bytes=new Uint8Array([1,2,3]).buffer;document.querySelector('iframe').contentWindow.postMessage({type:'explore.open',channel,name:'Research.docx',bytes},'*',[bytes]);};</script><script>${banner}</script>`});
 });
 await page.goto('https://startup.test/');await page.waitForFunction(()=>phases.includes('loading'));const frame=page.frames().find(f=>f.url().endsWith('/editor'));
 await page.evaluate(()=>sendFile());await page.clock.runFor(46000);assert.equal(await frame.evaluate(()=>dropped.length),0,'a resized canvas alone is not ready');assert.equal(await page.evaluate(()=>messages.includes('explore.openFailed')),false,'do not abandon the file after 45 seconds');assert.match(await page.locator('#app-startup-text').textContent(),/still starting/);assert(!/failed|error/i.test(await page.locator('#app-startup-text').textContent()));
 await frame.evaluate(()=>dispatchEvent(new Event('TrunkApplicationStarted')));await page.waitForFunction(()=>phases.includes('initializing'));assert.equal(await frame.evaluate(()=>dropped.length),0,'WASM initialisation alone is not editor readiness');
 await frame.evaluate(()=>document.querySelector('#wordcraft_loading').remove());await page.waitForFunction(()=>phases.includes('ready'));assert.deepEqual(await frame.evaluate(()=>dropped),['Research.docx']);assert.equal(await page.locator('#app-startup').isVisible(),false);assert(await page.evaluate(()=>messages.includes('explore.openDelivered')));
 // A genuinely unstarted editor expires its queued file and offers retry feedback.
 await page.reload();await page.waitForFunction(()=>phases.includes('loading'));await page.evaluate(()=>sendFile());await page.clock.runFor(180001);await page.waitForFunction(()=>messages.includes('explore.openFailed'));assert.equal(await page.locator('#app-startup').isVisible(),true);
 // Informational banner dismissal does not restart or stop the editor.
 await page.locator('#app-startup-dismiss').click();assert.equal(await page.locator('#app-startup').isVisible(),false);await page.clock.runFor(20000);assert.equal(await page.locator('#app-startup').isVisible(),false);
 await context.close();console.log('PASS real startup/file bridge: delayed initialization, no false failure at 20s, no lost file at 45s, actual editor signal, bounded 3-minute wait and dismiss without reload.');
}finally{await browser.close();}
