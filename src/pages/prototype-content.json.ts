import {normalizeTags} from '../lib/tags';
import { getEssays, getReports } from '../lib/site';
export const prerender = true;
export async function GET() {
  const entry = (item: Awaited<ReturnType<typeof getEssays>>[number], prefix: string) => ({
    title: item.data.title,
    summary: item.data.summary,
    tags: normalizeTags(item.data.tags),
    date: item.data.date.toISOString(),
    href: `/${prefix}/${item.id}`,
  });
  return new Response(JSON.stringify({
    essays: (await getEssays()).map(item => entry(item, 'chinaseries')),
    reports: (await getReports()).map(item => ({title:item.data.title, summary:item.data.summary, tags:normalizeTags(item.data.tags), date:item.data.date.toISOString(), href:`/dailycyberreport/${item.id}`})),
  }), {headers: {'Content-Type':'application/json; charset=utf-8'}});
}
