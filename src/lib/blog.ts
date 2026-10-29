import { getCollection, type CollectionEntry } from 'astro:content';
import { LOCALE, type Lang } from '../i18n';

export type Post = CollectionEntry<'blog'>;

// French posts live in src/content/blog/fr/ with the same file name as the
// English post, so both versions share a slug (/blog/x/ and /fr/blog/x/).
// (Astro gives fr/index.md the id "fr", so that counts as the French index.)
const isFr = (id: string) => id === 'fr' || id.startsWith('fr/');
/** The URL slug without the language folder: "fr/my-post" → "my-post", "fr" → "index". */
export const slugOf = (id: string) => (id === 'fr' ? 'index' : id.replace(/^fr\//, ''));

/** Published posts in one language, newest first. Drafts appear only in `npm run dev`. */
export async function getPosts(lang: Lang = 'en'): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data, id }) =>
    !slugOf(id).startsWith('_') && isFr(id) === (lang === 'fr') && (import.meta.env.DEV || !data.draft));
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** Practice pages in one language (src/content/practice/fr/ for French). */
export async function getPractice(lang: Lang = 'en') {
  return getCollection('practice', ({ data, id }) =>
    isFr(id) === (lang === 'fr') && (import.meta.env.DEV || !data.draft));
}

export const formatDate = (d: Date, lang: Lang = 'en') =>
  d.toLocaleDateString(LOCALE[lang], { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

export const wordCount = (text = '') => text.split(/\s+/).filter(Boolean).length;
