import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The 3D chunk is deliberately isolated from the entry bundle (master prompt §9):
// the lite path must never download it. Phase 0 has no 3D code yet, but the
// manualChunks rule is in place so the split exists the moment three lands.
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Only the deliberate splits are named here. Everything else is left
          // to Rollup, which puts a module in the dynamic chunk when the dynamic
          // import is the only thing that reaches it. Naming a catch-all
          // 'vendor' chunk defeats that: it pulled react-reconciler and friends
          // — reachable only from the canvas — back into the entry path, and the
          // lite visitor downloaded them for nothing (§9).
          // React first, and on purpose. It is shared between the DOM path and
          // the canvas subtree, and left unnamed Rollup is free to settle those
          // shared modules INTO the manually-named 'three' chunk — at which
          // point the entry chunk imports React from three-*.js, that import is
          // STATIC, and every lite visitor downloads 1.2MB of WebGL to render
          // plain DOM. The entry needs React either way, so giving it its own
          // chunk costs nothing and removes the only reason the entry would
          // have to reach into the 3D chunk at all.
          //
          // The trailing separator matters: `react-reconciler` and
          // `@react-three` must NOT match here — they are reachable only from
          // the canvas and belong in 'three'.
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
            return 'react';
          }
          // Everything the DOM path and the canvas BOTH reach. Left unnamed,
          // Rollup settles these into the 'three' chunk, and then the entry has
          // to import 'three' to get the store, the copy, or the dynamic-import
          // helper itself — a static import of the 1MB bundle, on the lite path,
          // to render plain DOM. Naming them keeps them on the entry side, where
          // they are a few KB.
          //
          // This is the same failure as the old catch-all 'vendor' chunk, from
          // the other direction: that pulled 3D-only code into the entry, this
          // pushed entry code into the 3D chunk. Both end with the lite visitor
          // downloading three.js.
          if (
            id.includes('vite/preload-helper') ||
            /[\\/]node_modules[\\/](zustand|use-sync-external-store)[\\/]/.test(id) ||
            id.includes('/src/store/') ||
            id.includes('/src/content/') ||
            id.includes('/src/lib/')
          ) {
            return 'app';
          }
          if (/[\\/]node_modules[\\/](three|@react-three|postprocessing)[\\/]/.test(id)) {
            return 'three';
          }
          if (/[\\/]node_modules[\\/](gsap|lenis)[\\/]/.test(id)) return 'scroll';
          if (id.includes('/src/canvas/')) return 'three';
          return undefined;
        },
      },
    },
  },
});
