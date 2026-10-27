import {createHash,randomUUID} from 'node:crypto';
import {revision} from './blob-revisions.mjs';
import {KoboError} from '../src/lib/kobo-contract.mjs';

// Exercise the same conditional commits used by the Drive logical index. Neither
// contender goes through locked(): correctness must come from the storage service.
export async function verifyAtomicIndex(store,scope){
 const namespace=createHash('sha256').update(scope).digest('hex');
 const key='_atomic-checks/'+namespace+'/'+randomUUID();
 async function race(before,round){
  const candidates=[1,2].map(writer=>({round,writer,writeId:randomUUID()}));
  // Inspect the raw conditional-write results: a later read-back alone could
  // mask a broken backend that accepted both writes but retained just the last.
  const outcomes=await Promise.allSettled(candidates.map(value=>store.setJSON(key,value,before?{onlyIfMatch:before.etag}:{onlyIfNew:true})));
  const winners=outcomes.map((r,i)=>({result:r,candidate:candidates[i]})).filter(r=>r.result.status==='fulfilled'&&r.result.value?.modified===true);
  const refusals=outcomes.filter(r=>r.status==='fulfilled'&&r.value?.modified===false);
  if(winners.length!==1||refusals.length!==1)throw new KoboError('server','Competing-save checks did not establish one safe winner. Sync verification remains incomplete.');
  const current=await revision(store,key);
  if(!current?.etag||current.data.writeId!==winners[0].candidate.writeId||current.data.round!==round)throw new KoboError('server','The competing-save winner could not be confirmed. Sync verification remains incomplete.');
  return current;
 }
 try{
  const created=await race(null,'create-only');
  const replaced=await race(created,'compare-and-swap');
  if(created.etag===replaced.etag)throw new KoboError('server','The storage revision did not change after replacement.');
  const stale=await store.setJSON(key,{round:'stale',writeId:randomUUID()},{onlyIfMatch:created.etag});
  if(stale?.modified!==false)throw new KoboError('server','Storage accepted or could not confirm refusal of a stale revision after the competing-save check.');
  const final=await revision(store,key);
  if(final?.data.writeId!==replaced.data.writeId)throw new KoboError('server','A stale save changed the winning revision.');
  return {createOnly:true,compareAndSwap:true};
 }finally{
  // Only the fresh, unguessable diagnostic record can be removed here. No app
  // entry, original, manifest or existing user file is touched by this probe.
  try{await store.delete(key);}catch{}
 }
}
