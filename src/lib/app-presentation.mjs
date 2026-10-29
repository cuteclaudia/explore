// Website copy only; app IDs and storage/bridge contracts stay unchanged.
export const APP_PRESENTATION=Object.freeze({
 hikari:{name:'SoraSpace Photos',shortName:'Photos',legacyName:'Hikari',purpose:'photo development and editing'},
 irodori:{name:'SoraSpace Image Editor',shortName:'Image Editor',legacyName:'Irodori',purpose:'image editing and design'},
 fumi:{name:'SoraSpace Docs',shortName:'Docs',legacyName:'Fumi',purpose:'writing and document editing'},
 tsuzuri:{name:'SoraSpace PDF',shortName:'PDF',legacyName:'Tsuzuri',purpose:'PDF editing and organisation'},
 tayori:{name:'SoraSpace Mail',shortName:'Mail',legacyName:'Tayori',purpose:'mail, calendar and contacts'},
 goban:{name:'SoraSpace Sheets',shortName:'Sheets',legacyName:'Goban',purpose:'spreadsheets and data'},
});
export const appIdentity=app=>Object.hasOwn(APP_PRESENTATION,app)?APP_PRESENTATION[app].name+' — '+APP_PRESENTATION[app].purpose:'SoraSpace app';
export const openingAppMessage=app=>'Opening '+appIdentity(app)+'…';
