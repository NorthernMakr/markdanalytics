"""Builds gtm/markdanalytics-ga4-container.json, a GTM container import file.

Import it in GTM: Admin > Import Container > choose this file >
workspace "Existing" (Default Workspace) > option "Merge" + "Rename conflicting".

Run: python3 gtm/build-container.py
"""
import json, datetime, pathlib

MEASUREMENT_ID = "G-5D6JRL0L61"
GTM_PUBLIC_ID = "GTM-NM7SRRNT"
ALL_PAGES = "2147479553"       # built-in "All Pages" trigger
INITIALIZATION = "2147479573"  # built-in "Initialization - All Pages" trigger

ids = iter(range(1, 1000))
variables, triggers, tags = [], [], []


def tmpl(key, value): return {"type": "TEMPLATE", "key": key, "value": value}


def params_table(key, pairs):
    return {"type": "LIST", "key": key, "list": [
        {"type": "MAP", "map": [tmpl("parameter", k), tmpl("parameterValue", v)]} for k, v in pairs
    ]}


def dlv(path, name=None):
    name = name or f"DLV - {path}"
    variables.append({
        "accountId": "0", "containerId": "0", "variableId": str(next(ids)),
        "name": name, "type": "v",
        "parameter": [
            {"type": "INTEGER", "key": "dataLayerVersion", "value": "2"},
            {"type": "BOOLEAN", "key": "setDefaultValue", "value": "false"},
            tmpl("name", path),
        ],
    })
    return "{{" + name + "}}"


def const(name, value):
    variables.append({
        "accountId": "0", "containerId": "0", "variableId": str(next(ids)),
        "name": name, "type": "c", "parameter": [tmpl("value", value)],
    })
    return "{{" + name + "}}"


def event_trigger(name, regex):
    tid = str(next(ids))
    triggers.append({
        "accountId": "0", "containerId": "0", "triggerId": tid,
        "name": name, "type": "CUSTOM_EVENT",
        "customEventFilter": [{
            "type": "MATCH_REGEX",
            "parameter": [tmpl("arg0", "{{_event}}"), tmpl("arg1", regex)],
        }],
    })
    return tid


def ga4_event(name, trigger_id, params=(), ecommerce=False):
    p = [
        tmpl("eventName", "{{Event}}"),
        tmpl("measurementIdOverride", MID),
        {"type": "BOOLEAN", "key": "sendEcommerceData", "value": "true" if ecommerce else "false"},
    ]
    if ecommerce:
        p.append(tmpl("getEcommerceDataFrom", "dataLayer"))
    if params:
        p.append(params_table("eventSettingsTable", params))
    tags.append({
        "accountId": "0", "containerId": "0", "tagId": str(next(ids)),
        "name": name, "type": "gaawe", "parameter": p,
        "firingTriggerId": [trigger_id], "tagFiringOption": "ONCE_PER_EVENT",
        "monitoringMetadata": {"type": "MAP"}, "consentSettings": {"consentStatus": "NOT_SET"},
    })


# --- Variables -----------------------------------------------------------
MID = const("GA4 - Measurement ID", MEASUREMENT_ID)
page_name = dlv("page.name")
page_type = dlv("page.type")
page_section = dlv("page.section")
site_name = dlv("page.siteName")
environment = dlv("page.environment")
login = dlv("user.loginStatus")
content_category = dlv("content.category")
content_section = dlv("content.section")
content_author = dlv("content.author")
content_publish = dlv("content.publishDate")

# --- Google tag (GA4), fires first on every page ------------------------------
tags.append({
    "accountId": "0", "containerId": "0", "tagId": str(next(ids)),
    "name": "GA4 - Google tag", "type": "googtag",
    "parameter": [
        tmpl("tagId", MID),
        # Shared parameters: sent with every GA4 event from this container
        params_table("configSettingsTable", [
            ("page_name", page_name),
            ("page_type", page_type),
            ("site_section", page_section),
            ("site_name", site_name),
            ("site_environment", environment),
            ("login_status", login),
            ("content_category", content_category),
            ("content_section", content_section),
            ("content_author", content_author),
            ("content_publish_date", content_publish),
        ]),
    ],
    "firingTriggerId": [INITIALIZATION], "tagFiringOption": "ONCE_PER_EVENT",
    "monitoringMetadata": {"type": "MAP"}, "consentSettings": {"consentStatus": "NOT_SET"},
})

# --- Ecommerce: one tag, event name passed through ------------------------------
ecom_events = [
    "view_item_list", "select_item", "view_item", "add_to_cart", "remove_from_cart",
    "add_to_wishlist", "view_cart", "begin_checkout", "add_shipping_info",
    "add_payment_info", "purchase", "view_promotion", "select_promotion",
]
ecom_trigger = event_trigger("CE - GA4 ecommerce events", "^(" + "|".join(ecom_events) + ")$")
ga4_event("GA4 - Event - Ecommerce", ecom_trigger,
          params=[("cart_source", dlv("cart_source"))], ecommerce=True)

# --- Video (same names GA4 uses for YouTube) ----------------------------------------
video_trigger = event_trigger("CE - Video events", "^video_(start|progress|complete|pause|seek)$")
ga4_event("GA4 - Event - Video", video_trigger, params=[
    ("video_title", dlv("video_title")),
    ("video_url", dlv("video_url")),
    ("video_provider", dlv("video_provider")),
    ("video_percent", dlv("video_percent")),
    ("video_current_time", dlv("video_current_time")),
    ("video_duration", dlv("video_duration")),
])

# --- Scroll depth on article bodies ---------------------------------------------------
scroll_trigger = event_trigger("CE - scroll_depth", "^scroll_depth$")
ga4_event("GA4 - Event - Scroll depth", scroll_trigger, params=[
    ("percent_scrolled", dlv("percent_scrolled")),
])

# --- Teaser / internal link clicks on the media site ---------------------------------------
click_trigger = event_trigger("CE - content_click", "^content_click$")
ga4_event("GA4 - Event - Content click", click_trigger, params=[
    ("link_module", dlv("link_module")),
    ("link_position", dlv("link_position")),
    ("link_text", dlv("link_text")),
    ("link_url", dlv("link_url")),
])

# --- Catalog filter -------------------------------------------------------------------
filter_trigger = event_trigger("CE - filter_applied", "^filter_applied$")
ga4_event("GA4 - Event - Filter applied", filter_trigger, params=[
    ("filter_type", dlv("filter_type")),
    ("filter_value", dlv("filter_value")),
])

container = {
    "exportFormatVersion": 2,
    "exportTime": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    "containerVersion": {
        "path": "accounts/0/containers/0/versions/0",
        "accountId": "0", "containerId": "0", "containerVersionId": "0",
        "container": {
            "path": "accounts/0/containers/0", "accountId": "0", "containerId": "0",
            "name": "markdanalytics.ca", "publicId": GTM_PUBLIC_ID, "usageContext": ["WEB"],
        },
        "tag": tags,
        "trigger": triggers,
        "variable": variables,
        "builtInVariable": [
            {"accountId": "0", "containerId": "0", "type": "PAGE_URL", "name": "Page URL"},
            {"accountId": "0", "containerId": "0", "type": "PAGE_PATH", "name": "Page Path"},
            {"accountId": "0", "containerId": "0", "type": "EVENT", "name": "Event"},
        ],
    },
}

out = pathlib.Path(__file__).with_name("markdanalytics-ga4-container.json")
out.write_text(json.dumps(container, indent=2))
print(f"wrote {out}: {len(tags)} tags, {len(triggers)} triggers, {len(variables)} variables")
