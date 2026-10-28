// Planning intent only: none of these choices certifies a provider's data location.
export const STORAGE_REGIONS=Object.freeze({any:'No preference',europe:'Europe',asia:'Asia',australia:'Australia',other:'Elsewhere'});
export const STORAGE_COUNTRIES=Object.freeze({
 europe:{AT:'Austria',BE:'Belgium',DE:'Germany',DK:'Denmark',EE:'Estonia',ES:'Spain',FI:'Finland',FR:'France',GB:'United Kingdom',IE:'Ireland',IT:'Italy',LU:'Luxembourg',NL:'Netherlands',NO:'Norway',PL:'Poland',PT:'Portugal',SE:'Sweden',CH:'Switzerland'},
 asia:{HK:'Hong Kong',ID:'Indonesia',IN:'India',JP:'Japan',KR:'South Korea',MY:'Malaysia',SG:'Singapore',TH:'Thailand',TW:'Taiwan'},
 australia:{AU:'Australia'},other:{CA:'Canada',NZ:'New Zealand',US:'United States',ZA:'South Africa'},any:{},
});
export function locationPreference(input){
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['region','country','scope'].includes(k)))throw Error('Choose a valid storage location preference.');
 const {region,country,scope}=input;
 if(!Object.hasOwn(STORAGE_REGIONS,region)||typeof country!=='string'||country!==''&&!Object.hasOwn(STORAGE_COUNTRIES[region],country)||!['files-at-rest','residency-review'].includes(scope))throw Error('Choose a region, a listed country (or leave it unspecified), and a location requirement.');
 return {region,country,scope};
}
export function locationSummary(input){const p=locationPreference(input);return (p.country?STORAGE_COUNTRIES[p.region][p.country]:STORAGE_REGIONS[p.region])+(p.scope==='residency-review'?' · full residency review needed':' · provider file location preference');}
export function nextcloudFolder(server,username){
 if(typeof server!=='string'||server.length>1500||typeof username!=='string'||!username.trim()||username.trim().length>200||['.','..'].includes(username.trim())||/[\x00-\x1f\x7f:\/\\?#]/.test(username))throw Error('Enter the Nextcloud server address and your account ID (not your password).');
 let url;try{url=new URL(server);}catch{throw Error('Enter a valid HTTPS Nextcloud server address.');}
 const host=url.hostname.toLowerCase();
 if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.port&&url.port!=='443'||host.includes(':')||/^\d+(?:\.\d+){3}$/.test(host)||!host.includes('.')||/(?:^|\.)(?:localhost|local|internal|test|invalid)$/.test(host))throw Error('Use an HTTPS public server address without credentials, a query or a port other than 443.');
 if(/(?:remote\.php|index\.php|\/login(?:\/|$)|%2f|%5c)/i.test(url.pathname))throw Error('Use the server’s base address here, including its installation folder. If you already have a full WebDAV URL, enter it directly in Connection details.');
 if(!url.pathname.endsWith('/'))url.pathname+='/';url.pathname+='remote.php/dav/files/'+encodeURIComponent(username.trim())+'/';return url.href;
}
