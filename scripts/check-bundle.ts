/**
 * Budget guard for §9.
 *
 * Two promises the brief makes that are easy to break silently:
 *
 *   1. "code-split the canvas so the lite path never downloads it" — one stray
 *      static import of anything under src/canvas/ pulls the whole 1MB three
 *      bundle into the entry chunk, and nothing else in the build would complain.
 *   2. "total initial JS under ~400KB gzipped before the 3D chunk".
 *
 * Both are checked here against the real build output. Runs in CI.
 */
import { gzipSync } from 'node:zlib';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ASSETS = 'dist/assets';
const BUDGET_KB = 400;

const files = readdirSync(ASSETS);
const js = files.filter((f) => f.endsWith('.js'));

const threeChunks = js.filter((f) => f.startsWith('three-'));
const entryChunks = js.filter((f) => !f.startsWith('three-'));

if (threeChunks.length === 0) {
  throw new Error(
    'check-bundle: no three-*.js chunk found. Either the 3D code is gone, or it ' +
      'has been merged into the entry bundle — check vite.config.ts manualChunks.',
  );
}

// A WebGL renderer in the entry path means the split has collapsed.
for (const file of entryChunks) {
  const source = readFileSync(join(ASSETS, file), 'utf8');
  if (source.includes('WebGLRenderer')) {
    throw new Error(
      `check-bundle: ${file} is in the entry path and contains three.js ` +
        '(WebGLRenderer). The lite path would download the 3D bundle. §9 forbids it.',
    );
  }
}

/**
 * Everything a lite visitor downloads: every chunk except the dynamically
 * imported 3D one, plus the CSS. Conservative — it counts chunks a given visitor
 * may not even request.
 */
const initial = [...entryChunks, ...files.filter((f) => f.endsWith('.css'))];
const bytes = initial.reduce(
  (total, file) => total + gzipSync(readFileSync(join(ASSETS, file))).length,
  0,
);
const kb = bytes / 1024;

for (const file of initial) {
  const size = gzipSync(readFileSync(join(ASSETS, file))).length / 1024;
  console.log(`  ${file.padEnd(30)} ${size.toFixed(1)}KB gz`);
}
const threeKb =
  threeChunks.reduce((t, f) => t + gzipSync(readFileSync(join(ASSETS, f))).length, 0) / 1024;
console.log(`  (3D chunk, lazy)               ${threeKb.toFixed(1)}KB gz`);
console.log(`\ninitial payload: ${kb.toFixed(1)}KB gz / ${BUDGET_KB}KB budget`);

if (kb > BUDGET_KB) {
  throw new Error(`check-bundle: initial payload ${kb.toFixed(1)}KB exceeds the ${BUDGET_KB}KB budget (§9).`);
}

console.log('ok');
