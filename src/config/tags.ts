// ---------------------------------------------------------------------------
// Tag configuration
//
// Every value can be set two ways:
//   1. Environment variables (recommended): in Cloudflare Pages go to
//      Settings > Environment variables and add PUBLIC_GTM_ID etc.
//      Locally, put them in a .env file (see .env.example).
//   2. Hard-code them below in place of the empty strings.
//
// Anything left empty is simply not loaded, so the site works with no tags.
// ---------------------------------------------------------------------------

export const tags = {
  /** Google Tag Manager container ID, e.g. "GTM-ABC1234" */
  gtmId: import.meta.env.PUBLIC_GTM_ID ?? '',

  /**
   * Adobe Experience Platform Tags (Launch) embed URL for this environment,
   * e.g. "https://assets.adobedtm.com/abc123/def456/launch-xyz-development.min.js"
   */
  adobeTagsUrl: import.meta.env.PUBLIC_ADOBE_TAGS_URL ?? '',

  /**
   * Optional: load gtag.js directly with a GA4 measurement ID ("G-XXXXXXX")
   * instead of (or alongside) GTM. Most of the time you'll use GTM instead.
   */
  ga4Id: import.meta.env.PUBLIC_GA4_ID ?? '',

  /** Show the floating event log that mirrors dataLayer and adobeDataLayer. */
  showEventLog: (import.meta.env.PUBLIC_SHOW_EVENT_LOG ?? 'true') !== 'false',
};

export const siteMeta = {
  owner: 'Mark Dykeman',
  blogName: 'Tag & Layer',
  blogTagline: 'Practical notes on Adobe Analytics, Google Analytics and the data layers that feed them.',
  language: 'en-CA',
  currency: 'CAD',
};
