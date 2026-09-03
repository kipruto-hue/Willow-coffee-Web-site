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
          if (id.includes('node_modules')) {
            if (/three|@react-three|postprocessing/.test(id)) return 'three';
            if (/gsap|lenis/.test(id)) return 'scroll';
            return 'vendor';
          }
          if (id.includes('/src/canvas/')) return 'three';
          return undefined;
        },
      },
    },
  },
});
