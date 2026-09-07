import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';

/**
 * Is the site actually moving right now?
 *
 * The footage plays while the visitor scrolls and holds still when they stop.
 * A loop running unattended behind static copy is the same restless, generated
 * feel the procedural scene had — the motion has to belong to the visitor's own
 * movement, not run on its own clock. It also means a parked tab costs nothing:
 * a paused video decodes no frames.
 *
 * Driven off `globalProgress`, which the scroll layer already writes on every
 * frame of a scroll (§5.1: components read the store, never `window.scrollY`).
 * The subscription is the non-reactive `useAppStore.subscribe`, so a scroll does
 * NOT re-render this hook's consumers — React state changes exactly twice per
 * scroll burst, at its start and at its end.
 *
 * Under reduced motion this is always false: those visitors get stills, and
 * nothing about scrolling should start a video for them (§10).
 */
export function useScrollActivity(idleMs = 420): boolean {
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setMoving(false);
      return;
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    let active = false;

    const unsubscribe = useAppStore.subscribe((state, previous) => {
      if (state.globalProgress === previous.globalProgress) return;

      if (!active) {
        active = true;
        setMoving(true);
      }
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        active = false;
        setMoving(false);
      }, idleMs);
    });

    // A tab the visitor has left is not moving, whatever the last scroll said.
    const onVisibility = () => {
      if (document.hidden) {
        if (timer) clearTimeout(timer);
        active = false;
        setMoving(false);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', onVisibility);
      if (timer) clearTimeout(timer);
    };
  }, [idleMs, reducedMotion]);

  return moving;
}
