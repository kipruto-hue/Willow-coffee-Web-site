import { brandColors } from './palette';

/**
 * Lighting (§7 asks for a warm studio HDRI, which does not exist —
 * docs/ASSETS.md).
 *
 * Three lights standing in for it: a warm key from upper left, a marigold fill
 * from the right so the shadow side keeps brand colour rather than going grey,
 * and a cream rim from behind to separate the beans from the background. No
 * shadow maps anywhere — at this depth of field they would cost real frame time
 * and be invisible.
 */
export function Lights() {
  const c = brandColors();
  return (
    <>
      <ambientLight intensity={0.55} color={c.marigold} />
      <directionalLight position={[-4, 5, 4]} intensity={2.1} color={c.amberYellow} />
      <directionalLight position={[5, -1, 2]} intensity={0.7} color={c.marigold} />
      <directionalLight position={[0, 2, -6]} intensity={1.1} color={c.cream} />
    </>
  );
}
