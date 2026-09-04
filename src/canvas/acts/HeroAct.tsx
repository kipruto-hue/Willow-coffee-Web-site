import { Beans } from '../objects/Beans';
import { Cup } from '../objects/Cup';
import { LogoBean } from '../objects/LogoBean';
import { useAppStore } from '../../store/useAppStore';

/**
 * Act 1 — the hero scene (master prompt §8).
 *
 * Beans float in depth; the cup, the logo mark and the bean cluster dolly toward
 * the camera as scroll rises, with depth of field pulling focus onto the cup.
 * The vivid gradient behind them is the DOM stage layer, not a 3D pass — see
 * StageBackground.
 *
 * Composition note: the copy sits on the left (`.hero__inner` is a 34ch column),
 * so the cup and mark are placed right of centre. They are meant to be looked
 * at *past* the headline, never through it.
 */
const BEAN_COUNT = { high: 120, mid: 70, low: 40 } as const;

export function HeroAct() {
  const tier = useAppStore((s) => s.deviceTier);

  return (
    <group>
      <Beans act="hero" count={BEAN_COUNT[tier]} radius={3.4} travel={7.5} />
      <Cup act="hero" position={[1.55, -0.35, -1.6]} scale={1.15} wrap="/brand/cup-wrap.png" />
      <LogoBean act="hero" position={[1.5, 0.95, -2.4]} height={0.8} />
    </group>
  );
}
