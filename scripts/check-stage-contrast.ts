/**
 * Does the copy still pass AA over the real footage?
 *
 *   npm run check:contrast
 *
 * `contrast.test.ts` checks the brand's colour PAIRINGS. It cannot see this:
 * with the video stage mounted, `:root[data-webgl='true']` makes the hero,
 * journey, product and quality acts transparent, so their copy sits over a
 * photograph instead of a gradient — and on EVERY path now, including phones
 * and reduced motion, which used to get an opaque gradient and never met the
 * stage at all.
 *
 * Two things this gets right that the first version did not:
 *
 *   1. **Each act's own text colour.** Measuring one colour everywhere is how
 *      you end up "fixing" contrast in a direction that makes three acts worse
 *      to help one. All four bands are now `--bean`, but that is a RESULT of
 *      measuring, not an assumption: `.journey` was cream until this script
 *      showed cream cannot be saved on a light floor at any strength.
 *   2. **The stack as it is actually composited**: the light warm base, then the
 *      footage feathered into it by the radial mask, then the top/bottom wash.
 *      At the frame edges the mask is transparent and what shows is the BASE —
 *      which is where light copy is at its worst, not over the photograph.
 *
 * The soft-light grade layer is not modelled; it nudges midtones and does not
 * move a result across the 4.5 line on its own. Worst cell, never the mean: one
 * specular highlight under one word is a real failure an average erases.
 */
import { loadImage, createCanvas } from '@napi-rs/canvas';

type Rgb = { r: number; g: number; b: number };

/* tokens.css */
const BEAN: Rgb = { r: 0x37, g: 0x11, b: 0x01 };
const CREAM: Rgb = { r: 0xf7, g: 0xf0, b: 0xda };
const MARIGOLD: Rgb = { r: 0xfa, g: 0xaf, b: 0x40 };

const channel = (v: number): number => {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = ({ r, g, b }: Rgb): number =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const contrast = (a: Rgb, b: Rgb): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
};
const mix = (a: Rgb, b: Rgb, t: number): Rgb => ({
  r: a.r * (1 - t) + b.r * t,
  g: a.g * (1 - t) + b.g * t,
  b: a.b * (1 - t) + b.b * t,
});

/** #video-stage background: cream at the top to marigold-22%-on-cream at the bottom. */
const stageBase = (yFraction: number): Rgb => mix(CREAM, mix(CREAM, MARIGOLD, 0.22), yFraction);

/**
 * `.clip__media` mask: radial-gradient(130% 100% at 50% 45%, #000 60%, transparent 100%).
 *
 * A CSS gradient's size percentages are RADII, resolved against the box: 130%
 * means a horizontal radius of 1.3 * width, not 1.3 * half-width. This modelled
 * it as the latter (an extra `* 2` on the distance) and so believed the footage
 * feathered out twice as fast as it does — reporting pale BASE under copy that
 * in reality has photograph under it. That flatters every number, which is the
 * wrong direction for a check whose whole job is to catch dark footage under
 * dark words. `render-stage.ts` had the same halved radius, so the picture and
 * the number agreed with each other and both differed from the browser.
 */
function maskAlpha(xf: number, yf: number): number {
  const dx = (xf - 0.5) / 1.3;
  const dy = (yf - 0.45) / 1.0;
  const d = Math.sqrt(dx * dx + dy * dy);
  if (d <= 0.6) return 1;
  if (d >= 1) return 0;
  return 1 - (d - 0.6) / 0.4;
}

/**
 * `#video-stage::after` — the cream FLOOR.
 *
 * A floor, not a vignette. The edges-only wash this replaced protected the top
 * and bottom of the frame and left the middle bare, which is precisely where
 * the copy band sits: every act measured 1.00:1 there, because bean copy was
 * landing on rgb(44,24,9) footage. Same mistake the old dark stage made in
 * mirror image, so the same rule applies — lift the WHOLE frame to a measured
 * floor, then add the edge wash on top of it.
 *
 * Pass an alpha as argv[2] to sweep it; the default is the shipped value.
 */
const FLOOR = Number(process.argv[2] ?? 0.12);

function washAlpha(yf: number): number {
  const edge = 0.3;
  const extra =
    yf <= 0.22 ? edge * (1 - yf / 0.22) : yf >= 0.78 ? edge * ((yf - 0.78) / 0.22) : 0;
  // floor and edge wash composited in turn: a = f + e - f*e
  return FLOOR + extra - FLOOR * extra;
}

interface Region {
  act: string;
  poster: string;
  /** The act's own colour, from components.css. */
  text: Rgb;
  textName: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** `.act__band::before` — the feathered cream plate behind this act's copy. */
  bandScrim?: boolean;
}

/**
 * `:root[data-webgl='true'] .act__band::before` — the LOCAL cream plate.
 *
 * This is what lets the floor come down. The floor lifted the entire frame to
 * keep four copy bands legible, which is why the photographs read as fog; the
 * plate lifts only the area the words occupy and leaves the rest of the picture
 * alone.
 *
 * Modelled in the band's OWN box, not the viewport, because that is how the CSS
 * is written: `inset: -3% -4%` bleeds the plate past the text, and the radial
 * `130% 120% at 30% 50%` holds 0.86 out to 45% before feathering to nothing.
 * `bx`/`by` are the sample's position within that bled box, 0..1.
 */
const BAND_SCRIM = 0.86;
function bandScrimAlpha(bx: number, by: number): number {
  if (bx < 0 || bx > 1 || by < 0 || by > 1) return 0;
  const dx = (bx - 0.3) / 1.3;
  const dy = (by - 0.5) / 1.2;
  const d = Math.sqrt(dx * dx + dy * dy);
  if (d <= 0.45) return BAND_SCRIM;
  if (d >= 1) return 0;
  return BAND_SCRIM * (1 - (d - 0.45) / 0.55);
}

/**
 * Only the copy that is genuinely ON the stage.
 *
 * The cards are not: `.step` carries a bean-78% backdrop and `.card` is solid
 * cream, so journey and product card copy sits on its own surface and was never
 * at risk. What IS exposed is the section-level band every act opens with —
 * `.eyebrow`, `.h-act`, `.lede` — which sits directly over the footage in all
 * four (HeroCopy, JourneyCopy, Products, Quality all render it outside any card).
 *
 * Left-aligned within `.shell`, so the band is the upper-left two-thirds.
 */
const REGIONS: Region[] = [
  /*
   * The hero is NOT here any more, and its absence is the point.
   *
   * It was rebuilt as a bright split layout that paints its own background and
   * cancels its scrim even under [data-webgl], so no footage reaches it. Copy on
   * a known colour is `contrast.test.ts`'s job — the brand's colour pairings.
   * This script only measures copy that is genuinely over a photograph, and
   * measuring the hero here would report a number for a stack the browser never
   * composites.
   *
   * `hero.jpg` still appears below: it is the JOURNEY act's clip.
   */
  /*
   * .journey's section band. It used to be the one light-on-dark act, and on the
   * dark stage that was right. On a light stage cream copy over cream floor is
   * unreadable at any floor strength, so the band flips to bean copy with the
   * stage on (components.css) and the STEP CARDS keep their cream — they sit on
   * their own bean-78% plate and were never on the stage at all.
   */
  { act: 'journey', poster: 'hero', text: BEAN, textName: 'bean', x: 0.06, y: 0.16, w: 0.62, h: 0.3, bandScrim: true },
  // .product { color: var(--bean) } — heading band above the cards, over the pour.
  { act: 'product', poster: 'product', text: BEAN, textName: 'bean', x: 0.06, y: 0.16, w: 0.62, h: 0.3, bandScrim: true },
  // .quality { color: var(--bean) } — inherits the product clip.
  { act: 'quality', poster: 'product', text: BEAN, textName: 'bean', x: 0.06, y: 0.16, w: 0.62, h: 0.3, bandScrim: true },
];

/** Viewport the sampling models. Desktop is the wide case the vertical clips crop hardest. */
const VW = 1440;
const VH = 900;

const posters = new Map<string, { data: Uint8ClampedArray; w: number; h: number }>();
for (const name of ['hero', 'product']) {
  const image = await loadImage(`public/media/${name}.jpg`);
  // object-fit: cover onto the viewport.
  const scale = Math.max(VW / image.width, VH / image.height);
  const dw = image.width * scale;
  const dh = image.height * scale;
  const canvas = createCanvas(VW, VH);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, (VW - dw) / 2, (VH - dh) / 2, dw, dh);
  posters.set(name, { data: ctx.getImageData(0, 0, VW, VH).data, w: VW, h: VH });
}

let worst = Infinity;
let worstLabel = '';
const failures: string[] = [];

for (const region of REGIONS) {
  const poster = posters.get(region.poster);
  if (!poster) continue;

  const x0 = Math.floor(region.x * VW);
  const y0 = Math.floor(region.y * VH);
  const w = Math.floor(region.w * VW);
  const h = Math.floor(region.h * VH);

  /*
   * The worst cell is simply the one with the LOWEST contrast against this
   * act's text — not the brightest, and not the darkest.
   *
   * Reaching for "brightest for dark copy, darkest for light copy" is the
   * intuitive version and it is wrong in one direction: cream copy fails over
   * BRIGHT areas, so tracking the darkest cell for it reports the best pixel in
   * the block as though it were the worst. Compare ratios directly and the
   * question does not arise.
   */
  const CELLS = 24;
  let hit: Rgb = CREAM;
  let hitRatio = Infinity;
  let hitAt = '';

  for (let cy = 0; cy < CELLS; cy += 1) {
    for (let cx = 0; cx < CELLS; cx += 1) {
      const sx0 = x0 + Math.floor((cx * w) / CELLS);
      const sx1 = x0 + Math.floor(((cx + 1) * w) / CELLS);
      const sy0 = y0 + Math.floor((cy * h) / CELLS);
      const sy1 = y0 + Math.floor(((cy + 1) * h) / CELLS);

      let r = 0;
      let g = 0;
      let b = 0;
      let n = 0;
      for (let y = sy0; y < sy1; y += 2) {
        for (let x = sx0; x < sx1; x += 2) {
          const i = (y * VW + x) * 4;
          const xf = x / VW;
          const yf = y / VH;
          const footage: Rgb = {
            r: poster.data[i] ?? 0,
            g: poster.data[i + 1] ?? 0,
            b: poster.data[i + 2] ?? 0,
          };
          // base -> footage through the feather mask -> top/bottom wash
          let px = mix(stageBase(yf), footage, maskAlpha(xf, yf));
          px = mix(px, CREAM, washAlpha(yf));
          if (region.bandScrim) {
            // Position within the band's bled box (inset: -3% -4% of the band).
            const bw = w * 1.08;
            const bh = h * 1.06;
            const bx = (x - (x0 - w * 0.04)) / bw;
            const by = (y - (y0 - h * 0.03)) / bh;
            px = mix(px, CREAM, bandScrimAlpha(bx, by));
          }
          r += px.r;
          g += px.g;
          b += px.b;
          n += 1;
        }
      }
      if (n === 0) continue;
      const cell = { r: r / n, g: g / n, b: b / n };
      const cellRatio = contrast(region.text, cell);
      if (cellRatio < hitRatio) {
        hitRatio = cellRatio;
        hit = cell;
        hitAt = `${((cx + 0.5) / CELLS * 100).toFixed(0)}%,${((cy + 0.5) / CELLS * 100).toFixed(0)}%`;
      }
    }
  }

  const ratio = hitRatio;
  const pass = ratio >= 4.5;
  if (!pass) failures.push(`${region.act} (${region.textName}) ${ratio.toFixed(2)}:1`);
  if (ratio < worst) {
    worst = ratio;
    worstLabel = `${region.act} (${region.textName} copy)`;
  }

  console.log(`${region.act}  —  ${region.textName} copy over ${region.poster}.jpg`);
  console.log(
    `  worst cell (lowest contrast, at ${hitAt} of the block)  rgb(${hit.r.toFixed(0)}, ${hit.g.toFixed(0)}, ${hit.b.toFixed(0)})`,
  );
  console.log(`  contrast  ${ratio.toFixed(2)}:1   ${pass ? 'PASS (AA)' : 'FAIL — AA body text needs 4.5:1'}`);
  console.log('');
}

console.log(`cream floor under test: ${FLOOR}`);
console.log(`worst: ${worstLabel} at ${worst.toFixed(2)}:1`);
if (failures.length > 0) {
  console.log(`\nFAILING: ${failures.join(', ')}`);
  console.log(
    'Fix by scrimming the act that fails (a local backdrop on its copy block), or\n' +
      'by raising the cream floor in media.css — but check the failing act’s text\n' +
      'colour first. Cream copy gets WORSE as the floor rises, so a cream failure is\n' +
      'never a floor problem.',
  );
}
