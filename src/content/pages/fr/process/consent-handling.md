---
title: "Gestion du consentement : ce que font les balises avant et après le choix du visiteur"
description: "La mécanique du consentement dans une mise en œuvre d’analytique : un seul choix enregistré, une valeur par défaut définie avant le chargement de toute balise, et ce que font le Web SDK d’Adobe et les balises Google quand un visiteur accepte, refuse ou n’a pas encore choisi. Et ce que fait ce site aujourd’hui."
pubDate: 2026-11-15
category: Pratique d’analytique
tags: [consentement, confidentialité, Web SDK, mode Consentement, Google Tag Manager, GA4, AQ]
platform: Both
order: 3
---

**Le consentement est un comportement des balises, pas un bandeau.** Le bandeau ne fait que recueillir une réponse. La mise en œuvre, c’est ce que chaque balise fait de cette réponse, et ce qu’elle fait avant d’en avoir une. Cette page couvre cette mécanique pour le Web SDK d’Adobe et les balises Google. C’est la dernière étape du volet 2 de la [carte de mise en œuvre](/fr/processus/carte-de-mise-en-oeuvre/).

<div class="panel info">

Je suis un praticien de l’analytique, pas un avocat. La règle de consentement qui s’applique à un site est une décision qui revient à la personne responsable de la confidentialité, avec un avis juridique. Cette page part de cette décision et montre comment la réaliser.

</div>

## La conception en un coup d’œil

| Moment | Web SDK d’Adobe | Balises Google (mode Consentement) |
|---|---|---|
| Avant le choix du visiteur | `defaultConsent` décide : `in` envoie, `pending` retient les événements, `out` les rejette | L’état de consentement par défaut décide; il est défini avant le chargement de toute balise |
| Le visiteur accepte | `setConsent` avec `general: "in"` | Mise à jour du consentement à `granted` |
| Le visiteur refuse | `setConsent` avec `general: "out"` | Le consentement reste à `denied`, ou y est mis à jour |
| Le visiteur revient | Rappeler `setConsent` à chaque page | Envoyer la mise à jour le plus tôt possible à chaque page |

Les deux outils suivent le même modèle en deux temps : une valeur par défaut pour le visiteur inconnu, puis une mise à jour une fois que le visiteur a répondu.

## D’abord, décider de la règle

Les balises peuvent faire ce que l’organisation décide. La décision, elle, découle des lois et des politiques sur la protection des renseignements personnels; sa place est donc dans le registre de gouvernance et de confidentialité décrit à la page [Processus](/fr/processus/#lensemble-documentaire), pas dans le gestionnaire de balises.

Pour la loi fédérale canadienne, les lignes directrices du Commissariat à la protection de la vie privée donnent les questions auxquelles répondre. Le consentement doit être valable : les gens comprennent quels renseignements sont recueillis, avec qui ils sont partagés, à quelles fins, et quel est le risque de préjudice. Toute collecte qui n’est pas nécessaire pour fournir le service exige un choix clair et facile d’accès. Le consentement explicite est généralement exigé quand les renseignements sont sensibles, quand la collecte dépasse ce à quoi une personne s’attendrait raisonnablement, ou quand elle crée un risque résiduel important de préjudice grave. Les gens doivent pouvoir retirer leur consentement ([CPVP : lignes directrices pour l’obtention d’un consentement valable](https://www.priv.gc.ca/en/privacy-topics/collecting-personal-information/consent/gl_omc_201805/), en anglais; une version française est offerte sur le site du Commissariat)..

Les lois provinciales et étrangères peuvent ajouter des exigences; le registre devrait donc consigner la règle pour chaque endroit où le site exerce ses activités. Ce dont la mise en œuvre a besoin tient en peu de mots : pour chaque finalité (analytique, publicité), la valeur par défaut avant un choix est-elle **recueillir**, **retenir** ou **ne pas recueillir**?

## Web SDK d’Adobe

Le Web SDK a un réglage pour le visiteur inconnu et une commande pour la réponse du visiteur.

**`defaultConsent`** se définit à la configuration du SDK et accepte trois valeurs ([Adobe : defaultConsent](https://experienceleague.adobe.com/en/docs/experience-platform/web-sdk/commands/configure/defaultconsent), en anglais) :

| Valeur | Avant le choix du visiteur |
|---|---|
| `in` | La collecte fonctionne normalement jusqu’à ce que le visiteur refuse |
| `pending` | Les événements sont retenus dans le navigateur jusqu’à ce que le visiteur accepte |
| `out` | Les événements sont rejetés jusqu’à ce que le visiteur accepte |

**`setConsent`** transmet au SDK la réponse du visiteur ([Adobe : setConsent](https://experienceleague.adobe.com/en/docs/experience-platform/web-sdk/commands/setconsent), en anglais) :

```js
alloy("configure", { datastreamId: "…", orgId: "…", defaultConsent: "pending" });

// Quand le visiteur accepte (utiliser "out" quand il refuse) :
alloy("setConsent", {
  consent: [{ standard: "Adobe", version: "1.0", value: { general: "in" } }]
});
```

Trois détails comptent en pratique :

- **Le SDK ne peut pas vous dire quel choix est enregistré.** Il n’offre aucun moyen de récupérer le consentement; Adobe suggère donc d’appeler `setConsent` à chaque chargement de page pour qu’il reste en phase avec votre bandeau. Il ne fait un appel au serveur que lorsque le choix change (même page setConsent).
- **`in` avec un bandeau recueille avant la réponse.** Avec `defaultConsent: "in"`, un ECID est généré et au moins une requête est envoyée avant qu’un visiteur puisse refuser. Si le consentement est exigé d’abord, Adobe recommande `pending` ([Adobe : consentement et identité dans la collecte de données](https://experienceleague.adobe.com/en/docs/experience-platform/collection/identity/consent), en anglais).
- **Dans Adobe Tags, c’est un réglage, pas du code.** L’extension Web SDK comporte une section de consentement où le consentement par défaut se règle à Out ou à Pending ([Adobe : configurer le consentement avec le Web SDK](https://experienceleague.adobe.com/en/docs/platform-learn/implement-web-sdk/consent-management/setup-consent), en anglais).

## Balises Google

La version de Google s’appelle le mode Consentement. Elle comporte les deux mêmes étapes : définir un état de consentement par défaut avant que le visiteur donne son consentement, puis le mettre à jour quand il interagit avec le bandeau ([Google : configurer le mode Consentement sur les sites Web](https://developers.google.com/tag-platform/security/guides/consent?hl=fr)).

```js
window.dataLayer = window.dataLayer || [];
function gtag(){ dataLayer.push(arguments); }

// Avant l’extrait de Google Tag Manager :
gtag("consent", "default", {
  ad_storage: "denied", ad_user_data: "denied",
  ad_personalization: "denied", analytics_storage: "denied"
});

// Quand le visiteur accepte l’analytique :
gtag("consent", "update", { analytics_storage: "granted" });
```

- **L’ordre est capital.** La valeur par défaut doit s’exécuter avant le chargement du gestionnaire de balises. L’exemple de Google prévient que si le code de consentement est appelé dans le désordre, les valeurs par défaut ne fonctionneront pas (même page de Google).
- **Quatre types de consentement couvrent la mesure et la publicité.** GA4 dépend d’`analytics_storage` : quand il est refusé, Google Analytics ne lit ni n’écrit de témoins d’analytique propriétaires ([Google : aperçu du mode Consentement](https://developers.google.com/tag-platform/security/concepts/consent-mode?hl=fr)).
- **De base ou avancé, c’est un choix de politique.** En mode Consentement de base, les balises Google ne se chargent pas tant que le visiteur n’a pas interagi avec le bandeau, et rien n’est envoyé avant le consentement. En mode avancé, les balises se chargent avec les valeurs par défaut et, tant que le consentement est refusé, elles envoient des mesures sans témoins (même page d’aperçu). Le registre devrait préciser lequel l’organisation a choisi, parce que « rien n’est envoyé » et « des mesures sans témoins sont envoyées » sont deux promesses différentes faites au visiteur.

## Règles pour la mise en œuvre

Voici les normes que j’inscrirais dans la spécification de la couche de données et dans le gestionnaire de balises.

1. **Un seul choix enregistré alimente tous les outils.** Le bandeau consigne une seule fois la réponse du visiteur. Adobe et Google la lisent tous les deux. Deux outils ne doivent jamais se contredire au sujet du même visiteur.
2. **Les valeurs par défaut se chargent en premier.** L’ordre de chargement devient : valeurs par défaut du consentement, puis couche de données, puis gestionnaires de balises. L’[ordre de chargement](/fr/mise-en-oeuvre/specification-couche-de-donnees/#3-ordre-de-chargement) de ce site gagnerait une étape au début.
3. **Refuser est aussi facile qu’accepter,** et un visiteur peut changer sa réponse plus tard à partir d’un lien présent sur chaque page.
4. **Le choix n’est pas un renseignement personnel dans la couche de données.** On consigne l’état du consentement par finalité (`granted` ou `denied`), jamais quoi que ce soit qui identifie le visiteur.
5. **Les états de consentement sont des cas de test.** Chaque version est vérifiée dans chacun des états ci-dessous.

## Ce que l’AQ vérifie

| État | Le Web SDK d’Adobe devrait | Les balises Google devraient |
|---|---|---|
| Aucun choix encore | Ne rien envoyer si la valeur par défaut est `pending` ou `out` | Ne rien envoyer (de base), ou seulement des mesures sans témoins (avancé) |
| Accepté | Envoyer les événements retenus, s’il y en a, puis recueillir normalement | Envoyer toutes les données de mesure et écrire les témoins |
| Refusé | N’envoyer aucun événement | Ne lire ni écrire aucun témoin d’analytique |
| Passage d’accepté à refusé | Cesser de recueillir à partir de ce moment | Recevoir une mise à jour à `denied` |
| Visiteur qui revient | Se comporter selon le choix enregistré, sans bandeau | Même chose |

Pour Google, Tag Assistant montre la valeur par défaut et la mise à jour comme des événements de consentement, et indique si chaque paramètre a été défini ([Google : dépanner le mode Consentement](https://developers.google.com/tag-platform/security/guides/consent-debugging?hl=fr)). Pour Adobe, le panneau réseau du navigateur montre si une requête a quitté la page. Le « consentement refusé » figure déjà dans la liste des [cas limites d’AQ](/fr/processus/#normes-dassurance-qualité) de ce site.

## Ce que fait ce site aujourd’hui

<div class="panel warn">

**Ce site n’a pas encore de bandeau de consentement, et il devrait en avoir un.** La conception ci-dessus est celle selon laquelle il sera construit. D’ici là, voici exactement ce qui se passe.

</div>

| Outil | Aujourd’hui | Ce que la conception change |
|---|---|---|
| Web SDK d’Adobe | Configuré avec `defaultConsent: "in"`. Les requêtes vont à une doublure de l’Edge Network sur ce domaine et n’atteignent jamais Adobe. Le témoin d’identité du SDK contient un identifiant inventé | `pending` par défaut, et `setConsent` à partir du bandeau |
| Google Tag Manager et GA4 | Le conteneur se charge sur chaque page sans valeurs par défaut de consentement, et envoie ses données à une vraie propriété GA4 | Des valeurs par défaut de consentement avant le conteneur, et une mise à jour à partir du bandeau |
| Couches de données | Aucun renseignement personnel dans aucun champ, vérifié à la compilation | Inchangé, plus un état de consentement par finalité |

Le côté Adobe ne recueille donc rien de réel, mais le côté Google, oui, sans demander d’abord. C’est à cause de cet écart que cette page porte l’état « partiel » sur la carte : la norme est rédigée, et la construction est la prochaine étape.
