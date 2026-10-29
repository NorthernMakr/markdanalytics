---
title: Tester l’Adobe Web SDK sans compte Adobe
description: Comment ce site fait tourner le vrai Web SDK d’Adobe contre une doublure de l’Edge Network, pour construire, envoyer et inspecter chaque requête XDM sans qu’aucune donnée n’atteigne Adobe.
pubDate: 2026-10-29
category: Web SDK
tags: [Web SDK, alloy.js, XDM, Edge Network, Adobe Analytics]
platform: Adobe
---

Pour s’exercer à une implémentation Web SDK, il faut normalement une organisation Adobe, un flux de données (datastream) et un schéma avant d’envoyer le moindre événement. Ce site se passe de tout cela. Il exécute la vraie bibliothèque Web SDK d’Adobe, mais la pointe vers une petite doublure de l’Edge Network d’Adobe hébergée sur ce domaine. Le SDK se comporte exactement comme en production : il construit les données XDM, gère l’identité, dépose ses témoins et fait de vraies requêtes réseau. Ces requêtes ne quittent simplement jamais markdanalytics.ca.

## Les pièces

| Pièce | Emplacement | Rôle |
|---|---|---|
| Web SDK (`alloy.js` 2.36.1) | `/vendor/alloy-2.36.1.min.js` | La bibliothèque d’Adobe, hébergée ici, non modifiée |
| Script passerelle | `/lab/websdk-bridge.js` | Transforme les événements `adobeDataLayer` en appels `sendEvent` avec XDM, le travail que ferait normalement une règle Adobe Tags |
| Edge Network simulé | `markdanalytics.ca/ee/*` (un Cloudflare Worker) | Répond aux requêtes du SDK comme le ferait l’Edge d’Adobe |
| Journal, onglet Web SDK | En bas à droite de chaque page | Affiche chaque requête construite par le SDK et sa destination |

## Le parcours d’une requête

1. Une page envoie un événement dans l’Adobe Client Data Layer, par exemple `adobeDataLayer.push({ event: "cart add", productListItems: [...] })`.
2. La passerelle le convertit en XDM et appelle `alloy("sendEvent", { xdm, data })`.
3. Le SDK enrichit les données de ses champs automatiques (`device`, `environment`, `placeContext`, `timestamp`, `implementationDetails`) et exécute `onBeforeEventSend`, qui copie le contenu final dans le journal.
4. Le SDK fait un POST vers `https://markdanalytics.ca/ee/v1/interact`, parce que `edgeDomain` désigne ce site plutôt que le domaine par défaut d’Adobe, `edge.adobedc.net`.
5. Le Worker répond par une réponse Edge minimale : un ECID dans un handle `identity:result`, et un handle `state:store` pour que le SDK écrive son témoin `kndctr_…_identity`, comme il le ferait avec Adobe. Il renvoie aussi ce qu’il a reçu.

Du point de vue du SDK, il parle à l’Edge Network.

## La configuration

```js
alloy("configure", {
  datastreamId: "lab-mock-datastream-0000",   // valeur fictive, jamais vérifiée
  orgId: "MARKDLAB000000000000000@AdobeOrg",  // valeur fictive
  edgeDomain: location.hostname,              // envoyer à ce site, pas à Adobe
  defaultConsent: "in",
  clickCollectionEnabled: false,              // seulement les événements envoyés par le site
  onBeforeEventSend: (content) => {
    // copier content.xdm et content.data dans le journal
  },
});
```

Les identifiants sont fictifs parce que rien ne les valide. L’Edge simulé accepte n’importe quel flux de données.

## Correspondance XDM

Les événements de commerce utilisent les champs XDM `commerce` standards, qu’Adobe Analytics associe automatiquement quand les données atteignent vraiment Adobe.

| Événement adobeDataLayer | `eventType` XDM | Équivalent Analytics |
|---|---|---|
| `page loaded` | `web.webpagedetails.pageViews` | page vue |
| `product viewed` | `commerce.productViews` | `prodView` |
| `cart add` | `commerce.productListAdds` | `scAdd` |
| `cart remove` | `commerce.productListRemovals` | `scRemove` |
| `cart viewed` | `commerce.productListViews` | `scView` |
| `checkout started` | `commerce.checkouts` | `scCheckout` |
| `purchase` | `commerce.purchases` + `commerce.order` | `purchase` avec `purchaseID` |
| `wishlist add` | `commerce.saveForLaters` | (événement personnalisé) |
| tout le reste | `web.webinteraction.linkClicks` | appel de lien nommé d’après l’événement |

Les produits voyagent dans `productListItems` (`SKU`, `name`, `quantity`, `priceTotal`, `productCategories`). Les pages vues fixent aussi quelques variables Analytics directement dans `data.__adobe.analytics` (`prop1` et `eVar1` pour le type de page, `prop2` pour la section, `prop3` et `eVar2` pour la langue de la page, `prop4` et `eVar3` pour la langue du navigateur, `prop5` pour leur concordance), pour illustrer cette voie.

## Le voir fonctionner

- **Journal → onglet Web SDK.** Chaque entrée est le contenu final envoyé par le SDK, après son propre enrichissement, étiqueté avec sa destination.
- **Outils de développement → Réseau**, filtré sur `interact`. Ce sont les vraies requêtes POST. Le corps de la requête est le contenu du SDK, et la réponse est celle de l’Edge simulé, y compris un handle `lab:received` qui renvoie ce qui est arrivé.
- **Adobe Experience Platform Debugger.** L’extension de navigateur voit les appels de la même façon.
- **Témoins.** Après la première requête, cherchez `kndctr_MARKDLAB000000000000000_AdobeOrg_identity` sous Application → Cookies. Sa valeur commence par `lab-ecid-`, ce qui signale un faux ECID.

## Modes

Le comportement est réglé par la variable de construction `PUBLIC_WEBSDK_MODE` :

| Mode | Comportement |
|---|---|
| `mock` (par défaut) | Vrai SDK, requêtes traitées par la doublure Edge du site |
| `cancel` | Le vrai SDK construit et consigne chaque requête, puis `onBeforeEventSend` renvoie `false` : rien n’est envoyé |
| `live` | Vrais identifiants de flux et d’organisation; les données vont chez Adobe |
| `off` | Web SDK non chargé |

## Ce que ça ne peut pas montrer

Un Edge simulé valide le côté client d’une implémentation : la forme des données, le moment des événements, le comportement de l’identité et la correspondance entre la couche de données et XDM. Tout ce qui se passe du côté d’Adobe reste hors de portée :

- **Aucun traitement du flux de données.** Les correspondances Data Prep, les remplacements de flux et la validation du schéma ne s’exécutent pas : un champ XDM absent de votre schéma ne sera pas signalé.
- **Aucun rapport.** Rien n’atteint Analytics, Customer Journey Analytics ou Platform.
- **Aucune personnalisation.** Les décisions de Target et de Journey Optimizer exigent le vrai Edge.
- **Fausse identité.** L’ECID est aléatoire et n’a de sens que pour ce site.
- **La vidéo est simplifiée.** Les événements média partent comme appels de lien, pas par la collecte Streaming Media d’Adobe.

Pour tout cela, la même passerelle fonctionne telle quelle en mode `live`, dès qu’un vrai flux de données existe.

## Pour aller plus loin

- [Installer le Web SDK avec la bibliothèque JavaScript](https://experienceleague.adobe.com/fr/docs/experience-platform/web-sdk/install/library)
- [Configuration de `edgeDomain`](https://experienceleague.adobe.com/fr/docs/experience-platform/web-sdk/commands/configure/edgedomain)
- [Configuration de `onBeforeEventSend`](https://experienceleague.adobe.com/fr/docs/experience-platform/web-sdk/commands/configure/onbeforeeventsend)
