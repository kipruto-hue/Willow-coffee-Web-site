import { Suspense, lazy, useEffect, useState } from 'react';
import { SmoothScroll } from './scroll/SmoothScroll';
import { useGlobalProgress } from './scroll/useScrollProgress';
import { useAppStore } from './store/useAppStore';
import { detectStaticTier, hasWebGL, prefersReducedMotion, shouldUseWebGL } from './lib/device';
import { Preloader } from './dom/Preloader';
import { SiteContent } from './SiteContent';
import { StageBackground } from './stage/StageBackground';

import './styles/globals.css';
import './styles/components.css';

/**
 * The routing decision, and nothing else.
 *
 * `SiteContent` always renders — it is the site, and it is identical on both
 * paths (§10). The only question this component answers is whether a canvas
 * gets mounted behind it.
 *
 * `Scene` is a dynamic import so the 3D chunk is never even requested on the
 * lite path (§9: "code-split the canvas so the lite path never downloads it").
 */
const Scene = lazy(() => import('./canvas/Scene'));

export function App() {
  useGlobalProgress();

  const deviceTier = useAppStore((s) => s.deviceTier);
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  const ready = useAppStore((s) => s.ready);
  const [webglOk, setWebglOk] = useState(true);

  useEffect(() => {
    const { setDeviceTier, setReducedMotion } = useAppStore.getState();
    setDeviceTier(detectStaticTier());
    setReducedMotion(prefersReducedMotion());
    setWebglOk(hasWebGL());

    // A visitor can turn reduced motion on mid-session and the site must follow
    // them — including all the way off the WebGL path.
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReducedMotion(motionQuery.matches);
    motionQuery.addEventListener('change', onChange);
    return () => motionQuery.removeEventListener('change', onChange);
  }, []);

  // Hold the canvas back until the preloader has handed over, so shader
  // compilation happens behind the loader rather than in the visitor's face.
  const useWebGL = webglOk && ready && shouldUseWebGL(deviceTier, reducedMotion);

  // Acts with 3D content drop their own backgrounds and let the stage show
  // through. Driven by an attribute so the CSS stays declarative and there is
  // exactly one switch.
  useEffect(() => {
    document.documentElement.dataset.webgl = useWebGL ? 'true' : 'false';
  }, [useWebGL]);

  return (
    <SmoothScroll>
      <Preloader />

      {useWebGL && <StageBackground />}

      <div id="canvas-root" aria-hidden="true">
        {useWebGL && (
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        )}
      </div>

      <SiteContent />
    </SmoothScroll>
  );
}
