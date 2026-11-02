---
title: Qu’est-ce qu’une couche de données, et pourquoi ce site en a deux
description: "Une explication en langage clair des couches de données : comment on les crée, les deux grands styles, ce qui distingue le dataLayer de Google de l’Adobe Client Data Layer, et pourquoi ce site utilise les deux, avec le JavaScript qui les construit."
pubDate: 2026-11-02
category: Conception de couche de données
tags: [dataLayer, ACDL, couche de données, GTM, Adobe Tags, JavaScript]
platform: Both
---

**Une couche de données (data layer) est un objet ou un tableau JavaScript, dans une page web, qui contient les faits sur la page et sur ce que le visiteur y fait.** Les balises d’analytique et de marketing la lisent au lieu de fouiller la page elle-même. C’est le contrat entre les gens qui construisent le site et ceux qui le mesurent.

Sans elle, une balise qui veut le prix d’un produit doit le trouver dans le HTML de la page : le troisième `<span>` dans `.price`, par exemple. À la prochaine refonte, ce span change de place, et les données se brisent sans bruit. Avec une couche de données, le site énonce le prix une seule fois, à un endroit connu, sous un nom connu, et les balises le lisent là.

## Comment on crée une couche de données

Un développeur la crée dans le `<head>` de la page, avant tout gestionnaire de balises. Dans sa forme la plus simple, c’est une ligne et un envoi :

```js
// Créer le tableau, ou réutiliser celui qui existe déjà
window.dataLayer = window.dataLayer || [];

// Décrire la page
window.dataLayer.push({
  event: 'page_data_ready',
  page: { name: 'shop:cart', type: 'cart', section: 'shop', language: 'fr-CA' }
});
```

La forme `window.dataLayer || []` compte : si un autre script a déjà créé le tableau et y a envoyé des données, elles sont conservées plutôt qu’effacées.

Les valeurs viennent de là où le site les connaît :

- **À la construction de la page :** le CMS ou le gabarit côté serveur inscrit le nom de la page, son type, les détails du produit, etc. Sur ce site, Astro écrit l’objet de chaque page dans le HTML au moment de la construction.
- **Pendant la visite :** le code de la page envoie des événements à mesure qu’ils surviennent, comme un produit ajouté au panier ou une vidéo qui démarre.
- **Dans le navigateur, au chargement :** quelques faits que seul le navigateur connaît, comme la langue préférée du visiteur.

## Deux styles : un objet statique ou une file d’événements

### Un objet statique

L’approche plus ancienne est un seul objet qui décrit la page, que les balises lisent au chargement. La version la plus connue est la norme `digitalData` du W3C, de 2013 ([Customer Experience Digital Data Layer 1.0](https://www.w3.org/community/custexpdata/2013/12/16/final-report-customer-experience-digital-data-layer-v1-0-ready)) :

```js
window.digitalData = {
  page: { pageInfo: { pageName: 'shop:cart' }, category: { primaryCategory: 'shop' } },
  cart: { price: { basePrice: 129, currency: 'CAD' } }
};
```

C’est simple, et ça fonctionne bien pour les faits sur la page. C’est malcommode pour tout ce qui se passe après le chargement : une balise qui lit `digitalData.cart` n’a aucun moyen de savoir qu’il vient de changer. C’est particulièrement pénible dans les applications d’une seule page, où la « page » change sans rechargement.

### Une file d’événements

L’approche qu’utilisent la plupart des sites aujourd’hui est un tableau dans lequel on fait des `push` à mesure que les choses arrivent. Le gestionnaire de balises surveille le tableau et réagit à chaque envoi, dans l’ordre :

```js
// Plus tard, quand le visiteur ajoute un article au panier
window.dataLayer.push({
  event: 'add_to_cart',
  ecommerce: {
    currency: 'CAD',
    value: 129,
    items: [{ item_id: 'TG-PK-101', item_name: 'Tidepool daypack', price: 129, quantity: 1 }]
  }
});
```

La clé `event` est ce qu’écoute un déclencheur du gestionnaire de balises (« quand `add_to_cart` arrive, l’envoyer à GA4 »). Le reste de l’objet, ce sont des données que les balises peuvent lire. Remarquez que le nom du produit reste en anglais, même sur une page française : l’analytique utilise une seule langue de rapport.

Le `dataLayer` de Google Tag Manager fonctionne ainsi ([le guide de Google sur la couche de données](https://developers.google.com/tag-manager/devguide?hl=fr)), tout comme l’Adobe Client Data Layer.

## Le dataLayer de Google et l’Adobe Client Data Layer

Les deux sont des files d’événements, et les deux commencent comme un simple tableau. Ils diffèrent par ce que le gestionnaire de balises en fait.

**Le `dataLayer` de Google** est lu par GTM. GTM tient son propre modèle de tout ce qui a été envoyé jusque-là : une variable comme `page.type` a donc encore une valeur quand un événement plus tardif se déclenche. GA4 a des noms et des formes recommandés pour les événements courants, comme `add_to_cart` avec un tableau `items`.

**L’Adobe Client Data Layer** (`adobeDataLayer`) est une bibliothèque libre d’Adobe, habituellement chargée par son extension Adobe Tags. Une fois chargée, elle prend le contrôle du tableau, traite tout ce qui y a déjà été envoyé et ajoute quelques outils ([documentation de l’ACDL](https://github.com/adobe/adobe-client-data-layer/wiki)) :

```js
window.adobeDataLayer = window.adobeDataLayer || [];

// L’envoi fonctionne exactement de la même façon
window.adobeDataLayer.push({
  event: 'cart add',
  productListItems: [{ SKU: 'TG-PK-101', name: 'Tidepool daypack', quantity: 1, priceTotal: 129 }]
});

// Une fois la bibliothèque chargée : lire l’état fusionné de tout ce qui a été envoyé
window.adobeDataLayer.getState('page.name');   // "shop:cart"

// Écouter un événement, y compris ceux envoyés avant que ce code s’exécute
window.adobeDataLayer.push(function (dl) {
  dl.addEventListener('cart add', function (event) {
    console.log('Ajouté :', event.productListItems[0].name);
  }, { scope: 'all' });
});
```

Ce dernier point règle un vrai problème de synchronisation : un écouteur ajouté tard voit quand même les événements survenus avant lui. Les conventions d’Adobe diffèrent aussi. Ses noms d’événements sont des mots (`cart add`), et ses formes suivent XDM, le modèle de données d’Adobe (`productListItems`), parce que c’est ce que le Web SDK transmet à Adobe.

## Ce que fait ce site

Chaque page de ce site se décrit une seule fois, et cet objet unique part dans les deux tableaux. Voici une version simplifiée du script présent dans le `<head>` de chaque page :

```js
// 1. Créer les deux couches de données
window.dataLayer = window.dataLayer || [];
window.adobeDataLayer = window.adobeDataLayer || [];

// 2. La description de la page, écrite à la construction
var pageData = {
  page: { name: 'shop:cart', type: 'cart', section: 'shop',
          siteName: 'Taiga Supply Co. (demo)', path: '/fr/boutique/panier/',
          language: 'fr-CA', environment: 'production' },
  user: { loginStatus: 'guest' }
};

// 3. Les faits que seul le navigateur connaît, ajoutés au chargement
pageData.user.browserLanguage = navigator.languages[0] || navigator.language;

// 4. De petites fonctions d’aide, pour que chaque envoi suive les règles de sa plateforme
window.lab = {
  ga4: function (evt) {
    // Google recommande de vider d’abord l’objet ecommerce précédent
    if (evt.ecommerce) window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push(evt);
  },
  adobe: function (evt) {
    window.adobeDataLayer.push(evt);
  }
};

// 5. Les mêmes données de page, annoncées aux deux
window.lab.ga4(Object.assign({ event: 'page_data_ready' }, pageData));
window.lab.adobe(Object.assign({ event: 'page loaded' }, pageData));

// 6. Seulement maintenant, les gestionnaires de balises se chargent : Adobe Tags, puis GTM
```

Ensuite, quand quelque chose se passe, la page avertit les deux plateformes, chacune dans ses propres termes :

```js
// Le visiteur ajoute un sac de jour Tidepool, couleur Bouée, au panier
window.lab.ga4({
  event: 'add_to_cart',
  ecommerce: { currency: 'CAD', value: 129,
    items: [{ item_id: 'TG-PK-101', item_name: 'Tidepool daypack', item_variant: 'Buoy', price: 129, quantity: 1 }] }
});
window.lab.adobe({
  event: 'cart add',
  productListItems: [{ SKU: 'TG-PK-101', name: 'Tidepool daypack', quantity: 1, priceTotal: 129,
    selectedOptions: [{ attribute: 'colour', value: 'Buoy' }] }]
});
```

Vous pouvez le voir en direct : chaque page a un bouton **Journal** dans le coin inférieur droit, qui montre les deux tableaux se remplir en temps réel. [Comment fonctionne la couche de données de ce site](/fr/blogue/comment-fonctionne-la-couche-de-donnees/) passe en revue chaque champ.

## Pourquoi deux couches de données?

Chaque gestionnaire de balises écoute son propre tableau par défaut : GTM écoute `dataLayer`, Adobe Tags écoute `adobeDataLayer`. Et chaque outil d’analytique attend ses propres formes : GA4 veut ses événements recommandés avec un tableau `items`, et le Web SDK d’Adobe veut du XDM. Envoyer les deux à partir d’un seul objet de page donne à chaque outil exactement ce qu’il attend, sans traduction dans le gestionnaire de balises.

**En réalité, deux ne sont pas nécessaires.** Bien des entreprises qui utilisent les deux outils gardent une seule couche de données neutre et la convertissent dans chaque gestionnaire de balises. Adobe offre même une [extension Google Data Layer](https://experienceleague.adobe.com/fr/docs/experience-platform/tags/extensions/client/google-data-layer/overview) pour qu’Adobe Tags lise directement le `dataLayer` de GTM :

```js
// Un seul tableau, une forme neutre
window.dataLayer.push({
  event: 'product_added',
  product: { sku: 'TG-PK-101', name: 'Tidepool daypack', price: 129, quantity: 1 }
});
// GTM convertit ceci en add_to_cart pour GA4; Adobe Tags convertit le même envoi en XDM.
```

C’est un compromis :

| | Deux couches de données (ce site) | Une seule, convertie deux fois |
|---|---|---|
| Où vit la conversion | Dans le code du site | Dans chaque gestionnaire de balises |
| Ce que les développeurs doivent connaître | Les conventions des deux plateformes | Un seul format neutre |
| Ajouter un troisième outil | Une autre série d’envois dans le code | Une autre conversion dans un gestionnaire |
| Débogage | Chaque tableau ressemble déjà à ce que reçoit son outil | Un seul endroit pour vérifier les données de départ |

Ce site en utilise deux exprès. C’est un banc d’essai : il montre côte à côte les conventions natives de chaque plateforme. Les deux tableaux viennent du même objet de page; ils ne peuvent donc pas se contredire sur les faits.

## Le principe

Peu importe l’installation : **une seule source de vérité pour les faits, puis la forme dont chaque outil a besoin.** Entendez-vous d’abord sur les noms, les types et les valeurs permises, consignez-les dans une spécification de couche de données, et envoyez les données avant que se charge toute balise qui en a besoin. Que la mise en forme pour chaque outil se fasse dans la page (deux tableaux) ou dans le gestionnaire de balises (un seul tableau) compte bien moins que d’avoir, au départ, une seule description convenue de la page.
