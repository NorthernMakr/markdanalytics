import type { APIRoute } from 'astro';
import { abs } from '../lib/seo';

// Search engines and AI crawlers are welcome on the content pages. The demo
// sites and contact page are kept out of results with noindex meta tags rather
// than blocked here: a crawler has to be allowed to fetch a page to see its
// noindex tag. The mock Adobe Edge and contact endpoints aren't pages at all.
export const GET: APIRoute = () => new Response(
`User-agent: *
Allow: /
Disallow: /ee/
Disallow: /api/

Sitemap: ${abs('/sitemap.xml')}
`, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
