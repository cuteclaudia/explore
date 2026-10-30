// Public marketing only: illustrative UI, no app engine or launch permission.
export const TOOL_PREVIEWS=Object.freeze([
 {id:'fumi',purpose:'Documents & references',description:'Document layout, references and PDF export workflows.',features:['Page layout','Documents & references','PDF export'],kind:'document'},
 {id:'tsuzuri',purpose:'PDFs & annotations',description:'Read, organise and annotate PDF documents.',features:['PDF reading','Page organisation','Annotations & forms'],kind:'pdf'},
 {id:'hikari',purpose:'Photo development',description:'Develop photographs with exposure and colour tools.',features:['Photo development','Exposure & colour','Photo library'],kind:'photo'},
 {id:'irodori',purpose:'Images & layers',description:'Layers, masks, selections and image composition.',features:['Layers & masks','Selections & adjustments','Image composition'],kind:'image'},
 {id:'tayori',purpose:'Mail & calendar',description:'Mail & calendar',features:['Mail & calendar','Contacts & tasks','Desktop'],kind:'mail',desktop:true},
 {id:'goban',purpose:'Spreadsheets & data',description:'Spreadsheets & data',features:['Spreadsheets & data','Formulas & charts','CSV & workbooks'],kind:'sheet',desktop:true},
].map(Object.freeze));
export const previewPath=id=>'/tools/'+id+'/';
export function mockupMarkup(kind){
 const bodies={
  document:'<header>File Home Insert Review</header><div class="mini-paper"><strong>Research in progress</strong><i></i><i></i><i></i><i></i><i></i><i></i></div>',
  pdf:'<header>Pages Annotate Forms</header><div class="mini-pdf-pages"><span>1</span><span>2</span><span>3</span></div>',
  photo:'<header>Library Light Colour</header><div class="mini-photo"></div>',
  image:'<header>Image Layers Brushes</header><div class="mini-layers"><div class="mini-art"></div><div><span>Artwork</span><span>Background</span></div></div>',
  mail:'<header>Mail & calendar</header><div class="preview-mail"><div><strong>Mail</strong><i></i><i></i><i></i><i></i></div><div><strong>Calendar</strong><i></i><i></i><i></i></div></div>',
  sheet:'<header>Spreadsheets & data</header><div class="preview-sheet" aria-hidden="true">'+Array.from({length:40},(_,i)=>'<span>'+([0,1,2,3,4].includes(i)?['','A','B','C','D'][i]:'')+'</span>').join('')+'</div>',
 };
 if(!Object.hasOwn(bodies,kind))throw Error('Unknown public mock-up');
 return '<div class="app-mini" role="img" aria-label="Illustrative preview, not live account data or a product screenshot">'+bodies[kind]+'</div>';
}
export function renderToolPreview(tool,app,escape){
 const signup='https://www.claudiagilbert.com/studio/signup?package=workspace'+(tool.desktop?'':'&app='+tool.id);
 return `<main id="main" class="tool-preview-page"><a class="preview-back" href="/#app-previews"><span aria-hidden="true">←</span> Apps</a><section class="preview-hero"><div><img class="preview-brand-icon" src="/icons/${tool.id}.svg" alt="" width="60" height="60"/><p class="eyebrow">${tool.desktop?'Desktop · In development':'Public app preview'}</p><div class="preview-name"><h1>${escape(app.name)}</h1><small lang="ja">${escape(app.legacyName)} · ${escape(app.japaneseName)}</small></div><h2>${escape(tool.purpose)}</h2><p class="lede">${escape(tool.description)}</p><div class="actions"><a class="button" href="${escape(signup)}" target="_blank" rel="noopener">${tool.desktop?'Sign Up':'Create trial account'}</a><a href="/#pricing">Pricing</a></div><p class="development-note">${tool.desktop?'Desktop · In development':'Trial access · Email verification and approval required.'}</p></div><figure>${mockupMarkup(tool.kind)}<figcaption>Illustrative preview, not live account data or a product screenshot</figcaption></figure></section><section class="preview-features"><h2>A closer look at the tools</h2><div>${tool.features.map(text=>'<article><h3>'+escape(text)+'</h3></article>').join('')}</div><p class="section-note">Illustrations show the type of workflow, not exact app layouts or feature parity. Availability and file compatibility depend on the accepted app build.</p>${tool.id==='fumi'?'<p class="section-note">Zotero integration is documented in the desktop Docs engine. Browser integration requires separate work and is not currently offered.</p>':''}</section><section class="preview-next"><div><h2>Your workspace and site tools.</h2><p>${tool.desktop?'Desktop downloads depend on release availability.':'Create an account and request the services you want to try. App access follows email verification and approval.'}</p></div><a class="button" href="${escape(signup)}" target="_blank" rel="noopener">Sign Up</a></section></main>`;
}
