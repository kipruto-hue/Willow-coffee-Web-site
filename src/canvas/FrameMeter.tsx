import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { useAppStore } from '../store/useAppStore';

/**
 * §2: "Measure with requestAnimationFrame timing, not vibes."
 *
 * Samples frame time inside the render loop and demotes the tier when the device
 * is not keeping up. Three things make this safe rather than twitchy:
 *
 *   1. It judges on a p95 over a rolling window, not on the last frame. One long
 *      frame is a garbage collection, not a slow device.
 *   2. It ignores a warm-up period. The first seconds include shader compilation
 *      and texture upload, which are exactly when the numbers look worst and mean
 *      least.
 *   3. Demotion is one-way (see `demoteTier`) and there is a cooldown after each
 *      one, so the scene cannot oscillate between quality levels mid-scroll.
 *
 * high → mid drops post-processing and instance counts. There is no automatic
 * step below that: `demoteTier` floors at `mid`, because `low` unmounts the
 * canvas into the lite path (§10) and that is too destructive to trigger on a
 * frame-time dip. Once the scene is at `mid` this meter only reports.
 */
const WINDOW = 90;
const WARMUP_MS = 1800;
const COOLDOWN_MS = 2500;
/**
 * ~24fps at p95. §2's floor is 30fps, but the p95 of a scroll-driven scene sits
 * well above its typical frame time — a scroll burst, a texture upload or one
 * GC lands there — so judging §2's floor on the p95 demotes scenes that are in
 * fact running at 60. The budget is deliberately slacker than the target it
 * protects.
 */
const BUDGET_MS = 42;

export function FrameMeter({ onReport }: { onReport?: (p95: number) => void }) {
  const samples = useRef<number[]>([]);
  const started = useRef(performance.now());
  const lastDemotion = useRef(0);

  useFrame((_, delta) => {
    const now = performance.now();
    if (now - started.current < WARMUP_MS) return;

    const ms = delta * 1000;
    const buf = samples.current;
    buf.push(ms);
    if (buf.length < WINDOW) return;
    if (buf.length > WINDOW) buf.splice(0, buf.length - WINDOW);

    const sorted = [...buf].sort((a, b) => a - b);
    const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0;
    onReport?.(p95);

    if (p95 <= BUDGET_MS) return;
    // Already at the floor: nothing left to drop, so leave the window intact and
    // keep reporting. Clearing the buffer here would just churn it forever.
    if (useAppStore.getState().deviceTier !== 'high') return;
    if (now - lastDemotion.current < COOLDOWN_MS) return;

    lastDemotion.current = now;
    buf.length = 0;
    useAppStore.getState().demoteTier();
  });

  return null;
}
