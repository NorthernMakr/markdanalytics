---
title: Implementation artifacts
description: "The documents that turn a business question into working tags: requirements, the solution design reference (SDR), versions for developers and business users, specifications, and the data layer."
pubDate: 2026-11-02
category: Implementation artifacts
tags: [requirements, SDR, specifications, data layer, documentation]
platform: Both
---

**Good analytics starts as a document, not a tag.** This section shows the documents an implementation runs on, filled in for this site's demo store and news site, so each one can be checked against what the pages actually send.

## The chain

Each document feeds the next. A change usually travels down the chain in this order.

| Step | Document | Who it's for | What it answers |
|---|---|---|---|
| 1 | Business requirements | Stakeholders, analysts | What do we need to know, and what decision will it inform? |
| 2 | Solution design reference (SDR) | Analysts, the analytics lead | Which variables answer each requirement, and how are they configured in Adobe (and GA4)? |
| 3 | SDR for developers | Developers | What must the page expose, and why, in brief? |
| 3 | SDR for business users | Report users in Adobe or GA4 | What does each variable mean, which metrics go with it, and why is it an eVar or a prop? |
| 4 | Specification | The developer building it, QA | Exactly what to build on one page: a numbered wireframe, every tracked element, its link name and payload |
| 5 | QA document | QA, the analytics lead | Has each line of the specification been checked, when, and how? (In [Data quality](/data-quality/).) |

The SDR comes in two forms: a web page for reading and an Excel workbook for working in, since that's where most teams maintain theirs.

## Start here

Read them in order: [business requirements](/implementation/business-requirements/) → [SDR](/implementation/sdr/) ([Excel](/downloads/markdanalytics-sdr-en.xlsx)) → [for developers](/implementation/sdr-developers/) and [for business users](/implementation/sdr-business-users/) → [product page specification](/implementation/product-page-specification/). The requirements, SDR and both readable versions are generated from one data file, so they always agree.
