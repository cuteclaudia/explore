// Exercise the deployable SSR package outside the checkout, with Netlify's
// require(ESM) restriction. Run after npm run build, using Node 24.
import {cp,mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {spawn} from 'node:child_process';
import {getStore} from '@netlify/blobs';
import {BlobsServer} from '@netlify/blobs/server';
const directory=await mkdtemp(join(tmpdir(),'explore-deploy-smoke-'));
let server;
try{
 const isolated=join(directory,'function');await cp(resolve('.netlify/v1/functions/ssr'),isolated,{recursive:true});
 server=new BlobsServer({directory:join(directory,'blobs'),token:'local-smoke-only',logger:()=>{}});const address=await server.start(),url='http://127.0.0.1:'+address.port;
 const context={siteID:'local-smoke-site',token:'local-smoke-only',apiURL:url,edgeURL:url,uncachedEdgeURL:url};
 const store=getStore({...context,name:'studio-content',consistency:'strong'});
 const draft={title:'Published build-check journal',date:'2026-10-26',summary:'Built package smoke check',tags:['Build check'],location:'',locationPrecision:'hidden',cover:'',coverAlt:'',html:'<p>Published build-check body</p>',photos:[]};
 await store.setJSON('entries/journal/deployment-check',{key:'journal/deployment-check',collection:'journal',slug:'deployment-check',ownerId:'local-owner',version:1,draft:{...draft,title:'PRIVATE DRAFT MUST NOT LEAK'},published:draft});
 // An override must prevent a repository original from reappearing after unpublish.
 await store.setJSON('entries/essays/puertochancay',{key:'essays/puertochancay',collection:'essays',slug:'puertochancay',ownerId:'local-owner',version:1,draft:{...draft,title:'Unpublished legacy article'},published:null});
 const check=await readFile(new URL('../server/test-fixtures/deployed-ssr.mjs',import.meta.url),'utf8');await writeFile(join(isolated,'check.mjs'),check);
 const exitCode=await new Promise((done,reject)=>{const child=spawn(process.execPath,['--no-require-module','check.mjs'],{cwd:isolated,stdio:'inherit',env:{...process.env,NETLIFY_BLOBS_CONTEXT:Buffer.from(JSON.stringify(context)).toString('base64')}});child.on('error',reject);child.on('exit',done);});
 if(exitCode!==0)throw Error('Isolated Netlify package checks failed.');
}finally{await server?.stop();await rm(directory,{recursive:true,force:true});}
