---
title: What a data layer is, and why this site has two
description: "A plain-language explanation of data layers: how they're created, the two main styles, how Google's dataLayer and Adobe's Client Data Layer differ, and why this site runs both, with the JavaScript that builds them."
pubDate: 2026-11-02
category: Data layer design
tags: [dataLayer, ACDL, data layer, GTM, Adobe Tags, JavaScript]
platform: Both
---

**A data layer is a JavaScript object or array on a web page that holds facts about the page and what the visitor does there.** Analytics and marketing tags read from it instead of scraping the page itself. It's the contract between the people who build the site and the people who measure it.

Without one, a tag that wants the product price has to find it in the page's HTML: the third `<span>` inside `.price`, say. The next redesign moves that span, and the data quietly breaks. With a data layer, the site states the price once, in a known place, with a known name, and the tags read it from there.

## How a data layer is created

A developer creates it in the page's `<head>`, before any tag manager loads. At its simplest, it's one line plus one push:

```js
// Create the array, or reuse it if something already created it
window.dataLayer = window.dataLayer || [];

// Describe the page
window.dataLayer.push({
  event: 'page_data_ready',
  page: { name: 'shop:cart', type: 'cart', section: 'shop', language: 'en-CA' }
});
```

The `window.dataLayer || []` pattern matters: if another script has already created the array and pushed to it, those entries are kept rather than wiped.

The values come from wherever the site knows them:

- **When the page is built:** the CMS or server template writes in the page name, type, product details and so on. On this site, Astro writes each page's object into the HTML at build time.
- **While the visitor is on the page:** the page's own code pushes events as things happen, such as a product added to the cart or a video started.
- **In the browser at load time:** a few facts only the browser knows, such as the visitor's preferred language.

## Two styles: a static object or an event queue

### A static object

The older approach is one object that describes the page, which tags read when they load. The best-known version is the W3C's `digitalData` standard from 2013 ([Customer Experience Digital Data Layer 1.0](https://www.w3.org/community/custexpdata/2013/12/16/final-report-customer-experience-digital-data-layer-v1-0-ready)):

```js
window.digitalData = {
  page: { pageInfo: { pageName: 'shop:cart' }, category: { primaryCategory: 'shop' } },
  cart: { price: { basePrice: 129, currency: 'CAD' } }
};
```

It's simple, and it works well for facts about the page. It's awkward for anything that happens after the page loads: a tag reading `digitalData.cart` has no way of knowing it just changed. That's especially painful on single-page apps, where the "page" changes without a reload.

### An event queue

The approach most sites use now is an array that you `push` to as things happen. The tag manager watches the array and reacts to each push in order:

```js
// Later, when the visitor adds something to the cart
window.dataLayer.push({
  event: 'add_to_cart',
  ecommerce: {
    currency: 'CAD',
    value: 129,
    items: [{ item_id: 'TG-PK-101', item_name: 'Tidepool daypack', price: 129, quantity: 1 }]
  }
});
```

The `event` key is what a tag manager trigger listens for ("when `add_to_cart` is pushed, send it to GA4"). Everything else in the object is data the tags can read.

Google Tag Manager's `dataLayer` works this way ([Google's guide to the data layer](https://developers.google.com/tag-manager/devguide)), and so does Adobe's Client Data Layer.

## Google's dataLayer and Adobe's Client Data Layer

Both are event queues, and both start life as a plain array. They differ in what the tag manager does with it.

**Google's `dataLayer`** is read by GTM. GTM keeps its own running model of everything pushed so far, so a variable like `page.type` still has a value when a later event fires. GA4 has recommended names and shapes for common events, such as `add_to_cart` with an `items` array.

**Adobe's Client Data Layer** (`adobeDataLayer`) is an open-source library from Adobe, usually loaded by its Adobe Tags extension. Once the library loads, it takes over the array, processes anything already pushed, and adds a few tools ([ACDL documentation](https://github.com/adobe/adobe-client-data-layer/wiki)):

```js
window.adobeDataLayer = window.adobeDataLayer || [];

// Push works exactly the same way
window.adobeDataLayer.push({
  event: 'cart add',
  productListItems: [{ SKU: 'TG-PK-101', name: 'Tidepool daypack', quantity: 1, priceTotal: 129 }]
});

// Once the library has loaded: read the merged state of everything pushed so far
window.adobeDataLayer.getState('page.name');   // "shop:cart"

// Listen for an event, including ones pushed before this code ran
window.adobeDataLayer.push(function (dl) {
  dl.addEventListener('cart add', function (event) {
    console.log('Added:', event.productListItems[0].name);
  }, { scope: 'all' });
});
```

That last part solves a real timing problem: a listener added late can still see events that happened before it existed. Adobe's own conventions also differ. Its event names are words (`cart add`), and its shapes follow XDM, Adobe's data model (`productListItems`), because that's what the Web SDK sends on to Adobe.

## What this site does

Every page on this site describes itself once, and that one object goes to both arrays. Here is a simplified version of the script in every page's `<head>`:

```js
// 1. Create both data layers
window.dataLayer = window.dataLayer || [];
window.adobeDataLayer = window.adobeDataLayer || [];

// 2. The page's own description, written in at build time
var pageData = {
  page: { name: 'shop:cart', type: 'cart', section: 'shop',
          siteName: 'Taiga Supply Co. (demo)', path: '/shop/cart/',
          language: 'en-CA', environment: 'production' },
  user: { loginStatus: 'guest' }
};

// 3. Facts only the browser knows, added at load time
pageData.user.browserLanguage = navigator.languages[0] || navigator.language;

// 4. Small helpers, so every push follows each platform's rules
window.lab = {
  ga4: function (evt) {
    // Google recommends clearing the previous ecommerce object first
    if (evt.ecommerce) window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push(evt);
  },
  adobe: function (evt) {
    window.adobeDataLayer.push(evt);
  }
};

// 5. The same page data, announced to both
window.lab.ga4(Object.assign({ event: 'page_data_ready' }, pageData));
window.lab.adobe(Object.assign({ event: 'page loaded' }, pageData));

// 6. Only now do the tag managers load: Adobe Tags, then GTM
```

Then, when something happens, the page tells both platforms in their own terms:

```js
// Visitor adds a Tidepool daypack in Buoy to the cart
window.lab.ga4({
  event: 'add_to_cart',
  ecommerce: { currency: 'CAD', value: 129,
    items: [{ item_id: 'TG-PK-101', item_name: 'Tidepool daypack', item_variant: 'Buoy', price: 129, quantity: 1 }] }
});
window.lab.adobe({
  event: 'cart add',
  productListItems: [{ SKU: 'TG-PK-101', name: 'Tidepool daypack', quantity: 1, priceTotal: 129,
    selectedOptions: [{ attribute: 'colour', value: 'Buoy' }] }]
});
```

You can watch this happen: every page has an **Event log** button in the bottom-right corner that shows both arrays filling in real time. [How this site's data layer works](/blog/how-this-sites-data-layer-works/) goes through every field.

## Why two data layers?

Each tag manager listens to its own array by default: GTM to `dataLayer`, Adobe Tags to `adobeDataLayer`. And each analytics tool expects its own shapes: GA4 wants its recommended events with an `items` array, and Adobe's Web SDK wants XDM. Pushing both from one page object gives each tool exactly what it expects, with no translation inside the tag manager.

**You don't actually need two.** Many companies that run both tools keep one tool-neutral data layer and map it in each tag manager. Adobe even makes a [Google Data Layer extension](https://experienceleague.adobe.com/en/docs/experience-platform/tags/extensions/client/google-data-layer/overview) so Adobe Tags can read GTM's `dataLayer` directly:

```js
// One array, one tool-neutral shape
window.dataLayer.push({
  event: 'product_added',
  product: { sku: 'TG-PK-101', name: 'Tidepool daypack', price: 129, quantity: 1 }
});
// GTM maps this to GA4's add_to_cart; Adobe Tags maps the same push to XDM.
```

It's a trade-off:

| | Two data layers (this site) | One data layer, mapped twice |
|---|---|---|
| Where the mapping lives | In the site's code | In each tag manager |
| What developers need to know | Both platforms' conventions | One neutral format |
| Adding a third tool | Another set of pushes in the code | Another mapping in a tag manager |
| Debugging | Each array already looks like what its tool receives | One place to check the source data |

This site uses two on purpose. It's a test bed, so it shows each platform's native conventions side by side. Both arrays come from the same page object, so they can't disagree about the facts.

## The principle

Whatever the setup: **one source of truth for the facts, then whatever shape each tool needs.** Agree on the names, types and allowed values first, write them down in a data layer specification, and push the data before any tag that needs it loads. Whether the shaping for each tool happens in the page (two arrays) or in the tag manager (one array) matters much less than having one agreed description of the page to begin with.
