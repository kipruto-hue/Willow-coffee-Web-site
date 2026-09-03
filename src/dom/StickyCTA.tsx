import { useEffect, useState } from 'react';
import { generalOrderLink } from '../lib/whatsapp';

/**
 * The persistent order affordance (master prompt §2, §12.5): reachable in one
 * action from any scroll position.
 *
 * It hides only once the footer — which carries its own order link — is on
 * screen, so the CTA is never absent, merely never duplicated on top of itself.
 * It stays in the DOM and in the tab order while hidden is false; when hidden it
 * is inert so it cannot be tabbed to invisibly.
 */
export function StickyCTA() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => setHidden(Boolean(entry?.isIntersecting)),
      { rootMargin: '0px 0px -20% 0px' },
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <a
      className="btn btn--whatsapp sticky-cta"
      href={generalOrderLink()}
      target="_blank"
      rel="noopener noreferrer"
      data-hidden={hidden ? 'true' : 'false'}
      aria-hidden={hidden ? 'true' : undefined}
      tabIndex={hidden ? -1 : undefined}
    >
      order on whatsapp
    </a>
  );
}
