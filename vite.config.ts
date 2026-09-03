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
