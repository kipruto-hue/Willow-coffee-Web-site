import { create } from 'zustand';
import type { ActId } from '../content/types';

export type DeviceTier = 'high' | 'mid' | 'low';

export const ACT_ORDER: readonly ActId[] = ['hero', 'origin', 'journey', 'product', 'quality'];

interface AppState {
  /** 0..1 across the whole document. */
  globalProgress: number;
  /** 0..1 within each act's own scroll range. 0 before it, 1 after it. */
  actProgress: Record<ActId, number>;
  /** The act currently filling most of the viewport. */
  activeAct: ActId;
  /**
   * True while an act is within a padded band around the viewport. This is what
   * mounts and unmounts 3D content (§5.2) — padded so an act is pre-warmed
   * before it is seen, rather than compiling shaders in the visitor's face.
   */
  actNear: Record<ActId, boolean>;

  deviceTier: DeviceTier;
  reducedMotion: boolean;
  /** True once the preloader has handed over. */
  ready: boolean;

  setGlobalProgress: (p: number) => void;
  setActProgress: (act: ActId, p: number) => void;
  setActiveAct: (act: ActId) => void;
  setActNear: (act: ActId, near: boolean) => void;
  /** Demote only. See `demoteTier`. */
  demoteTier: () => void;
  setDeviceTier: (tier: DeviceTier) => void;
  setReducedMotion: (v: boolean) => void;
  setReady: (v: boolean) => void;
}

const zeroed = (): Record<ActId, number> => ({
  hero: 0,
  origin: 0,
  journey: 0,
  product: 0,
  quality: 0,
});

export const useAppStore = create<AppState>((set) => ({
  globalProgress: 0,
  actProgress: zeroed(),
  activeAct: 'hero',
  actNear: { hero: true, origin: false, journey: false, product: false, quality: false },
  deviceTier: 'high',
  reducedMotion: false,
  ready: false,

  setGlobalProgress: (p) =>
    set((s) => (s.globalProgress === p ? s : { globalProgress: p })),

  setActProgress: (act, p) =>
    set((s) =>
      s.actProgress[act] === p ? s : { actProgress: { ...s.actProgress, [act]: p } },
    ),

  setActiveAct: (act) => set((s) => (s.activeAct === act ? s : { activeAct: act })),

  setActNear: (act, near) =>
    set((s) => (s.actNear[act] === near ? s : { actNear: { ...s.actNear, [act]: near } })),

  /**
   * Tier only ever goes DOWN, never back up within a session, and never below
   * `mid`.
   *
   * A tier that can be promoted again will oscillate the moment the measurement
   * sits near the threshold, and the visitor sees the scene change quality
   * mid-scroll — which is far worse than simply running one notch conservative.
   *
   * The floor matters just as much: `low` fails `shouldUseWebGL`, so demoting
   * to it unmounts the canvas and drops the visitor onto the lite path for the
   * rest of the session. That is not a quality step, it is the end of the
   * experience, and no transient frame-time dip should be able to cause it.
   * Only `detectStaticTier` — which knows it is looking at a phone, a coarse
   * pointer or Save-Data — may set `low`, through `setDeviceTier`.
   */
  demoteTier: () => set((s) => (s.deviceTier === 'high' ? { deviceTier: 'mid' } : s)),
  setDeviceTier: (tier) => set({ deviceTier: tier }),
  setReducedMotion: (v) => set({ reducedMotion: v }),
  setReady: (v) => set({ ready: v }),
}));

/**
 * Non-reactive read, for the render loop.
 *
 * R3F components run at 60fps and must not re-render React on every frame; they
 * read scroll values through this and mutate object transforms directly
 * (master prompt §5.1: components read the store, never `window.scrollY`).
 */
export const readAppState = () => useAppStore.getState();
