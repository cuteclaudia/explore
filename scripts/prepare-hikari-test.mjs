import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {unzipSync} from 'fflate';
const [archive,destination]=process.argv.slice(2);
if(!archive||!destination)throw Error('Usage: node scripts/prepare-hikari-test.mjs ZIP OUTPUT_DIRECTORY');
const releases={
 '1979822f6118bbe75c61f120b4af44191b2fd4c71091cf7678f4a65a11c006a8':'0.14.1',
 '202f5a55c028c43c26744946b024f224d00ef2e24c56497a75eb48aefdf57712':'0.14.3',
 'cf15d7ca41cbf8e4e2448e6be53496f7e984ea3d9ca63d07b241164d2bd8e2a3':'0.14.4',
 '9dd11411515c64257b82635591152d8368aa7b9464aabb0eb6441b3010c9c575':'0.14.5',
 '123660c894fe06e11d98e10b6bbb6e8ba37c4b5c2298dfd9b5c798c671b56f9f':'0.14.6',
};
const raw=await readFile(archive),version=releases[createHash('sha256').update(raw).digest('hex')];
if(!version)throw Error('This is not a reviewed Hikari web archive. Review and pin new releases before preparing them.');
const files=unzipSync(raw),output=resolve(destination);await mkdir(output,{recursive:true});
for(const [path,bytes] of Object.entries(files)){
  const prefix=`hikari-web-${version}/`;
  if(!path.startsWith(prefix)||path.includes('..')||path.includes('\\'))throw Error('Unexpected archive path');
  const name=path.slice(prefix.length);if(!name||name.endsWith('/'))continue;
  if(name==='.htaccess'||/\.(?:gz|br)$/.test(name)||version==='0.14.1'&&name==='_headers')continue;
  const target=resolve(output,name);if(relative(output,target).startsWith('..'))throw Error('Archive escaped output');await mkdir(resolve(target,'..'),{recursive:true});await writeFile(target,bytes);
}
const html=await readFile(resolve(output,'index.html'),'utf8');
if(version==='0.14.1'){
const inline=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(match=>"'sha256-"+createHash('sha256').update(match[1]).digest('base64')+"'");
const shell='https://explorebyclaudia.netlify.app';
await writeFile(resolve(output,'_headers'),`/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: no-referrer\n  Cache-Control: no-cache\n  Content-Security-Policy: default-src 'self'; script-src 'self' 'wasm-unsafe-eval' ${inline.join(' ')}; style-src 'self' 'unsafe-inline'; connect-src 'self' blob:; img-src 'self' blob: data:; font-src 'self' data:; worker-src 'self' blob:; frame-ancestors ${shell}; object-src 'none'; base-uri 'self'; form-action 'none'\n\n/*.wasm\n  Content-Type: application/wasm\n`);
}else{
 // Preserve the reviewed build's exact CSP and origin allowlist.
 if([...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].some(m=>! /\bsrc\s*=/.test(m[1])||m[2].trim()))throw Error('The strict-CSP build unexpectedly contains inline scripts.');
 const supplied=await readFile(resolve(output,'_headers'),'utf8');
 if(!supplied.includes("script-src 'self' 'wasm-unsafe-eval'")||!supplied.includes('https://explorebyclaudia.netlify.app'))throw Error('Unexpected Hikari security headers.');
}
await writeFile(resolve(output,'netlify.toml'),'[build]\n  publish = "."\n');
console.log('Prepared static Hikari '+version+' test site at '+output+'. Keep it on its own Netlify site; do not deploy over the Explore site.');
