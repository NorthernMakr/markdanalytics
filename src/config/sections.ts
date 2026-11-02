// The site's content sections: ONE place that drives the main menu, section
// addresses (English and French), hub pages, the allowed analytics
// `page.section` values, the sitemap and llms.txt.
//
// To add a section: add an entry here, then create
//   src/content/pages/<id>/index.md        (English hub page)
//   src/content/pages/fr/<id>/index.md     (French hub page)
// Pages inside a section are Markdown files next to index.md (same file name
// in fr/). Their French address comes from FR_SEGMENTS in src/i18n/index.ts.
//
// The demo store and media site aren't content sections (they have their own
// layouts) but appear in the menu; see NAV below.

export interface Section {
  /** English URL segment and analytics page.section value. */
  id: string;
  /** French URL segment. */
  fr: string;
  /** Short menu label. */
  nav: { en: string; fr: string };
  /** Full section name (hub page heading, breadcrumbs). */
  title: { en: string; fr: string };
}

export const SECTIONS: Section[] = [
  { id: 'basics', fr: 'notions-de-base',
    nav: { en: 'Basics', fr: 'Notions de base' },
    title: { en: 'Digital analytics basics', fr: 'Notions de base en analytique numérique' } },
  { id: 'process', fr: 'processus',
    nav: { en: 'Process', fr: 'Processus' },
    title: { en: 'Running an analytics practice', fr: 'Diriger une pratique d’analytique' } },
  { id: 'implementation', fr: 'mise-en-oeuvre',
    nav: { en: 'Implementation', fr: 'Mise en œuvre' },
    title: { en: 'Implementation artifacts', fr: 'Livrables de mise en œuvre' } },
  { id: 'data-quality', fr: 'qualite-des-donnees',
    nav: { en: 'Data quality', fr: 'Qualité des données' },
    title: { en: 'Data quality monitoring', fr: 'Surveillance de la qualité des données' } },
  { id: 'case-studies', fr: 'etudes-de-cas',
    nav: { en: 'Case studies', fr: 'Études de cas' },
    title: { en: 'Analysis case studies', fr: 'Études de cas en analyse' } },
  { id: 'about', fr: 'a-propos',
    nav: { en: 'About', fr: 'À propos' },
    title: { en: 'About me', fr: 'À propos de moi' } },
];

/** Main menu, in order. `href` is the English path; links are localized when rendered. */
export const NAV: { href: string; label: { en: string; fr: string } }[] = [
  ...SECTIONS.filter((s) => s.id !== 'about').map((s) => ({ href: `/${s.id}/`, label: s.nav })),
  { href: '/shop/', label: { en: 'Store', fr: 'Boutique' } },
  { href: '/media/', label: { en: 'Media site', fr: 'Site média' } },
  { href: '/about/', label: SECTIONS.find((s) => s.id === 'about')!.nav },
];

export const sectionById = (id: string) => SECTIONS.find((s) => s.id === id);
