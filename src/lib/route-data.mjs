const radians=n=>n*Math.PI/180;
export function distanceMetres(a,b){const lat=radians(b[1]-a[1]),lon=radians(b[0]-a[0]),v=Math.sin(lat/2)**2+Math.cos(radians(a[1]))*Math.cos(radians(b[1]))*Math.sin(lon/2)**2;return 6371000*2*Math.atan2(Math.sqrt(v),Math.sqrt(Math.max(0,1-v)));}
export function routeSummary(segments){
 let distance=0,ascent=0,elevationCount=0;const elevations=[],all=[];
 for(const segment of segments){let previous;for(const p of segment){if(!Array.isArray(p)||!Number.isFinite(p[0])||!Number.isFinite(p[1])||Math.abs(p[0])>180||Math.abs(p[1])>90)throw Error('The GPX contains an invalid coordinate.');if(previous)distance+=distanceMetres(previous,p);if(Number.isFinite(p[2])){elevationCount++;elevations.push({distance,height:p[2]});if(previous&&Number.isFinite(previous[2]))ascent+=Math.max(0,p[2]-previous[2]);}all.push(p);previous=p;}}
 if(all.length<2)throw Error('The GPX needs at least two track points.');if(all.length>20000)throw Error('Use a GPX with no more than 20,000 track points.');
 return {distance,ascent,elevations,elevationComplete:elevationCount===all.length,bounds:[[Math.min(...all.map(p=>p[0])),Math.min(...all.map(p=>p[1]))],[Math.max(...all.map(p=>p[0])),Math.max(...all.map(p=>p[1]))]]};
}
export function elevationPath(summary){if(summary.elevations.length<2)return '';const heights=summary.elevations.map(p=>p.height),low=Math.min(...heights),range=Math.max(1,Math.max(...heights)-low);return summary.elevations.map((p,i)=>(i?'L':'M')+(10+p.distance/Math.max(1,summary.distance)*580).toFixed(1)+','+(95-(p.height-low)/range*80).toFixed(1)).join(' ');}
