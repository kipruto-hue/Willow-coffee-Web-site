import { useEffect } from 'react';
import { ACT_GRADIENTS } from './actGradients';
import { ACT_ORDER, useAppStore } from '../store/useAppStore';
import type { ActId } from '../content/types';

/**
 * The act backgrounds, cross-fading along scroll (§5.4, Phase 4).
 *
 * WHY IT IS A DOM LAYER AND NOT A 3D BACKGROUND
 * A fixed gradient is something CSS does perfectly for free. Painting it in
 * WebGL would mean a full-screen fragment pass every frame for a result no
 * viewer could tell apart, on the very devices with the least headroom to spare.
 * The canvas is left transparent and does what only it can do: the objects.
 *
 * The stage sits BEHIND the canvas (`--z-canvas` minus one) and the acts that
 * have 3D content become transparent so it shows through. Acts that are pure
 * DOM keep their own opaque backgrounds and simply cover it.
 *
 * Written straight to CSS custom properties, rAF-batched. React never re-renders
 * for this.
 */
export function StageBackground() {
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;
    let pending = false;

    const apply = () => {
      frame = 0;
      pending = false;
      const { activeAct, actProgress } = useAppStore.getState();

      // Blend into the next act over the tail of the current one, so the handover
      // is a fade rather than a cut at the section boundary.
      const index = ACT_ORDER.indexOf(activeAct);
      const next: ActId = ACT_ORDER[Math.min(index + 1, ACT_ORDER.length - 1)] ?? activeAct;
      const local = actProgress[activeAct] ?? 0;
      const blend = Math.max(0, (local - 0.62) / 0.38);

      const from = ACT_GRADIENTS[activeAct];
      const to = ACT_GRADIENTS[next];

      // color-mix does the interpolation in the browser, in sRGB, with no JS
      // colour maths to keep in sync with tokens.css.
      for (let stop = 0; stop < 3; stop += 1) {
        const a = from[stop];
        const b = to[stop];
        const pct = Math.round(blend * 100);
        root.style.setProperty(
          `--stage-${stop}`,
          pct === 0 ? `var(${a})` : `color-mix(in srgb, var(${b}) ${pct}%, var(${a}))`,
        );
      }
    };

    const schedule = () => {
      if (pending) return;
      pending = true;
      frame = requestAnimationFrame(apply);
    };

    apply();
    const unsubscribe = useAppStore.subscribe(schedule);
    window.addEventListener('resize', schedule);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      unsubscribe();
      window.removeEventListener('resize', schedule);
      root.style.removeProperty('--stage-0');
      root.style.removeProperty('--stage-1');
      root.style.removeProperty('--stage-2');
    };
  }, []);

  return <div id="stage-bg" aria-hidden="true" />;
}
