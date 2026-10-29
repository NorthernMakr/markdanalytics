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

export const langFromPath = (path: string): Lang =>
  path === '/fr' || path.startsWith('/fr/') ? 'fr' : 'en';

/** The path without its language prefix: /fr/shop/ → /shop/. */
export const basePath = (path: string) =>
  langFromPath(path) === 'fr' ? path.slice(3) || '/' : path;

/** A site path in the given language: ('/shop/', 'fr') → '/fr/shop/'. */
export const localize = (path: string, lang: Lang) => {
  if (lang === 'en') return path;
  if (/^(https?:|mailto:|#)/.test(path)) return path;
  return '/fr' + (path.startsWith('/') ? path : '/' + path);
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
