import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Lights } from './Lights';
import { Effects } from './Effects';
import { CameraRig } from './CameraRig';
import { FrameMeter } from './FrameMeter';
import { HeroAct } from './acts/HeroAct';
import { JourneyAct } from './acts/JourneyAct';
import { ProductAct } from './acts/ProductAct';
import { QualityAct } from './acts/QualityAct';
import { useAppStore } from '../store/useAppStore';

/**
 * The single `<Canvas>` for the whole site (§4).
 *
 * Acts mount and unmount by scroll range, so the GPU only ever holds what is
 * near the viewport (§5.2). This module is the entry point of the code-split 3D
 * chunk — `vite.config.ts` routes `src/canvas/` into its own bundle, and the
 * lite path never imports it, so it is never downloaded there (§9).
 *
 * The canvas is transparent: backgrounds are the DOM stage layer. It is also
 * `pointer-events: none` in CSS — the content layer above must stay clickable,
 * and there is nothing here to click.
 */
export default function Scene() {
  const actNear = useAppStore((s) => s.actNear);
  const tier = useAppStore((s) => s.deviceTier);
  const [visible, setVisible] = useState(true);

  // §9: pause the render loop when the tab is hidden, and when no act with 3D
  // content is anywhere near the viewport (the footer half of the page).
  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const anyActNear = actNear.hero || actNear.journey || actNear.product || actNear.quality;
  const running = visible && anyActNear;

  return (
    <Canvas
      // 'demand' would need explicit invalidation on every scroll tick; 'never'
      // when nothing is on screen is the cheaper and more honest switch.
      frameloop={running ? 'always' : 'never'}
      dpr={tier === 'high' ? [1, 2] : [1, 1.5]}
      gl={{
        alpha: true,
        antialias: tier === 'high',
        powerPreference: 'high-performance',
        // The stage background is behind the canvas, so nothing needs to read
        // back what was drawn.
        preserveDrawingBuffer: false,
      }}
      camera={{ fov: 42, position: [0, 0, 6.2], near: 0.1, far: 120 }}
    >
      <Lights />
      <CameraRig />
      <FrameMeter />

      {/* Suspense boundary for the logo texture. Nothing else loads. */}
      <Suspense fallback={null}>
        {actNear.hero && <HeroAct />}
        {actNear.journey && <JourneyAct />}
        {actNear.product && <ProductAct />}
        {actNear.quality && <QualityAct />}
      </Suspense>

      <Effects />
    </Canvas>
  );
}
