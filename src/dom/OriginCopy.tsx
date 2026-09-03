import { useRef } from 'react';
import { origin } from '../content/site';
import { useActProgress } from '../scroll/useScrollProgress';

/**
 * Act 2 — Origin (master prompt §8).
 *
 * The media panel is the §7 still fallback: the scrubbed harvest sequence does
 * not exist yet (docs/ASSETS.md). It is a brand-coloured highland field, not a
 * stock photo standing in for a farm we cannot show — the brief's "no fake data"
 * spirit applies to imagery of a real place as much as to copy.
 */
export function OriginCopy() {
  const ref = useRef<HTMLElement>(null);
  useActProgress('origin', ref);

  return (
    <section id="origin" ref={ref} className="act origin" aria-labelledby="origin-title">
      <div className="shell origin__grid">
        <div>
          <p className="eyebrow">{origin.eyebrow}</p>
          <h2 id="origin-title" className="h-act" style={{ marginBlockStart: 'var(--space-s)' }}>
            {origin.h2}
          </h2>
          <div className="stack measure" style={{ marginBlockStart: 'var(--space-m)' }}>
            {origin.body.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
          <ul className="stat-chips">
            {origin.stats.map((stat) => (
              <li key={stat}>{stat}</li>
            ))}
          </ul>
        </div>

        <div className="origin__media" role="img" aria-label="North Rift highland farm">
          <p>north rift · nandi hills · kitale</p>
        </div>
      </div>
    </section>
  );
}
