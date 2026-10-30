const key='soraspace.tester-invitation';
export function invitationToken(){
 const token=new URLSearchParams(location.hash.slice(1)).get('trial-invite');
 if(token&&/^[0-9a-f]{64}$/.test(token)){try{sessionStorage.setItem(key,token);}catch{}history.replaceState(history.state,'',location.pathname+location.search);return token;}
 try{const saved=sessionStorage.getItem(key);return saved&&/^[0-9a-f]{64}$/.test(saved)?saved:null;}catch{return null;}
}
export function clearInvitation(){try{sessionStorage.removeItem(key);}catch{}}
