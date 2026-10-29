// Demo articles for Balsam Daily. Every person, place detail and quote is invented.
export interface Article {
  slug: string;
  section: string;
  headline: string;
  dek: string;
  author: string;
  published: string; // ISO date
  video?: { id: string; title: string; src: string; poster: string; duration: number };
  body: string[];
}

const demoVideo = (id: string, title: string) => ({
  id, title, src: '/media/harbour-demo.mp4', poster: '/media/harbour-demo-poster.jpg', duration: 30,
});

export const articles: Article[] = [
  {
    slug: 'ferry-schedule-shakeup',
    section: 'Transportation',
    headline: 'Island ferry schedule shakeup adds early sailings, drops late-night run',
    dek: 'Commuters gain a 5:40 a.m. departure, but the last boat home leaves 90 minutes earlier starting in January.',
    author: 'Dana Layer',
    published: '2026-10-28',
    video: demoVideo('vid-ferry-001', 'What the new ferry schedule means for commuters'),
    body: [
      'Starting January 6, the first weekday sailing from the island terminal will leave at 5:40 a.m., twenty minutes earlier than today. The change answers years of requests from shift workers who arrive on the mainland just after their start times.',
      'The trade-off is at the other end of the day. The 11:10 p.m. return sailing is being cut, making 9:40 p.m. the last boat home on weeknights.',
      '"We heard loud and clear about mornings," a spokesperson for the fictional operator said. "Late-night ridership has been the lowest on the route for three years running."',
      'Restaurant owners near the terminal say the earlier last sailing will hurt their evening trade. Several plan to raise the issue at next month\'s public meeting.',
      'The full timetable is expected online by mid-November.',
    ],
  },
  {
    slug: 'night-market-returns',
    section: 'Food',
    headline: 'Harbourfront night market returns with 60 vendors and a later closing time',
    dek: 'Organizers say this year\'s market will run until 11 p.m. on Fridays, with a new zone for local bakers.',
    author: "Bounce O'Rately",
    published: '2026-10-27',
    body: [
      'After a one-year pause, the harbourfront night market is back for its winter season, with sixty vendors confirmed for opening weekend.',
      'Friday hours stretch to 11 p.m. this year, an hour later than before. Saturdays still close at 10.',
      'A new bakers\' row will feature eight small producers, most of whom sell only at weekend farmers\' markets.',
      'Entry remains free. Organizers recommend walking or cycling, since the nearest parking lot is under construction until spring.',
    ],
  },
  {
    slug: 'king-tide-warning',
    section: 'Weather',
    headline: 'King tides expected this weekend; low-lying waterfront paths may close',
    dek: 'The highest tides of the year coincide with a Pacific storm system arriving Saturday night.',
    author: 'Evie Varr',
    published: '2026-10-26',
    video: demoVideo('vid-tide-002', 'Watching the king tides roll in'),
    body: [
      'The highest tides of the year arrive this weekend, and forecasters say a storm system could push water higher than usual along exposed shorelines.',
      'City crews may close sections of the waterfront walkway on Saturday and Sunday mornings, when the tide peaks.',
      'Residents in low-lying areas are encouraged to move vehicles and outdoor furniture away from the seawall.',
      'Tide tables suggest peaks just after 8 a.m. both days.',
    ],
  },
  {
    slug: 'library-branch-reopens',
    section: 'Local',
    headline: 'Renovated north-end library branch reopens with a makerspace and longer hours',
    dek: 'The branch now opens at 9 a.m. on weekdays and adds 3D printers, sewing machines and a recording booth.',
    author: "Bounce O'Rately",
    published: '2026-10-24',
    body: [
      'The north-end library branch reopened Monday after an eighteen-month renovation.',
      'The new makerspace includes two 3D printers, four sewing machines and a soundproof booth for recording podcasts. All are free to book with a library card.',
      'Weekday hours now start at 9 a.m., an hour earlier than before the renovation.',
    ],
  },
  {
    slug: 'rowing-club-centennial',
    section: 'Sports',
    headline: 'Rowing club marks 100 years with a regatta and an open boathouse',
    dek: 'Members past and present are invited to row a heritage boat restored for the occasion.',
    author: 'Evie Varr',
    published: '2026-10-22',
    body: [
      'The harbour rowing club turns 100 this year and is celebrating with a regatta on November 14.',
      'The boathouse will be open to the public all day, and former members are invited to take a turn in a restored 1930s four.',
      'Club organizers say the centennial regatta is expected to draw crews from up and down the coast.',
    ],
  },
];

export const getArticle = (slug: string) => articles.find((a) => a.slug === slug);
export const formatNewsDate = (iso: string) =>
  new Date(iso + 'T12:00:00Z').toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

// ---------------------------------------------------------------------------
// French versions, shown on /fr/media/ pages. The data layer keeps the English
// headline and section, so content reports don't split by language;
// page.language says which version the visitor read.
// ---------------------------------------------------------------------------
type Lang = 'en' | 'fr';
const SECTION_FR: Record<string, string> = {
  Transportation: 'Transport', Food: 'Gastronomie', Weather: 'Météo', Local: 'Local', Sports: 'Sports',
};
const ARTICLE_FR: Record<string, { headline: string; dek: string; body: string[]; videoTitle?: string }> = {
  'ferry-schedule-shakeup': {
    headline: 'Nouvel horaire du traversier : départs plus tôt le matin, fin du dernier départ de nuit',
    dek: 'Les navetteurs gagnent un départ à 5 h 40, mais le dernier bateau du soir part 90 minutes plus tôt dès janvier.',
    videoTitle: 'Ce que le nouvel horaire du traversier change pour les navetteurs',
    body: [
      'Dès le 6 janvier, le premier départ en semaine du terminal de l’île aura lieu à 5 h 40, vingt minutes plus tôt qu’aujourd’hui. Le changement répond à des années de demandes de travailleurs de quart qui arrivent sur le continent juste après le début de leur quart.',
      'Le revers de la médaille se trouve en fin de journée. Le départ de retour de 23 h 10 est supprimé : le dernier bateau partira donc à 21 h 40 les soirs de semaine.',
      '« Nous avons bien entendu le message pour le matin », a déclaré un porte-parole de l’exploitant fictif. « Le départ de fin de soirée est le moins achalandé de la liaison depuis trois ans. »',
      'Les restaurateurs près du terminal estiment que l’heure de départ plus hâtive nuira à leur clientèle du soir. Plusieurs comptent soulever la question à la séance publique du mois prochain.',
      'L’horaire complet devrait être publié en ligne d’ici la mi-novembre.',
    ],
  },
  'night-market-returns': {
    headline: 'Le marché de nuit du port revient avec 60 exposants et une fermeture plus tardive',
    dek: 'Les organisateurs annoncent une ouverture jusqu’à 23 h le vendredi et une nouvelle zone pour les boulangers locaux.',
    body: [
      'Après une pause d’un an, le marché de nuit du port revient pour sa saison d’hiver, avec soixante exposants confirmés pour la fin de semaine d’ouverture.',
      'Le vendredi, le marché restera ouvert jusqu’à 23 h, soit une heure de plus qu’avant. Le samedi, il ferme toujours à 22 h.',
      'Une nouvelle allée des boulangers réunira huit petits producteurs, dont la plupart ne vendent qu’aux marchés fermiers de fin de semaine.',
      'L’entrée reste gratuite. Les organisateurs recommandent de venir à pied ou à vélo, puisque le stationnement le plus proche est en travaux jusqu’au printemps.',
    ],
  },
  'king-tide-warning': {
    headline: 'Grandes marées prévues cette fin de semaine; des sentiers riverains pourraient fermer',
    dek: 'Les plus hautes marées de l’année coïncident avec l’arrivée d’un système dépressionnaire du Pacifique samedi soir.',
    videoTitle: 'Les grandes marées en images',
    body: [
      'Les plus hautes marées de l’année arrivent cette fin de semaine, et les prévisionnistes avertissent qu’une tempête pourrait faire monter l’eau plus haut que d’habitude sur les rives exposées.',
      'Les équipes municipales pourraient fermer des tronçons de la promenade riveraine samedi et dimanche matin, au moment où la marée atteint son sommet.',
      'Les résidents des secteurs bas sont invités à déplacer leurs véhicules et leurs meubles de jardin loin de la digue.',
      'Selon les tables des marées, les pics auront lieu peu après 8 h les deux jours.',
    ],
  },
  'library-branch-reopens': {
    headline: 'La succursale rénovée de la bibliothèque du nord rouvre avec un laboratoire créatif et des heures prolongées',
    dek: 'La succursale ouvre désormais à 9 h en semaine et ajoute des imprimantes 3D, des machines à coudre et une cabine d’enregistrement.',
    body: [
      'La succursale du nord de la bibliothèque a rouvert lundi après dix-huit mois de rénovations.',
      'Le nouveau laboratoire créatif compte deux imprimantes 3D, quatre machines à coudre et une cabine insonorisée pour enregistrer des balados. Tout est réservable gratuitement avec une carte de bibliothèque.',
      'En semaine, la succursale ouvre maintenant à 9 h, une heure plus tôt qu’avant les rénovations.',
    ],
  },
  'rowing-club-centennial': {
    headline: 'Le club d’aviron célèbre ses 100 ans avec une régate et des portes ouvertes',
    dek: 'Membres actuels et anciens sont invités à ramer à bord d’un bateau d’époque restauré pour l’occasion.',
    body: [
      'Le club d’aviron du port fête ses 100 ans cette année et souligne l’occasion avec une régate le 14 novembre.',
      'Le hangar à bateaux sera ouvert au public toute la journée, et les anciens membres pourront prendre place à bord d’un quatre de pointe des années 1930 restauré.',
      'Les organisateurs s’attendent à ce que la régate du centenaire attire des équipages de toute la côte.',
    ],
  },
};

/** What a visitor reads, in their language. */
export const articleText = (a: Article, lang: Lang) => {
  const fr = lang === 'fr' ? ARTICLE_FR[a.slug] : undefined;
  return {
    headline: fr?.headline ?? a.headline,
    dek: fr?.dek ?? a.dek,
    body: fr?.body ?? a.body,
    section: lang === 'fr' ? SECTION_FR[a.section] ?? a.section : a.section,
    videoTitle: a.video ? (fr?.videoTitle ?? a.video.title) : undefined,
  };
};
export const newsDate = (iso: string, lang: Lang) =>
  new Date(iso + 'T12:00:00Z').toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
