// Public links select the requested app; server launch/permission gates still apply.
export function appDestination(app){
 if(!['hikari','irodori','fumi','tsuzuri','tayori','goban'].includes(app?.id))return '/apps';
 return app.web?'/apps/'+app.id:'/apps?desktop='+app.id+'#workspace-app-'+app.id;
}
