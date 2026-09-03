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

  deviceTier: DeviceTier;
  reducedMotion: boolean;
  /** True once the preloader has handed over. */
  ready: boolean;

  setGlobalProgress: (p: number) => void;
  setActProgress: (act: ActId, p: number) => void;
  setActiveAct: (act: ActId) => void;
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
