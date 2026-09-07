import { Suspense, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { SRGBColorSpace, type Group } from 'three';
import { brandColors } from '../palette';
import { readAppState } from '../../store/useAppStore';
import { CUP_BODY } from './packaging';
import type { ActId } from '../../content/types';

/**
 * The cup (§7).
 *
 * The brief says to wrap the existing packaging render as a texture rather than
 * model a cup. With no supplied render, `npm run build:brand` draws one:
 * `public/brand/cup-wrap.png`, at the aspect ratio this body unrolls to
 * (`CUP_WRAP_ASPECT`). Without a wrap this falls back to brand colours — a
 * tapered cylinder with a bean-coloured band standing in for the artwork.
 */
/** Unrolled cup wrap art, mapped around the body. */
function CupSkin({ path }: { path: string }) {
  const map = useTexture(path);
  useMemo(() => {
    map.colorSpace = SRGBColorSpace;
    // The wrap is read at a glancing angle around most of the cylinder, which is
    // exactly where an unfiltered texture turns the wordmark to mush.
    map.anisotropy = 4;
  }, [map]);
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
        <cylinderGeometry
          args={[CUP_BODY.radiusTop, CUP_BODY.radiusBottom, CUP_BODY.height, 64, 1, true]}
        />
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

      {/* The brand band — the stand-in for artwork, and ONLY that. It is a solid
          cylinder at a larger radius than the body it sits on, so with a wrap
          applied it hides the middle third of the artwork: the lockup, which is
          drawn dead centre. Nothing to stand in for, nothing to draw. */}
      {!wrap && (
        <mesh position={[0, -0.12, 0]}>
          <cylinderGeometry args={[0.487, 0.44, 0.42, 40, 1, true]} />
          <meshStandardMaterial color={c.bean} roughness={0.7} />
        </mesh>
      )}

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
