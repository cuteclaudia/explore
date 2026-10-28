// Original adapter; provider terms and primary-source evidence are documented in
// docs/explore/OUTDOOR-DATA-SOURCES-2026-10-28.md. No bulk/offline tile downloads.
export const SPECIALIST_TRAILS=[
 {key:'hiking',label:'Waymarked Trails hiking',source:'reference-hiking',url:'https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png',attribution:'<a href="https://hiking.waymarkedtrails.org/">Waymarked Trails</a> · <a href="https://creativecommons.org/licenses/by-sa/3.0/de/">CC BY-SA 3.0 DE</a> · <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors, ODbL</a>'},
 {key:'mtb',label:'Waymarked Trails MTB',source:'reference-mtb',url:'https://tile.waymarkedtrails.org/mtb/{z}/{x}/{y}.png',attribution:'<a href="https://mtb.waymarkedtrails.org/">Waymarked Trails MTB</a> · <a href="https://creativecommons.org/licenses/by-sa/3.0/de/">CC BY-SA 3.0 DE</a> · <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors, ODbL</a>'},
 {key:'skiing',label:'OpenSnowMap pistes',source:'reference-skiing',url:'https://tiles.opensnowmap.org/pistes/{z}/{x}/{y}.png',attribution:'<a href="https://www.opensnowmap.org/">OpenSnowMap</a> · <a href="https://creativecommons.org/licenses/by-sa/">CC BY-SA</a> · <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors, ODbL</a>'}
];
export function specialistTrailLayers(map,onStatus=()=>{}){
 let state={},failures=new Set();
 function report(){const active=SPECIALIST_TRAILS.filter(p=>state[p.key]);onStatus(active.length?(active.some(p=>failures.has(p.source))?'A specialist trail map could not load. Detail requests and other layers may still work.':'Reference maps: '+active.map(p=>p.label).join(' · ')+'. Coverage varies; these do not report live access.'):'');}
 function apply(next){state=next;for(const provider of SPECIALIST_TRAILS){const enabled=!!state[provider.key],id=provider.source;if(enabled&&!map.getSource(id)){map.addSource(id,{type:'raster',tiles:[provider.url],tileSize:256,minzoom:6,maxzoom:18,attribution:provider.attribution});map.addLayer({id,type:'raster',source:id,minzoom:6,paint:{'raster-opacity':.85},layout:{visibility:'visible'}},map.getLayer('outdoor-routes')?'outdoor-routes':map.getLayer('private-track-line')?'private-track-line':undefined);}else if(map.getLayer(id))map.setLayoutProperty(id,'visibility',enabled?'visible':'none');}report();}
 map.on('error',event=>{if(SPECIALIST_TRAILS.some(p=>p.source===event.sourceId)){failures.add(event.sourceId);report();}});
 return {apply};
}
