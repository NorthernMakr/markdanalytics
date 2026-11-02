// Purchase payload check. Buys from a running local copy in both languages
// (one item standard shipping, two items express) and checks:
//   - GA4 purchase value = sum of price × quantity (no tax, no shipping),
//     per Google's recommended-event reference; tax and shipping in their own fields
//   - Adobe XDM order.priceTotal = the full order total including tax and
//     shipping (XDM's definition), product lines = price × quantity
// Usage: node tests/check-purchase.cjs [base URL, default http://127.0.0.1:8787]
const { chromium } = require('playwright');
const B = process.argv[2] || 'http://127.0.0.1:8787';
const round = (n) => Math.round(n * 100) / 100;

(async () => {
  const browser = await chromium.launch();
  const failures = [];
  const runs = [
    { pdp: '/shop/product/tidepool-daypack/', checkout: '/shop/checkout/', tier: 'standard', qty: 1, ship: 0 },
    { pdp: '/fr/boutique/produit/sac-de-jour-tidepool/', checkout: '/fr/boutique/caisse/', tier: 'express', qty: 2, ship: 15 },
  ];
  for (const run of runs) {
    const page = await (await browser.newContext()).newPage();
    await page.goto(B + run.pdp);
    await page.selectOption('#qty', String(run.qty));
    await page.locator('form button[type=submit]').first().click();
    await page.goto(B + run.checkout);
    await page.check(`input[name=tier][value=${run.tier}]`);
    await page.click('.ship-form button[type=submit]');
    await page.waitForURL(/(payment|paiement)/);
    await page.click('.pay-form button[type=submit]');
    await page.waitForURL(/confirmation/);
    await page.waitForTimeout(400);
    const r = await page.evaluate(() => ({
      ga4: window.dataLayer.find((e) => e.event === 'purchase').ecommerce,
      adobe: window.adobeDataLayer.find((e) => e.event === 'purchase'),
    }));
    const label = `${run.checkout} (${run.qty} item(s), ${run.tier})`;
    const items = round(r.ga4.items.reduce((s, i) => s + i.price * i.quantity, 0));
    const tax = round(items * 0.12);
    if (r.ga4.value !== items) failures.push(`${label}: GA4 value ${r.ga4.value}, expected ${items} (items only)`);
    if (r.ga4.tax !== tax) failures.push(`${label}: GA4 tax ${r.ga4.tax}, expected ${tax}`);
    if (r.ga4.shipping !== run.ship) failures.push(`${label}: GA4 shipping ${r.ga4.shipping}, expected ${run.ship}`);
    const total = round(items + tax + run.ship);
    if (r.adobe.commerce.order.priceTotal !== total) failures.push(`${label}: Adobe order.priceTotal ${r.adobe.commerce.order.priceTotal}, expected ${total}`);
    const lines = round(r.adobe.productListItems.reduce((s, i) => s + i.priceTotal, 0));
    if (lines !== items) failures.push(`${label}: Adobe product lines total ${lines}, expected ${items}`);
    console.log(`${label}: GA4 value ${r.ga4.value}, tax ${r.ga4.tax}, shipping ${r.ga4.shipping}; Adobe order total ${r.adobe.commerce.order.priceTotal}`);
  }
  await browser.close();
  if (failures.length) { console.log(failures.join('\n')); process.exit(1); }
  console.log('Purchase checks passed.');
})();
