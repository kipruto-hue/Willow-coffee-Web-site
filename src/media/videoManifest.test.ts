import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import {
  ORIGIN_CLIP,
  STAGE_CLIPS,
  clipIsMotion,
  stageClipFor,
  type Clip,
} from './videoManifest';
import type { ActId } from '../content/types';

const ACTS: readonly ActId[] = ['hero', 'origin', 'journey', 'product', 'quality'];
const allClips = (): Clip[] => [...Object.values(STAGE_CLIPS).filter(Boolean), ORIGIN_CLIP];

/**
 * The background is real footage now, and the manifest is the whole of the
 * still-to-motion switch: with `sources` empty every layer renders its poster,
 * and adding an encoded file is the entire act of turning the video on. That
 * makes these the assertions worth having — the acceptance criteria, as code.
 */
describe('every act has a clip to show', () => {
  it('gives every act a clip, with no gaps', () => {
    for (const act of ACTS) {
      expect(stageClipFor(act), `no clip for ${act}`).not.toBeNull();
    }
  });

  it('inherits the nearest clip defined before an act that has none', () => {
    // origin and journey define none of their own, so they hold the hero's.
    expect(stageClipFor('origin')?.poster).toBe(STAGE_CLIPS.hero?.poster);
    expect(stageClipFor('journey')?.poster).toBe(STAGE_CLIPS.hero?.poster);
    // product defines its own, and quality then inherits it rather than falling
    // all the way back to the hero.
    expect(stageClipFor('product')?.poster).toBe(STAGE_CLIPS.product?.poster);
    expect(stageClipFor('quality')?.poster).toBe(STAGE_CLIPS.product?.poster);
  });

  it('ships the poster every clip names', () => {
    // A manifest entry pointing at a file that is not there is a blank stage,
    // and nothing else in the build would say so.
    for (const clip of allClips()) {
      expect(existsSync(`public${clip.poster}`), `missing public${clip.poster}`).toBe(true);
    }
  });
});

describe('still or motion', () => {
  const clip = (sources: Clip['sources']): Clip => ({
    poster: '/media/hero.jpg',
    sources,
    mode: 'loop',
    label: 'test',
  });
  const withSources = clip([{ src: '/media/hero.mp4', type: 'video/mp4' }]);

  it('holds the still while a clip has no encoded sources', () => {
    // Today's state for every clip in the manifest.
    expect(clipIsMotion(clip([]), false, 'high')).toBe(false);
  });

  it('turns to motion when sources are added, and nothing else changes', () => {
    expect(clipIsMotion(withSources, false, 'high')).toBe(true);
  });

  it('never plays video under reduced motion', () => {
    expect(clipIsMotion(withSources, true, 'high')).toBe(false);
    expect(clipIsMotion(withSources, true, 'mid')).toBe(false);
  });

  it('never plays video on a low-tier device', () => {
    expect(clipIsMotion(withSources, false, 'low')).toBe(false);
  });

  it('is the only rule — every clip in the manifest is a still today', () => {
    for (const c of allClips()) {
      expect(clipIsMotion(c, false, 'high'), `${c.label} has sources already`).toBe(false);
    }
  });
});

describe('brand safety', () => {
  it('keeps the COFFEELINK pour flagged for replacement', () => {
    // §2: do not ship another brand's mark. The flag is the reminder that
    // survives a handover; losing it is how the cup ends up live.
    expect(STAGE_CLIPS.product?.replace).toBe(true);
  });
});
