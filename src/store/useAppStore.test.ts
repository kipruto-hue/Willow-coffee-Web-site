import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from './useAppStore';
import { shouldUseWebGL } from '../lib/device';

/**
 * The tier is the single switch between the WebGL site and the lite site, and
 * `demoteTier` is the only thing allowed to move it at runtime. That makes its
 * floor a correctness property, not a preference.
 *
 * The bug this pins: `demoteTier` used to go `high -> mid -> low`, and `low`
 * fails `shouldUseWebGL`, so two frame-time dips in one session permanently
 * unmounted the canvas and dropped the visitor onto the lite DOM path. Anyone
 * reviewing the site on a laptop with an integrated GPU was reviewing the
 * fallback and could not tell.
 */
describe('demoteTier', () => {
  beforeEach(() => {
    useAppStore.setState({ deviceTier: 'high' });
  });

  it('steps high down to mid', () => {
    useAppStore.getState().demoteTier();
    expect(useAppStore.getState().deviceTier).toBe('mid');
  });

  it('never demotes below mid, however many times it is called', () => {
    for (let i = 0; i < 20; i += 1) useAppStore.getState().demoteTier();
    expect(useAppStore.getState().deviceTier).toBe('mid');
  });

  it('never demotes the visitor out of the WebGL experience', () => {
    // The point of the floor, stated as the thing it protects.
    for (let i = 0; i < 20; i += 1) useAppStore.getState().demoteTier();
    expect(useAppStore.getState().deviceTier).not.toBe('low');
  });

  it('leaves a statically-detected low tier alone — that one is deliberate', () => {
    // `detectStaticTier` returns 'low' when it knows it is looking at a phone,
    // a coarse pointer or Save-Data. Only that path may reach the lite site.
    useAppStore.getState().setDeviceTier('low');
    useAppStore.getState().demoteTier();
    expect(useAppStore.getState().deviceTier).toBe('low');
    expect(shouldUseWebGL('low', false)).toBe(false);
  });
});
