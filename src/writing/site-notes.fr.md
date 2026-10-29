---
title: Notes sur la conception de ce site
description: Comment markdanalytics.ca a été construit, et ce qui a été fait pour le mobile, l’accessibilité, le référencement, les moteurs de réponse IA, la confidentialité et l’analytique, y compris ce qui reste à faire.
pubDate: 2026-10-29
updatedDate: 2026-10-29
---

**En bref :** il s’agit d’un site statique construit avec Astro, hébergé chez Cloudflare et déployé automatiquement depuis GitHub. Je l’ai construit en une séance de travail le 29 octobre 2026 avec l’aide de Claude, l’assistant IA d’Anthropic, qui a écrit l’essentiel du code pendant que je donnais la direction, prenais les décisions et révisais les résultats. Chaque page est testée sur des écrans de téléphone, obtient 100 en accessibilité aux vérifications automatisées et porte des données structurées pour les moteurs de recherche et les assistants IA. La boutique et le site de nouvelles démo servent à tester les balises d’analytique; leur contenu est fictif.

## Comment il est construit

| Élément | Ce qu’il utilise | Pourquoi |
|---|---|---|
| Générateur de site | [Astro](https://astro.build), avec des pages rédigées en Markdown | Produit du HTML simple, sans JavaScript sauf si une page en a besoin |
| Hébergement | Cloudflare Workers (fichiers statiques et un petit Worker) | Rapide partout dans le monde, gratuit à cette échelle |
| Domaine | Cloudflare Registrar | Même compte que l’hébergement et le DNS |
| Code source | GitHub | Chaque changement est versionné; un push publie le site en deux minutes environ |
| Mise en forme | CSS écrit à la main, polices du système | Aucune police à télécharger, aucun cadre CSS |
| Analytique | Google Tag Manager avec GA4; Adobe Web SDK contre un point de terminaison de remplacement | Voir plus bas |

Le petit Worker a deux rôles : il remplace l’Edge Network d’Adobe pour que l’Adobe Web SDK fonctionne sans compte Adobe, et il livre les messages du formulaire de contact. Tout le reste est fait de fichiers statiques.

## Langues

Tout le site est offert en anglais et en français. Les pages anglaises sont à la racine (`/shop/`) et les pages françaises sous `/fr/`, aux mêmes adresses (`/fr/shop/`). Le sélecteur EN | FR en haut de chaque page mène à la même page dans l’autre langue.

- **Une page, deux routes.** Chaque route française affiche le même composant de page que la route anglaise, et la page déduit sa langue de sa propre adresse. Les gabarits communs portent les menus et libellés traduits : une nouvelle page n’a besoin que de son texte dans les deux langues.
- **Les moteurs de recherche** reçoivent des liens `hreflang` entre les deux versions (et `x-default` vers l’anglais), `og:locale` pour les aperçus de partage, `inLanguage` dans les données structurées, et les deux versions dans le [plan du site XML](/sitemap.xml).
- **L’analytique** consigne deux langues distinctes sur chaque page : `page.language`, la version lue (`en-CA` ou `fr-CA`), et `user.browserLanguage`, la langue préférée du navigateur du visiteur, plus `user.languageMatch` quand les deux concordent. Dans GA4, ce sont `page_language`, `browser_language` et `language_match`; dans Adobe, `prop3`/`eVar2`, `prop4`/`eVar3` et `prop5`. Le sélecteur de langue envoie `language_switch` (GA4) et `language switched` (Adobe).
- **L’analytique est toujours en anglais.** Noms et chemins de page, titres de contenu, noms de produits, de listes et de promotions, titres de vidéo et texte des liens sont en anglais dans les deux versions : un analyste qui travaille dans une seule langue comprend chaque rapport, et une page forme une seule ligne dans le palmarès des pages. Dans GA4, `page_location` et `page_title` sont remplacés par l’adresse anglaise et le nom de page; chez Adobe, l’URL de page utilise le chemin anglais. Seul ce que voient les visiteurs est traduit; les variables de langue servent à séparer les deux.

## Analytique

L’analytique est la raison d’être de ce site; l’implémentation suit donc les normes de la page [pratique d’analytique](/fr/practice/) :

- Chaque page se décrit dans un seul objet de données, envoyé à la fois dans `dataLayer` (Google) et `adobeDataLayer` (Adobe) avant tout gestionnaire de balises. [Comment fonctionne la couche de données de ce site](/fr/blog/how-this-sites-data-layer-works/) l’explique.
- Les conventions sont appliquées, pas seulement documentées. Les types de page, sections, formats de noms de page, langues et noms d’événements permis vivent dans un seul fichier, et la construction échoue si une page y déroge. Hors production, chaque envoi dans la couche de données est aussi vérifié pour repérer les événements non enregistrés et les clés qui évoquent des données personnelles.
- L’Adobe Web SDK fonctionne pour vrai contre une doublure de l’Edge Network sur ce domaine. [Tester l’Adobe Web SDK sans compte Adobe](/fr/blog/testing-adobe-web-sdk-without-an-adobe-account/) explique comment.
- GA4 est configuré par Google Tag Manager, et la configuration du conteneur est conservée dans le dépôt du site pour que ses changements soient versionnés aussi.

## Mobile

- Les mises en page sont adaptatives et pensées pour les téléphones comme pour les ordinateurs : les grilles passent à une colonne et les menus vont à la ligne plutôt que de déborder.
- Chaque page a été vérifiée à 390 et 360 pixels de large (des tailles de téléphone courantes), sans défilement horizontal.
- Les liens de menu et les boutons ont des zones tactiles de 34 à 45 pixels. La première vérification a trouvé des liens de menu de seulement 19 pixels de haut; ils ont été corrigés.
- Les champs de formulaire utilisent du texte de 16 pixels, pour que les téléphones ne zooment pas quand on touche un champ.

Résultats Lighthouse en mode mobile, sur 100 (sur une copie locale du site, version anglaise) :

| Page | Performance | Accessibilité | Bonnes pratiques | Référencement |
|---|---|---|---|---|
| Accueil | 96 | 100 | 96 | 100 |
| Pratique d’analytique | 98 | 100 | 96 | 100 |
| Fiche produit démo | 98 | 100 | 96 | 66* |
| Article démo avec vidéo | 100 | 100 | 96 | 66* |
| Contact | 98 | 100 | 96 | 66* |

\*Ces pages sont volontairement exclues des résultats de recherche, ce que Lighthouse compte contre le référencement. Les bonnes pratiques perdent des points pour des erreurs de console qui ne surviennent que dans la copie locale, où le point de terminaison Adobe de remplacement ne tourne pas.

## Accessibilité

- HTML sémantique : repères d’en-tête, de navigation, de contenu principal et de pied de page; un seul titre principal par page; titres dans l’ordre.
- Chaque champ de formulaire a une étiquette visible. Les erreurs nomment le champ et y déplacent le focus, et les messages d’état sont annoncés aux lecteurs d’écran.
- Le focus du clavier est toujours visible.
- L’animation est désactivée pour les personnes qui ont réglé leur appareil pour réduire les mouvements.
- Les illustrations décoratives sont cachées aux lecteurs d’écran; celles qui ont un sens ont un équivalent textuel.
- La progression de la caisse de la boutique démo et les onglets du journal exposent leur état aux technologies d’assistance.
- Chaque page déclare sa langue (`lang="fr-CA"` ou `lang="en-CA"`), pour que les lecteurs d’écran prononcent le texte correctement.

Les notes de 100 viennent de vérifications automatisées, qui ne détectent qu’une partie de ce qui compte. Le site n’a pas encore été testé avec un lecteur d’écran ni révisé à la main selon les WCAG 2.2; c’est dans la liste plus bas.

## Moteurs de recherche (SEO)

- Chaque page a un titre unique et une description rédigée pour les résultats de recherche.
- Des URL canoniques, pour que chaque page ait une seule adresse officielle.
- Un [plan du site](/sitemap.xml) qui liste les pages de contenu avec leur date de mise à jour, et un [robots.txt](/robots.txt) qui y renvoie.
- Des aperçus de partage pour LinkedIn, Slack et X : titre, description et image.
- Un [fil RSS](/rss.xml) pour les billets et les pages de pratique.
- Volontairement exclus de la recherche : la boutique et le site de nouvelles démo (contenu fictif), la page de contact et la page 404.

## Moteurs de réponse IA (AEO)

Les assistants IA répondent de plus en plus directement aux questions au lieu d’envoyer les gens vers des pages. Pour être une source qu’ils peuvent trouver, comprendre et citer :

- **Des données structurées** sur chaque page de contenu (schema.org) : qui l’a écrite, à quel site elle appartient, quand elle a été publiée et mise à jour, ses sujets et sa place dans le site.
- **Un fichier [llms.txt](/llms.txt)**, un guide du site en texte brut pour les outils IA. C’est une proposition informelle plutôt qu’une norme, mais peu coûteuse à fournir. Il indique aussi aux outils IA que les sites démo sont fictifs, pour qu’ils ne soient pas cités comme réels.
- **Une écriture qui répond d’abord** : les pages commencent par la conclusion, utilisent des titres descriptifs et mettent les comparaisons en tableaux.
- **L’accès des robots** : le robots.txt du site permet l’exploration. Cloudflare peut bloquer séparément les robots IA à la périphérie du réseau; les robots de recherche et d’assistants IA permis se règlent dans AI Crawl Control de Cloudflare.

## Confidentialité

- Le formulaire de contact n’expose jamais mon adresse courriel, ni dans la page ni dans le code source. Les messages vont du formulaire à ma boîte de réception par Cloudflare et ne sont conservés nulle part ailleurs.
- Aucune donnée personnelle n’entre dans l’analytique. Le formulaire de contact consigne seulement qu’il a été utilisé et le sujet choisi, et des vérifications automatisées avertissent si un envoi dans la couche de données contient des clés comme `email` ou `phone`.
- La langue du navigateur est une préférence générale, pas une donnée qui identifie quelqu’un; elle est consignée telle quelle (par exemple `fr-CA`), sans autre détail sur l’appareil.
- L’Adobe Web SDK dépose un témoin d’identité, mais sur ce site il contient un identifiant inventé et rien n’est envoyé à Adobe.

## Performance

- Les pages sont du HTML simple généré d’avance : il n’y a rien à calculer quand vous les visitez.
- Les polices du système évitent de télécharger des fichiers de polices.
- Le JavaScript ne se charge que là où une page en a besoin : le panier de la boutique, le suivi vidéo, le formulaire de contact et les balises d’analytique elles-mêmes.

## Reste à faire

- Tester avec un lecteur d’écran et réviser à la main selon les WCAG 2.2.
- Ajouter un avis sur les témoins et le consentement avant la mise en ligne des balises GA4, et le relier aux réglages de consentement dans GTM et le Web SDK.
- Publier la configuration GA4 dans Google Tag Manager.
- Soumettre le plan du site à Google Search Console et à Bing Webmaster Tools.
- Ajouter une page À propos avec mon parcours, pour que les lecteurs et les assistants IA puissent juger de l’expertise derrière les textes.
- Rédiger les pages prévues de la [pratique d’analytique](/fr/practice/).

## Journal des modifications

- **29 octobre 2026, plus tard :** versions françaises de toutes les pages, sélecteur de langue EN | FR, et variables de langue (langue de la page et langue du navigateur) dans les deux couches de données, GA4 et l’Adobe Web SDK.
- **29 octobre 2026 :** lancement du site avec le blogue, la boutique démo et le site de nouvelles démo, les deux couches de données et le journal des événements. Adobe Web SDK avec doublure de l’Edge Network; configuration de Google Tag Manager et de GA4; section pratique d’analytique; page de contact; conventions d’analytique appliquées; plan du site, données structurées et autre travail de SEO et d’AEO; correction des zones tactiles sur mobile; cette page.
