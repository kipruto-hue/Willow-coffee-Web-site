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
import { StoryThread } from './dom/StoryThread';
import { structuredData } from './lib/structuredData';

/**
 * THE SITE. Every word, every product, every CTA.
 *
 * This is deliberately the whole content layer with no reference to WebGL. Three
 * things render it:
 *
 *   1. the full experience, with the canvas mounted behind it;
 *   2. the lite path, which is this and nothing else (src/lite/LiteApp.tsx);
 *   3. the build-time prerender, which turns it into static HTML.
 *
 * §10 asks for "a complete, no-WebGL version. Same copy, same products, same
 * CTAs." The way to guarantee sameness is for there to be one copy of it — a
 * duplicated lite tree is a tree that drifts, and the drift is invisible until a
 * phone visitor sees last month's prices. Same reasoning as decision D2.
 */
export function SiteContent() {
  return (
    <>
      <a className="skip-link" href="#content">
        Skip to content
      </a>

      <Nav />

      <main id="content" tabIndex={-1}>
        <HeroCopy />
        <StoryThread />
        <OriginCopy />
        <StoryThread />
        <JourneyCopy />
        <StoryThread />
        <Products />
        <StoryThread />
        <Quality />
        <StoryThread />
        <Testimonials />
        <StoryThread />
        <Contact />
      </main>

      <Footer />
      <StickyCTA />

      <script
        type="application/ld+json"
        // Static, brand-authored content — no user input reaches it.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()) }}
      />
    </>
  );
}
