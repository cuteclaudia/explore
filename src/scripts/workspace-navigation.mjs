import {translate} from '../lib/locales/public-copy.mjs';
import {currentAppLanguage,watchAppLanguage} from './app-language.mjs';
const shell=document.querySelector('.workspace-shell'),menu=document.querySelector('#workspace-navigation'),toggle=document.querySelector('#workspace-menu-toggle'),pin=document.querySelector('#workspace-menu-pin'),close=document.querySelector('#workspace-menu-close'),backdrop=document.querySelector('#workspace-menu-backdrop');
if(shell&&menu&&toggle&&pin&&close&&backdrop){
 const owner=document.querySelector('[data-workspace-owner]')?.dataset.workspaceOwner,key='soraspace.navigation.pinned:'+owner,mobile=matchMedia('(max-width:650px)');let pinned=false,open=false;
 try{pinned=localStorage.getItem(key)==='true';}catch{}
 function render(){const expanded=open||pinned&&!mobile.matches;shell.classList.toggle('sidebar-pinned',pinned&&!mobile.matches);menu.classList.toggle('is-open',expanded);pin.setAttribute('aria-pressed',String(pinned));pin.setAttribute('aria-label',pinned?'Unpin workspace menu':'Pin workspace menu');pin.title=pinned?'Unpin workspace menu':'Pin workspace menu';pin.querySelector('span').dataset.i18n=pinned?'Unpin menu':'Pin menu';pin.querySelector('span').textContent=translate(pinned?'Unpin menu':'Pin menu',currentAppLanguage());toggle.setAttribute('aria-expanded',String(expanded));toggle.setAttribute('aria-label',expanded?'Close workspace menu':'Open workspace menu');backdrop.hidden=!(mobile.matches&&expanded);menu.inert=mobile.matches&&!expanded;if(mobile.matches){menu.setAttribute('role','dialog');menu.setAttribute('aria-modal','true');}else{menu.removeAttribute('role');menu.removeAttribute('aria-modal');}}
 function collapse(returnFocus=false){open=false;render();if(returnFocus)toggle.focus();}
 toggle.onclick=()=>{if(pinned&&!mobile.matches){pinned=false;try{localStorage.setItem(key,'false');}catch{}open=false;}else open=!open;render();if(open&&mobile.matches)close.focus();};
 pin.onclick=()=>{pinned=!pinned;open=pinned;try{localStorage.setItem(key,String(pinned));}catch{}render();};
 close.onclick=()=>collapse(true);backdrop.onclick=()=>collapse(true);
 menu.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'&&!mobile.matches){open=true;render();}});
 menu.addEventListener('pointerleave',()=>{if(!pinned&&!menu.contains(document.activeElement))collapse();});
 menu.addEventListener('focusin',()=>{if(!mobile.matches){open=true;render();}});
 menu.addEventListener('focusout',()=>queueMicrotask(()=>{if(!pinned&&!menu.contains(document.activeElement)&&!menu.matches(':hover'))collapse();}));
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&open&&(mobile.matches||!pinned)){event.preventDefault();collapse(true);}if(event.key==='Tab'&&mobile.matches&&open){const focusable=[...menu.querySelectorAll('a,button')].filter(el=>el.getClientRects().length);const first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
 document.addEventListener('click',event=>{if(open&&!pinned&&!menu.contains(event.target)&&!toggle.contains(event.target)&&!backdrop.contains(event.target))collapse();});
 menu.addEventListener('click',event=>{if(mobile.matches&&event.target.closest('a'))collapse();});
 watchAppLanguage(render);mobile.addEventListener('change',()=>{open=false;render();});render();
}
