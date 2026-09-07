import { useEffect } from 'react';
import { SmoothScroll } from './scroll/SmoothScroll';
import { useGlobalProgress } from './scroll/useScrollProgress';
import { useAppStore } from './store/useAppStore';
import { detectStaticTier, prefersReducedMotion } from './lib/device';
import { Preloader } from './dom/Preloader';
import { SiteContent } from './SiteContent';
import { VideoStage } from './media/VideoStage';

import './styles/globals.css';
import './styles/components.css';

/**
 * The background is now real footage (src/media/VideoStage.tsx), not a WebGL
 * scene. VideoStage renders on every path — it works from poster stills alone,
 * so there is no separate lite branch to route here any more. Device tier and
 * reduced motion still decide whether a layer plays video or holds its still.
 */
export function App() {
  useGlobalProgress();

  useEffect(() => {
    const { setDeviceTier, setReducedMotion } = useAppStore.getState();
    setDeviceTier(detectStaticTier());
    setReducedMotion(prefersReducedMotion());

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReducedMotion(motionQuery.matches);
    motionQuery.addEventListener('change', onChange);
    return () => motionQuery.removeEventListener('change', onChange);
  }, []);

  return (
    <SmoothScroll>
      <Preloader />
      <VideoStage />
      <SiteContent />
    </SmoothScroll>
  );
}
