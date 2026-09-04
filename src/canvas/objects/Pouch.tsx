import { Suspense, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { MathUtils, SRGBColorSpace, type Group } from 'three';
import { brandColors } from '../palette';
import { readAppState } from '../../store/useAppStore';
import type { ActId } from '../../content/types';

/**
 * The retail pouch (§7).
 *
 * §7 asks for the existing pouch render mapped onto a lightly bent plane so the
 * artwork does the work. That render does not exist (docs/ASSETS.md), so this is
 * the fallback: a kraft-coloured body with the gusset and the top seal picked
 * out, brand colours only. The moment a render exists it becomes the `map` on
 * the body material.
 *
 * It rotates gently into focus across Act 4 and then holds — §8 is explicit that
 * this act is where people decide to buy, so the motion stops being interesting
 * and gets out of the way of the CTAs.
 */
/** Front-panel packaging artwork, mapped onto the panel once it exists (§7). */
function PouchArt({ path }: { path: string }) {
  const map = useTexture(path);
  map.colorSpace = SRGBColorSpace;
  return <meshStandardMaterial map={map} roughness={0.75} />;
}

export function Pouch({
  act,
  position = [0, 0, 0],
  scale = 1,
  art,
}: {
  act: ActId;
  position?: [number, number, number];
  scale?: number;
  /** e.g. '/brand/pouch-front.png'. Dormant until supplied. */
  art?: string;
}) {
  const group = useRef<Group>(null);
  const c = brandColors();

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const { actProgress, reducedMotion } = readAppState();
    const p = actProgress[act] ?? 0;
    const t = reducedMotion ? 0 : state.clock.elapsedTime;

    // Turns in over the first half of the act, then settles.
    const settle = MathUtils.clamp(p / 0.55, 0, 1);
    const eased = 1 - Math.pow(1 - settle, 3);
    g.rotation.y = MathUtils.lerp(-0.9, 0.28, eased) + (reducedMotion ? 0 : Math.sin(t * 0.2) * 0.05);
    g.position.z = position[2] + eased * 1.6;
    g.position.y = position[1] + (reducedMotion ? 0 : Math.sin(t * 0.35) * 0.03);
  });

  return (
    <group ref={group} position={position} scale={scale}>
      {/* body */}
      <mesh>
        <boxGeometry args={[0.95, 1.35, 0.34]} />
        <meshStandardMaterial color={c.tan} roughness={0.85} metalness={0.02} />
      </mesh>

      {/* front panel — where the packaging artwork will be mapped */}
      <mesh position={[0, -0.05, 0.172]}>
        <planeGeometry args={[0.8, 1.05]} />
        {art ? (
          <Suspense fallback={<meshStandardMaterial color={c.bean} roughness={0.75} />}>
            <PouchArt path={art} />
          </Suspense>
        ) : (
          <meshStandardMaterial color={c.bean} roughness={0.75} />
        )}
      </mesh>

      {/* top seal */}
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[0.97, 0.1, 0.36]} />
        <meshStandardMaterial color={c.beanSoft} roughness={0.8} />
      </mesh>

      {/* degassing valve — the detail §8 actually names */}
      <mesh position={[0.26, 0.3, 0.175]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.01, 16]} />
        <meshStandardMaterial color={c.cream} roughness={0.4} />
      </mesh>
    </group>
  );
}
