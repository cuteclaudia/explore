import {getStore} from '@netlify/blobs';
import {writingCategories,writingCategoryFor} from '../../server/writing-categories.mjs';
import {contentFeatures} from '../../server/content-features.mjs';
import {normalizeTags} from '../lib/tags';
import {siteContent,contentHref} from '../lib/studio-content';
import {featureContent} from '../lib/feature-content';
export const prerender=false;
export async function GET(){
 const registry=await writingCategories(getStore({name:'studio-writing-categories',consistency:'strong'})).read();
 const published=await siteContent().publicList();
 const candidates=await featureContent(published);
 const selected=await contentFeatures(getStore({name:'studio-content-features',consistency:'strong'}),async()=>candidates).resolve(candidates);
 const entry=item=>({key:item.key,collection:item.collection,category:writingCategoryFor(item,registry),title:item.title,summary:item.summary,tags:normalizeTags(item.tags),date:new Date(item.date+'T00:00:00Z').toISOString(),href:item.collection==='library'?'/library/'+item.slug:contentHref(item.collection,item.slug)});
 const group=collection=>published.filter(x=>x.collection===collection).map(entry);
 return Response.json({categories:registry.categories,essays:group('essays'),reports:group('cyber'),osint:group('osint'),journal:group('journal'),features:Object.fromEntries(Object.entries(selected).map(([slot,item])=>[slot,item?entry(item):null])),galleries:published.filter(x=>x.collection==='photography').map(x=>({title:x.title,href:contentHref(x.collection,x.slug),photos:x.photos}))},{headers:{'Cache-Control':'no-store'}});
}
