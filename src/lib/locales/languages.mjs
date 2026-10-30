export const LANGUAGES=Object.freeze({en:{label:'English',tag:'en-AU'},ja:{label:'日本語',tag:'ja'},'zh-Hant':{label:'繁體中文',tag:'zh-Hant'},'zh-Hans':{label:'简体中文',tag:'zh-Hans'},ko:{label:'한국어',tag:'ko'},fr:{label:'Français',tag:'fr'},de:{label:'Deutsch',tag:'de'},'pt-PT':{label:'Português (Portugal)',tag:'pt-PT'}});
export const languageCode=value=>typeof value==='string'&&Object.hasOwn(LANGUAGES,value)?value:'en';
export const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
