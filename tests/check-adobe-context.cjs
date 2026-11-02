// Adobe Web SDK variable check. Runs page views and interactions through the
// mock Edge Network in both languages and checks every request the SDK sends:
//   - eVar1-5 (page type, section, page language, browser language, match)
//     are on EVERY request, page views and interactions alike
//   - prop1 (page name) only on page views; prop2 (interaction) on every
//     other request; prop3 (video name) on media events; prop4 (link name)
//     on teaser clicks; all values in English
// Usage: node tests/check-adobe-context.cjs [base URL, default http://lab.test:8787]
// (The SDK won't accept an IP address as its edge domain, so the default maps
// lab.test to 127.0.0.1.)
const { chromium } = require('playwright');
const B = process.argv[2] || 'http://lab.test:8787';

(async () => {
  const browser = await chromium.launch({ args: ['--host-resolver-rules=MAP lab.test 127.0.0.1'] });
  const failures = [];
  const sent = async (page) => {
    await page.waitForTimeout(1200);
    return page.evaluate(() => (window.labEdgeLog || []).filter((e) => e.xdm).map((e) => ({ type: e.xdm.eventType, name: e.xdm.web?.webInteraction?.name, vars: e.data?.__adobe?.analytics || {} })));
  };
  const check = (label, reqs, lang) => {
    if (!reqs.length) failures.push(`${label}: no Web SDK requests`);
    for (const r of reqs) {
      const v = r.vars, isView = r.type === 'web.webpagedetails.pageViews';
      for (const k of ['eVar1', 'eVar2', 'eVar3', 'eVar4', 'eVar5']) if (!v[k]) failures.push(`${label} ${r.type}: missing ${k}`);
      if (v.eVar3 !== lang) failures.push(`${label} ${r.type}: eVar3 ${v.eVar3}, expected ${lang}`);
      if (isView && !v.prop1) failures.push(`${label}: page view without prop1`);
      if (!isView && v.prop1) failures.push(`${label} ${r.type}: prop1 on a non-page-view hit`);
      if (!isView && !v.prop2) failures.push(`${label} ${r.type}: missing prop2 (interaction)`);
    }
    return reqs;
  };

  for (const [lang, pdp, story] of [['en-CA', '/shop/product/tidepool-daypack/', '/media/article/ferry-schedule-shakeup/'],
                                     ['fr-CA', '/fr/boutique/produit/sac-de-jour-tidepool/', '/fr/medias/article/nouvel-horaire-du-traversier/']]) {
    const ctx = await browser.newContext({ locale: 'en-US' });
    const page = await ctx.newPage();
    // Product page: page view, product viewed, product list viewed, then cart add
    await page.goto(B + pdp);
    await page.locator('form button[type=submit]').first().click();
    const shop = check(`${lang} product page`, await sent(page), lang);
    // Media: page view, video start, teaser click
    await page.goto(B + story);
    await page.evaluate(() => { const v = document.querySelector('video'); v.muted = true; return v.play(); });
    await page.waitForTimeout(800);
    await page.evaluate(() => document.addEventListener('click', (e) => { if (e.target.closest('a')) e.preventDefault(); }, true));
    await page.locator('.read-next a').first().click();
    const media = check(`${lang} story`, await sent(page), lang);
    const video = media.find((r) => r.name === 'media start');
    const click = media.find((r) => r.name === 'content clicked');
    if (!video || video.vars.prop3 !== 'What the new ferry schedule means for commuters') failures.push(`${lang}: media start prop3 = ${video?.vars.prop3}`);
    if (!click || !/^[A-Z][a-z]/.test(click.vars.prop4 || '') || /[éèàô]/.test(click.vars.prop4)) failures.push(`${lang}: content clicked prop4 = ${click?.vars.prop4}`);
    console.log(lang, [...shop, ...media].map((r) => `${r.name || r.type}: ${JSON.stringify(r.vars)}`).join('\n   '));
    await ctx.close();
  }
  await browser.close();
  if (failures.length) { console.log(failures.join('\n')); process.exit(1); }
  console.log('Adobe variable checks passed.');
})();
