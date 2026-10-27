import {koboApp} from '../src/lib/kobo-contract.mjs';
// An explicit per-user beta grant does not enable the suite for all app users.
export function mayUseKoboBeta(actor,app){
  const spec=koboApp(app);
  return actor?.permissions?.[spec.capability]===true &&
    (actor.isOwner===true || app==='hikari' && actor.permissions['beta.hikari']===true);
}
