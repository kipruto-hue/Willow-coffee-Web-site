import { useRef } from 'react';
import { brand, credentials, quality, sdgs } from '../content/site';
import { dossierLink } from '../lib/whatsapp';
import { useActProgress } from '../scroll/useScrollProgress';

/** Act 5 — Quality & credentials (master prompt §8). */
export function Quality() {
  const ref = useRef<HTMLElement>(null);
  useActProgress('quality', ref);

  const dossierMailto = `mailto:${brand.email}?subject=${encodeURIComponent(
    'Quality Dossier Request',
  )}&body=${encodeURIComponent(
    'Hello Willow Coffee,\n\nPlease send your quality dossier and export documentation.\n\nThank you.',
  )}`;

  return (
    <section id="quality" ref={ref} className="act quality" aria-labelledby="quality-title">
      <div className="shell">
        <p className="eyebrow">{quality.eyebrow}</p>
        <h2 id="quality-title" className="h-act" style={{ marginBlockStart: 'var(--space-s)' }}>
          {quality.h2}
        </h2>
        <p className="lede measure" style={{ marginBlockStart: 'var(--space-m)' }}>
          {quality.intro}
        </p>

        <div className="credentials">
          {credentials.map((credential) => (
            <div key={credential.title} className="credential">
              <h3>{credential.title}</h3>
              <p>{credential.body}</p>
            </div>
          ))}
        </div>

        <ul className="sdgs" aria-label="UN Sustainable Development Goals we work toward">
          {sdgs.map((sdg) => (
            <li key={sdg.number}>
              <b>{sdg.number}</b>
              {sdg.label}
            </li>
          ))}
        </ul>

        <div className="dossier">
          <a className="btn btn--primary" href={dossierMailto}>
            {quality.dossierCta}
          </a>
          <a
            className="btn btn--ghost"
            href={dossierLink()}
            target="_blank"
            rel="noopener noreferrer"
          >
            {quality.dossierAlt}
          </a>
        </div>
      </div>
    </section>
  );
}
