import {AccessError} from './access.mjs';
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const text=(value,max=180)=>typeof value==='string'?value.slice(0,max):'';
const point=p=>p&&Number.isFinite(p.lng)&&Number.isFinite(p.lat)&&Math.abs(p.lng)<=180&&Math.abs(p.lat)<=85?[p.lng,p.lat]:null;
const within=(p,b)=>p&&p[0]>=b[0]&&p[0]<=b[2]&&p[1]>=b[1]&&p[1]<=b[3];
export async function openBetaClimbs(bounds,discipline,{fetcher,readJSON}){
 if(!['rock','ice','all'].includes(discipline))throw new AccessError(400,'Choose rock or ice climbing.');
 async function query(query,variables){const data=await readJSON(await fetcher('https://api.openbeta.io',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json','User-Agent':'ExploreByClaudia/1.0 (+https://explorebyclaudia.netlify.app/contact)'},body:JSON.stringify({query,variables}),signal:AbortSignal.timeout(20000)}));if(data.errors?.length||!data.data)throw new AccessError(502,'The climbing source could not complete this request. Try a smaller area later.');return data.data;}
 const found=await query('query ExploreCrags($bbox: [Float]) { cragsWithin(filter: {bbox: $bbox, zoom: 13}) { uuid area_name metadata { lat lng } } }',{bbox:bounds});
 if(!Array.isArray(found.cragsWithin))throw new AccessError(502,'The climbing source returned invalid area data.');
 const seen=new Set(),candidates=found.cragsWithin.filter(area=>{if(!uuid.test(area?.uuid)||seen.has(area.uuid)||!within(point(area.metadata),bounds))return false;seen.add(area.uuid);return true;}),areas=candidates.slice(0,8);
 if(!areas.length)return {type:'FeatureCollection',features:[],areasSampled:0,truncated:false,source:'OpenBeta',licence:'CC0'};
 // Bounded aliases and canonical UUID variables; no user GraphQL or source URL.
 const declarations=areas.map((_,i)=>'$id'+i+': ID').join(','),fields=areas.map((_,i)=>'a'+i+': area(uuid: $id'+i+') { uuid area_name metadata { lat lng } climbs { uuid name length grades { yds ewbank french uiaa vscale wi } type { trad sport bouldering ice mixed snow alpine } metadata { lat lng } } }').join(' '),variables=Object.fromEntries(areas.map((area,i)=>['id'+i,area.uuid]));
 const data=await query('query ExploreClimbs('+declarations+') { '+fields+' }',variables),features=[],climbsSeen=new Set();let truncated=candidates.length>8;
 for(let i=0;i<areas.length;i++){
  const area=data['a'+i];if(!area||area.uuid!==areas[i].uuid||!Array.isArray(area.climbs))throw new AccessError(502,'The climbing source returned incomplete route data.');
  for(const climb of area.climbs){if(features.length>=300){truncated=true;break;}if(!uuid.test(climb?.uuid)||climbsSeen.has(climb.uuid)||!text(climb.name))continue;climbsSeen.add(climb.uuid);const isIce=climb.type?.ice===true||climb.type?.mixed===true||climb.type?.snow===true;if(discipline==='ice'&&!isIce||discipline==='rock'&&isIce)continue;
   const exact=point(climb.metadata),position=exact||point(area.metadata);if(!within(position,bounds))continue;
   const grades=Object.entries(climb.grades||{}).filter(([,v])=>typeof v==='string'&&v).slice(0,6).map(([system,value])=>({system:{yds:'YDS',ewbank:'Ewbank',french:'French',uiaa:'UIAA',vscale:'V-scale',wi:'Water ice'}[system]||system,value:text(value,40)}));
   const types=['trad','sport','bouldering','ice','mixed','snow','alpine'].filter(kind=>climb.type?.[kind]===true);
   features.push({type:'Feature',geometry:{type:'Point',coordinates:position},properties:{id:'openbeta/'+climb.uuid,kind:isIce?'iceClimbing':'climbRoutes',name:text(climb.name),category:types.join(', ')||'Climbing route',difficulty:grades.map(g=>g.system+': '+g.value).join(' · '),gradeSystem:'Source grades',source:'OpenBeta',licence:'CC0',area:text(area.area_name),locationKind:exact?'route point':'area location',length:Number.isSafeInteger(climb.length)&&climb.length>0&&climb.length<=20000?climb.length:null,access:''}});
  }
 }
 return {type:'FeatureCollection',features,areasSampled:areas.length,truncated,source:'OpenBeta',licence:'CC0'};
}
