/**
 * Build the packaging artwork the 3D scene maps onto its geometry.
 *
 *   npm run build:brand
 *
 * Reads the brand's own logo (`public/brand/willow-logo.png`) and the traced
 * motif in `src/brand/willowPattern.ts`, and writes:
 *
 *   public/brand/pouch-front.png   the pouch's front panel, flat
 *   public/brand/cup-wrap.png      the cup's body, unrolled
 *   public/brand/willow-tile.png   the motif alone on transparent, for the DOM
 *
 * and, for review only, `.render/brand-compare.png` — the generated panel next
 * to the crop of the supplied photograph it was traced from. Look at that file
 * before believing any of this. Output in `public/brand/` is committed; the
 * `.render/` preview is not.
 */
import { GlobalFonts, createCanvas, loadImage } from '@napi-rs/canvas';
import { mkdirSync, writeFileSync } from 'node:fs';
import {
  EXHIBIT_PALETTE,
  brandGradient,
  drawWillowField,
} from '../src/brand/willowPattern';

type Ctx = CanvasRenderingContext2D;

const OUT = 'public/brand';
mkdirSync(OUT, { recursive: true });
mkdirSync('.render', { recursive: true });

// The brand's display face, so the wordmark on the artwork is the same
// typeface the site sets its headings in.
GlobalFonts.registerFromPath('public/fonts/fredoka-latin-var.woff2', 'Fredoka');

const logo = await loadImage('public/brand/willow-logo.png');

/**
 * The logo lockup as it sits on the packaging: the bean mark, then "willow
 * coffee" beneath it. The mark is the brand's own raster and is never redrawn
 * or recoloured (§2) — only placed.
 */
function drawLockup(ctx: Ctx, cx: number, cy: number, markW: number): string[] {
  const markH = markW * (logo.height / logo.width);
  ctx.drawImage(logo, cx - markW / 2, cy - markH / 2, markW, markH);

  // "willow coffee", two lines, set tight under the mark — the lockup on the
  // real bag. The logo PNG is the bean only; the words are type.
  const size = markW * 0.3;
  ctx.save();
  ctx.fillStyle = EXHIBIT_PALETTE.stroke;
  ctx.textAlign = 'center';
  ctx.font = `500 ${Math.round(size)}px Fredoka`;
  ctx.fillText('willow', cx, cy + markH * 0.5 + size * 1.15);
  ctx.fillText('coffee', cx, cy + markH * 0.5 + size * 2.15);
  ctx.restore();

  return [];
}

function panel(width: number, height: number, columns: number, rows: number, seed: number) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d') as unknown as Ctx;

  ctx.fillStyle = brandGradient(ctx, height);
  ctx.fillRect(0, 0, width, height);
  drawWillowField(ctx, width, height, { columns, rows, seed });

  return { canvas, ctx };
}

/* ------------------------------------------------------------ pouch front -- */
{
  const W = 1024;
  const H = 1400;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d') as unknown as Ctx;

  ctx.fillStyle = brandGradient(ctx, H);
  ctx.fillRect(0, 0, W, H);
  // The type block runs from the mark down past "500g"; keep the field off it.
  drawWillowField(ctx, W, H, {
    columns: 4,
    rows: 4,
    seed: 7,
    avoid: { x: W * 0.38, y: H * 0.4, w: W * 0.24, h: H * 0.4 },
  });

  // The lockup sits just below centre on the real bag, with the weight and
  // grade lines beneath it.
  drawLockup(ctx, W * 0.5, H * 0.46, W * 0.19);

  ctx.fillStyle = EXHIBIT_PALETTE.stroke;
  ctx.textAlign = 'center';
  ctx.font = `400 ${Math.round(W * 0.04)}px Fredoka`;
  ctx.fillText('100% arabica', W * 0.5, H * 0.695);
  ctx.font = `500 ${Math.round(W * 0.048)}px Fredoka`;
  ctx.fillText('Premium', W * 0.5, H * 0.775);
  ctx.font = `600 ${Math.round(W * 0.058)}px Fredoka`;
  ctx.fillText('500g', W * 0.5, H * 0.84);

  writeFileSync(`${OUT}/pouch-front.png`, canvas.toBuffer('image/png'));
  console.log('pouch-front.png', `${W}x${H}`);
}

/* --------------------------------------------------------------- cup wrap -- */
{
  // Unrolled: circumference by height. Wider than tall, and the seam falls at
  // the back where the cylinder's UV wraps.
  const W = 1600;
  const H = 900;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d') as unknown as Ctx;

  ctx.fillStyle = brandGradient(ctx, H);
  ctx.fillRect(0, 0, W, H);
  drawWillowField(ctx, W, H, {
    columns: 7,
    rows: 2,
    seed: 13,
    avoid: { x: W * 0.42, y: H * 0.36, w: W * 0.16, h: H * 0.4 },
  });

  drawLockup(ctx, W * 0.5, H * 0.5, W * 0.075);

  writeFileSync(`${OUT}/cup-wrap.png`, canvas.toBuffer('image/png'));
  console.log('cup-wrap.png', `${W}x${H}`);
}

/* ------------------------------------------------- motif alone, for the DOM -- */
{
  const W = 512;
  const H = 640;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d') as unknown as Ctx;
  drawWillowField(ctx, W, H, { columns: 2, rows: 2, seed: 21 });
  writeFileSync(`${OUT}/willow-tile.png`, canvas.toBuffer('image/png'));
  console.log('willow-tile.png', `${W}x${H}`);
}

/* ----------------------------------------- the photographs, as photographs -- */
/*
 * The supplied mockups, resized for the web and written where the DOM can use
 * them. NOT traced, NOT recoloured, NOT cropped to a product — the brand's own
 * packaging shot, used as the packaging shot. This is the half of the artwork
 * problem that no amount of geometry solves: the site had exactly one image on
 * it before this.
 */
for (const [src, out] of [
  ['assets-src/exhibit-amber.png', 'packaging-amber'],
  ['assets-src/exhibit-tan.png', 'packaging-tan'],
] as const) {
  const photo = await loadImage(src);
  const W = 1600;
  const H = Math.round((photo.height / photo.width) * W);
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d') as unknown as Ctx;
  ctx.drawImage(photo, 0, 0, W, H);
  writeFileSync(`${OUT}/${out}.jpg`, canvas.toBuffer('image/jpeg', 82));
  console.log(`${out}.jpg`, `${W}x${H}`);
}

/* ------------------------------------------------------ the honesty check -- */
{
  // The generated panel beside the photograph it was traced from, same scale.
  // If these do not read as the same brand, nothing below matters.
  const source = await loadImage('assets-src/exhibit-amber.png');
  const CH = 900;
  const canvas = createCanvas(1500, CH);
  const ctx = canvas.getContext('2d') as unknown as Ctx;

  ctx.fillStyle = '#d5d5d5';
  ctx.fillRect(0, 0, 1500, CH);

  // Left: the supplied photograph, cropped to the bag's front face.
  ctx.drawImage(source, 430, 80, 1150, 1150, 20, 20, 700, 860);

  // Right: the artwork this script generated.
  const gen = await loadImage(`${OUT}/pouch-front.png`);
  ctx.drawImage(gen, 770, 20, 630, 860);

  ctx.fillStyle = '#222';
  ctx.font = '600 26px sans-serif';
  ctx.fillText('supplied photograph', 24, CH - 20);
  ctx.fillText('generated pouch-front.png', 774, CH - 20);

  writeFileSync('.render/brand-compare.png', canvas.toBuffer('image/png'));
  console.log('.render/brand-compare.png — LOOK AT THIS');
}
