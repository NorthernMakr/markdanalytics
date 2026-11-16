---
title: "Consent handling: what the tags do before and after a visitor chooses"
description: "The mechanics of consent in an analytics implementation: one stored choice, a default set before any tag loads, and what the Adobe Web SDK and Google tags each do when a visitor accepts, declines or hasn't chosen yet. Plus what this site does today."
pubDate: 2026-11-15
category: Analytics practice
tags: [consent, privacy, Web SDK, consent mode, Google Tag Manager, GA4, QA]
platform: Both
order: 3
---

**Consent is a tag behaviour, not a banner.** The banner only collects an answer. The implementation is what each tag does with that answer, and what it does before there is one. This page covers those mechanics for the Adobe Web SDK and Google tags. It's the last step of stream 2 on the [implementation map](/process/implementation-map/).

<div class="panel info">

I'm an analytics practitioner, not a lawyer. Which consent rule applies to a site is a decision for whoever is accountable for privacy, with legal advice. This page starts from that decision and shows how to build it.

</div>

## The design on one screen

| Moment | Adobe Web SDK | Google tags (consent mode) |
|---|---|---|
| Before the visitor chooses | `defaultConsent` decides: `in` sends, `pending` holds events, `out` discards them | The default consent state decides, set before any tag loads |
| Visitor accepts | `setConsent` with `general: "in"` | Consent update to `granted` |
| Visitor declines | `setConsent` with `general: "out"` | Consent stays, or is updated to, `denied` |
| Visitor comes back | Call `setConsent` again on every page | Send the update as early as possible on every page |

Both tools follow the same two-step pattern: a default for the unknown visitor, then an update once the visitor has answered.

## Decide the rule first

The tags can do whatever the organisation decides. The decision itself comes from privacy law and policy, so it belongs in the governance and privacy register described on the [Process page](/process/#the-document-set), not in the tag manager.

For Canadian federal law, the Office of the Privacy Commissioner's guidance gives the questions to answer. Consent has to be meaningful, which means people understand what is collected, who it's shared with, for what purposes, and the risk of harm. Any collection that isn't necessary to provide the service needs a clear and easily accessible choice. Express consent is generally required when the information is sensitive, when the collection is outside what a person would reasonably expect, or when it creates a meaningful risk of significant harm. People must be able to withdraw consent ([OPC: guidelines for obtaining meaningful consent](https://www.priv.gc.ca/en/privacy-topics/collecting-personal-information/consent/gl_omc_201805/)).

Provincial and foreign laws can add requirements, so the register should record the rule for each place the site operates. The output the implementation needs is small: for each purpose (analytics, advertising), is the default before a choice **collect**, **hold** or **don't collect**?

## Adobe Web SDK

The Web SDK has one setting for the unknown visitor and one command for the visitor's answer.

**`defaultConsent`** is set when the SDK is configured, and takes three values ([Adobe: defaultConsent](https://experienceleague.adobe.com/en/docs/experience-platform/web-sdk/commands/configure/defaultconsent)):

| Value | Before the visitor chooses |
|---|---|
| `in` | Data collection operates normally until the visitor opts out |
| `pending` | Events are held in the browser until the visitor opts in |
| `out` | Events are discarded until the visitor opts in |

**`setConsent`** tells the SDK the visitor's answer ([Adobe: setConsent](https://experienceleague.adobe.com/en/docs/experience-platform/web-sdk/commands/setconsent)):

```js
alloy("configure", { datastreamId: "…", orgId: "…", defaultConsent: "pending" });

// When the visitor accepts (use "out" when they decline):
alloy("setConsent", {
  consent: [{ standard: "Adobe", version: "1.0", value: { general: "in" } }]
});
```

Three details matter in practice:

- **The SDK can't tell you the stored choice.** It offers no way to retrieve consent, so Adobe suggests calling `setConsent` on every page load to keep it in step with your banner. It only makes a server call when the choice changes (same setConsent page).
- **`in` plus a banner collects before the answer.** With `defaultConsent: "in"`, an ECID is generated and at least one request is sent before a visitor can decline. If consent is required first, Adobe's guidance is to use `pending` ([Adobe: consent and identity in data collection](https://experienceleague.adobe.com/en/docs/experience-platform/collection/identity/consent)).
- **In Adobe Tags it's a setting, not code.** The Web SDK extension has a consent section where default consent is set to Out or Pending ([Adobe: set up consent with the Web SDK](https://experienceleague.adobe.com/en/docs/platform-learn/implement-web-sdk/consent-management/setup-consent)).

## Google tags

Google's version is consent mode. It has the same two steps: set a default consent state before the visitor grants consent, then update it when they interact with the banner ([Google: set up consent mode on websites](https://developers.google.com/tag-platform/security/guides/consent)).

```js
window.dataLayer = window.dataLayer || [];
function gtag(){ dataLayer.push(arguments); }

// Before the Google Tag Manager snippet:
gtag("consent", "default", {
  ad_storage: "denied", ad_user_data: "denied",
  ad_personalization: "denied", analytics_storage: "denied"
});

// When the visitor accepts analytics:
gtag("consent", "update", { analytics_storage: "granted" });
```

- **Order is everything.** The default has to run before the tag manager loads. Google's own example warns that if the consent code is called out of order, the defaults won't work (same Google page).
- **Four consent types cover measurement and ads.** `analytics_storage` is the one GA4 depends on: when it's denied, Google Analytics won't read or write first-party analytics cookies ([Google: consent mode overview](https://developers.google.com/tag-platform/security/concepts/consent-mode)).
- **Basic or advanced is a policy choice.** In basic consent mode, Google tags don't load until the visitor interacts with the banner, and nothing is sent before consent. In advanced consent mode, tags load with the defaults, and while consent is denied they send measurements without cookies (same overview page). The register should say which one the organisation has chosen, because "nothing is sent" and "cookieless measurements are sent" are different promises to a visitor.

## Rules for the implementation

These are the standards I'd write into the data layer specification and the tag manager.

1. **One stored choice feeds every tool.** The banner writes one record of the visitor's answer. Adobe and Google both read from it. Two tools must never disagree about the same visitor.
2. **Defaults load first.** The load order becomes: consent defaults, then the data layer, then the tag managers. This site's [load order](/implementation/data-layer-specification/#3-load-order) would gain a step at the front.
3. **Declining is as easy as accepting,** and a visitor can change their answer later from a link on every page.
4. **The choice is not personal data in the data layer.** Record the consent state per purpose (`granted` or `denied`), never anything that identifies the visitor.
5. **Consent states are test cases.** Every release is checked in each state below.

## What QA checks

| State | Adobe Web SDK should | Google tags should |
|---|---|---|
| No choice yet | Send nothing if the default is `pending` or `out` | Send nothing (basic), or cookieless measurements only (advanced) |
| Accepted | Send any held events, then collect normally | Send full measurement data and write cookies |
| Declined | Send no events | Not read or write analytics cookies |
| Changed from accept to decline | Stop collecting from that moment | Receive an update to `denied` |
| Returning visitor | Behave as the stored choice says, with no banner | Same |

For Google, Tag Assistant shows the default and the update as consent events, and whether each parameter was set ([Google: troubleshoot consent mode](https://developers.google.com/tag-platform/security/guides/consent-debugging)). For Adobe, the browser's network panel shows whether a request left the page. "Consent declined" is already on this site's list of [QA edge cases](/process/#qa-standards).

## What this site does today

<div class="panel warn">

**This site doesn't have a consent banner yet, and it should.** The design above is what it will be built to. Until then, this is exactly what happens.

</div>

| Tool | Today | What the design changes |
|---|---|---|
| Adobe Web SDK | Configured with `defaultConsent: "in"`. Requests go to a stand-in Edge Network on this domain and never reach Adobe. The SDK's identity cookie holds a made-up ID | `pending` by default, and `setConsent` from the banner |
| Google Tag Manager and GA4 | The container loads on every page with no consent defaults set, and sends to a real GA4 property | Consent defaults before the container, and an update from the banner |
| Data layers | No personal data in any field, enforced at build time | Unchanged, plus a consent state per purpose |

So the Adobe side collects nothing real, but the Google side does, without asking first. That gap is why this page is marked "partial" on the map: the standard is written, and the build is next.
