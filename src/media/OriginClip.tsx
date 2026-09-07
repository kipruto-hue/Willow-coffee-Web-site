import { ORIGIN_CLIP, clipIsMotion } from './videoManifest';
import { useAppStore } from '../store/useAppStore';
import { useClipPlayback } from './useClipPlayback';
import { useScrollActivity } from './useScrollActivity';

/**
 * The Origin panel's clip — the real smoke-over-beans footage, replacing the
 * procedural harvest scene that read as AI. Same still-to-motion fallback as the
 * stage: poster now, video the moment `sources` is filled.
 *
 * And the same rule about when it is allowed to move: only while the visitor is
 * scrolling. The panel is inside Act 2's own sticky range, so the footage reads
 * as responding to the scroll that revealed it rather than looping at whoever
 * has stopped to read.
 */
export function OriginClip() {
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  const tier = useAppStore((s) => s.deviceTier);
  const moving = useScrollActivity();
  const clip = ORIGIN_CLIP;
  const useVideo = clipIsMotion(clip, reducedMotion, tier);
  const video = useClipPlayback(useVideo && moving);

  if (useVideo) {
    return (
      <video
        ref={video}
        className="origin__video"
        poster={clip.poster}
        muted
        loop
        playsInline
        preload="metadata"
      >
        {clip.sources.map((s) => (
          <source key={s.src} src={s.src} type={s.type} />
        ))}
      </video>
    );
  }
  return <img className="origin__video" src={clip.poster} alt="" />;
}
