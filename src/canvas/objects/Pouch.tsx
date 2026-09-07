import { Suspense, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { MathUtils, SRGBColorSpace, type ColorRepresentation, type Group } from 'three';
import { brandColors } from '../palette';
import { readAppState } from '../../store/useAppStore';
import { POUCH_BODY, POUCH_PANEL_WIDTH, pouchPanelHeight } from './packaging';
import type { ActId } from '../../content/types';

/**
 * The retail pouch (§7).
 *
 * §7 asks for the existing pouch render mapped onto a lightly bent plane so the
 * artwork does the work. With no supplied render, `npm run build:brand` draws
 * one: `public/brand/pouch-front.png`. Without artwork this falls back to a
 * kraft-coloured body with the gusset and the top seal picked out, brand
 * colours only.
 *
 * It rotates gently into focus across Act 4 and then holds — §8 is explicit that
 * this act is where people decide to buy, so the motion stops being interesting
 * and gets out of the way of the CTAs.
 */
/**
 * The front panel, geometry included.
 *
 * The height is DERIVED from the artwork's real pixel dimensions rather than
 * chosen, exactly as `LogoBean` derives its plane — because the lockup is drawn
 * on this artwork, and a panel whose aspect ratio disagrees with the image
 * stretches the logo, which §2 forbids. A hard-coded panel height is how that
 * happens silently: the numbers look plausible and the mark is 4% wide.
 */
function PouchArt({ path }: { path: string }) {
  const map = useTexture(path);
  useMemo(() => {
    map.colorSpace = SRGBColorSpace;
    map.anisotropy = 4;
  }, [map]);

  const image = map.image as { width: number; height: number };
  const height = pouchPanelHeight(image.width, image.height);

  return (
    <>
      <planeGeometry args={[POUCH_PANEL_WIDTH, height]} />
      <meshStandardMaterial map={map} roughness={0.75} />
    </>
  );
}

/** Shown while the artwork loads, and when there is none. */
function PouchPanelFallback({ color }: { color: ColorRepresentation }) {
  return (
    <>
      <planeGeometry args={[POUCH_PANEL_WIDTH, POUCH_PANEL_WIDTH / 0.762]} />
      <meshStandardMaterial color={color} roughness={0.75} />
    </>
  );
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
        <boxGeometry args={[POUCH_BODY.width, POUCH_BODY.height, POUCH_BODY.depth]} />
        <meshStandardMaterial color={c.tan} roughness={0.85} metalness={0.02} />
      </mesh>

      {/* front panel — the packaging artwork */}
      <mesh position={[0, -0.05, POUCH_BODY.depth / 2 + 0.002]}>
        {art ? (
          <Suspense fallback={<PouchPanelFallback color={c.bean} />}>
            <PouchArt path={art} />
          </Suspense>
        ) : (
          <PouchPanelFallback color={c.bean} />
        )}
      </mesh>

      {/* top seal */}
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[POUCH_BODY.width + 0.02, 0.1, POUCH_BODY.depth + 0.02]} />
        <meshStandardMaterial color={c.beanSoft} roughness={0.8} />
      </mesh>

      {/* degassing valve — the detail §8 actually names */}
      <mesh position={[0.26, 0.3, POUCH_BODY.depth / 2 + 0.005]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.01, 16]} />
        <meshStandardMaterial color={c.cream} roughness={0.4} />
      </mesh>
    </group>
  );
}
