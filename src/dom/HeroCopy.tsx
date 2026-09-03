import { useRef } from 'react';
import { hero } from '../content/site';
import { SectionLink } from './SectionLink';
import { useActProgress } from '../scroll/useScrollProgress';

/**
 * Act 1 — Hero (master prompt §8).
 *
 * In Phase 1 the vivid gradient and the beans move to the canvas behind this
 * markup. The copy stays exactly here, in the DOM, either way (§2).
 */
export function HeroCopy() {
  const ref = useRef<HTMLElement>(null);
  useActProgress('hero', ref);

  return (
    <section id="hero" ref={ref} className="act hero on-vivid" aria-labelledby="hero-title">
      <div className="shell hero__inner">
        <p className="eyebrow">{hero.eyebrow}</p>
        <h1 id="hero-title" className="h-display">
          {hero.h1}
        </h1>
        <p className="hero__sub">{hero.sub}</p>
        <div className="hero__actions">
          <SectionLink target={hero.primaryCta.target} className="btn btn--primary">
            {hero.primaryCta.label}
          </SectionLink>
          <SectionLink target={hero.secondaryCta.target} className="btn btn--ghost">
            {hero.secondaryCta.label}
          </SectionLink>
        </div>
      </div>
    </section>
  );
}
