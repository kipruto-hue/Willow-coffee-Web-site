/**
 * The procedural harvest scene — Act 2's scrubbed visual (master prompt §8).
 *
 * WHY THIS EXISTS
 * The real 60–120 frame sequence of hand-picking in the North Rift does not
 * exist yet (docs/ASSETS.md). §7 says fall back rather than block, and §2 says
 * no fake data — which rules out dropping in stock footage of somebody else's
 * farm and implying it is Willow's. So the fallback renders rather than
 * pretends: the camera travels down a row of coffee, branches sweeping past,
 * cherries passing through focus. Scrolling moves the harvest.
 *
 * ART DIRECTION
 * Erick's reference frame: a near-black ground, one hot low key light, heavy
 * bokeh, fine particles glinting, everything else falling into shadow. The
 * principle, not the picture — nothing here reproduces that image. Graded from
 * `--willow-green` highland light at the top of the act to deep amber at the
 * exit, which is what hands over to the Journey act (§8).
 *
 * WHAT MAKES IT READ AS A PLACE
 * Structure, not atmosphere. Bokeh alone is wallpaper. The scene is built from
 * branches — a stem, leaves, and cherry clusters — travelling toward the camera
 * at different depths, with dark out-of-focus foliage framing the frame edges,
 * so the eye has something to be looking *through* and *at*.
 *
 * DETERMINISM IS THE POINT
 * Every position is a pure function of `progress`. Scrub backwards and you get
 * the identical frame — which is what makes this a *sequence* being scrubbed
 * rather than an animation that happens to be near the scroll position. Nothing
 * accumulates state between frames.
 */

export type SceneQuality = 'high' | 'mid' | 'low';

export interface ScenePalette {
  bean: string;
  beanSoft: string;
  marigold: string;
  amberOrange: string;
  amberYellow: string;
  amberDeep: string;
  cream: string;
  willowGreen: string;
  maroon: string;
}

/** Deterministic PRNG. Same seed, same scene, forever. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Leaf {
  /** Position along the stem, 0..1. */
  u: number;
  angle: number;
  len: number;
  side: number;
}

interface Cherry {
  u: number;
  spread: number;
  r: number;
  ripe: number;
}

interface Branch {
  /** Where this branch sits along the row. The camera travels through these. */
  t: number;
  /** -1 enters from the left, +1 from the right. */
  side: number;
  /** Vertical placement, 0 top .. 1 bottom. */
  y: number;
  /** Stem droop. */
  bend: number;
  tilt: number;
  leaves: Leaf[];
  cherries: Cherry[];
}

interface Bokeh {
  x: number;
  y: number;
  r: number;
  depth: number;
  alpha: number;
  warm: number;
}

interface Mote {
  x: number;
  y: number;
  r: number;
  speed: number;
  drift: number;
}

export interface SceneModel {
  branches: Branch[];
  bokeh: Bokeh[];
  motes: Mote[];
  quality: SceneQuality;
}

const COUNTS: Record<
  SceneQuality,
  { branches: number; leaves: number; cherries: number; bokeh: number; motes: number }
> = {
  high: { branches: 14, leaves: 9, cherries: 7, bokeh: 18, motes: 70 },
  mid: { branches: 9, leaves: 6, cherries: 5, bokeh: 10, motes: 30 },
  low: { branches: 5, leaves: 5, cherries: 4, bokeh: 6, motes: 0 },
};

/**
 * Built once per quality tier and reused for every frame. Generating geometry
 * inside the draw call would be both slower and non-deterministic.
 */
export function buildScene(quality: SceneQuality, seed = 0x77_11_0c): SceneModel {
  const rand = mulberry32(seed);
  const counts = COUNTS[quality];

  const branches: Branch[] = Array.from({ length: counts.branches }, (_, i) => ({
    // Evenly spaced along the row, then jittered — an even spread is what keeps
    // the travel feeling continuous instead of clumping into gusts.
    t: (i + rand() * 0.6) / counts.branches,
    side: i % 2 === 0 ? -1 : 1,
    y: 0.18 + rand() * 0.6,
    bend: 0.35 + rand() * 0.5,
    tilt: (rand() - 0.5) * 0.5,
    leaves: Array.from({ length: counts.leaves }, (_, j) => ({
      u: 0.12 + (j / counts.leaves) * 0.85 + rand() * 0.05,
      angle: (rand() - 0.5) * 0.9,
      len: 0.55 + rand() * 0.6,
      side: j % 2 === 0 ? 1 : -1,
    })),
    cherries: Array.from({ length: counts.cherries }, () => ({
      u: 0.25 + rand() * 0.7,
      spread: (rand() - 0.5) * 0.9,
      r: 0.7 + rand() * 0.6,
      ripe: rand(),
    })),
  }));

  const bokeh: Bokeh[] = Array.from({ length: counts.bokeh }, () => ({
    x: rand(),
    y: rand() * 0.8,
    r: 0.04 + rand() * 0.12,
    depth: 0.15 + rand() * 0.85,
    alpha: 0.05 + rand() * 0.16,
    warm: rand(),
  }));

  const motes: Mote[] = Array.from({ length: counts.motes }, () => ({
    x: rand(),
    y: rand(),
    r: 0.0008 + rand() * 0.002,
    speed: 0.3 + rand() * 1.4,
    drift: rand() * 2 - 1,
  }));

  return { branches, bokeh, motes, quality };
}

/* ------------------------------------------------------------- helpers -- */

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

type Rgb = readonly [number, number, number];

const toRgb = (hex: string): Rgb => {
  const p = parseInt(hex.slice(1), 16);
  return [(p >> 16) & 255, (p >> 8) & 255, p & 255];
};

/**
 * Colours are mixed as component triples rather than as CSS strings, so one
 * colour can be reused at several alphas without re-parsing. Every one of them
 * still traces back to a token in tokens.css.
 */
function mixRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return [
    Math.round(lerp(a[0], b[0], t)),
    Math.round(lerp(a[1], b[1], t)),
    Math.round(lerp(a[2], b[2], t)),
  ];
}

const mix = (a: string, b: string, t: number): Rgb => mixRgb(toRgb(a), toRgb(b), t);
const css = (c: Rgb, alpha = 1) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha})`;
const rgba = (hex: string, alpha: number) => css(toRgb(hex), alpha);
const TRANSPARENT = 'rgba(0, 0, 0, 0)';

/** A soft disc — the honest way to draw something out of focus without a blur filter. */
function disc(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  colour: Rgb,
  alpha: number,
  core = 0.25,
) {
  if (r <= 0.4 || alpha <= 0.004) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, css(colour, alpha));
  g.addColorStop(core, css(colour, alpha * 0.8));
  g.addColorStop(1, TRANSPARENT);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Depth of field. Branches are sharp only in a band of the travel; nearer and
 * farther they dissolve. This is what carries the "beans coming into focus"
 * feeling the brief asks for, and it is cheap: one number gating two draw paths.
 */
const focusAt = (near: number) => 1 - clamp01(Math.abs(near - 0.42) / 0.34);

/* ---------------------------------------------------------------- draw -- */

/**
 * Draw one frame.
 *
 * @param progress 0..1 through Act 2. 0 is the row ahead of you; 1 is the row
 *                 behind you, the light gone amber, ready for the handover.
 */
export function drawHarvestFrame(
  ctx: CanvasRenderingContext2D,
  model: SceneModel,
  palette: ScenePalette,
  width: number,
  height: number,
  progress: number,
) {
  const p = clamp01(progress);
  const min = Math.min(width, height);
  const warmth = p * p;

  const shadow = mix(palette.bean, '#000000', 0.38);
  const canopy = mix(palette.willowGreen, palette.amberDeep, lerp(0.25, 0.95, warmth));
  const key = mix(palette.amberYellow, palette.amberOrange, warmth * 0.7);
  const leafColour = mix(palette.willowGreen, palette.bean, lerp(0.7, 0.86, warmth));

  /* --- ground: dark, so the light has something to be bright against ----- */
  const base = ctx.createLinearGradient(0, 0, 0, height);
  base.addColorStop(0, css(mixRgb(canopy, shadow, 0.55)));
  base.addColorStop(0.38, css(mixRgb(canopy, shadow, 0.78)));
  base.addColorStop(1, css(shadow));
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);

  /* --- key light: one low sun, travelling as the camera does ------------- */
  const sunX = lerp(0.28, 0.72, p) * width;
  const sunY = lerp(0.34, 0.2, p) * height;
  const sunR = min * lerp(0.5, 0.72, p);
  // Sun behind foliage, never a visible disc: a hard core reads as a lamp in the
  // room rather than daylight beyond the row.
  const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR);
  glow.addColorStop(0, rgba(palette.amberYellow, 0.5));
  glow.addColorStop(0.18, rgba(palette.amberOrange, 0.34));
  glow.addColorStop(0.5, rgba(palette.amberDeep, 0.15));
  glow.addColorStop(1, TRANSPARENT);

  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'source-over';

  /* --- far bokeh: light through leaves, well behind the row -------------- */
  ctx.globalCompositeOperation = 'screen';
  for (const b of model.bokeh) {
    const drift = (1 - b.depth) * 0.3;
    const x = (((b.x + p * drift * 1.4) % 1.2) - 0.1) * width;
    const y = (b.y - p * drift * 0.18) * height;
    const r = b.r * min * lerp(0.6, 1.2, b.depth);
    const fall = clamp01(1 - Math.hypot(x - sunX, y - sunY) / (sunR * 1.5));
    disc(ctx, x, y, r, mixRgb(key, toRgb(palette.cream), b.warm * 0.5), b.alpha * (0.35 + fall));
  }
  ctx.globalCompositeOperation = 'source-over';

  /* --- the row --------------------------------------------------------- */
  // Sorted far-to-near so nearer branches occlude farther ones.
  const ordered = model.branches
    .map((branch) => {
      const travel = (branch.t + p * 1.1) % 1;
      return { branch, travel, near: travel * travel };
    })
    .sort((a, b) => a.near - b.near);

  for (const { branch, travel, near } of ordered) {
    const scale = lerp(0.3, 2.9, near);
    const focus = focusAt(near);
    // Fade in from the far distance, and out as it sweeps past the lens.
    const alpha = Math.min(1, travel * 5) * (1 - clamp01((near - 0.74) / 0.26));
    if (alpha <= 0.02) continue;

    // Branches enter from the sides and swing outward as they approach.
    const rootX = (0.5 + branch.side * lerp(0.22, 1.15, near)) * width;
    const rootY = (branch.y + near * 0.1) * height;
    const len = min * 0.55 * scale;
    const tipX = rootX - branch.side * len;
    const tipY = rootY + len * branch.bend * 0.55;
    const ctrlX = rootX - branch.side * len * 0.5;
    const ctrlY = rootY + len * branch.tilt;

    // Sample the stem so leaves and fruit sit ON it, not merely near it.
    const at = (u: number) => {
      const iu = 1 - u;
      return {
        x: iu * iu * rootX + 2 * iu * u * ctrlX + u * u * tipX,
        y: iu * iu * rootY + 2 * iu * u * ctrlY + u * u * tipY,
      };
    };

    const lightSide = Math.sign(sunX - rootX) || 1;
    const sharp = focus > 0.5;

    /* stem */
    if (sharp) {
      ctx.strokeStyle = css(mixRgb(leafColour, shadow, 0.35), alpha * 0.9);
      ctx.lineWidth = Math.max(0.8, min * 0.004 * scale);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(rootX, rootY);
      ctx.quadraticCurveTo(ctrlX, ctrlY, tipX, tipY);
      ctx.stroke();
    }

    /* leaves */
    for (const leaf of branch.leaves) {
      const pt = at(leaf.u);
      const lr = min * 0.046 * scale * leaf.len;
      if (lr < 0.5) continue;
      const angle = branch.side * -0.4 + leaf.angle + leaf.side * 0.55;
      if (sharp) {
        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate(angle);
        // Lit face toward the sun, shadowed face away — the whole read.
        // Coffee leaves are dark and waxy. They catch a narrow specular streak
        // rather than turning the colour of the light, which is what made an
        // earlier pass look like pale olive leaves.
        // Broad ovals, and only a narrow specular streak on the lit side. An
        // earlier pass mixed the whole leaf toward the key colour and the row
        // came out looking like pale olive rather than dark waxy coffee.
        const lit = leaf.side === lightSide ? 0.09 : 0.02;
        const variance = (leaf.len - 0.85) * 0.12;
        ctx.fillStyle = css(mixRgb(leafColour, key, Math.max(0, lit + variance)), alpha * 0.95);
        ctx.beginPath();
        ctx.ellipse(lr * 0.8, 0, lr, lr * 0.42, 0, 0, Math.PI * 2);
        ctx.fill();
        if (leaf.side === lightSide) {
          ctx.fillStyle = css(key, alpha * 0.1 * focus);
          ctx.beginPath();
          ctx.ellipse(lr * 0.9, -lr * 0.12, lr * 0.4, lr * 0.05, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      } else {
        disc(ctx, pt.x, pt.y, lr * 1.1, mixRgb(leafColour, key, 0.2), alpha * 0.16 * (1 - focus));
      }
    }

    /* cherries */
    for (const cherry of branch.cherries) {
      const pt = at(cherry.u);
      const cr = min * 0.017 * scale * cherry.r;
      if (cr < 0.4) continue;
      const cx = pt.x + cherry.spread * cr * 2.6;
      const cy = pt.y + Math.abs(cherry.spread) * cr * 1.4;
      if (cx < -cr * 3 || cx > width + cr * 3) continue;

      // Ripe fruit is deep red; §8 is emphatic that only the deepest red cherries
      // are picked, so the row skews ripe rather than green.
      const flesh = mixRgb(
        mix(palette.maroon, '#000000', 0.25),
        toRgb(palette.amberOrange),
        cherry.ripe * 0.55,
      );

      if (!sharp) {
        disc(ctx, cx, cy, cr * 2.2, flesh, alpha * 0.3 * (1 - focus) + 0.02, 0.45);
        continue;
      }

      ctx.globalAlpha = alpha;
      ctx.fillStyle = css(flesh);
      ctx.beginPath();
      ctx.ellipse(cx, cy, cr, cr * 1.08, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rim light on the sun side, then a small specular — this is what turns a
      // flat circle into fruit.
      const rimX = cx + lightSide * cr * 0.55;
      const rimY = cy - cr * 0.5;
      const rim = ctx.createRadialGradient(rimX, rimY, 0, rimX, rimY, cr * 1.3);
      rim.addColorStop(0, css(key, 0.55 * focus));
      rim.addColorStop(1, TRANSPARENT);
      ctx.fillStyle = rim;
      ctx.beginPath();
      ctx.arc(cx, cy, cr * 1.05, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = rgba(palette.cream, 0.5 * focus);
      ctx.beginPath();
      ctx.ellipse(
        cx + lightSide * cr * 0.34,
        cy - cr * 0.36,
        cr * 0.2,
        cr * 0.14,
        -0.5,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  /* --- foreground foliage: near-black, far out of focus, framing --------- */
  // You are looking THROUGH the row, not at a diorama of it.
  const frameCount = model.quality === 'low' ? 2 : 4;
  for (let i = 0; i < frameCount; i += 1) {
    const side = i % 2 === 0 ? 0 : 1;
    const phase = (p * 0.55 + i * 0.27) % 1;
    const x = (side ? 1.05 - phase * 0.35 : -0.05 + phase * 0.35) * width;
    const y = (0.12 + i * 0.24 + phase * 0.12) * height;
    disc(ctx, x, y, min * (0.3 + i * 0.05), shadow, 0.5, 0.55);
  }

  /* --- dust and chaff in the light --------------------------------------- */
  ctx.globalCompositeOperation = 'screen';
  for (const m of model.motes) {
    const y = (((m.y + p * m.speed * 0.5) % 1.1) - 0.05) * height;
    const x = ((m.x + Math.sin((p * 3 + m.drift * 6) * Math.PI) * 0.02) % 1) * width;
    const glint = clamp01(1 - Math.hypot(x - sunX, y - sunY) / sunR);
    if (glint <= 0.03) continue;
    ctx.fillStyle = rgba(palette.cream, 0.55 * glint * glint);
    ctx.beginPath();
    ctx.arc(x, y, m.r * min, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';

  /* --- floor fall-off and vignette --------------------------------------- */
  const floor = ctx.createLinearGradient(0, height * 0.5, 0, height);
  floor.addColorStop(0, TRANSPARENT);
  floor.addColorStop(1, css(shadow, 0.8));
  ctx.fillStyle = floor;
  ctx.fillRect(0, height * 0.5, width, height * 0.5);

  const vig = ctx.createRadialGradient(
    width * 0.5,
    height * 0.44,
    min * 0.2,
    width * 0.5,
    height * 0.5,
    min * 0.95,
  );
  vig.addColorStop(0, TRANSPARENT);
  vig.addColorStop(1, css(shadow, 0.55));
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, width, height);

  /* --- exit flare: masks the swap into Act 3 (§8, §5.4) ------------------- */
  // Kept deliberately restrained. A flare that whites the frame out does not
  // mask a transition, it deletes the last thing the visitor was looking at.
  if (p > 0.88) {
    const flare = (p - 0.88) / 0.12;
    ctx.globalCompositeOperation = 'screen';
    const g = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 1.4);
    g.addColorStop(0, rgba(palette.amberYellow, flare * flare * 0.5));
    g.addColorStop(1, TRANSPARENT);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';
  }
}
