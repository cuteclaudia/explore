// Build embeds the registry and pure matching helpers above this function.
export function publicLanguageBootstrap(){
 const key='soraspace.language',url=new URL(location.href),route=publicLocaleRoute(url.pathname),current=route.language,pagePath=route.pagePath;
 let saved=null;try{saved=localStorage.getItem(key);}catch{}
 if(url.searchParams.get('language')==='system'){saved='system';url.searchParams.delete('language');url.searchParams.delete('lang');history.replaceState(history.state,'',url);}
 if(saved!=='system')saved=canonicalLanguageCode(saved);
 const requested=url.searchParams.get('lang')||(current!=='en'?current:null);
 const selected=resolveLanguagePreference(saved,requested,navigator.languages||[navigator.language]);
 if(selected!==current||route.needsRecovery){url.pathname=selected==='en'?pagePath:`/${selected}${pagePath}`;location.replace(url.href);return;}
 const picker=document.querySelector('.language-picker');
 if(picker){
  picker.addEventListener('click',event=>{const link=event.target.closest('a[data-language-choice]');if(!link)return;const value=link.dataset.languageChoice;if(value!=='system'&&!Object.hasOwn(LANGUAGES,value))return;try{localStorage.setItem(key,value);}catch{}});
 }
 // Keep the selected preference when opening the existing account/workspace domain.
 for(const link of document.querySelectorAll('a[href]')){
  const target=new URL(link.href,location.href);if(target.origin!=='https://www.claudiagilbert.com')continue;
  if(saved&&saved!=='system'&&Object.hasOwn(LANGUAGES,saved))target.searchParams.set('lang',saved);
  else if(saved==='system')target.searchParams.delete('lang');
  link.href=target.href;
 }
 window.addEventListener('languagechange',()=>{if(saved&&saved!=='system')return;const code=matchBrowserLanguage(navigator.languages||[navigator.language]);if(code!==current){const next=new URL(location.href);next.pathname=code==='en'?pagePath:`/${code}${pagePath}`;next.searchParams.delete('lang');location.replace(next.href);}});
}
