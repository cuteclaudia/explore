// Only for the trusted, script-free marketing template; never pass customer HTML.
import {LANGUAGES,escapeHTML} from './languages.mjs';
import {translate} from './public-copy.mjs';
export const localePath=code=>code==='en'?'/':`/${code}/`;
const decode=value=>value.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>');
export function localizeLanding(html,code){
 if(!Object.hasOwn(LANGUAGES,code))throw Error('Unsupported language');
 const t=value=>escapeHTML(translate(decode(value),code));
 let page=html.replace(/>([^<>]+)</g,(_,raw)=>{const text=raw.trim();return '>'+raw.slice(0,raw.indexOf(text))+t(text)+raw.slice(raw.indexOf(text)+text.length)+'<';});
 page=page.replace(/(aria-label|title|content)="([^"]*)"/g,(_,attr,value)=>`${attr}="${t(attr==='aria-label'&&value.startsWith('Illustration of')?'Illustrative preview, not live account data or a product screenshot':value)}"`);
 const title='SoraSpace — '+translate('Space for everything you create.',code).replace(/\.$/,'');
 page=page.replace(/<title>.*?<\/title>/,`<title>${escapeHTML(title)}</title>`).replace(/(<meta property="og:title" content=")[^"]*/,`$1${escapeHTML(title)}`);
 const url='https://www.soraspace.studio'+localePath(code);
 page=page.replace('lang="en-AU"',`lang="${LANGUAGES[code].tag}"`).replace(/(<link rel="canonical" href=")[^"]*/,`$1${url}`).replace(/(<meta property="og:url" content=")[^"]*/,`$1${url}`);
 page=page.replace('</head>',Object.entries(LANGUAGES).map(([key,lang])=>`<link rel="alternate" hreflang="${lang.tag}" href="https://www.soraspace.studio${localePath(key)}">`).join('')+'<link rel="alternate" hreflang="x-default" href="https://www.soraspace.studio/">\n</head>');
 const picker=`<details class="language-picker"><summary>${escapeHTML(translate('Language',code))}: <span lang="${LANGUAGES[code].tag}">${LANGUAGES[code].label}</span></summary><nav aria-label="${escapeHTML(translate('Language',code))}">${Object.entries(LANGUAGES).map(([key,lang])=>`<a href="${localePath(key)}" hreflang="${lang.tag}" lang="${lang.tag}"${key===code?' aria-current="true"':''}>${lang.label}</a>`).join('')}</nav></details>`;
 page=page.replace(/href="\/"/g,`href="${localePath(code)}"`);
 page=page.replace('<nav aria-label=',picker+'<nav aria-label=');
 if(code!=='en')page=page.replace(/href="(https:\/\/www\.claudiagilbert\.com[^\"]*)"/g,(_,href)=>{const link=new URL(decode(href));link.searchParams.set('lang',code);return `href="${escapeHTML(link.href)}"`;});
 return page;
}
