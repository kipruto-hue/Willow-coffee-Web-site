import type { ActId } from '../content/types';

/**
 * The background each act sits on (§8), as CSS custom-property names.
 *
 * These are the same values the DOM used before the canvas existed, so turning
 * WebGL on does not change a single text-contrast pairing.
 *
 * This module deliberately imports NOTHING from `src/canvas/`. It is reached
 * from the entry bundle, and one `three` import here would drag the whole 3D
 * chunk onto the wire for lite-path visitors (§9).
 *
 * Three stops per act: the vertical gradient, top to bottom.
 */
export type ActGradient = readonly [string, string, string];

export const ACT_GRADIENTS: Record<ActId, ActGradient> = {
  hero: ['--amber-yellow', '--amber-orange', '--amber-deep'],
  origin: ['--cream', '--cream', '--cream'],
  journey: ['--journey-top', '--journey-mid', '--maroon'],
  product: ['--maroon', '--amber-deep', '--marigold'],
  quality: ['--marigold', '--marigold', '--marigold'],
};
