---
title: Sample specifications
description: "Four working analytics specifications for this site's demo store and news site: a data layer specification, a tracking plan, and two implementation specs, ready to use as templates."
pubDate: 2026-11-02
category: Analytics practice
tags: [specifications, tracking plan, SDR, data layer, implementation, templates]
platform: Both
order: 1
---

**These are real specifications for real (demo) sites.** Each one documents what this site actually sends, so you can open a page, open the Event log, and check the spec against the data. They're also templates: copy the structure, replace the content.

The [practice overview](/practice/) explains why a practice needs these documents. This section shows what they look like when they're filled in.

## The four documents

| Document | Who reads it | What it answers | Changes when |
|---|---|---|---|
| [Data layer specification](/practice/data-layer-specification/) | Developers, analysts | What does every page expose, with what names, types and values? | The site needs to expose new data |
| [Tracking plan (SDR)](/practice/tracking-plan/) | Analysts, report users | What do we measure, why, and where does it land in Adobe and GA4? | A variable is added, changed or retired |
| [Implementation spec: demo store](/practice/implementation-spec-store/) | The developer building it, QA | Exactly what to build for the Taiga Supply Co. purchase path, and how to test it | Per release |
| [Implementation spec: demo media site](/practice/implementation-spec-media/) | The developer building it, QA | Exactly what to build for Balsam Daily articles, video and clicks, and how to test it | Per release |

## How they fit together

- The **tracking plan** is the centre. It lists every variable with the business question behind it, and says where it comes from in the data layer and where it lands in each tool.
- The **data layer specification** is the contract with engineering. It's written only in terms of the data layer: no eVars, no GA4 dimensions. Developers shouldn't need to know Adobe or Google to build it correctly.
- The **implementation specs** are what a developer gets in a ticket. Each one covers one area of the site, says which data layer objects and events to build, gives exact example payloads, and ends with acceptance criteria and QA cases.
- **Tag management** (Adobe Tags or GTM) turns the data layer into tool calls. That mapping lives in the tracking plan, not in the developer specs.

A change usually touches them in that order: the tracking plan records the new variable, the data layer spec gains a field, an implementation spec asks a team to build it, and QA tests against that spec.

## Conventions used in all four

- **Data layer keys** are camelCase, grouped by object (`page.type`, `product.sku`). **GA4 events and parameters** are snake_case, using Google's recommended names first. **Adobe Client Data Layer events** are lowercase words, object then action (`cart add`).
- **Every value sent to analytics is in English**, whatever language the page is in. Only the address is in the page's language. [Measuring a multilingual site](/practice/multilingual-sites/) explains why.
- **No personal data** in any field. The contact form records that it was used and the topic picked, never what was typed.
- **Statuses** in the tracking plan: *live* (collected and verified), *proposed* (designed, not built), *deprecated* (still collected, don't build new reports on it).

## Using them as templates

Each spec opens with a short header (version, status, owner, audience) and closes with a change history. Keep both when you copy them; they're what make a document trustworthy a year later. The tables are deliberately plain so they paste cleanly into Confluence, SharePoint or a spreadsheet.

These specs describe fictional sites built for testing. The structure is what I'd use on a real project; the content is this site's.
