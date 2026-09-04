import { Suspense, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { SRGBColorSpace, type Group } from 'three';
import { brandColors } from '../palette';
import { readAppState } from '../../store/useAppStore';
import type { ActId } from '../../content/types';

/**
 * The cup (§7).
 *
 * The brief says to wrap the existing packaging render as a texture rather than
 * model a cup. That render does not exist (docs/ASSETS.md), so this is the
 * documented fallback: tapered cylinder, lid rim, a cream band, in brand colours
 * only. When the render arrives it becomes a `map` on this same material and
 * nothing else changes.
 */
/** Unrolled cup wrap art, mapped around the body once it exists (§7). */
function CupSkin({ path }: { path: string }) {
  const map = useTexture(path);
  map.colorSpace = SRGBColorSpace;
  return <meshStandardMaterial map={map} roughness={0.5} metalness={0.02} />;
}

export function Cup({
  act,
  position = [0, 0, 0],
  scale = 1,
  wrap,
}: {
  act: ActId;
  position?: [number, number, number];
  scale?: number;
  /** e.g. '/brand/cup-wrap.png'. Dormant until supplied. */
  wrap?: string;
}) {
  const group = useRef<Group>(null);
  const c = brandColors();

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const { actProgress, reducedMotion } = readAppState();
    const p = actProgress[act] ?? 0;
    const t = reducedMotion ? 0 : state.clock.elapsedTime;

    // Dollies toward the viewer across the act, with a slow idle rotation so it
    // reads as an object in a space rather than a picture of one.
    g.position.z = position[2] + p * 3.2;
    g.position.y = position[1] + (reducedMotion ? 0 : Math.sin(t * 0.4) * 0.04);
    g.rotation.y = p * 0.9 + (reducedMotion ? 0 : Math.sin(t * 0.18) * 0.12);
  });

  return (
    <group ref={group} position={position} scale={scale}>
      {/* body, slightly tapered */}
      <mesh castShadow={false}>
        <cylinderGeometry args={[0.52, 0.4, 1.15, 64, 1, true]} />
        {wrap ? (
          <Suspense
            fallback={<meshStandardMaterial color={c.marigold} roughness={0.55} metalness={0.02} />}
          >
            <CupSkin path={wrap} />
          </Suspense>
        ) : (
          <meshStandardMaterial color={c.marigold} roughness={0.55} metalness={0.02} />
        )}
      </mesh>

      {/* the brand band */}
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[0.487, 0.44, 0.42, 40, 1, true]} />
        <meshStandardMaterial color={c.bean} roughness={0.7} />
      </mesh>

      {/* lid */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.56, 0.53, 0.1, 40]} />
        <meshStandardMaterial color={c.cream} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.66, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.54, 0.035, 8, 40]} />
        <meshStandardMaterial color={c.cream} roughness={0.4} />
      </mesh>

      {/* base */}
      <mesh position={[0, -0.575, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.4, 40]} />
        <meshStandardMaterial color={c.beanSoft} roughness={0.8} />
      </mesh>
    </group>
  );
}
