import { useEffect, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAppStore } from '../store/useAppStore';

gsap.registerPlugin(ScrollTrigger);

/**
 * ONE loop, one clock (master prompt §5.1).
 *
 * GSAP's ticker drives `lenis.raf()`, and every Lenis scroll event pokes
 * ScrollTrigger. Nothing else calls `requestAnimationFrame` for scroll, and
 * nothing reads `window.scrollY` directly — a second loop is how these two
 * libraries start fighting each other and stuttering.
 *
 * Under `prefers-reduced-motion` Lenis is not started at all: the browser's own
 * native scrolling is the calm, correct behaviour (§2, §10).
 */
let lenisInstance: Lenis | null = null;

/**
 * Scroll one section into view.
 *
 * Every in-page link goes through here rather than a bare `#anchor`, because a
 * native anchor jump teleports the scroll position out from under Lenis and the
 * scene lurches. When Lenis is not running (reduced motion) the browser's own
 * smooth scroll is the right answer.
 */
export function scrollToSection(target: string) {
  const el = document.getElementById(target);
  if (!el) return;

  if (lenisInstance) {
    lenisInstance.scrollTo(el, { offset: 0, duration: 1.4 });
  } else {
    el.scrollIntoView({ block: 'start' });
  }
  // Move focus so keyboard and screen-reader users land where sighted users look.
  el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const reducedMotion = useAppStore((s) => s.reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      // No rubber-banding on desktop (§5.1).
      syncTouch: false,
    });
    lenisInstance = lenis;

    const onScroll = () => ScrollTrigger.update();
    lenis.on('scroll', onScroll);

    // GSAP ticker time is seconds; Lenis wants milliseconds.
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.refresh();

    return () => {
      lenis.off('scroll', onScroll);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      lenisInstance = null;
    };
  }, [reducedMotion]);

  return <>{children}</>;
}

export { ScrollTrigger };
