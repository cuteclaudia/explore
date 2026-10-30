// Website copy only; app IDs and storage/bridge contracts stay unchanged.
export const APP_PRESENTATION=Object.freeze({
 hikari:{name:'SoraPhotos',shortName:'SoraPhotos',japaneseName:'光',legacyName:'Hikari',purpose:'photo development and editing'},
 irodori:{name:'SoraImage',shortName:'SoraImage',japaneseName:'彩り',legacyName:'Irodori',purpose:'image editing and design'},
 fumi:{name:'SoraDocs',shortName:'SoraDocs',japaneseName:'文',legacyName:'Fumi',purpose:'writing and document editing'},
 tsuzuri:{name:'SoraPDF',shortName:'SoraPDF',japaneseName:'綴り',legacyName:'Tsuzuri',purpose:'PDF editing and organisation'},
 tayori:{name:'SoraMail',shortName:'SoraMail',japaneseName:'便り',legacyName:'Tayori',purpose:'mail, calendar and contacts'},
 goban:{name:'SoraSheets',shortName:'SoraSheets',japaneseName:'碁盤',legacyName:'Goban',purpose:'spreadsheets and data'},
});
export const appIdentity=app=>Object.hasOwn(APP_PRESENTATION,app)?APP_PRESENTATION[app].name+' — '+APP_PRESENTATION[app].purpose:'SoraSpace app';
export const openingAppMessage=app=>'Opening '+appIdentity(app)+'…';
