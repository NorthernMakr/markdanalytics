// The pages that should be found in search engines and AI answer engines, in
// both languages. Used by sitemap.xml, rss.xml and llms.txt so all three agree.
//
// Deliberately left out: the demo store and media site (fictional content,
// marked noindex), the contact page (noindex, nofollow at the owner's request)
// and the 404 page.
import { getPosts, getPractice, slugOf } from './blog';
import { siteMeta } from '../config/tags';
import { localize, type Lang } from '../i18n';
import { frontmatter as notesEn } from '../writing/site-notes.md';
import { frontmatter as notesFr } from '../writing/site-notes.fr.md';

export interface IndexablePage {
  /** Address of this version. */
  path: string;
  /** English address; the same for both versions of a page. */
  basePath: string;
  lang: Lang;
  title: string;
  description: string;
  lastmod: Date;
  kind: 'page' | 'post' | 'practice';
  published?: Date;
}

async function pagesIn(lang: Lang): Promise<IndexablePage[]> {
  const l = (p: string) => localize(p, lang);
  const fr = lang === 'fr';
  const posts = await getPosts(lang);
  const practice = (await getPractice(lang))
    .sort((a, b) => (slugOf(a.id) === 'index' ? -1 : slugOf(b.id) === 'index' ? 1 : a.data.pubDate.valueOf() - b.data.pubDate.valueOf()));

  const page = (basePath: string, rest: Omit<IndexablePage, 'path' | 'basePath' | 'lang'>): IndexablePage =>
    ({ path: l(basePath), basePath, lang, ...rest });

  const postPages = posts.map((p) => page(`/blog/${slugOf(p.id)}/`, {
    title: p.data.title, description: p.data.description,
    lastmod: p.data.updatedDate ?? p.data.pubDate, published: p.data.pubDate, kind: 'post',
  }));
  const practicePages = practice.map((p) => {
    const slug = slugOf(p.id);
    return page(slug === 'index' ? '/practice/' : `/practice/${slug}/`, {
      title: p.data.title, description: p.data.description,
      lastmod: p.data.updatedDate ?? p.data.pubDate, published: p.data.pubDate, kind: 'practice',
    });
  });

  const newest = (list: IndexablePage[]) => list.reduce((d, p) => (p.lastmod > d ? p.lastmod : d), new Date(0));
  const all = [...postPages, ...practicePages];
  const notes = fr ? notesFr : notesEn;

  return [
    page('/', { title: siteMeta.blogName, description: fr ? siteMeta.blogTaglineFr : siteMeta.blogTagline, lastmod: newest(all), kind: 'page' }),
    page('/blog/', { title: 'Notes', description: fr ? 'Tous les billets sur l’implémentation en analytique.' : 'All posts on analytics implementation.', lastmod: newest(postPages), kind: 'page' }),
    page('/site-notes/', { title: notes.title, description: notes.description, lastmod: new Date(notes.updatedDate ?? notes.pubDate), kind: 'page' }),
    page('/sitemap/', { title: fr ? 'Plan du site' : 'Sitemap', description: fr ? 'Toutes les pages du site.' : 'Every page on the site.', lastmod: newest(all), kind: 'page' }),
    ...practicePages,
    ...postPages,
  ];
}

/** Both languages: English pages first, then French. Filter on `lang` for one. */
export async function getIndexablePages(): Promise<IndexablePage[]> {
  return [...(await pagesIn('en')), ...(await pagesIn('fr'))];
}
