// Startup signals come from the existing authenticated, channel-bound file bridge.
const banner=document.getElementById('app-startup'),text=document.getElementById('app-startup-text');
if(banner&&text){
 const name=banner.dataset.appName||'The editor';let ready=false,dismissed=false;
 const timer=setTimeout(()=>{if(!ready&&!dismissed)text.textContent=name+' is still starting. The first launch can take longer while the editor downloads and initialises. Keep this tab open.';},20000);
 function close(){clearTimeout(timer);banner.hidden=true;}
 document.getElementById('app-startup-dismiss')?.addEventListener('click',()=>{dismissed=true;close();});
 window.addEventListener('soraspace:startup',event=>{if(event.detail?.phase==='ready'){ready=true;close();}else if(!ready&&!dismissed&&event.detail?.phase==='initializing')text.textContent='Preparing '+name+'…';});
 window.addEventListener('soraspace:access-ended',close);
 window.addEventListener('pagehide',close,{once:true});
}
