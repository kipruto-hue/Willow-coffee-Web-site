import type { DeviceTier } from '../store/useAppStore';

/**
 * Static half of tier detection (master prompt §5.5). The live frame-time sample
 * and the demotion logic land in Phase 5; this is what can be known before a
 * single frame has been drawn.
 *
 * Deliberately pessimistic: guessing `low` costs a viewer some spectacle,
 * guessing `high` on a weak device costs them a janking, battery-draining page.
 */
export function detectStaticTier(): DeviceTier {
  if (typeof window === 'undefined') return 'low';

  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const cores = navigator.hardwareConcurrency ?? 2;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const saveData =
    (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData ??
    false;

  if (saveData) return 'low';
  // Phones and tablets take the lite path outright (§2: mobile-lite is mandatory).
  if (coarsePointer) return 'low';
  if (cores <= 4 || memory <= 4) return 'mid';
  return 'high';
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** True when a WebGL2 context can actually be created (§10: fall back if it cannot). */
export function hasWebGL(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * The single routing question: does this visitor get the WebGL experience?
 *
 * Reduced motion routes to the lite path per §10 (build plan D3) — one calm,
 * fully-usable code path rather than a second, lightly-tested animation mode.
 */
export function shouldUseWebGL(tier: DeviceTier, reducedMotion: boolean): boolean {
  return tier !== 'low' && !reducedMotion && hasWebGL();
}
