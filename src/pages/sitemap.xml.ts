import type { APIRoute } from 'astro';
import { getIndexablePages } from '../lib/indexable';
import { abs } from '../lib/seo';
import { LOCALE } from '../i18n';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Every indexable page in both languages. Each URL lists its language versions
// (hreflang), matching the <link rel="alternate"> tags in each page's <head>.
export const GET: APIRoute = async () => {
  const pages = await getIndexablePages();
  const versions = (basePath: string) => pages.filter((p) => p.basePath === basePath);
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages.map((p) => {
  const alts = versions(p.basePath);
  const en = alts.find((a) => a.lang === 'en');
  return `  <url>
    <loc>${esc(abs(p.path))}</loc>
    <lastmod>${p.lastmod.toISOString().slice(0, 10)}</lastmod>
${alts.map((a) => `    <xhtml:link rel="alternate" hreflang="${LOCALE[a.lang]}" href="${esc(abs(a.path))}" />`).join('\n')}${en ? `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(abs(en.path))}" />` : ''}
  </url>`;
}).join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
};
