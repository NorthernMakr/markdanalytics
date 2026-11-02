# markdanalytics.ca — working notes for Claude

Astro 7 static site on Cloudflare Workers (static assets + `src/worker.ts`).
Push to `main` → Cloudflare builds and deploys in ~2 min. Owner: Mark Dykeman.
Read this first; open other files only when the task needs them.

## Where things live

| Need to change… | Edit |
|---|---|
| Menu, sections, section addresses (EN/FR) | `src/config/sections.ts` (one place) |
| A content page | `src/content/pages/<section>/<file>.md`; French: `src/content/pages/fr/<section>/<same file>.md` |
| A page's French address | `FR_SEGMENTS` in `src/i18n/index.ts` |
| Section page layout / hub list | `src/pages/[section]/[...slug].astro` (French route just re-renders it) |
| Site name, tagline, tag IDs | `src/config/tags.ts` |
| Allowed page types/sections/events (enforced at build) | `src/config/analytics.ts` |
| `<head>`, data layer setup, load order | `src/layouts/Base.astro` |
| Site chrome (menu, footer) | `src/layouts/BlogLayout.astro`; store `ShopLayout.astro`; news `MediaLayout.astro` |
| Store events / video / scroll | `src/scripts/commerce.ts`, `video.ts`, `scroll.ts` |
| Adobe Web SDK mapping (eVars/props/XDM) | `public/lab/websdk-bridge.js` |
| GA4 container | `gtm/build-container.py` → regenerate JSON with `python3 gtm/build-container.py` |
| Demo products / stories (with French text) | `src/data/products.ts`, `src/data/articles.ts` |
| Old URL → new URL | `public/_redirects` |
| Sitemap, RSS, llms.txt | generated from sections via `src/lib/indexable.ts`; no manual edits |

Adding a page = one Markdown file per language (+ an `FR_SEGMENTS` entry). Hubs, home cards,
sitemap, RSS and llms.txt update themselves. Template: `src/content/pages/_page-template.md`.

## Rules (the site is a portfolio; it must practise what it preaches)

- **Every analytics value is English**, whatever the page language (page names, titles,
  products, link names, video titles). Only the address is in the page's language.
  `page.language` / `user.browserLanguage` let analysts split languages.
- **Adobe:** eVars describe context and go on EVERY hit (eVar1 type, eVar2 section, eVar3 page
  language, eVar4 browser language, eVar5 match; Hit expiry). Props count things on their own
  hit (prop1 page name, prop2 interaction, prop3 video name, prop4 link name).
- **GA4 purchase `value`** = sum of price × quantity (no tax/shipping). Adobe XDM
  `order.priceTotal` includes tax and shipping.
- No personal data in data layers. Contact address lives only in the `CONTACT_TO` secret.
- French is Quebec usage (courriel, magasiner, fin de semaine; no space before ? ! ;).
- Every claim about Adobe/Google behaviour links an official source; docs must match what the
  code sends. Mock Edge proves client payloads only, not Adobe-side processing.
- External links in Markdown open in a new window automatically (rehype plugin).

## Check before pushing

```
npx astro build                      # fails on analytics convention breaks
npx wrangler dev --port 8787 &       # then:
npm run test:languages               # every page EN+FR, links, switch, twins
npm run test:purchase                # GA4/Adobe purchase payloads
npm run test:adobe                   # eVars/props on every Web SDK hit (uses lab.test)
```
(Playwright: `npm install --no-save playwright && npx playwright install chromium`.)
Commit as Mark Dykeman <mark.toronto@gmail.com>.

## Work in progress (Nov 2026 restructure)

Structure follows Mark's site map: Basics, Process, Implementation artifacts, Data quality,
Case studies, Store, Media site, About. Still to build:
- Implementation: mock business requirements → Adobe SDR (web + Excel) → developer and
  business-user versions → Confluence-style spec with numbered wireframe + link-name table.
  Link names = link text + context (e.g. `buy-now:<product_name>:<sku>`); spec must state which
  parts are fixed vs variable. `implementation/data-layer-specification.md` is a draft.
- Data quality: why QA matters; QA docs = spec tables + checked/date/method columns, quarterly
  cadence, automated checks listed, illustrative history; spider design page (build later,
  downloadable for visitors, possibly a Claude agent).
- About (résumé, what Mark is looking for) and Case studies are placeholders until Mark supplies content.
