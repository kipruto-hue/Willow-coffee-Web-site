/**
 * Does the copy still pass AA over the real footage?
 *
 *   npm run check:contrast
 *
 * `contrast.test.ts` checks the brand's colour PAIRINGS. It cannot see this:
 * with the video stage mounted, `:root[data-webgl='true']` makes the hero,
 * journey, product and quality acts transparent, so their cream copy now sits
 * over a photograph instead of a gradient — and it does so on EVERY path now,
 * including phones and reduced motion, which used to get an opaque gradient and
 * never met the stage at all.
 *
 * A photograph has no single colour, so this samples the poster where the text
 * actually falls, takes the WORST (brightest) cell rather than the average — a
 * mean hides a specular highlight sitting under one word — and applies the
 * scrim the stage paints over it before comparing.
 *
 * It reports; it does not throw. The scrim strength is a design decision and
 * this is the number to make it with.
 */
import { loadImage, createCanvas } from '@napi-rs/canvas';

/** --bean, the scrim colour, from tokens.css. */
const BEAN = { r: 0x37, g: 0x11, b: 0x01 };
/** --cream, the body copy, from tokens.css. */
const CREAM = { r: 0xf7, g: 0xf0, b: 0xda };

type Rgb = { r: number; g: number; b: number };

const channel = (v: number): number => {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = ({ r, g, b }: Rgb): number =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const ratio = (a: Rgb, b: Rgb): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
};
/** `over` composited onto `under` at the given alpha. */
const over = (under: Rgb, layer: Rgb, alpha: number): Rgb => ({
  r: layer.r * alpha + under.r * (1 - alpha),
  g: layer.g * alpha + under.g * (1 - alpha),
  b: layer.b * alpha + under.b * (1 - alpha),
});

/**
 * Regions of the frame the copy actually occupies, in fractions of the poster.
 * The hero sets its copy left of centre; the other acts run their cards over the
 * middle band.
 */
const REGIONS: Record<string, { x: number; y: number; w: number; h: number }> = {
  'hero — headline block (left)': { x: 0.04, y: 0.3, w: 0.55, h: 0.42 },
  'product — card band (centre)': { x: 0.1, y: 0.25, w: 0.8, h: 0.5 },
};

/** The scrim `#video-stage::after` lays over the footage, as a flat alpha. */
const SCRIM_ALPHA = Number(process.argv[2] ?? 0.62);

const posters = ['hero', 'product'] as const;

console.log(`scrim alpha under test: ${SCRIM_ALPHA}\n`);
let worst = Infinity;

for (const name of posters) {
  const image = await loadImage(`public/media/${name}.jpg`);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);

  for (const [label, region] of Object.entries(REGIONS)) {
    if (!label.startsWith(name)) continue;

    const x0 = Math.floor(region.x * image.width);
    const y0 = Math.floor(region.y * image.height);
    const w = Math.floor(region.w * image.width);
    const h = Math.floor(region.h * image.height);
    const { data } = ctx.getImageData(x0, y0, w, h);

    // Worst cell, not the mean: one bright highlight under one word is a real
    // failure and an average erases it. 24x24 cells ~ a word-sized patch.
    const CELLS = 24;
    let brightest: Rgb = BEAN;
    let brightestL = -1;

    for (let cy = 0; cy < CELLS; cy += 1) {
      for (let cx = 0; cx < CELLS; cx += 1) {
        let r = 0;
        let g = 0;
        let b = 0;
        let n = 0;
        const sx0 = Math.floor((cx * w) / CELLS);
        const sx1 = Math.floor(((cx + 1) * w) / CELLS);
        const sy0 = Math.floor((cy * h) / CELLS);
        const sy1 = Math.floor(((cy + 1) * h) / CELLS);
        for (let y = sy0; y < sy1; y += 2) {
          for (let x = sx0; x < sx1; x += 2) {
            const i = (y * w + x) * 4;
            r += data[i] ?? 0;
            g += data[i + 1] ?? 0;
            b += data[i + 2] ?? 0;
            n += 1;
          }
        }
        if (n === 0) continue;
        const cell = { r: r / n, g: g / n, b: b / n };
        const l = luminance(cell);
        if (l > brightestL) {
          brightestL = l;
          brightest = cell;
        }
      }
    }

    const bare = ratio(CREAM, brightest);
    const scrimmed = ratio(CREAM, over(brightest, BEAN, SCRIM_ALPHA));
    worst = Math.min(worst, scrimmed);

    console.log(`${label}`);
    console.log(`  worst cell            rgb(${brightest.r.toFixed(0)}, ${brightest.g.toFixed(0)}, ${brightest.b.toFixed(0)})`);
    console.log(`  cream on bare footage ${bare.toFixed(2)}:1`);
    console.log(
      `  cream through scrim   ${scrimmed.toFixed(2)}:1  ${scrimmed >= 4.5 ? 'PASS (AA)' : 'FAIL — needs a stronger scrim'}`,
    );
    console.log('');
  }
}

console.log(`worst region through the scrim: ${worst.toFixed(2)}:1 (AA body text needs 4.5:1)`);
