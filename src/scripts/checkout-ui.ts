import { getCart, bySku, totals, type CartTotals, type CartLine, type ShippingTier } from './commerce';
import { money } from '../data/products';

export function renderSummary(el: HTMLElement, tier: ShippingTier, cart: CartLine[] = getCart(), t: CartTotals = totals(cart, tier)) {
  const items = cart.map((l) => {
    const p = bySku(l.sku)!;
    return `<dt>${l.qty} × ${p.name} (${l.colour})</dt><dd>${money(p.price * l.qty)}</dd>`;
  }).join('');
  el.innerHTML = `${items}
    <dt>Subtotal</dt><dd>${money(t.subtotal)}</dd>
    <dt>Shipping</dt><dd>${t.shipping ? money(t.shipping) : 'Free'}</dd>
    <dt>Tax</dt><dd>${money(t.tax)}</dd>
    <dt class="grand">Total</dt><dd class="grand">${money(t.total)}</dd>`;
}

/** Shows an "empty cart" notice and hides the form when there's nothing to check out. */
export function guardEmpty(form: HTMLElement, notice: HTMLElement): boolean {
  const empty = getCart().length === 0;
  form.hidden = empty;
  notice.hidden = !empty;
  return empty;
}
