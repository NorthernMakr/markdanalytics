---
title: Mesurer un site multilingue
description: "Comment suivre un site offert en plusieurs langues : une seule langue de rapport pour toutes les valeurs, la langue comme variable de segmentation, et la distinction entre langue de la page et langue du navigateur."
pubDate: 2026-10-29
category: Pratique d’analytique
tags: [multilingue, langue, couche de données, Adobe Analytics, GA4, gouvernance]
platform: Both
---

**La règle :** tout ce qui part vers l’analytique est dans une seule langue de rapport, quelle que soit la langue que lit le visiteur. La langue est consignée à part, dans des variables sur lesquelles les analystes peuvent segmenter. Ce site existe en anglais et en français, et chaque valeur qu’il envoie à Adobe et à Google est en anglais.

## Pourquoi une seule langue de rapport

Les analystes travaillent habituellement dans une seule langue. Les données qu’ils voient dans Analysis Workspace ou GA4 doivent avoir du sens pour eux, peu importe la version du site qui les a produites. Un titre français dans un rapport de contenus populaires est du bruit pour un analyste anglophone, et l’inverse est tout aussi vrai.

Il y a une deuxième raison, plus importante : **séparer une page par langue brise les rapports standards.** La plupart des analyses commencent par la liste des pages les plus vues. Si `/shop/` et `/fr/boutique/` arrivent en deux lignes sous deux noms, la version anglaise l’emporte souvent en volume, et le trafic français disparaît plus bas dans la liste ou dans « Autre ». L’équipe conclut que les pages françaises ne comptent pas, alors qu’elles étaient simplement comptées à part. Une ligne par page, avec la langue en ventilation, évite ce piège.

## Ce qui reste dans la langue de rapport

Tout ce qu’un analyste pourrait voir comme valeur de dimension :

| Valeur | Page anglaise | Page française |
|---|---|---|
| Nom de page | `shop:product:tidepool-daypack` | `shop:product:tidepool-daypack` |
| Titre du contenu | How this site's data layer works | How this site's data layer works |
| Produit, couleur | Tidepool daypack, Buoy | Tidepool daypack, Buoy (affiché « Bouée ») |
| Noms de listes et de promotions | Home: featured | Home: featured |
| Titre de vidéo | What the new ferry schedule means for commuters | le même |
| Texte du lien sur les clics d’accroches | Le titre anglais | Le titre anglais |
| Sujet du formulaire, mode de paiement, livraison | `credit card`, `standard` | les mêmes |

Le visiteur voit du français; la couche de données transporte de l’anglais. En pratique, chaque élément traduisible a une valeur anglaise stable (un identifiant, un slug, le titre anglais) que la page envoie à l’analytique, et une valeur affichée à l’écran. Sur ce site, les couleurs de produit sont des boutons radio dont la `value` est anglaise et l’étiquette française, et les liens d’accroche portent le titre anglais dans un attribut `data-link-name`.

### L’adresse fait exception

L’URL sert aux visiteurs, pas aux analystes : elle est donc dans la langue de la page. On a `/fr/boutique/produit/sac-de-jour-tidepool/` plutôt que `/fr/shop/product/tidepool-daypack/`. Les francophones peuvent la lire et la partager, et les moteurs de recherche voient une page française. Le chemin de page dans les rapports est la vraie adresse.

Ça fonctionne parce que **c’est le nom de page, et non le chemin, qui regroupe les deux versions.** Les équipes Adobe travaillent déjà ainsi : `pageName` est le rapport que tout le monde utilise, et l’URL de page est une dimension secondaire. GA4 a besoin d’un petit coup de pouce pour se comporter de la même façon (section suivante).

## Les variables de langue

Deux langues méritent d’être consignées, et elles répondent à des questions différentes.

| Variable | Signifie | Fixée | Exemple |
|---|---|---|---|
| `page.language` | La version de la page qui est lue | À la construction de la page | `fr-CA` |
| `user.browserLanguage` | La langue que demande le navigateur du visiteur | Au chargement, à partir de `navigator.languages` | `en-US` |
| `user.languageMatch` | Si les deux concordent | Au chargement | `false` |

La langue de la page segmente tout : taux de conversion de la version française, visionnement complet des vidéos en français, billets lus en français. La langue du navigateur décrit l’auditoire. Quand les deux divergent, c’est un signal utile : une personne dont le navigateur préfère le français lit la page anglaise, peut-être parce qu’un lien l’y a menée ou que la version française manque.

Les deux plateformes recueillent déjà leur propre langue de navigateur. La [dimension Langue de GA4](https://support.google.com/analytics/answer/9268042?hl=fr) correspond au réglage de langue du système de l’appareil, et Adobe a sa propre [dimension Langue](https://experienceleague.adobe.com/fr/docs/analytics/components/dimensions/language). Envoyer `browser_language` explicitement reste utile : le format est le même sur les deux plateformes, la valeur côtoie `page_language` sur chaque événement, et elle rend possible l’indicateur de concordance. Aucune des deux plateformes ne connaît la langue de la page si vous ne l’envoyez pas.

### Correspondance sur ce site

| Couche de données | Adobe Analytics (Web SDK) | GA4 |
|---|---|---|
| `page.language` | `prop3`, `eVar2` | `page_language` |
| `user.browserLanguage` | `prop4`, `eVar3` | `browser_language` |
| `user.languageMatch` | `prop5` (`match` / `mismatch`) | `language_match` (`match` / `mismatch`) |
| Clic sur le sélecteur de langue | `language switched` | `language_switch` avec `language_from`, `language_to` |

L’indicateur de concordance est envoyé sous forme de mot plutôt que `true`/`false`, pour se lire clairement dans un rapport. Dans GTM, une variable de table de correspondance fait la conversion.

## Faire travailler GA4 comme Adobe

Si vous pensez d’abord en Adobe, l’écart est le suivant : **GA4 n’a pas de `pageName`.** Son rapport standard Pages et écrans regroupe par titre de page ou par chemin, et GA4 lit les deux dans le navigateur ([Mesurer les pages vues](https://developers.google.com/analytics/devguides/collection/ga4/views?hl=fr)). Sur une page française, cela donne un titre d’onglet et une adresse en français : chaque page arriverait en double.

La solution consiste à choisir ce que signifie le titre de page dans GA4. La balise Google de ce site envoie le nom de page anglais comme `page_title` : le rapport par titre de page de GA4 devient l’équivalent du rapport Pages d’Adobe.

| Adobe Analytics | GA4 sur ce site | Langue |
|---|---|---|
| `pageName` | `page_title` (remplacé par le nom de page), plus `page_name` comme dimension personnalisée | Anglais dans chaque version |
| URL de page | `page_location` et chemin de page (tels que recueillis) | Langue de la page |
| `prop3` / `eVar2` langue de la page | `page_language` | `en-CA`, `fr-CA` |
| `prop4` / `eVar3` langue du navigateur | `browser_language` | telle que le navigateur la donne |

Le titre d’onglet que voient les visiteurs reste en français; seule la valeur envoyée à GA4 change. En contrepartie, le « titre de page » de GA4 n’affiche plus le titre rédigé, d’où des noms de page lisibles sur ce site (`shop:product:tidepool-daypack`) plutôt que des codes.

## Les valeurs que les plateformes recueillent d’elles-mêmes

Certaines valeurs ne sont pas du tout dans votre couche de données, et elles se sépareront par langue si vous n’en prenez pas le contrôle.

- **`page_title` dans GA4**, traité plus haut.
- **Le `pageName` d’Adobe** vient de `web.webPageDetails.name`, que le script passerelle fixe à partir du `page.name` anglais. Laissé vide, Adobe se rabattrait sur l’URL.
- **Le suivi des liens** qui lit le texte cliqué (collecte automatique des liens, ou variable « Click Text » de GTM) capte la langue de la page. Préférez un attribut de données avec la valeur anglaise, comme le fait ce site pour les accroches.

Les moteurs de recherche ont besoin de l’inverse : ils doivent voir chaque version linguistique comme une page distincte. C’est le rôle des liens `hreflang` ([le guide de Google sur les versions localisées](https://developers.google.com/search/docs/specialty/international/localized-versions?hl=fr)). L’analytique regroupe, le référencement sépare, et chacun a raison pour son public.

## Ajouter une autre langue

Rien dans cette approche n’est propre au français. Ajouter le chinois simplifié, par exemple, fonctionnerait de la même façon :

- Les pages vivraient sous `/zh/`, avec des adresses en chinois ou en pinyin, et des liens `hreflang` comme les pages françaises. Ajouter les mots des adresses à la liste de correspondance du site est le seul changement de routage.
- `page.language` vaudrait `zh-CN`, ajoutée à la liste des langues permises par la construction.
- **Toutes les valeurs d’analytique resteraient exactement les mêmes.** Les noms de page, noms de produits, titres de vidéo et noms de liens sont déjà en anglais dans chaque version : rapports, segments et tableaux de bord continuent de fonctionner sans changement. La nouvelle langue n’est qu’une valeur de plus dans la ventilation par `page_language`.

Ce dernier point est le vrai test de la règle. Avec une langue dans une autre écriture, des valeurs traduites dans les rapports seraient illisibles pour la plupart de l’équipe, pas seulement incommodes. Un site qui envoie une seule langue de rapport peut ajouter des langues sans toucher à son analytique.

## Rapports à construire

- **Pages les plus vues, ventilées par langue de page.** Une ligne par page, la répartition par langue à un clic.
- **Taux de non-concordance par page d’entrée.** Un taux élevé sur une page laisse croire que l’autre version linguistique manque ou est difficile à trouver.
- **Taux de conversion par langue de page.** La caisse est la même; un écart signale un problème de traduction ou de contenu, pas de boutique.
- **Utilisation du sélecteur de langue.** Les pages que les gens quittent pour l’autre langue, et dans quel sens.

## Règles pour la spécification de la couche de données

À ajouter à la spécification d’implémentation de tout site multilingue :

1. Chaque valeur envoyée à l’analytique provient d’une source anglaise stable (identifiant, slug, titre anglais), jamais d’un texte affiché traduit. Seule exception : l’adresse, qui peut être traduite pour les visiteurs.
2. Les pages traduites réutilisent le `page.name`, le `content.id` et le `content.title` de la page anglaise. Le nom de page est la clé de rapport; dans GA4, il part aussi comme `page_title`.
3. `page.language` est fixée sur chaque page, sous forme de locale complète (`fr-CA`, pas `fr` ni `French`).
4. Le texte de l’élément cliqué n’est jamais utilisé comme valeur; utilisez un attribut de données avec la valeur de rapport.
5. Le sélecteur de langue a son propre événement, avec la langue de départ et d’arrivée.

## Le tester

- Chargez chaque page dans les deux langues et comparez la couche de données : tout sauf `page.language` et `page.path` devrait concorder.
- Réglez le navigateur dans une autre langue et vérifiez que `user.browserLanguage` et l’indicateur de concordance changent.
- Dans DebugView de GA4, vérifiez que `page_title` est le nom de page anglais sur les pages françaises, et dans l’Adobe Experience Platform Debugger que `web.webPageDetails.name` l’est aussi. Les deux URL devraient être l’adresse française.
- Faites un achat complet dans chaque langue et comparez les événements `purchase` : noms d’articles, variantes, mode de livraison et mode de paiement devraient être identiques.

La construction du site vérifie la langue de chaque page par rapport à une liste permise (`en-CA`, `fr-CA`), et un test sur tout le site suit le sélecteur de langue de chaque page jusqu’à sa jumelle et compare le nom de page et le titre de contenu.

## Une note sur la révision

Je travaille en anglais et en français : je peux donc réviser du contenu, des spécifications de couche de données et des rapports dans l’une ou l’autre langue, y compris vérifier qu’une page traduite envoie toujours les bonnes valeurs d’analytique. J’ai aussi des notions d’allemand (quatre ans d’études au secondaire) et de japonais (une année à enseigner l’anglais dans le Japon rural; je lis les kana, pas les kanji) : assez pour vérifier qu’une page, un sélecteur de langue ou une couche de données se comporte comme prévu, mais pas pour réviser le texte.
