import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils, type Group } from 'three';
import { Beans } from '../objects/Beans';
import { brandColors } from '../palette';
import { readAppState, useAppStore } from '../../store/useAppStore';
import { journeySteps } from '../../content/site';

/**
 * Act 3 — the Journey (master prompt §8).
 *
 * Four stations, one per step, spaced along -Z. The whole group travels toward
 * the camera with act progress, which is what "the camera travels along a path"
 * amounts to visually while keeping ONE writer for the camera (see CameraRig) —
 * two components moving the camera is how a scene starts fighting itself.
 *
 * Each station is a ring that brightens as its own sub-range comes up, so the
 * 3D marks the same four beats the DOM copy does. The colour ramp from highland
 * green to deep roast maroon lives in the stage background.
 */
const STATION_GAP = 6;
const BEAN_COUNT = { high: 70, mid: 40, low: 24 } as const;

function Station({ index, total }: { index: number; total: number }) {
  const group = useRef<Group>(null);
  const c = brandColors();

  // Step 04 is roasting: the ring is maroon by the end, matching §8's ramp.
  const tint = c.marigold.clone().lerp(c.maroon, index / Math.max(1, total - 1));

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const { actProgress } = readAppState();
    const p = actProgress.journey ?? 0;

    // This station's own slice of the act.
    const start = index / total;
    const local = MathUtils.clamp((p - start) * total, 0, 1);
    const material = (g.children[0] as { material?: { opacity: number } } | undefined)?.material;
    if (material) material.opacity = 0.15 + local * 0.55;
    g.rotation.z = local * 0.6;
    g.scale.setScalar(0.8 + local * 0.35);
  });

  return (
    <group ref={group} position={[index % 2 === 0 ? -1.5 : 1.5, 0, -index * STATION_GAP]}>
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[1.15, 0.045, 10, 64]} />
        <meshStandardMaterial color={tint} roughness={0.4} transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

export function JourneyAct() {
  const travelling = useRef<Group>(null);
  const tier = useAppStore((s) => s.deviceTier);

  useFrame(() => {
    const g = travelling.current;
    if (!g) return;
    const { actProgress } = readAppState();
    const p = actProgress.journey ?? 0;
    // Travel the full length of the row across the act.
    g.position.z = p * STATION_GAP * (journeySteps.length - 1) + 2;
  });

  return (
    <group ref={travelling}>
      {journeySteps.map((step, i) => (
        <Station key={step.number} index={i} total={journeySteps.length} />
      ))}
      {/* Roasted beans tumbling along the route (§8's exit into Act 4). */}
      <Beans
        act="journey"
        count={BEAN_COUNT[tier]}
        radius={4}
        travel={4}
        colorMix={0.55}
      />
    </group>
  );
}
