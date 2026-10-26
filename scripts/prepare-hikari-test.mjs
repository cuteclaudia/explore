import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {unzipSync} from 'fflate';
const [archive,destination]=process.argv.slice(2);
if(!archive||!destination)throw Error('Usage: node scripts/prepare-hikari-test.mjs ZIP OUTPUT_DIRECTORY');
const expected='1979822f6118bbe75c61f120b4af44191b2fd4c71091cf7678f4a65a11c006a8';
const raw=await readFile(archive);if(createHash('sha256').update(raw).digest('hex')!==expected)throw Error('This is not the reviewed Hikari 0.14.1 web archive. Review and pin new releases before preparing them.');
const files=unzipSync(raw),output=resolve(destination);await mkdir(output,{recursive:true});
for(const [path,bytes] of Object.entries(files)){
  if(!path.startsWith('hikari-web-0.14.1/')||path.includes('..')||path.includes('\\'))throw Error('Unexpected archive path');
  const name=path.slice('hikari-web-0.14.1/'.length);if(!name||name.endsWith('/'))continue;
  if(name==='_headers'||name==='.htaccess'||/\.(?:gz|br)$/.test(name))continue;
  const target=resolve(output,name);if(relative(output,target).startsWith('..'))throw Error('Archive escaped output');await mkdir(resolve(target,'..'),{recursive:true});await writeFile(target,bytes);
}
const html=await readFile(resolve(output,'index.html'),'utf8');const inline=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(match=>"'sha256-"+createHash('sha256').update(match[1]).digest('base64')+"'");
const shell='https://explorebyclaudia.netlify.app';
await writeFile(resolve(output,'_headers'),`/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: no-referrer\n  Cache-Control: no-cache\n  Content-Security-Policy: default-src 'self'; script-src 'self' 'wasm-unsafe-eval' ${inline.join(' ')}; style-src 'self' 'unsafe-inline'; connect-src 'self' blob:; img-src 'self' blob: data:; font-src 'self' data:; worker-src 'self' blob:; frame-ancestors ${shell}; object-src 'none'; base-uri 'self'; form-action 'none'\n\n/*.wasm\n  Content-Type: application/wasm\n`);
await writeFile(resolve(output,'netlify.toml'),'[build]\n  publish = "."\n');
console.log('Prepared static Hikari test site at '+output+'. Keep it on its own Netlify site; do not deploy over the Explore site.');
