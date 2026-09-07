# Video backgrounds

The background is real footage now (`src/media/`), not WebGL. Each clip has a
poster still that ships today and encoded video files you add to turn it into
motion. Nothing in the components changes when you add the videos: fill in
`sources` in `src/media/videoManifest.ts` and they play.

## Where files go
```
public/media/hero.jpg      hero.webm  hero.mp4        # beans in the grinder
public/media/origin.jpg    origin.webm origin.mp4     # smoke over beans (Origin panel)
public/media/product.jpg   product.webm product.mp4   # pour into cup  ← REPLACE (see below)
```

## Wire a clip up
In `src/media/videoManifest.ts`, uncomment / add the sources:
```ts
hero: {
  poster: '/media/hero.jpg',
  sources: [
    { src: '/media/hero.webm', type: 'video/webm' },
    { src: '/media/hero.mp4',  type: 'video/mp4'  },
  ],
  mode: 'loop',
  label: 'beans in the grinder',
},
```

## Encoding (ffmpeg)
Trim to a clean 6 to 10 second seamless loop first, strip audio, keep it small.

```bash
# poster still (first frame)
ffmpeg -i in.mov -frames:v 1 -q:v 3 public/media/hero.jpg

# mp4 (h264, universal)
ffmpeg -i in.mov -an -vf "scale=-2:1280" -c:v libx264 -crf 24 -preset slow \
  -pix_fmt yuv420p -movflags +faststart public/media/hero.mp4

# webm (vp9, smaller, served first)
ffmpeg -i in.mov -an -vf "scale=-2:1280" -c:v libvpx-vp9 -crf 34 -b:v 0 \
  public/media/hero.webm
```
Target under ~4MB per loop. If a clip is bigger, trim it or drop the CRF.

## Notes
- **Vertical sources.** These clips are 9:16. On desktop each sits as a sharp
  contained panel over a blurred fill of itself, so the sides read as depth, not
  bars. On phones the frame is cover-fit and matches the screen. A landscape
  hero clip would fill desktop far better if you can reshoot one.
- **product.jpg / the pour clip shows a COFFEELINK cup.** `replace: true` is set
  on it in the manifest as a reminder. Crop the logo out or reshoot with a Willow
  or plain cup before launch. Do not ship another brand's mark.
- **Scrub ('mode: scrub').** Reserved for driving a clip's timeline from scroll.
  It needs an all-keyframe encode to seek smoothly:
  `ffmpeg -i in.mov -an -c:v libx264 -crf 22 -g 1 -keyint_min 1 -pix_fmt yuv420p -movflags +faststart out.mp4`
- The old WebGL scene files are still in the tree but no longer imported. Once
  you are happy with video, `npm uninstall three @react-three/fiber
  @react-three/drei @react-three/postprocessing` and delete `src/canvas/`.

## The clips only move when the site moves

Nothing here autoplays. A layer plays when **both** are true: it is the act on
screen, and the visitor is currently scrolling. Stop scrolling and every clip
pauses on its current frame; the grain stops with it. Footage looping unattended
behind static copy is the same restless, generated feel the procedural scene had,
only more expensive — and a paused video decodes nothing, which matters more on
the phones than any encode setting here.

- `src/media/useScrollActivity.ts` — subscribes to `globalProgress` through
  zustand's non-reactive `subscribe`, so a scroll does **not** re-render anything;
  React state changes twice per scroll burst, at its start and after ~420ms of
  stillness. Always false under reduced motion, and forced false when the tab is
  hidden.
- `src/media/useClipPlayback.ts` — plays/pauses by ref. The elements carry no
  `autoPlay` on purpose. A rejected `play()` is swallowed: the poster is already
  underneath, which is the right result for a declined autoplay policy, a
  battery-saver mode, or a source that 404s while the manifest still lists it.

If you ever want a clip to run continuously, that is a deliberate change in
`ClipLayer` — not something to reach by adding `autoPlay` back to the element.

## Readability over footage — measured, not assumed

`npm run check:contrast` samples the posters where the copy actually falls and
reports cream-on-footage contrast, taking the **worst cell** rather than the mean
(one specular highlight under one word is a real failure that an average erases).

On bare footage the copy fails badly — hero **2.61:1**, product **1.60:1**,
against AA's 4.5:1 — because the pour clip's cup and the smoke are near-white.
`#video-stage::after` is therefore a **floor**, not a vignette: 55% `--bean` at
the centre rising to 82% at the edges, which measures **6.82:1** (hero) and
**5.18:1** (product).

Do not lower that floor to make the footage brighter. Since the stage now shows
on every path, that copy is over footage for phones and reduced-motion visitors
too, who used to get an opaque gradient and never met the stage at all. If a real
clip reads too dark, add a local scrim to the act that needs it — `.hero::before`
is already one — and re-run `npm run check:contrast` with the new alpha as the
argument (`npm run check:contrast -- 0.45`).

Re-run it whenever a poster changes. New footage is new luminance.
