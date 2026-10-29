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
    author: 'Priya Natarajan',
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
    author: 'Marcus Lee',
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
    author: 'Hannah Okafor',
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
    author: 'Marcus Lee',
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
    author: 'Hannah Okafor',
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
