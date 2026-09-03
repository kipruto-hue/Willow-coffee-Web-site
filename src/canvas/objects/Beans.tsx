import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, InstancedMesh, MathUtils, Object3D } from 'three';
import { brandColors } from '../palette';
import { readAppState } from '../../store/useAppStore';
import type { ActId } from '../../content/types';

/**
 * Coffee beans, as ONE InstancedMesh (§9: "instance beans; never create them in
 * a loop as separate meshes"). 40–120 instances, count by tier.
 *
 * §7's primary asset is a low-poly bean GLTF, which does not exist. This is the
 * documented fallback: a squashed sphere with a crease, which at the scale and
 * depth-of-field the hero uses is indistinguishable from a modelled bean and
 * costs one draw call for the lot.
 *
 * Motion is a pure function of scroll progress plus a slow idle drift, so the
 * beans "float and settle rather than snap" (§6).
 */

export interface BeansProps {
  act: ActId;
  count: number;
  /** World-space spread. */
  radius?: number;
  /** How far the cloud travels toward the camera across the act. */
  travel?: number;
  /** Idle float amplitude. 0 under reduced motion. */
  float?: number;
  colorMix?: number;
}

interface Seed {
  x: number;
  y: number;
  z: number;
  scale: number;
  rx: number;
  ry: number;
  rz: number;
  spin: number;
  phase: number;
  drift: number;
}

function seeds(count: number, radius: number): Seed[] {
  // Deterministic layout: the same visitor scrolling back up sees the same cloud.
  let a = 0x5eed_beef;
  const rand = () => {
    a = (a * 1664525 + 1013904223) >>> 0;
    return a / 4294967296;
  };

  return Array.from({ length: count }, () => ({
    x: (rand() * 2 - 1) * radius,
    y: (rand() * 2 - 1) * radius * 0.7,
    z: -rand() * radius * 2.2,
    scale: 0.55 + rand() * 0.75,
    rx: rand() * Math.PI * 2,
    ry: rand() * Math.PI * 2,
    rz: rand() * Math.PI * 2,
    spin: (rand() - 0.5) * 0.6,
    phase: rand() * Math.PI * 2,
    drift: 0.5 + rand() * 0.9,
  }));
}

const dummy = new Object3D();

export function Beans({
  act,
  count,
  radius = 3.2,
  travel = 7,
  float = 1,
  colorMix = 0.25,
}: BeansProps) {
  const ref = useRef<InstancedMesh>(null);
  const layout = useMemo(() => seeds(count, radius), [count, radius]);
  const colors = brandColors();

  const material = useMemo(() => {
    const base = new Color().copy(colors.bean).lerp(colors.beanSoft, colorMix);
    return base;
  }, [colors, colorMix]);

  // Instance matrices must exist before the first frame or the first paint shows
  // every bean stacked at the origin.
  useLayoutEffect(() => {
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  }, [count]);

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;

    const { actProgress, reducedMotion } = readAppState();
    const p = actProgress[act] ?? 0;
    const t = reducedMotion ? 0 : state.clock.elapsedTime;
    const amp = reducedMotion ? 0 : float;

    for (let i = 0; i < layout.length; i += 1) {
      const s = layout[i];
      if (!s) continue;

      // The cloud drifts toward the viewer as the act progresses (§8).
      const z = s.z + p * travel;
      dummy.position.set(
        s.x + Math.sin(t * 0.25 * s.drift + s.phase) * 0.12 * amp,
        s.y + Math.cos(t * 0.2 * s.drift + s.phase) * 0.16 * amp,
        z,
      );
      dummy.rotation.set(
        s.rx + t * 0.05 * s.spin * amp,
        s.ry + t * 0.08 * s.spin * amp + p * 0.6,
        s.rz,
      );
      // Beans that have swept past the camera shrink away instead of clipping
      // through it — cheaper and calmer than culling them mid-flight.
      const past = MathUtils.clamp((z - 3.4) / 2, 0, 1);
      const sc = s.scale * (1 - past) * 0.34;
      // Non-uniform: a bean is longer than it is deep. A uniform sphere reads as
      // a pebble no matter how good the lighting is.
      dummy.scale.set(sc, sc * 0.76, sc * 0.6);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[null!, null!, count]} frustumCulled={false}>
      {/* Squashed sphere: the §7 fallback for the missing bean GLTF. */}
      <sphereGeometry args={[1, 12, 9]} />
      <meshStandardMaterial color={material} roughness={0.62} metalness={0.05} />
    </instancedMesh>
  );
}
