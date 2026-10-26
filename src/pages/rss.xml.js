export const prerender=false;
import rss from '@astrojs/rss';
import { getEssays, getReports, getJournal } from '../lib/site';

export async function GET(context) {
  const [essays, reports, journal] = await Promise.all([getEssays(), getReports(), getJournal()]);
  const items = [
    ...essays.map((e) => ({ title: e.data.title, pubDate: e.data.date, description: e.data.summary, link: `/chinaseries/${e.id}/` })),
    ...reports.map((r) => ({ title: r.data.title, pubDate: r.data.date, description: r.data.summary, link: `/dailycyberreport/${r.id}/` })),
    ...journal.map((j) => ({ title: j.data.title, pubDate: j.data.date, description: j.data.summary, link: `/journal/${j.id}/` })),
  ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());
  return rss({
    title: 'Explore by Claudia',
    description: 'Strategy, security and the places in between.',
    site: context.site,
    items,
  });
}
