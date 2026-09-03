/**
 * Render Act 2's scrubbed scene to PNGs so a human can look at it.
 *
 * A passing test proves the code runs; it says nothing about whether the frame
 * is any good. This drives the real `drawHarvestFrame` through @napi-rs/canvas
 * — the same function the browser calls, not a reimplementation — and writes a
 * contact sheet of frames across the act.
 *
 *   npm run render:harvest
 *
 * Output lands in `.render/` (git-ignored). Dev tooling only; it is not part of
 * the site bundle.
 */
import { createCanvas } from '@napi-rs/canvas';
import { mkdirSync, writeFileSync } from 'node:fs';
import { buildScene, drawHarvestFrame, type ScenePalette } from '../src/origin/harvestScene';

// The tokens from src/styles/tokens.css. Kept in sync by eye here because this
// is a dev script; the browser reads the real custom properties at runtime.
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

const WIDTH = 720;
const HEIGHT = 900;
const STEPS = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1];

mkdirSync('.render', { recursive: true });

const model = buildScene('high');

for (const p of STEPS) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  drawHarvestFrame(
    ctx as unknown as CanvasRenderingContext2D,
    model,
    palette,
    WIDTH,
    HEIGHT,
    p,
  );
  const name = `.render/harvest-${String(Math.round(p * 100)).padStart(3, '0')}.png`;
  writeFileSync(name, canvas.toBuffer('image/png'));
  console.log('wrote', name);
}

// Contact sheet: all steps side by side, which is how you actually judge whether
// a scrub reads as one continuous move rather than eight unrelated pictures.
const cols = STEPS.length;
const thumbW = 300;
const thumbH = Math.round((HEIGHT / WIDTH) * thumbW);
const sheet = createCanvas(thumbW * cols, thumbH);
const sctx = sheet.getContext('2d');
STEPS.forEach((p, i) => {
  const frame = createCanvas(WIDTH, HEIGHT);
  const fctx = frame.getContext('2d');
  drawHarvestFrame(
    fctx as unknown as CanvasRenderingContext2D,
    model,
    palette,
    WIDTH,
    HEIGHT,
    p,
  );
  sctx.drawImage(frame, i * thumbW, 0, thumbW, thumbH);
});
writeFileSync('.render/harvest-contact-sheet.png', sheet.toBuffer('image/png'));
console.log('wrote .render/harvest-contact-sheet.png');
