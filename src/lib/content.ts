// Helpers for the content sections (src/content/pages). Every section page,
// hub list, sitemap entry and feed item comes through here.
import { getCollection, type CollectionEntry } from 'astro:content';
import { LOCALE, type Lang } from '../i18n';
import { SECTIONS } from '../config/sections';

export type Page = CollectionEntry<'pages'>;

/**
 * Where an entry sits. Astro ids drop "/index": "process/index.md" is "process",
 * "fr/process/x.md" is "fr/process/x".
 */
export function parseId(id: string): { lang: Lang; section: string; slug: string } {
  const fr = id === 'fr' || id.startsWith('fr/');
  const [section, slug = 'index'] = (fr ? id.slice(3) : id).split('/');
  return { lang: fr ? 'fr' : 'en', section, slug };
}

/** English path of a page: ('process', 'index') → /process/. */
export const pagePath = (section: string, slug: string) =>
  slug === 'index' ? `/${section}/` : `/${section}/${slug}/`;

/** The Astro id of the English version of a page. */
export const englishId = (section: string, slug: string) => (slug === 'index' ? section : `${section}/${slug}`);

const known = new Set(SECTIONS.map((s) => s.id));

/** Published pages in one language (drafts show only in `npm run dev`; files starting with _ never). */
export async function getPages(lang: Lang = 'en'): Promise<Page[]> {
  return getCollection('pages', ({ id, data }) => {
    if (id.split('/').some((part) => part.startsWith('_'))) return false;
    const where = parseId(id);
    return where.lang === lang && known.has(where.section) && (import.meta.env.DEV || !data.draft);
  });
}

/** Pages in one section, hub first, then by `order`, then by date. */
export async function getSectionPages(section: string, lang: Lang = 'en'): Promise<Page[]> {
  const order = (p: Page) => (parseId(p.id).slug === 'index' ? -1 : p.data.order ?? 999);
  return (await getPages(lang))
    .filter((p) => parseId(p.id).section === section)
    .sort((a, b) => order(a) - order(b) || a.data.pubDate.valueOf() - b.data.pubDate.valueOf());
}

export const formatDate = (d: Date, lang: Lang = 'en') =>
  d.toLocaleDateString(LOCALE[lang], { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);
export const wordCount = (text = '') => text.split(/\s+/).filter(Boolean).length;
