// @netlify/blobs 11.1.6 maps only HTTP 412 to modified:false. The live
// Netlify backend also returns 409 when a conditional write loses its race.
// Normalize that refusal at the Blobs SDK boundary, for conditional PUT only.
// This is not a retry, a successful write, or a global change to fetch/Drive.
export function conditionalBlobFetch({fetcher=fetch}={}){
 return async(input,options={})=>{
  const response=await fetcher(input,options);
  const method=(options.method||(input instanceof Request?input.method:'GET')).toUpperCase();
  const headers=new Headers(options.headers||(input instanceof Request?input.headers:undefined));
  const conditional=method==='PUT'&&(!!headers.get('if-match')||headers.get('if-none-match')==='*');
  if(response.status!==409||!conditional)return response;
  try{await response.body?.cancel();}catch{}
  return new Response(null,{status:412,statusText:'Precondition Failed',headers:response.headers});
 };
}
