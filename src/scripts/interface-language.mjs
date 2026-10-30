// Explicitly marked product UI only. Never translate user content or app frames.
import {LANGUAGES,languageCode} from '../lib/locales/languages.mjs';
import {translate} from '../lib/locales/public-copy.mjs';
const key='soraspace.language',params=new URLSearchParams(location.search),supplied=params.get('lang');
let saved='en';try{saved=localStorage.getItem(key)||'en';}catch{}
let selected=languageCode(supplied&&Object.hasOwn(LANGUAGES,supplied)?supplied:saved);
function apply(root=document){
 const nodes=[...(root instanceof Element&&root.matches('[data-i18n],[data-i18n-placeholder]')?[root]:[]),...root.querySelectorAll('[data-i18n],[data-i18n-placeholder]')];
 for(const node of nodes){if(node.closest('[data-user-content],iframe,[contenteditable],textarea'))continue;
  if(node.dataset.i18n){const value=translate(node.dataset.i18n,selected);if(node.textContent!==value)node.textContent=value;}
  if(node.dataset.i18nPlaceholder)node.setAttribute('placeholder',translate(node.dataset.i18nPlaceholder,selected));
 }
 for(const picker of document.querySelectorAll('[data-ui-language]'))picker.value=selected;
 document.documentElement.lang=LANGUAGES[selected].tag;
}
function save(){try{localStorage.setItem(key,selected);}catch{}}
save();apply();
document.addEventListener('change',event=>{if(!(event.target instanceof HTMLSelectElement)||!event.target.matches('[data-ui-language]'))return;selected=languageCode(event.target.value);save();const url=new URL(location.href);url.searchParams.set('lang',selected);history.replaceState(history.state,'',url);apply();});
// Locale is UI preference only; preserve all existing routing/next/auth parameters.
document.addEventListener('click',event=>{const anchor=event.target instanceof Element?event.target.closest('a[href]'):null;if(!anchor||anchor.hasAttribute('download'))return;const url=new URL(anchor.href,location.href);if(url.origin!==location.origin||!/^\/(apps|studio|settings|kobo)(\/|$)/.test(url.pathname)||url.hash)return;url.searchParams.set('lang',selected);anchor.href=url.href;},true);
new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node instanceof Element)apply(node);}).observe(document.body,{childList:true,subtree:true});
