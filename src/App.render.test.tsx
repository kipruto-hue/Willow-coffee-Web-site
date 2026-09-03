import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LiteApp } from './lite/LiteApp';
import { brand, hero, products } from './content/site';

/**
 * Smoke test for the lite path — which is also exactly what the build-time
 * prerender emits (scripts/prerender.ts), so this asserts the bytes a crawler
 * and a low-tier phone actually receive.
 *
 * Two jobs. First, a blank page is the failure mode nobody notices until it is
 * live — this fails the build if the tree throws while rendering. Second, it
 * proves §10's promise that the no-WebGL path carries the same copy, the same
 * products and the same CTAs, with no browser and no JavaScript executed.
 *
 * Effects do not run here, so this checks reachability of content, not behaviour.
 */
const html = renderToStaticMarkup(<LiteApp />);

describe('the site renders as static HTML', () => {
  it('renders without throwing and produces real markup', () => {
    expect(html.length).toBeGreaterThan(4000);
  });

  it('exposes the hero copy to a crawler that never runs JS', () => {
    expect(html).toContain(hero.h1);
    expect(html).toContain(hero.eyebrow);
  });

  it('exposes every product name and description', () => {
    for (const item of products) {
      expect(html).toContain(item.name);
      expect(html).toContain(item.description);
    }
  });

  it('keeps an order CTA in the markup itself, not behind an interaction', () => {
    // §2: the order affordance is never more than one action away.
    expect(html).toContain(`https://wa.me/${brand.whatsappNumber}`);
  });

  it('ships the Organization and Product structured data inline', () => {
    expect(html).toContain('application/ld+json');
    expect(html).toContain('"@type":"Organization"');
    expect(html).toContain('"@type":"Product"');
  });

  it('has a skip link and a labelled main region', () => {
    expect(html).toContain('skip-link');
    expect(html).toContain('id="content"');
  });
});
