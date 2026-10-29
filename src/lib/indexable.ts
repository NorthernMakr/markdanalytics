// The pages that should be found in search engines and AI answer engines.
// Used by sitemap.xml, rss.xml and llms.txt so all three always agree.
//
// Deliberately left out: the demo store and media site (fictional content,
// marked noindex), the contact page (noindex, nofollow at the owner's request)
// and the 404 page.
import { getCollection } from 'astro:content';
import { getPosts } from './blog';
import { siteMeta } from '../config/tags';

export interface IndexablePage {
  path: string;
  title: string;
  description: string;
  lastmod: Date;
  kind: 'page' | 'post' | 'practice';
  published?: Date;
}

export async function getIndexablePages(): Promise<IndexablePage[]> {
  const posts = await getPosts();
  const practice = (await getCollection('practice', ({ data }) => !data.draft))
    .sort((a, b) => (a.id === 'index' ? -1 : b.id === 'index' ? 1 : a.data.pubDate.valueOf() - b.data.pubDate.valueOf()));

  const postPages: IndexablePage[] = posts.map((p) => ({
    path: `/blog/${p.id}/`, title: p.data.title, description: p.data.description,
    lastmod: p.data.updatedDate ?? p.data.pubDate, published: p.data.pubDate, kind: 'post',
  }));
  const practicePages: IndexablePage[] = practice.map((p) => ({
    path: p.id === 'index' ? '/practice/' : `/practice/${p.id}/`, title: p.data.title, description: p.data.description,
    lastmod: p.data.updatedDate ?? p.data.pubDate, published: p.data.pubDate, kind: 'practice',
  }));

  const newest = (list: IndexablePage[]) =>
    list.reduce((d, p) => (p.lastmod > d ? p.lastmod : d), new Date(0));
  const all = [...postPages, ...practicePages];

  return [
    { path: '/', title: siteMeta.blogName, description: siteMeta.blogTagline, lastmod: newest(all), kind: 'page' },
    { path: '/blog/', title: 'Notes', description: 'All posts on analytics implementation.', lastmod: newest(postPages), kind: 'page' },
    ...practicePages,
    ...postPages,
  ];
}
