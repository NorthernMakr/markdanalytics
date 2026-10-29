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

There's a second, bigger reason: **splitting a page by language breaks the standard reports.** Most analysis starts with a list of top pages. If `/shop/` and `/fr/shop/` arrive as two rows with two names, the English version usually wins on volume, and the French traffic disappears below the fold or into "Other". The team concludes the French pages don't matter, when they were just counted separately. One row per page, with language as a breakdown, avoids that.

## What stays in the reporting language

Everything an analyst might see as a dimension value:

| Value | English page | French page |
|---|---|---|
| Page name | `shop:product:tidepool-daypack` | `shop:product:tidepool-daypack` |
| Page path | `/shop/product/tidepool-daypack/` | `/shop/product/tidepool-daypack/` |
| Content title | How this site's data layer works | How this site's data layer works |
| Product, colour | Tidepool daypack, Buoy | Tidepool daypack, Buoy (shown as "Bouée") |
| List and promotion names | Home: featured | Home: featured |
| Video title | What the new ferry schedule means for commuters | the same |
| Link text on teaser clicks | The English headline | The English headline |
| Form topic, payment type, shipping tier | `credit card`, `standard` | the same |

The visitor sees French; the data layer carries English. In practice, this means each translatable thing has a stable English value (an ID, a slug, the English title) that the page sends to analytics, and a display value it shows on screen. On this site, product colours are a radio button whose `value` is English and whose label is French, and teaser links carry the English headline in a `data-link-name` attribute.

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

## Values the platforms collect by themselves

Some values aren't in your data layer at all, and they'll split by language unless you take control of them.

- **GA4 `page_title` and `page_location`** default to the browser tab title and the full URL ([Measure pageviews](https://developers.google.com/analytics/devguides/collection/ga4/views)). On a French page, that's a French title and a `/fr/` address. This site's Google tag overrides both, with the page name and the English URL. Google notes that an overridden `page_location` must still be a full URL, starting with the protocol.
- **Adobe's page URL** (`web.webPageDetails.URL`) is built from the English path in the bridge script.
- **Link tracking** that reads the clicked text (automatic link collection, or a GTM "Click Text" variable) picks up whatever language the page is in. Prefer a data attribute with the English value, as this site does for teasers.

Search engines need the opposite: they must see each language version as its own page. That's what `hreflang` links are for ([Google's guide to localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)). Analytics combines, SEO separates, and both are right for their audience.

## Adding another language

Nothing in this approach is specific to French. Adding Simplified Chinese, for example, would work the same way:

- The pages would live under `/zh/` with the same addresses as the English ones, and get `hreflang` links like the French pages.
- `page.language` would be `zh-CN`, added to the build's list of allowed languages.
- **Every analytics value would stay exactly as it is.** Page names, paths, product names, video titles and link names are already English on every version, so reports, segments and dashboards keep working with no changes. The new language is one more value in the `page_language` breakdown.

That last point is the real test of the rule. With a language in a different script, translated values in reports would be unreadable to most of the team, not just inconvenient. A site that sends one reporting language can add languages without touching its analytics.

## Reports to build

- **Top pages, broken down by page language.** One row per page, with the language split one click away.
- **Language mismatch rate by entry page.** High mismatch on a page suggests the other language version is missing or hard to find.
- **Conversion rate by page language.** The checkout is the same; a gap points to translation or content problems, not the store.
- **Language switch usage.** Which pages people leave for the other language, and in which direction.

## Rules for the data layer specification

Add these to the implementation spec for any multilingual site:

1. Every value sent to analytics comes from a stable English source (ID, slug, English title), never from translated display text.
2. Translated pages reuse the English page's `page.name`, `content.id` and `content.title`.
3. `page.language` is set on every page, as a full locale (`fr-CA`, not `fr` or `French`).
4. Clicked-element text is never used as a value; use a data attribute with the reporting value.
5. The language switch has its own event, with the from and to languages.

## Testing it

- Load each page in both languages and compare the data layer: everything except `page.language` should match.
- Set the browser to another language and confirm `user.browserLanguage` and the match flag change.
- In GA4 DebugView and the Adobe Experience Platform Debugger, check that `page_title`, `page_location` and the Web SDK page URL are English on French pages.
- Run a full purchase in each language and compare the `purchase` events: item names, variants, shipping tier and payment type should be identical.

This site's build checks every page's language against an allowed list (`en-CA`, `fr-CA`), and a site-wide test compares each French page's page name and content title with its English twin.

## A note on review

I work in English and French, so I can review content, data layer specifications and reports in either language, including checking that a translated page still sends the right analytics values. I also have basic German and Japanese (I read kana, not kanji): enough to check that a page, a language switch or a data layer behaves as expected, though not to review the writing.
