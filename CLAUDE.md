# markdanalytics.ca — working notes for Claude

Astro 7 static site on Cloudflare Workers (static assets + `src/worker.ts`).
Push to `main` → Cloudflare builds and deploys in ~2 min. Owner: Mark Dykeman.
Read this first; open other files only when the task needs them.

## Where things live

| Need to change… | Edit |
|---|---|
| Menu, sections, section addresses (EN/FR) | `src/config/sections.ts` (one place; drop-downs and fly-outs in `SUBMENUS`; a fly-out lists its section's pages automatically) |
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
| Requirements + SDR (web pages AND Excel) | `src/data/sdr.json` → pages render it via `src/components/sdr/SdrTable.astro`; Excel: `python3 scripts/build-sdr-xlsx.py` then recalc (xlsx skill `recalc.py`) |
| Spec wireframe (numbered, EN/FR) | `python3 scripts/build-wireframes.py` → `public/images/specs/` |
| Implementation map (diagram + status table, EN/FR) | `src/components/ImplementationMap.astro` (edit `STREAMS`; each box has a status and a link) |
| Old URL → new URL | `public/_redirects` |
| Sitemap, RSS, llms.txt | generated from sections via `src/lib/indexable.ts`; no manual edits |

Adding a page = one Markdown file per language (+ an `FR_SEGMENTS` entry). Hubs, home cards,
sitemap, RSS and llms.txt update themselves. Template: `src/content/pages/_page-template.md`.

## Rules (the site is a portfolio; it must practise what it preaches)

- **Every analytics value is English**, whatever the page language (page names, titles,
  products, link names, video titles). Only the address is in the page's language.
  `page.language` / `user.browserLanguage` let analysts split languages.
- **Adobe:** eVars describe context and go on EVERY hit (eVar1 page name, eVar2 type, eVar3 section, eVar4 page
  language, eVar5 browser language, eVar6 match; Hit expiry). Props count things on their own
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
npm run test:links                   # product page link names, EN = FR, Adobe link vars
npm run test:scroll                  # page scroll reach 25/50/75/100 → event11-14
```
(Playwright: `npm install --no-save playwright && npx playwright install chromium`.)
Commit as Mark Dykeman <mark.toronto@gmail.com>.

## Status (Nov 2026)

Structure follows Mark's site map: Basics, Process, Implementation artifacts, Data quality,
Case studies, Store, Media site, About.
- Home page: short intro → the implementation map (`<ImplementationMap colorBy="stream" table={false} />`, coloured
  by stream, dashed = not on the site yet, a linked list on phones) → "What the map shows" → demo sites → recently
  updated. Basics and Process are `hidden: true` in `sections.ts`: out of the menu and home page, pages still live
  (Process pages are reached from the map). A site-wide "Draft" notice sits above the header in `BlogLayout.astro`;
  remove it when Mark says the site is ready.
- Process: the implementation map (`/process/implementation-map/`) is the high-level page: requirements → SDR →
  four streams (platform setup, page and tag setup, procedure/documentation, maintenance). Every box links to its
  content and carries a status (live / partial or simulated / planned); keep the statuses honest when content lands.
  `/process/variable-setup/` compares variable setup in Adobe Analytics, CJA and GA4. The Adobe side (bridge script,
  mock Edge) is always described as a workaround for having no Adobe account. `/process/consent-handling/` is the consent standard
  (Web SDK defaultConsent/setConsent, Google consent mode, QA states); the banner itself is NOT built: the site still
  runs defaultConsent "in" and loads GTM with no consent defaults. Planned boxes with no page yet: permissions,
  engagement model, data monitoring, data alerts.
- Implementation artifacts: DONE (requirements, SDR + Excel, developer/business views,
  product-page spec with wireframe + link naming convention, data layer spec). Link names
  (`link_click` / `link clicked`, region:element:detail) are BUILT on the product page by
  `src/scripts/link-names.ts` (templates mark containers: data-region/-module/-position/-item-id;
  prop4+eVar9 name, prop5+eVar10 region, event5). The dev SDR page renders the script's source;
  `npm run test:links` checks EN = FR. Other store pages and the media site aren't named yet.
- SDR 1.3 (Nov 28): Mark's requirements BR-11..BR-21 imported from his Excel; new variables (article/video
  metadata as eVar11-24 + prop8-20, prop6/7 page type/section, campaign, eVar25/prop21 search, event6-10) are all
  PROPOSED: designed, not sent. Building them needs data layer keys (media.author/subject/publishDate,
  content.characterCount, search.*) + bridge + GTM + tests. Sites are all / store-media / store / media.
- Page scroll reach is LIVE on every page (`trackPageScroll` in `src/scripts/scroll.ts`, loaded from Base.astro):
  page_scroll / page scrolled at 25/50/75/100% of the scrollable page → event11-14. Article body reading
  (`trackScrollDepth`, content scrolled, event3 proposed) is separate.
- Data quality: TODO: why QA matters; QA docs = spec tables + checked/date/method columns,
  quarterly cadence, automated checks listed, illustrative history; spider design page
  (build later, downloadable for visitors, possibly a Claude agent).
- About: résumé is live in both languages (no phone or email on the page; the contact form is the
  only route). "What I'm looking for" is a short draft for Mark to confirm. No PDF download yet.
- Blog header is two rows: logo left with Contact button + EN/FR top right (`.blog-tools`), menu
  below (`.blog-menu`). On the store and media site the Contact link is in the demo ribbon (`Base.astro`).
- Case studies: placeholder until Mark supplies content.
