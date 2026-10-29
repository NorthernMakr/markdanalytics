---
title: Comment fonctionne la couche de données de ce site
description: Un objet de page, deux couches de données. Un tour du dataLayer et de l’adobeDataLayer derrière chaque page du site, et des raisons de ce choix.
pubDate: 2026-10-29
updatedDate: 2026-10-29
category: Conception de couche de données
tags: [dataLayer, ACDL, GA4, GTM, Adobe Tags]
platform: Both
---

Chaque page de ce site se décrit une seule fois, et cette description est transmise aux outils de Google comme à ceux d’Adobe. Ce billet explique la mise en place, pour que les pages de test aient du sens.

## Un objet de page, construit à la publication

Au moment de la construction du site, chaque page reçoit un petit objet qui la décrit :

```json
{
  "page": {
    "name": "blog:how-this-sites-data-layer-works",
    "type": "article",
    "section": "blog",
    "siteName": "Tag & Layer",
    "path": "/fr/blogue/comment-fonctionne-la-couche-de-donnees/",
    "language": "fr-CA",
    "environment": "production"
  },
  "content": {
    "title": "How this site's data layer works",
    "category": "Data layer design",
    "platform": "Both",
    "publishDate": "2026-10-29",
    "wordCount": 560
  },
  "user": { "loginStatus": "guest", "browserLanguage": "en-CA", "languageMatch": false }
}
```

Comme il est généré à partir de l’en-tête du billet, ajouter un billet n’oblige jamais à toucher au code d’analytique.

## Deux langues, deux variables

Le site existe en anglais et en français, et l’objet de page consigne deux choses distinctes :

- `page.language` est la langue de la page (`en-CA` ou `fr-CA`), fixée à la construction.
- `user.browserLanguage` est la langue préférée du navigateur du visiteur, lue dans `navigator.languages` au chargement. `user.languageMatch` indique si les deux concordent.

Un visiteur francophone qui lit la page anglaise apparaît avec `languageMatch: false` : c’est l’auditoire visé par une invitation à changer de langue. Tout le reste reste en anglais dans les deux versions : noms de page, titres de contenu, noms de produits et de listes, titres de vidéo, texte des liens. Un analyste qui travaille dans une seule langue comprend donc tout ce qu’il voit, et une page forme une seule ligne dans les rapports. Seule l’adresse est dans la langue de la page (`/fr/blogue/…`), comme l’URL de page d’Adobe côtoie un `pageName` anglais. GA4 n’a pas de `pageName` : la balise Google envoie donc le nom de page comme `page_title`, que GA4 lirait autrement dans l’onglet (en français) du navigateur. Le sélecteur EN | FR en haut de chaque page envoie `language_switch` / `language switched` quand quelqu’un change de langue.

## Envoyé dans les deux couches, avant tout gestionnaire de balises

Dans le `<head>`, avant Adobe Tags ou GTM, le même objet est envoyé deux fois :

- `dataLayer.push({ event: "page_data_ready", ...page })` pour GTM
- `adobeDataLayer.push({ event: "page loaded", ...page })` pour l’Adobe Client Data Layer

L’ordre compte. Quand l’un ou l’autre gestionnaire de balises démarre, les données l’attendent déjà : il n’y a donc pas de course entre le déclenchement de la balise et l’arrivée des données.

## Le commerce et les médias suivent les conventions de chaque plateforme

La boutique démo envoie les événements de commerce recommandés par GA4 (`view_item_list`, `view_item`, `add_to_cart`, `begin_checkout`, `purchase`, etc.), en vidant d’abord l’objet `ecommerce` précédent, comme le recommande Google. Côté Adobe, des événements équivalents (`product viewed`, `cart add`, `purchase`) portent un tableau `productListItems` de style XDM.

Le lecteur vidéo du site média démo envoie `video_start`, `video_progress` (10, 25, 50, 75 et 90 %) et `video_complete` dans `dataLayer`, et `media start`, `media milestone` et `media complete` dans `adobeDataLayer`.

## Le voir en direct

Chaque page a un bouton **Journal** dans le coin inférieur droit. Il reflète les deux tableaux à mesure qu’ils se remplissent : vous voyez exactement ce que verrait un gestionnaire de balises, sans extension de navigateur.

## À essayer

- Associez `page.type` et `page.section` à des eVars ou à des dimensions personnalisées, puis comparez les rapports.
- Créez un déclencheur GTM sur `add_to_cart` et une règle Adobe sur `cart add`, et vérifiez que les deux se déclenchent une seule fois par clic.
- Rechargez la page de confirmation de commande et vérifiez si votre balise d’achat se déclenche de nouveau (elle ne devrait pas : la page envoie `purchase` une seule fois par numéro de commande).
