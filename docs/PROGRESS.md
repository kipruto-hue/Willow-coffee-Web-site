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
