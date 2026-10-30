// Locale preference only: no document content, identity or storage credentials.
import {canonicalLanguageCode} from '../lib/locales/languages.mjs';
import {resolveLanguagePreference} from '../lib/locales/preference.mjs';
export function currentAppLanguage(){
 const applied=canonicalLanguageCode(document.documentElement.dataset.selectedLanguage);if(applied)return applied;
 let saved=null;try{saved=localStorage.getItem('soraspace.language');}catch{}
 return resolveLanguagePreference(saved,new URLSearchParams(location.search).get('lang'),navigator.languages||[navigator.language]);
}
export function appLanguageURL(value){const url=new URL(value,location.href);url.searchParams.set('lang',currentAppLanguage());return url;}
export function watchAppLanguage(callback){const listener=()=>callback(currentAppLanguage());window.addEventListener('soraspace:languagechange',listener);return ()=>window.removeEventListener('soraspace:languagechange',listener);}
