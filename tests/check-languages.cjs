// Site-wide language check. Crawls every page in both languages from a running
// local copy (npm run build, then npx wrangler dev) and checks that:
//   - every link works and every page has an EN | FR switch
//   - <html lang>, page.language and the hreflang links are right
//   - user.browserLanguage and user.languageMatch follow the browser setting
//   - each French page's language switch leads to an English page that
//     switches back to it, and both send the same page.name and content.title
//     (analytics values are English on both versions; only the address differs)
// Usage: node tests/check-languages.cjs [base URL, default http://127.0.0.1:8787]
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://127.0.0.1:8787';

(async () => {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ locale: 'fr-CA' })).newPage();
  const seen = new Set(), queue = ['/', '/fr/'], rows = [], failures = [];
  while (queue.length) {
    const path = queue.shift();
    if (seen.has(path)) continue;
    seen.add(path);
    const res = await page.goto(BASE + path, { waitUntil: 'load' });
    if (res.status() >= 400) { failures.push(`${path}: HTTP ${res.status()}`); continue; }
    const r = await page.evaluate(() => {
      const lp = window.labPage || {};
      return {
        htmlLang: document.documentElement.lang,
        language: lp.page?.language, name: lp.page?.name, pagePath: lp.page?.path, title: lp.content?.title,
        browserLanguage: lp.user?.browserLanguage, languageMatch: lp.user?.languageMatch,
        switchHref: document.querySelector('.lang-switch a[hreflang]')?.getAttribute('href'),
        hreflang: [...document.querySelectorAll('link[rel=alternate][hreflang]')].map((l) => l.hreflang).join(','),
        links: [...document.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href').split('#')[0].split('?')[0]),
      };
    });
    const fr = path.startsWith('/fr/');
    const expect = fr ? 'fr-CA' : 'en-CA';
    if (r.htmlLang !== expect || r.language !== expect) failures.push(`${path}: lang ${r.htmlLang} / page.language ${r.language}`);
    if (r.browserLanguage !== 'fr-CA' || r.languageMatch !== fr) failures.push(`${path}: browserLanguage ${r.browserLanguage}, languageMatch ${r.languageMatch}`);
    if (!r.switchHref) failures.push(`${path}: no language switch`);
    if (r.hreflang !== 'en-CA,fr-CA,x-default') failures.push(`${path}: hreflang ${r.hreflang}`);
    rows.push({ path, ...r });
    for (const h of [...r.links, r.switchHref]) if (h && h.endsWith('/') && !seen.has(h)) queue.push(h);
  }
  const byPath = new Map(rows.map((r) => [r.path, r]));
  const en = rows.filter((r) => !r.path.startsWith('/fr/'));
  for (const r of rows.filter((r) => r.path.startsWith('/fr/'))) {
    const twin = byPath.get(r.switchHref);
    if (!twin) { failures.push(`${r.path}: language switch goes to ${r.switchHref}, which wasn't found`); continue; }
    if (twin.switchHref !== r.path) failures.push(`${r.path}: English twin ${twin.path} switches back to ${twin.switchHref}`);
    for (const k of ['name', 'title']) if (r[k] !== twin[k]) failures.push(`${r.path}: ${k} "${r[k]}" differs from English "${twin[k]}"`);
  }
  await browser.close();
  console.log(`${rows.length} pages checked (${en.length} English, ${rows.length - en.length} French)`);
  if (failures.length) { console.log(failures.join('\n')); process.exit(1); }
  console.log('All language checks passed.');
})();
