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
  function apply(colours) {
    if (!valid(colours)) colours = defaults;
    const [bg, ink, accent, surface] = colours;
    const values = {bg, ink, accent, surface, text:ink, muted:ink, 'soft-text':ink, deep:ink, 'surface-2':bg, soft:bg, border:accent+'40', 'on-accent':([1,3,5].map(i=>parseInt(accent.slice(i,i+2),16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4).reduce((v,c,i)=>v+c*[.2126,.7152,.0722][i],0)>.179?'#17223b':'#ffffff'), glass:surface, scrim:[1,3,5].map(i=>parseInt(bg.slice(i,i+2),16)).join(', ')};
    for (const [key,value] of Object.entries(values)) document.documentElement.style.setProperty('--'+key,value);
    document.documentElement.style.colorScheme = parseInt(bg.slice(1,3),16) < 100 ? 'dark' : 'light';
  }
  window.exploreTheme = {read, apply, valid, presets:legacy};
  try {document.documentElement.dataset.density=localStorage.getItem('explore-density')||'comfortable';document.documentElement.dataset.reducedMotion=localStorage.getItem('explore-motion')||'false';} catch {}
  apply(read());
})();
