import test from 'node:test';
import assert from 'node:assert/strict';
import {readSheet} from 'read-excel-file/node';
import {autoMap,mapSheet,parseCSV,importTemplate} from '../src/lib/hobbynest-spreadsheet.mjs';
test('downloadable Excel template is readable with expected product headers and instructions',async()=>{
 const bytes=importTemplate();const rows=await readSheet(Buffer.from(bytes));assert.equal(rows[0][0],'SKU');assert.equal(rows[0][3],'Price AUD');assert.equal(rows.length,1);const instructions=await readSheet(Buffer.from(bytes),'Instructions');assert.match(instructions[1][0],/values, not formulas/);
});
test('CSV quoting, Unicode, multiline descriptions and manual/reordered mappings preserve data',()=>{
 const rows=parseCSV('\uFEFFRef,Title,Amount,Format,Notes\r\nA001,"Blue, planter",24.95,physical,"Line one\nLine two \"\"quoted\"\""\r\n');
 const mapping={sku:0,name:1,price:2,kind:3,description:4},mapped=mapSheet(rows,mapping);assert.equal(mapped[0].row,2);assert.equal(mapped[0].fields.description,'Line one\nLine two "quoted"');assert.equal(mapped[0].fields.sku,'A001');assert.equal(mapped[0].fields.price,'24.95');
 assert.equal(autoMap(['Product name','SKU','Price AUD','Product type']).sku,1);assert.equal(autoMap(['Product name','SKU','Price AUD','Product type']).kind,3);
 assert.throws(()=>mapSheet(rows,{...mapping,price:1}),/only one field/);assert.throws(()=>parseCSV('a,b\n"unfinished'),/unfinished/);assert.throws(()=>mapSheet([rows[0],[new Date(),'',1,'physical']],mapping),/date-formatted/);
});
