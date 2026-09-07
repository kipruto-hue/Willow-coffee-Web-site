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

/**
 * No 3D chunk at all is now the EXPECTED state, not a failure.
 *
 * The background is real footage (src/media/, docs/VIDEO.md); nothing imports
 * src/canvas/ any more, so Rollup never emits a three chunk. This check used to
 * throw here, on the reasoning that a missing chunk meant the split had
 * collapsed into the entry — so the guard has to distinguish "gone" from
 * "merged in". The checks below do that directly: if 3D code had been folded
 * into the entry path, `WebGLRenderer` would be sitting in an entry chunk, and
 * that is still an error whether or not a three-*.js file exists.
 *
 * The files under src/canvas/ are still in the tree, unimported. If they are
 * ever wired back up, the chunk reappears and every assertion below applies to
 * it again unchanged.
 */
if (threeChunks.length === 0) {
  console.log('  (no 3D chunk — the background is video; src/canvas/ is unimported)');
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
 * ...and the check above is not enough on its own, which is how this shipped.
 *
 * The entry chunk contained no `WebGLRenderer` — it was in three-*.js, exactly
 * where it belongs — while the entry chunk STATICALLY IMPORTED three-*.js to get
 * React, which Rollup had settled into it. A static import is not lazy: Vite
 * duly emitted `<link rel="modulepreload" href="/assets/three-*.js">` into
 * index.html, and every lite visitor downloaded 335KB gz of WebGL to render
 * plain DOM. The guard said "ok" and reported a 62.8KB initial payload
 * throughout.
 *
 * So assert the actual property — nothing a lite visitor loads may REACH the 3D
 * chunk — in both places it is observable: the import graph, and the HTML.
 */
for (const file of entryChunks) {
  const source = readFileSync(join(ASSETS, file), 'utf8');
  for (const threeChunk of threeChunks) {
    /**
     * STATIC imports only — `from"./three-x.js"` or a bare `import"./three-x.js"`.
     *
     * The entry chunk legitimately names the 3D chunk twice more: inside
     * `import("./three-x.js")` and in Vite's `__vite__mapDeps` array, which is
     * how the lazy chunk and its preloads are resolved at the moment the user
     * actually needs them. A plain `includes()` here fails on those and reports
     * a collapse that has not happened — the trailing `(` and the quoted array
     * entry are exactly what separates lazy from eager.
     */
    const escaped = threeChunk.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const staticImport = new RegExp(`(?:from|import)\\s*["']\\./${escaped}["']`);
    if (staticImport.test(source)) {
      throw new Error(
        `check-bundle: ${file} is in the entry path and statically imports ` +
          `${threeChunk}. That import is eager however lazy the React component ` +
          'is — the lite path downloads the whole 3D bundle. Check the ' +
          'manualChunks split in vite.config.ts: a module shared between the DOM ' +
          'path and the canvas has probably been absorbed into the three chunk.',
      );
    }
  }
}

const html = readFileSync('dist/index.html', 'utf8');
for (const threeChunk of threeChunks) {
  if (html.includes(threeChunk)) {
    throw new Error(
      `check-bundle: dist/index.html references ${threeChunk} (almost certainly ` +
        'a modulepreload link). Every visitor fetches it before a line of app ' +
        'code runs. The 3D chunk must be reachable only through the dynamic ' +
        'import in App.tsx.',
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
if (threeChunks.length > 0) {
  const threeKb =
    threeChunks.reduce((t, f) => t + gzipSync(readFileSync(join(ASSETS, f))).length, 0) / 1024;
  console.log(`  (3D chunk, lazy)               ${threeKb.toFixed(1)}KB gz`);
}
console.log(`\ninitial payload: ${kb.toFixed(1)}KB gz / ${BUDGET_KB}KB budget`);

if (kb > BUDGET_KB) {
  throw new Error(`check-bundle: initial payload ${kb.toFixed(1)}KB exceeds the ${BUDGET_KB}KB budget (§9).`);
}

console.log('ok');
