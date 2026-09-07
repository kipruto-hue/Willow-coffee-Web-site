import type { ActId } from '../content/types';

/**
 * The video background system.
 *
 * Each act shows a real clip instead of the old procedural / WebGL background.
 * Today only the poster stills exist, so the layers render the poster; the
 * moment an encoded file is added to `sources`, the still becomes motion and
 * nothing else changes. Same fallback discipline as the old frameSource.
 *
 * See docs/VIDEO.md for how to encode and where the files go.
 */
export type ClipMode = 'loop' | 'scrub';

export interface Clip {
  readonly poster: string;
  readonly sources: readonly { readonly src: string; readonly type: string }[];
  readonly mode: ClipMode;
  readonly label: string;
  /** Must be replaced before launch (brand or licence problem). */
  readonly replace?: boolean;
}

/** Full-bleed background clips, by act. Acts without one inherit the nearest before. */
export const STAGE_CLIPS: Partial<Record<ActId, Clip>> = {
  hero: {
    poster: '/media/hero.jpg',
    sources: [
      // { src: '/media/hero.webm', type: 'video/webm' },
      // { src: '/media/hero.mp4', type: 'video/mp4' },
    ],
    mode: 'loop',
    label: 'beans in the grinder',
  },
  product: {
    poster: '/media/product.jpg',
    sources: [],
    mode: 'loop',
    label: 'pour into cup',
    // The uploaded pour clip shows a COFFEELINK cup. Crop the logo out or
    // reshoot with a Willow / plain cup before this goes anywhere near launch.
    replace: true,
  },
};

/** The contained clip inside the Origin split panel (replaces the procedural scene). */
export const ORIGIN_CLIP: Clip = {
  poster: '/media/origin.jpg',
  sources: [],
  mode: 'loop',
  label: 'smoke over roasted beans',
};

const STAGE_ORDER: readonly ActId[] = ['hero', 'origin', 'journey', 'product', 'quality'];

/** The clip to show for an act: its own, or the nearest defined one before it. */
export function stageClipFor(act: ActId): Clip | null {
  const i = STAGE_ORDER.indexOf(act);
  for (let j = i; j >= 0; j -= 1) {
    const a = STAGE_ORDER[j];
    const c = a ? STAGE_CLIPS[a] : undefined;
    if (c) return c;
  }
  return STAGE_CLIPS.hero ?? null;
}

/**
 * Does this clip move, for this visitor?
 *
 * The one place the still-vs-motion rule lives, because it is a promise (§10,
 * §12.8) rather than a preference and it is asked in two components:
 *
 *   - no encoded sources yet -> the poster. This is the normal state today, and
 *     it is why adding a file to `sources` is the whole of "turn the video on".
 *   - reduced motion -> the poster, always. Never an autoplaying video.
 *   - a low-tier device -> the poster. Phones and Save-Data get a still, not a
 *     decode loop.
 *
 * Whether a moving clip is playing *right now* is a separate question, answered
 * by `useScrollActivity`: motion belongs to the visitor's scroll.
 */
export function clipIsMotion(
  clip: Clip,
  reducedMotion: boolean,
  tier: 'high' | 'mid' | 'low',
): boolean {
  return clip.sources.length > 0 && !reducedMotion && tier !== 'low';
}
