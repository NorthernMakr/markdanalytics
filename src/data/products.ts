// Demo catalog for Taiga Supply Co. Everything here is invented.
export type ArtKind = 'pack' | 'jacket' | 'bottle' | 'tent' | 'mug' | 'beanie' | 'lantern' | 'drybag';

export interface Product {
  sku: string;
  slug: string;
  name: string;
  brand: string;
  category: string;     // GA4 item_category
  subcategory: string;  // GA4 item_category2
  price: number;        // CAD
  colours: { name: string; hex: string }[];
  art: ArtKind;
  blurb: string;
  details: string[];
  badge?: string;
}

export const categories = [
  { slug: 'packs', name: 'Packs & bags' },
  { slug: 'apparel', name: 'Apparel' },
  { slug: 'camp', name: 'Camp' },
];

export const products: Product[] = [
  {
    sku: 'TG-PK-101', slug: 'tidepool-daypack', name: 'Tidepool daypack', brand: 'Taiga',
    category: 'packs', subcategory: 'daypacks', price: 129,
    colours: [{ name: 'Kelp', hex: '#2F5D46' }, { name: 'Buoy', hex: '#E0682B' }, { name: 'Fog', hex: '#9AA9A2' }],
    art: 'pack', badge: 'Best seller',
    blurb: 'A 22-litre pack sized for ferry days and forest trails.',
    details: ['22 L capacity', 'Recycled 420D nylon', 'Padded laptop sleeve fits 15"', 'Weight 640 g'],
  },
  {
    sku: 'TG-PK-102', slug: 'breakwater-dry-bag', name: 'Breakwater dry bag', brand: 'Taiga',
    category: 'packs', subcategory: 'dry bags', price: 42,
    colours: [{ name: 'Buoy', hex: '#E0682B' }, { name: 'Sound', hex: '#2E5E7E' }],
    art: 'drybag',
    blurb: 'Roll-top, fully taped seams, and a strap for the kayak deck.',
    details: ['15 L capacity', 'Welded TPU seams', 'Roll-top closure with buckle', 'Weight 210 g'],
  },
  {
    sku: 'TG-AP-201', slug: 'squall-rain-shell', name: 'Squall rain shell', brand: 'Taiga',
    category: 'apparel', subcategory: 'jackets', price: 245,
    colours: [{ name: 'Sound', hex: '#2E5E7E' }, { name: 'Kelp', hex: '#2F5D46' }, { name: 'Buoy', hex: '#E0682B' }],
    art: 'jacket', badge: 'New',
    blurb: 'Three-layer waterproof shell built for sideways west-coast rain.',
    details: ['3-layer waterproof membrane', 'Pit zips', 'Helmet-compatible hood', 'Packs into its own pocket'],
  },
  {
    sku: 'TG-AP-202', slug: 'harbour-wool-beanie', name: 'Harbour wool beanie', brand: 'Taiga',
    category: 'apparel', subcategory: 'accessories', price: 34,
    colours: [{ name: 'Buoy', hex: '#E0682B' }, { name: 'Fog', hex: '#9AA9A2' }, { name: 'Sound', hex: '#2E5E7E' }],
    art: 'beanie',
    blurb: 'Merino rib-knit with a fold-up cuff.',
    details: ['100% merino wool', 'One size', 'Knit in Canada'],
  },
  {
    sku: 'TG-CP-301', slug: 'cove-two-person-tent', name: 'Cove two-person tent', brand: 'Taiga',
    category: 'camp', subcategory: 'shelters', price: 389,
    colours: [{ name: 'Kelp', hex: '#2F5D46' }, { name: 'Sand', hex: '#C9A86A' }],
    art: 'tent',
    blurb: 'Freestanding, two doors, and pitches in under five minutes.',
    details: ['Sleeps 2', 'Packed weight 1.9 kg', 'Two doors, two vestibules', 'Colour-coded poles'],
  },
  {
    sku: 'TG-CP-302', slug: 'lighthouse-lantern', name: 'Lighthouse lantern', brand: 'Taiga',
    category: 'camp', subcategory: 'lighting', price: 58,
    colours: [{ name: 'Sand', hex: '#C9A86A' }, { name: 'Sound', hex: '#2E5E7E' }],
    art: 'lantern',
    blurb: 'Rechargeable USB-C lantern with a warm, dimmable glow.',
    details: ['300 lumens max', 'Up to 40 hours on low', 'USB-C charging', 'Water-resistant'],
  },
  {
    sku: 'TG-CP-303', slug: 'galley-enamel-mug', name: 'Galley enamel mug', brand: 'Taiga',
    category: 'camp', subcategory: 'kitchen', price: 22,
    colours: [{ name: 'Fog', hex: '#9AA9A2' }, { name: 'Buoy', hex: '#E0682B' }],
    art: 'mug',
    blurb: 'Steel enamel mug that survives being dropped on a beach.',
    details: ['350 ml', 'Enamel-coated steel', 'Stove-safe'],
  },
  {
    sku: 'TG-CP-304', slug: 'current-insulated-bottle', name: 'Current insulated bottle', brand: 'Taiga',
    category: 'camp', subcategory: 'hydration', price: 39,
    colours: [{ name: 'Sound', hex: '#2E5E7E' }, { name: 'Kelp', hex: '#2F5D46' }, { name: 'Sand', hex: '#C9A86A' }],
    art: 'bottle', badge: 'Best seller',
    blurb: 'Keeps coffee hot through a full morning on the water.',
    details: ['750 ml', 'Double-wall vacuum insulation', 'Hot 12 h, cold 24 h', 'Leak-proof lid'],
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;
export const money = (n: number) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(n);

// ---------------------------------------------------------------------------
// French copy. Shown to visitors on /fr/ pages only: analytics always receives
// the English product name, category and colour, so reports don't split by
// language. page.language says which language the visitor saw.
// ---------------------------------------------------------------------------
type Lang = 'en' | 'fr';

const CATEGORY_FR: Record<string, string> = { packs: 'Sacs', apparel: 'Vêtements', camp: 'Camping' };
const COLOUR_FR: Record<string, string> = { Kelp: 'Varech', Buoy: 'Bouée', Fog: 'Brume', Sound: 'Détroit', Sand: 'Sable' };
const BADGE_FR: Record<string, string> = { 'Best seller': 'Meilleur vendeur', New: 'Nouveau' };

const PRODUCT_FR: Record<string, { name: string; blurb: string; details: string[] }> = {
  'tidepool-daypack': {
    name: 'Sac de jour Tidepool',
    blurb: 'Un sac de 22 litres taillé pour les journées de traversier et les sentiers en forêt.',
    details: ['Capacité de 22 L', 'Nylon 420D recyclé', 'Pochette rembourrée pour portable de 15 po', 'Poids : 640 g'],
  },
  'breakwater-dry-bag': {
    name: 'Sac étanche Breakwater',
    blurb: 'Fermeture enroulable, coutures entièrement scellées et une sangle pour le pont du kayak.',
    details: ['Capacité de 15 L', 'Coutures en TPU soudées', 'Fermeture enroulable à boucle', 'Poids : 210 g'],
  },
  'squall-rain-shell': {
    name: 'Coquille imperméable Squall',
    blurb: 'Une coquille imperméable trois couches, faite pour la pluie à l’horizontale de la côte Ouest.',
    details: ['Membrane imperméable trois couches', 'Fermetures d’aération sous les bras', 'Capuchon compatible avec un casque', 'Se range dans sa propre poche'],
  },
  'harbour-wool-beanie': {
    name: 'Tuque en laine Harbour',
    blurb: 'Tricot côtelé en mérinos, avec un revers.',
    details: ['100 % laine mérinos', 'Taille unique', 'Tricotée au Canada'],
  },
  'cove-two-person-tent': {
    name: 'Tente deux places Cove',
    blurb: 'Autoportante, deux portes, et montée en moins de cinq minutes.',
    details: ['2 places', 'Poids emballée : 1,9 kg', 'Deux portes, deux vestibules', 'Arceaux codés par couleur'],
  },
  'lighthouse-lantern': {
    name: 'Lanterne Lighthouse',
    blurb: 'Lanterne rechargeable USB-C à lumière chaude et réglable.',
    details: ['300 lumens au maximum', 'Jusqu’à 40 heures en mode faible', 'Recharge USB-C', 'Résistante à l’eau'],
  },
  'galley-enamel-mug': {
    name: 'Tasse émaillée Galley',
    blurb: 'Une tasse en acier émaillé qui survit à une chute sur la plage.',
    details: ['350 ml', 'Acier émaillé', 'Va sur le réchaud'],
  },
  'current-insulated-bottle': {
    name: 'Bouteille isotherme Current',
    blurb: 'Garde le café chaud toute une matinée sur l’eau.',
    details: ['750 ml', 'Double paroi isolée sous vide', 'Chaud 12 h, froid 24 h', 'Couvercle étanche'],
  },
};

/** What a visitor sees for a product, in their language. */
export const productText = (p: Product, lang: Lang) => {
  const fr = lang === 'fr' ? PRODUCT_FR[p.slug] : undefined;
  return {
    name: fr?.name ?? p.name,
    blurb: fr?.blurb ?? p.blurb,
    details: fr?.details ?? p.details,
    badge: p.badge ? (lang === 'fr' ? BADGE_FR[p.badge] ?? p.badge : p.badge) : undefined,
  };
};
export const categoryLabel = (slug: string, lang: Lang) =>
  lang === 'fr' ? CATEGORY_FR[slug] ?? categoryName(slug) : categoryName(slug);
export const colourLabel = (colour: string, lang: Lang) => (lang === 'fr' ? COLOUR_FR[colour] ?? colour : colour);
