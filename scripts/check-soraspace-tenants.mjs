// Disposable PostgreSQL acceptance. No live URL, host port or application secrets.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtemp,chmod,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomUUID,randomBytes} from 'node:crypto';
import pg from 'pg';
import {createTenantDatabase,createTenantService} from '../server/soraspace-tenant.mjs';
const image='postgres:17-alpine@sha256:266d3c257594e195b309ae9d1805e54c788f1d7b375f56bf6c367aac6c917e7b';
const socket=await mkdtemp(join(tmpdir(),'soraspace-pg-')),container='soraspace-tenants-'+randomUUID();
let admin,pool,started=false;
const docker=(...args)=>execFileSync('docker',args,{encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout:120000});
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222',same='33333333-3333-4333-8333-333333333333';
const scope=(id='alice',workspaceId=A)=>({session:{fixtureIdentity:id},workspaceId});
const denial=(fn,status)=>assert.rejects(fn,e=>e.status===status);
try{
 await chmod(socket,0o777);
 docker('run','--detach','--rm','--name',container,'--network','none','--memory','512m','--cpus','1',
  '--tmpfs','/var/lib/postgresql/data:rw,noexec,nosuid,size=256m',
  '--mount',`type=bind,source=${socket},target=/var/run/postgresql`,
  '-e','POSTGRES_PASSWORD='+randomBytes(24).toString('hex'),image,'-c','listen_addresses=','-c','max_connections=20');started=true;
 // Each wait is short and bounded; Docker has no publicly exposed port.
 for(let i=0;i<100;i++){
  try{docker('exec',container,'sh','-c','test "$(cat /proc/1/comm)" = postgres && pg_isready -U postgres');break;}
  catch{if(i===99)throw Error('Disposable PostgreSQL did not start.');await new Promise(r=>setTimeout(r,150));}
 }
 admin=new pg.Pool({host:socket,user:'postgres',database:'postgres',max:2});
 await admin.query(await readFile(new URL('../db/soraspace/001-tenant-foundation.sql',import.meta.url),'utf8'));
 await admin.query('CREATE ROLE soraspace_test LOGIN INHERIT; GRANT soraspace_runtime TO soraspace_test');
 await admin.query(`INSERT INTO soraspace.workspaces(id,name) VALUES($1,'Alpha'),($2,'Beta')`,[A,B]);
 for(const [workspace,account,role] of [[A,'alice','owner'],[B,'bob','owner'],[A,'anna','editor'],[A,'vera','viewer'],[A,'adam','admin'],[A,'shared','viewer'],[B,'shared','viewer']]){
  await admin.query('INSERT INTO soraspace.memberships(workspace_id,account_id,role) VALUES($1,$2,$3)',[workspace,account,role]);
 }
 pool=new pg.Pool({host:socket,user:'soraspace_test',database:'postgres',max:4});
 const database=createTenantDatabase(pool),accounts=new Map(['alice','bob','anna','vera','adam','shared','outsider'].map(id=>[id,{id,verified:true,suspended:false}]));
 let checks=0;
 const verifySession=async session=>{checks++;return accounts.get(session?.fixtureIdentity);};
 const service=createTenantService({database,verifySession});
 const alpha=await service.create(scope(),'document',{title:'Same title',body:{secret:'Alpha private'}});
 const beta=await service.create(scope('bob',B),'document',{title:'Same title',body:{secret:'Beta private'}});
 assert.equal(alpha.visibility,'private');assert.equal(beta.visibility,'private');
 assert(alpha.storageKey.startsWith(`soraspace/v1/workspaces/${A}/objects/`));
 assert(beta.storageKey.startsWith(`soraspace/v1/workspaces/${B}/objects/`));
 assert.notEqual(alpha.storageKey,beta.storageKey);
 await denial(()=>service.read(scope(),beta.id),404);
 await denial(()=>service.list(scope('alice',B)),404);
 await denial(()=>service.list(scope('outsider')),404);
 await denial(()=>service.update(scope(),beta.id,1,{title:'Stolen'}),409);
 await denial(()=>service.remove(scope(),beta.id,1),409);
 assert.deepEqual((await service.list(scope())).items.map(r=>r.id),[alpha.id]);
 console.log('PASS two tenants: private reads/lists/updates/deletes, same filenames and server-owned storage namespaces');

 const annaPrivate=await service.create(scope('anna'),'document',{title:'Private research notes'});
 await denial(()=>service.read(scope(),annaPrivate.id),404);
 await denial(()=>service.read(scope('adam'),annaPrivate.id),404);
 const shared=await service.create(scope('anna'),'site-draft',{title:'Shared article',visibility:'workspace'});
 assert.equal((await service.read(scope('vera'),shared.id)).title,'Shared article');
 await denial(()=>service.create(scope('vera'),'document',{title:'Viewer write'}),403);
 await denial(()=>service.update(scope('vera'),shared.id,1,{title:'Viewer edit'}),403);
 await denial(()=>service.remove(scope('vera'),shared.id,1),403);
 await denial(()=>service.read(scope('shared',B),shared.id),404);
 assert.equal((await service.read(scope('shared'),shared.id)).id,shared.id);
 await assert.rejects(()=>database.transaction('alice',A,c=>c.query('UPDATE soraspace.resources SET visibility=$1 WHERE id=$2',['private',shared.id])),e=>e.code==='42501');
 console.log('PASS workspace sharing and viewer roles without cross-workspace sharing');

 // Identical object IDs in different tenants test composite identity and RLS even
 // when a query accidentally omits its workspace predicate.
 for(const [workspace,account,text] of [[A,'alice','Alpha scoped'],[B,'bob','Beta scoped']]){
  await database.transaction(account,workspace,c=>c.query(`INSERT INTO soraspace.resources(workspace_id,id,owner_account_id,resource_type,title) VALUES($1,$2,$3,'file',$4)`,[workspace,same,account,text]));
 }
 assert.equal((await service.read(scope(),same)).title,'Alpha scoped');assert.equal((await service.read(scope('bob',B),same)).title,'Beta scoped');
 await database.transaction('alice',A,async c=>{
  const r=await c.query('SELECT workspace_id FROM soraspace.resources');assert(r.rows.length);assert(r.rows.every(r=>r.workspace_id===A));
  assert.equal((await c.query('SELECT * FROM soraspace.memberships WHERE workspace_id=$1',[B])).rowCount,0);
  assert.equal((await c.query('SELECT soraspace.membership_role($1) AS role',[B])).rows[0].role,null);
  assert.equal((await c.query('UPDATE soraspace.resources SET title=$1 WHERE workspace_id=$2',['Cross-tenant overwrite',B])).rowCount,0);
  assert.equal((await c.query('DELETE FROM soraspace.resources WHERE workspace_id=$1',[B])).rowCount,0);
 });
 for(const sql of [
  `UPDATE soraspace.memberships SET role='owner' WHERE account_id='anna'`,
  `INSERT INTO soraspace.memberships VALUES('${B}','alice','owner','active',NULL)`,
  `UPDATE soraspace.workspaces SET state='active'`,
  `UPDATE soraspace.resources SET owner_account_id='alice'`,
  `UPDATE soraspace.resources SET workspace_id='${B}'`,
  `UPDATE soraspace.resources SET version=200`,
  `DELETE FROM soraspace.audit_events`,
  `SELECT * FROM soraspace.audit_events`,
  `SET ROLE soraspace_owner`,
  `SET row_security=off; SELECT * FROM soraspace.resources`
 ])await assert.rejects(()=>database.transaction('anna',A,c=>c.query(sql)),e=>e.code==='42501');
 await assert.rejects(()=>database.transaction('alice',A,c=>c.query(`INSERT INTO soraspace.resources(workspace_id,id,owner_account_id,resource_type,title) VALUES($1,$2,'bob','document','Forged')`,[B,randomUUID()])),e=>e.code==='42501');
 console.log('PASS direct SQL defense: composite IDs, unscoped reads/writes, forged owner/tenant, membership promotion, audit tampering and RLS bypass');

 const raw=await pool.connect();
 try{
  await raw.query('BEGIN');await raw.query('SET LOCAL ROLE soraspace_runtime');
  assert.equal((await raw.query('SELECT * FROM soraspace.resources')).rowCount,0);
  await raw.query("SELECT set_config('soraspace.account_id','alice',true),set_config('soraspace.workspace_id','not-a-uuid',true)");
  assert.equal((await raw.query('SELECT * FROM soraspace.resources')).rowCount,0);await raw.query('ROLLBACK');
 }finally{raw.release();}
 await denial(()=>createTenantService({database:createTenantDatabase(admin),verifySession}).list(scope()),503);
 // One physical connection reused across accounts; local context must not stick.
 const single=new pg.Pool({host:socket,user:'soraspace_test',database:'postgres',max:1});
 try{
  const reused=createTenantDatabase(single);
  await reused.transaction('alice',A,c=>c.query('SELECT * FROM soraspace.resources'));
  await assert.rejects(()=>reused.transaction('bob',B,async c=>{await c.query('SELECT 1');throw Error('rollback-fixture');}),/rollback-fixture/);
  const noContext=await single.query('SELECT soraspace.current_workspace_id() AS workspace,soraspace.current_account_id() AS account');assert.deepEqual(noContext.rows[0],{workspace:null,account:null});
  await reused.transaction('bob',B,async c=>{const r=await c.query('SELECT * FROM soraspace.resources');assert(r.rows.every(r=>r.workspace_id===B));});
 }finally{await single.end();}
 console.log('PASS missing/malformed context, privileged credential refusal and pooled connection commit/rollback isolation');

 const count=checks;await service.read(scope(),alpha.id);assert.equal(checks,count+1);
 accounts.set('alice',{id:'alice',verified:true,suspended:true});await denial(()=>service.list(scope()),401);accounts.set('alice',{id:'alice',verified:true,suspended:false});
 accounts.set('outsider',{id:'outsider',verified:true,suspended:false,isOwner:true});await denial(()=>service.list(scope('outsider')),404);
 await admin.query("UPDATE soraspace.memberships SET state='revoked' WHERE workspace_id=$1 AND account_id='anna'",[A]);await denial(()=>service.list(scope('anna')),404);
 await admin.query("UPDATE soraspace.memberships SET state='active',valid_until=statement_timestamp()-interval '1 second' WHERE workspace_id=$1 AND account_id='anna'",[A]);await denial(()=>service.list(scope('anna')),404);
 await admin.query("UPDATE soraspace.memberships SET valid_until=NULL WHERE workspace_id=$1 AND account_id='anna'",[A]);
 await admin.query("UPDATE soraspace.workspaces SET state='suspended' WHERE id=$1",[B]);await denial(()=>service.list(scope('bob',B)),404);await admin.query("UPDATE soraspace.workspaces SET state='active' WHERE id=$1",[B]);
 console.log('PASS fresh session verification, account suspension, no global-owner bypass, membership revocation/expiry and suspended workspace');
 // Revoke AFTER the service membership check, before its resource SQL executes.
 let revokeOnce=true;
 const late=createTenantService({verifySession,database:{transaction(account,workspace,operation){return database.transaction(account,workspace,c=>operation({async query(sql,args){
  const result=await c.query(sql,args);
  if(revokeOnce&&sql.includes('SELECT m.role')){revokeOnce=false;await admin.query("UPDATE soraspace.memberships SET state='revoked' WHERE workspace_id=$1 AND account_id='anna'",[A]);}
  return result;
 }}));}}});
 await denial(()=>late.read(scope('anna'),annaPrivate.id),404);
 await admin.query("UPDATE soraspace.memberships SET state='active' WHERE workspace_id=$1 AND account_id='anna'",[A]);
 console.log('PASS revocation between membership verification and resource read is denied by database policy');


 const races=await Promise.allSettled([service.update(scope(),alpha.id,1,{title:'First writer'}),service.update(scope(),alpha.id,1,{title:'Second writer'})]);
 assert.equal(races.filter(r=>r.status==='fulfilled').length,1);assert.equal(races.find(r=>r.status==='rejected').reason.status,409);
 assert.equal((await service.read(scope(),alpha.id)).version,2);
 await denial(()=>service.remove(scope(),alpha.id,1),409);
 const before=await admin.query('SELECT count(*) FROM soraspace.audit_events');
 await assert.rejects(()=>database.transaction('alice',A,async c=>{await c.query('UPDATE soraspace.resources SET title=$1 WHERE id=$2',['Must roll back',alpha.id]);throw Error('cancel');}),/cancel/);
 assert.equal((await admin.query('SELECT count(*) FROM soraspace.audit_events')).rows[0].count,before.rows[0].count);
 await service.remove(scope(),alpha.id,2);await denial(()=>service.read(scope(),alpha.id),404);
 const audit=await admin.query('SELECT action,resource_version,actor_account_id FROM soraspace.audit_events WHERE workspace_id=$1 AND resource_id=$2 ORDER BY id',[A,alpha.id]);
 assert.deepEqual(audit.rows.map(r=>[r.action,r.resource_version,r.actor_account_id]),[['INSERT',1,'alice'],['UPDATE',2,'alice'],['DELETE',2,'alice']]);
 console.log('PASS concurrent compare-and-swap, stale deletes and atomic metadata-only audit with rollback');

 const all=[];let next=null;do{const p=await service.list(scope(),{limit:1,after:next});all.push(...p.items.map(r=>r.id));next=p.next;}while(next);
 assert(all.length>1);assert.equal(new Set(all).size,all.length);assert(!all.includes(beta.id));
 assert((await service.list(scope(),{resourceType:'file'})).items.every(r=>r.resourceType==='file'));
 assert.equal((await service.list(scope('anna'))).items.some(r=>r.id===annaPrivate.id),true);
 const versionNumber=(await admin.query('SHOW server_version')).rows[0].server_version;
 console.log('PASS bounded keyset pagination and resource types; PostgreSQL '+versionNumber);
 console.log('PASS isolated foundation only: no live routes, provider credentials, file bytes, tenants or custom domains created');
}finally{
 if(pool)await pool.end();if(admin)await admin.end();
 if(started){docker('exec','-u','0',container,'chown',`${process.getuid()}:${process.getgid()}`,'/var/run/postgresql');docker('rm','--force',container);}
 await rm(socket,{recursive:true,force:true});
}
