import { useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { SRGBColorSpace, TextureLoader, type Mesh } from 'three';
import { readAppState } from '../../store/useAppStore';
import type { ActId } from '../../content/types';

/** Intrinsic size of public/brand/willow-logo.png. */
const LOGO_W = 256;
const LOGO_H = 341;

/**
 * The brand mark in 3D — and the one object in this scene with rules (§2).
 *
 * "If the logo appears in 3D space it stays flat-facing, upright, and uses only
 * brand colours." So:
 *
 *   - the plane's aspect ratio is DERIVED from the texture's real pixel
 *     dimensions, never chosen. It cannot be stretched.
 *   - no rotation is applied on any axis. Not a tilt, not a billboard `lookAt`
 *     that could roll it — the camera never rolls, so facing forward is enough.
 *   - no shadow, no tint, no emissive, no post-processed distortion. The
 *     material is `meshBasicMaterial`, which means scene lighting cannot alter
 *     the brand colours either.
 *   - it moves in Z and fades. That is all it is allowed to do.
 *
 * If you are about to add a `rotation`, a `scale` with unequal x/y, or a colour
 * to this component, re-read §2 first.
 */
export function LogoBean({
  act,
  position = [0, 0, 0],
  height = 1,
}: {
  act: ActId;
  position?: [number, number, number];
  /** World height. Width follows from the artwork's aspect ratio. */
  height?: number;
}) {
  const mesh = useRef<Mesh>(null);
  const texture = useLoader(TextureLoader, '/brand/willow-logo.png');

  useMemo(() => {
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
  }, [texture]);

  const width = (height * LOGO_W) / LOGO_H;

  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    const { actProgress } = readAppState();
    const p = actProgress[act] ?? 0;
    m.position.z = position[2] + p * 2.4;
    // Fades out before it can pass the camera plane and be seen edge-on, which
    // would be a distorted logo by any reasonable reading of §2.
    const material = m.material as { opacity: number };
    material.opacity = Math.max(0, 1 - Math.max(0, (p - 0.55) / 0.35));
  });

  return (
    <mesh ref={mesh} position={position}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  );
}
