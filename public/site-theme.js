(() => {
  const defaults = ['#f4f3ee', '#233a32', '#376b5c', '#ffffff'];
  const legacy = {
    alpine: defaults,
    kobo: ['#fbf3e6', '#1f2a4d', '#f2b544', '#ffffff'],
    coastal: ['#eef5f7', '#16303f', '#1a7a96', '#ffffff'],
    desert: ['#f7f0e5', '#3a2820', '#a55e42', '#fffbf5'],
    midnight: ['#121924', '#eef2f6', '#426984', '#1b2533'],
    forest: ['#edf0e9', '#1f2d22', '#527a4b', '#f8faf6'],
    rose: ['#fff2f6', '#4a293a', '#a83f6b', '#fffafd'],
    sakura: ['#fff2f6', '#4a293a', '#a83f6b', '#fffafd'],
  };
  const valid = colours => Array.isArray(colours) && colours.length === 4 && colours.every(c => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c));
  function read() {
    try {
      const saved = JSON.parse(localStorage.getItem('explore-colours'));
      if (valid(saved)) return saved;
      const previous = legacy[localStorage.getItem('palette')];
      if (previous) { localStorage.setItem('explore-colours', JSON.stringify(previous)); return previous.slice(); }
    } catch {}
    return defaults.slice();
  }
  const system=matchMedia('(prefers-color-scheme: dark)');
  let mode='custom';try{if(localStorage.getItem('explore-theme-mode')==='system')mode='system';}catch{}
  const forced=matchMedia('(forced-colors: active)');
  const nativeAccent=CSS.supports('color','AccentColor')&&CSS.supports('color','AccentColorText');
  const accentName=nativeAccent?'AccentColor':'Highlight',accentText=nativeAccent?'AccentColorText':'HighlightText';
  // Resolve browser/OS system colours for the colour inputs and legacy RGB scrims.
  // Keep CSS keywords in the actual theme so Windows contrast palettes stay live.
  function systemHex(name){const probe=document.createElement('span');probe.style.cssText='display:none;color:'+name;document.head.append(probe);const rgb=getComputedStyle(probe).color.match(/[\d.]+/g);probe.remove();return rgb&&rgb.length>=3?'#'+rgb.slice(0,3).map(n=>Math.round(Number(n)).toString(16).padStart(2,'0')).join(''):'#000000';}
  const systemColours=()=>['Canvas','CanvasText',accentName,'ButtonFace'].map(systemHex);
  function applySystem(){
    document.documentElement.style.colorScheme=system.matches?'dark':'light';
    const values={bg:'Canvas',ink:'CanvasText',text:'CanvasText',accent:accentName,surface:'ButtonFace',muted:'GrayText','soft-text':'CanvasText',deep:'CanvasText','surface-2':'ButtonFace',soft:'ButtonFace',border:'GrayText','on-accent':accentText,glass:'Canvas',scrim:systemHex('Canvas').slice(1).match(/../g).map(n=>parseInt(n,16)).join(', ')};
    for(const [key,value] of Object.entries(values))document.documentElement.style.setProperty('--'+key,value);
  }
  function apply(colours) {
    document.documentElement.dataset.themeMode=mode;
    if(mode==='system'){applySystem();return;}
    if (!valid(colours)) colours = defaults;
    const [bg, ink, accent, surface] = colours;
    const values = {bg, ink, accent, surface, text:ink, muted:ink, 'soft-text':ink, deep:ink, 'surface-2':bg, soft:bg, border:accent+'40', 'on-accent':([1,3,5].map(i=>parseInt(accent.slice(i,i+2),16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4).reduce((v,c,i)=>v+c*[.2126,.7152,.0722][i],0)>.179?'#17223b':'#ffffff'), glass:surface, scrim:[1,3,5].map(i=>parseInt(bg.slice(i,i+2),16)).join(', ')};
    for (const [key,value] of Object.entries(values)) document.documentElement.style.setProperty('--'+key,value);
    document.documentElement.style.colorScheme = parseInt(bg.slice(1,3),16) < 100 ? 'dark' : 'light';
  }
  window.exploreTheme = {read, apply, valid, presets:legacy,systemColours,getMode:()=>mode,setMode:value=>{mode=value==='system'?'system':'custom';}};
  const systemChanged=()=>{if(mode==='system'){apply(read());window.dispatchEvent(new Event('explore:system-theme'));}};
  system.addEventListener('change',systemChanged);forced.addEventListener('change',systemChanged);
  try {document.documentElement.dataset.density=localStorage.getItem('explore-density')||'comfortable';document.documentElement.dataset.reducedMotion=localStorage.getItem('explore-motion')||'false';} catch {}
  apply(read());
})();
