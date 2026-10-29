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
  gtmId: import.meta.env.PUBLIC_GTM_ID || 'GTM-NM7SRRNT',

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

  /**
   * Adobe Web SDK (alloy.js). Modes:
   *   "mock"   (default) real SDK, requests go to this site's /ee/ stand-in, nothing reaches Adobe
   *   "cancel" real SDK builds each request, logs it, then cancels it (no network calls)
   *   "live"   real datastream + org IDs below; data goes to Adobe
   *   "off"    don't load the Web SDK
   */
  webSdk: {
    mode: (import.meta.env.PUBLIC_WEBSDK_MODE ?? 'mock') as 'mock' | 'cancel' | 'live' | 'off',
    datastreamId: import.meta.env.PUBLIC_WEBSDK_DATASTREAM_ID || 'lab-mock-datastream-0000',
    orgId: import.meta.env.PUBLIC_WEBSDK_ORG_ID || 'MARKDLAB000000000000000@AdobeOrg',
    edgeDomain: import.meta.env.PUBLIC_WEBSDK_EDGE_DOMAIN ?? '', // live mode only; blank = Adobe default
    src: '/vendor/alloy-2.36.1.min.js', // self-hosted copy of Adobe's Web SDK
  },

  /** Show the floating event log that mirrors dataLayer and adobeDataLayer. */
  showEventLog: (import.meta.env.PUBLIC_SHOW_EVENT_LOG ?? 'true') !== 'false',
};

export const siteMeta = {
  owner: 'Mark Dykeman',
  blogName: 'Tag & Layer',
  blogTagline: 'Practical notes on Adobe Analytics, Google Analytics and the data layers that feed them.',
  blogTaglineFr: 'Notes pratiques sur Adobe Analytics, Google Analytics et les couches de données qui les alimentent.',
  language: 'en-CA',
  currency: 'CAD',
};
