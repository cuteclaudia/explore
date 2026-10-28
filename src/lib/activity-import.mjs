// Local route-only readers. Never upload files or extract health/identity fields.
export const MAX_ACTIVITY_BYTES=5*1024*1024;
const MAX_POINTS=20000;
function collector(){const segments=[];let segment=[],count=0;return {gap(){if(segment.length>1)segments.push(segment);segment=[];},point(lon,lat,height){if(++count>MAX_POINTS)throw Error('Use a route with no more than 20,000 track points.');if(!Number.isFinite(lon)||!Number.isFinite(lat)||Math.abs(lon)>180||Math.abs(lat)>90)throw Error('The route contains an invalid coordinate.');if(height!==undefined&&(!Number.isFinite(height)||height< -12000||height>100000))throw Error('The route contains an invalid elevation.');segment.push([lon,lat,height]);},finish(){this.gap();if(!segments.length)throw Error('This file has no usable GPS route. At least two connected GPS points are needed; indoor workouts may have none.');return segments;}};}
function number(text){if(text==null||!text.trim())return undefined;const n=Number(text);if(!Number.isFinite(n))throw Error('The route contains an invalid number.');return n;}
function child(el,name){return Array.from(el.children).find(x=>x.localName===name);}
function text(el,name){return child(el,name)?.textContent;}
export function parseActivityXML(input,format,Parser=globalThis.DOMParser){
 if(!['GPX','TCX'].includes(format))throw Error('Unsupported route format.');
 if(typeof input!=='string'||input.length>MAX_ACTIVITY_BYTES)throw Error('Use a route file no larger than 5 MiB.');
 if(/<!DOCTYPE|<!ENTITY/i.test(input))throw Error('This route includes unsupported document declarations.');
 const xml=new Parser().parseFromString(input,'application/xml');
 if(xml.getElementsByTagNameNS('*','parsererror').length||xml.documentElement.localName!==(format==='GPX'?'gpx':'TrainingCenterDatabase'))throw Error('Choose a valid '+format+' file.');
 const output=collector();let name='Imported route';
 if(format==='GPX'){
  let groups=Array.from(xml.getElementsByTagNameNS('*','trkseg'));if(!groups.length)groups=Array.from(xml.getElementsByTagNameNS('*','rte'));
  for(const group of groups){output.gap();for(const p of Array.from(group.children).filter(x=>['trkpt','rtept'].includes(x.localName))){const lon=number(p.getAttribute('lon')),lat=number(p.getAttribute('lat'));if(lon===undefined||lat===undefined)throw Error('The route is missing a coordinate.');output.point(lon,lat,number(text(p,'ele')));}}
  name=xml.getElementsByTagNameNS('*','name')[0]?.textContent||name;
 }else{
  // Tracks, including lap boundaries, stay separate. A missing GPS position is a gap.
  for(const group of xml.getElementsByTagNameNS('*','Track')){output.gap();for(const p of Array.from(group.children).filter(x=>x.localName==='Trackpoint')){const pos=child(p,'Position');if(!pos){output.gap();continue;}const lat=number(text(pos,'LatitudeDegrees')),lon=number(text(pos,'LongitudeDegrees'));if(lon===undefined||lat===undefined){output.gap();continue;}output.point(lon,lat,number(text(p,'AltitudeMeters')));}}
  name=xml.getElementsByTagNameNS('*','Course')[0]?.getElementsByTagNameNS('*','Name')[0]?.textContent||'Imported TCX activity';
 }
 return {segments:output.finish(),name:name.slice(0,200)};
}
// FIT CRC-16/ARC, polynomial 0xa001, initial zero (FIT protocol).
export function fitCRC(bytes){let crc=0;for(const byte of bytes){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc&1)?(crc>>>1)^0xa001:crc>>>1;}return crc;}
export function parseFIT(input){
 const bytes=input instanceof Uint8Array?input:new Uint8Array(input);if(bytes.byteLength>MAX_ACTIVITY_BYTES)throw Error('Use a route file no larger than 5 MiB.');
 if(bytes.length<14)throw Error('The FIT file is truncated.');const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),header=bytes[0];
 if(![12,14].includes(header)||String.fromCharCode(...bytes.subarray(8,12))!=='.FIT'||bytes[1]>>4>2)throw Error('Unsupported FIT header or protocol.');
 const end=header+view.getUint32(4,true);if(end+2!==bytes.length)throw Error('The FIT file is truncated or has unexpected trailing data.');
 if(header===14&&view.getUint16(12,true)!==0&&fitCRC(bytes.subarray(0,12))!==view.getUint16(12,true))throw Error('The FIT header checksum does not match.');
 if(fitCRC(bytes.subarray(0,end))!==view.getUint16(end,true))throw Error('The FIT file checksum does not match. Export the activity again.');
 const defs=new Map(),out=collector();let offset=header,messages=0;
 function take(size){if(offset+size>end)throw Error('The FIT message is truncated.');const start=offset;offset+=size;return start;}
 function scalar(field,start,little){const type=field.type&31;const size={0:1,1:1,2:1,3:2,4:2,5:4,6:4,10:1,11:2,12:4,13:1}[type];if(!size||field.size!==size)return undefined;let n;if(size===1)n=type===1?view.getInt8(start):view.getUint8(start);else if(size===2)n=type===3?view.getInt16(start,little):view.getUint16(start,little);else n=type===5?view.getInt32(start,little):view.getUint32(start,little);const invalid=[10,11,12].includes(type)?0:[1,3,5].includes(type)?2**(size*8-1)-1:2**(size*8)-1;return n===invalid?undefined:n;}
 while(offset<end){if(++messages>200000)throw Error('This FIT file has too many messages for a browser preview.');const h=bytes[take(1)],compressed=!!(h&128),local=compressed?(h>>5)&3:h&15;
  if(!compressed&&(h&64)){
   if(h&16)throw Error('Unsupported FIT definition header.');const start=take(5),architecture=bytes[start+1];if(architecture>1)throw Error('Invalid FIT byte order.');const little=architecture===0,global=view.getUint16(start+2,little),fields=[];for(let i=0;i<bytes[start+4];i++){const f=take(3);fields.push({id:bytes[f],size:bytes[f+1],type:bytes[f+2]});}
   let developerSize=0;if(h&32){const count=bytes[take(1)];for(let i=0;i<count;i++){const f=take(3);developerSize+=bytes[f+1];}}
   if(!fields.length&&!developerSize)throw Error('Empty FIT message definition.');defs.set(local,{global,fields,little,developerSize});continue;
  }
  if(!compressed&&(h&48))throw Error('Unsupported FIT data header.');const def=defs.get(local);if(!def)throw Error('The FIT file uses an undefined message.');const values=new Map();
  for(const field of def.fields){if(compressed&&field.id===253){if(field.size!==4||(field.type&31)!==6)throw Error('Invalid FIT timestamp definition.');continue;}const expected=def.global===20?({0:5,1:5,2:4,78:6}[field.id]):def.global===21&&[0,1].includes(field.id)?0:undefined;if(expected!==undefined&&(field.type&31)!==expected)throw Error('Unsupported FIT route field encoding.');const start=take(field.size);if(def.global===20||def.global===21)values.set(field.id,scalar(field,start,def.little));}take(def.developerSize);
  if(def.global===21&&values.get(0)===0&&[1,4,8,9].includes(values.get(1)))out.gap();
  if(def.global===20){const lat=values.get(0),lon=values.get(1);if(lat===undefined||lon===undefined){out.gap();continue;}const altitude=values.get(78)??values.get(2);out.point(lon*180/2147483648,lat*180/2147483648,altitude===undefined?undefined:altitude/5-500);}
 }
 return {segments:out.finish(),name:'Imported FIT activity'};
}
export async function readActivityFile(file){
 if(file.size>MAX_ACTIVITY_BYTES)throw Error('Use a route file no larger than 5 MiB.');const extension=file.name.split('.').pop()?.toLowerCase();if(!['gpx','tcx','fit'].includes(extension))throw Error('Choose a GPX, TCX or FIT route file (unzip downloads first).');
 const format=extension.toUpperCase(),parsed=format==='FIT'?parseFIT(await file.arrayBuffer()):parseActivityXML(await file.text(),format);if(format==='FIT')parsed.name=file.name.slice(0,-4).slice(0,200)||parsed.name;return {...parsed,format};
}
