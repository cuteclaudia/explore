import {getStore} from '@netlify/blobs';
import {writingCategories,writingCategoryFor} from '../../server/writing-categories.mjs';
import {normalizeTags} from '../lib/tags';
import { getEssays, getReports, getOsintBriefs, getGalleries } from '../lib/site';
export const prerender = false;
export async function GET() {
  const registry=await writingCategories(getStore({name:'studio-writing-categories',consistency:'strong'})).read();
  const entry = (item: Awaited<ReturnType<typeof getEssays>>[number], prefix: string) => ({
    category: writingCategoryFor(item.data,registry),
    title: item.data.title,
    summary: item.data.summary,
    tags: normalizeTags(item.data.tags),
    date: item.data.date.toISOString(),
    href: `/${prefix}/${item.id}`,
  });
  return new Response(JSON.stringify({
    categories: registry.categories,
    galleries: (await getGalleries()).map(x=>({title:x.data.title,href:'/photography/'+x.id,photos:x.data.photos})),
    essays: (await getEssays()).map(item => entry(item, 'chinaseries')),
    osint: (await getOsintBriefs()).map(item => entry(item, 'osint-brief')),
    reports: (await getReports()).map(item => entry(item, 'dailycyberreport')),
  }), {headers: {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
}
