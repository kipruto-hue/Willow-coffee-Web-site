import { useRef } from 'react';
import { origin } from '../content/site';
import { useActProgress } from '../scroll/useScrollProgress';
import { OriginSequence } from '../origin/OriginSequence';

/**
 * Act 2 — Origin (master prompt §8).
 *
 * The media panel holds the scroll-scrubbed harvest scene. The real North Rift
 * footage does not exist yet, so it renders rather than pretends — see
 * src/origin/harvestScene.ts. The moment real frames land, only
 * `HARVEST_MANIFEST` changes; nothing in this file does.
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

        {/*
          Decorative: the paragraphs above carry the meaning, so the scene is
          hidden from assistive tech rather than described with a caption that
          would be inventing brand copy.
        */}
        <div className="origin__media" aria-hidden="true">
          <OriginSequence />
        </div>
      </div>
    </section>
  );
}
