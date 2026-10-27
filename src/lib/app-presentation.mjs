// Website copy only; app IDs and storage/bridge contracts stay unchanged.
export const APP_PRESENTATION=Object.freeze({
 hikari:{name:'Hikari',purpose:'photo development and editing'},
 irodori:{name:'Irodori',purpose:'image editing and design'},
 fumi:{name:'Fumi',purpose:'writing and document editing'},
 tsuzuri:{name:'Tsuzuri',purpose:'PDF editing and organisation'},
});
export const appIdentity=app=>Object.hasOwn(APP_PRESENTATION,app)?APP_PRESENTATION[app].name+' — '+APP_PRESENTATION[app].purpose:'Kōbō app';
export const openingAppMessage=app=>'Opening '+appIdentity(app)+'…';
