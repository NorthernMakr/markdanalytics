// The pages that should be found in search engines and AI answer engines, in
// both languages. Used by sitemap.xml, rss.xml, llms.txt and the sitemap page,
// so they always agree. Built from src/config/sections.ts and src/content/pages.
//
// Deliberately left out: the demo store and media site (fictional content,
// marked noindex), the contact page (noindex, nofollow at the owner's request)
// and the 404 page.
import { getPages, parseId, pagePath } from './content';
import { siteMeta } from '../config/tags';
import { SECTIONS } from '../config/sections';
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
  /** 'section' = a section hub, 'article' = a page inside a section, 'page' = site pages. */
  kind: 'page' | 'section' | 'article';
  /** Content section id, for section hubs and articles. */
  section?: string;
  published?: Date;
}

async function pagesIn(lang: Lang): Promise<IndexablePage[]> {
  const fr = lang === 'fr';
  const entries = await getPages(lang);
  const content: IndexablePage[] = entries.map((p) => {
    const { section, slug } = parseId(p.id);
    const basePath = pagePath(section, slug);
    return {
      path: localize(basePath, lang), basePath, lang, section,
      title: p.data.title, description: p.data.description,
      lastmod: p.data.updatedDate ?? p.data.pubDate, published: p.data.pubDate,
      kind: slug === 'index' ? 'section' : 'article',
    };
  });
  // Section hubs in menu order, each followed by its pages
  const order = (s?: string) => SECTIONS.findIndex((x) => x.id === s);
  content.sort((a, b) => order(a.section) - order(b.section) || (a.kind === 'section' ? -1 : b.kind === 'section' ? 1 : 0));

  const newest = content.reduce((d, p) => (p.lastmod > d ? p.lastmod : d), new Date(0));
  const notes = fr ? notesFr : notesEn;
  const site = (basePath: string, title: string, description: string, lastmod: Date): IndexablePage =>
    ({ path: localize(basePath, lang), basePath, lang, title, description, lastmod, kind: 'page' });

  return [
    site('/', siteMeta.blogName, fr ? siteMeta.blogTaglineFr : siteMeta.blogTagline, newest),
    ...content,
    site('/site-notes/', notes.title, notes.description, new Date(notes.updatedDate ?? notes.pubDate)),
    site('/sitemap/', fr ? 'Plan du site' : 'Sitemap', fr ? 'Toutes les pages du site.' : 'Every page on the site.', newest),
  ];
}

/** Both languages: English pages first, then French. Filter on `lang` for one. */
export async function getIndexablePages(): Promise<IndexablePage[]> {
  return [...(await pagesIn('en')), ...(await pagesIn('fr'))];
}
