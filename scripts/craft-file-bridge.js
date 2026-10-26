(() => {
  const blobs=new Map();let channel='';const origin=new URL(document.baseURI).origin;
  const originalURL=URL.createObjectURL.bind(URL);URL.createObjectURL=blob=>{const url=originalURL(blob);blobs.set(url,blob);return url;};
  const originalRevoke=URL.revokeObjectURL.bind(URL);URL.revokeObjectURL=url=>{blobs.delete(String(url));return originalRevoke(url);};
  const originalClick=HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click=function(){
    const blob=blobs.get(this.href);const name=this.download;
    if(channel&&blob&&name&&blob.size<=50*1024*1024){const current=channel;blob.arrayBuffer().then(bytes=>parent.postMessage({type:'explore.export',channel:current,name,mime:blob.type,bytes},origin,[bytes])).catch(()=>{});}
    return originalClick.call(this);
  };
  parent.postMessage({type:'explore.bridgeReady'},origin);
  const activity=()=>{if(channel)parent.postMessage({type:'explore.activity',channel},origin);};
  addEventListener('pointerdown',activity);addEventListener('keydown',activity);
  addEventListener('message',event=>{
    if(event.source!==parent||event.origin!==origin||!event.data||typeof event.data!=='object')return;
    const data=event.data;
    if(data.type==='explore.configure'&&typeof data.channel==='string'&&data.channel.length===36){channel=data.channel;parent.postMessage({type:'explore.bridgeReady',channel},origin);return;}
    if(data.type!=='explore.open'||data.channel!==channel||!(data.bytes instanceof ArrayBuffer)||data.bytes.byteLength>50*1024*1024)return;
    let attempts=0;const deliver=()=>{const canvas=document.querySelector('canvas');if(!canvas||(canvas.width===300&&canvas.height===150)){if(attempts++<900)setTimeout(deliver,50);else parent.postMessage({type:'explore.openFailed',channel},origin);return;}
    const transfer=new DataTransfer();transfer.items.add(new File([data.bytes],String(data.name||'file').split(/[\\/]/).pop(),{type:String(data.mime||'application/octet-stream')}));
    canvas.dispatchEvent(new DragEvent('drop',{dataTransfer:transfer,bubbles:true,cancelable:true}));};deliver();
  });
})();
