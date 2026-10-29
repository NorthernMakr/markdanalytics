---
title: How this site's data layer works
description: One page object, two data layers. A tour of the dataLayer and adobeDataLayer setup behind every page here, and why it's built that way.
pubDate: 2026-10-29
category: Data layer design
tags: [dataLayer, ACDL, GA4, GTM, Adobe Tags]
platform: Both
---

Every page on this site describes itself once, and that description is handed to both Google and Adobe tooling. This post explains the setup so the test pages make sense.

## One page object, built at publish time

When the site is built, each page gets a small object describing it:

```json
{
  "page": {
    "name": "blog:how-this-sites-data-layer-works",
    "type": "article",
    "section": "blog",
    "siteName": "Tag & Layer",
    "path": "/blog/how-this-sites-data-layer-works/",
    "language": "en-CA",
    "environment": "production"
  },
  "content": {
    "title": "How this site's data layer works",
    "category": "Data layer design",
    "platform": "Both",
    "publishDate": "2026-10-29",
    "wordCount": 540
  },
  "user": { "loginStatus": "guest" }
}
```

Because it's generated from the post's frontmatter, adding a post never means touching analytics code.

## Pushed to both layers, before any tag manager loads

In the `<head>`, before Adobe Tags or GTM, the same object is pushed twice:

- `dataLayer.push({ event: "page_data_ready", ...page })` for GTM
- `adobeDataLayer.push({ event: "page loaded", ...page })` for the Adobe Client Data Layer

Order matters. When either tag manager starts, the data is already waiting, so there's no race between the tag firing and the data arriving.

## Ecommerce and media follow each platform's conventions

The demo store pushes GA4's recommended ecommerce events (`view_item_list`, `view_item`, `add_to_cart`, `begin_checkout`, `purchase` and so on), clearing the previous `ecommerce` object first, as Google recommends. The Adobe side gets matching events (`product viewed`, `cart add`, `purchase`) with an XDM-style `productListItems` array.

The demo media site's video player pushes `video_start`, `video_progress` (10, 25, 50, 75, 90%) and `video_complete` to `dataLayer`, and `media start`, `media milestone` and `media complete` to `adobeDataLayer`.

## Watching it happen

Every page has an **Event log** button in the bottom-right corner. It mirrors both arrays as they fill, so you can see exactly what a tag manager would see, with no browser extension needed.

## What to try

- Map `page.type` and `page.section` to eVars or custom dimensions and compare reports.
- Build a GTM trigger on `add_to_cart` and an Adobe rule on `cart add`, and confirm both fire once per click.
- Reload the order confirmation page and check whether your purchase tag fires again (it shouldn't: the page pushes `purchase` once per order ID).
