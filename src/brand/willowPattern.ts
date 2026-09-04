/**
 * The willow-branch motif from the packaging, as drawing code.
 *
 * WHY THIS EXISTS AS CODE AND NOT AS A CROP
 * -----------------------------------------
 * The brand supplied packaging photographs (`assets-src/exhibit-*.png`), not
 * artwork. A crop out of a photograph carries the studio lighting, the creases
 * in the foil and the perspective of the shot baked into every pixel. Mapped
 * onto 3D geometry that is then lit again, it reads as a photo of a bag stuck
 * to a cylinder — worse than the flat colour it replaced.
 *
 * So the motif is traced from the photograph and redrawn: same shape, same
 * white, same gradient (sampled pixel-for-pixel — see `scripts/build-brand-art.ts`),
 * at whatever resolution is asked for, with no lighting of its own.
 *
 * The photographs are still used, unmodified, as photographs — see
 * `public/brand/exhibit-*.jpg` and the product cards in `src/dom/Products.tsx`.
 *
 * Pure Canvas2D on purpose: the browser and the `@napi-rs/canvas` build script
 * drive the exact same functions, so what ships is what was reviewed (the
 * lesson from `willow_render_the_frame` — the harvest scene tests passed on two
 * visibly wrong versions).
 */

/** A 2D context, in either the browser or @napi-rs/canvas. */
type Ctx = CanvasRenderingContext2D;

export interface WillowPalette {
  /** Gradient base, bottom of the panel. */
  amberDeep: string;
  amberOrange: string;
  marigold: string;
  /** Gradient head, top of the panel. */
  amberYellow: string;
  /** The motif stroke. The real artwork is pure white, not `--cream`. */
  stroke: string;
  bean: string;
}

/**
 * Sampled from `assets-src/exhibit-amber.png` down the bag's short axis. These
 * are the mockup's own pixels, and they land on the `tokens.css` values within
 * a couple of levels each — which is what verified the palette.
 */
export const EXHIBIT_PALETTE: WillowPalette = {
  amberDeep: '#B4560A',
  amberOrange: '#DD7310',
  marigold: '#FAAF40',
  amberYellow: '#F1C82D',
  stroke: '#FFFFFF',
  bean: '#371101',
};

/**
 * One leaf: a narrow lance, wide near the stem, tapering to a point.
 *
 * Drawn as two quadratic curves meeting at the tip. `bow` bends the leaf away
 * from its own axis so a branch never reads as a mechanical repeat.
 */
function leaf(
  ctx: Ctx,
  x: number,
  y: number,
  angle: number,
  len: number,
  width: number,
  curl: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // A tapered crescent: pointed at the stem, pointed at the tip, widest around
  // the middle, and bowed along its length so it droops. Pointed at BOTH ends is
  // what separates the willow leaf in the artwork from a wheat ear — a lance
  // that is blunt at the stem reads as a cereal head, not a willow.
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(len * 0.45, -width + curl * 0.5, len, curl);
  ctx.quadraticCurveTo(len * 0.45, width * 0.32 + curl * 0.5, 0, 0);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

export interface BranchOptions {
  /** Overall height of the branch, tip of stem to base. */
  length: number;
  /** Leaf pairs along the stem. The artwork runs 5–6, widely spaced. */
  pairs?: number;
  /** How far the stem bends off vertical, in units of `length`. */
  sway?: number;
  /** Deterministic variation seed, so a tile is reproducible. */
  seed?: number;
}

/** Cheap deterministic jitter — a tile must render identically every time. */
function rand(seed: number): () => number {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * One drooping willow branch, drawn from its base at the origin, growing upward
 * (−y). Fill colour is whatever the caller set on the context.
 *
 * Shape, from the packaging: a long stem that curves as it rises and continues
 * past the topmost leaves as a bare tip; leaf pairs sweeping up and outward,
 * shortest at the very top and very bottom, longest through the middle third.
 */
export function drawWillowBranch(ctx: Ctx, opts: BranchOptions): void {
  const { length, pairs = 7, sway = 0.3, seed = 1 } = opts;
  const rng = rand(seed);

  // The stem, as a quadratic from base to tip.
  const tipX = sway * length;
  const tipY = -length;
  const ctrlX = -sway * length * 0.25;
  const ctrlY = -length * 0.5;

  /** Point on the stem at parameter t (0 = base, 1 = tip). */
  const stemAt = (t: number): [number, number] => {
    const u = 1 - t;
    return [
      u * u * 0 + 2 * u * t * ctrlX + t * t * tipX,
      u * u * 0 + 2 * u * t * ctrlY + t * t * tipY,
    ];
  };

  // Stem: a tapering sliver rather than a stroke, so it thins toward the tip
  // the way a brush-drawn line does.
  const stemW = length * 0.011;
  ctx.beginPath();
  ctx.moveTo(-stemW, 0);
  ctx.quadraticCurveTo(ctrlX - stemW * 0.4, ctrlY, tipX, tipY);
  ctx.quadraticCurveTo(ctrlX + stemW * 0.4, ctrlY, stemW, 0);
  ctx.closePath();
  ctx.fill();

  // Leaves. `t` runs from just above the base to well short of the tip, leaving
  // the long bare curved stem-tail the artwork hangs the branch from.
  //
  // Left and right leaves are STAGGERED along the stem rather than emerging as
  // true pairs. The artwork alternates; drawing them opposite each other at the
  // same height is what turns the motif into a symmetric fishbone.
  const total = pairs * 2;
  for (let i = 0; i < total; i += 1) {
    const side = i % 2 === 0 ? -1 : 1;
    const t = 0.1 + (i / (total - 1)) * 0.72;
    const [sx, sy] = stemAt(t);

    // Longest through the lower-middle, shortening toward the tip.
    const taper = 0.5 + 0.5 * Math.sin(Math.PI * Math.min(1, Math.max(0, (t - 0.02) / 0.85)));
    const len = length * 0.26 * taper * (0.88 + rng() * 0.24);
    // The artwork's leaves run about 6:1 long to wide — slivers, but bold
    // enough to hold at packaging scale rather than reading as needles.
    const width = len * 0.17;

    // The shallow sweep is the whole character of the motif. Measured off the
    // mockup at 22–38° off the stem, opening a little wider toward the base.
    // At 50° the leaves read perpendicular and the branch becomes a fishbone.
    const spread = (Math.PI / 180) * (28 + (1 - t) * 14);
    const lean = sway * (1 - t) * 0.7;
    // The arc. Each leaf bows away from its own axis so it reads as a drawn
    // stroke rather than a straight spine.
    const curl = len * (0.38 + (1 - t) * 0.2);

    leaf(ctx, sx, sy, -Math.PI / 2 + side * spread + lean, len, width, side * curl);
  }
}

/**
 * The vertical brand gradient: `--amber-deep` at the base rising to
 * `--amber-yellow`. Stops placed where the sampled pixels put them.
 */
export function brandGradient(
  ctx: Ctx,
  height: number,
  palette: WillowPalette = EXHIBIT_PALETTE,
): CanvasGradient {
  const g = ctx.createLinearGradient(0, height, 0, 0);
  g.addColorStop(0, palette.amberDeep);
  g.addColorStop(0.3, palette.amberOrange);
  g.addColorStop(0.68, palette.marigold);
  g.addColorStop(1, palette.amberYellow);
  return g;
}

export interface PatternOptions {
  /** Branches across the panel's width. The packaging runs about 3. */
  columns?: number;
  rows?: number;
  palette?: WillowPalette;
  seed?: number;
  /**
   * A rectangle the pattern keeps clear, for the logo lockup and the weight
   * lines. The printed bag leaves the type room to breathe; without this the
   * field runs straight through "Premium 500g" and neither reads.
   */
  avoid?: { x: number; y: number; w: number; h: number };
}

/**
 * Lay the motif across a panel in the packaging's staggered grid: alternate rows
 * offset by half a column, each branch rotated a few degrees off vertical so the
 * field reads as drawn rather than stamped.
 *
 * Assumes the caller has already painted the background.
 */
export function drawWillowField(
  ctx: Ctx,
  width: number,
  height: number,
  opts: PatternOptions = {},
): void {
  const { columns = 4, rows = 4, palette = EXHIBIT_PALETTE, seed = 7, avoid } = opts;
  const rng = rand(seed);

  const cw = width / columns;
  const rh = height / rows;
  const branchLen = rh * 0.92;

  ctx.save();
  ctx.fillStyle = palette.stroke;

  // One row of overdraw top and bottom so the field runs off the panel edges
  // the way the printed artwork does — no visible margin of empty gradient.
  for (let r = -1; r <= rows; r += 1) {
    const offset = r % 2 === 0 ? 0 : cw * 0.5;
    for (let c = -1; c <= columns; c += 1) {
      const x = c * cw + cw * 0.5 + offset;
      const y = r * rh + rh * 0.98;

      // Skip any branch whose body would cross the reserved type area.
      if (
        avoid &&
        x > avoid.x - cw * 0.55 &&
        x < avoid.x + avoid.w + cw * 0.55 &&
        y > avoid.y &&
        y - branchLen < avoid.y + avoid.h
      ) {
        continue;
      }

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rng() - 0.5) * 0.34);
      drawWillowBranch(ctx, {
        length: branchLen * (0.86 + rng() * 0.26),
        pairs: 6 + Math.floor(rng() * 3),
        sway: 0.1 + rng() * 0.16,
        seed: Math.floor(rng() * 10000),
      });
      ctx.restore();
    }
  }

  ctx.restore();
}
