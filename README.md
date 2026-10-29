# Tag & Layer: markdanalytics.ca

A blog for analytics implementation notes, plus two demo sites for testing
Adobe and Google tags against a realistic data layer:

| Section | Pages | What it's for |
|---|---|---|
| Blog | `/`, `/blog/`, `/blog/<post>/` | Your implementation advice |
| Demo store (Driftwood Supply Co.) | `/shop/`, `/shop/catalog/`, `/shop/product/<item>/`, `/shop/cart/`, `/shop/checkout/`, `/shop/checkout/payment/`, `/shop/checkout/confirmation/` | Full ecommerce funnel. Nothing is sold and no details are collected. |
| Demo media site (The Tidewater Daily) | `/media/`, `/media/article/<story>/` | Article tracking and HTML5 video tracking |

Every page has an **Event log** button (bottom right) that mirrors
`window.dataLayer` and `window.adobeDataLayer` as they fill.

---

## 1. Run it on your computer (optional)

You need [Node.js](https://nodejs.org) 22 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:4321. Changes reload as you save.

## 2. Put it on GitHub

1. Create a free account at https://github.com and a new **private** repository called `analytics-lab`.
2. In this folder:
   ```bash
   git remote add origin https://github.com/<your-username>/analytics-lab.git
   git push -u origin main
   ```
   (The folder is already a git repository with one commit.)

Or use GitHub Desktop: *File > Add local repository*, choose this folder, then *Publish repository*.

## 3. Host it on Cloudflare (free)

1. Sign in at https://dash.cloudflare.com.
2. Go to **Workers & Pages > Create > Pages > Connect to Git** and choose the `analytics-lab` repo.
3. Build settings:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
4. **Save and Deploy.** In a minute or two you'll have a `*.pages.dev` address.

From then on, every push to `main` rebuilds and publishes the site.

## 4. Connect markdanalytics.ca

In your Pages project, open **Custom domains > Set up a custom domain**, enter
`markdanalytics.ca`, and repeat for `www.markdanalytics.ca`.

- **Domain registered with Cloudflare:** DNS is added for you. Done.
- **Domain registered somewhere else:** Cloudflare will show the record to add
  (a CNAME), or you can move the domain's nameservers to Cloudflare so it
  manages DNS. Follow the on-screen steps.

HTTPS certificates are issued automatically.

## 5. Add your tags

Nothing loads until you add IDs. In Cloudflare: **your Pages project >
Settings > Environment variables** (Production), then redeploy:

| Variable | Example | Loads |
|---|---|---|
| `PUBLIC_ADOBE_TAGS_URL` | `https://assets.adobedtm.com/…/launch-…-development.min.js` | Adobe Experience Platform Tags embed |
| `PUBLIC_GTM_ID` | `GTM-ABC1234` | Google Tag Manager container |
| `PUBLIC_GA4_ID` | `G-XXXXXXXXXX` | gtag.js directly (optional; usually use GTM instead) |
| `PUBLIC_SHOW_EVENT_LOG` | `false` | Hides the Event log button |

Locally, copy `.env.example` to `.env` and fill in the same values.

Tip: use a **Preview** environment in Cloudflare with your Adobe *development*
embed and a GTM environment snippet, and **Production** with the live ones.

### Load order (in every page's `<head>`)

1. `dataLayer` and `adobeDataLayer` are created and this page's data is pushed
   (`page_data_ready` / `page loaded`)
2. Adobe Tags embed
3. GTM / gtag.js

So both tag managers start with page data already waiting. See
`src/layouts/Base.astro`.

---

## Data layer reference

### Page data (every page)

```json
{
  "page": { "name": "shop:product:tidepool-daypack", "type": "product detail", "section": "shop",
            "siteName": "Driftwood Supply Co. (demo)", "path": "/shop/product/tidepool-daypack/",
            "language": "en-CA", "environment": "production" },
  "user": { "loginStatus": "guest" }
}
```

Blog posts and media articles add a `content` object (title, category or
section, author, publish date, word count; media articles also `hasVideo` and
`videoId`). Product pages add `product`; checkout pages add `checkout`.

### Store events

| User action | `dataLayer` (GA4) | `adobeDataLayer` |
|---|---|---|
| Product list shown (home, catalog, related) | `view_item_list` | `product list viewed` |
| Product link clicked in a list | `select_item` | `product clicked` |
| Catalog filtered by category | `filter_applied` | `search filtered` |
| Product page | `view_item` | `product viewed` |
| Add to cart (product page, cart quantity up) | `add_to_cart` | `cart add` |
| Remove / quantity down | `remove_from_cart` | `cart remove` |
| Save to wishlist | `add_to_wishlist` | `wishlist add` |
| Cart page | `view_cart` | `cart viewed` |
| Checkout shipping page | `begin_checkout` | `checkout started` |
| Continue to payment | `add_shipping_info` (`shipping_tier`) | `checkout step` (step 1) |
| Place order | `add_payment_info` (`payment_type`) | `checkout step` (step 2) |
| Confirmation page | `purchase` (once per order ID) | `purchase` (`commerce.order.purchaseID`) |
| Home hero / promo strip shown | `view_promotion` | `promotion viewed` |
| …clicked | `select_promotion` | `promotion clicked` |

GA4 events use the recommended `ecommerce.items[]` schema, with
`{ ecommerce: null }` pushed first to clear the previous object. Adobe events
use an XDM-style `productListItems[]`.

The cart is kept in the browser's localStorage. On an empty cart page, **Add
sample items** fills it in one click. Reloading the confirmation page does
**not** push `purchase` again (a notice says so), which is handy for testing
de-duplication.

### Media events

| User action | `dataLayer` | `adobeDataLayer` |
|---|---|---|
| Video starts | `video_start` | `media start` |
| 10 / 25 / 50 / 75 / 90% | `video_progress` (`video_percent`) | `media milestone` (`media.milestone`) |
| Video ends | `video_complete` | `media complete` |
| Pause | `video_pause` | `media pause` |
| Seek | `video_seek` | `media seek` |
| Teaser / internal link click | `content_click` (`link_module`, `link_position`) | `content clicked` |
| Scroll 25/50/75/100% of article body | `scroll_depth` (`percent_scrolled`) | `content scrolled` |

GA4's built-in video tracking only covers embedded YouTube, so these events
use the same names to let GTM triggers work the same way. Blog posts also push
the scroll-depth events.

---

## Writing a blog post

1. Copy `src/content/blog/_post-template.md` and rename it. The file name
   becomes the URL, e.g. `adobe-props-vs-evars.md` gives `/blog/adobe-props-vs-evars/`.
2. Fill in the frontmatter and set `draft: false`.
3. Commit and push. Cloudflare publishes it automatically.

Files starting with `_` and posts with `draft: true` are never published.

## Where things live

```
src/config/tags.ts         Tag IDs and site name
src/layouts/Base.astro     <head> load order and data layer setup
src/scripts/commerce.ts    Store events and cart
src/scripts/video.ts       Video events
src/scripts/scroll.ts      Scroll-depth events
src/data/products.ts       Demo store catalog
src/data/articles.ts       Demo news stories
src/content/blog/          Your blog posts (Markdown)
public/media/              Demo video and poster
```
