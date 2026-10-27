import {Mark,Extension,mergeAttributes} from '@tiptap/core';
import {FONT_SIZES,FONT_FAMILIES,ALIGNMENTS,LINE_HEIGHTS} from '../lib/text-formatting.mjs';
export const TextStyle=Mark.create({name:'textStyle',addAttributes(){return {
 fontSize:{default:null,parseHTML:el=>FONT_SIZES.includes(el.style.fontSize)?el.style.fontSize:null,renderHTML:a=>a.fontSize?{style:'font-size:'+a.fontSize}:{}},
 fontFamily:{default:null,parseHTML:el=>FONT_FAMILIES.includes(el.style.fontFamily.replaceAll('"',''))?el.style.fontFamily.replaceAll('"',''):null,renderHTML:a=>a.fontFamily?{style:'font-family:'+a.fontFamily}:{}},
 color:{default:null,parseHTML:el=>/^#[0-9a-f]{6}$/i.test(el.style.color)?el.style.color:null,renderHTML:a=>a.color?{style:'color:'+a.color}:{}}};},parseHTML(){return [{tag:'span[style]'}];},renderHTML({HTMLAttributes}){return ['span',mergeAttributes(HTMLAttributes),0];}});
export const ParagraphStyle=Extension.create({name:'paragraphStyle',addGlobalAttributes(){return [{types:['paragraph','heading'],attributes:{textAlign:{default:null,parseHTML:el=>ALIGNMENTS.includes(el.style.textAlign)?el.style.textAlign:null,renderHTML:a=>a.textAlign?{style:'text-align:'+a.textAlign}:{}},lineHeight:{default:null,parseHTML:el=>LINE_HEIGHTS.includes(el.style.lineHeight)?el.style.lineHeight:null,renderHTML:a=>a.lineHeight?{style:'line-height:'+a.lineHeight}:{}}}}];}});
export function formatControls(editor,dirty=()=>{}){
 const select=(id,fn)=>{const el=document.getElementById(id) as HTMLSelectElement;if(el)el.onchange=()=>{fn(el.value);dirty();};};
 select('font-size',v=>editor.chain().focus().setMark('textStyle',{fontSize:v||null}).run());
 select('font-family',v=>editor.chain().focus().setMark('textStyle',{fontFamily:v||null}).run());
 select('text-align',v=>{editor.chain().focus().updateAttributes('paragraph',{textAlign:v}).updateAttributes('heading',{textAlign:v}).run();});
 select('line-height',v=>{editor.chain().focus().updateAttributes('paragraph',{lineHeight:v||null}).updateAttributes('heading',{lineHeight:v||null}).run();});
 const sync=()=>{const attrs=editor.getAttributes('textStyle');for(const [id,key] of [['font-size','fontSize'],['font-family','fontFamily']]){const el=document.getElementById(id) as HTMLSelectElement;if(el)el.value=attrs[key]||'';}const p=editor.isActive('heading')?editor.getAttributes('heading'):editor.getAttributes('paragraph');for(const [id,key] of [['text-align','textAlign'],['line-height','lineHeight']]){const el=document.getElementById(id) as HTMLSelectElement;if(el)el.value=p[key]||(id==='text-align'?'left':'');}};editor.on('selectionUpdate',sync);editor.on('transaction',sync);sync();
}
