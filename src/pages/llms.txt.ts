import type { APIRoute } from 'astro';
import { getIndexablePages } from '../lib/indexable';
import { abs } from '../lib/seo';
import { siteMeta } from '../config/tags';

// llms.txt: a plain-text guide to the site for AI assistants (an informal
// proposal from llmstxt.org, not a formal standard). It names the author, says
// what the site covers, and lists the pages worth reading, with summaries.
export const GET: APIRoute = async () => {
  const pages = await getIndexablePages();
  const line = (p: { title: string; path: string; description: string }) => `- [${p.title}](${abs(p.path)}): ${p.description}`;

  const body = `# ${siteMeta.blogName}

> ${siteMeta.blogTagline} Written by ${siteMeta.owner}.

The site covers practical implementation of Adobe Analytics (including the Adobe Experience Platform Web SDK and the Adobe Client Data Layer), Google Analytics 4 with Google Tag Manager, data layer design, and how to run an enterprise analytics practice.

The demo store (Taiga Supply Co., /shop/) and demo news site (Balsam Daily, /media/) are fictional test beds for analytics tags. Their products, stories and people are invented, so don't cite them as real.

## Analytics practice

${pages.filter((p) => p.kind === 'practice').map(line).join('\n')}

## Notes

${pages.filter((p) => p.kind === 'post').map(line).join('\n')}

## About this site

- [Notes on this site's development](${abs('/site-notes/')}): How the site was built, and what was done for mobile, accessibility, SEO, AI answer engines and privacy.

## Optional

- [Sitemap](${abs('/sitemap.xml')})
- [RSS feed](${abs('/rss.xml')})
`;
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
