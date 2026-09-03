import { Beans } from '../objects/Beans';
import { useAppStore } from '../../store/useAppStore';

/**
 * Act 5 — Quality (master prompt §8).
 *
 * "Motion calms fully... beans at rest." So they are: no travel, almost no
 * float, well behind the credentials and the dossier CTA. The willow leaf
 * pattern §8 also asks for is a missing asset (docs/ASSETS.md) and is not faked
 * here.
 *
 * This act exists mainly so the scroll does not end with the scene snapping off
 * — the beans coming to rest is the visual full stop.
 */
const BEAN_COUNT = { high: 40, mid: 24, low: 14 } as const;

export function QualityAct() {
  const tier = useAppStore((s) => s.deviceTier);

  return (
    <Beans
      act="quality"
      count={BEAN_COUNT[tier]}
      radius={4.6}
      travel={0.4}
      float={0.18}
      colorMix={0.15}
    />
  );
}
