# PROGRESS LOG — Willow Coffee Web Site

Append-only. Newest session at the bottom. This file plus `docs/PLAN.md` must always be current enough
that a cold start (new machine, new session, no context) can resume without asking.

**Repo:** https://github.com/kipruto-hue/Willow-coffee-Web-site
**Local clone:** `C:\Users\SPECTRE\willow-coffee`
**Branch:** `main`

---

## Session 01 — 2026-09-03

**Started from:** commit `a193ca6` "Initial commit" — the repo contained only `LICENSE` (MIT, © Erick Kibichi).
Nothing else existed.

**Done:**
- Cloned the repo to `C:\Users\SPECTRE\willow-coffee`.
- Stored the master prompt verbatim at `docs/MASTER_PROMPT.md` — the single source of truth, never edited.
- Wrote `docs/PLAN.md`: reading of the brief, seven stated engineering decisions (D1–D7), the six-phase
  build plan, five tracked risks, and the open questions for Erick.
- Created this log.

**Then Erick said "Start" — plan approved. Phase 0 built in the same session.**

### Phase 0 — DOM skeleton, zero WebGL. COMPLETE.

- Vite 7 + React 19 + TypeScript scaffold, written directly rather than via `npm create` so nothing
  unexplained is in the tree. 106 packages, no three.js yet — the 3D dependencies arrive in Phase 1.
- `src/styles/tokens.css` — the §6 palette, a fluid type scale, spacing, and the §6 motion easings.
- Self-hosted fonts: Fredoka (display) + Inter (body), latin subset, variable 400–600, WOFF2, 78KB
  total, `font-display: swap`, preloaded. OFL licence text committed alongside.
- `src/scroll/SmoothScroll.tsx` — Lenis and GSAP ScrollTrigger wired as **one** loop per §5.1: GSAP's
  ticker drives `lenis.raf()`, Lenis's scroll event calls `ScrollTrigger.update()`. Under reduced
  motion Lenis never starts and native scrolling takes over.
- `src/scroll/useScrollProgress.ts` — global 0–1 and per-act 0–1 into the zustand store. Decision D9:
  act ranges are measured from each section's real position, not hardcoded fractions.
- `src/content/site.ts` — all §8 copy, typed, in one place (D2). Four consumers will read it.
- All five acts as real DOM: hero, origin, journey, product, quality, plus testimonials, contact, footer.
- Product cards with working size/grind radio groups that build the `wa.me` prefill (§12.5).
- Persistent WhatsApp CTA that hides only when the footer's own order link is on screen (§2).
- Branded preloader with a 6s stall guard — §5.3 says a stalled load must still let the visitor in.
- Accessibility: skip link, real `<button aria-expanded>` mobile menu with Escape-to-close, visible
  focus rings, visually-hidden radio inputs behind the chips, `aria-current` on the in-view section.
- JSON-LD Organization + four Products. No `offers` — the brief gives no prices and inventing them
  would be fake data.
- **18 tests, all passing.** `copy.fidelity.test.ts` (12) asserts §8's strings against an independently
  transcribed fixture; `App.render.test.tsx` (6) renders the whole tree to static HTML and asserts the
  copy, the order CTA, and the structured data are present with no JS executed — which also proves the
  D1 prerender is viable.
- GitHub Actions CI: typecheck + test + build on every push (D7).
- Docs added: `ASSETS.md` (asset register — real / placeholder / missing), `COPY_GAPS.md` (the small
  structural strings §8 does not supply), `LAUNCH_CHECKLIST.md`, `README.md`.

**Verified:** `npm run build` green. Bundle **120KB gzipped total** (8.9 entry + 50 scroll + 61 vendor)
against the §9 budget of ~400KB before the 3D chunk. `vite preview` serves 200s for the page and the
fonts. `vite.config.ts` already routes `src/canvas/` and three/postprocessing into a separate chunk, so
the Phase 1 code-split exists before there is code to split.

**NOT verified:** nothing has been opened in a real browser this session — the Chrome extension was not
connected, so Lenis, ScrollTrigger, and IntersectionObserver have not been watched running. The static
render test proves the page is not blank; it does not prove the scroll feels right. **Erick should open
`npm run preview` at http://localhost:4173 and look.**

**Next up:** Phase 1 — the hero scene. Single `<Canvas>` into `#canvas-root`, act-range mounting,
lights, scroll-driven gradient, instanced beans, cup, brand-locked logo plane, camera dolly, and
Bloom/DOF/Vignette on the `high` tier only.

**Blocked on / awaiting answers:**
1. Brand asset files — logo SVG/PNG, packaging renders, the brand PDF. (Blocks a real-looking Phase 1, not Phase 0.)
2. Live WhatsApp number — `254700000000` is a placeholder from the brief.
3. Deploy target (Netlify / Vercel / GitHub Pages / Hostinger).
4. Contact-form endpoint — follows from the deploy target.
5. Confirm decision D3: `prefers-reduced-motion` routes to the lite path (per §10) rather than a
   de-animated WebGL scene (a looser reading of §2). **Built on the D3 assumption** — reduced motion
   currently disables Lenis and hands over to native scrolling.
6. Approve or replace the placeholder strings in `docs/COPY_GAPS.md`.

**Launch checklist carried forward:** replace the placeholder WhatsApp number; confirm
`info@willowscoffee.co.ke`; verify brand hexes against the master brand file; lock usage rights on the
harvest footage.

---

## Session 02 — 2026-09-03 (same day, continued)

**Erick supplied three things:** the brand's existing site (`p14fh7evs4g1-d.space-z.ai`) as a source of
real assets, a reference frame for the highland look with the instruction to *use the principle, not the
picture*, and "start Phase 2".

### Real assets pulled from the existing Willow site

- **The real logo** — `public/brand/willow-logo.png`, 256×341 RGBA. `LogoMark` now renders it instead of
  the drawn placeholder. Its silhouette samples to exactly **#371101**, which **confirms the `--bean`
  token** against a real brand asset. It is also now the favicon.
  - Finding: the willow strokes in the artwork are **pure white**, not `--cream` (#F7F0DA) as §6
    describes. The asset ships exactly as supplied — §2 forbids recolouring the logo — and the
    discrepancy is on the launch checklist for the brand to settle.
  - It is a raster. Fine at nav/footer size, will soften large or in 3D. An SVG is on the checklist.
- **The real meta copy** — description, Open Graph description and keywords are now the brand's own
  strings rather than the placeholder written in Phase 0. §11 asked for exactly this and the strings had
  never been supplied; they were on the existing site all along. That placeholder is gone.
- Note: the existing site references **no other image assets** — no packaging renders, no photography.
  The pouch/cup/tin-tie renders are still missing (see `docs/ASSETS.md`).

### Phase 2 — Origin scrub. COMPLETE.

`src/origin/` — the scrubbed harvest visual, wired to act-local scroll progress.

- **`frameSource.ts`** — two implementations behind one interface, so the real footage can land without
  touching the component or the scroll wiring:
  - `ImageSequenceSource` — the §7 primary path. Keyframes fetched up front, a preload window around the
    playhead, **at most 6 decodes in flight**, and never a decode started from inside the draw call. If
    the wanted frame is not ready it draws the nearest one that is, which reads as a held frame rather
    than a stutter. This was flagged in the plan as the likeliest jank source; it is budgeted as its own
    problem, not left to chance.
  - `ProceduralSource` — what ships today.
  - `HARVEST_MANIFEST` is `null`. Set it, drop frames in `public/harvest/`, and the real path takes over.
- **`harvestScene.ts`** — the procedural scene. The camera travels down a row of coffee: branches sweep
  in from the sides, leaves and cherries ride the stems, fruit passes through a focus band, one warm key
  light travels across, dust glints only where the light is, near-black foliage frames the edges. Colour
  runs from `--willow-green` highland light to deep amber for the handover to Act 3, and a restrained
  flare masks the swap (§5.4).
  - **Deterministic by construction**: every position is a pure function of `progress`. Scrub backwards
    and the frame is identical. An animation that merely drifts near the scroll position looks fine going
    down and smears going up.
  - Art direction from Erick's reference — dark ground, one hot low key, heavy bokeh, particles in the
    light. **Nothing reproduces that image.**
- **`OriginSequence.tsx`** — the scroll callback records the target and returns; a single rAF, scheduled
  at most once per frame, does the drawing. Paused off-screen and on a hidden tab (§9), DPR capped at
  2 (1.5 on mid), element counts scale by tier, and reduced motion / low tier get **one still frame** and
  no subscription at all (§10).
- Layout: on desktop the Origin act is 220vh and the panel sticks, giving the scrub real scroll distance.
  On narrow screens and under reduced motion it collapses to a plain inline panel.

### Verified by looking, not just by testing

`npm run render:harvest` drives the **real** `drawHarvestFrame` through `@napi-rs/canvas` (dev-only) and
writes frames plus a contact sheet to `.render/`. That caught what the tests could not: the first pass was
generic bokeh with no structure and a flare that whited out the last frame; the second read as pale olive
leaves. Both were fixed by looking at the artefact. A passing test proves the code runs, not that the
frame is any good.

**26 tests green** (8 new). The new ones render through the same code path the browser uses and assert
determinism — same progress, byte-identical PNG — that progress actually changes the frame, that
out-of-range values clamp, that every pixel is opaque, and that the fallback is still the active source.

**Build green**, 123KB gzipped total, still well under the ~400KB budget.

### Not done, and deliberately so

**Phase 1 — the hero WebGL scene — has not been built.** Erick asked for Phase 2 and Phase 2 does not
depend on it: §7 allows the sequence to be drawn to a plain canvas, so no `<Canvas>`, no three.js, and no
R3F are in the tree yet. The hero is still the Phase 0 CSS gradient. Phase 1 remains outstanding and is
the natural next step.

**Still not verified in a real browser.** The Chrome extension is not connected — Erick, run `/chrome` to
finish that, then I can drive it. The scene has been verified frame-by-frame as rendered PNGs, which is
strictly better than nothing but is not the same as watching it scrub under Lenis.

---

## Session 03 — 2026-09-03 (same day, continued)

Erick: "Make sure the project is done, start the other half of the project not done." So: Phases 1, 3, 4
and 5, in one pass. **All six phases are now built.**

### Phase 1 — Hero scene

`src/canvas/` — the single `<Canvas>` (§4), mounted into `#canvas-root` behind the content, transparent,
`pointer-events: none`, dynamically imported.

- **`Beans.tsx`** — one `InstancedMesh` for the lot (§9 is explicit: never a loop of separate meshes).
  120 / 70 / 40 instances by tier. The §7 bean GLTF does not exist, so the documented fallback: a
  non-uniformly squashed sphere. Layout is deterministic, so scrolling back up shows the same cloud.
- **`Cup.tsx`, `Pouch.tsx`** — tapered cylinder with lid and brand band; kraft pouch with gusset, top
  seal and the degassing valve §8 actually names. Both are §7 fallbacks in brand colours: the packaging
  renders do not exist. When they arrive they become a `map` on these same materials.
- **`LogoBean.tsx`** — the one object with rules. Aspect ratio is **derived from the texture's real pixel
  dimensions** so it cannot be stretched; no rotation on any axis; `meshBasicMaterial`, so scene lighting
  cannot alter the brand colours either; fades out before it could pass the camera plane and be seen
  edge-on. §2's logo don'ts are enforced by construction, not by remembering.
- **`Lights.tsx`** — warm key, marigold fill so shadow sides keep brand colour, cream rim. No shadow maps.
- **`Effects.tsx`** — Bloom + DoF + Vignette, **high tier only** (§5.5), and the first thing dropped when
  the frame meter demotes.

### Phase 3 — Journey and Product scenes

- **`JourneyAct`** — four stations along -Z, one per §8 step, each brightening as its own sub-range comes
  up so the 3D marks the same four beats as the copy. The group travels toward the camera; roasted beans
  tumble along the route into Act 4.
- **`ProductAct`** — pouch and cup turn into focus and then **stop**. §8 says this act is where people
  decide to buy, so the motion gets out of the way of the CTAs. Nothing here is interactive: the CTAs are
  DOM, where they can be tapped, focused and read aloud.
- **`QualityAct`** — beans at rest (§8's Act 5), the visual full stop.

### Phase 4 — Transitions and colour along scroll

- **`StageBackground`** — the act gradients as one fixed DOM layer *behind* the canvas, cross-fading into
  the next act over the tail of the current one. Written as CSS custom properties on a rAF; React never
  re-renders for it. Decision D11 covers why this is not a 3D pass.
- **`CameraRig`** — the only thing that moves the camera (D12), damped frame-rate-independently so the
  scene reads the same at 30fps and 120. `rotation.z` is never written by anything: §8 says the camera
  never rolls the logo.

### Phase 5 — Tiers, lite path, a11y, perf, SEO

- **`FrameMeter`** — §2 says measure with rAF timing, not vibes. p95 over a 90-frame window, a 1.8s warm-up
  ignored (shader compilation is exactly when the numbers look worst and mean least), a 2.5s cooldown, and
  **demotion is one-way**: a tier that can be promoted again oscillates whenever the measurement sits near
  the threshold, and the visitor watches the scene change quality mid-scroll.
- **Lite path** (`src/lite/LiteApp.tsx`) — decision **D10**: it is `SiteContent` and nothing else. The
  same tree renders on both paths; the WebGL path just mounts a canvas behind it. A duplicated lite tree
  drifts, and the drift is invisible until a phone visitor sees last month's prices.
- **Prerender** (`scripts/prerender.ts`, D1) — renders the lite path to static HTML into `dist/index.html`
  as part of `npm run build`. **23.2KB of real content** — every headline, all four products, the
  credentials, the testimonials, the CTAs — reaching a crawler with no JavaScript executed.
- **Contrast audit** (`src/lib/contrast.ts` + test) — and it **found two real failures**: cream body text
  on raw `--willow-green` is 4.06:1 and on raw `--amber-deep` is 4.31:1, both under AA's 4.5:1. Fixed by
  deepening the Journey gradient stops 30% toward `--bean` (6.16:1 and 6.34:1), which keeps them
  recognisably highland green and deep roast. The journey step cards were also given a near-solid bean
  background so their copy sits at 11.9:1 instead of on whatever the gradient is doing behind them.
- **Bundle guard** (`scripts/check-bundle.ts`, in CI) — asserts no entry-path chunk contains
  `WebGLRenderer` and that the initial payload stays under §9's ~400KB. This caught a real leak: a
  catch-all `vendor` chunk in `vite.config.ts` was pulling `react-reconciler` and friends — reachable
  only from the canvas — back into the entry path, so lite visitors downloaded them for nothing.

### Verified

- **39 tests green.** `npm run build` green, including the prerender step.
- **Initial payload 117.9KB gzipped** against the ~400KB budget. The 3D chunk is 271KB gz and is
  **dynamically imported only** — a lite visitor never requests it, asserted by `check-bundle`.
- Entry chunks contain zero `WebGLRenderer`.

### Still not done — the honest list

1. **Nothing has been run in a browser. Not once, across three sessions.** No frame-rate number, no
   Lighthouse score, and the visual result of Phases 1/3/4 has never been seen — unlike Act 2, which was
   at least verified as rendered PNGs. **This is the largest single gap in the project.** Erick: run
   `/chrome` to connect the browser, or open `npm run preview` and tell me what is wrong.
2. **Lighthouse §12.8 not run** — needs a browser.
3. Launch blockers unchanged and all still open: placeholder WhatsApp number, no packaging renders, no
   harvest footage, no deploy target, no form endpoint, no `og:image`, vector logo. See
   `docs/LAUNCH_CHECKLIST.md`.

**Note on a mistake:** an `npm install` early in this session ran from the wrong working directory and
added the three.js packages to `C:\Users\SPECTRE\package.json` (the user's home directory, outside this
repo). It was noticed immediately and reverted with `npm uninstall`; that file is back to its original two
dependencies. Flagged here because it touched a file outside the project.

---

## Session 04 — 2026-09-04 (commit `ebcc097`, logged retrospectively)

Committed but never written up here; recorded now from the commit message so a cold start sees it.

Two faults made the site look cheap, and only one was in the design.

1. **The scene deleted itself.** `FrameMeter` demoted `high → mid → low`, and `shouldUseWebGL()` returns
   false for `low`, so a single frame-time dip permanently unmounted the canvas and dropped the visitor
   onto the lite DOM path for the rest of the session. Anyone reviewing the site on a laptop with an
   integrated GPU was reviewing the fallback. The budget moved 33ms → 42ms and the meter was made to
   stop at `mid`.
2. **There was no artwork.** `public/brand/` held one file. `src/brand/willowPattern.ts` now traces the
   drooping willow-branch motif from the supplied packaging photograph and redraws it as Canvas2D, so it
   renders at any resolution with no studio lighting baked in. `npm run build:brand` composites it with
   the real logo into `pouch-front.png` and `cup-wrap.png`, and writes `.render/brand-compare.png` so the
   result can be judged beside the photograph. It was judged four times; the first three were a wheat ear,
   a palm frond and a fishbone. The photographs are also used *as photographs* in the Product act DOM.

The amber tokens were verified by sampling the bag rather than assumed, closing a blocking checklist item.
Nothing in `tokens.css` changed — it was already right.

---

## Session 05 — 2026-09-07 — reviewing session 04's diff

Erick put the session 04 diff up for review. Four defects in it, all of the same family: a change was made
in one file and the thing that had to agree with it was in another.

### The tier floor was in the caller, not the invariant

Session 04 fixed the vanishing canvas with `if (deviceTier === 'high') demoteTier()` at the one call site.
`demoteTier` itself still returned `low` for any tier that was not `high`, so the fix held only as long as
`FrameMeter` stayed the only caller. The floor now lives in the store, where the invariant is: `demoteTier`
goes `high → mid` and then stops. `setDeviceTier` still reaches `low` — that is `detectStaticTier`'s path,
and it is the deliberate one, because it knows it is looking at a phone rather than guessing from a dip.

`FrameMeter` also reset its cooldown and cleared its 90-frame window every time it was over budget at
`mid`, forever, achieving nothing. It now returns early at the floor and keeps reporting. Two stale
comments went with it: the header still described `mid → low` unmounting the canvas, and `BUDGET_MS`
was labelled "~30fps" when 42ms is ~24 — the slack is deliberate (a p95 catches scroll bursts and texture
uploads) but it should say so.

### The artwork did not fit the geometry it was mapped onto

Session 04 added the textures and wired the callers, but nothing checked the two against each other.

- **The cup wrap was squashed 30%.** `cup-wrap.png` was drawn 1600×900 (1.78:1). The body it wraps —
  a 0.52/0.4 × 1.15 frustum — unrolls to π(0.52+0.4)/1.15 ≈ **2.51:1**. The difference lands on the
  lockup in the middle of the wrap, which contains the logo §2 says may not be stretched. The script now
  takes the ratio from the geometry (`CUP_WRAP_ASPECT`), not from a chosen number: 1600×637.
- **The pouch panel was stretched 4%.** A hard-coded `planeGeometry(0.8, 1.05)` (0.762) under a 1024×1400
  image (0.731). The panel now derives its height from the texture's real pixel dimensions, the same way
  `LogoBean` derives its plane — which is exactly the pattern that existed to prevent this.
- **The cup's brand band covered the artwork.** The bean-coloured band is a solid cylinder at a *larger*
  radius than the body, sitting over the middle 36% of it — dead centre, where the lockup is drawn. It was
  the stand-in for artwork; with artwork it is an occluder. It renders only when there is no wrap.

`src/canvas/objects/packaging.ts` now holds the dimensions both the meshes and the build script need, so
they cannot drift apart again silently.

### Looked at it, then fixed it again

Re-rendering the wrap at the correct 2.51:1 made the willow field wrong in a new way: one row of
full-height branches on a panel a third as tall bunched four branches at each edge and left the middle —
the half of the cup facing the camera — as bare gradient. Two rows of shorter branches at ten columns
reads as a printed band all the way round. Caught by opening the PNG, not by any assertion.

### Verified

- **47 tests green** (8 new). `packaging.test.ts` asserts the drawn wrap matches the ratio the body
  unrolls to and that the pouch panel takes the artwork's ratio *whatever the artwork is* — the property,
  not the current number. `useAppStore.test.ts` pins the demote floor and, explicitly, the thing it
  protects: repeated demotion never takes a visitor out of the WebGL experience.
- `npm run typecheck` clean, `npm run build` green, bundle guard green.

### Unchanged and still true

**Nothing has been run in a browser, across five sessions.** These fixes were verified by typecheck, by
tests, and by opening the generated PNGs — the geometry they are mapped onto has still never been seen
rendered. Launch blockers in `docs/LAUNCH_CHECKLIST.md` are unchanged.

---

## Session 06 — 2026-09-07 — the first time it was served

Erick: "run build in port 5173". `npm run preview -- --port 5173 --strictPort`, serving the production
build. The Chrome extension is still not connected and there is no headless driver in the project, so
this was verified over HTTP, not looked at. **Still nobody has seen this site render.**

Every asset resolves: entry JS, CSS, both fonts, and all six brand images (200, correct content types).

### And serving it immediately exposed a §2/§9 violation that had been shipping

`dist/index.html` carried `<link rel="modulepreload" href="/assets/three-DMNmsdCy.js">`, and the entry
chunk opened with:

```js
import{u as j,r as h,j as r,…}from"./three-DMNmsdCy.js"
```

Those are React's hooks and jsx-runtime. React is shared between the DOM path and the canvas subtree, and
because `manualChunks` named a `three` chunk but left React unnamed, Rollup settled React *into* it. So
the entry had to reach into the 3D chunk to get React — **statically**. Vite then dutifully preloaded the
3D chunk from the HTML head. Every lite visitor, phones included, downloaded **335KB gz of WebGL to
render plain DOM** — the exact thing §2's mobile-lite mandate and decision D10 exist to prevent.

**The bundle guard reported `initial payload: 62.8KB gz … ok` throughout.** Its assertion was that no
entry chunk *contains* `WebGLRenderer` — and none did. `WebGLRenderer` was in `three-*.js`, exactly where
it belongs; the entry just imported that file. The guard checked a proxy for the property, and the proxy
stayed true while the property broke. Same family as the bug it was originally written for (the catch-all
`vendor` chunk), from the other direction: that pulled 3D-only code into the entry, this pushed entry code
into the 3D chunk. Both end with the lite visitor downloading three.js.

### What was actually absorbed

Pinning React to its own chunk was not enough — the guard failed again, correctly. Rather than guess, a
throwaway Rollup plugin (`generateBundle`) printed the modules in the 3D chunk that were neither under
`src/canvas/` nor a 3D dependency:

```
vite/preload-helper.js          <- the dynamic-import helper itself
zustand/*, use-sync-external-store/*
src/store/useAppStore.ts
src/content/site.ts
```

Everything else it listed — maath, n8ao, @use-gesture, its-fine, suspend-react, react-use-measure — is
drei's own tree and correctly there. Those five are now named into an `app` chunk.

### The guard, rewritten to assert the property

Two checks were added and one of them was wrong at first, in an instructive way. A plain
`source.includes(threeChunkName)` fires on the entry's `__vite__mapDeps` array and on
`import("./three-*.js")` — the legitimate lazy machinery — so it reported a collapse that had not
happened. It now matches static import syntax only (`from"./three-*.js"` / bare `import"./three-*.js"`),
with the trailing `(` and the quoted array entry being exactly what separates lazy from eager. Plus a
check that `dist/index.html` never names the 3D chunk at all, which is where this was visible from the
outside.

### Verified

- Entry chunk's only static imports are now `app`, `react` and `scroll`. The 3D chunk appears solely
  inside `import(...)` and `__vite__mapDeps`.
- `dist/index.html` preloads `react`, `app`, `scroll`, CSS. **No three.**
- Guard green and now honest: **initial payload 127.0KB gz** / 400KB budget, 3D chunk 262.8KB gz lazy.
  The old 62.8KB was fiction — React was hidden inside the 3D chunk, uncounted and downloaded anyway.
  A lite visitor goes from ~398KB gz to 127KB gz.
- 47 tests green, typecheck clean, build green.

---

## Session 07 — 2026-09-07 — the background is real footage now

Erick supplied three vertical (9:16) clips — beans in a grinder, smoke over roasted beans, a pour into a
cup — with their poster stills and a prepared patch, and the instruction that the generated motion "reads
as AI and has to go", plus one requirement of his own: **the movement must only happen when there is
movement in the site.**

The patch was reviewed and applied as given: `src/media/videoManifest.ts`, `VideoStage.tsx`,
`OriginClip.tsx`, `src/styles/media.css`, and the `App.tsx` / `OriginCopy.tsx` swaps. `src/canvas/` and
`src/origin/` are still in the tree, simply not imported (see `docs/VIDEO.md` for the uninstall when video
is confirmed). Posters are in `public/media/`.

### Three things the patch did not cover

**1. The clips would have run forever.** The layers were `autoPlay loop`, which is the same restless feel
in a different costume. `useScrollActivity` subscribes to `globalProgress` through zustand's non-reactive
`subscribe` — so a scroll re-renders nothing, and React state changes exactly twice per scroll burst, at
its start and after ~420ms of stillness. `useClipPlayback` then plays and pauses by ref; the elements
carry no `autoPlay` at all. A layer moves only while it is the act on screen AND the page is moving, and
the film grain parks with it (`#video-stage[data-moving='false']`). Hidden tab forces it false.

**2. `check-bundle` would have failed the build for the right reason.** It threw when no `three-*` chunk
existed, on the reasoning that a missing chunk meant the split had collapsed into the entry. With the
canvas unimported that is now the expected state, so absence is the pass case — and the checks that
actually distinguish "gone" from "merged in" (no `WebGLRenderer` in an entry chunk, no static import, no
mention in `index.html`) are unchanged and still apply if the canvas is ever wired back up.

**3. The copy was about to sit on photographs at 1.60:1.** `[data-webgl='true']` makes the hero, journey,
product and quality acts transparent — and it now applies on *every* path, so phones and reduced-motion
visitors, who used to get an opaque gradient and never met the stage, get footage too. `contrast.test.ts`
checks colour *pairings* and cannot see this. `scripts/check-stage-contrast.ts` samples the posters where
the copy actually falls, taking the **worst cell rather than the mean** — one specular highlight under one
word is a real failure an average erases:

```
cream on bare hero footage     2.61:1
cream on bare product footage  1.60:1   <- the pour's near-white cup and smoke
```

against AA's 4.5:1. The supplied `#video-stage::after` was a vignette — `transparent 42% -> bean 62%` —
which protects the corners and leaves the middle of the frame, where the product cards sit, completely
bare. It is now a **floor**: 55% `--bean` at centre rising to 82% at the edges, measuring **6.82:1** and
**5.18:1**. `npm run check:contrast` re-runs it; new footage is new luminance.

### Also

- `clipIsMotion(clip, reducedMotion, tier)` is the single home of the still-vs-motion rule, which was
  duplicated in both components. Nine tests cover it and the act-inheritance fallback, including that
  every poster a manifest entry names actually exists — a missing file is a blank stage and nothing else
  in the build would say so.
- `public/Image/` held the source zip and two PNGs. `public/` is served verbatim, so that would have
  published 1.6MB of source material; moved to `assets-src/video-source/`.

### Verified

- **`npm run build` green, and there is no `three` chunk in the output.** 67 modules, 4.85s (was ~1000
  modules and 36s). Initial payload **123.2KB gz** / 400KB.
- 56 tests green (9 new), typecheck clean, bundle guard green.
- Served on :5173 — page and all three posters 200, and the served HTML references no `three-` chunk.
- **Still not seen in a browser.** The extension is not connected. Everything above is build output, HTTP
  and measured pixels; nobody has watched a crossfade or confirmed the clips pause when scrolling stops.
