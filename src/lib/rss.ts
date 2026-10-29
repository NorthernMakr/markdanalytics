// RSS feeds: /rss.xml (English) and /fr/rss.xml (French). Posts and practice
// pages, newest first. Feed readers and some AI tools use them to discover content.
import { getIndexablePages } from './indexable';
import { abs } from './seo';
import { siteMeta } from '../config/tags';
import { LOCALE, localize, type Lang } from '../i18n';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function rssFeed(lang: Lang): Promise<Response> {
  const items = (await getIndexablePages())
    .filter((p) => p.lang === lang && p.kind !== 'page')
    .sort((a, b) => (b.published ?? b.lastmod).valueOf() - (a.published ?? a.lastmod).valueOf());
  const self = localize('/rss.xml', lang);

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(siteMeta.blogName)}</title>
    <link>${abs(localize('/', lang))}</link>
    <description>${esc(lang === 'fr' ? siteMeta.blogTaglineFr : siteMeta.blogTagline)}</description>
    <language>${LOCALE[lang].toLowerCase()}</language>
    <atom:link href="${abs(self)}" rel="self" type="application/rss+xml" />
${items.map((p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${abs(p.path)}</link>
      <guid isPermaLink="true">${abs(p.path)}</guid>
      <description>${esc(p.description)}</description>
      <pubDate>${(p.published ?? p.lastmod).toUTCString()}</pubDate>
      <author>${esc(siteMeta.owner)}</author>
    </item>`).join('\n')}
  </channel>
</rss>
`;
  return new Response(body, { headers: { 'content-type': 'application/rss+xml; charset=utf-8' } });
}
