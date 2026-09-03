/**
 * Where Act 2's frames come from.
 *
 * Two implementations behind one interface, so the real North Rift sequence can
 * land later without the component, the scrubber, or the scroll wiring changing:
 *
 *   ImageSequenceSource — the §7 primary path. Decodes real frames.
 *   ProceduralSource    — the fallback that ships today (see harvestScene.ts).
 *
 * When the footage exists: drop the frames in `public/harvest/`, fill in
 * HARVEST_MANIFEST, and this file picks the real path automatically.
 */

import {
  buildScene,
  drawHarvestFrame,
  type SceneModel,
  type ScenePalette,
  type SceneQuality,
} from './harvestScene';

export interface FrameSource {
  /** Load whatever must exist before the first paint. Resolves when ready. */
  prepare(): Promise<void>;
  /** Paint the frame for `progress` (0..1) into the context. */
  draw(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    progress: number,
  ): void;
  /** 0..1 — how much of what this source needs is loaded. Feeds the preloader. */
  readonly loadProgress: number;
  dispose(): void;
}

/* ------------------------------------------------------------- manifest -- */

export interface HarvestManifest {
  /** e.g. '/harvest/frame-####.webp' — '####' is replaced by the padded index. */
  readonly pattern: string;
  readonly frameCount: number;
  /** Fewer frames for the mid tier (§7): the same shot, decoded cheaper. */
  readonly midTierFrameCount?: number;
}

/**
 * null until the real footage exists and its usage rights are locked.
 * See docs/ASSETS.md — this is the project's critical missing asset.
 */
export const HARVEST_MANIFEST: HarvestManifest | null = null;

/* ------------------------------------------------------ image sequence -- */

/**
 * Scrubbed image sequence.
 *
 * The risk here is not the 3D, it is decode: asking the browser to decode a
 * fresh JPEG on every scroll tick is exactly how a scrubbed sequence janks. So
 * this preloads a window around the current frame, caps how many decodes may be
 * in flight at once, and never starts a decode from inside the draw call — if
 * the wanted frame is not ready it draws the nearest one that is, which reads as
 * a held frame rather than a stutter.
 */
export class ImageSequenceSource implements FrameSource {
  private readonly frames: (HTMLImageElement | undefined)[];
  private readonly requested: boolean[];
  private inFlight = 0;
  private loaded = 0;
  private disposed = false;

  private static readonly MAX_IN_FLIGHT = 6;
  /** Frames either side of the playhead to keep warm. */
  private static readonly WINDOW = 8;
  /** Evenly spaced frames fetched up front so scrubbing is never empty. */
  private static readonly KEYFRAME_STRIDE = 8;

  constructor(
    private readonly manifest: HarvestManifest,
    private readonly count: number = manifest.frameCount,
  ) {
    this.frames = new Array(count).fill(undefined);
    this.requested = new Array(count).fill(false);
  }

  get loadProgress(): number {
    const keyframes = Math.ceil(this.count / ImageSequenceSource.KEYFRAME_STRIDE);
    return Math.min(1, this.loaded / Math.max(1, keyframes));
  }

  private url(index: number): string {
    const padded = String(index + 1).padStart(4, '0');
    return this.manifest.pattern.replace('####', padded);
  }

  private request(index: number) {
    if (
      this.disposed ||
      index < 0 ||
      index >= this.count ||
      this.requested[index] ||
      this.inFlight >= ImageSequenceSource.MAX_IN_FLIGHT
    ) {
      return;
    }
    this.requested[index] = true;
    this.inFlight += 1;

    const img = new Image();
    img.decoding = 'async';
    img.src = this.url(index);
    const settle = (ok: boolean) => {
      this.inFlight -= 1;
      if (this.disposed) return;
      if (ok) {
        this.frames[index] = img;
        this.loaded += 1;
      } else {
        // Let a failed frame be retried later rather than leaving a permanent hole.
        this.requested[index] = false;
      }
    };
    void img
      .decode()
      .then(() => settle(true))
      .catch(() => settle(false));
  }

  async prepare(): Promise<void> {
    // Keyframes first: enough coverage that any scroll position has something.
    for (let i = 0; i < this.count; i += ImageSequenceSource.KEYFRAME_STRIDE) {
      this.request(i);
    }
    await new Promise<void>((resolve) => {
      const check = () => {
        if (this.disposed || this.loadProgress >= 1 || this.inFlight === 0) resolve();
        else window.setTimeout(check, 80);
      };
      check();
    });
  }

  /** Nearest already-decoded frame, searching outward from the wanted index. */
  private nearest(index: number): HTMLImageElement | undefined {
    for (let d = 0; d < this.count; d += 1) {
      const before = this.frames[index - d];
      if (before) return before;
      const after = this.frames[index + d];
      if (after) return after;
    }
    return undefined;
  }

  draw(ctx: CanvasRenderingContext2D, width: number, height: number, progress: number) {
    const index = Math.min(
      this.count - 1,
      Math.max(0, Math.round(progress * (this.count - 1))),
    );

    // Warm the window around the playhead, nearest first.
    for (let d = 0; d <= ImageSequenceSource.WINDOW; d += 1) {
      this.request(index + d);
      if (d > 0) this.request(index - d);
    }

    const frame = this.frames[index] ?? this.nearest(index);
    if (!frame) return;

    // cover-fit, so the panel never letterboxes or distorts the footage.
    const scale = Math.max(width / frame.naturalWidth, height / frame.naturalHeight);
    const w = frame.naturalWidth * scale;
    const h = frame.naturalHeight * scale;
    ctx.drawImage(frame, (width - w) / 2, (height - h) / 2, w, h);
  }

  dispose() {
    this.disposed = true;
    this.frames.fill(undefined);
  }
}

/* ---------------------------------------------------------- procedural -- */

export class ProceduralSource implements FrameSource {
  private readonly model: SceneModel;
  readonly loadProgress = 1;

  constructor(
    quality: SceneQuality,
    private readonly palette: ScenePalette,
  ) {
    this.model = buildScene(quality);
  }

  async prepare(): Promise<void> {
    // Nothing to fetch — which is the whole appeal of it while the shoot is pending.
  }

  draw(ctx: CanvasRenderingContext2D, width: number, height: number, progress: number) {
    drawHarvestFrame(ctx, this.model, this.palette, width, height, progress);
  }

  dispose() {
    // No resources held.
  }
}

/* -------------------------------------------------------------- factory -- */

export function createFrameSource(
  quality: SceneQuality,
  palette: ScenePalette,
): FrameSource {
  if (HARVEST_MANIFEST) {
    const count =
      quality === 'high'
        ? HARVEST_MANIFEST.frameCount
        : (HARVEST_MANIFEST.midTierFrameCount ?? HARVEST_MANIFEST.frameCount);
    return new ImageSequenceSource(HARVEST_MANIFEST, count);
  }
  return new ProceduralSource(quality, palette);
}
