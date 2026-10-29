// SEO and answer-engine (AEO) helpers: structured data (schema.org JSON-LD)
// that tells search engines and AI assistants who wrote a page, what it is,
// when it was published and where it sits in the site.
import { siteMeta } from '../config/tags';

export const SITE_URL = (import.meta.env.SITE ?? 'https://markdanalytics.ca').replace(/\/$/, '');
export const abs = (path: string) => SITE_URL + path;

export const DEFAULT_IMAGE = { url: '/og-default.png', width: 1200, height: 630, alt: `${siteMeta.blogName}: analytics implementation notes by ${siteMeta.owner}` };

const PERSON_ID = abs('/#person');
const SITE_ID = abs('/#website');

export const person = () => ({
  '@type': 'Person',
  '@id': PERSON_ID,
  name: siteMeta.owner,
  url: abs('/'),
  knowsAbout: ['Adobe Analytics', 'Adobe Experience Platform Web SDK', 'Google Analytics 4', 'Google Tag Manager', 'Data layers', 'Analytics governance'],
  contactPoint: { '@type': 'ContactPoint', contactType: 'general enquiries', url: abs('/contact/') },
});

export const website = () => ({
  '@type': 'WebSite',
  '@id': SITE_ID,
  name: siteMeta.blogName,
  url: abs('/'),
  description: siteMeta.blogTagline,
  inLanguage: siteMeta.language,
  publisher: { '@id': PERSON_ID },
});

export const breadcrumbs = (items: { name: string; path: string }[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })),
});

export const article = (a: {
  path: string; title: string; description: string; published: Date; modified?: Date;
  tags?: string[]; section?: string; wordCount?: number;
}) => ({
  '@type': 'BlogPosting',
  '@id': abs(a.path) + '#article',
  headline: a.title,
  description: a.description,
  url: abs(a.path),
  mainEntityOfPage: abs(a.path),
  datePublished: a.published.toISOString(),
  dateModified: (a.modified ?? a.published).toISOString(),
  author: { '@id': PERSON_ID },
  publisher: { '@id': PERSON_ID },
  isPartOf: { '@id': SITE_ID },
  image: abs(DEFAULT_IMAGE.url),
  inLanguage: siteMeta.language,
  ...(a.section ? { articleSection: a.section } : {}),
  ...(a.tags?.length ? { keywords: a.tags.join(', ') } : {}),
  ...(a.wordCount ? { wordCount: a.wordCount } : {}),
});

/**
 * Wraps nodes in one @graph so they can reference each other by @id. The site
 * and its author are included on every page, so each page stands on its own.
 */
export const graph = (...nodes: object[]) => ({ '@context': 'https://schema.org', '@graph': [website(), person(), ...nodes] });
