import { brand } from '../content/site';

/**
 * WhatsApp is the whole order flow (master prompt §3: no cart, no checkout).
 * Every CTA on the site funnels through here so the number lives in exactly one
 * place when it is swapped for the live one before launch.
 */
export function whatsappLink(message: string): string {
  return `https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/** Generic "order" CTA — the sticky button and the nav. */
export function generalOrderLink(): string {
  return whatsappLink(
    `Hello Willow Coffee, I'd like to place an order. Could you share availability and pricing?`,
  );
}

/**
 * Product CTA with the shopper's actual selection prefilled (§12.5: the order
 * link carries product context from Act 4).
 */
export function productOrderLink(opts: {
  product: string;
  weight: string;
  grind: string;
}): string {
  return whatsappLink(
    `Hello Willow Coffee, I'd like to order:\n\n` +
      `Product: ${opts.product}\n` +
      `Size: ${opts.weight}\n` +
      `Grind: ${opts.grind}\n\n` +
      `Could you confirm availability and pricing?`,
  );
}

/** Wholesale / bulk enquiry, used by the quality-dossier CTA's WhatsApp alternative. */
export function dossierLink(): string {
  return whatsappLink(
    `Hello Willow Coffee, I'd like to request your quality dossier and export documentation.`,
  );
}
