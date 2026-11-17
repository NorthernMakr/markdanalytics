---
title: "Setting up variables in Adobe Analytics, CJA and GA4"
description: "The same value, page type, set up three ways: as an eVar in Adobe Analytics, a schema field and data view component in Customer Journey Analytics, and a custom dimension in GA4. What you configure, what you send, and where the reporting behaviour lives."
updatedDate: 2026-11-17
pubDate: 2026-11-15
category: Analytics practice
tags: [variables, eVars, XDM, data views, custom dimensions, Adobe Analytics, Customer Journey Analytics, GA4]
platform: Both
order: 2
---

**Name it on the page; number it in the tags.** The page exposes a value under a business name, `page.type`. Each analytics tool then stores it its own way. This page follows that one value into Adobe Analytics, Customer Journey Analytics (CJA) and GA4, to show what "setting up a variable" means in each. It's the detail behind stream 1 of the [implementation map](/process/implementation-map/).

## The three side by side

| | Adobe Analytics | Customer Journey Analytics | GA4 |
|---|---|---|---|
| The variable is | A numbered slot: `eVar2` | A named schema field | A named event parameter: `page_type` |
| Defined in | The report suite | The XDM schema, then the data view | Custom definitions in the property |
| The tags send | `data.__adobe.analytics.eVar2` | An XDM field | A parameter on the event |
| Behaviour (how long a value gets credit) is set | On the eVar, in the report suite | On the component, in the data view | By scope: event, user or item |
| Meaning lives in | The SDR | The field name | The parameter name |

## Adobe Analytics

1. **Choose the variable type.** An eVar persists and takes credit for later events; a prop applies only to the hit it's set on; a success event counts something ([Adobe: eVars](https://experienceleague.adobe.com/en/docs/analytics/components/dimensions/evar), [props](https://experienceleague.adobe.com/en/docs/analytics/components/dimensions/prop), [success events](https://experienceleague.adobe.com/en/docs/analytics/admin/admin-tools/manage-report-suites/edit-report-suite/conversion-variables/success-event)).
2. **Configure it in the report suite.** Give the slot its name and, for an eVar, its expiration and allocation. These are report suite settings, not page code, so they're recorded in the [SDR](/implementation/sdr/). For page type on this site: `eVar2`, expires on the hit, most recent allocation.
3. **Send the value from the tags.** With the Web SDK, Adobe's recommended way to set eVars, props and events is the `data` object ([Adobe: set up Analytics with the Web SDK](https://experienceleague.adobe.com/en/docs/platform-learn/implement-web-sdk/applications-setup/setup-analytics)):

   ```js
   alloy("sendEvent", {
     data: { __adobe: { analytics: { eVar2: "product detail" } } }
   });
   ```

4. **Let standard fields map themselves.** Standard XDM fields such as the page name and commerce events map to Analytics variables automatically, so they need no eVar (same Adobe page).

The same Adobe page lists two older routes, Analytics processing rules and mapping schema fields directly to variables, as no longer recommended. It also notes that, as of May 2024, an XDM schema is no longer required to implement Analytics with the Web SDK.

## Customer Journey Analytics

CJA has no numbered slots. It reports on datasets in Adobe Experience Platform, and every dataset is built on an XDM schema.

1. **Add the field to the schema.** Use Adobe's standard field groups first and add your own field only when no standard one fits. Fields your organisation defines sit under your tenant ID, which keeps them from colliding with Adobe's ([Adobe: namespacing in XDM](https://experienceleague.adobe.com/en/docs/experience-platform/xdm/schema/namespaces)).
2. **Create the dataset and point the datastream at it.** The datastream gets the Adobe Experience Platform service, with your dataset as its event dataset ([Adobe: ingest data via the Web SDK](https://experienceleague.adobe.com/en/docs/analytics-platform/using/cja-data-ingestion/ingest-use-guides/aepwebsdk)).
3. **Send the value as XDM.** The field name carries the meaning. (Illustrative: this site doesn't send this field.)

   ```js
   alloy("sendEvent", {
     xdm: { _yourTenantId: { page: { type: "product detail" } } }
   });
   ```

4. **Create a connection, then a data view.** The connection brings the dataset into CJA. The data view is where a schema field becomes a dimension or metric in Analysis Workspace (same ingest guide).
5. **Set behaviour on the component.** Persistence is off by default, so a dimension relates only to metrics in the same event. Turning it on means choosing an allocation and an expiration ([Adobe: persistence component settings](https://experienceleague.adobe.com/en/docs/analytics-platform/using/cja-dataviews/component-settings/persistence)).

The difference that matters most: in Adobe Analytics, expiration and allocation are decided in the report suite before data is collected. In CJA they're data view settings, and a data view lets you change them without changing the schema or re-implementing ([Adobe: data views overview](https://experienceleague.adobe.com/en/docs/analytics-platform/using/cja-dataviews/data-views)).

One caution for a site that starts with Analytics: values sent only in the `data` object don't reach the Platform dataset unless they're mapped into XDM ([Adobe: set up Analytics with the Web SDK](https://experienceleague.adobe.com/en/docs/platform-learn/implement-web-sdk/applications-setup/setup-analytics)). An eVar-only variable is invisible to CJA.

## GA4

1. **Send the value as an event parameter.** In Google Tag Manager, a data layer variable reads `page.type` and the Google tag sends it as `page_type`. Values about the user go as user properties; values about a product go inside the `items` array.
2. **Register it as a custom dimension.** GA4 collects the parameter either way, and it reaches the BigQuery export if the export is switched on ([Google: BigQuery Export schema](https://support.google.com/analytics/answer/7029846?hl=en)). Registering is what makes it usable in GA4 reports, 24 to 48 hours later ([Google: dimensions and metrics](https://support.google.com/analytics/answer/14240153?hl=en)). Register before launch, so reports have the data from day one.
3. **Pick the scope.** Event scope reports on a parameter of an event, user scope on a property of the user, and item scope on a product inside the `items` array of an ecommerce event (same Google page). Page type is event-scoped.
4. **Mind the limits.** A standard property allows 50 event-scoped, 25 user-scoped and 10 item-scoped custom dimensions (same Google page), so registration goes through the [change process](/process/#adding-or-changing-a-variable) like any Adobe slot.

**Compared with Adobe Analytics:** both tools need the variable set up in the admin console before it shows in reports, so in both the setup belongs before launch. What differs is a value sent too early. GA4 still collects the parameter, so the BigQuery export has it. In Adobe Analytics each eVar is enabled or disabled in the report suite ([Adobe: conversion variables](https://experienceleague.adobe.com/en/docs/analytics/admin/admin-tools/manage-report-suites/edit-report-suite/conversion-variables/conversion-var-admin)), and Adobe's guide to list variables says a disabled variable collects no data even when the implementation sends it ([Adobe: list variables](https://experienceleague.adobe.com/en/docs/analytics/admin/admin-tools/manage-report-suites/edit-report-suite/conversion-variables/list-var-admin)). Plan on a value sent too early to Adobe being lost, not just hidden.

GA4 has no expiration or allocation to configure. The closest equivalent is choosing the scope.

## What this site does

| Tool | Status | How page type is set up here |
|---|---|---|
| Adobe Analytics | Simulated | `eVar2` in the `data` object on every hit, next to standard XDM for page and commerce data. The report suite settings exist only as a design in the SDR |
| CJA | Not built | Standard XDM fields would reach a dataset; the custom values exist only as eVars, so they wouldn't |
| GA4 | Live | `page_type`, sent by Google Tag Manager on every event, for an event-scoped custom dimension named "Page type" |

<div class="panel warn">

**The Adobe side is a workaround.** I don't have access to an Adobe account for this site, so there is no report suite, datastream or Tags property. A script does the mapping an Adobe Tags rule would do, and a stand-in Edge Network receives the requests. That proves what the browser sends, not how Adobe processes it. See [Testing the Adobe Web SDK without an Adobe account](/data-quality/testing-adobe-web-sdk-without-an-adobe-account/).

</div>

To make this site CJA-ready, each custom value (page type, section, the language variables) would need a named field in a schema, sent in the `xdm` object alongside the eVar.
