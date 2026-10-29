---
title: Diriger une pratique d’analytique numérique en entreprise
description: Ce qu’il faut documenter pour diriger une pratique d’analytique en entreprise, des normes d’assurance qualité et des fiches de variables jusqu’aux spécifications pour les développeurs et à une base Adobe et GA4.
pubDate: 2026-10-29
updatedDate: 2026-10-29
category: Pratique d’analytique
tags: [gouvernance, assurance qualité, documentation, couche de données, Adobe Analytics, GA4]
platform: Both
---

Dans les grandes organisations, la plupart des problèmes d’analytique ne sont pas des problèmes de balisage. Ce sont des problèmes de mémoire. Personne ne se souvient pourquoi l’eVar37 existe, quelle équipe l’a demandée, si l’événement d’étape de paiement se déclenche encore dans la nouvelle application, ou laquelle des trois dimensions « type de page » est la bonne. Les balises fonctionnent; le savoir qui les entoure s’est évaporé.

Une pratique règle ce problème en consignant les choses de façon cohérente, et en faisant de la version écrite celle que les gens utilisent vraiment. Cette page présente ce que je documenterais si je dirigeais une pratique d’analytique numérique en entreprise, et pourquoi chaque élément mérite sa place. Les pages suivantes de cette section approfondiront chacun d’eux, avec la [boutique démo](/fr/boutique/) et le [site média](/fr/medias/) de ce domaine comme exemples concrets.

## L’ensemble documentaire

Six documents portent une pratique. Tout le reste est une vue de l’un d’eux.

| Document | Répond à | Responsable | Change quand |
|---|---|---|---|
| Plan de marquage (solution design reference) | Que mesure-t-on, pourquoi, et où cela vit-il dans chaque outil? | Responsable de l’analytique | Une variable est ajoutée, modifiée ou retirée |
| Spécification de la couche de données | Que doit exposer le site, sous quels noms, types et moments? | Responsable de l’analytique, en accord avec l’ingénierie | Le plan de marquage a besoin de nouvelles données |
| Spécifications d’implémentation | Que construit exactement cette équipe pour cette version? | Analyste qui rédige le billet | Par projet ou par version |
| Plans et résultats de tests d’assurance qualité | Comment sait-on que ça fonctionne, et est-ce le cas? | Analyste en assurance qualité | Par version; résultats conservés indéfiniment |
| Journal des modifications | Qu’est-ce qui a changé, quand, et quel effet sur les rapports? | La personne qui livre le changement | À chaque changement en production |
| Registre de gouvernance et de confidentialité | Qui décide, et quelles données a-t-on le droit de recueillir? | Responsable de la pratique, avec la confidentialité et le juridique | Changement de politique ou de responsable |

Le plan de marquage est au centre. Si une variable n’y figure pas, elle n’existe pas aux yeux de la pratique; si elle figure au plan mais pas dans les outils, c’est un défaut.

## Normes de documentation

Quelques règles gardent la documentation digne de confiance :

- **Une seule source de vérité par élément.** Le plan de marquage vit à un seul endroit, souvent un tableur contrôlé ou une page wiki générée à partir de celui-ci. Les rapports, les descriptions dans les outils et les spécifications y renvoient plutôt que de le recopier.
- **Écrite pour la personne qui n’était pas là.** Chaque entrée dit, en langage clair, à quelle question d’affaires elle répond, et pas seulement ce qu’elle est techniquement.
- **Versionnée et datée.** Chaque changement a une date, un auteur et une raison. Un plan de marquage sans historique ne peut pas expliquer une marche dans une courbe de tendance.
- **Un statut pour tout.** Proposé, approuvé, en développement, en production, déprécié, retiré. Les lecteurs doivent savoir si une variable est fiable pour les rapports.
- **Revue à intervalles fixes.** Une revue trimestrielle compare le plan à ce que les outils reçoivent réellement, et corrige celui des deux qui a tort.
- **Des gabarits, pas des pages blanches.** Les spécifications, plans de tests et entrées de journal suivent des gabarits fixes, pour être comparables d’une équipe et d’une année à l’autre.

## Documentation des variables

Chaque variable a une fiche dans le plan de marquage, toujours avec les mêmes champs. Voici la fiche du type de page sur ce site :

| Champ | Exemple |
|---|---|
| Nom | Type de page |
| Question d’affaires | Quels genres de pages génèrent l’engagement et la conversion? |
| Définition | Le gabarit de la page : accueil, article, fiche produit, panier, caisse, confirmation de commande |
| Source dans la couche de données | `page.type` |
| Valeurs permises et format | En minuscules, tirées d’une liste fixe; aucun texte libre |
| Adobe Analytics | `prop1` et `eVar1` (expiration au hit); avec le Web SDK, `data.__adobe.analytics` |
| GA4 | Paramètre d’événement `page_type`, dimension personnalisée de portée événement « Page type » |
| Définie sur | Chaque page vue; persiste sur les événements de cette page |
| Classification de confidentialité | Pas une donnée personnelle |
| Responsable | Responsable de l’analytique |
| Statut | En production depuis le 2026-10-29 |
| Notes et historique | (vide) |

Deux champs font l’essentiel du travail. La **question d’affaires** empêche de créer des variables « au cas où ». La **source dans la couche de données** sépare ce que le site expose de la façon dont chaque outil le stocke : une migration d’outil ne change donc pas le site.

### La partager

Une documentation introuvable n’existe pas. Trois habitudes aident :

- **Mettre la définition là où les gens lisent les données.** Les descriptions de composants Adobe et de définitions personnalisées GA4 devraient porter la définition en une ligne et un lien vers la fiche complète.
- **Utiliser le même nom partout.** Si c’est « Type de page » dans le plan, c’est « Type de page » dans Analysis Workspace, GA4, Looker Studio et l’entrepôt de données.
- **Annoncer les changements.** Une courte note aux utilisateurs des rapports chaque fois qu’une variable est ajoutée, modifiée ou retirée, avec un lien vers le journal des modifications.

### Conventions de nommage

À convenir une fois, puis à faire respecter en revue :

- **Clés de la couche de données :** camelCase, regroupées par objet (`page.type`, `product.sku`, `user.loginStatus`).
- **Événements et paramètres GA4 :** snake_case, les noms recommandés par Google d’abord (`add_to_cart`, `item_list_name`), les vôtres seulement quand aucun nom recommandé ne convient.
- **Classifications et valeurs Adobe :** minuscules, hiérarchies séparées par des deux-points pour les noms de page (`shop:product:tidepool-daypack`).
- **Noms affichés :** majuscule initiale seulement, aucune abréviation qu’une nouvelle recrue ne connaîtrait pas.

Sur ce site bilingue, tout ce qui part vers l’analytique est en anglais, quelle que soit la langue de la page : noms et chemins de page, titres, produits, listes, promotions, vidéos, texte des liens. Les analystes travaillent habituellement dans une seule langue, et les données de Workspace ou de GA4 doivent leur rester compréhensibles; une page forme aussi une seule ligne dans le palmarès des pages. Pour séparer les langues, on segmente sur `page.language` et `user.browserLanguage`. [Mesurer un site multilingue](/fr/pratique/sites-multilingues/) traite du sujet en détail.

## Ajouter ou modifier une variable

Les emplacements sont limités. Une propriété GA4 standard permet [50 dimensions personnalisées de portée événement et 25 de portée utilisateur](https://support.google.com/analytics/answer/12229528?hl=fr) et [10 de portée article](https://support.google.com/analytics/answer/14239695?hl=fr). Adobe permet [jusqu’à 250 eVars](https://experienceleague.adobe.com/fr/docs/analytics/components/dimensions/evar), [75 props](https://experienceleague.adobe.com/fr/docs/analytics/implementation/vars/page-vars/prop) et [1 000 événements de succès](https://experienceleague.adobe.com/fr/docs/analytics/admin/admin-tools/manage-report-suites/edit-report-suite/conversion-variables/success-event), selon le contrat. Un processus de changement protège ces emplacements et la confiance dans les données.

### Ajouter une variable

1. **Demande.** Le demandeur énonce la question d’affaires, la décision qu’elle éclairera et qui s’en servira.
2. **Vérifier la réutilisation.** Une variable existante, une classification ou un segment peut-il y répondre? La plupart des demandes s’arrêtent ici.
3. **Conception.** Définir la clé de la couche de données, les valeurs permises et la correspondance dans chaque outil, y compris la portée, l’attribution et l’expiration dans Adobe.
4. **Revue de confidentialité.** Confirmer qu’il ne s’agit pas d’une donnée personnelle, ou que sa collecte est couverte par le consentement et la politique.
5. **Approbation.** Le responsable de l’analytique approuve, et la fiche entre au plan avec le statut « approuvé ».
6. **Spécification.** L’inscrire dans la prochaine spécification d’implémentation pour l’ingénierie.
7. **Développement et assurance qualité.** Implémenter en développement, tester selon la spécification, consigner les résultats.
8. **Mise en production et annonce.** Livrer, passer le statut à « en production », ajouter une entrée au journal, prévenir les utilisateurs des rapports.
9. **Surveillance.** Observer les deux premières semaines de données pour repérer les trous, les valeurs inattendues ou les problèmes de volume.

### Modifier ou retirer une variable

- **Ne jamais réaffecter en silence.** Réutiliser l’eVar37 pour autre chose sans rupture dans les données corrompt chaque tendance historique qui l’utilise. Si un emplacement doit être réutilisé, retirez l’ancien sens, effacez les libellés des anciennes données et annotez la date.
- **Modifier les définitions, pas les noms, par le même processus** que l’ajout d’une variable, en gardant l’ancienne définition dans l’historique de la fiche.
- **Retirer en deux temps :** marquer comme dépréciée (toujours recueillie, signalée dans les rapports) pendant un cycle de rapports, puis cesser la collecte et archiver.
- **Annoter les rapports** dans les deux outils à la date de tout changement qui touche les tendances.

## Spécifications d’implémentation pour les développeurs

Les développeurs ne devraient pas avoir à comprendre Adobe ou Google pour implémenter l’analytique correctement. La spécification est rédigée uniquement en fonction de la couche de données; la gestion des balises en fait des appels aux outils. Une bonne spécification contient :

- **La portée.** Les pages, gabarits, composants et plateformes (web, application) visés.
- **Les objets de la couche de données** en JSON exact, un exemple par type de page.
- **La définition des champs :** clé, type, obligatoire ou facultatif, valeurs permises, exemple et source (champ du CMS, réponse d’API).
- **Les événements :** nom, action de l’utilisateur qui le déclenche, moment (avant la navigation, après la réponse de l’API) et contenu.
- **Les règles :** aucune donnée personnelle dans aucun champ; les prix en nombres, pas en chaînes; un événement par action; vider `ecommerce` avant chaque envoi de commerce GA4.
- **Des critères d’acceptation** que le développeur peut vérifier lui-même, par exemple : « après Ajouter au panier, la dernière entrée de `dataLayer` est `add_to_cart` avec `items[0].item_id` égal au SKU du produit ».
- **La version et les contacts :** version de la spécification, analyste qui l’a rédigée, et où poser les questions.

La spécification est le contrat. L’assurance qualité teste selon elle, pas selon ce que les outils affichent par hasard.

## Une base standard : couche de données et balises

Chaque propriété de la pratique part de la même base, pour que les équipes ne réinventent pas le suivi des pages et que les analystes puissent comparer les sites. Ce site applique exactement cette base; le [billet sur la couche de données](/fr/blogue/comment-fonctionne-la-couche-de-donnees/) la présente en détail.

### La couche de données

Un objet de page, construit côté serveur et envoyé avant tout gestionnaire de balises :

```json
{
  "page": { "name": "shop:product:tidepool-daypack", "type": "product detail",
            "section": "shop", "siteName": "Taiga Supply Co.",
            "path": "/fr/boutique/produit/sac-de-jour-tidepool/", "language": "fr-CA",
            "environment": "production" },
  "user": { "loginStatus": "guest", "browserLanguage": "en-CA", "languageMatch": false },
  "content": { },
  "product": { }
}
```

Il est envoyé à la fois dans `dataLayer` (pour Google Tag Manager) et dans `adobeDataLayer` (l’Adobe Client Data Layer). Les interactions suivent les conventions de chaque plateforme : les événements de commerce recommandés par GA4 d’un côté, des événements de forme XDM de l’autre.

### Les balises

| Couche | Adobe | Google |
|---|---|---|
| Couche de données | Adobe Client Data Layer (`adobeDataLayer`) | `dataLayer` |
| Gestion des balises | Adobe Experience Platform Tags | Google Tag Manager |
| Collecte | `sendEvent` du Web SDK avec XDM | Balise Google GA4 et balises d’événement |
| Base sur chaque page | Page vue avec `web.webPageDetails` | Balise Google avec les paramètres de page communs |
| Ordre de chargement | Couche de données, puis Tags, puis GTM | |

### Les variables de base

Elles sont recueillies sur chaque propriété dès le premier jour. Les deux variables de langue répondent à des questions différentes : `page.language` est la version de la page qui a été lue, et `user.browserLanguage` est la langue que demande le navigateur du visiteur. Ensemble, elles montrent qui lit une page dans une autre langue que la sienne.

| Couche de données | Adobe Analytics | GA4 |
|---|---|---|
| `page.name` | `pageName` (`web.webPageDetails.name`) | `page_name` |
| `page.type` | `prop1`, `eVar1` | `page_type` |
| `page.section` | `prop2`, canal | `site_section` |
| `page.siteName` | suite de rapports ou `eVar` | `site_name` |
| `page.environment` | `eVar` | `site_environment` |
| `page.language` | `prop3`, `eVar2` | `page_language` |
| `user.browserLanguage` | `prop4`, `eVar3` | `browser_language` |
| `user.languageMatch` | `prop5` (`match` / `mismatch`) | `language_match` |
| `user.loginStatus` | `eVar` (expiration à la visite) | `login_status` (portée utilisateur) |
| `content.*` | des `eVar` par champ de contenu | paramètres `content_*` |

## Normes d’assurance qualité

Les tests se font à quatre niveaux, chacun avec un responsable et des critères de sortie clairs.

| Niveau | Qui | Quoi | Réussi quand |
|---|---|---|---|
| Vérification du développeur | Développeur | La couche de données respecte la spécification, avec les outils du navigateur | Chaque critère d’acceptation de la spécification est rempli |
| Assurance qualité fonctionnelle | Analyste en assurance qualité | Chaque événement et ses envois aux outils, dans un environnement de test | Chaque cas de test réussit, preuves jointes |
| Régression | Automatisée | Parcours scriptés (de la fiche produit à l’achat, vidéo) qui vérifient le contenu de la couche de données | La suite est au vert pour chaque version candidate |
| Surveillance en production | Équipe d’analytique | Volumes quotidiens, valeurs nulles et valeurs inattendues pour chaque variable clé | Alertes examinées en un jour ouvrable |

Certaines normes s’appliquent à tous les niveaux :

- **Tester selon la spécification,** jamais selon « ce que montre l’outil ». Un outil peut se tromper de façon constante.
- **Garder des preuves.** Captures des envois ou requêtes exportées, jointes au billet et conservées avec la version.
- **Tester les cas limites :** rechargements (l’achat ne doit pas être compté deux fois), bouton Précédent, panier vide, bloqueurs de publicité, consentement refusé.
- **Utiliser les outils de chaque plateforme :** Adobe Experience Platform Debugger et Assurance pour Adobe; Tag Assistant et DebugView pour Google; l’onglet Réseau du navigateur pour les deux.

### Automatiser les conventions

Les normes qui reposent sur la mémoire dérivent. Sur ce site, les conventions vivent dans un seul fichier de valeurs permises (types de page, sections, format des noms de page, langues et chaque nom d’événement enregistré), et la construction vérifie chaque page par rapport à lui. Une page avec un type non enregistré, ou un nom de page qui n’est pas en minuscules séparées par des deux-points, fait échouer la construction et n’atteint jamais la production. Hors production, chaque envoi dans la couche de données est aussi vérifié dans le navigateur, avec un avertissement dans la console pour un événement non enregistré ou une clé comme `email` ou `phone` qui laisse croire qu’une donnée personnelle s’est glissée. Ajouter un type de page ou un événement oblige à l’ajouter d’abord à ce fichier : c’est le processus de changement en miniature.

La [boutique](/fr/boutique/) de ce site est prévue pour s’exercer à ces cas. Le journal, sur chaque page, montre les deux couches de données en direct, et la page de confirmation ne renvoie volontairement pas `purchase` au rechargement.

## À venir dans cette section

- Un gabarit de plan de marquage, rempli avec les variables de ce site
- Rédiger une spécification d’implémentation que les développeurs liront vraiment
- Un plan de tests d’assurance qualité pour un parcours d’achat
- Mener une revue des variables : repérer et retirer les variables mortes
