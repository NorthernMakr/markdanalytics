// Automatic link names: region:element:detail
// Spec: /implementation/product-page-specification/ (section 4). Recorded in the
// SDR for developers (/implementation/sdr-developers/), which shows this file.
//
// Templates mark CONTAINERS, not links. Every link inside inherits the context:
//   data-region="header"        where the link is: header, pdp, footer (fixed list)
//   data-module="nav"           which component it's in (optional). On the link
//                               itself, the link IS the component (logo, cart)
//                               and its text is left out.
//   data-position="2"           place in a repeating list, counting from 1
//   data-item-id="TG-PK-101"    what the link acts on (optional), with
//   data-item-name="Tidepool daypack"   its English name
// On a link:
//   data-link-name="Packs & bags"   its English text: needed on French pages, and
//                                   where the visible text changes (Saved!)
//   data-link-event                 the element sends its own event (add to cart,
//                                   language switch…): it gets the name added to
//                                   that event, and no extra link_click is sent
//
// Name = region : module : position : link text : item name : item id
// Empty parts are dropped. Link text is dropped when it repeats the item name
// (a product card's title link). Lowercase, hyphens, 100 characters at most.
import { ga4, adobe } from './lab';

/** "Packs & bags" → "packs-and-bags". Accents are stripped as a safety net; names should already be English. */
export const slug = (s?: string | null) =>
  (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const TRACKED = 'a, button, input[type="radio"]';

export interface LinkContext { name: string; region: string }

/** The link name and region for an element, or undefined when it isn't inside a [data-region]. */
export function linkContext(el: Element | null | undefined): LinkContext | undefined {
  const h = el as HTMLElement | null;
  const regionEl = h?.closest<HTMLElement>('[data-region]');
  if (!h || !regionEl) return undefined;
  const moduleEl = h.closest<HTMLElement>('[data-module]');
  const module = moduleEl && regionEl.contains(moduleEl) ? moduleEl : null;
  const item = h.closest<HTMLElement>('[data-item-id]');
  const itemName = slug(item?.dataset.itemName);
  const text = h.dataset.linkName ?? (h instanceof HTMLInputElement ? h.value : h.textContent);
  let label = module === h ? '' : slug(text);
  if (label === itemName) label = '';
  const name = [
    regionEl.dataset.region,
    module?.dataset.module,
    h.closest<HTMLElement>('[data-position]')?.dataset.position,
    label,
    itemName,
    slug(item?.dataset.itemId),
  ].filter(Boolean).join(':').slice(0, 100);
  return { name, region: regionEl.dataset.region! };
}

/** Fields to add to an element's own event: GA4 params and the Adobe `link` object. */
export const linkFields = (el: Element | null | undefined) => {
  const c = linkContext(el);
  return c
    ? { ga4: { link_name: c.name, link_region: c.region }, adobe: { link: { name: c.name, region: c.region } } }
    : { ga4: {}, adobe: {} };
};

/** One listener for the whole page: sends link_click / link clicked for every tracked element without its own event. */
export function trackLinkNames(root: Document = document) {
  root.addEventListener('click', (e) => {
    const el = (e.target as Element | null)?.closest?.<HTMLElement>(TRACKED);
    if (!el || el.dataset.linkEvent !== undefined) return;
    const c = linkContext(el);
    if (!c) return;
    const href = (el as HTMLAnchorElement).href;
    const url = href ? new URL(href).pathname + new URL(href).search : undefined;
    ga4({ event: 'link_click', link_name: c.name, link_region: c.region, ...(url ? { link_url: url } : {}) });
    adobe({ event: 'link clicked', link: { name: c.name, region: c.region, ...(url ? { url } : {}) } });
  });
}
