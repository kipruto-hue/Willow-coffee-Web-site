import { useEffect, useState } from 'react';
import { LogoMark } from './LogoMark';
import { useAppStore } from '../store/useAppStore';

/**
 * Branded preloader (master prompt §5.3): marigold ground, the bean mark, a thin
 * cream progress bar. It covers first paint so there is never a flash of empty
 * canvas.
 *
 * Phase 0 has no textures or GLTFs to wait on, so it tracks what actually exists
 * — web fonts and the window load event — and reports honest progress rather
 * than animating a fake bar. Phase 1 adds the R3F loader to the same signal.
 *
 * The stall guard matters: §5.3 says if load stalls, the visitor still gets in.
 * A preloader that can hang forever is worse than no preloader.
 */
const STALL_TIMEOUT_MS = 6000;

export function Preloader() {
  const setReady = useAppStore((s) => s.setReady);
  const ready = useAppStore((s) => s.ready);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const done = () => {
      if (cancelled) return;
      setProgress(100);
      setReady(true);
    };

    const signals: Promise<unknown>[] = [
      document.fonts?.ready ?? Promise.resolve(),
      document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise((r) => window.addEventListener('load', r, { once: true })),
    ];

    let settled = 0;
    signals.forEach((p) => {
      void Promise.resolve(p).then(() => {
        if (cancelled) return;
        settled += 1;
        setProgress(Math.round((settled / signals.length) * 92));
      });
    });

    void Promise.all(signals).then(done);
    const stall = window.setTimeout(done, STALL_TIMEOUT_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(stall);
    };
  }, [setReady]);

  return (
    <div
      className="preloader"
      data-done={ready ? 'true' : 'false'}
      role="status"
      aria-live="polite"
      aria-hidden={ready ? 'true' : undefined}
      // Once hidden it must not swallow clicks or hold focus.
      inert={ready ? true : undefined}
    >
      <LogoMark className="preloader__mark" title="Willow Coffee" />
      <div className="preloader__bar">
        <span className="preloader__fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="preloader__label">{ready ? 'welcome' : 'brewing…'}</p>
    </div>
  );
}
