// ---------------------------------------------------------------------------
// Analytics conventions for this site: the allowed values every page and event
// must use. Base.astro checks each page against these at build time, so a page
// that breaks a convention fails the build instead of reaching production.
// Events are checked in the browser outside production (a console warning).
//
// To add a page type, section or event: add it here first, with a comment
// saying what it's for, then use it. That mirrors the practice's change process.
// ---------------------------------------------------------------------------

/** page.type: the template of the page. Lowercase, from this list only. */
export const PAGE_TYPES = [
  'home',               // home page of a site (this blog, the store)
  'article list',       // index of posts
  'article',            // a single post, practice page or news story
  'section front',      // landing page of a section (practice, media home)
  'contact',            // contact page
  'error',              // 404 and other error pages
  'product listing',    // store home lists and catalog
  'product detail',     // single product
  'cart',
  'checkout',           // shipping and payment steps
  'order confirmation',
] as const;

/** page.section: the top-level area of the site. Lowercase, from this list only. */
export const SECTIONS = [
  'home', 'blog', 'practice', 'contact', 'error', 'shop', 'media',
  'site', // pages about the site itself (development notes)
] as const;

/** page.name: lowercase, colon-separated hierarchy, e.g. "shop:product:tidepool-daypack". */
export const PAGE_NAME_PATTERN = /^[a-z0-9-]+(:[a-z0-9-]+)*$/;

/** GA4 events pushed to dataLayer. snake_case; Google's recommended names first. */
export const GA4_EVENTS = [
  'page_data_ready',
  // ecommerce (Google recommended)
  'view_item_list', 'select_item', 'view_item', 'add_to_cart', 'remove_from_cart',
  'add_to_wishlist', 'view_cart', 'begin_checkout', 'add_shipping_info',
  'add_payment_info', 'purchase', 'view_promotion', 'select_promotion',
  // video (same names GA4 uses for YouTube)
  'video_start', 'video_progress', 'video_complete', 'video_pause', 'video_seek',
  // content and navigation
  'scroll_depth', 'content_click', 'filter_applied',
  // forms (generate_lead is Google recommended)
  'form_start', 'generate_lead', 'form_error',
] as const;

/** Adobe Client Data Layer events. Lowercase words, object then action. */
export const ADOBE_EVENTS = [
  'page loaded',
  'product list viewed', 'product clicked', 'product viewed', 'cart add', 'cart remove',
  'wishlist add', 'cart viewed', 'checkout started', 'checkout step', 'purchase',
  'promotion viewed', 'promotion clicked', 'search filtered',
  'media start', 'media milestone', 'media complete', 'media pause', 'media seek',
  'content scrolled', 'content clicked',
  'form started', 'form submitted', 'form error',
] as const;

/**
 * Keys that would mean personal data is in the data layer. Checked on every
 * push outside production. ("name" isn't listed: products, forms and
 * promotions legitimately have names.)
 */
export const FORBIDDEN_KEYS = ['email', 'phone', 'address', 'message', 'firstName', 'lastName', 'fullName', 'password'] as const;

export function checkPage(page: Record<string, unknown>, where: string) {
  const problems: string[] = [];
  const t = String(page.type ?? '');
  const s = String(page.section ?? '');
  const n = String(page.name ?? '');
  if (!(PAGE_TYPES as readonly string[]).includes(t)) problems.push(`page.type "${t}" isn't in PAGE_TYPES`);
  if (!(SECTIONS as readonly string[]).includes(s)) problems.push(`page.section "${s}" isn't in SECTIONS`);
  if (!PAGE_NAME_PATTERN.test(n)) problems.push(`page.name "${n}" must be lowercase and colon-separated`);
  if (n && s && n !== s && !n.startsWith(s + ':') && !(s === 'home' && n === 'home')) {
    problems.push(`page.name "${n}" must start with its section "${s}:"`);
  }
  if (!page.siteName) problems.push('page.siteName is missing');
  if (problems.length) {
    throw new Error(`Analytics convention check failed for ${where}:\n  - ${problems.join('\n  - ')}\nSee src/config/analytics.ts`);
  }
}
