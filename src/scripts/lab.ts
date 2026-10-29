import { localize } from '../i18n';
// Small typed wrappers around the push helpers defined inline in Base.astro.
declare global {
  interface Window {
    dataLayer: unknown[];
    adobeDataLayer: unknown[];
    labPage: Record<string, any>;
    lab: { ga4: (e: Record<string, unknown>) => void; adobe: (e: Record<string, unknown>) => void };
  }
}

export const ga4 = (evt: Record<string, unknown>) => window.lab.ga4(evt);
export const adobe = (evt: Record<string, unknown>) => window.lab.adobe(evt);

/** The current page's language, read from <html lang>. */
export const pageLang = (): 'en' | 'fr' => (document.documentElement.lang.startsWith('fr') ? 'fr' : 'en');
/** An English site path in the page's language: lp('/shop/cart/') → '/fr/boutique/panier/' on French pages. */
export const lp = (path: string) => localize(path, pageLang());
/** Pick a string for the current page's language. */
export const t = (en: string, fr: string) => (pageLang() === 'fr' ? fr : en);
