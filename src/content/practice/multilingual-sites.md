---
title: Measuring a multilingual site
description: "How to track a site that exists in more than one language: one reporting language for every value, language as a variable to segment on, and the page-language versus browser-language distinction."
pubDate: 2026-10-29
category: Analytics practice
tags: [multilingual, language, data layer, Adobe Analytics, GA4, governance]
platform: Both
---

**The rule:** everything sent to analytics is in one reporting language, whatever language the visitor is reading. Language is recorded separately, as variables analysts can segment on. This site is in English and French, and every value it sends to Adobe and Google is English.

## Why one reporting language

Analysts usually work in one language. The data they see in Analysis Workspace or GA4 has to make sense to them, whichever version of the site produced it. A French headline in a top-content report is noise to an English-speaking analyst, and the reverse is just as true.

There's a second, bigger reason: **splitting a page by language breaks the standard reports.** Most analysis starts with a list of top pages. If `/shop/` and `/fr/boutique/` arrive as two rows with two names, the English version usually wins on volume, and the French traffic disappears below the fold or into "Other". The team concludes the French pages don't matter, when they were just counted separately. One row per page, with language as a breakdown, avoids that.

## What stays in the reporting language

Everything an analyst might see as a dimension value:

| Value | English page | French page |
|---|---|---|
| Page name | `shop:product:tidepool-daypack` | `shop:product:tidepool-daypack` |
| Content title | How this site's data layer works | How this site's data layer works |
| Product, colour | Tidepool daypack, Buoy | Tidepool daypack, Buoy (shown as "Bouée") |
| List and promotion names | Home: featured | Home: featured |
| Video title | What the new ferry schedule means for commuters | the same |
| Link text on teaser clicks | The English headline | The English headline |
| Form topic, payment type, shipping tier | `credit card`, `standard` | the same |

The visitor sees French; the data layer carries English. In practice, this means each translatable thing has a stable English value (an ID, a slug, the English title) that the page sends to analytics, and a display value it shows on screen. On this site, product colours are a radio button whose `value` is English and whose label is French, and teaser links carry the English headline in a `data-link-name` attribute.

### The address is the exception

The URL is for visitors, not analysts, so it's in the page's language: `/fr/boutique/produit/sac-de-jour-tidepool/` rather than `/fr/shop/product/tidepool-daypack/`. French speakers can read and share it, and search engines see a French page. The page path in reports is the real address.

That works because **the page name, not the path, is what combines the two versions.** Adobe teams already work this way: `pageName` is the report everyone uses, and Page URL is a secondary dimension. GA4 needs a little help to behave the same way (next section).

## The language variables

Two different languages are worth recording, and they answer different questions.

| Variable | Means | Set | Example |
|---|---|---|---|
| `page.language` | The version of the page being read | When the page is built | `fr-CA` |
| `user.browserLanguage` | The language the visitor's browser asks for | As the page loads, from `navigator.languages` | `en-US` |
| `user.languageMatch` | Whether those two agree | As the page loads | `false` |

Page language segments everything: French-version conversion rate, French video completion, which posts are read in French. Browser language describes the audience. When they disagree, it's a useful signal: someone whose browser prefers French is reading the English page, maybe because a link sent them there or because the French version is missing.

Both platforms already collect a browser language of their own. GA4's [Language dimension](https://support.google.com/analytics/answer/9268042?hl=en) is "the language setting of the device OS", and Adobe has a [Language dimension](https://experienceleague.adobe.com/en/docs/analytics/components/dimensions/language) of its own. Sending `browser_language` explicitly still helps: it uses the same format on both platforms, it sits next to `page_language` on every event, and it makes the match flag possible. Neither platform knows the page language unless you send it.

### Mapping on this site

| Data layer | Adobe Analytics (Web SDK) | GA4 |
|---|---|---|
| `page.language` | `prop3`, `eVar2` | `page_language` |
| `user.browserLanguage` | `prop4`, `eVar3` | `browser_language` |
| `user.languageMatch` | `prop5` (`match` / `mismatch`) | `language_match` (`match` / `mismatch`) |
| Language switch click | `language switched` | `language_switch` with `language_from`, `language_to` |

The match flag is sent as a word rather than `true`/`false`, so it reads clearly in a report. In GTM, a lookup table variable does the conversion.

## Making GA4 work like Adobe

If you think in Adobe first, the gap is this: **GA4 has no `pageName`.** Its standard Pages and screens report groups by page title or page path, and GA4 reads both from the browser ([Measure pageviews](https://developers.google.com/analytics/devguides/collection/ga4/views)). On a French page, that's a French tab title and a French address, so every page would arrive twice.

The fix is to choose what GA4's page title means. This site's Google tag sends the English page name as `page_title`, so GA4's page title report becomes the equivalent of Adobe's Pages report.

| Adobe Analytics | GA4 on this site | Language |
|---|---|---|
| `pageName` | `page_title` (overridden with the page name), plus `page_name` as a custom dimension | English on every version |
| Page URL | `page_location` and page path (left as collected) | The page's language |
| `prop3` / `eVar2` page language | `page_language` | `en-CA`, `fr-CA` |
| `prop4` / `eVar3` browser language | `browser_language` | as the browser reports it |

The tab title visitors see is still French; only the value sent to GA4 changes. The trade-off is that GA4's "Page title" no longer shows the human-written title, which is why the page names on this site are readable (`shop:product:tidepool-daypack`) rather than codes.

## Values the platforms collect by themselves

Some values aren't in your data layer at all, and they'll split by language unless you take control of them.

- **GA4 `page_title`**, covered above.
- **Adobe's `pageName`** comes from `web.webPageDetails.name`, which the bridge script sets from the English `page.name`. Left empty, Adobe would fall back to the URL.
- **Link tracking** that reads the clicked text (automatic link collection, or a GTM "Click Text" variable) picks up whatever language the page is in. Prefer a data attribute with the English value, as this site does for teasers.

Search engines need the opposite: they must see each language version as its own page. That's what `hreflang` links are for ([Google's guide to localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)). Analytics combines, SEO separates, and both are right for their audience.

## Adding another language

Nothing in this approach is specific to French. Adding Simplified Chinese, for example, would work the same way:

- The pages would live under `/zh/`, with addresses in Chinese or pinyin, and `hreflang` links like the French pages. Adding the address words to the site's English-to-other-language word list is the only routing change.
- `page.language` would be `zh-CN`, added to the build's list of allowed languages.
- **Every analytics value would stay exactly as it is.** Page names, product names, video titles and link names are already English on every version, so reports, segments and dashboards keep working with no changes. The new language is one more value in the `page_language` breakdown.

That last point is the real test of the rule. With a language in a different script, translated values in reports would be unreadable to most of the team, not just inconvenient. A site that sends one reporting language can add languages without touching its analytics.

## Reports to build

- **Top pages, broken down by page language.** One row per page, with the language split one click away.
- **Language mismatch rate by entry page.** High mismatch on a page suggests the other language version is missing or hard to find.
- **Conversion rate by page language.** The checkout is the same; a gap points to translation or content problems, not the store.
- **Language switch usage.** Which pages people leave for the other language, and in which direction.

## Rules for the data layer specification

Add these to the implementation spec for any multilingual site:

1. Every value sent to analytics comes from a stable English source (ID, slug, English title), never from translated display text. The one exception is the address, which can be translated for visitors.
2. Translated pages reuse the English page's `page.name`, `content.id` and `content.title`. The page name is the reporting key; in GA4 it's also sent as `page_title`.
3. `page.language` is set on every page, as a full locale (`fr-CA`, not `fr` or `French`).
4. Clicked-element text is never used as a value; use a data attribute with the reporting value.
5. The language switch has its own event, with the from and to languages.

## Testing it

- Load each page in both languages and compare the data layer: everything except `page.language` and `page.path` should match.
- Set the browser to another language and confirm `user.browserLanguage` and the match flag change.
- In GA4 DebugView, check that `page_title` is the English page name on French pages, and in the Adobe Experience Platform Debugger that `web.webPageDetails.name` is too. Both URLs should be the French address.
- Run a full purchase in each language and compare the `purchase` events: item names, variants, shipping tier and payment type should be identical.

This site's build checks every page's language against an allowed list (`en-CA`, `fr-CA`), and a site-wide test follows each page's language switch to its twin and compares the page name and content title.

## A note on review

I work in English and French, so I can review content, data layer specifications and reports in either language, including checking that a translated page still sends the right analytics values. I also have basic German (four years of study in high school) and Japanese (a year teaching English in rural Japan; I read kana, not kanji): enough to check that a page, a language switch or a data layer behaves as expected, though not to review the writing.
