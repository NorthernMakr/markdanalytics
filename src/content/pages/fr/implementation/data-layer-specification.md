---
title: "Spécification type : couche de données"
description: "La spécification de la couche de données de markdanalytics.ca et de ses sites démo : chaque objet, clé, type et valeur permise, avec l’ordre de chargement, les règles de nommage et la façon dont la spécification est appliquée."
pubDate: 2026-11-02
category: Livrables de mise en œuvre
tags: [spécifications, couche de données, dataLayer, ACDL, développeurs]
platform: Both
order: 6
---

| Propriété | Valeur |
|---|---|
| **Document** | Spécification de la couche de données, markdanalytics.ca |
| **Version** | 1.3, 2 novembre 2026 |
| **Statut** | En production |
| **Responsable** | Mark Dykeman, responsable de l’analytique |
| **Public** | Développeurs qui construisent les pages; analystes qui configurent les balises |
| **Voir aussi** | [SDR](/fr/mise-en-oeuvre/sdr/), [SDR pour les développeurs](/fr/mise-en-oeuvre/sdr-developpeurs/), [spécification de la fiche produit](/fr/mise-en-oeuvre/specification-fiche-produit/) |

## 1. Objet

Ce document définit ce que chaque page de markdanalytics.ca, de la boutique démo Taiga Supply Co. et du site de nouvelles démo Balsam Daily doit exposer à l’analytique. Il est rédigé uniquement en fonction de la couche de données. La façon dont chaque valeur atteint Adobe Analytics ou GA4 se trouve dans la [SDR](/fr/mise-en-oeuvre/sdr/) : un changement d’outil d’analytique ne change donc pas ce document.

## 2. Les deux tableaux

| Tableau | Lu par | Forme |
|---|---|---|
| `window.dataLayer` | Google Tag Manager | Objets avec une clé `event`; noms d’événements et paramètres recommandés par GA4 |
| `window.adobeDataLayer` | Adobe Client Data Layer, Adobe Tags, la passerelle du Web SDK | Objets avec une clé `event`; noms d’événements à la façon d’Adobe et objets de forme XDM |

Les deux tableaux sont créés dans le `<head>` de la page, avant tout gestionnaire de balises. Les deux reçoivent le même objet de page. Les événements d’interaction sont envoyés dans les deux, chacun selon les conventions de sa plateforme.

## 3. Ordre de chargement

1. Créer `dataLayer` et `adobeDataLayer` s’ils n’existent pas.
2. Envoyer l’objet de page : `page_data_ready` dans `dataLayer`, `page loaded` dans `adobeDataLayer`.
3. Charger Adobe Tags (ou la passerelle du Web SDK), puis GTM.

L’objet de page doit être en place avant l’étape 3, pour qu’aucune balise ne se déclenche avant que ses données existent. Les pages ne doivent pas renvoyer l’objet de page plus tard.

## 4. Règles pour chaque champ

- **Noms :** clés en camelCase, regroupées par objet (`page.*`, `user.*`, `content.*`, `product.*`, `checkout.*`). Les paramètres d’événement GA4 utilisent les noms snake_case de Google.
- **Types :** les nombres sont des nombres (`129`, pas `"129"`); les dates suivent ISO 8601 (`2026-10-29`); les booléens valent `true` ou `false`.
- **Langue :** chaque valeur est en anglais, quelle que soit la langue de la page, sauf `page.path`, qui est la vraie adresse. Ne jamais utiliser un texte affiché traduit comme valeur.
- **Casse :** les valeurs tirées de listes fixes sont en minuscules (`product detail`, `shop`).
- **Aucune donnée personnelle :** ni nom, ni adresse courriel, ni numéro de téléphone, ni adresse postale, ni texte libre tapé par un visiteur. Les clés nommées `email`, `phone`, `address`, `message`, `firstName`, `lastName`, `fullName` ou `password` sont rejetées (section 9).
- **Absente plutôt que vide :** omettre une clé qui ne s’applique pas. Ne pas envoyer `""` ni `null` comme valeur de remplissage.

## 5. Objet de page (chaque page)

Envoyé une fois par page, avant le chargement des gestionnaires de balises.

| Clé | Type | Oblig. | Valeurs permises / format | Exemple | Source |
|---|---|---|---|---|---|
| `page.name` | chaîne | Oui | Minuscules, séparées par des deux-points, commence par la section | `shop:product:tidepool-daypack` | Gabarit + slug |
| `page.type` | chaîne | Oui | `home`, `article list`, `article`, `section front`, `contact`, `error`, `product listing`, `product detail`, `cart`, `checkout`, `order confirmation` | `product detail` | Gabarit |
| `page.section` | chaîne | Oui | `home`, `basics`, `process`, `implementation`, `data-quality`, `case-studies`, `about`, `contact`, `error`, `shop`, `media`, `site` | `shop` | Gabarit |
| `page.siteName` | chaîne | Oui | Une valeur par site | `Taiga Supply Co. (demo)` | Configuration du site |
| `page.path` | chaîne | Oui | Le vrai chemin, dans la langue de la page | `/fr/boutique/produit/sac-de-jour-tidepool/` | URL |
| `page.language` | chaîne | Oui | `en-CA`, `fr-CA` | `fr-CA` | URL (`/fr/` = français) |
| `page.environment` | chaîne | Oui | `production`, `development` | `production` | Construction |
| `user.loginStatus` | chaîne | Oui | `guest` (aucune connexion sur ce site) | `guest` | Fixe |
| `user.browserLanguage` | chaîne | Oui | Telle que le navigateur la donne (BCP 47) | `en-US` | `navigator.languages[0]`, au chargement |
| `user.languageMatch` | booléen | Oui | La langue de la page et celle du navigateur partagent-elles la même langue principale? | `false` | Calculé au chargement |

`page.name` est la clé de rapport : les deux versions linguistiques d’une page envoient le même nom.

Exemple, fiche produit française :

```json
{
  "event": "page_data_ready",
  "page": { "name": "shop:product:tidepool-daypack", "type": "product detail", "section": "shop",
            "siteName": "Taiga Supply Co. (demo)", "path": "/fr/boutique/produit/sac-de-jour-tidepool/",
            "language": "fr-CA", "environment": "production" },
  "user": { "loginStatus": "guest", "browserLanguage": "en-US", "languageMatch": false },
  "product": { "sku": "TG-PK-101", "name": "Tidepool daypack", "category": "packs",
               "subcategory": "daypacks", "price": 129, "currency": "CAD" }
}
```

## 6. Objets propres aux types de pages

Ajoutés à l’objet de page sur les types de pages indiqués. Les valeurs sont en anglais dans les deux versions linguistiques.

### 6.1 `content` sur les pages des sections de contenu (`page.type` = `article`, `section front`)

| Clé | Type | Oblig. | Format | Exemple |
|---|---|---|---|---|
| `content.id` | chaîne | Oui | Slug anglais | `how-this-sites-data-layer-works` |
| `content.title` | chaîne | Oui | Titre anglais | `How this site's data layer works` |
| `content.category` | chaîne | Oui | Texte libre tiré de l’en-tête de la page | `Data layer design` |
| `content.tags` | tableau de chaînes | Non | Mots-clés anglais | `["dataLayer", "GA4"]` |
| `content.platform` | chaîne | Oui | `Adobe`, `Google`, `Both`, `Other` | `Both` |
| `content.publishDate` | chaîne | Oui | Date ISO | `2026-10-29` |
| `content.updatedDate` | chaîne | Non | Date ISO | `2026-10-29` |
| `content.author` | chaîne | Oui | Nom public de l’auteur | `Mark Dykeman` |
| `content.wordCount` | nombre | Oui | Mots dans cette version | `564` |

### 6.2 `content` sur les articles de nouvelles (`page.name` = `media:article:*`)

| Clé | Type | Oblig. | Format | Exemple |
|---|---|---|---|---|
| `content.id` | chaîne | Oui | Slug anglais | `ferry-schedule-shakeup` |
| `content.title` | chaîne | Oui | Titre anglais | `Island ferry schedule shakeup adds early sailings, drops late-night run` |
| `content.section` | chaîne | Oui | `Local`, `Transportation`, `Weather`, `Food`, `Sports` | `Transportation` |
| `content.author` | chaîne | Oui | Signature | `Dana Layer` |
| `content.publishDate` | chaîne | Oui | Date ISO | `2026-10-28` |
| `content.hasVideo` | booléen | Oui | | `true` |
| `content.videoId` | chaîne | Si vidéo | Identifiant de la vidéo | `vid-ferry-001` |
| `content.wordCount` | nombre | Oui | Nombre de mots en anglais | `128` |

### 6.3 `product` sur les fiches produits (`page.type` = `product detail`)

| Clé | Type | Oblig. | Format | Exemple |
|---|---|---|---|---|
| `product.sku` | chaîne | Oui | SKU | `TG-PK-101` |
| `product.name` | chaîne | Oui | Nom anglais du produit | `Tidepool daypack` |
| `product.category` | chaîne | Oui | `packs`, `apparel`, `camp` | `packs` |
| `product.subcategory` | chaîne | Oui | Minuscules | `daypacks` |
| `product.price` | nombre | Oui | Prix unitaire, deux décimales au plus | `129` |
| `product.currency` | chaîne | Oui | ISO 4217 | `CAD` |

### 6.4 `checkout` sur les pages de caisse et de confirmation

| Clé | Type | Oblig. | Valeurs |
|---|---|---|---|
| `checkout.step` | nombre | Oui | `1` livraison, `2` paiement, `3` confirmation |
| `checkout.stepName` | chaîne | Oui | `shipping`, `payment`, `confirmation` |

## 7. Formats d’article communs

Chaque événement de commerce utilise la même forme d’article : un produit est identique dans tous les événements.

**Article GA4** (dans `ecommerce.items[]`) :

| Clé | Type | Exemple | Notes |
|---|---|---|---|
| `item_id` | chaîne | `TG-PK-101` | SKU |
| `item_name` | chaîne | `Tidepool daypack` | En anglais |
| `item_brand` | chaîne | `Taiga` | |
| `item_category` | chaîne | `packs` | |
| `item_category2` | chaîne | `daypacks` | |
| `item_variant` | chaîne | `Buoy` | Couleur, en anglais |
| `price` | nombre | `129` | Prix unitaire |
| `quantity` | nombre | `1` | |
| `index` | nombre | `0` | Événements de liste seulement, à partir de zéro |
| `item_list_id`, `item_list_name` | chaîne | `catalog_packs`, `Catalog: Packs & bags` | Événements de liste seulement |

**Article Adobe** (dans `productListItems[]`) :

| Clé | Type | Exemple |
|---|---|---|
| `SKU` | chaîne | `TG-PK-101` |
| `name` | chaîne | `Tidepool daypack` |
| `quantity` | nombre | `1` |
| `priceTotal` | nombre | `129` (prix unitaire × quantité) |
| `currencyCode` | chaîne | `CAD` |
| `productCategories` | tableau | `[{ "categoryID": "packs" }, { "categoryID": "daypacks" }]` |
| `selectedOptions` | tableau | `[{ "attribute": "colour", "value": "Buoy" }]` |

## 8. Événements

La liste complète des événements permis. Les données, déclencheurs et moments d’envoi pour la fiche produit sont dans la [spécification de la fiche produit](/fr/mise-en-oeuvre/specification-fiche-produit/); les spécifications des autres pages suivent le même format.

| Domaine | `dataLayer` (GA4) | `adobeDataLayer` | Spécification |
|---|---|---|---|
| Page | `page_data_ready` | `page loaded` | Ce document |
| Listes de produits | `view_item_list`, `select_item` | `product list viewed`, `product clicked` | Boutique |
| Fiche produit | `view_item`, `add_to_cart`, `add_to_wishlist` | `product viewed`, `cart add`, `wishlist add` | [Fiche produit](/fr/mise-en-oeuvre/specification-fiche-produit/) |
| Panier | `view_cart`, `add_to_cart`, `remove_from_cart` | `cart viewed`, `cart add`, `cart remove` | Boutique |
| Caisse | `begin_checkout`, `add_shipping_info`, `add_payment_info`, `purchase` | `checkout started`, `checkout step`, `purchase` | Boutique |
| Promotions | `view_promotion`, `select_promotion` | `promotion viewed`, `promotion clicked` | Boutique |
| Filtre du catalogue | `filter_applied` | `search filtered` | Boutique |
| Vidéo | `video_start`, `video_progress`, `video_pause`, `video_seek`, `video_complete` | `media start`, `media milestone`, `media pause`, `media seek`, `media complete` | Médias |
| Lecture | `scroll_depth` | `content scrolled` | Médias |
| Clics sur les accroches | `content_click` | `content clicked` | Médias |
| Formulaire de contact | `form_start`, `generate_lead`, `form_error` | `form started`, `form submitted`, `form error` | Page de contact |
| Langue | `language_switch` | `language switched` | Chaque page |

Avant chaque envoi dans `dataLayer` qui contient un objet `ecommerce`, envoyer `{ ecommerce: null }` pour vider le précédent, comme le [recommande Google](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce?client_type=gtm&hl=fr).

## 9. Comment cette spécification est appliquée

- **À la construction,** le `page.type`, le `page.section`, le `page.name` et le `page.language` de chaque page sont vérifiés par rapport aux listes permises de `src/config/analytics.ts`. Une page qui enfreint une règle fait échouer la construction.
- **Dans le navigateur, hors production,** chaque envoi est vérifié : un nom d’événement absent de la section 8, ou une clé interdite de la section 4, affiche un avertissement dans la console.
- **Sur tout le site,** un test charge chaque page dans les deux langues et vérifie que chaque page française envoie le même `page.name` et le même `content.title` que sa jumelle anglaise.

Pour ajouter une valeur ou un événement : l’ajouter d’abord à la liste permise, puis à ce document et à la SDR, puis l’utiliser.

## 10. Historique des modifications

| Version | Date | Modification |
|---|---|---|
| 1.3 | 2026-11-02 | Sections renommées (basics, process, implementation, data-quality, case-studies, about) |
| 1.2 | 2026-11-02 | `page.path` est la vraie adresse, dans la langue de la page; adresses françaises introduites |
| 1.1 | 2026-10-29 | Ajout de `page.language`, `user.browserLanguage`, `user.languageMatch` et de l’événement du sélecteur de langue |
| 1.0 | 2026-10-29 | Première version |
