import { loadImage } from '@napi-rs/canvas';
import { describe, expect, it } from 'vitest';
import {
  CUP_BODY,
  CUP_WRAP_ASPECT,
  POUCH_BODY,
  POUCH_PANEL_WIDTH,
  pouchPanelHeight,
} from './packaging';

/**
 * §2's logo rules are not negotiable, and the easiest way to break them is not
 * to rotate or recolour the mark — it is to draw the artwork it sits on at one
 * aspect ratio and map it onto geometry with another. The stretch is a few
 * percent, it looks like nothing in a screenshot, and it is still a stretched
 * logo.
 *
 * Both faults were live before these tests existed: the cup wrap was drawn 16:9
 * onto a body that unrolls to ~2.51:1 (a 30% horizontal squash), and the pouch
 * panel was a hard-coded 0.8 x 1.05 under a 1024x1400 image (a 4% one). Neither
 * is visible in any assertion about colour, size or file existence — only about
 * the ratio.
 */
describe('packaging artwork fits the geometry it is mapped onto', () => {
  it('draws the cup wrap at the ratio the body unrolls to', async () => {
    const image = await loadImage('public/brand/cup-wrap.png');
    const drawn = image.width / image.height;

    // Within 1%: the artwork is an integer number of pixels, so it cannot land
    // exactly on an irrational ratio.
    expect(drawn).toBeGreaterThan(CUP_WRAP_ASPECT * 0.99);
    expect(drawn).toBeLessThan(CUP_WRAP_ASPECT * 1.01);
  });

  it('derives the cup wrap ratio from the body, not from a chosen number', () => {
    // If someone retunes the cup, this is the line that has to move with it.
    const meanCircumference = Math.PI * (CUP_BODY.radiusTop + CUP_BODY.radiusBottom);
    expect(CUP_WRAP_ASPECT).toBeCloseTo(meanCircumference / CUP_BODY.height, 6);
  });

  it('gives the pouch panel the artwork ratio, whatever the artwork is', () => {
    // The property, not the current number: a panel of width W showing an image
    // of ratio R is R tall, for every R.
    for (const [w, h] of [
      [1024, 1400],
      [1000, 1000],
      [800, 2000],
    ]) {
      const panel = pouchPanelHeight(w!, h!);
      expect(POUCH_PANEL_WIDTH / panel).toBeCloseTo(w! / h!, 6);
    }
  });

  it('keeps the pouch panel on the front of the pouch', async () => {
    const image = await loadImage('public/brand/pouch-front.png');
    const height = pouchPanelHeight(image.width, image.height);

    // The panel is centred at y = -0.05 and the top seal starts at y = 0.67.
    expect(POUCH_PANEL_WIDTH).toBeLessThan(POUCH_BODY.width);
    expect(height / 2 - 0.05).toBeLessThan(0.67);
    expect(height).toBeLessThan(POUCH_BODY.height);
  });
});
