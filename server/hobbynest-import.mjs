import {createHash} from 'node:crypto';
import {IMPORT_FIELDS} from '../src/lib/hobbynest-spreadsheet.mjs';
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
export function validateImportRequest(input){
 if(!input||Array.isArray(input)||Object.keys(input).some(k=>!['expectedAccount','etag','importId','rows','options','previewHash'].includes(k)))throw Error('Invalid import request.');
 if(typeof input.importId!=='string'||!/^[a-f0-9-]{36}$/.test(input.importId))throw Error('Start a new spreadsheet preview.');
 if(!input.options||Object.keys(input.options).some(k=>!['updateExisting','openingStock'].includes(k))||typeof input.options.updateExisting!=='boolean'||typeof input.options.openingStock!=='boolean')throw Error('Choose the import options.');
 if(!Array.isArray(input.rows)||!input.rows.length||input.rows.length>300)throw Error('Import 1–300 rows at a time.');
 for(const row of input.rows){if(!row||Object.keys(row).some(k=>!['row','fields'].includes(k))||!Number.isInteger(row.row)||row.row<2||row.row>10000||!row.fields||Array.isArray(row.fields)||Object.keys(row.fields).some(k=>!IMPORT_FIELDS.some(([key])=>key===k))||Object.values(row.fields).some(v=>typeof v!=='string'||v.length>10000))throw Error('The mapped rows are invalid or too large.');}
 return digest({expectedAccount:input.expectedAccount,etag:input.etag,importId:input.importId,rows:input.rows,options:input.options});
}
function whole(raw,label,fallback){if(raw===undefined||raw.trim()==='')return fallback;if(!/^\d+$/.test(raw.trim()))throw Error(label+' must be a whole non-negative number.');const n=Number(raw);if(!Number.isSafeInteger(n))throw Error(label+' is too large.');return n;}
function yesno(raw,label,fallback){if(raw===undefined||raw.trim()==='')return fallback;const s=raw.trim().toLowerCase();if(['yes','true','1'].includes(s))return true;if(['no','false','0'].includes(s))return false;throw Error(label+' must be yes or no.');}
function money(raw){const v=raw.trim().replace(/^(?:AUD\s*|A\$\s*|\$\s*)/i,'');if(!/^\d+(?:\.\d{1,2})?$/.test(v))throw Error('Price AUD needs an amount such as 24.95, without thousands separators.');const [whole,fraction='']=v.split('.');return Number(whole)*100+Number(fraction.padEnd(2,'0'));}
export function planImport(data,input,cleanProduct){
 const hash=validateImportRequest(input),groups=new Map(),errors=[],warnings=[],summary=[];
 for(const entry of input.rows){try{
  const f=entry.fields;for(const [key,label,required] of IMPORT_FIELDS)if(required&&!f[key]?.trim())throw Error(label+' is required.');
  const sku=f.sku.trim(),identity=sku.toLowerCase(),existing=data.products.find(p=>p.draft.sku.toLowerCase()===identity||p.published?.sku.toLowerCase()===identity),previous=groups.get(identity),old=previous?.draft||existing?.draft||{};
  const type=f.kind.trim().toLowerCase(),kind=['physical','printed','print'].includes(type)?'physical':['digital','stl','download'].includes(type)?'digital':null;if(!kind)throw Error('Product type must be physical or digital.');
  const string=(key,fallback='')=>f[key]?.trim()||fallback;
  let collectionIds=old.collectionIds||[];if(f.collections?.trim())collectionIds=f.collections.split('|').map(name=>{const c=data.collections.find(c=>c.name.toLowerCase()===name.trim().toLowerCase());if(!c)throw Error('Create the collection “'+name.trim()+'” before importing.');return c.id;});
  const productId=existing?.id||'import-'+digest([input.importId,identity]).slice(0,24);
  const raw={id:productId,sku,name:f.name.trim(),kind,priceCents:money(f.price),description:string('description',old.description),licence:string('licence',old.licence),collectionIds,allowBackorder:yesno(f.allowBackorder,'Print to order',old.allowBackorder??false),...Object.fromEntries(['dispatchMinDays','dispatchMaxDays','printMinDays','printMaxDays','weightGrams','lengthMm','widthMm','heightMm'].map(key=>[key,whole(f[key],IMPORT_FIELDS.find(([k])=>k===key)[1],old[key]??({dispatchMinDays:1,dispatchMaxDays:2,printMinDays:3,printMaxDays:5}[key]||0))]))};
  const draft=cleanProduct(raw,data.collections);
  if(existing&&data.products.some(p=>p.id!==existing.id&&[p.draft.sku,p.published?.sku].some(value=>value?.toLowerCase()===identity)))throw Error('This SKU is already used by another product.');
  if(previous&&JSON.stringify(previous.draft)!==JSON.stringify(draft))throw Error('Rows for this SKU disagree on product details. Repeat the same name, type and price for each colour.');
  const stock=whole(f.stock,'Opening stock',0);if(stock>100000)throw Error('Opening stock cannot exceed 100,000 units per colour.');
  const colourName=string('colour','Standard');if(colourName.length>60)throw Error('Colour names need 60 characters or fewer.');
  if(kind==='digital'&&(stock||f.colour?.trim()||f.filamentAvailable?.trim()))throw Error('Digital products must not have colour, opening stock or filament fields.');
  const filamentAvailable=yesno(f.filamentAvailable,'Filament available',false),group=previous||{id:productId,sku,draft,existing,colours:[],rows:[]};
  if(kind==='physical'&&group.colours.some(c=>c.name.toLowerCase()===colourName.toLowerCase())||kind==='digital'&&previous)throw Error('Duplicate product/colour row. Combine stock counts into one row.');
  if(kind==='physical')group.colours.push({id:'c-'+digest([input.importId,identity,colourName.toLowerCase()]).slice(0,24),name:colourName,enabled:true,filamentAvailable,stock:input.options.openingStock&&!existing?stock:0});
  if(existing&&existing.draft.kind!==kind&&(existing.published||existing.colours.some(c=>c.stock)))throw Error('Unpublish and remove stock before changing this product type.');
  group.rows.push(entry.row);groups.set(identity,group);
  if(stock&&(!input.options.openingStock||existing))warnings.push({row:entry.row,message:'Opening stock ignored. Only new products can receive opening stock, with the option enabled.'});
 }catch(error){errors.push({row:entry.row,message:error.message});}}
 const products=[...groups.values()];for(const group of products){if(group.colours.length>30)errors.push({row:group.rows[0],message:'Use up to 30 colours per product.'});const action=group.existing?(input.options.updateExisting?'Update draft':'Skip existing SKU'):'Create draft';summary.push({row:group.rows[0],sku:group.sku,name:group.draft.name,kind:group.draft.kind,priceCents:group.draft.priceCents,colours:group.colours.map(c=>c.name),openingStock:group.colours.reduce((sum,c)=>sum+c.stock,0),action});if(group.existing&&input.options.updateExisting)warnings.push({row:group.rows[0],message:'Updates draft details only. Existing colours, stock, photos, costing and published listing are kept.'});}
 if(data.products.length+products.filter(p=>!p.existing).length>150)errors.push({row:null,message:'The catalogue would exceed its 150-product limit.'});
 return {hash,products,summary,errors,warnings,counts:{create:products.filter(p=>!p.existing).length,update:products.filter(p=>p.existing&&input.options.updateExisting).length,skip:products.filter(p=>p.existing&&!input.options.updateExisting).length}};
}
