// Approximate total-speaker order (L1 + L2), not preference or live rankings.
// Chinese scripts stay together; regional/script choices share the language rank.
export const LANGUAGES=Object.freeze({
 en:{label:'English',tag:'en-AU'},
 'zh-Hans':{label:'简体中文',tag:'zh-Hans'},
 'zh-Hant':{label:'繁體中文',tag:'zh-Hant'},
 fr:{label:'Français',tag:'fr'},
 'pt-PT':{label:'Português (Portugal)',tag:'pt-PT'},
 id:{label:'Bahasa Indonesia',tag:'id'},
 de:{label:'Deutsch',tag:'de'},
 ja:{label:'日本語',tag:'ja'},
 ko:{label:'한국어',tag:'ko'},
 it:{label:'Italiano',tag:'it'},
 th:{label:'ไทย',tag:'th'},
 uk:{label:'Українська',tag:'uk'},
 nl:{label:'Nederlands',tag:'nl'},
 sv:{label:'Svenska',tag:'sv'},
 fi:{label:'Suomi',tag:'fi'},
 nb:{label:'Norsk (bokmål)',tag:'nb'},
});
export const languageCode=value=>typeof value==='string'&&Object.hasOwn(LANGUAGES,value)?value:'en';
export const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
