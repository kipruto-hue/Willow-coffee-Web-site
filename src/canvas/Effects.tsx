import { Bloom, DepthOfField, EffectComposer, Vignette } from '@react-three/postprocessing';
import { useAppStore } from '../store/useAppStore';

/**
 * Post-processing — HIGH TIER ONLY (§5.5: "mid runs the scene with
 * post-processing off").
 *
 * Bloom for the glow, depth of field for the beans-coming-into-focus read, a
 * subtle vignette (§3). This is the single most expensive thing in the scene, so
 * it is also the first thing to go when the frame meter demotes a device: the
 * component simply stops rendering and the composer unmounts with it.
 */
export function Effects() {
  const tier = useAppStore((s) => s.deviceTier);
  const reducedMotion = useAppStore((s) => s.reducedMotion);

  if (tier !== 'high' || reducedMotion) return null;

  return (
    <EffectComposer enableNormalPass={false}>
      <DepthOfField focusDistance={0.012} focalLength={0.045} bokehScale={3.2} height={480} />
      <Bloom intensity={0.55} luminanceThreshold={0.62} luminanceSmoothing={0.3} mipmapBlur />
      <Vignette eskil={false} offset={0.22} darkness={0.55} />
    </EffectComposer>
  );
}
