import { useRef, useState } from 'react';
import { packagingBlurbs, product, products } from '../content/site';
import type { Product } from '../content/types';
import { productOrderLink } from '../lib/whatsapp';
import { SectionLink } from './SectionLink';
import { useActProgress } from '../scroll/useScrollProgress';

/**
 * Act 4 — The Product (master prompt §8).
 *
 * This is where the site earns its keep, so it is the calmest and the most
 * ordinary: plain radio groups, real anchors, no motion in the way of a tap.
 * The selection feeds the wa.me prefill (§12.5).
 */
function ProductCard({ item }: { item: Product }) {
  const [weight, setWeight] = useState(item.weights[0] ?? '');
  const [grind, setGrind] = useState(item.grinds[0] ?? '');

  const orderHref = productOrderLink({ product: item.name, weight, grind });

  return (
    <article className="card" aria-labelledby={`${item.id}-title`}>
      <div className="card__head">
        <h3 id={`${item.id}-title`}>{item.name}</h3>
        <span className="badge" data-kind={item.badge}>
          {item.badge}
        </span>
      </div>

      {item.notes && (
        <ul className="card__notes" aria-label="Tasting notes">
          {item.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}

      <p>{item.description}</p>

      <div className="card__options">
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="option__label">Size</legend>
          <div className="chips">
            {item.weights.map((w) => (
              <label key={w} className="chip">
                <input
                  type="radio"
                  name={`${item.id}-weight`}
                  value={w}
                  checked={weight === w}
                  onChange={() => setWeight(w)}
                />
                <span>{w}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="option__label">Grind</legend>
          <div className="chips">
            {item.grinds.map((g) => (
              <label key={g} className="chip">
                <input
                  type="radio"
                  name={`${item.id}-grind`}
                  value={g}
                  checked={grind === g}
                  onChange={() => setGrind(g)}
                />
                <span>{g}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="card__actions">
        <a
          className="btn btn--whatsapp"
          href={orderHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          Order via WhatsApp
          <span className="visually-hidden">
            {` — ${item.name}, ${weight}, ${grind}`}
          </span>
        </a>
        <SectionLink target="contact" className="btn btn--ghost">
          Request Wholesale Quote
        </SectionLink>
      </div>
    </article>
  );
}

export function Products() {
  const ref = useRef<HTMLElement>(null);
  useActProgress('product', ref);

  return (
    <section id="product" ref={ref} className="act product" aria-labelledby="product-title">
      <div className="shell">
        <p className="eyebrow">{product.eyebrow}</p>
        <h2 id="product-title" className="h-act" style={{ marginBlockStart: 'var(--space-s)' }}>
          {product.h2}
        </h2>
        <p className="lede measure" style={{ marginBlockStart: 'var(--space-m)' }}>
          {product.intro}
        </p>

        <div className="product__grid">
          {products.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>

        <div className="packaging">
          {packagingBlurbs.map((blurb) => (
            <div key={blurb.title}>
              <h3>{blurb.title}</h3>
              <p>{blurb.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
