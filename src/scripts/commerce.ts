// Ecommerce tracking for the demo store.
//
// Every interaction is pushed twice:
//  - dataLayer: GA4 recommended ecommerce events (items[] schema)
//  - adobeDataLayer: Adobe-style events with an XDM-like productListItems[]
//
// The cart lives in localStorage so the funnel behaves realistically across
// pages. Nothing ever leaves the browser.
import { ga4, adobe } from './lab';
import { products, type Product } from '../data/products';

const CURRENCY = 'CAD';
const CART_KEY = 'lab-cart';
export const TAX_RATE = 0.12; // GST + BC PST, for realistic-looking totals
export const SHIPPING = { standard: { label: 'Standard (5–7 days)', cost: 0 }, express: { label: 'Express (1–2 days)', cost: 15 } } as const;
export type ShippingTier = keyof typeof SHIPPING;

export interface CartLine { sku: string; colour: string; qty: number; }
export interface ListContext { listId: string; listName: string; }

const bySku = (sku: string) => products.find((p) => p.sku === sku);
const round = (n: number) => Math.round(n * 100) / 100;

// --- storage (wrapped: storage can be unavailable in private modes) -------
const read = <T>(store: Storage | undefined, key: string, fallback: T): T => {
  try { const v = store?.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
};
const write = (store: Storage | undefined, key: string, val: unknown) => {
  try { store?.setItem(key, JSON.stringify(val)); } catch { /* ignore */ }
};
const local = () => { try { return window.localStorage; } catch { return undefined; } };
export const session = () => { try { return window.sessionStorage; } catch { return undefined; } };
export const readSession = <T>(key: string, fallback: T) => read(session(), key, fallback);
export const writeSession = (key: string, val: unknown) => write(session(), key, val);

export const getCart = (): CartLine[] => read(local(), CART_KEY, [] as CartLine[]).filter((l) => bySku(l.sku));
export const saveCart = (cart: CartLine[]) => {
  write(local(), CART_KEY, cart);
  document.dispatchEvent(new CustomEvent('cart:change'));
};
export const cartCount = () => getCart().reduce((n, l) => n + l.qty, 0);

export interface CartTotals { subtotal: number; shipping: number; tax: number; total: number; }
export function totals(cart: CartLine[], tier: ShippingTier = 'standard'): CartTotals {
  const subtotal = round(cart.reduce((s, l) => s + (bySku(l.sku)?.price ?? 0) * l.qty, 0));
  const shipping = cart.length ? SHIPPING[tier].cost : 0;
  const tax = round(subtotal * TAX_RATE);
  return { subtotal, shipping, tax, total: round(subtotal + shipping + tax) };
}

// --- item mapping ------------------------------------------------------------
export function ga4Item(p: Product, opts: { qty?: number; colour?: string; index?: number; list?: ListContext } = {}) {
  return {
    item_id: p.sku,
    item_name: p.name,
    item_brand: p.brand,
    item_category: p.category,
    item_category2: p.subcategory,
    item_variant: opts.colour ?? p.colours[0].name,
    price: p.price,
    quantity: opts.qty ?? 1,
    ...(opts.index !== undefined ? { index: opts.index } : {}),
    ...(opts.list ? { item_list_id: opts.list.listId, item_list_name: opts.list.listName } : {}),
  };
}

export function adobeItem(p: Product, opts: { qty?: number; colour?: string } = {}) {
  const qty = opts.qty ?? 1;
  return {
    SKU: p.sku,
    name: p.name,
    quantity: qty,
    priceTotal: round(p.price * qty),
    currencyCode: CURRENCY,
    productCategories: [{ categoryID: p.category }, { categoryID: p.subcategory }],
    selectedOptions: [{ attribute: 'colour', value: opts.colour ?? p.colours[0].name }],
  };
}

const cartItems = (cart: CartLine[]) => cart.flatMap((l) => {
  const p = bySku(l.sku);
  return p ? [{ p, l }] : [];
});

// --- events ----------------------------------------------------------------
export function viewItemList(list: ListContext, items: Product[]) {
  if (!items.length) return;
  ga4({
    event: 'view_item_list',
    ecommerce: { item_list_id: list.listId, item_list_name: list.listName, items: items.map((p, i) => ga4Item(p, { index: i, list })) },
  });
  adobe({ event: 'product list viewed', productList: { id: list.listId, name: list.listName }, productListItems: items.map((p) => adobeItem(p)) });
}

export function selectItem(list: ListContext, p: Product, index: number) {
  ga4({ event: 'select_item', ecommerce: { item_list_id: list.listId, item_list_name: list.listName, items: [ga4Item(p, { index, list })] } });
  adobe({ event: 'product clicked', productList: { id: list.listId, name: list.listName }, productListItems: [adobeItem(p)] });
}

export function viewItem(p: Product) {
  ga4({ event: 'view_item', ecommerce: { currency: CURRENCY, value: p.price, items: [ga4Item(p)] } });
  adobe({ event: 'product viewed', productListItems: [adobeItem(p)] });
}

export function addToCart(p: Product, colour: string, qty: number, source = 'product page') {
  const cart = getCart();
  const line = cart.find((l) => l.sku === p.sku && l.colour === colour);
  if (line) line.qty += qty; else cart.push({ sku: p.sku, colour, qty });
  saveCart(cart);
  ga4({ event: 'add_to_cart', ecommerce: { currency: CURRENCY, value: round(p.price * qty), items: [ga4Item(p, { qty, colour })] }, cart_source: source });
  adobe({ event: 'cart add', productListItems: [adobeItem(p, { qty, colour })], cart: { source } });
}

export function removeFromCart(sku: string, colour: string, qty: number) {
  const p = bySku(sku);
  let cart = getCart();
  const line = cart.find((l) => l.sku === sku && l.colour === colour);
  if (!p || !line) return;
  line.qty -= qty;
  cart = cart.filter((l) => l.qty > 0);
  saveCart(cart);
  ga4({ event: 'remove_from_cart', ecommerce: { currency: CURRENCY, value: round(p.price * qty), items: [ga4Item(p, { qty, colour })] } });
  adobe({ event: 'cart remove', productListItems: [adobeItem(p, { qty, colour })] });
}

export function addToWishlist(p: Product, colour: string) {
  ga4({ event: 'add_to_wishlist', ecommerce: { currency: CURRENCY, value: p.price, items: [ga4Item(p, { colour })] } });
  adobe({ event: 'wishlist add', productListItems: [adobeItem(p, { colour })] });
}

function cartPayload(cart: CartLine[], extra: Record<string, unknown> = {}, tier?: ShippingTier) {
  const t = totals(cart, tier);
  const lines = cartItems(cart);
  return {
    ga4: { currency: CURRENCY, value: t.subtotal, ...extra, items: lines.map(({ p, l }) => ga4Item(p, { qty: l.qty, colour: l.colour })) },
    adobeItems: lines.map(({ p, l }) => adobeItem(p, { qty: l.qty, colour: l.colour })),
    totals: t,
  };
}

export function viewCart() {
  const c = cartPayload(getCart());
  ga4({ event: 'view_cart', ecommerce: c.ga4 });
  adobe({ event: 'cart viewed', productListItems: c.adobeItems });
}

export function beginCheckout() {
  const c = cartPayload(getCart());
  ga4({ event: 'begin_checkout', ecommerce: c.ga4 });
  adobe({ event: 'checkout started', checkout: { step: 1, stepName: 'shipping' }, productListItems: c.adobeItems });
}

export function addShippingInfo(tier: ShippingTier) {
  const c = cartPayload(getCart(), { shipping_tier: tier }, tier);
  ga4({ event: 'add_shipping_info', ecommerce: c.ga4 });
  adobe({ event: 'checkout step', checkout: { step: 1, stepName: 'shipping', option: tier }, productListItems: c.adobeItems });
}

export function addPaymentInfo(paymentType: string, tier: ShippingTier) {
  const c = cartPayload(getCart(), { payment_type: paymentType }, tier);
  ga4({ event: 'add_payment_info', ecommerce: c.ga4 });
  adobe({ event: 'checkout step', checkout: { step: 2, stepName: 'payment', option: paymentType }, productListItems: c.adobeItems });
}

export interface Order { id: string; cart: CartLine[]; tier: ShippingTier; paymentType: string; totals: CartTotals; }

export function createOrder(tier: ShippingTier, paymentType: string): Order {
  const cart = getCart();
  const id = 'TG-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 900 + 100);
  return { id, cart, tier, paymentType, totals: totals(cart, tier) };
}

/** Pushes purchase once per order ID, even if the confirmation page is reloaded. */
export function purchase(order: Order): boolean {
  const fired = readSession<string[]>('lab-fired-orders', []);
  if (fired.includes(order.id)) return false;
  const c = cartPayload(order.cart, {}, order.tier);
  ga4({
    event: 'purchase',
    ecommerce: {
      ...c.ga4,
      transaction_id: order.id,
      value: order.totals.total,
      tax: order.totals.tax,
      shipping: order.totals.shipping,
      shipping_tier: order.tier,
      payment_type: order.paymentType,
    },
  });
  adobe({
    event: 'purchase',
    commerce: {
      order: {
        purchaseID: order.id,
        priceTotal: order.totals.total,
        currencyCode: CURRENCY,
        taxAmount: order.totals.tax,
        shippingAmount: order.totals.shipping,
        payments: [{ paymentType: order.paymentType, paymentAmount: order.totals.total, currencyCode: CURRENCY }],
      },
      shipping: { shippingMethod: order.tier },
    },
    productListItems: c.adobeItems,
  });
  writeSession('lab-fired-orders', [...fired, order.id]);
  return true;
}

export function viewPromotion(promo: { id: string; name: string; creative: string; slot: string }) {
  ga4({ event: 'view_promotion', ecommerce: { promotion_id: promo.id, promotion_name: promo.name, creative_name: promo.creative, creative_slot: promo.slot, items: [] } });
  adobe({ event: 'promotion viewed', promotion: promo });
}
export function selectPromotion(promo: { id: string; name: string; creative: string; slot: string }) {
  ga4({ event: 'select_promotion', ecommerce: { promotion_id: promo.id, promotion_name: promo.name, creative_name: promo.creative, creative_slot: promo.slot, items: [] } });
  adobe({ event: 'promotion clicked', promotion: promo });
}

/** Wires up any product links rendered with data-sku / data-index inside a [data-list-id] container. */
export function trackListClicks(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-list-id]').forEach((listEl) => {
    const list = { listId: listEl.dataset.listId!, listName: listEl.dataset.listName! };
    listEl.addEventListener('click', (e) => {
      const link = (e.target as Element).closest<HTMLElement>('a[data-sku]');
      if (!link) return;
      const p = bySku(link.dataset.sku!);
      if (p) selectItem(list, p, Number(link.dataset.index ?? 0));
    });
  });
}

/** Products currently visible in a list container (for view_item_list after filtering). */
export function visibleProducts(listEl: Element): Product[] {
  return Array.from(listEl.querySelectorAll<HTMLElement>('[data-card-sku]'))
    .filter((el) => !el.hidden)
    .map((el) => bySku(el.dataset.cardSku!)!)
    .filter(Boolean);
}

export { bySku };
