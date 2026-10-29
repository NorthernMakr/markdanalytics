---
title: Running an enterprise digital analytics practice
description: What to document when running an enterprise analytics practice, from QA standards and variable records to developer specs and a base Adobe and GA4 setup.
pubDate: 2026-10-29
updatedDate: 2026-10-29
category: Analytics practice
tags: [governance, QA, documentation, data layer, Adobe Analytics, GA4]
platform: Both
---

Most analytics problems in large organisations aren't tagging problems. They're memory problems. Nobody remembers why eVar37 exists, which team asked for it, whether the checkout step event still fires on the new app, or which of three "page type" dimensions is the right one. The tags work; the knowledge around them has evaporated.

A practice fixes that by writing things down in a consistent way, and by making the written version the thing people actually use. This page sets out what I'd document if I were running an enterprise digital analytics practice, and why each piece earns its place. Later pages in this section go deeper on each one, using the [demo store](/shop/) and [media site](/media/) on this domain as worked examples.

## The document set

Six documents carry a practice. Everything else is a view of one of these.

| Document | Answers | Owned by | Changes when |
|---|---|---|---|
| Tracking plan (solution design reference) | What do we measure, why, and where does it live in each tool? | Analytics lead | A variable is added, changed or retired |
| Data layer specification | What must the site expose, with what names, types and timing? | Analytics lead, agreed with engineering | The tracking plan needs new data |
| Implementation specs | What exactly does this team build for this release? | Analyst writing the ticket | Per project or release |
| QA test plans and results | How do we know it works, and did it? | QA analyst | Per release; results kept forever |
| Change log | What changed, when, and what it affects in reports | Whoever ships the change | Every production change |
| Governance and privacy register | Who decides, and what data are we allowed to collect? | Practice lead, with privacy/legal | Policy or ownership changes |

The tracking plan is the centre. If a variable isn't in it, it doesn't exist as far as the practice is concerned, and if it's in the plan but not in the tools, that's a defect.

## Documentation standards

A few rules keep documentation trustworthy:

- **One source of truth per thing.** The tracking plan lives in one place, usually a controlled spreadsheet or a wiki page generated from one. Reports, tool descriptions and specs link to it rather than copying it.
- **Written for the reader who wasn't there.** Every entry says what business question it answers in plain language, not just what it is technically.
- **Versioned and dated.** Every change has a date, an author and a reason. A tracking plan without history can't explain a step change in a trend line.
- **Status on everything.** Proposed, approved, in development, live, deprecated, retired. Readers need to know whether a variable is safe to report on.
- **Reviewed on a schedule.** A quarterly review compares the plan to what the tools are actually receiving, and fixes whichever is wrong.
- **Templates, not blank pages.** Specs, test plans and change entries use fixed templates, so they can be compared across teams and years.

## Variable documentation

Every variable gets one record in the tracking plan, with the same fields every time. This is the record for page type on this site:

| Field | Example |
|---|---|
| Name | Page type |
| Business question | Which kinds of pages drive engagement and conversion? |
| Definition | The template of the page: home, article, product detail, cart, checkout, order confirmation |
| Data layer source | `page.type` |
| Allowed values and format | Lowercase, from a fixed list; no free text |
| Adobe Analytics | `prop1` and `eVar1` (hit expiry); via Web SDK, `data.__adobe.analytics` |
| GA4 | Event parameter `page_type`, event-scoped custom dimension "Page type" |
| Set on | Every page view; persists on events from that page |
| Privacy classification | Not personal data |
| Owner | Analytics lead |
| Status | Live since 2026-10-29 |
| Notes and history | (empty) |

Two fields do most of the work. **Business question** stops variables being created "just in case". **Data layer source** separates what the site exposes from how each tool stores it, so a tool migration doesn't change the site.

### Sharing it

Documentation nobody can find doesn't exist. Three habits help:

- **Put the definition where people read the data.** Adobe component descriptions and GA4 custom definition descriptions should carry the one-line definition and a link to the full record.
- **Use the same name everywhere.** If it's "Page type" in the plan, it's "Page type" in Analysis Workspace, GA4, Looker Studio and the data warehouse.
- **Publish changes.** A short note to report users whenever a variable is added, changed or retired, linking to the change log.

### Naming conventions

Agree these once and enforce them in review:

- **Data layer keys:** camelCase, grouped by object (`page.type`, `product.sku`, `user.loginStatus`).
- **GA4 events and parameters:** snake_case, Google's recommended names first (`add_to_cart`, `item_list_name`), your own only when no recommended one fits.
- **Adobe classifications and values:** lowercase, colon-separated hierarchies for page names (`shop:product:tidepool-daypack`).
- **Display names:** sentence case, no abbreviations a new hire wouldn't know.

On a multilingual site, everything sent to analytics is in one language (English here), whatever language the page is in: page names and paths, titles, products, lists, promotions, videos, link text. Analysts usually work in one language, and the data in Workspace or GA4 has to make sense to them; it also keeps each page as one row in a top-pages report. To split by language, segment on `page.language` and `user.browserLanguage`. [Measuring a multilingual site](/practice/multilingual-sites/) covers this in full.

## Adding or changing a variable

Slots are finite. A standard GA4 property allows [50 event-scoped and 25 user-scoped custom dimensions](https://support.google.com/analytics/answer/12229528?hl=en) and [10 item-scoped ones](https://support.google.com/analytics/answer/14239695?hl=en). Adobe allows [up to 250 eVars](https://experienceleague.adobe.com/en/docs/analytics/components/dimensions/evar), [75 props](https://experienceleague.adobe.com/en/docs/analytics/implementation/vars/page-vars/prop) and [1,000 success events](https://experienceleague.adobe.com/en/docs/analytics/admin/admin-tools/manage-report-suites/edit-report-suite/conversion-variables/success-event), depending on contract. A change process protects those slots and the trust in the data.

### Adding a variable

1. **Request.** The requester states the business question, the decision it will inform, and who will use it.
2. **Check for reuse.** Can an existing variable, a classification, or a segment answer it? Most requests end here.
3. **Design.** Define the data layer key, allowed values, and the mapping in each tool, including scope, allocation and expiry in Adobe.
4. **Privacy review.** Confirm it isn't personal data, or that collecting it is covered by consent and policy.
5. **Approve.** The analytics lead signs off and the record goes into the plan with status "approved".
6. **Specify.** Write it into the next implementation spec for engineering.
7. **Build and QA.** Implement in development, test against the spec, record the results.
8. **Release and announce.** Ship, set status to "live", add a change log entry, tell report users.
9. **Monitor.** Watch the first two weeks of data for gaps, unexpected values or volume problems.

### Changing or retiring a variable

- **Never repurpose silently.** Reusing eVar37 for something new without a break in the data corrupts every historical trend that uses it. If a slot must be reused, retire the old meaning, clear the old data's labels, and annotate the date.
- **Change definitions, not names, through the same process** as adding a variable, with the old definition kept in the record's history.
- **Retire in two steps:** mark as deprecated (still collected, flagged in reports) for one reporting cycle, then stop collecting and archive.
- **Annotate reports** in both tools on the date of any change that affects trends.

## Implementation specs for developers

Engineers shouldn't need to understand Adobe or Google to implement analytics correctly. The spec is written in terms of the data layer only; tag management turns that into tool calls. A good spec contains:

- **Scope.** Pages, templates, components and platforms (web, app) covered.
- **Data layer objects** as exact JSON, one example per page type.
- **Field definitions:** key, type, required or optional, allowed values, example, and source (CMS field, API response).
- **Events:** name, the user action that triggers it, timing (before navigation, after the API responds), and the payload.
- **Rules:** no personal data in any field; prices as numbers, not strings; one event per action; clear `ecommerce` before each GA4 ecommerce push.
- **Acceptance criteria** the developer can check themselves, such as "after Add to cart, the last `dataLayer` entry is `add_to_cart` with `items[0].item_id` equal to the product SKU".
- **Version and contacts:** spec version, the analyst who wrote it, and where to ask questions.

The spec is the contract. QA tests against it, not against what the tools happen to show.

## A standard base: data layer and tags

Every property in the practice starts from the same base, so teams aren't reinventing page tracking and analysts can compare sites. This site runs exactly this base; the [data layer post](/blog/how-this-sites-data-layer-works/) walks through it.

### The data layer

One page object, built server-side and pushed before any tag manager loads:

```json
{
  "page": { "name": "shop:product:tidepool-daypack", "type": "product detail",
            "section": "shop", "siteName": "Taiga Supply Co.",
            "path": "/shop/product/tidepool-daypack/", "language": "en-CA",
            "environment": "production" },
  "user": { "loginStatus": "guest", "browserLanguage": "fr-CA", "languageMatch": false },
  "content": { },
  "product": { }
}
```

It's pushed to both `dataLayer` (for Google Tag Manager) and `adobeDataLayer` (the Adobe Client Data Layer). Interactions follow each platform's conventions: GA4's recommended ecommerce events on one side, XDM-shaped events on the other.

### The tags

| Layer | Adobe | Google |
|---|---|---|
| Data layer | Adobe Client Data Layer (`adobeDataLayer`) | `dataLayer` |
| Tag management | Adobe Experience Platform Tags | Google Tag Manager |
| Collection | Web SDK `sendEvent` with XDM | GA4 Google tag and event tags |
| Base on every page | Page view with `web.webPageDetails` | Google tag with shared page parameters |
| Load order | Data layer, then Tags, then GTM | |

### The base variables

These are collected on every property from day one. The two language variables answer different questions: `page.language` is the version of the page that was read, and `user.browserLanguage` is the language the visitor's browser asks for. Together they show who is reading a page in a language other than their own.

| Data layer | Adobe Analytics | GA4 |
|---|---|---|
| `page.name` | `pageName` (`web.webPageDetails.name`) | `page_name` |
| `page.type` | `prop1`, `eVar1` | `page_type` |
| `page.section` | `prop2`, channel | `site_section` |
| `page.siteName` | report suite or `eVar` | `site_name` |
| `page.environment` | `eVar` | `site_environment` |
| `page.language` | `prop3`, `eVar2` | `page_language` |
| `user.browserLanguage` | `prop4`, `eVar3` | `browser_language` |
| `user.languageMatch` | `prop5` (`match` / `mismatch`) | `language_match` |
| `user.loginStatus` | `eVar` (visit expiry) | `login_status` (user-scoped) |
| `content.*` | `eVar`s per content field | `content_*` parameters |

## QA standards

Testing happens at four levels, and each has a clear owner and exit criteria.

| Level | Who | What | Passes when |
|---|---|---|---|
| Developer check | Engineer | Data layer matches the spec, using browser tools | Every acceptance criterion in the spec is met |
| Functional QA | QA analyst | Each event and its tool payloads in a test environment | Every test case passes, with evidence attached |
| Regression | Automated | Scripted journeys (product view to purchase, video) asserting data layer contents | Suite is green on every release candidate |
| Production monitoring | Analytics team | Daily volumes, nulls and unexpected values per key variable | Alerts reviewed within one business day |

Some standards apply at every level:

- **Test against the spec,** never against "what the tool shows". A tool can be consistently wrong.
- **Keep evidence.** Payload screenshots or exported requests, attached to the ticket, kept with the release.
- **Test the edges:** reloads (purchase must not double-count), back button, empty cart, ad blockers, consent declined.
- **Use each platform's tools:** Adobe Experience Platform Debugger and Assurance for Adobe; Tag Assistant and DebugView for Google; the browser's network panel for both.

### Automate the conventions

Standards that rely on memory drift. On this site the conventions live in one file of allowed values (page types, sections, page-name format, languages, and every registered event name), and the build checks every page against it. A page with an unregistered page type, or a page name that isn't lowercase and colon-separated, fails the build and never reaches production. Outside production, every data layer push is also checked in the browser, with a console warning for an unregistered event or a key like `email` or `phone` that suggests personal data has slipped in. Adding a page type or event means adding it to that file first, which is the change process in miniature.

This site's [store](/shop/) is set up to practise these cases. The Event log on every page shows both data layers live, and the confirmation page deliberately doesn't re-send `purchase` on reload.

## Coming next in this section

- A tracking plan template, with this site's variables filled in
- Writing an implementation spec developers will actually read
- A QA test plan for an ecommerce purchase path
- Running a variable review: finding and retiring dead variables
