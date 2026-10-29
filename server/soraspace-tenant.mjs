// Isolated foundation; no route, Identity integration, job or live store imports it.
// All actor IDs come from trusted session verification, never request bodies.
import {randomUUID} from 'node:crypto';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const types=new Set(['document','file','site-draft']);
const columns='workspace_id AS "workspaceId",id,owner_account_id AS "ownerAccountId",resource_type AS "resourceType",visibility,title,body,storage_key AS "storageKey",version';
export class TenantError extends Error {
 constructor(status,message){super(message);this.name='TenantError';this.status=status;}
}
function validId(value){if(typeof value!=='string'||!uuid.test(value))throw new TenantError(400,'Invalid identifier.');return value.toLowerCase();}
function version(value){if(!Number.isInteger(value)||value<1||value>=2147483647)throw new TenantError(400,'A current resource version is required.');return value;}
function payload(input){
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['title','visibility','body'].includes(k)))throw new TenantError(400,'Invalid resource fields.');
 if(typeof input.title!=='string'||!input.title.trim()||[...input.title].length>250||input.title.includes('\0'))throw new TenantError(400,'Use a title of 1–250 characters.');
 const visibility=input.visibility??'private';if(!['private','workspace'].includes(visibility))throw new TenantError(400,'Invalid visibility.');
 const body=input.body??{};let encoded;
 try{if(!body||typeof body!=='object'||Array.isArray(body)||![Object.prototype,null].includes(Object.getPrototypeOf(body)))throw Error();encoded=JSON.stringify(body);}catch{throw new TenantError(400,'Use an object for resource content.');}
 if(Buffer.byteLength(encoded)>60000)throw new TenantError(400,'Resource content is too large.');
 return {title:input.title.trim(),visibility,body:encoded};
}
// Adapter contract: pool.connect() returns an exclusive PostgreSQL connection.
// Never hand its client to routes or accept SQL/context/role from browser input.
export function createTenantDatabase(pool){
 return {
  async transaction(accountId,workspaceId,operation){
   const client=await pool.connect();let started=false,discard=false;
   try{
    // Fail closed for migration/admin credentials, including inherited ownership.
    const {rows:[role]}=await client.query(`SELECT r.rolsuper,r.rolbypassrls,r.rolcreaterole,r.rolcreatedb,
      pg_has_role(session_user,'soraspace_owner','MEMBER') AS owns,
      pg_has_role(session_user,'soraspace_runtime','MEMBER') AS runtime
      FROM pg_catalog.pg_roles r WHERE r.rolname=session_user`);
    if(!role||['rolsuper','rolbypassrls','rolcreaterole','rolcreatedb','owns'].some(key=>role[key]!==false)||role.runtime!==true)throw new TenantError(503,'Tenant database role is not safe for runtime access.');
    await client.query('BEGIN ISOLATION LEVEL READ COMMITTED');started=true;
    await client.query('SET LOCAL ROLE soraspace_runtime');
    await client.query("SET LOCAL statement_timeout='5s'");
    await client.query("SET LOCAL lock_timeout='2s'");
    await client.query("SET LOCAL idle_in_transaction_session_timeout='15s'");
    await client.query("SELECT set_config('soraspace.account_id',$1,true),set_config('soraspace.workspace_id',$2,true)",[accountId,workspaceId]);
    const result=await operation(client);await client.query('COMMIT');started=false;return result;
   }catch(error){
    if(started){try{await client.query('ROLLBACK');}catch{discard=true;}}else discard=true;
    throw error;
   }finally{client.release(discard);}
  }
 };
}
export function createTenantService({database,verifySession}){
 if(typeof database?.transaction!=='function'||typeof verifySession!=='function')throw Error('Trusted database and session verifier are required.');
 async function scoped(scope,operation){
  const workspaceId=validId(scope?.workspaceId);let account;
  try{account=await verifySession(scope?.session);}catch{throw new TenantError(401,'Please sign in again.');}
  if(!account||account.verified!==true||typeof account.id!=='string'||!account.id||account.id.length>200||account.id.includes('\0')||account.suspended!==false)throw new TenantError(401,'A verified active account is required.');
  return database.transaction(account.id,workspaceId,async client=>{
   // Check current membership; RLS rechecks it at each statement snapshot.
   // A write already authorized concurrently with revocation may finish.
   const member=await client.query(`SELECT m.role FROM soraspace.memberships m
     JOIN soraspace.workspaces w ON w.id=m.workspace_id WHERE m.workspace_id=$1 AND m.account_id=$2
     AND m.state='active' AND w.state='active' AND (m.valid_until IS NULL OR m.valid_until>statement_timestamp())`,[workspaceId,account.id]);
   if(member.rowCount!==1)throw new TenantError(404,'Workspace unavailable.');
   return operation(client,workspaceId,account.id,member.rows[0].role);
  });
 }
 const missing=()=>new TenantError(404,'Resource unavailable.');
 const writer=role=>{if(!['owner','admin','editor'].includes(role))throw new TenantError(403,'This workspace role cannot change resources.');};
 return Object.freeze({
  async list(scope,{limit=30,after=null,resourceType=null}={}){
   if(!Number.isInteger(limit)||limit<1||limit>100||resourceType!==null&&!types.has(resourceType))throw new TenantError(400,'Invalid listing options.');
   if(after!==null)after=validId(after);
   return scoped(scope,async(client,workspaceId)=>{
    const {rows}=await client.query(`SELECT ${columns} FROM soraspace.resources WHERE workspace_id=$1
      AND ($2::uuid IS NULL OR id>$2::uuid) AND ($3::text IS NULL OR resource_type=$3) ORDER BY id LIMIT $4`,[workspaceId,after,resourceType,limit+1]);
    return {items:rows.slice(0,limit),next:rows.length>limit?rows[limit-1].id:null};
   });
  },
  async read(scope,id){id=validId(id);return scoped(scope,async(client,workspaceId)=>{
   const {rows}=await client.query(`SELECT ${columns} FROM soraspace.resources WHERE workspace_id=$1 AND id=$2`,[workspaceId,id]);
   if(!rows.length)throw missing();return rows[0];
  });},
  async create(scope,resourceType,input){
   if(!types.has(resourceType))throw new TenantError(400,'Invalid resource type.');const data=payload(input);
   return scoped(scope,async(client,workspaceId,accountId,role)=>{writer(role);
    const {rows}=await client.query(`INSERT INTO soraspace.resources(workspace_id,id,owner_account_id,resource_type,visibility,title,body)
     VALUES($1,$2,$3,$4,$5,$6,$7::jsonb) RETURNING ${columns}`,[workspaceId,randomUUID(),accountId,resourceType,data.visibility,data.title,data.body]);return rows[0];
   });
  },
  async update(scope,id,expectedVersion,input){id=validId(id);version(expectedVersion);const data=payload(input);
   return scoped(scope,async(client,workspaceId,_accountId,role)=>{writer(role);
    const {rows}=await client.query(`UPDATE soraspace.resources SET title=$1,visibility=$2,body=$3::jsonb
     WHERE workspace_id=$4 AND id=$5 AND version=$6 RETURNING ${columns}`,[data.title,data.visibility,data.body,workspaceId,id,expectedVersion]);
    if(!rows.length)throw new TenantError(409,'Resource unavailable or changed. Reload before saving.');return rows[0];
   });
  },
  async remove(scope,id,expectedVersion){id=validId(id);version(expectedVersion);return scoped(scope,async(client,workspaceId,_accountId,role)=>{writer(role);
   const result=await client.query('DELETE FROM soraspace.resources WHERE workspace_id=$1 AND id=$2 AND version=$3',[workspaceId,id,expectedVersion]);
   if(!result.rowCount)throw new TenantError(409,'Resource unavailable or changed. Reload before deleting.');return {removed:true};
  });}
 });
}
