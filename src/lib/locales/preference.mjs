import {LANGUAGES} from './languages.mjs';
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
 if(typeof saved==='string'&&Object.hasOwn(LANGUAGES,saved))return saved;
 if(saved!=='system'&&typeof requested==='string'&&Object.hasOwn(LANGUAGES,requested))return requested;
 return matchBrowserLanguage(browserLanguages);
}
