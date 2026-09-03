import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { createFrameSource, type FrameSource } from './frameSource';
import type { ScenePalette, SceneQuality } from './harvestScene';

/**
 * Act 2's scrubbed visual (master prompt §8): scrolling moves the harvest.
 *
 * Everything here is built around one rule — the scroll callback must never do
 * work. It records the target progress and returns; a single rAF, scheduled at
 * most once per frame, does the drawing. Anything heavier and the scrub stutters
 * on exactly the devices that can least afford it.
 *
 * Paused entirely when the section is off screen (§9), and drawn once as a still
 * frame under reduced motion or on the low tier (§10) — where a scrubbed
 * sequence is precisely the wrong thing to give someone.
 *
 * The canvas is decorative. The copy beside it carries the meaning (§2), so this
 * is aria-hidden and never focusable.
 */

/** Read the brand palette out of CSS so tokens.css stays the single source. */
function readPalette(): ScenePalette {
  const s = getComputedStyle(document.documentElement);
  const token = (name: string, fallback: string) =>
    (s.getPropertyValue(name).trim() || fallback).toUpperCase();

  return {
    bean: token('--bean', '#371101'),
    beanSoft: token('--bean-soft', '#4B2F23'),
    marigold: token('--marigold', '#FAAF40'),
    amberOrange: token('--amber-orange', '#DD7310'),
    amberYellow: token('--amber-yellow', '#F1C82D'),
    amberDeep: token('--amber-deep', '#B4560A'),
    cream: token('--cream', '#F7F0DA'),
    willowGreen: token('--willow-green', '#6E7B2E'),
    maroon: token('--maroon', '#6E1E1A'),
  };
}

export function OriginSequence() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const deviceTier = useAppStore((s) => s.deviceTier);
  const reducedMotion = useAppStore((s) => s.reducedMotion);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const quality: SceneQuality = reducedMotion ? 'low' : deviceTier;
    const still = reducedMotion || deviceTier === 'low';

    let source: FrameSource | null = createFrameSource(quality, readPalette());
    let width = 0;
    let height = 0;
    let target = still ? 0.5 : useAppStore.getState().actProgress.origin;
    let painted = Number.NaN;
    let frame = 0;
    let visible = true;
    let disposed = false;

    // Device pixel ratio is capped: past ~2 the extra fill rate buys nothing a
    // viewer can see, and on a 3x phone it is the difference between smooth and not.
    const dprCap = quality === 'high' ? 2 : 1.5;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      width = Math.round(rect.width);
      height = Math.round(rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      painted = Number.NaN; // force a repaint at the new size
      schedule();
    };

    const paint = () => {
      frame = 0;
      if (disposed || !source || width === 0 || height === 0) return;
      // A sub-pixel scroll change is not worth a repaint.
      if (Math.abs(target - painted) < 0.0015) return;
      painted = target;
      source.draw(ctx, width, height, target);
    };

    const schedule = () => {
      if (disposed || frame !== 0 || !visible) return;
      frame = requestAnimationFrame(paint);
    };

    // Scroll → record and return. No drawing on this path, ever.
    const unsubscribe = still
      ? undefined
      : useAppStore.subscribe((state) => {
          const next = state.actProgress.origin;
          if (next === target) return;
          target = next;
          schedule();
        });

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    // Off-screen acts do not render (§9).
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
        if (visible) schedule();
        else if (frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { rootMargin: '20% 0px' },
    );
    io.observe(canvas);

    // A hidden tab must not keep drawing (§9).
    const onVisibility = () => {
      if (!document.hidden) schedule();
    };
    document.addEventListener('visibilitychange', onVisibility);

    void source.prepare().then(() => {
      if (disposed) return;
      painted = Number.NaN;
      schedule();
    });

    resize();

    return () => {
      disposed = true;
      if (frame) cancelAnimationFrame(frame);
      unsubscribe?.();
      resizeObserver.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      source?.dispose();
      source = null;
    };
  }, [deviceTier, reducedMotion]);

  return <canvas ref={canvasRef} className="origin__canvas" aria-hidden="true" />;
}
