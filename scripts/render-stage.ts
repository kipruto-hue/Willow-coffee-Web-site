/**
 * Renders the composited video stage to a PNG so it can be LOOKED AT.
 *
 * `check-stage-contrast.ts` answers "is the copy legible" with a number. It
 * cannot answer "does the footage still look like footage" — a cream floor
 * strong enough to pass AA is also strong enough to wash a photograph into
 * porridge, and only an eye catches that. Same stack, same order, same numbers;
 * this one draws it instead of measuring it, with the copy band overlaid where
 * the checker samples so the two views agree about where the words are.
 *
 *   npm run render:stage        -> .render/stage-hero.png, .render/stage-product.png
 */
import { loadImage, createCanvas } from '@napi-rs/canvas';
import { writeFile } from 'node:fs/promises';

const FLOOR = Number(process.argv[2] ?? 0.12);
const VW = 1440;
const VH = 900;

for (const name of ['hero', 'product']) {
  const image = await loadImage(`public/media/${name}.jpg`);
  const canvas = createCanvas(VW, VH);
  const ctx = canvas.getContext('2d');

  // 1. the light warm base
  const base = ctx.createLinearGradient(0, 0, 0, VH);
  base.addColorStop(0, '#F7F0DA');
  base.addColorStop(1, '#F8DCA7'); // marigold 22% on cream
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, VW, VH);

  // 2. the footage, cover-fit, feathered by the radial mask
  const layer = createCanvas(VW, VH);
  const lctx = layer.getContext('2d');
  const scale = Math.max(VW / image.width, VH / image.height);
  const dw = image.width * scale;
  const dh = image.height * scale;
  lctx.drawImage(image, (VW - dw) / 2, (VH - dh) / 2, dw, dh);
  lctx.globalCompositeOperation = 'destination-in';
  // 130% of the box WIDTH is the radius (see maskAlpha in check-stage-contrast.ts).
  const mask = lctx.createRadialGradient(VW * 0.5, VH * 0.45, 0, VW * 0.5, VH * 0.45, VW * 1.3);
  mask.addColorStop(0.6, 'rgba(0,0,0,1)');
  mask.addColorStop(1, 'rgba(0,0,0,0)');
  lctx.fillStyle = mask;
  lctx.fillRect(0, 0, VW, VH);
  ctx.drawImage(layer, 0, 0);

  // 3. the cream floor, then the edge wash on top of it
  ctx.fillStyle = `rgba(247, 240, 218, ${FLOOR})`;
  ctx.fillRect(0, 0, VW, VH);
  const wash = ctx.createLinearGradient(0, 0, 0, VH);
  wash.addColorStop(0, 'rgba(247, 240, 218, 0.3)');
  wash.addColorStop(0.22, 'rgba(247, 240, 218, 0)');
  wash.addColorStop(0.78, 'rgba(247, 240, 218, 0)');
  wash.addColorStop(1, 'rgba(247, 240, 218, 0.3)');
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, VW, VH);

  // 4. the hero's own amber scrim
  if (name === 'hero') {
    const scrim = ctx.createLinearGradient(0, VH, VW * 0.62, 0);
    scrim.addColorStop(0, 'rgba(241, 200, 45, 0.55)');
    scrim.addColorStop(1, 'rgba(241, 200, 45, 0)');
    ctx.fillStyle = scrim;
    ctx.fillRect(0, 0, VW, VH);
  }

  /*
   * 5. `.act__band::before` — the local cream plate behind the copy.
   *
   * Drawn before the words for the same reason the browser paints it behind
   * them, and drawn AT ALL because this is the layer that let the floor fall
   * from 0.62 to 0.12. Render without it and the picture shows vivid footage
   * under unprotected copy, which is a version that does not exist.
   *
   * Same band box the checker samples, bled by `inset: -3% -4%`.
   */
  const bx = VW * 0.06;
  const by = VH * (name === 'hero' ? 0.3 : 0.16);
  const bw = VW * (name === 'hero' ? 0.56 : 0.62);
  const bh = VH * (name === 'hero' ? 0.34 : 0.3);
  const px0 = bx - bw * 0.04;
  const py0 = by - bh * 0.03;
  const pw = bw * 1.08;
  const ph = bh * 1.06;
  ctx.save();
  // radial-gradient(130% 120% at 30% 50%) — an ellipse, so scale a circle.
  ctx.translate(px0 + pw * 0.3, py0 + ph * 0.5);
  ctx.scale(pw * 1.3, ph * 1.2);
  const plate = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  plate.addColorStop(0, 'rgba(247, 240, 218, 0.86)');
  plate.addColorStop(0.45, 'rgba(247, 240, 218, 0.86)');
  plate.addColorStop(1, 'rgba(247, 240, 218, 0)');
  ctx.fillStyle = plate;
  ctx.fillRect(-2, -2, 4, 4);
  ctx.restore();

  // the copy, in the act's real colour, where the checker samples it
  ctx.fillStyle = '#371101';
  ctx.font = '600 15px sans-serif';
  ctx.fillText('SINGLE ORIGIN — NORTH RIFT, KENYA', VW * 0.06, VH * (name === 'hero' ? 0.3 : 0.17));
  ctx.font = '700 64px serif';
  ctx.fillText('Grown in the', VW * 0.06, VH * (name === 'hero' ? 0.38 : 0.25));
  ctx.fillText('high country', VW * 0.06, VH * (name === 'hero' ? 0.46 : 0.33));
  ctx.font = '20px sans-serif';
  ctx.fillText('The body copy that has to stay readable over this frame.', VW * 0.06, VH * (name === 'hero' ? 0.54 : 0.41));

  await writeFile(`.render/stage-${name}.png`, canvas.toBuffer('image/png'));
  console.log(`.render/stage-${name}.png  (floor ${FLOOR})`);
}
