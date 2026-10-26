import {readFile,writeFile,mkdir,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {unzipSync} from 'fflate';
import {CRAFT_TOOLS} from '../server/craft-tools.mjs';
for(const [id,tool] of Object.entries(CRAFT_TOOLS)){
 const filename=`${id}-web-${tool.version}.zip`;
 const cache=resolve('.netlify/craft-cache',filename);await mkdir(dirname(cache),{recursive:true});
 let data;try{data=await readFile(cache);}catch{}
 const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
 if(!data||digest(data)!==tool.sha256){
  const url=`https://github.com/storytold/${id}/releases/download/v${tool.version}/${filename}`;
  const response=await fetch(url,{signal:AbortSignal.timeout(60000)});if(!response.ok)throw Error(`${id} release download failed (${response.status})`);
  data=Buffer.from(await response.arrayBuffer());if(digest(data)!==tool.sha256)throw Error(`${id}: release checksum mismatch`);
  await writeFile(cache,data);
 }
 const root=resolve(`public/vendor/craft/${id}-${tool.version}`);await rm(root,{recursive:true,force:true});await mkdir(root,{recursive:true});
 const files=unzipSync(data);let html;
 for(const [name,bytes] of Object.entries(files)){
  const rel=name.split('/').slice(1).join('/');if(!rel||name.endsWith('/'))continue;
  if(rel==='index.html'){html=new TextDecoder().decode(bytes);continue;}
  // Never publish standalone app entry pages or upstream host configuration.
  if(/\.(?:html?|gz|br)$/i.test(rel)||rel.split('/').some(x=>x.startsWith('.')||x==='_headers'||x==='_redirects'))continue;
  const target=resolve(root,rel);if(!target.startsWith(root+'/'))throw Error('Invalid archive path');
  await mkdir(dirname(target),{recursive:true});await writeFile(target,bytes);
 }
 if(!html)throw Error(`${id}: no application entry page`);
 // Rebrand visible wrapper text only. Keep upstream binary/API identifiers and
 // separate licence/NOTICE files untouched while rebuilt apps are validated.
 html=html.replaceAll(`<title>${tool.engineName}</title>`,`<title>${tool.name}</title>`)
  .replaceAll(`Loading ${tool.engineName}`,`Loading ${tool.name}`)
  .replaceAll(`Starting ${tool.engineName}`,`Starting ${tool.name}`)
  .replaceAll(`${tool.engineName} failed to load`,`${tool.name} failed to load`)
  .replaceAll(`content="${tool.engineName}:`,`content="${tool.name}:`);
 await mkdir('src/generated/craft',{recursive:true});
 const bridge=await readFile('scripts/craft-file-bridge.js','utf8');
 html=html.replace(/<head>/i,`<head><script>${bridge}</script>`);
 html=html.replace(/<head>/i,`<head><base href="/vendor/craft/${id}-${tool.version}/">`);
 await writeFile(`src/generated/craft/${id}.html`,html);
 console.log(`Prepared ${tool.name} ${tool.version}; release SHA256 verified.`);
}
