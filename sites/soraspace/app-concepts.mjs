import {APP_PRESENTATION} from '../../src/lib/app-presentation.mjs';
import {UPCOMING_APPS} from '../../src/lib/soraspace-upcoming-apps.mjs';
export const CONCEPT_DETAILS=Object.freeze({
 akari:['Slide layouts and themes','Speaker notes and presenting','Reviewed export and document links'],
 sen:['Vector paths and shapes','Layers, colour and typography','Illustration export workflows'],
 hanga:['Multi-page layouts and master pages','Typography and image placement','Print and digital publication output'],
 hinagata:['Interface layouts and reusable components','Screen flows and design handoff','Responsive design concepts'],
 kage:['Video timelines and clip organisation','Titles, transitions and audio tracks','Reviewed video export workflows'],
 hibiki:['Audio tracks and waveforms','Recording, trimming and mixing concepts','Reviewed music and audio export'],
 mai:['Keyframes and animated layers','Timing, motion and visual effects','Animation preview and export'],
 takumi:['Precise geometry and object organisation','Dimensioned views and model inspection','Reviewed design import and export']
});
function canvas(id){
 if(id==='hibiki')return '<div class="vision-wave">'+Array.from({length:24},(_,i)=>'<i></i>').join('')+'</div>';
 if(['kage','mai'].includes(id))return '<div class="vision-video"><span>Scene preview</span></div><div class="vision-timeline"><i>Opening</i><i>Scene 02</i><i>Music</i></div>';
 if(id==='akari')return '<div class="vision-slide"><small>FIELD NOTES</small><strong>A new perspective</strong><span>One idea, clearly presented.</span></div><div class="vision-timeline"><i>1</i><i>2</i><i>3</i></div>';
 if(id==='hanga')return '<div class="vision-layout"><i></i><i></i><i></i><i></i></div>';
 if(id==='hinagata')return '<div class="vision-ui"><i>Home</i><i>Gallery</i><i>Contact</i></div>';
 if(id==='takumi')return '<div class="vision-cad"><span>80 mm</span><i></i><small>Front · Top · Perspective</small></div>';
 return '<div class="vision-vector"><i></i><i></i><span>Paths · Shapes · Layers</span></div>';
}
export function allAppConcepts(escape){return `<section class="vision-all-apps"><h2>Meet the apps in your future workspace</h2><p>Explore the existing six app previews, then the wider creative roadmap. The smaller workspaces below are static design studies, not working tools. Final app names and supported features will follow testing.</p><div class="vision-app-links">${Object.entries(APP_PRESENTATION).map(([id,app])=>`<a href="/tools/${id}/"><strong>${escape(app.name)}</strong><span>${escape(app.purpose)}</span><small>${['tayori','goban'].includes(id)?'In development':'Preview'} →</small></a>`).join('')}</div><div class="vision-app-concepts">${UPCOMING_APPS.map(app=>`<article><p class="vision-eyebrow">SoraSpace · ${escape(app.kind)} <span class="vision-status">Planned concept</span></p><h3>${escape(app.kind)}</h3><p class="vision-muted">Working name: ${escape(app.name)}</p><figure class="vision-mock"><figcaption>${escape(app.kind)} · illustrative workspace</figcaption><div class="vision-toolbar"><strong>Untitled project</strong><span>File · Edit · View</span></div><div class="vision-concept-canvas" role="img" aria-label="Illustrative ${escape(app.kind.toLowerCase())} workspace">${canvas(app.id)}</div></figure><ul>${CONCEPT_DETAILS[app.id].map(text=>'<li>'+escape(text)+'</li>').join('')}</ul></article>`).join('')}</div></section>`;}
