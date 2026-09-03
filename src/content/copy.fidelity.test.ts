import { describe, expect, it } from 'vitest';
import {
  credentials,
  hero,
  journeySteps,
  origin,
  product,
  products,
  quality,
  testimonials,
} from './site';

/**
 * COPY FIDELITY (build plan D2, master prompt §12.9: "All copy matches section 8
 * exactly").
 *
 * The strings below are transcribed from docs/MASTER_PROMPT.md §8 independently
 * of site.ts. If someone edits a headline, drops a tasting note, or "tidies" a
 * testimonial, this fails. That is the whole job: four consumers read site.ts —
 * the WebGL path, the lite path, the prerender, and the JSON-LD — and none of
 * them would notice drift on its own.
 *
 * Typography is normalised before comparison: the brief is plain text, the site
 * sets curly quotes and apostrophes. Punctuation SHAPE is a design choice;
 * punctuation PRESENCE and every word are not.
 */
const normalise = (s: string) =>
  s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

const matches = (actual: string, expected: string) =>
  expect(normalise(actual)).toBe(normalise(expected));

describe('Act 1 — Hero', () => {
  it('keeps the eyebrow, headline and sub verbatim', () => {
    matches(hero.eyebrow, 'North Rift Kenya · grown with nature');
    matches(hero.h1, 'Where the Highlands Meet Your Cup');
    matches(
      hero.sub,
      "a contemporary coffee brand inspired by the relationship between coffee, nature and the places where it's grown. hand-picked. small-batch roasted. packaged for retail and export.",
    );
  });

  it('keeps the two button labels and their targets', () => {
    matches(hero.primaryCta.label, 'explore our coffee');
    expect(hero.primaryCta.target).toBe('product');
    matches(hero.secondaryCta.label, 'our story');
    expect(hero.secondaryCta.target).toBe('origin');
  });
});

describe('Act 2 — Origin', () => {
  it('keeps both body paragraphs verbatim', () => {
    matches(origin.h2, "from the rift valley's red soil to your morning ritual");
    matches(
      origin.body[0] ?? '',
      "The North Rift is where Kenya's world-champion runners train in thin highland air. It is also where Willow Coffee grows, in the same volcanic red soil, at the same high altitude, nurtured by the same ethic of relentless excellence.",
    );
    matches(
      origin.body[1] ?? '',
      'Our coffee is not blended. It is not generic "Kenyan." It is traceable to specific farms in Nandi Hills and Kitale, land our farming families have tended for generations, where every cherry is selected by hand.',
    );
  });

  it('keeps all three stat chips', () => {
    expect(origin.stats.map(normalise)).toEqual([
      '2,100m Altitude',
      'Hand-Picked Every Cherry',
      'North Rift Single Origin',
    ]);
  });
});

describe('Act 3 — The Journey', () => {
  it('has four steps in order with their exact titles', () => {
    expect(journeySteps.map((s) => `${s.number} ${s.stage} — ${s.title}`)).toEqual([
      '01 Growing — Slow Ripening at High Altitude',
      '02 Harvesting — Selected by Hand, Cherry by Cherry',
      '03 Processing — Washed & Sun-Dried on Raised Beds',
      '04 Roasting — Small-Batch Roasted to Order',
    ]);
  });

  it('keeps the numbers inside the step copy, which are factual claims', () => {
    expect(journeySteps[0]?.body).toContain('9 to 11 months at 2,100m');
    expect(journeySteps[2]?.body).toContain('18 to 21 days');
  });
});

describe('Act 4 — The Product', () => {
  it('lists exactly the four products from §8, in order', () => {
    expect(products.map((p) => p.name)).toEqual([
      'willow aa retail pouch',
      'willow ab premium pouch',
      'willow peaberry limited tin-tie',
      'willow wholesale bulk bag',
    ]);
  });

  it('keeps each product badge, weights and grinds exactly', () => {
    const [aa, ab, peaberry, bulk] = products;

    expect(aa?.badge).toBe('RETAIL');
    expect(aa?.notes).toEqual(['Jasmine', 'Blackcurrant', 'Citrus']);
    expect(aa?.weights).toEqual(['250g', '500g', '1kg']);
    expect(aa?.grinds).toEqual(['Whole Bean', 'Coarse', 'Fine', 'Espresso']);

    expect(ab?.badge).toBe('RETAIL');
    expect(ab?.notes).toEqual(['Dark Cherry', 'Brown Sugar', 'Hazelnut']);
    expect(ab?.weights).toEqual(['250g', '500g', '1kg', '2kg']);

    expect(peaberry?.badge).toBe('LIMITED');
    expect(peaberry?.notes).toEqual(['Tropical Fruit', 'Honey', 'Winey']);
    expect(peaberry?.weights).toEqual(['250g', '500g']);

    expect(bulk?.badge).toBe('WHOLESALE');
    // The wholesale bag is unbranded — §8 gives it no tasting notes, and
    // inventing some would be exactly the fake data §2 forbids.
    expect(bulk?.notes).toBeUndefined();
    expect(bulk?.weights).toEqual(['2kg', '5kg', '10kg']);
    expect(bulk?.grinds).toEqual(['Whole Bean', 'Custom Grind', 'Green Bean (unroasted)']);
  });

  it('keeps the minimum-order figures, which are commercial commitments', () => {
    expect(products[0]?.description).toContain('Min. wholesale: 20 units.');
    matches(product.h2, 'north rift coffee, ready to shelf');
  });
});

describe('Act 5 — Quality and testimonials', () => {
  it('keeps the three credentials verbatim', () => {
    expect(credentials.map((c) => c.title)).toEqual([
      'Kenya Coffee Board',
      'KEBS Certified',
      'Export Ready',
    ]);
    matches(
      credentials[0]?.body ?? '',
      'Licensed and registered with the Kenya Coffee Board. All our lots are officially graded before export.',
    );
  });

  it('keeps all four testimonials with the right attribution', () => {
    expect(testimonials.map((t) => `${t.name} · ${t.role} · ${t.place}`)).toEqual([
      'Thomas K. · Specialty Roaster · Nairobi',
      'Sarah M. · Green Coffee Buyer · UK',
      'Amina W. · Home Barista · Nairobi',
      'David O. · Café Owner · Eldoret',
    ]);
    matches(
      testimonials[3]?.quote ?? '',
      'We serve Willow AB in our café and our customers consistently rate it as the best filter coffee on our menu. The medium roast hits that perfect balance.',
    );
  });

  it('keeps the dossier CTA labels', () => {
    matches(quality.dossierCta, 'Request Our Quality Dossier');
    matches(quality.dossierAlt, 'Or ask on WhatsApp');
  });
});
