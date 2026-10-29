import type { APIRoute } from 'astro';
import { getIndexablePages } from '../lib/indexable';
import { abs } from '../lib/seo';
import { siteMeta } from '../config/tags';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Feed of posts and practice pages, newest first. Feed readers and some AI
// tools use it to discover new content.
export const GET: APIRoute = async () => {
  const items = (await getIndexablePages())
    .filter((p) => p.kind !== 'page')
    .sort((a, b) => (b.published ?? b.lastmod).valueOf() - (a.published ?? a.lastmod).valueOf());

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(siteMeta.blogName)}</title>
    <link>${abs('/')}</link>
    <description>${esc(siteMeta.blogTagline)}</description>
    <language>en-ca</language>
    <atom:link href="${abs('/rss.xml')}" rel="self" type="application/rss+xml" />
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
};
