---
title: Testing the Adobe Web SDK without an Adobe account
description: How this site runs Adobe's real Web SDK against a stand-in Edge Network, so every XDM request can be built, sent and inspected without any data reaching Adobe.
pubDate: 2026-10-29
category: Web SDK
tags: [Web SDK, alloy.js, XDM, Edge Network, Adobe Analytics]
platform: Adobe
---

Practising a Web SDK implementation normally needs an Adobe org, a datastream and a schema before you can send a single event. This site skips all of that. It runs Adobe's real Web SDK library, but points it at a small stand-in for Adobe's Edge Network that lives on this domain. The SDK behaves exactly as it would in production: it builds XDM payloads, manages identity, sets its cookies and makes real network requests. Those requests just never leave markdanalytics.ca.

## The moving parts

| Piece | Where it lives | What it does |
|---|---|---|
| Web SDK (`alloy.js` 2.36.1) | `/vendor/alloy-2.36.1.min.js` | Adobe's own library, self-hosted, unmodified |
| Bridge script | `/lab/websdk-bridge.js` | Turns `adobeDataLayer` events into `sendEvent` calls with XDM, the job an Adobe Tags rule would normally do |
| Mock Edge Network | `markdanalytics.ca/ee/*` (a Cloudflare Worker) | Answers the SDK's requests the way Adobe's edge would |
| Event log, Web SDK tab | Bottom-right of every page | Shows each request the SDK built and where it went |

## How a request flows

1. A page pushes an event to the Adobe Client Data Layer, for example `adobeDataLayer.push({ event: "cart add", productListItems: [...] })`.
2. The bridge maps it to XDM and calls `alloy("sendEvent", { xdm, data })`.
3. The SDK enriches the payload with its automatic fields (`device`, `environment`, `placeContext`, `timestamp`, `implementationDetails`) and runs `onBeforeEventSend`, which copies the finished payload into the Event log.
4. The SDK POSTs to `https://markdanalytics.ca/ee/v1/interact`, because `edgeDomain` is set to this site instead of Adobe's default `edge.adobedc.net`.
5. The Worker replies with a minimal Edge response: an ECID in an `identity:result` handle, and a `state:store` handle so the SDK writes its `kndctr_…_identity` cookie, just as it would with Adobe. It also echoes back what it received.

From the SDK's point of view, it is talking to the Edge Network.

## The configuration

```js
alloy("configure", {
  datastreamId: "lab-mock-datastream-0000",   // placeholder, never checked
  orgId: "MARKDLAB000000000000000@AdobeOrg",  // placeholder
  edgeDomain: location.hostname,              // send to this site, not Adobe
  defaultConsent: "in",
  clickCollectionEnabled: false,              // only the events this site sends
  onBeforeEventSend: (content) => {
    // copy content.xdm and content.data into the Event log
  },
});
```

The IDs are placeholders because nothing validates them. The mock Edge accepts any datastream.

## XDM mapping

Commerce events use the standard XDM `commerce` fields, which Adobe Analytics maps automatically when data does reach Adobe.

| adobeDataLayer event | XDM `eventType` | Analytics equivalent |
|---|---|---|
| `page loaded` | `web.webpagedetails.pageViews` | page view |
| `product viewed` | `commerce.productViews` | `prodView` |
| `cart add` | `commerce.productListAdds` | `scAdd` |
| `cart remove` | `commerce.productListRemovals` | `scRemove` |
| `cart viewed` | `commerce.productListViews` | `scView` |
| `checkout started` | `commerce.checkouts` | `scCheckout` |
| `purchase` | `commerce.purchases` + `commerce.order` | `purchase` with `purchaseID` |
| `wishlist add` | `commerce.saveForLaters` | (custom event) |
| everything else | `web.webinteraction.linkClicks` | link call named after the event |

Products travel in `productListItems` (`SKU`, `name`, `quantity`, `priceTotal`, `productCategories`). Page views also set a few Analytics variables directly through `data.__adobe.analytics` (`prop1` and `eVar1` for page type, `prop2` for site section), to show that path.

## Seeing it work

- **Event log → Web SDK tab.** Each entry is the final payload the SDK sent, after its own enrichment, labelled with where it went.
- **DevTools → Network**, filtered on `interact`. These are the real POST requests. The request body is the SDK's payload, and the response is the mock Edge's reply, including a `lab:received` handle echoing what arrived.
- **Adobe Experience Platform Debugger.** The browser extension sees the calls the same way.
- **Cookies.** After the first request, look for `kndctr_MARKDLAB000000000000000_AdobeOrg_identity` under Application → Cookies. Its value starts with `lab-ecid-`, which marks it as a fake ECID.

## Modes

The behaviour is controlled by the `PUBLIC_WEBSDK_MODE` build variable:

| Mode | Behaviour |
|---|---|
| `mock` (default) | Real SDK, requests answered by this site's stand-in Edge |
| `cancel` | Real SDK builds and logs each request, then `onBeforeEventSend` returns `false`, so nothing is sent at all |
| `live` | Real datastream and org IDs; data goes to Adobe |
| `off` | Web SDK not loaded |

## What it can't show

A mock Edge validates the client side of an implementation: payload shape, event timing, identity behaviour and the data layer to XDM mapping. Anything that happens on Adobe's side is out of reach:

- **No datastream processing.** Data Prep mappings, datastream overrides and schema validation don't run, so an XDM field that doesn't exist in your schema won't be flagged.
- **No reports.** Nothing reaches Analytics, Customer Journey Analytics or Platform.
- **No personalization.** Target and Journey Optimizer decisions need the real Edge.
- **Fake identity.** The ECID is random and only meaningful to this site.
- **Video is simplified.** Media events go as link calls, not through Adobe's Streaming Media collection.

For those, the same bridge works unchanged in `live` mode once there's a real datastream to send to.

## Further reading

- [Install the Web SDK using the JavaScript library](https://experienceleague.adobe.com/en/docs/experience-platform/web-sdk/install/library)
- [`edgeDomain` configuration](https://experienceleague.adobe.com/en/docs/experience-platform/web-sdk/commands/configure/edgedomain)
- [`onBeforeEventSend` configuration](https://experienceleague.adobe.com/en/docs/experience-platform/web-sdk/commands/configure/onbeforeeventsend)
