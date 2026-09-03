import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils } from 'three';
import { readAppState } from '../store/useAppStore';
import type { ActId } from '../content/types';

/**
 * The ONLY thing that moves the camera.
 *
 * Acts animate their own objects and never touch the camera. When two components
 * both write to `camera.position` the result is not a compromise, it is a fight
 * that shows up as a jitter nobody can trace. One writer, one table.
 *
 * §8: the hero camera "starts pulled back, pushes in on scroll", and never rolls
 * the logo — so `rotation.z` is never written here, by anyone, ever.
 */
const DOLLY: Record<ActId, { from: number; to: number; y: number }> = {
  hero: { from: 6.2, to: 4.4, y: 0 },
  origin: { from: 5, to: 5, y: 0 },
  journey: { from: 5.4, to: 4.8, y: 0.2 },
  product: { from: 5.6, to: 5, y: 0 },
  quality: { from: 5.5, to: 5.5, y: 0 },
};

export function CameraRig() {
  const camera = useThree((s) => s.camera);

  useFrame((_, delta) => {
    const { activeAct, actProgress, reducedMotion } = readAppState();
    const rig = DOLLY[activeAct];
    const p = actProgress[activeAct] ?? 0;

    const targetZ = MathUtils.lerp(rig.from, rig.to, p);

    if (reducedMotion) {
      camera.position.set(0, rig.y, targetZ);
    } else {
      // Damped rather than snapped, and frame-rate independent: at 30fps the
      // camera must arrive at the same place it does at 120, or the scene reads
      // differently on a slow machine.
      const k = 1 - Math.exp(-6 * delta);
      camera.position.z += (targetZ - camera.position.z) * k;
      camera.position.y += (rig.y - camera.position.y) * k;
      camera.position.x += (0 - camera.position.x) * k;
    }
  });

  return null;
}
