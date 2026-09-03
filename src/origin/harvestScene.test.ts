import { createCanvas } from '@napi-rs/canvas';
import { describe, expect, it } from 'vitest';
import { buildScene, drawHarvestFrame, type ScenePalette } from './harvestScene';
import { createFrameSource, HARVEST_MANIFEST, ProceduralSource } from './frameSource';

/**
 * The property that matters for a scrubbed sequence is DETERMINISM: frame N must
 * look the same whether you arrived at it scrolling down, scrolling back up, or
 * after a resize. An animation that merely drifts near the scroll position looks
 * fine going forward and smears going backward, and nobody catches it until it
 * is live.
 *
 * These render through @napi-rs/canvas — the same `drawHarvestFrame` the browser
 * calls, not a reimplementation.
 */
const palette: ScenePalette = {
  bean: '#371101',
  beanSoft: '#4B2F23',
  marigold: '#FAAF40',
  amberOrange: '#DD7310',
  amberYellow: '#F1C82D',
  amberDeep: '#B4560A',
  cream: '#F7F0DA',
  willowGreen: '#6E7B2E',
  maroon: '#6E1E1A',
};

const W = 240;
const H = 300;

function render(progress: number, quality: 'high' | 'mid' | 'low' = 'high'): Buffer {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  drawHarvestFrame(
    ctx as unknown as CanvasRenderingContext2D,
    buildScene(quality),
    palette,
    W,
    H,
    progress,
  );
  return canvas.toBuffer('image/png');
}

describe('scene model', () => {
  it('is identical for the same seed', () => {
    expect(JSON.stringify(buildScene('high'))).toBe(JSON.stringify(buildScene('high')));
  });

  it('differs for a different seed', () => {
    expect(JSON.stringify(buildScene('high', 1))).not.toBe(
      JSON.stringify(buildScene('high', 2)),
    );
  });

  it('scales element counts down with quality, so the mid tier draws less', () => {
    const high = buildScene('high');
    const mid = buildScene('mid');
    const low = buildScene('low');

    expect(mid.branches.length).toBeLessThan(high.branches.length);
    expect(low.branches.length).toBeLessThan(mid.branches.length);
    expect(low.motes).toHaveLength(0);
  });
});

describe('frame rendering', () => {
  it('is a pure function of progress — scrubbing back gives the same frame', () => {
    expect(render(0.37).equals(render(0.37))).toBe(true);
  });

  it('actually changes as progress advances', () => {
    expect(render(0.2).equals(render(0.6))).toBe(false);
  });

  it('handles the ends of the range without throwing', () => {
    expect(() => render(0)).not.toThrow();
    expect(() => render(1)).not.toThrow();
    // Out-of-range values are clamped rather than producing a broken frame.
    expect(render(-0.5).equals(render(0))).toBe(true);
    expect(render(1.5).equals(render(1))).toBe(true);
  });

  it('paints every pixel — the panel can never show through to the page', () => {
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');
    drawHarvestFrame(
      ctx as unknown as CanvasRenderingContext2D,
      buildScene('high'),
      palette,
      W,
      H,
      0.5,
    );
    const { data } = ctx.getImageData(0, 0, W, H);
    let transparent = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] !== 255) transparent += 1;
    expect(transparent).toBe(0);
  });
});

describe('frame source selection', () => {
  it('falls back to the procedural scene while the real footage is missing', () => {
    // Guards the §7 fallback: if someone sets a manifest without shipping the
    // frames, this flips and tells them the site is now depending on them.
    expect(HARVEST_MANIFEST).toBeNull();
    expect(createFrameSource('high', palette)).toBeInstanceOf(ProceduralSource);
  });
});
