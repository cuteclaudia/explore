// Explicitly marked product UI only. Never translate user content or app frames.
import {LANGUAGES,languageCode,canonicalLanguageCode} from '../lib/locales/languages.mjs';
import {resolveLanguagePreference} from '../lib/locales/preference.mjs';
import {translate} from '../lib/locales/public-copy.mjs';
const key='soraspace.language',params=new URLSearchParams(location.search),supplied=params.get('lang');
let saved=null;try{saved=localStorage.getItem(key);}catch{}
if(saved!=='system'&&!Object.hasOwn(LANGUAGES,saved||''))saved=null;
let lastPublished=null;
let selected=resolveLanguagePreference(saved,supplied,navigator.languages||[navigator.language]);
function apply(root=document){
 const nodes=[...(root instanceof Element&&root.matches('[data-i18n],[data-i18n-placeholder]')?[root]:[]),...root.querySelectorAll('[data-i18n],[data-i18n-placeholder]')];
 for(const node of nodes){if(node.closest('[data-user-content],iframe,[contenteditable],textarea'))continue;
  if(node.dataset.i18n){const value=translate(node.dataset.i18n,selected);const values=JSON.parse(node.dataset.i18nValues||'{}');const formatted=value.replace(/\{([a-z]+)\}/gi,(token,key)=>Object.hasOwn(values,key)?String(values[key]):token);if(node.textContent!==formatted)node.textContent=formatted;}
  if(node.dataset.i18nPlaceholder)node.setAttribute('placeholder',translate(node.dataset.i18nPlaceholder,selected));
 }
 for(const picker of document.querySelectorAll('[data-ui-language]'))picker.value=saved==='system'||!saved&&!Object.hasOwn(LANGUAGES,supplied||'')?'system':selected;
 document.documentElement.lang=LANGUAGES[selected].tag;document.documentElement.dataset.selectedLanguage=selected;
 if(lastPublished!==selected){lastPublished=selected;window.dispatchEvent(new CustomEvent('soraspace:languagechange',{detail:{language:selected,fallbackLanguage:'en'}}));}
}
function save(){try{localStorage.setItem(key,saved);}catch{}}
apply();
document.addEventListener('change',event=>{
 if(!(event.target instanceof HTMLSelectElement)||!event.target.matches('[data-ui-language]'))return;
 saved=event.target.value==='system'?'system':languageCode(event.target.value);save();
 selected=resolveLanguagePreference(saved,null,navigator.languages||[navigator.language]);
 const url=new URL(location.href);if(saved==='system')url.searchParams.delete('lang');else url.searchParams.set('lang',selected);
 history.replaceState(history.state,'',url);apply();
});
window.addEventListener('languagechange',()=>{if(saved&&saved!=='system')return;selected=resolveLanguagePreference(saved,null,navigator.languages||[navigator.language]);apply();});
window.addEventListener('storage',event=>{if(event.key!==key&&event.key!==null)return;try{saved=localStorage.getItem(key);}catch{saved=null;}if(saved!=='system'&&!Object.hasOwn(LANGUAGES,saved||''))saved=null;selected=resolveLanguagePreference(saved,null,navigator.languages||[navigator.language]);apply();});
// Locale is UI preference only; preserve all existing routing/next/auth parameters.
document.addEventListener('click',event=>{const anchor=event.target instanceof Element?event.target.closest('a[href]'):null;if(!anchor||anchor.hasAttribute('download'))return;const url=new URL(anchor.href,location.href);if(url.origin!==location.origin||!/^\/(apps|studio|settings|kobo)(\/|$)/.test(url.pathname)||url.hash)return;url.searchParams.set('lang',selected);anchor.href=url.href;},true);
new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node instanceof Element)apply(node);}).observe(document.body,{childList:true,subtree:true});

// Another trusted app tab can request the UI locale without reloading a document.
window.addEventListener('message',event=>{if(event.origin!==location.origin||event.data?.type!=='soraspace:language-preference')return;const language=canonicalLanguageCode(event.data.language);if(!language)return;selected=language;const url=new URL(location.href);url.searchParams.set('lang',language);history.replaceState(history.state,'',url);apply();});
