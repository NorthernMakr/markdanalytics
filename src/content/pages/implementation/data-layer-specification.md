---
title: "Sample spec: data layer specification"
description: "The data layer specification for markdanalytics.ca and its demo sites: every object, key, type and allowed value, with load order, naming rules and how the spec is enforced."
pubDate: 2026-11-02
category: Analytics practice
tags: [specifications, data layer, dataLayer, ACDL, developers]
platform: Both
order: 2
draft: true
---

| | |
|---|---|
| **Document** | Data layer specification, markdanalytics.ca |
| **Version** | 1.2, 2 November 2026 |
| **Status** | Live |
| **Owner** | Mark Dykeman, analytics lead |
| **Audience** | Developers building pages; analysts mapping tags |
| **Related** | [Tracking plan](/practice/tracking-plan/), [store spec](/practice/implementation-spec-store/), [media spec](/practice/implementation-spec-media/) |

## 1. Purpose

This document defines what every page on markdanalytics.ca, the Taiga Supply Co. demo store and the Balsam Daily demo news site must expose to analytics. It's written in terms of the data layer only. How each value reaches Adobe Analytics or GA4 is in the [tracking plan](/practice/tracking-plan/), so a change of analytics tool doesn't change this document.

## 2. The two arrays

| Array | Read by | Shape |
|---|---|---|
| `window.dataLayer` | Google Tag Manager | Objects with an `event` key; GA4 recommended event names and parameters |
| `window.adobeDataLayer` | Adobe Client Data Layer, Adobe Tags, the Web SDK bridge | Objects with an `event` key; Adobe-style event names and XDM-shaped objects |

Both arrays are created in the page `<head>`, before any tag manager. Both get the same page object. Interaction events are pushed to both, each in its own platform's conventions.

## 3. Load order

1. Create `dataLayer` and `adobeDataLayer` if they don't exist.
2. Push the page object: `page_data_ready` to `dataLayer`, `page loaded` to `adobeDataLayer`.
3. Load Adobe Tags (or the Web SDK bridge), then GTM.

The page object must be in place before step 3, so no tag can fire before the data it needs exists. Pages must not push the page object again later.

## 4. Rules for every field

- **Names:** camelCase keys, grouped by object (`page.*`, `user.*`, `content.*`, `product.*`, `checkout.*`). GA4 event parameters use Google's snake_case names.
- **Types:** numbers are numbers (`129`, not `"129"`); dates are ISO 8601 (`2026-10-29`); booleans are `true`/`false`.
- **Language:** every value is in English, whatever the page language, except `page.path`, which is the real address. Never use translated display text as a value.
- **Case:** values from fixed lists are lowercase (`product detail`, `shop`).
- **No personal data:** no names, email addresses, phone numbers, street addresses or free text typed by visitors. Keys named `email`, `phone`, `address`, `message`, `firstName`, `lastName`, `fullName` or `password` are rejected (section 9).
- **Absent, not empty:** leave out a key that doesn't apply. Don't send `""` or `null` placeholders.

## 5. Page object (every page)

Pushed once per page, before tag managers load.

| Key | Type | Req. | Allowed values / format | Example | Source |
|---|---|---|---|---|---|
| `page.name` | string | Yes | Lowercase, colon-separated, starts with the section | `shop:product:tidepool-daypack` | Template + slug |
| `page.type` | string | Yes | `home`, `article list`, `article`, `section front`, `contact`, `error`, `product listing`, `product detail`, `cart`, `checkout`, `order confirmation` | `product detail` | Template |
| `page.section` | string | Yes | `home`, `blog`, `practice`, `contact`, `error`, `shop`, `media`, `site` | `shop` | Template |
| `page.siteName` | string | Yes | One per site | `Taiga Supply Co. (demo)` | Site config |
| `page.path` | string | Yes | The real path, in the page's language | `/fr/boutique/produit/sac-de-jour-tidepool/` | URL |
| `page.language` | string | Yes | `en-CA`, `fr-CA` | `fr-CA` | URL (`/fr/` = French) |
| `page.environment` | string | Yes | `production`, `development` | `production` | Build |
| `user.loginStatus` | string | Yes | `guest` (no logins on this site) | `guest` | Fixed |
| `user.browserLanguage` | string | Yes | As the browser reports it (BCP 47) | `en-US` | `navigator.languages[0]`, at page load |
| `user.languageMatch` | boolean | Yes | Do page and browser language share a primary language? | `false` | Computed at page load |

`page.name` is the reporting key: both language versions of a page send the same name.

Example, French product page:

```json
{
  "event": "page_data_ready",
  "page": { "name": "shop:product:tidepool-daypack", "type": "product detail", "section": "shop",
            "siteName": "Taiga Supply Co. (demo)", "path": "/fr/boutique/produit/sac-de-jour-tidepool/",
            "language": "fr-CA", "environment": "production" },
  "user": { "loginStatus": "guest", "browserLanguage": "en-US", "languageMatch": false },
  "product": { "sku": "TG-PK-101", "name": "Tidepool daypack", "category": "packs",
               "subcategory": "daypacks", "price": 129, "currency": "CAD" }
}
```

## 6. Page-type objects

Added to the page object on the page types listed. Values are English on both language versions.

### 6.1 `content` on blog posts and practice pages (`page.type` = `article`, `section front`)

| Key | Type | Req. | Format | Example |
|---|---|---|---|---|
| `content.id` | string | Yes | English slug | `how-this-sites-data-layer-works` |
| `content.title` | string | Yes | English title | `How this site's data layer works` |
| `content.category` | string | Yes | Free text from the post's frontmatter | `Data layer design` |
| `content.tags` | array of strings | No | English tags | `["dataLayer", "GA4"]` |
| `content.platform` | string | Yes | `Adobe`, `Google`, `Both`, `Other` | `Both` |
| `content.publishDate` | string | Yes | ISO date | `2026-10-29` |
| `content.updatedDate` | string | No | ISO date | `2026-10-29` |
| `content.author` | string | Yes | Author's public name | `Mark Dykeman` |
| `content.wordCount` | number | Yes | Words in this version | `560` |

### 6.2 `content` on news stories (`page.name` = `media:article:*`)

| Key | Type | Req. | Format | Example |
|---|---|---|---|---|
| `content.id` | string | Yes | English slug | `ferry-schedule-shakeup` |
| `content.title` | string | Yes | English headline | `Island ferry schedule shakeup adds early sailings, drops late-night run` |
| `content.section` | string | Yes | `Local`, `Transportation`, `Weather`, `Food`, `Sports` | `Transportation` |
| `content.author` | string | Yes | Byline | `Dana Layer` |
| `content.publishDate` | string | Yes | ISO date | `2026-10-28` |
| `content.hasVideo` | boolean | Yes | | `true` |
| `content.videoId` | string | If video | Video ID | `vid-ferry-001` |
| `content.wordCount` | number | Yes | English word count | `146` |

### 6.3 `product` on product pages (`page.type` = `product detail`)

| Key | Type | Req. | Format | Example |
|---|---|---|---|---|
| `product.sku` | string | Yes | SKU | `TG-PK-101` |
| `product.name` | string | Yes | English product name | `Tidepool daypack` |
| `product.category` | string | Yes | `packs`, `apparel`, `camp` | `packs` |
| `product.subcategory` | string | Yes | Lowercase | `daypacks` |
| `product.price` | number | Yes | Unit price, two decimals at most | `129` |
| `product.currency` | string | Yes | ISO 4217 | `CAD` |

### 6.4 `checkout` on checkout and confirmation pages

| Key | Type | Req. | Values |
|---|---|---|---|
| `checkout.step` | number | Yes | `1` shipping, `2` payment, `3` confirmation |
| `checkout.stepName` | string | Yes | `shipping`, `payment`, `confirmation` |

## 7. Shared item formats

Every ecommerce event uses the same item shape, so a product looks identical in every event.

**GA4 item** (in `ecommerce.items[]`):

| Key | Type | Example | Notes |
|---|---|---|---|
| `item_id` | string | `TG-PK-101` | SKU |
| `item_name` | string | `Tidepool daypack` | English |
| `item_brand` | string | `Taiga` | |
| `item_category` | string | `packs` | |
| `item_category2` | string | `daypacks` | |
| `item_variant` | string | `Buoy` | Colour, English |
| `price` | number | `129` | Unit price |
| `quantity` | number | `1` | |
| `index` | number | `0` | List events only, zero-based |
| `item_list_id`, `item_list_name` | string | `catalog_packs`, `Catalog: Packs & bags` | List events only |

**Adobe item** (in `productListItems[]`):

| Key | Type | Example |
|---|---|---|
| `SKU` | string | `TG-PK-101` |
| `name` | string | `Tidepool daypack` |
| `quantity` | number | `1` |
| `priceTotal` | number | `129` (unit price × quantity) |
| `currencyCode` | string | `CAD` |
| `productCategories` | array | `[{ "categoryID": "packs" }, { "categoryID": "daypacks" }]` |
| `selectedOptions` | array | `[{ "attribute": "colour", "value": "Buoy" }]` |

## 8. Events

The full list of allowed events. Payloads, triggers and timing are in the implementation specs.

| Area | `dataLayer` (GA4) | `adobeDataLayer` | Spec |
|---|---|---|---|
| Page | `page_data_ready` | `page loaded` | This document |
| Product lists | `view_item_list`, `select_item` | `product list viewed`, `product clicked` | [Store](/practice/implementation-spec-store/) |
| Product page | `view_item`, `add_to_cart`, `add_to_wishlist` | `product viewed`, `cart add`, `wishlist add` | Store |
| Cart | `view_cart`, `add_to_cart`, `remove_from_cart` | `cart viewed`, `cart add`, `cart remove` | Store |
| Checkout | `begin_checkout`, `add_shipping_info`, `add_payment_info`, `purchase` | `checkout started`, `checkout step`, `purchase` | Store |
| Promotions | `view_promotion`, `select_promotion` | `promotion viewed`, `promotion clicked` | Store |
| Catalog filter | `filter_applied` | `search filtered` | Store |
| Video | `video_start`, `video_progress`, `video_pause`, `video_seek`, `video_complete` | `media start`, `media milestone`, `media pause`, `media seek`, `media complete` | [Media](/practice/implementation-spec-media/) |
| Reading | `scroll_depth` | `content scrolled` | Media |
| Teaser clicks | `content_click` | `content clicked` | Media |
| Contact form | `form_start`, `generate_lead`, `form_error` | `form started`, `form submitted`, `form error` | Contact page |
| Language | `language_switch` | `language switched` | Every page |

Before every `dataLayer` push that contains an `ecommerce` object, push `{ ecommerce: null }` to clear the previous one, as [Google recommends](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce?client_type=gtm).

## 9. How this spec is enforced

- **At build time,** every page's `page.type`, `page.section`, `page.name` and `page.language` are checked against the allowed lists in `src/config/analytics.ts`. A page that breaks a rule fails the build.
- **In the browser, outside production,** every push is checked: an event name not listed in section 8, or a forbidden key from section 4, logs a warning in the console.
- **Site-wide,** a test loads every page in both languages and checks that each French page sends the same `page.name` and `content.title` as its English twin.

To add a value or event: add it to the allowed list first, then to this document and the tracking plan, then use it.

## 10. Change history

| Version | Date | Change |
|---|---|---|
| 1.2 | 2026-11-02 | `page.path` is the real address in the page's language; French addresses introduced |
| 1.1 | 2026-10-29 | Added `page.language`, `user.browserLanguage`, `user.languageMatch` and the language switch event |
| 1.0 | 2026-10-29 | First version |
