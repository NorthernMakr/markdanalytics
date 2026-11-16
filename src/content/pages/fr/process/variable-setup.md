---
title: "Configurer les variables dans Adobe Analytics, CJA et GA4"
description: "La même valeur, le type de page, configurée de trois façons : une eVar dans Adobe Analytics, un champ de schéma et un composant de vue de données dans Customer Journey Analytics, et une dimension personnalisée dans GA4. Ce qu’on configure, ce qu’on envoie, et où se règle le comportement dans les rapports."
pubDate: 2026-11-15
category: Pratique d’analytique
tags: [variables, eVars, XDM, vues de données, dimensions personnalisées, Adobe Analytics, Customer Journey Analytics, GA4]
platform: Both
order: 2
---

**On la nomme sur la page; on la numérote dans les balises.** La page expose une valeur sous un nom d’affaires, `page.type`. Chaque outil d’analytique la range ensuite à sa façon. Cette page suit cette valeur dans Adobe Analytics, Customer Journey Analytics (CJA) et GA4, pour montrer ce que veut dire « configurer une variable » dans chacun. C’est le détail du volet 1 de la [carte de mise en œuvre](/fr/processus/carte-de-mise-en-oeuvre/).

## Les trois côte à côte

| | Adobe Analytics | Customer Journey Analytics | GA4 |
|---|---|---|---|
| La variable est | Un emplacement numéroté : `eVar2` | Un champ de schéma nommé | Un paramètre d’événement nommé : `page_type` |
| Définie dans | La suite de rapports | Le schéma XDM, puis la vue de données | Les définitions personnalisées de la propriété |
| Les balises envoient | `data.__adobe.analytics.eVar2` | Un champ XDM | Un paramètre sur l’événement |
| Le comportement (la durée du crédit d’une valeur) se règle | Sur l’eVar, dans la suite de rapports | Sur le composant, dans la vue de données | Par la portée : événement, utilisateur ou article |
| Le sens se trouve dans | La SDR | Le nom du champ | Le nom du paramètre |

## Adobe Analytics

1. **Choisir le type de variable.** Une eVar persiste et reçoit le crédit d’événements ultérieurs; une prop ne s’applique qu’à l’appel où elle est définie; un événement de succès compte quelque chose ([Adobe : eVars](https://experienceleague.adobe.com/en/docs/analytics/components/dimensions/evar), [props](https://experienceleague.adobe.com/en/docs/analytics/components/dimensions/prop), [événements de succès](https://experienceleague.adobe.com/en/docs/analytics/admin/admin-tools/manage-report-suites/edit-report-suite/conversion-variables/success-event), en anglais).
2. **La configurer dans la suite de rapports.** On donne un nom à l’emplacement et, pour une eVar, une expiration et une attribution. Ce sont des réglages de la suite de rapports, pas du code de page; on les consigne donc dans la [SDR](/fr/mise-en-oeuvre/sdr/). Pour le type de page sur ce site : `eVar2`, expiration à l’appel, attribution à la valeur la plus récente.
3. **Envoyer la valeur à partir des balises.** Avec le Web SDK, la façon recommandée par Adobe de définir les eVars, les props et les événements est l’objet `data` ([Adobe : configurer Analytics avec le Web SDK](https://experienceleague.adobe.com/en/docs/platform-learn/implement-web-sdk/applications-setup/setup-analytics), en anglais) :

   ```js
   alloy("sendEvent", {
     data: { __adobe: { analytics: { eVar2: "product detail" } } }
   });
   ```

4. **Laisser les champs standards se mapper seuls.** Les champs XDM standards, comme le nom de la page et les événements de commerce, sont associés automatiquement aux variables d’Analytics; ils n’ont donc pas besoin d’une eVar (même page d’Adobe).

La même page d’Adobe présente deux méthodes plus anciennes, les règles de traitement d’Analytics et l’association directe de champs de schéma à des variables, comme n’étant plus recommandées. Elle précise aussi que, depuis mai 2024, un schéma XDM n’est plus nécessaire pour mettre en œuvre Analytics avec le Web SDK.

## Customer Journey Analytics

CJA n’a pas d’emplacements numérotés. Il produit ses rapports à partir de jeux de données d’Adobe Experience Platform, et chaque jeu de données repose sur un schéma XDM.

1. **Ajouter le champ au schéma.** On utilise d’abord les groupes de champs standards d’Adobe, et on ajoute son propre champ seulement quand aucun champ standard ne convient. Les champs définis par votre organisation sont placés sous votre identifiant de locataire (tenant ID), ce qui évite les collisions avec ceux d’Adobe ([Adobe : espaces de noms dans XDM](https://experienceleague.adobe.com/en/docs/experience-platform/xdm/schema/namespaces), en anglais).
2. **Créer le jeu de données et y relier le flux de données.** Le flux de données reçoit le service Adobe Experience Platform, avec votre jeu de données comme jeu de données d’événements ([Adobe : ingérer des données par le Web SDK](https://experienceleague.adobe.com/en/docs/analytics-platform/using/cja-data-ingestion/ingest-use-guides/aepwebsdk), en anglais).
3. **Envoyer la valeur en XDM.** Le nom du champ porte le sens. (À titre d’exemple : ce site n’envoie pas ce champ.)

   ```js
   alloy("sendEvent", {
     xdm: { _yourTenantId: { page: { type: "product detail" } } }
   });
   ```

4. **Créer une connexion, puis une vue de données.** La connexion amène le jeu de données dans CJA. La vue de données est l’endroit où un champ de schéma devient une dimension ou une mesure dans Analysis Workspace (même guide d’ingestion).
5. **Régler le comportement sur le composant.** La persistance est désactivée par défaut : une dimension n’est alors liée qu’aux mesures du même événement. L’activer, c’est choisir une attribution et une expiration ([Adobe : réglages de persistance des composants](https://experienceleague.adobe.com/fr/docs/analytics-platform/using/cja-dataviews/component-settings/persistence)).

La différence qui compte le plus : dans Adobe Analytics, l’expiration et l’attribution se décident dans la suite de rapports, avant la collecte. Dans CJA, ce sont des réglages de la vue de données, et une vue de données permet de les modifier sans changer le schéma ni refaire la mise en œuvre ([Adobe : aperçu des vues de données](https://experienceleague.adobe.com/en/docs/analytics-platform/using/cja-dataviews/data-views), en anglais).

Une mise en garde pour un site qui commence par Analytics : les valeurs envoyées seulement dans l’objet `data` n’atteignent pas le jeu de données de Platform, à moins d’être mappées vers XDM ([Adobe : configurer Analytics avec le Web SDK](https://experienceleague.adobe.com/en/docs/platform-learn/implement-web-sdk/applications-setup/setup-analytics), en anglais). Une variable qui n’existe que comme eVar est invisible pour CJA.

## GA4

1. **Envoyer la valeur comme paramètre d’événement.** Dans Google Tag Manager, une variable de couche de données lit `page.type`, et la balise Google l’envoie sous le nom `page_type`. Les valeurs qui décrivent l’utilisateur partent comme propriétés d’utilisateur; celles qui décrivent un produit vont dans le tableau `items`.
2. **L’enregistrer comme dimension personnalisée.** On crée la dimension personnalisée pour pouvoir analyser les données du paramètre, et il faut de 24 à 48 heures avant de pouvoir l’utiliser dans les rapports ([Google : dimensions et mesures](https://support.google.com/analytics/answer/14240153?hl=fr)).
3. **Choisir la portée.** La portée événement porte sur un paramètre d’événement, la portée utilisateur sur une propriété de l’utilisateur, et la portée article sur un produit dans le tableau `items` d’un événement de commerce (même page de Google). Le type de page a une portée événement.
4. **Surveiller les limites.** Une propriété standard permet 50 dimensions personnalisées à portée événement, 25 à portée utilisateur et 10 à portée article (même page de Google); l’enregistrement passe donc par le [processus de changement](/fr/processus/#ajouter-ou-modifier-une-variable), comme tout emplacement Adobe.

GA4 n’a ni expiration ni attribution à configurer. Ce qui s’en rapproche le plus, c’est le choix de la portée.

## Ce que fait ce site

| Outil | État | Comment le type de page y est configuré |
|---|---|---|
| Adobe Analytics | Simulé | `eVar2` dans l’objet `data` à chaque appel, à côté du XDM standard pour les données de page et de commerce. Les réglages de la suite de rapports n’existent que comme conception dans la SDR |
| CJA | Non construit | Les champs XDM standards atteindraient un jeu de données; les valeurs personnalisées n’existent que comme eVars et ne s’y rendraient donc pas |
| GA4 | En production | `page_type`, envoyé par Google Tag Manager à chaque événement, pour une dimension personnalisée à portée événement nommée « Page type » |

<div class="panel warn">

**Le côté Adobe est une solution de rechange.** Je n’ai pas accès à un compte Adobe pour ce site : il n’y a donc ni suite de rapports, ni flux de données, ni propriété Tags. Un script fait la correspondance que ferait une règle d’Adobe Tags, et une doublure de l’Edge Network reçoit les requêtes. Cela prouve ce que le navigateur envoie, pas la façon dont Adobe le traite. Voir [Tester le Web SDK d’Adobe sans compte Adobe](/fr/qualite-des-donnees/tester-adobe-web-sdk-sans-compte-adobe/).

</div>

Pour rendre ce site prêt pour CJA, chaque valeur personnalisée (le type de page, la section, les variables de langue) aurait besoin d’un champ nommé dans un schéma, envoyé dans l’objet `xdm` en plus de l’eVar.
