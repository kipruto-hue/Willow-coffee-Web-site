import { useRef } from 'react';
import { hero } from '../content/site';
import { SectionLink } from './SectionLink';
import { ScrollGuide } from './ScrollGuide';
import { useActProgress } from '../scroll/useScrollProgress';

/**
 * Act 1 — Hero. Bright, clean, split layout: copy on one side, one sharp coffee
 * image on the other, on a warm light background. No blurred full-bleed video
 * behind it — that read as fog. A centred guide line leads down to the story.
 *
 * Note the hero no longer sits on the video stage: `.hero` paints its own
 * background even under `[data-webgl='true']`. So it needs neither the amber
 * `.hero::before` scrim nor the `.act__band` plate the other three acts use —
 * its copy is on a known colour, not on a photograph. `check-stage-contrast.ts`
 * drops the hero for the same reason.
 */
export function HeroCopy() {
  const ref = useRef<HTMLElement>(null);
  useActProgress('hero', ref);

  return (
    <section id="hero" ref={ref} className="act hero" aria-labelledby="hero-title">
      <div className="shell hero__inner">
        <div className="hero__text">
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
        <figure className="hero__media">
          <img src="/media/hero.jpg" alt="Freshly roasted Willow coffee beans" />
        </figure>
      </div>
      <ScrollGuide target="origin" label="our story" />
    </section>
  );
}
