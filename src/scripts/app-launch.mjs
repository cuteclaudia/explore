import {canonicalLanguageCode} from '../lib/locales/languages.mjs';
// Browser tabs, one named browsing context per app. No popup sizing/features.
if(!window[Symbol.for('soraspace.app-launch')]){
 window[Symbol.for('soraspace.app-launch')]=true;
 const appKey=url=>url.pathname.split('/').filter(Boolean)[1]||'workspace';
 const tabName=url=>'soraspace-app-'+appKey(url);
 if(location.pathname.startsWith('/apps/')&&!['files'].includes(appKey(new URL(location.href))))window.name=tabName(new URL(location.href));
 document.addEventListener('click',event=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const link=event.target.closest?.('a[data-app-launch]');if(!link)return;const url=new URL(link.href,location.href);
  if(url.origin!==location.origin||!url.pathname.startsWith('/apps'))return;
  if(location.pathname===url.pathname){event.preventDefault();if(url.searchParams.has('file')&&url.href!==location.href)location.assign(url.href);return;}
  let app;try{
   app=window.open('',tabName(url));if(!app)return;
   app.opener=null;
   // Selecting an already-open app preserves its document; explicit file links navigate it.
   if(app.location.pathname!==url.pathname||(url.searchParams.has('file')&&app.location.search!==url.search))app.location.assign(url.href);
   const language=canonicalLanguageCode(url.searchParams.get('lang'));if(language)app.postMessage({type:'soraspace:language-preference',language},location.origin);
   app.focus();event.preventDefault();
  }catch{try{if(app){app.opener=null;app.location=url.href;event.preventDefault();}}catch{}}
 });
}
