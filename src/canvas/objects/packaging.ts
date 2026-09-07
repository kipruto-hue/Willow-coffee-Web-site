/**
 * The packaging geometry, in one place, because two things have to agree about
 * it: the meshes in `Cup.tsx` / `Pouch.tsx`, and `scripts/build-brand-art.ts`,
 * which draws the artwork those meshes wrap.
 *
 * When they disagree the artwork is stretched — and the artwork contains the
 * logo, which §2 says may never be stretched. The rule is easy to state and
 * easy to break silently across two files, so it is stated once here and
 * asserted in `packaging.test.ts`.
 *
 * Deliberately free of any `three` import: the build script runs in Node.
 */

/** The cup body — a slightly tapered, open-ended cylinder. */
export const CUP_BODY = {
  radiusTop: 0.52,
  radiusBottom: 0.4,
  height: 1.15,
} as const;

/**
 * Width / height of the cup's body unrolled flat, which is the aspect ratio the
 * wrap artwork must be drawn at.
 *
 * `cylinderGeometry` spreads u uniformly around the circumference and v along
 * the height, so a frustum's mean circumference is the width that keeps the
 * artwork's pixels square once it is wrapped.
 */
export const CUP_WRAP_ASPECT =
  (Math.PI * (CUP_BODY.radiusTop + CUP_BODY.radiusBottom)) / CUP_BODY.height;

/**
 * The pouch's front panel width. The height is never written down — it is
 * derived from the artwork's own pixel dimensions at render time, the same way
 * `LogoBean` derives its plane, so the panel cannot stretch what it shows.
 */
export const POUCH_PANEL_WIDTH = 0.8;

/** Panel height that preserves the artwork's aspect ratio. */
export function pouchPanelHeight(imageWidth: number, imageHeight: number): number {
  return (POUCH_PANEL_WIDTH * imageHeight) / imageWidth;
}

/** The pouch body, for the check that the panel still fits on the front of it. */
export const POUCH_BODY = { width: 0.95, height: 1.35, depth: 0.34 } as const;
