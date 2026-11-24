// Link name check (product page spec, section 4: region:element:detail).
// Clicks every tracked element on the product page in both languages and checks:
//   - each click sends exactly one push carrying a link name (link_click, or the
//     element's own event: add_to_cart, add_to_wishlist, select_item, language_switch)
//   - names follow the format and are identical in English and French
//   - the Adobe Web SDK hit carries prop4 = eVar9 = link name, prop5 = eVar10 =
//     region, event5, and eVar1-6 as on every hit
// Usage: node tests/check-link-names.cjs [base URL, default http://lab.test:8787]
const { chromium } = require('playwright');
const B = process.argv[2] || 'http://lab.test:8787';
const FORMAT = /^[a-z0-9-]+(:[a-z0-9-]+)*$/;

// Selector → expected name. The language switch is checked separately (it points the other way).
const ELEMENTS = [
  ['.shop-logo', 'header:logo'],
  ['.shop-nav li:nth-child(2) a', 'header:nav:packs-and-bags'],
  ['.shop-cart', 'header:cart'],
  ['.crumbs a:nth-of-type(2)', 'pdp:breadcrumb:packs-and-bags'],
  ['.swatch-picker label:nth-of-type(2)', 'pdp:colour:buoy:tidepool-daypack:tg-pk-101'],
  ['form button[type=submit]', 'pdp:add-to-cart:tidepool-daypack:tg-pk-101'],
  ['.added-msg a', 'pdp:view-cart:tidepool-daypack:tg-pk-101'],
  ['[data-wishlist]', 'pdp:wishlist:tidepool-daypack:tg-pk-101'],
  ['[data-module=related] .card:nth-child(2) h3 a', null], // pdp:related:2:{product}:{sku}
  ['.shop-foot a[href*="sitemap"], .shop-foot a[href*="plan-du-site"]', 'footer:sitemap'],
  ['.lang-switch a', null],
];

(async () => {
  const browser = await chromium.launch({ args: ['--host-resolver-rules=MAP lab.test 127.0.0.1'] });
  const failures = [];
  const names = {};
  for (const [lang, path, other] of [['en-CA', '/shop/product/tidepool-daypack/', 'fr'], ['fr-CA', '/fr/boutique/produit/sac-de-jour-tidepool/', 'en']]) {
    const ctx = await browser.newContext({ locale: 'en-US' });
    const page = await ctx.newPage();
    await page.goto(B + path);
    await page.waitForTimeout(800);
    // Stay on the page: links still fire their handlers, but don't navigate
    await page.evaluate(() => document.addEventListener('click', (e) => { if (e.target.closest('a')) e.preventDefault(); }, true));
    names[lang] = [];
    for (const [sel, expected] of ELEMENTS) {
      const before = await page.evaluate(() => window.dataLayer.length);
      await page.locator(sel).first().click();
      await page.waitForTimeout(150);
      const pushed = await page.evaluate((n) => window.dataLayer.slice(n).filter((e) => e && e.link_name), before);
      if (pushed.length !== 1) { failures.push(`${lang} ${sel}: ${pushed.length} pushes with a link name, expected 1`); continue; }
      const name = pushed[0].link_name;
      names[lang].push(sel.includes('lang-switch') ? name.replace(/:(en|fr)$/, ':{to}') : name);
      if (!FORMAT.test(name) || name.length > 100) failures.push(`${lang} ${sel}: bad format "${name}"`);
      if (expected && name !== expected) failures.push(`${lang} ${sel}: "${name}", expected "${expected}"`);
      if (sel.includes('related') && !/^pdp:related:2:[a-z0-9-]+:[a-z0-9-]+$/.test(name)) failures.push(`${lang} related: "${name}"`);
      if (sel.includes('lang-switch') && name !== `header:language:${other}`) failures.push(`${lang} language switch: "${name}"`);
    }
    // Adobe side: every hit with a link name carries the matching variables
    await page.waitForTimeout(1200);
    const hits = await page.evaluate(() => (window.labEdgeLog || []).filter((e) => e.xdm).map((e) => ({ name: e.xdm.web?.webInteraction?.name || e.xdm.eventType, lab: e.data?.lab || {}, v: e.data?.__adobe?.analytics || {} })));
    const named = hits.filter((h) => h.lab.link && h.lab.link.name);
    if (named.length < ELEMENTS.length - 1) failures.push(`${lang}: only ${named.length} Adobe hits with a link name`);
    for (const h of named) {
      const v = h.v, n = h.lab.link.name;
      if (v.prop4 !== n || v.eVar9 !== n) failures.push(`${lang} ${h.name}: prop4 ${v.prop4} / eVar9 ${v.eVar9}, expected ${n}`);
      if (v.prop5 !== h.lab.link.region || v.eVar10 !== h.lab.link.region) failures.push(`${lang} ${h.name}: prop5/eVar10 not the region`);
      if (!String(v.events || '').split(',').includes('event5')) failures.push(`${lang} ${h.name}: no event5`);
      for (const k of ['eVar1', 'eVar2', 'eVar3', 'eVar4', 'eVar5', 'eVar6']) if (!v[k]) failures.push(`${lang} ${h.name}: missing ${k}`);
    }
    console.log(lang, '\n  ' + names[lang].join('\n  '));
    await ctx.close();
  }
  if (JSON.stringify(names['en-CA']) !== JSON.stringify(names['fr-CA'])) failures.push('English and French link names differ');
  await browser.close();
  if (failures.length) { console.log(failures.join('\n')); process.exit(1); }
  console.log('Link name checks passed.');
})();
