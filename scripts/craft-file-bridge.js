(() => {
  const blobs=new Map();let channel='',managedSaves=false;const origin=new URL(document.baseURI).origin;
  const originalURL=URL.createObjectURL.bind(URL);URL.createObjectURL=blob=>{const url=originalURL(blob);blobs.set(url,blob);return url;};
  const originalRevoke=URL.revokeObjectURL.bind(URL);URL.revokeObjectURL=url=>{blobs.delete(String(url));return originalRevoke(url);};
  const originalClick=HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click=function(){
    const blob=blobs.get(this.href);const name=this.download;
    if(channel&&blob&&name&&blob.size<=50*1024*1024){const current=channel;blob.arrayBuffer().then(bytes=>parent.postMessage({type:'explore.export',channel:current,name,mime:blob.type,bytes},origin,[bytes])).catch(()=>originalClick.call(this));}
    if(managedSaves&&channel&&blob&&name&&blob.size<=50*1024*1024)return;
    return originalClick.call(this);
  };
  function setLanguage(value){
    let language='en';try{language=Intl.getCanonicalLocales(value||'en')[0]||'en';}catch{}
    globalThis.SoraSpaceUI=Object.freeze({version:1,language,fallbackLanguage:'en'});
    document.documentElement.lang=language;
    dispatchEvent(new CustomEvent('soraspace:languagechange',{detail:globalThis.SoraSpaceUI}));
  }
  setLanguage(new URL(location.href).searchParams.get('lang'));
  let initialized=false,editorReady=false,lastPhase='',pendingOpen=null,openTimer;
  const startedAt=performance.now();
  function progress(phase){lastPhase=phase;if(channel)parent.postMessage({type:'explore.startup',channel,phase,elapsedMs:Math.round(performance.now()-startedAt)},origin);}
  function ready(){
    if(editorReady||!initialized)return;
    const canvas=document.querySelector('canvas');
    if(!canvas||canvas.width<1||canvas.height<1||document.querySelector('[id$="_loading"]'))return;
    editorReady=true;observer.disconnect();progress('ready');deliver();
  }
  const observer=new MutationObserver(ready);
  observer.observe(document,{subtree:true,childList:true,attributes:true,attributeFilter:['width','height']});
  addEventListener('TrunkApplicationStarted',()=>{initialized=true;progress('initializing');ready();},{once:true});
  addEventListener('DOMContentLoaded',ready,{once:true});
  function deliver(){
    if(!editorReady||!pendingOpen)return;
    const data=pendingOpen;pendingOpen=null;clearTimeout(openTimer);
    const canvas=document.querySelector('canvas');if(!canvas)return;
    try{const transfer=new DataTransfer();transfer.items.add(new File([data.bytes],String(data.name||'file').split(/[\\/]/).pop(),{type:String(data.mime||'application/octet-stream')}));
    canvas.dispatchEvent(new DragEvent('drop',{dataTransfer:transfer,bubbles:true,cancelable:true}));
    parent.postMessage({type:'explore.openDelivered',channel},origin);}catch{parent.postMessage({type:'explore.openFailed',channel},origin);}
  }
  parent.postMessage({type:'explore.bridgeReady'},origin);
  const activity=()=>{if(channel)parent.postMessage({type:'explore.activity',channel},origin);};
  addEventListener('pointerdown',activity);addEventListener('keydown',activity);
  addEventListener('message',event=>{
    if(event.source!==parent||event.origin!==origin||!event.data||typeof event.data!=='object')return;
    const data=event.data;
    if(data.type==='explore.configure'&&typeof data.channel==='string'&&data.channel.length===36){if(channel&&channel!==data.channel){pendingOpen=null;clearTimeout(openTimer);}channel=data.channel;managedSaves=data.managedSaves===true;setLanguage(data.language);parent.postMessage({type:'explore.bridgeReady',channel},origin);progress(editorReady?'ready':lastPhase||'loading');return;}
    if(data.type!=='explore.open'||data.channel!==channel||!(data.bytes instanceof ArrayBuffer)||data.bytes.byteLength>50*1024*1024)return;
    pendingOpen=data;clearTimeout(openTimer);deliver();
    if(pendingOpen)openTimer=setTimeout(()=>{pendingOpen=null;parent.postMessage({type:'explore.openFailed',channel},origin);},180000);
  });
})();
