import {LANGUAGES,canonicalLanguageCode} from './languages.mjs';
// Pure helpers are also embedded into the tiny standalone public-site bootstrap.
export function matchBrowserLanguage(values){
 for(const value of Array.isArray(values)?values:[]){
  if(typeof value!=='string'||value.length>80)continue;
  let locale;try{locale=new Intl.Locale(value);}catch{continue;}
  const base=locale.language;
  if(base==='zh')return locale.script==='Hant'||!locale.script&&['TW','HK','MO'].includes(locale.region)?'zh-Hant':'zh-Hans';
  if(base==='pt')return 'pt-PT';
  if(base==='no'||base==='nb')return 'nb';
  if(Object.hasOwn(LANGUAGES,base))return base;
 }
 return 'en';
}
export function resolveLanguagePreference(saved,requested,browserLanguages){
 const stored=canonicalLanguageCode(saved),hint=canonicalLanguageCode(requested);
 if(stored)return stored;
 if(saved!=='system'&&hint)return hint;
 return matchBrowserLanguage(browserLanguages);
}

// Hosting may lowercase a locale segment. Consume legacy duplicate prefixes too.
export function publicLocaleRoute(pathname){
 const parts=pathname.split('/').filter(Boolean);let prefixCount=0,language=null;
 while(prefixCount<parts.length){const code=canonicalLanguageCode(parts[prefixCount]);if(!code)break;if(language===null)language=code;prefixCount++;}
 const rest=parts.slice(prefixCount);
 return {language:language||'en',pagePath:'/'+rest.join('/')+(rest.length?'/':''),needsRecovery:prefixCount>1||parts[0]?.toLowerCase()==='en'};
}
