---
title: Page title in sentence case
description: One or two sentences. Shown on the section's hub page, the home page and in search results.
pubDate: 2026-11-01
category: Implementation
tags: [Adobe Analytics]
platform: Adobe
draft: true
---

Copy this file into a section folder (src/content/pages/<section>/), rename it
(the file name becomes the URL), fill in the fields above and set `draft: false`
to publish. Add `order: 3` to set its place on the section's hub page.
Drafts are never built into the live site.

Write in Markdown. Code blocks get syntax highlighting:

```js
adobeDataLayer.push({ event: 'cart add', productListItems: [/* ... */] });
```
