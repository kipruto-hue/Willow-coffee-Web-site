import { Beans } from '../objects/Beans';
import { Cup } from '../objects/Cup';
import { Pouch } from '../objects/Pouch';
import { useAppStore } from '../../store/useAppStore';

/**
 * Act 4 — the Product (master prompt §8).
 *
 * The pouch and cup turn into focus over the amber field; beans settle around
 * them. §8: "this act is calmer and reads clearly; it is where people decide to
 * buy" — so the beans barely drift, nothing sweeps past the camera, and the
 * geometry sits to the right of the product cards rather than under them.
 *
 * Nothing here is interactive. The CTAs are DOM, where they can be tapped,
 * focused, and read by a screen reader (§2).
 */
const BEAN_COUNT = { high: 60, mid: 34, low: 20 } as const;

export function ProductAct() {
  const tier = useAppStore((s) => s.deviceTier);

  return (
    <group>
      <Pouch act="product" position={[2.1, 0.1, -3.2]} scale={1.25} art="/brand/pouch-front.png" />
      <Cup act="product" position={[3.2, -0.7, -3.6]} scale={0.85} wrap="/brand/cup-wrap.png" />
      <Beans
        act="product"
        count={BEAN_COUNT[tier]}
        radius={4.2}
        travel={1.2}
        float={0.35}
        colorMix={0.4}
      />
    </group>
  );
}
