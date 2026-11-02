---
title: Livrables de mise en œuvre
description: "Les documents qui transforment une question d’affaires en balises qui fonctionnent : besoins, référence de conception de la solution (SDR), versions pour les développeurs et pour les utilisateurs d’affaires, spécifications et couche de données."
pubDate: 2026-11-02
category: Livrables de mise en œuvre
tags: [besoins, SDR, spécifications, couche de données, documentation]
platform: Both
---

**Une bonne analytique commence par un document, pas par une balise.** Cette section présente les documents sur lesquels repose une mise en œuvre, remplis pour la boutique et le site de nouvelles démo de ce site, pour que chacun puisse être comparé à ce que les pages envoient réellement.

## La chaîne

Chaque document alimente le suivant. Un changement descend habituellement la chaîne dans cet ordre.

| Étape | Document | Pour qui | Ce qu’il répond |
|---|---|---|---|
| 1 | Besoins d’affaires | Parties prenantes, analystes | Que doit-on savoir, et quelle décision cela éclairera-t-il? |
| 2 | Référence de conception de la solution (SDR) | Analystes, responsable de l’analytique | Quelles variables répondent à chaque besoin, et comment sont-elles configurées dans Adobe (et GA4)? |
| 3 | SDR pour les développeurs | Développeurs | Que doit exposer la page, et pourquoi, en bref? |
| 3 | SDR pour les utilisateurs d’affaires | Utilisateurs des rapports dans Adobe ou GA4 | Que signifie chaque variable, quelles mesures l’accompagnent, et pourquoi est-ce une eVar ou une prop? |
| 4 | Spécification | Le développeur qui la construit, l’assurance qualité | Exactement quoi construire sur une page : une maquette numérotée, chaque élément suivi, son nom de lien et ses données |
| 5 | Document d’assurance qualité | Assurance qualité, responsable de l’analytique | Chaque ligne de la spécification a-t-elle été vérifiée, quand et comment? (Dans [Qualité des données](/fr/qualite-des-donnees/).) |

La SDR existe sous deux formes : une page web pour la lecture et un classeur Excel pour le travail, puisque c’est là que la plupart des équipes tiennent la leur.

## Par où commencer

Lisez-les dans l’ordre : [besoins d’affaires](/fr/mise-en-oeuvre/besoins-d-affaires/) → [SDR](/fr/mise-en-oeuvre/sdr/) ([Excel](/downloads/markdanalytics-sdr-fr.xlsx)) → [pour les développeurs](/fr/mise-en-oeuvre/sdr-developpeurs/) et [pour les utilisateurs d’affaires](/fr/mise-en-oeuvre/sdr-utilisateurs-d-affaires/) → [spécification de la fiche produit](/fr/mise-en-oeuvre/specification-fiche-produit/). Les besoins, la SDR et ses deux versions lisibles sont générés à partir d’un seul fichier de données : ils concordent toujours.
