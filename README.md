# Tag & Layer: markdanalytics.ca

A blog for analytics implementation notes, plus two demo sites for testing
Adobe and Google tags against a realistic data layer:

| Section | Pages | What it's for |
|---|---|---|
| Blog | `/`, `/blog/`, `/blog/<post>/` | Your implementation advice |
| Demo store (Taiga Supply Co.) | `/shop/`, `/shop/catalog/`, `/shop/product/<item>/`, `/shop/cart/`, `/shop/checkout/`, `/shop/checkout/payment/`, `/shop/checkout/confirmation/` | Full ecommerce funnel. Nothing is sold and no details are collected. |
| Demo media site (Balsam Daily) | `/media/`, `/media/article/<story>/` | Article tracking and HTML5 video tracking |

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

Nothing loads until you add IDs. These are read when the site is *built*, so
in Cloudflare open **Workers & Pages > markdanalytics > Settings > Build >
Variables and secrets** (build variables, not the runtime ones), add them, then
redeploy (or push any commit):

| Variable | Example | Loads |
|---|---|---|
| `PUBLIC_ADOBE_TAGS_URL` | `https://assets.adobedtm.com/…/launch-…-development.min.js` | Adobe Experience Platform Tags embed |
| `PUBLIC_GTM_ID` | `GTM-ABC1234` | Google Tag Manager container |
| `PUBLIC_GA4_ID` | `G-XXXXXXXXXX` | gtag.js directly (optional; usually use GTM instead) |
| `PUBLIC_SHOW_EVENT_LOG` | `false` | Hides the Event log button |

Locally, copy `.env.example` to `.env` and fill in the same values.

Tip: use a **Preview** environment in Cloudflare with your Adobe *development*
embed and a GTM environment snippet, and **Production** with the live ones.

### Adobe Web SDK without an Adobe account

The site loads Adobe's real Web SDK (`alloy.js`, self-hosted in `public/vendor/`)
and turns every `adobeDataLayer` event into a `sendEvent` call with an XDM
payload, the way an Adobe Tags rule would (`public/lab/websdk-bridge.js`).

By default (**mock** mode) the SDK sends to `/ee/…` on this site instead of
Adobe's Edge Network. A small Worker (`src/worker.ts`) answers like the edge
would, including a fake ECID, so the SDK behaves normally. Nothing reaches Adobe.

Where to look:
- **Event log → Web SDK tab:** each request the SDK built (XDM and data), and where it went
- **DevTools → Network, filter `interact`:** the real requests; the response echoes what was received
- **Adobe Experience Platform Debugger** extension also picks up the calls

| `PUBLIC_WEBSDK_MODE` | What happens |
|---|---|
| `mock` (default) | Real SDK, requests go to this site's stand-in edge |
| `cancel` | Real SDK builds each request, logs it, then cancels it (`onBeforeEventSend` returns `false`) |
| `live` | Sends to Adobe; also set `PUBLIC_WEBSDK_DATASTREAM_ID` and `PUBLIC_WEBSDK_ORG_ID` |
| `off` | Web SDK not loaded |

XDM mapping: `page loaded` → `web.webpagedetails.pageViews`; `product viewed` →
`commerce.productViews`; `cart add` → `commerce.productListAdds`; `cart remove` →
`commerce.productListRemovals`; `cart viewed` → `commerce.productListViews`;
`checkout started` → `commerce.checkouts`; `purchase` → `commerce.purchases` +
`commerce.order`; `wishlist add` → `commerce.saveForLaters`; everything else →
`web.webinteraction.linkClicks` named after the event. Page views also set
`data.__adobe.analytics` (prop1/eVar1 = page type, prop2 = section) as an example.

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
            "siteName": "Taiga Supply Co. (demo)", "path": "/shop/product/tidepool-daypack/",
            "language": "en-CA", "environment": "production" },
  "user": { "loginStatus": "guest", "browserLanguage": "fr-CA", "languageMatch": false }
}
```

`page.language` is the language of the page (set at build time);
`user.browserLanguage` and `user.languageMatch` are filled in by the browser as
the page loads. `page.path` is the real address (French on French pages).

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

## Analytics conventions (enforced)

`src/config/analytics.ts` lists the allowed page types, sections, page-name
format, GA4 event names and Adobe event names. Every page is checked at build
time: a page that breaks a convention **fails the build** with a message saying
what to fix. Outside production, every push to either data layer is also checked
in the browser (console warning for an unregistered event, or a key such as
`email` or `phone` that suggests personal data).

To add a page type, section or event, add it to that file first.

## Contact form

`/contact/` posts to `/api/contact` (in `src/worker.ts`), which emails the
message to you through Cloudflare. Your address is a secret in Cloudflare, never
in the site or this repository. Nothing is stored, and analytics only record
`form_start`, `generate_lead` (with the topic) and `form_error`, never what was typed.

One-time setup in Cloudflare:
1. **markdanalytics.ca → Email → Email Routing:** enable it, then under
   **Destination addresses** add the inbox you want messages in and click the
   verification link Cloudflare emails you.
2. **Workers & Pages → markdanalytics → Settings → Variables and Secrets**
   (runtime, not build): add a **Secret** named `CONTACT_TO` with that address.
3. Redeploy. Until then the form politely says it isn't switched on yet.

## English and French

Every page exists in English (at the root) and French (under `/fr/`, with
French addresses: `/shop/cart/` is `/fr/boutique/panier/`). The word list in
`FR_SEGMENTS` (`src/i18n/index.ts`) drives every French address; add a French
slug there when you add a post, practice page, product or story. French route files in `src/pages/fr/` render the English page
component, which reads its language from the URL; strings are picked with
`tr(lang, 'English', 'Français')` from `src/i18n/index.ts`.

**Analytics values are always English**, on both versions, except the address:
page names, content titles, product, list and promo names, video titles, link text.
Analysts usually work in one language, and a page should be one row in a
top-pages report. The language variables are how you split them:

| Data layer | GA4 parameter | Adobe (Web SDK) |
|---|---|---|
| `page.language` | `page_language` | `prop3`, `eVar2` |
| `user.browserLanguage` | `browser_language` | `prop4`, `eVar3` |
| `user.languageMatch` | `language_match` (`match` / `mismatch`) | `prop5` |
| language switch click | `language_switch` (`language_from`, `language_to`) | `language switched` |

GA4 has no `pageName`, so the GTM container sends the English page name as
`page_title` (GA4 would otherwise use the French tab title). GA4's Pages report by
page title then works like Adobe's Pages report; `page_location` stays the real URL.

**In GA4**, register these as event-scoped custom dimensions (Admin > Custom
definitions) so they appear in reports: `page_language`, `browser_language`,
`language_match`, `language_from`, `language_to`.

To check both languages, run the site locally (`npm run build`, then
`npx wrangler dev`) and `npm run test:languages`. It needs Playwright
(`npm install --no-save playwright && npx playwright install chromium`). It crawls every page and fails
if a link is broken, a switch is missing, or a French page sends a different
page name, path or title from its English twin.

To add a language (say `zh-CN` under `/zh/`): add it to `LANGS` and `LOCALE`
in `src/i18n/index.ts` and `PAGE_LANGUAGES` in `src/config/analytics.ts`, then
add the translated text. Nothing in the analytics changes.

## Writing a blog post

1. Copy `src/content/blog/_post-template.md` and rename it. The file name
   becomes the URL, e.g. `adobe-props-vs-evars.md` gives `/blog/adobe-props-vs-evars/`.
2. Fill in the frontmatter and set `draft: false`.
3. Commit and push. Cloudflare publishes it automatically.

Files starting with `_` and posts with `draft: true` are never published.

For the French version, put a file with the **same name** in `src/content/blog/fr/`,
and add its French address to `FR_SEGMENTS` in `src/i18n/index.ts`.
Practice pages work the same way (`src/content/practice/fr/`).

## Where things live

```
src/config/tags.ts         Tag IDs and site name
src/layouts/Base.astro     <head> load order and data layer setup
src/scripts/commerce.ts    Store events and cart
src/scripts/video.ts       Video events
src/scripts/scroll.ts      Scroll-depth events
src/data/products.ts       Demo store catalog
src/data/articles.ts       Demo news stories (with French text)
src/i18n/index.ts          Languages and translation helpers
src/pages/fr/              French routes
tests/check-languages.cjs  Both-language crawl test
src/content/blog/          Your blog posts (Markdown); French in fr/
public/media/              Demo video and poster
```
