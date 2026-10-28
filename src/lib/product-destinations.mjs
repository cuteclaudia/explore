// Public entry links only. Enabling a subdomain requires the separate cutover checklist.
export function productDestinations(env={}){
 function ready(value,origin,fallback){if(!value)return fallback;try{const url=new URL(value);if(url.origin===origin&&url.pathname==='/'&&!url.search&&!url.hash&&!url.username&&!url.password)return url.origin+'/';}catch{}return fallback;}
 return {workspace:ready(env.PUBLIC_KOBO_WORKSPACE_URL,'https://kobo.claudiagilbert.com','/apps'),shop:ready(env.PUBLIC_HOBBYNEST_SHOP_URL,'https://hobbynest.claudiagilbert.com','/hobbynest')};
}
