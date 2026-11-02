---
title: Data quality monitoring
description: "How to keep analytics data trustworthy after launch: why QA matters, QA documents that mirror the specification, automated checks, and a crawler that tests every clickable element."
pubDate: 2026-11-02
category: Data quality monitoring
tags: [QA, data quality, testing, monitoring]
platform: Both
---

**An implementation is only as good as its last check.** Sites change every week; tags break quietly. This section is about catching that before a report does.

Three ideas run through it:

- **QA documents mirror the specification.** Each table in a spec gets columns saying whether that line was checked, when, by whom and how. Important sections are re-checked every quarter, and the date is what tells you whether to trust a number.
- **Automate what can be automated, and list it.** Automated checks belong in the QA document next to the manual ones, so it's clear what's covered and by what.
- **Test from the outside, like a visitor.** A crawler that clicks every clickable element and records the data layer pushes and tag requests finds what a test plan forgot.

This site already runs automated checks on every change: page conventions at build time, plus tests for both languages, purchase payloads and Adobe variables. Being written now: why QA and data quality matter, sample QA documents for the demo store, and the design for a tag-checking crawler you'll be able to download and run on your own site.
