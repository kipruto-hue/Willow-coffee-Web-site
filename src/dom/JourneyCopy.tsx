import { useRef } from 'react';
import { journey, journeySteps } from '../content/site';
import { useActProgress } from '../scroll/useScrollProgress';

/** Act 3 — The Journey (master prompt §8). */
export function JourneyCopy() {
  const ref = useRef<HTMLElement>(null);
  useActProgress('journey', ref);

  return (
    <section
      id="journey"
      ref={ref}
      className="act journey on-dark"
      aria-labelledby="journey-title"
    >
      <div className="shell">
        <div className="act__band">
          <p className="eyebrow">{journey.eyebrow}</p>
          <h2 id="journey-title" className="h-act" style={{ marginBlockStart: 'var(--space-s)' }}>
            {journey.h2}
          </h2>
        </div>

        <ol className="journey__steps" style={{ listStyle: 'none', padding: 0 }}>
          {journeySteps.map((step) => (
            <li key={step.number} className="step">
              <span className="step__number">{step.number}</span>
              <span className="step__stage">{step.stage}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
