/**
 * THE COPY. Transcribed verbatim from docs/MASTER_PROMPT.md §8.
 *
 * Master prompt §2: "No fake data." §12.9: "All copy matches section 8 exactly."
 * Do not reword, retitle, or 'improve' anything in this file. If the brand
 * changes its wording, change MASTER_PROMPT.md first, then this file, then the
 * fixture in copy.fidelity.test.ts — in that order.
 */

import type {
  ContactSubject,
  Credential,
  JourneyStep,
  NavLink,
  PackagingBlurb,
  Product,
  Sdg,
  Testimonial,
} from './types';

/* ------------------------------------------------------------------ brand -- */

export const brand = {
  name: 'willow coffee',
  tagline: 'warm coffee, grown with nature',
  email: 'info@willowscoffee.co.ke',
  location: 'Nandi Hills, Rift Valley, Kenya',
  copyright: '© 2025 Willow Coffee Ltd',
  /** PLACEHOLDER from master prompt §8. Replace before launch. See docs/LAUNCH_CHECKLIST.md. */
  whatsappNumber: '254700000000',
} as const;

export const meta = {
  title: 'willow coffee — warm coffee, grown with nature',
  /**
   * §11 says to carry over "the existing meta description" — it was never supplied.
   * This is a PLACEHOLDER built only from facts stated elsewhere in §8; it invents
   * no new claim. Confirm or replace before launch (docs/LAUNCH_CHECKLIST.md).
   */
  description:
    'Specialty single-origin arabica from Kenya’s North Rift. Hand-picked at 2,100m in Nandi Hills and Kitale, small-batch roasted, packaged for retail, wholesale and export.',
  keywords: [
    'Kenyan coffee',
    'North Rift coffee',
    'specialty arabica',
    'Nandi Hills coffee',
    'single origin',
    'wholesale coffee Kenya',
  ],
} as const;

/* -------------------------------------------------------------------- nav -- */

export const nav: readonly NavLink[] = [
  { target: 'origin', label: 'our story' },
  { target: 'journey', label: 'our journey' },
  { target: 'product', label: 'the coffee' },
  { target: 'contact', label: 'contact' },
] as const;

/* ---------------------------------------------------------- act 1 — hero -- */

export const hero = {
  eyebrow: 'North Rift Kenya · grown with nature',
  h1: 'Where the Highlands Meet Your Cup',
  sub: 'a contemporary coffee brand inspired by the relationship between coffee, nature and the places where it’s grown. hand-picked. small-batch roasted. packaged for retail and export.',
  primaryCta: { label: 'explore our coffee', target: 'product' },
  secondaryCta: { label: 'our story', target: 'origin' },
} as const;

/* -------------------------------------------------------- act 2 — origin -- */

export const origin = {
  eyebrow: 'Our Origin',
  h2: 'from the rift valley’s red soil to your morning ritual',
  body: [
    'The North Rift is where Kenya’s world-champion runners train in thin highland air. It is also where Willow Coffee grows, in the same volcanic red soil, at the same high altitude, nurtured by the same ethic of relentless excellence.',
    'Our coffee is not blended. It is not generic “Kenyan.” It is traceable to specific farms in Nandi Hills and Kitale, land our farming families have tended for generations, where every cherry is selected by hand.',
  ],
  stats: ['2,100m Altitude', 'Hand-Picked Every Cherry', 'North Rift Single Origin'],
} as const;

/* ------------------------------------------------------- act 3 — journey -- */

export const journey = {
  eyebrow: 'The Journey',
  h2: 'from flower to cup, every step, traced',
} as const;

export const journeySteps: readonly JourneyStep[] = [
  {
    number: '01',
    stage: 'Growing',
    title: 'Slow Ripening at High Altitude',
    body: 'Our arabica cherries ripen for 9 to 11 months at 2,100m. The cool nights and equatorial sun build layered sweetness and bright acidity that define North Rift character.',
  },
  {
    number: '02',
    stage: 'Harvesting',
    title: 'Selected by Hand, Cherry by Cherry',
    body: 'No machine stripping. No compromise. Our farming families walk the rows and pick only the deepest red cherries at peak ripeness, a process that takes skill honed over generations.',
  },
  {
    number: '03',
    stage: 'Processing',
    title: 'Washed & Sun-Dried on Raised Beds',
    body: 'Cherries are pulped and fermented using clean mountain water, then laid on raised drying beds for 18 to 21 days. This washed process preserves clean, complex flavour clarity.',
  },
  {
    number: '04',
    stage: 'Roasting',
    title: 'Small-Batch Roasted to Order',
    body: 'We roast in small batches, never pre-roasting for stock, so every bag reaches you within days of roasting, at the peak of freshness and flavour complexity.',
  },
] as const;

/* ------------------------------------------------------- act 4 — product -- */

export const product = {
  eyebrow: 'Our Packaging',
  h2: 'north rift coffee, ready to shelf',
  intro:
    'premium single-origin coffee in branded retail pouches and wholesale bulk bags. Available 250g to 10kg. Private label and custom packaging on request.',
} as const;

export const products: readonly Product[] = [
  {
    id: 'willow-aa-retail-pouch',
    name: 'willow aa retail pouch',
    badge: 'RETAIL',
    notes: ['Jasmine', 'Blackcurrant', 'Citrus'],
    description:
      'Our flagship retail product. Packaged in resealable kraft pouches with a one-way degassing valve. Ready for specialty store shelves. Min. wholesale: 20 units.',
    weights: ['250g', '500g', '1kg'],
    grinds: ['Whole Bean', 'Coarse', 'Fine', 'Espresso'],
  },
  {
    id: 'willow-ab-premium-pouch',
    name: 'willow ab premium pouch',
    badge: 'RETAIL',
    notes: ['Dark Cherry', 'Brown Sugar', 'Hazelnut'],
    description:
      'Our bestselling packaged product. Matte-finish branded pouch ideal for supermarket shelf, café resale, or corporate gifting. Available as private label.',
    weights: ['250g', '500g', '1kg', '2kg'],
    grinds: ['Whole Bean', 'Coarse', 'Fine', 'Espresso'],
  },
  {
    id: 'willow-peaberry-limited-tin-tie',
    name: 'willow peaberry limited tin-tie',
    badge: 'LIMITED',
    notes: ['Tropical Fruit', 'Honey', 'Winey'],
    description:
      'Rare single-seed cherry, packaged in a premium foil tin-tie bag with origin certificate. Perfect for gift shops and high-end hospitality. Seasonal batches.',
    weights: ['250g', '500g'],
    grinds: ['Whole Bean', 'Coarse', 'Fine', 'Espresso'],
  },
  {
    id: 'willow-wholesale-bulk-bag',
    name: 'willow wholesale bulk bag',
    badge: 'WHOLESALE',
    description:
      'For cafés, hotels, restaurants, and distributors. Available in 2kg, 5kg, and 10kg bags, unbranded, roasted whole bean, or ground to spec. We supply across Kenya and export to East Africa.',
    weights: ['2kg', '5kg', '10kg'],
    grinds: ['Whole Bean', 'Custom Grind', 'Green Bean (unroasted)'],
  },
] as const;

/**
 * §8 gives these as a title plus a parenthetical detail, not as full sentences.
 * The bodies below carry ONLY that supplied detail — no new claims are invented
 * (§2, "No fake data"). If the brand wants fuller blurbs, it must supply the words.
 */
export const packagingBlurbs: readonly PackagingBlurb[] = [
  {
    title: 'Retail-Ready Packaging',
    body: 'Resealable kraft pouches with a one-way degassing valve, ready for specialty store shelves.',
  },
  {
    title: 'Private Label Available',
    body: 'Min. 50 units.',
  },
  {
    title: 'Export Packaging',
    body: 'Jute sacks, GrainPro-lined bags, and vacuum-sealed pouches for EU, US, and GCC markets.',
  },
] as const;

/* ------------------------------------------------------- act 5 — quality -- */

export const quality = {
  eyebrow: 'Quality & Credentials',
  h2: 'trusted from farm to export',
  intro:
    'Our coffee meets the highest international standards, graded, tested, and certified for quality you can taste and verify.',
  dossierCta: 'Request Our Quality Dossier',
  dossierAlt: 'Or ask on WhatsApp',
} as const;

export const credentials: readonly Credential[] = [
  {
    title: 'Kenya Coffee Board',
    body: 'Licensed and registered with the Kenya Coffee Board. All our lots are officially graded before export.',
  },
  {
    title: 'KEBS Certified',
    body: 'Kenya Bureau of Standards certification ensures every batch meets national and international food safety standards.',
  },
  {
    title: 'Export Ready',
    body: 'Cleared for export to EU, US, and Middle East markets. Full documentation, phytosanitary certificates, and traceability records available on request.',
  },
] as const;

export const sdgs: readonly Sdg[] = [
  { number: '01', label: 'No Poverty' },
  { number: '08', label: 'Decent Work' },
  { number: '12', label: 'Responsible Consumption' },
  { number: '13', label: 'Climate Action' },
] as const;

export const testimonials: readonly Testimonial[] = [
  {
    quote:
      'The North Rift character is unmistakable, that altitude-driven brightness, the clean finish. We’ve been sourcing Willow AA for two years and our customers ask for it by name.',
    name: 'Thomas K.',
    role: 'Specialty Roaster',
    place: 'Nairobi',
  },
  {
    quote:
      'What sets Willow apart is the traceability. I know the farm, I know the processing lot, I know the drying time. That transparency is increasingly what my buyers in London demand.',
    name: 'Sarah M.',
    role: 'Green Coffee Buyer',
    place: 'UK',
  },
  {
    quote:
      'I ordered the Peaberry on a whim and it completely changed my morning routine. Complex, sweet, and unlike anything I’d had from Kenya before. Now I subscribe.',
    name: 'Amina W.',
    role: 'Home Barista',
    place: 'Nairobi',
  },
  {
    quote:
      'We serve Willow AB in our café and our customers consistently rate it as the best filter coffee on our menu. The medium roast hits that perfect balance.',
    name: 'David O.',
    role: 'Café Owner',
    place: 'Eldoret',
  },
] as const;

/* ---------------------------------------------------------------- footer -- */

export const contactSubjects: readonly ContactSubject[] = [
  { value: 'order', label: 'Order Enquiry' },
  { value: 'wholesale', label: 'Wholesale / Bulk Order' },
  { value: 'private-label', label: 'Private Label Enquiry' },
  { value: 'export', label: 'Export Partnership' },
  { value: 'general', label: 'General' },
] as const;

export const footer = {
  quickLinksTitle: 'quick links',
  coffeesTitle: 'our coffees',
  contactTitle: 'contact',
  whatsappLabel: 'order on whatsapp',
  quickLinks: [
    { target: 'origin', label: 'our story' },
    { target: 'product', label: 'the coffee' },
    { target: 'journey', label: 'our journey' },
    { target: 'contact', label: 'contact' },
  ] as readonly NavLink[],
} as const;
