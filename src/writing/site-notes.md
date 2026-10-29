---
title: Notes on this site's development
description: How markdanalytics.ca was built, and what was done for mobile, accessibility, SEO, AI answer engines, privacy and analytics, including what's still open.
pubDate: 2026-10-29
updatedDate: 2026-10-29
---

**In short:** this is a static site built with Astro, hosted on Cloudflare, and deployed automatically from GitHub. I built it in one working session on 29 October 2026 with the help of Claude, Anthropic's AI assistant, which wrote most of the code while I set the direction, made the decisions and reviewed the results. Every page is tested on phone-sized screens, scores 100 for accessibility in automated checks, and carries structured data for search engines and AI assistants. The demo store and news site exist to test analytics tags; their contents are fictional.

## How it's built

| Part | What it uses | Why |
|---|---|---|
| Site generator | [Astro](https://astro.build), with pages written in Markdown | Outputs plain HTML, ships no JavaScript unless a page needs it |
| Hosting | Cloudflare Workers (static files plus a small Worker) | Fast worldwide, free at this scale |
| Domain | Cloudflare Registrar | Same account as hosting and DNS |
| Source code | GitHub | Every change is versioned; a push publishes the site in about two minutes |
| Styling | Hand-written CSS, system fonts | No font downloads, no CSS framework |
| Analytics | Google Tag Manager with GA4; Adobe Web SDK against a stand-in endpoint | See below |

The small Worker does two jobs: it stands in for Adobe's Edge Network so the Adobe Web SDK can run without an Adobe account, and it delivers contact form messages. Everything else is static files.

## Languages

The whole site is available in English and French. The French follows Quebec usage (`fr-CA`): courriel, magasiner, fin de semaine, and Quebec punctuation spacing. English pages live at the root (`/shop/cart/`) and French pages under `/fr/` with French addresses (`/fr/boutique/panier/`), so French speakers can read and share them. One English-to-French word list drives every address, so links, the EN | FR switch, `hreflang` and the sitemap always agree.

- **One page, two routes.** Each French route renders the same page component as the English one, and the page works out its language and its English twin from its own address. Shared layouts carry the translated menus and labels, so a new page needs its text in both languages and nothing else.
- **Search engines** get `hreflang` links between the two versions (plus `x-default` pointing to English), `og:locale` for sharing previews, `inLanguage` in the structured data, and both versions in the [XML sitemap](/sitemap.xml).
- **Analytics** records two separate languages on every page: `page.language`, the version being read (`en-CA` or `fr-CA`), and `user.browserLanguage`, the visitor's preferred browser language, plus `user.languageMatch` when the two agree. In GA4 they're `page_language`, `browser_language` and `language_match`; in Adobe, `prop3`/`eVar2`, `prop4`/`eVar3` and `prop5`. Using the language switch sends `language_switch` (GA4) and `language switched` (Adobe).
- **Analytics is in English, except the address.** Page names, content titles, product, list and promotion names, video titles and link text are English on both versions, so an analyst working in one language can read every report, and a page is one row in a top-pages list. The URL is the real, French address, like Adobe's Page URL beside an English `pageName`. GA4 has no `pageName`, so its `page_title` is set to the English page name. The language variables are how analysts split the two versions. [Measuring a multilingual site](/practice/multilingual-sites/) explains the approach.

## Analytics

Analytics is the point of this site, so the implementation follows the standards on the [analytics practice](/practice/) page:

- Every page describes itself in one data object, pushed to both `dataLayer` (Google) and `adobeDataLayer` (Adobe) before any tag manager loads. [How this site's data layer works](/blog/how-this-sites-data-layer-works/) explains it.
- The conventions are enforced, not just documented. Allowed page types, sections, page-name formats and event names live in one file, and the build fails if any page breaks them. Outside production, every data layer push is also checked for unregistered events and for keys that suggest personal data.
- The Adobe Web SDK runs for real against a stand-in Edge Network on this domain. [Testing the Adobe Web SDK without an Adobe account](/blog/testing-adobe-web-sdk-without-an-adobe-account/) explains how.
- GA4 is set up through Google Tag Manager, with the container configuration kept in the site's repository so changes are versioned too.

## Mobile

- Layouts are responsive and designed for phones as well as desktops: grids collapse to one column and menus wrap rather than overflow.
- Every page was checked at 390 and 360 pixels wide (common phone sizes), with no sideways scrolling.
- Menu links and buttons have tap targets of 34–45 pixels. The first check found menu links only 19 pixels tall, and they were fixed.
- Form fields use 16-pixel text, so phones don't zoom in when a field is tapped.

Lighthouse scores in its mobile mode, out of 100 (run against a local copy of the site):

| Page | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Home | 96 | 100 | 96 | 100 |
| Analytics practice | 98 | 100 | 96 | 100 |
| Demo product page | 98 | 100 | 96 | 66* |
| Demo article with video | 100 | 100 | 96 | 66* |
| Contact | 98 | 100 | 96 | 66* |

\*These pages are deliberately kept out of search results, which Lighthouse counts against SEO. Best practices loses points for console errors that only occur in the local copy, where the stand-in Adobe endpoint doesn't run.

## Accessibility

- Semantic HTML: header, navigation, main and footer landmarks; exactly one main heading per page; headings in order.
- Every form field has a visible label. Form errors name the field and move focus to it, and status messages are announced to screen readers.
- Keyboard focus is always visible.
- Animation is switched off for people who've set their device to reduce motion.
- Decorative illustrations are hidden from screen readers; meaningful ones have text alternatives.
- The demo store's checkout progress and the Event log's tabs expose their state to assistive technology.

The 100 scores come from automated checks, which catch only part of what matters. The site hasn't yet been tested with a screen reader or reviewed against WCAG 2.2 by hand; that's on the list below.

## Search engines (SEO)

- Every page has a unique title and a description written for search results.
- Canonical URLs, so each page has one official address.
- A [sitemap](/sitemap.xml) listing the content pages with their last-updated dates, and a [robots.txt](/robots.txt) pointing to it.
- Sharing previews for LinkedIn, Slack and X: title, description and an image.
- An [RSS feed](/rss.xml) for posts and practice pages.
- Kept out of search on purpose: the demo store and news site (fictional content), the contact page, and the 404 page.

## AI answer engines (AEO)

AI assistants increasingly answer questions directly instead of sending people to pages. To be a source they can find, understand and credit:

- **Structured data** on every content page (schema.org): who wrote it, which site it belongs to, when it was published and updated, its topics, and where it sits in the site.
- **An [llms.txt](/llms.txt) file**, a plain-text guide to the site for AI tools. It's an informal proposal rather than a standard, but cheap to provide. It also tells AI tools that the demo sites are fictional, so they aren't cited as real.
- **Answer-first writing**: pages open with the conclusion, use descriptive headings, and put comparisons in tables.
- **Crawler access**: the site's robots.txt allows crawlers. Cloudflare can separately block AI crawlers at the network edge; which AI search and assistant crawlers are allowed is set in Cloudflare's AI Crawl Control.

## Privacy

- The contact form never exposes my email address, in the page or in the source code. Messages go from the form to my inbox through Cloudflare and aren't stored anywhere else.
- No personal data goes into analytics. The contact form records only that it was used and the topic picked, and automated checks warn if a data layer push contains keys like `email` or `phone`.
- The Adobe Web SDK sets an identity cookie, but on this site it holds a made-up ID and nothing is sent to Adobe.

## Performance

- Pages are plain HTML generated in advance, so there's nothing to compute when you visit.
- System fonts mean no font files to download.
- JavaScript loads only where a page needs it: the store's cart, the video tracking, the contact form, and the analytics tags themselves.

## Still to do

- Test with a screen reader and review against WCAG 2.2 by hand.
- Add a cookie and consent notice before the GA4 tags go live, and connect it to consent settings in GTM and the Web SDK.
- Publish the GA4 configuration in Google Tag Manager.
- Submit the sitemap to Google Search Console and Bing Webmaster Tools.
- Add an About page with my background, so readers and AI assistants can judge the expertise behind the writing.
- Write the planned [analytics practice](/practice/) pages.

## Change log

- **29 October 2026, later:** French versions of every page, the EN | FR language switch, and language variables (page language and browser language) in both data layers, GA4 and the Adobe Web SDK.
- **29 October 2026:** Site launched with the blog, demo store and demo news site, both data layers, and the Event log. Adobe Web SDK with stand-in Edge Network; Google Tag Manager and GA4 configuration; analytics practice section; contact page; enforced analytics conventions; sitemap, structured data and other SEO and AEO work; mobile tap-target fixes; this page.
