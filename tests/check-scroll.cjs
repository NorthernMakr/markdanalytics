// Page scroll reach check (src/scripts/scroll.ts, trackPageScroll), both languages:
//   - nothing is sent on load
//   - scrolling to the bottom sends page_scroll at 25, 50, 75 and 100, once each
//     (scrolling up and down again sends nothing more)
//   - each Adobe hit carries event11/12/13/14 for its milestone, prop2
//     "page scrolled", and eVar1-6 like every hit
// Usage: node tests/check-scroll.cjs [base URL, default http://lab.test:8787]
const { chromium } = require('playwright');
const B = process.argv[2] || 'http://lab.test:8787';
const EVENT = { 25: 'event11', 50: 'event12', 75: 'event13', 100: 'event14' };
const PAGES = [
  ['en-CA', '/implementation/sdr/'], ['fr-CA', '/fr/mise-en-oeuvre/sdr/'],
  ['en-CA', '/shop/product/tidepool-daypack/'], ['fr-CA', '/fr/boutique/produit/sac-de-jour-tidepool/'],
  ['en-CA', '/media/article/ferry-schedule-shakeup/'], ['fr-CA', '/fr/medias/article/nouvel-horaire-du-traversier/'],
];

(async () => {
  const browser = await chromium.launch({ args: ['--host-resolver-rules=MAP lab.test 127.0.0.1'] });
  const failures = [];
  const depths = (page) => page.evaluate(() => window.dataLayer.filter((e) => e && e.event === 'page_scroll').map((e) => e.percent_scrolled));
  const scrollThrough = async (page, down = true) => {
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y <= h; y += 150) {
      await page.evaluate((v) => window.scrollTo(0, v), down ? y : h - y);
      await page.waitForTimeout(30);
    }
    await page.evaluate((v) => window.scrollTo(0, v), down ? h : 0);
    await page.waitForTimeout(200);
  };
  for (const [lang, path] of PAGES) {
    const ctx = await browser.newContext({ locale: 'en-US', viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    await page.goto(B + path);
    await page.waitForTimeout(600);
    const onLoad = await depths(page);
    if (onLoad.length) failures.push(`${path}: ${onLoad.length} page_scroll on load`);
    await scrollThrough(page);
    await scrollThrough(page, false);
    await scrollThrough(page);
    const got = await depths(page);
    if (JSON.stringify(got) !== '[25,50,75,100]') failures.push(`${path}: page_scroll ${JSON.stringify(got)}, expected [25,50,75,100]`);
    await page.waitForTimeout(1200);
    const hits = await page.evaluate(() => (window.labEdgeLog || []).filter((e) => e.xdm && e.data && e.data.lab && e.data.lab.scroll)
      .map((e) => ({ depth: e.data.lab.scroll.depth, v: e.data.__adobe.analytics })));
    if (hits.length !== 4) failures.push(`${path}: ${hits.length} Adobe page scrolled hits, expected 4`);
    for (const h of hits) {
      if (h.v.events !== EVENT[h.depth]) failures.push(`${path} ${h.depth}%: events ${h.v.events}, expected ${EVENT[h.depth]}`);
      if (h.v.prop2 !== 'page scrolled') failures.push(`${path} ${h.depth}%: prop2 ${h.v.prop2}`);
      for (const k of ['eVar1', 'eVar2', 'eVar3', 'eVar4', 'eVar5', 'eVar6']) if (!h.v[k]) failures.push(`${path} ${h.depth}%: missing ${k}`);
      if (h.v.eVar4 !== lang) failures.push(`${path}: eVar4 ${h.v.eVar4}, expected ${lang}`);
    }
    console.log(lang, path, JSON.stringify(got), hits.map((h) => h.v.events).join(' '));
    await ctx.close();
  }
  await browser.close();
  if (failures.length) { console.log(failures.join('\n')); process.exit(1); }
  console.log('Page scroll checks passed.');
})();
