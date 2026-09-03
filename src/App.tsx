import { useEffect } from 'react';
import { SmoothScroll } from './scroll/SmoothScroll';
import { useGlobalProgress } from './scroll/useScrollProgress';
import { useAppStore } from './store/useAppStore';
import { detectStaticTier, prefersReducedMotion } from './lib/device';
import { structuredData } from './lib/structuredData';

import { Preloader } from './dom/Preloader';
import { Nav } from './dom/Nav';
import { HeroCopy } from './dom/HeroCopy';
import { OriginCopy } from './dom/OriginCopy';
import { JourneyCopy } from './dom/JourneyCopy';
import { Products } from './dom/Products';
import { Quality } from './dom/Quality';
import { Testimonials } from './dom/Testimonials';
import { Contact } from './dom/Contact';
import { Footer } from './dom/Footer';
import { StickyCTA } from './dom/StickyCTA';

import './styles/globals.css';
import './styles/components.css';

/**
 * Phase 0: the whole site as real DOM, no WebGL (master prompt §13).
 *
 * The canvas mounts into #canvas-root in Phase 1 and this content layer does not
 * change — that separation is the point of §2's "content is real DOM" rule, and
 * it is why this phase is already shippable on its own.
 */
export function App() {
  useGlobalProgress();

  // Device tier and motion preference are read once and kept live: a visitor can
  // flip reduced-motion mid-session and the site must follow them.
  useEffect(() => {
    const { setDeviceTier, setReducedMotion } = useAppStore.getState();
    setDeviceTier(detectStaticTier());
    setReducedMotion(prefersReducedMotion());

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReducedMotion(motionQuery.matches);
    motionQuery.addEventListener('change', onChange);
    return () => motionQuery.removeEventListener('change', onChange);
  }, []);

  return (
    <SmoothScroll>
      <Preloader />

      <a className="skip-link" href="#content">
        Skip to content
      </a>

      <Nav />

      {/* Phase 1 mounts the single <Canvas> here, fixed behind the content. */}
      <div id="canvas-root" aria-hidden="true" />

      <main id="content" tabIndex={-1}>
        <HeroCopy />
        <OriginCopy />
        <JourneyCopy />
        <Products />
        <Quality />
        <Testimonials />
        <Contact />
      </main>

      <Footer />
      <StickyCTA />

      <script
        type="application/ld+json"
        // Structured data is static, brand-authored content — no user input reaches it.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()) }}
      />
    </SmoothScroll>
  );
}
