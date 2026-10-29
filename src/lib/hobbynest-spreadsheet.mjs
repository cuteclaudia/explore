import {Unzip,UnzipInflate,zipSync,strToU8,strFromU8} from 'fflate';
export const IMPORT_FIELDS=[
 ['sku','SKU',true,'Unique product reference. Repeat it only for different colours of the same new product.'],['name','Product name',true,'Product title.'],['kind','Product type',true,'physical or digital'],['price','Price AUD',true,'Selling price in AUD, e.g. 24.95.'],
 ['description','Description',false,'Plain text.'],['collections','Collections',false,'Existing collection names separated by |.'],['colour','Colour',false,'One physical colour per row; blank means Standard.'],['stock','Opening stock',false,'Whole finished units, new products only; requires opening-stock option.'],['filamentAvailable','Filament available',false,'yes/no; defaults no.'],['allowBackorder','Print to order',false,'yes/no; defaults no.'],
 ['dispatchMinDays','Ready dispatch min days',false,'Business days; defaults 1.'],['dispatchMaxDays','Ready dispatch max days',false,'Business days; defaults 2.'],['printMinDays','Print dispatch min days',false,'Business days; defaults 3.'],['printMaxDays','Print dispatch max days',false,'Business days; defaults 5.'],
 ['weightGrams','Packed weight g',false,'Grams including packaging. Complete all four measurements or leave all blank.'],['lengthMm','Packed length mm',false,'Millimetres.'],['widthMm','Packed width mm',false,'Millimetres.'],['heightMm','Packed height mm',false,'Millimetres.'],['licence','Digital licence',false,'Required for digital designs.'],
];
const headerKey=v=>String(v??'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function autoMap(headers){return Object.fromEntries(IMPORT_FIELDS.map(([key,label])=>[key,headers.findIndex(h=>[headerKey(key),headerKey(label)].includes(headerKey(h)))]));}
export function mapSheet(rows,mapping){
 if(!Array.isArray(rows)||rows.length<2)throw Error('Add column headers and at least one product row.');
 const indexes=Object.values(mapping).filter(i=>Number.isInteger(i)&&i>=0);if(new Set(indexes).size!==indexes.length)throw Error('Map each spreadsheet column to only one field.');
 for(const [key,label,required] of IMPORT_FIELDS)if(required&&!(Number.isInteger(mapping[key])&&mapping[key]>=0))throw Error('Map the required field: '+label+'.');
 const result=[];for(let i=1;i<rows.length;i++){if(!rows[i].some(v=>v!==null&&v!==undefined&&String(v).trim()!==''))continue;const fields={};for(const [key] of IMPORT_FIELDS)if(mapping[key]>=0){const value=rows[i][mapping[key]];if(value instanceof Date)throw Error(`Row ${i+1}: use text/numbers rather than date-formatted product cells.`);fields[key]=value===null||value===undefined?'':String(value);}result.push({row:i+1,fields});}
 if(!result.length||result.length>300)throw Error('Import 1–300 non-empty rows at a time.');return result;
}
export function parseCSV(text){
 if(text.length>5*1024*1024)throw Error('Use a file under 5 MiB.');text=text.replace(/^\uFEFF/,'');const rows=[];let row=[],cell='',quoted=false,closed=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}else cell+=c;}
 else if(c==='"'){if(cell||closed)throw Error('Invalid CSV quoting.');quoted=true;}else if(c===','||c==='\n'||c==='\r'){row.push(cell);cell='';closed=false;if(c!==','){if(c==='\r'&&text[i+1]==='\n')i++;rows.push(row);row=[];}}
 else{if(closed&&c.trim())throw Error('Invalid text after a quoted CSV cell.');if(!closed)cell+=c;}
 if(row.length>80||rows.length>301||cell.length>10000)throw Error('Limit the sheet to 300 data rows, 80 columns and 10,000 characters per cell.');}
 if(quoted)throw Error('The CSV has an unfinished quoted cell.');if(cell||row.length){row.push(cell);rows.push(row);}return rows;
}
function inspectXlsx(bytes){
 let failure,total=0,declared=0,count=0,rowCount=0,cells=0;const zip=new Unzip(file=>{
  if(++count>200||file.originalSize>8*1024*1024||(declared+=file.originalSize)>16*1024*1024||/vbaProject|externalLinks|\.bin$/i.test(file.name)){failure=Error('Use a plain .xlsx workbook under 16 MiB expanded, without macros or external workbook links.');zip.terminate();return;}
  const chunks=[];file.ondata=(error,data,final)=>{if(failure)return;if(error){failure=Error('The workbook is damaged or unsupported.');return;}total+=data.length;if(total>16*1024*1024){failure=Error('The expanded workbook is too large.');zip.terminate();return;}if(/\.xml$/i.test(file.name))chunks.push(data);if(final&&chunks.length){const size=chunks.reduce((sum,c)=>sum+c.length,0),out=new Uint8Array(size);let offset=0;for(const c of chunks){out.set(c,offset);offset+=c.length;}const xml=strFromU8(out);if(/<(?:\w+:)?f[\s/>]/.test(xml)){failure=Error('Replace formulas with pasted values before importing.');zip.terminate();return;}rowCount+=(xml.match(/<(?:\w+:)?row\b/g)||[]).length;cells+=(xml.match(/<(?:\w+:)?c\b/g)||[]).length;if(rowCount>1500||cells>40000){failure=Error('Use a smaller workbook (up to 300 data rows per selected sheet).');zip.terminate();}}};file.start();
 });zip.register(UnzipInflate);try{for(let i=0;i<bytes.length&&!failure;i+=16384)zip.push(bytes.slice(i,i+16384),i+16384>=bytes.length);}catch{failure||=Error('The workbook is damaged or unsupported.');}if(failure)throw failure;
}
export async function readImportFile(file){
 if(file.size>5*1024*1024)throw Error('Use an .xlsx or CSV file under 5 MiB.');
 if(/\.csv$/i.test(file.name))return [{sheet:'CSV',data:parseCSV(await file.text())}];
 if(!/\.xlsx$/i.test(file.name))throw Error('Use .xlsx or CSV. Save older .xls workbooks as .xlsx first.');
 const bytes=new Uint8Array(await file.arrayBuffer());inspectXlsx(bytes);const {default:read}=await import('read-excel-file/browser');const sheets=await read(new Blob([bytes]));
 if(!Array.isArray(sheets)||sheets.length>10)throw Error('Use a workbook with up to 10 sheets.');for(const sheet of sheets){if(sheet.data.length>301||sheet.data.some(row=>row.length>80||row.some(v=>String(v??'').length>10000)))throw Error('Use up to 300 data rows, 80 columns and 10,000 characters per cell.');}return sheets;
}
const xml=v=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function importTemplate(){
 const sheet=values=>`<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${values.map((row,i)=>`<row r="${i+1}">${row.map((v,j)=>`<c r="${String.fromCharCode(65+j)}${i+1}" t="inlineStr"><is><t xml:space="preserve">${xml(v)}</t></is></c>`).join('')}</row>`).join('')}</sheetData></worksheet>`;
 return zipSync(Object.fromEntries(Object.entries({
 '[Content_Types].xml':'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
 '_rels/.rels':'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
 'xl/workbook.xml':'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Products" sheetId="1" r:id="rId1"/><sheet name="Instructions" sheetId="2" r:id="rId2"/></sheets></workbook>',
 'xl/_rels/workbook.xml.rels':'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/></Relationships>',
 'xl/worksheets/sheet1.xml':sheet([IMPORT_FIELDS.map(f=>f[1])]),'xl/worksheets/sheet2.xml':sheet([['HobbyNest import guide'],['Fill Products with values, not formulas. Required: SKU, Product name, Product type, Price AUD. Format SKU cells as text to keep leading zeros.'],['New products are imported as private drafts. Existing inventory and published listings are never overwritten.'],...IMPORT_FIELDS.map(([,label,required,help])=>[label,required?'Required':'Optional',help])]),
 }).map(([path,value])=>[path,strToU8(value)])),{level:6});
}
