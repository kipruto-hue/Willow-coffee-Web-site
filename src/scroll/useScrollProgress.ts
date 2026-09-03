import { useEffect, type RefObject } from 'react';
import { ScrollTrigger } from './SmoothScroll';
import { useAppStore } from '../store/useAppStore';
import type { ActId } from '../content/types';

/**
 * Global 0..1 across the document, written into the store once per scroll update.
 */
export function useGlobalProgress() {
  useEffect(() => {
    const set = useAppStore.getState().setGlobalProgress;
    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => set(self.progress),
    });
    return () => trigger.kill();
  }, []);
}

/**
 * Act-local 0..1 for one section.
 *
 * Measured from the section's real position rather than a hardcoded global
 * fraction (build plan D9): sections change height as copy and breakpoints
 * change, and a hardcoded range silently desynchronises from the content when
 * they do. The ranges §5.2 asks for still exist — they are just derived.
 *
 * `end: 'bottom top'` means progress runs 0 as the section's top reaches the
 * viewport bottom, through to 1 as its bottom leaves the viewport top.
 */
export function useActProgress(act: ActId, ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const { setActProgress, setActiveAct } = useAppStore.getState();

    const progress = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => setActProgress(act, self.progress),
    });

    // Separate trigger for "which act am I in": the act that owns the middle of
    // the viewport, which is not the same question as how far through it we are.
    const active = ScrollTrigger.create({
      trigger: el,
      start: 'top center',
      end: 'bottom center',
      onToggle: (self) => {
        if (self.isActive) setActiveAct(act);
      },
    });

    return () => {
      progress.kill();
      active.kill();
    };
  }, [act, ref]);
}
