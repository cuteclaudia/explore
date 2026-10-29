// A trusted click opens a separate app window; native _blank links remain the fallback.
if(!window[Symbol.for('soraspace.app-launch')]){
 window[Symbol.for('soraspace.app-launch')]=true;
 document.addEventListener('click',event=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const link=event.target.closest?.('a[data-app-launch]');if(!link)return;const url=new URL(link.href,location.href);
  if(url.origin!==location.origin||!url.pathname.startsWith('/apps/'))return;
  let app;try{app=window.open('about:blank','_blank',`popup=yes,width=${Math.max(640,Math.min(1440,(screen.availWidth||1280)-64))},height=${Math.max(480,Math.min(1100,(screen.availHeight||900)-80))}`);if(!app)return;app.opener=null;app.location.replace(url.href);event.preventDefault();}catch{try{app?.close();}catch{}}
 });
}
