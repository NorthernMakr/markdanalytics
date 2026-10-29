/*
 * Adobe Web SDK bridge for the analytics lab.
 *
 * Turns this site's adobeDataLayer events into Web SDK sendEvent calls with an
 * XDM payload, the way an Adobe Tags rule would in a real implementation.
 * Every payload is also copied into window.labEdgeLog (shown in the Event log
 * under "Web SDK") just before the SDK sends it.
 *
 * Modes (window.labWebSdkConfig.mode, set from PUBLIC_WEBSDK_MODE):
 *   mock   - the real SDK runs and sends to /ee/* on this site, a stand-in for
 *            Adobe's Edge Network (see src/worker.ts). Requests appear in
 *            DevTools > Network. Nothing goes to Adobe.
 *   cancel - the SDK builds each request, logs it, then cancels it
 *            (onBeforeEventSend returns false). No network calls at all.
 *   live   - real datastream and org IDs; data goes to Adobe.
 *
 * XDM mapping used here (commerce events map to Adobe Analytics automatically):
 *   page loaded       -> web.webpagedetails.pageViews
 *   product viewed    -> commerce.productViews       (prodView)
 *   cart add          -> commerce.productListAdds    (scAdd)
 *   cart remove       -> commerce.productListRemovals (scRemove)
 *   cart viewed       -> commerce.productListViews   (scView)
 *   checkout started  -> commerce.checkouts          (scCheckout)
 *   purchase          -> commerce.purchases + commerce.order (purchase)
 *   wishlist add      -> commerce.saveForLaters
 *   everything else   -> web.webinteraction.linkClicks, named after the event
 */
(function () {
  var cfg = window.labWebSdkConfig;
  if (!cfg || cfg.mode === 'off') return;

  window.labEdgeLog = window.labEdgeLog || [];

  // --- Adobe's base code: queues calls until alloy.min.js has loaded -------
  !function(n,o){o.forEach(function(o){n[o]||((n.__alloyNS=n.__alloyNS||[]).push(o),n[o]=function(){var u=arguments;return new Promise(function(i,l){n.setTimeout(function(){n[o].q.push([i,l,u])})})},n[o].q=[])})}(window,["alloy"]);

  var clone = function (o) { try { return JSON.parse(JSON.stringify(o)); } catch (e) { return o; } };

  var settings = {
    datastreamId: cfg.datastreamId,
    orgId: cfg.orgId,
    defaultConsent: 'in',
    clickCollectionEnabled: false, // keep the log to the events this site sends
    thirdPartyCookiesEnabled: false,
    onBeforeEventSend: function (content) {
      var willSend = cfg.mode !== 'cancel';
      window.labEdgeLog.push({
        event: ((content.xdm && content.xdm.eventType) || '(event)') +
          (content.xdm && content.xdm.web && content.xdm.web.webInteraction ? ': ' + content.xdm.web.webInteraction.name : ''),
        mode: cfg.mode,
        sent: willSend ? (cfg.mode === 'live' ? 'Adobe Edge' : 'mock edge') : 'cancelled',
        xdm: clone(content.xdm),
        data: clone(content.data),
      });
      if (!willSend) return false;
    },
  };
  if (cfg.mode !== 'live') settings.edgeDomain = location.hostname; // the SDK always calls https://<edgeDomain>/ee/...
  if (cfg.mode === 'live' && cfg.edgeDomain) settings.edgeDomain = cfg.edgeDomain;
  window.alloy('configure', settings).catch(function (err) {
    window.labEdgeLog.push({ event: 'error: configure', error: String(err && err.message || err) });
  });

  // --- Mapping -----------------------------------------------------------------
  var page = function () { return (window.labPage && window.labPage.page) || {}; };
  var webPage = function () {
    var p = page();
    return { webPageDetails: { name: p.name, URL: location.href, siteSection: p.section } };
  };
  var items = function (e) { return e.productListItems ? clone(e.productListItems) : undefined; };

  var commerceTypes = {
    'product viewed': 'productViews',
    'cart add': 'productListAdds',
    'cart remove': 'productListRemovals',
    'cart viewed': 'productListViews',
    'checkout started': 'checkouts',
    'purchase': 'purchases',
    'wishlist add': 'saveForLaters',
  };

  function toXdm(e) {
    var name = e.event;
    var xdm, data = { lab: clone(e) };
    delete data.lab.event;

    if (name === 'page loaded') {
      var wp = webPage();
      wp.webPageDetails.pageViews = { value: 1 };
      xdm = { eventType: 'web.webpagedetails.pageViews', web: wp };
      // Example of setting Analytics variables directly (no Adobe-side mapping needed)
      data.__adobe = { analytics: { prop1: page().type, eVar1: page().type, prop2: page().section } };
      return { xdm: xdm, data: data };
    }

    if (commerceTypes[name]) {
      var key = commerceTypes[name];
      var commerce = {};
      commerce[key] = { value: 1 };
      if (name === 'purchase' && e.commerce) {
        commerce.order = clone(e.commerce.order);
        if (e.commerce.shipping) commerce.shipping = clone(e.commerce.shipping);
      }
      xdm = { eventType: 'commerce.' + key, web: webPage(), commerce: commerce };
      if (items(e)) xdm.productListItems = items(e);
      return { xdm: xdm, data: data };
    }

    // Everything else is a non-page-view interaction (Analytics link call)
    xdm = {
      eventType: 'web.webinteraction.linkClicks',
      web: Object.assign(webPage(), {
        webInteraction: { name: name, type: 'other', linkClicks: { value: 1 } },
      }),
    };
    if (items(e)) xdm.productListItems = items(e);
    return { xdm: xdm, data: data };
  }

  window.labWebSdk = function (e) {
    if (!e || !e.event) return;
    var payload = toXdm(e);
    window.alloy('sendEvent', payload).catch(function (err) {
      window.labEdgeLog.push({ event: 'error: ' + e.event, error: String(err && err.message || err) });
    });
  };

  // Load the SDK itself (self-hosted copy of Adobe's alloy.min.js)
  var s = document.createElement('script');
  s.src = cfg.src;
  s.async = true;
  document.head.appendChild(s);
})();
