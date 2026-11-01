// Proposed roadmap display names, not launch routes or accepted app capabilities.
// IDs and the romanised name field remain stable; English names are provisional.
export const UPCOMING_APPS=Object.freeze([
 {id:'akari',name:'Akari',englishName:'SoraSlides',japaneseName:'明かり',kind:'Presentations',mark:'P'},
 {id:'sen',name:'Sen',englishName:'SoraDraw',japaneseName:'線',kind:'Illustration',mark:'D'},
 {id:'hanga',name:'Hanga',englishName:'SoraLayout',japaneseName:'版画',kind:'Page layout',mark:'L'},
 {id:'hinagata',name:'Hinagata',englishName:'SoraDesign',japaneseName:'雛形',kind:'UI design',mark:'UI'},
 {id:'kage',name:'Kage',englishName:'SoraVideo',japaneseName:'影',kind:'Video',mark:'V'},
 {id:'hibiki',name:'Hibiki',englishName:'SoraAudio',japaneseName:'響',kind:'Audio',mark:'A'},
 {id:'mai',name:'Mai',englishName:'SoraMotion',japaneseName:'舞',kind:'Motion',mark:'M'},
 {id:'takumi',name:'Takumi',englishName:'SoraCAD',japaneseName:'匠',kind:'CAD',mark:'3D'},
].map(Object.freeze));
export const upcomingIdentity=id=>{const app=UPCOMING_APPS.find(app=>app.id===id);if(!app)throw Error('Unknown roadmap app: '+id);return app.englishName+' — '+app.name+' · '+app.japaneseName;};
