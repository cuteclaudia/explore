import {rasterOverlayAnchor} from './terrain-view.mjs';
// Fixed MapTiler raster TileJSON endpoint. The browser key is public and must be
// domain-restricted by its owner; never put a secret/server token in this option.
export function satelliteMap(map,key,onState=()=>{}){
 const source='explore-satellite',layer='explore-satellite',configured=typeof key==='string'&&key.trim().length>0;
 let active=false;
 function set(enabled){if(enabled&&!configured)return false;try{if(enabled&&!map.getSource(source)){map.addSource(source,{type:'raster',url:'https://api.maptiler.com/tiles/satellite-v2/tiles.json?key='+encodeURIComponent(key.trim()),tileSize:256});const before=rasterOverlayAnchor(map);map.addLayer({id:layer,type:'raster',source,paint:{'raster-opacity':1},layout:{visibility:'visible'}},before);}else if(map.getLayer(layer))map.setLayoutProperty(layer,'visibility',enabled?'visible':'none');active=!!enabled;onState(active,active?'Satellite imagery — date and resolution vary.':'');return true;}catch{active=false;onState(false,'Satellite imagery could not load. The standard map remains available.');return false;}}
 map.on('error',event=>{if(event.sourceId===source){if(map.getLayer(layer))map.setLayoutProperty(layer,'visibility','none');active=false;onState(false,'Satellite imagery could not load. Showing the standard map.');}});
 return {configured,set,get active(){return active;}};
}
