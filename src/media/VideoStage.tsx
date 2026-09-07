import { useEffect, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { STAGE_CLIPS, clipIsMotion, stageClipFor, type Clip } from './videoManifest';
import { useClipPlayback } from './useClipPlayback';
import { useScrollActivity } from './useScrollActivity';
import '../styles/media.css';

/**
 * The site background: real footage, replacing the procedural harvest and the
 * ambient WebGL beans.
 *
 * Every distinct clip is a persistent layer whose opacity crosses to 1 when it
 * is the active act's clip and back to 0 otherwise — a CSS opacity transition
 * does the crossfade. Layers are NOT remounted on scroll, so a playing video is
 * never restarted mid-fade.
 *
 * Vertical (9:16) sources are cover-fit and their edges feathered in CSS so the
 * footage melts into the light page with no hard rectangle. See media.css.
 *
 * Nothing here plays on its own: a layer moves only while it is the act on
 * screen AND the visitor is scrolling (`useScrollActivity`). Footage that loops
 * unattended behind static copy is the same restless feel the procedural scene
 * had, only more expensive.
 */
function ClipLayer({ clip, active, moving }: { clip: Clip; active: boolean; moving: boolean }) {
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  const tier = useAppStore((s) => s.deviceTier);
  const useVideo = clipIsMotion(clip, reducedMotion, tier);
  // Only the act on screen, and only while the page is actually moving. An
  // off-screen layer mid-crossfade stays paused rather than decoding frames
  // nobody can see.
  const video = useClipPlayback(useVideo && active && moving);

  return (
    <div className="clip" data-active={active ? 'true' : 'false'} aria-hidden="true">
      {useVideo ? (
        <video
          ref={video}
          className="clip__media"
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
      ) : (
        <img className="clip__media" src={clip.poster} alt="" />
      )}
    </div>
  );
}

export function VideoStage() {
  const activeAct = useAppStore((s) => s.activeAct);
  const active = stageClipFor(activeAct);
  const moving = useScrollActivity();

  const clips = useMemo(() => {
    const seen = new Set<string>();
    const list: Clip[] = [];
    for (const c of Object.values(STAGE_CLIPS)) {
      if (c && !seen.has(c.poster)) {
        seen.add(c.poster);
        list.push(c);
      }
    }
    return list;
  }, []);

  // Tell the existing CSS that an immersive background is present, so the
  // over-content acts go transparent and the footage shows through. Reuses the
  // [data-webgl] contract already in components.css.
  useEffect(() => {
    document.documentElement.dataset.webgl = 'true';
    return () => {
      document.documentElement.dataset.webgl = 'false';
    };
  }, []);

  return (
    <div id="video-stage" data-moving={moving ? 'true' : 'false'} aria-hidden="true">
      {clips.map((clip) => (
        <ClipLayer
          key={clip.poster}
          clip={clip}
          active={active?.poster === clip.poster}
          moving={moving}
        />
      ))}
      <div className="stage-grade" />
      <div className="stage-grain" />
    </div>
  );
}
