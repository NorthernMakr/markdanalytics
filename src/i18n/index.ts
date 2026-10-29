// Languages for the whole site. English lives at the root (/shop/), French
// under /fr/ with the same structure (/fr/shop/). Every page works out its
// language from its own URL, so a page component can serve both routes.

export const LANGS = ['en', 'fr'] as const;
export type Lang = (typeof LANGS)[number];

/** BCP 47 locale for each language: html lang, data layer page.language. */
export const LOCALE: Record<Lang, string> = { en: 'en-CA', fr: 'fr-CA' };
/** Open Graph locale. */
export const OG_LOCALE: Record<Lang, string> = { en: 'en_CA', fr: 'fr_CA' };
/** Label shown in the language switch. */
export const LANG_LABEL: Record<Lang, { short: string; long: string }> = {
  en: { short: 'EN', long: 'English' },
  fr: { short: 'FR', long: 'Français' },
};

// French addresses. Each English path segment that has a French equivalent is
// listed once; anything not listed is the same in both languages (contact,
// article, confirmation). Translating segment by segment keeps the mapping
// reversible, so every page knows its address in the other language.
//
// Adding a blog post, practice page, product or story with a French version?
// Add its French slug here. `npm run test:languages` fails if a French page has
// no English twin or the reverse.
export const FR_SEGMENTS: Record<string, string> = {
  // Sections and pages
  shop: 'boutique', catalog: 'catalogue', product: 'produit', cart: 'panier',
  checkout: 'caisse', payment: 'paiement', media: 'medias', blog: 'blogue',
  practice: 'pratique', 'site-notes': 'notes-du-site', sitemap: 'plan-du-site',
  // Blog posts
  'how-this-sites-data-layer-works': 'comment-fonctionne-la-couche-de-donnees',
  'testing-adobe-web-sdk-without-an-adobe-account': 'tester-adobe-web-sdk-sans-compte-adobe',
  // Practice pages
  'multilingual-sites': 'sites-multilingues',
  // Demo store products
  'tidepool-daypack': 'sac-de-jour-tidepool',
  'breakwater-dry-bag': 'sac-etanche-breakwater',
  'squall-rain-shell': 'manteau-coquille-squall',
  'harbour-wool-beanie': 'tuque-en-laine-harbour',
  'cove-two-person-tent': 'tente-deux-places-cove',
  'lighthouse-lantern': 'lanterne-lighthouse',
  'galley-enamel-mug': 'tasse-emaillee-galley',
  'current-insulated-bottle': 'bouteille-isolee-current',
  // Demo news stories
  'ferry-schedule-shakeup': 'nouvel-horaire-du-traversier',
  'night-market-returns': 'retour-du-marche-de-nuit',
  'king-tide-warning': 'grandes-marees-cette-fin-de-semaine',
  'library-branch-reopens': 'reouverture-de-la-bibliotheque-du-nord',
  'rowing-club-centennial': 'centenaire-du-club-daviron',
};
const EN_SEGMENTS: Record<string, string> = Object.fromEntries(Object.entries(FR_SEGMENTS).map(([en, fr]) => [fr, en]));

/** One URL segment in French: frSlug('tidepool-daypack') → 'sac-de-jour-tidepool'. */
export const frSlug = (segment: string) => FR_SEGMENTS[segment] ?? segment;
const mapSegments = (path: string, dict: Record<string, string>) =>
  path.split('/').map((seg) => dict[seg] ?? seg).join('/');

export const langFromPath = (path: string): Lang =>
  path === '/fr' || path.startsWith('/fr/') ? 'fr' : 'en';

/** The English path of any page: /fr/boutique/panier/ → /shop/cart/. */
export const basePath = (path: string) =>
  langFromPath(path) === 'fr' ? mapSegments(path.slice(3) || '/', EN_SEGMENTS) : path;

/** An English site path in the given language: ('/shop/cart/', 'fr') → '/fr/boutique/panier/'. */
export const localize = (path: string, lang: Lang) => {
  if (lang === 'en') return path;
  if (/^(https?:|mailto:|#)/.test(path)) return path;
  if (/\.(xml|txt)$/.test(path)) return '/fr' + path; // feeds keep their file names
  const cut = path.search(/[?#]/);
  const p = cut < 0 ? path : path.slice(0, cut);
  const rest = cut < 0 ? '' : path.slice(cut);
  return '/fr' + mapSegments(p.startsWith('/') ? p : '/' + p, FR_SEGMENTS) + rest;
};

/** The same page in the other language. */
export const otherLang = (lang: Lang): Lang => (lang === 'en' ? 'fr' : 'en');
export const alternatePath = (path: string) => {
  const lang = langFromPath(path);
  return localize(basePath(path), otherLang(lang));
};

export const money = (n: number, lang: Lang) =>
  new Intl.NumberFormat(LOCALE[lang], { style: 'currency', currency: 'CAD' }).format(n);

export const longDate = (d: Date, lang: Lang) =>
  d.toLocaleDateString(LOCALE[lang], { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

/** Pick the string for the current language: tr(lang, 'Cart', 'Panier'). */
export const tr = <T,>(lang: Lang, en: T, fr: T): T => (lang === 'fr' ? fr : en);
