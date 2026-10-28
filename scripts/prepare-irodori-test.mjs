import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {unzipSync} from 'fflate';
const [archive,destination]=process.argv.slice(2);
if(!archive||!destination)throw Error('Usage: node scripts/prepare-irodori-test.mjs ZIP OUTPUT_DIRECTORY');
const raw=await readFile(archive),expected='4177ab26781a5e2ebe10c2d15e1dae98e115c090254f1ec841d75b7a700a4e78';
if(createHash('sha256').update(raw).digest('hex')!==expected)throw Error('Review and pin this Irodori release before preparing it.');
const files=unzipSync(raw),output=resolve(destination),prefix='irodori-web-0.16.0/';await mkdir(output,{recursive:true});
for(const [path,bytes] of Object.entries(files)){
 if(!path.startsWith(prefix)||path.includes('..')||path.includes('\\'))throw Error('Unexpected archive path.');
 const name=path.slice(prefix.length);if(!name||name.endsWith('/')||name==='.htaccess')continue;
 const target=resolve(output,name);if(relative(output,target).startsWith('..'))throw Error('Archive escaped destination.');await mkdir(resolve(target,'..'),{recursive:true});await writeFile(target,bytes);
}
const html=await readFile(resolve(output,'index.html'),'utf8');
if([...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].some(m=>! /\bsrc\s*=/.test(m[1])||m[2].trim()))throw Error('Strict CSP build unexpectedly has inline script.');
const supplied=await readFile(resolve(output,'_headers'),'utf8');
if(!supplied.includes("script-src 'self' 'wasm-unsafe-eval'")||!supplied.includes("frame-ancestors 'self' https://explorebyclaudia.netlify.app"))throw Error('Unexpected security policy.');
// start-1.js is not content-addressed. Never cache it across releases: it imports
// versioned bootstrap assets. Preserve the supplied CSP and every app byte.
await writeFile(resolve(output,'_headers'),supplied+'\n# Website review: fixed-name startup and root HTML must revalidate on updates.\n/start-1.js\n  ! Cache-Control\n  Cache-Control: no-cache\n\n/\n  Cache-Control: no-cache\n');
await writeFile(resolve(output,'netlify.toml'),'[build]\n  publish = "."\n');
console.log('Prepared Irodori 0.16.0 at '+output+'. Deploy only to its own separate test site.');
