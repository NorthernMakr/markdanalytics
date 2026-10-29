import { getCart, bySku, totals, type CartTotals, type CartLine, type ShippingTier } from './commerce';
import { productText, colourLabel } from '../data/products';
import { money } from '../i18n';
import { pageLang, t } from './lab';

export function renderSummary(el: HTMLElement, tier: ShippingTier, cart: CartLine[] = getCart(), tt: CartTotals = totals(cart, tier)) {
  const lang = pageLang();
  const fmt = (n: number) => money(n, lang);
  const items = cart.map((l) => {
    const p = bySku(l.sku)!;
    return `<dt>${l.qty} × ${productText(p, lang).name} (${colourLabel(l.colour, lang)})</dt><dd>${fmt(p.price * l.qty)}</dd>`;
  }).join('');
  el.innerHTML = `${items}
    <dt>${t('Subtotal', 'Sous-total')}</dt><dd>${fmt(tt.subtotal)}</dd>
    <dt>${t('Shipping', 'Livraison')}</dt><dd>${tt.shipping ? fmt(tt.shipping) : t('Free', 'Gratuite')}</dd>
    <dt>${t('Tax', 'Taxes')}</dt><dd>${fmt(tt.tax)}</dd>
    <dt class="grand">Total</dt><dd class="grand">${fmt(tt.total)}</dd>`;
}

/** Shows an "empty cart" notice and hides the form when there's nothing to check out. */
export function guardEmpty(form: HTMLElement, notice: HTMLElement): boolean {
  const empty = getCart().length === 0;
  form.hidden = empty;
  notice.hidden = !empty;
  return empty;
}
