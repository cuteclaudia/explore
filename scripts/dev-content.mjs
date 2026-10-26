// Local development only: persistent Blobs emulator. No production credentials or authentication bypass.
import {BlobsServer} from '@netlify/blobs/server';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
const directory=resolve('.netlify/content-local-blobs');await mkdir(directory,{recursive:true});
const server=new BlobsServer({directory,token:'local-development-only',logger:()=>{}});
const address=await server.start(),url='http://127.0.0.1:'+address.port;
const context=Buffer.from(JSON.stringify({siteID:'local-content',token:'local-development-only',apiURL:url,edgeURL:url,uncachedEdgeURL:url})).toString('base64');
const child=spawn(process.execPath,['node_modules/.bin/astro','dev','--ignore-lock',...process.argv.slice(2)],{stdio:'inherit',env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1',NETLIFY_BLOBS_CONTEXT:context}});
let stopping=false;async function stop(){if(stopping)return;stopping=true;child.kill('SIGTERM');await server.stop();}
process.on('SIGINT',()=>{stop();});process.on('SIGTERM',()=>{stop();});child.on('error',async error=>{console.error(error.message);await stop();process.exitCode=1;});child.on('exit',async code=>{await stop();process.exitCode=code||0;});
