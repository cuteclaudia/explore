// Relief and contours share the site's existing Mapzen Terrarium elevation feed.
export const TERRAIN_URL='https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';
export const TERRAIN_EXAGGERATION=1.3;
// Put raster imagery/routes below relief, and keep text/vector routes above it.
export function rasterOverlayAnchor(map){return map.getStyle?.().layers.find(layer=>layer.id==='terrain-shading'||layer.id==='elevation-contours'||layer.type==='symbol'||layer.id==='outdoor-routes'||layer.id==='private-track-line')?.id;}
export function attachTerrainView(map,maplibre,DemSource){
 const dem=new DemSource({url:TERRAIN_URL,encoding:'terrarium',maxzoom:15,worker:true,cacheSize:32,timeoutMs:10000});dem.setupMaplibre(maplibre);
 map.addSource('terrain',{type:'raster-dem',tiles:[TERRAIN_URL],encoding:'terrarium',tileSize:256,maxzoom:15,attribution:'Terrain © <a href="/map-credits#terrain" target="_blank" rel="noopener">Mapzen and data contributors</a>'});
 map.addSource('terrain-shade',{type:'raster-dem',tiles:[TERRAIN_URL],encoding:'terrarium',tileSize:256,maxzoom:15});
 const before=map.getStyle().layers.find(layer=>layer.type==='symbol')?.id;
 map.addLayer({id:'terrain-shading',type:'hillshade',source:'terrain-shade',layout:{visibility:'none'},paint:{'hillshade-method':'multidirectional','hillshade-illumination-direction':[315,270,225],'hillshade-illumination-altitude':[35,45,55],'hillshade-illumination-anchor':'map','hillshade-exaggeration':0.65,'hillshade-shadow-color':'#35433c','hillshade-highlight-color':'#ffffff','hillshade-accent-color':'#6d7b70'}},before);
 map.addSource('elevation-contours',{type:'vector',tiles:[dem.contourProtocolUrl({thresholds:{10:[200,1000],12:[100,500],13:[50,200],15:[20,100]},contourLayer:'contours',elevationKey:'ele',levelKey:'level'})],maxzoom:15});
 map.addLayer({id:'elevation-contours',type:'line',source:'elevation-contours','source-layer':'contours',minzoom:10,layout:{visibility:'none'},paint:{'line-color':'#796b56','line-width':['case',['>', ['get','level'],0],1.1,0.5],'line-opacity':['interpolate',['linear'],['zoom'],10,0.3,13,0.6,15,0.7]}},before);
 if(map.getStyle().glyphs)map.addLayer({id:'elevation-contour-labels',type:'symbol',source:'elevation-contours','source-layer':'contours',minzoom:12,filter:['>', ['get','level'],0],layout:{visibility:'none','symbol-placement':'line','symbol-spacing':180,'text-field':['concat',['to-string',['get','ele']],' m'],'text-font':['Noto Sans Regular'],'text-size':12,'text-max-angle':30},paint:{'text-color':'#655641','text-halo-color':'#ffffff','text-halo-width':1.4}},before);
 return {setMode(mode){map.setTerrain(mode==='3d'?{source:'terrain',exaggeration:TERRAIN_EXAGGERATION}:null);}};
}
