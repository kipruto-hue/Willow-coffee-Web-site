import { useEffect, useRef, type RefObject } from 'react';

/**
 * Play or pause a clip imperatively, instead of leaving `autoPlay` to run it
 * forever.
 *
 * The element deliberately carries no `autoPlay`: a clip starts on its poster
 * and only ever moves when this says so — when it is the act on screen AND the
 * visitor is scrolling. `play()` rejects rather than throws when a browser
 * declines (a policy change, a battery-saver mode, a source that 404s while the
 * manifest still lists it), and a rejected promise here is not an error worth
 * surfacing: the poster is already showing underneath, which is the correct
 * fallback in every one of those cases.
 */
export function useClipPlayback(playing: boolean): RefObject<HTMLVideoElement | null> {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    if (playing) {
      void video.play().catch(() => {
        /* poster stands in — see above */
      });
    } else {
      video.pause();
    }
  }, [playing]);

  return ref;
}
