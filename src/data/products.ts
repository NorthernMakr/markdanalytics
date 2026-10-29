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
