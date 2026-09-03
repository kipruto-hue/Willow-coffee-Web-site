# Willow Coffee — immersive scroll site

Single-page, scroll-driven marketing site for **Willow Coffee**, a specialty single-origin
coffee brand from Kenya's North Rift. One continuous scroll, five cinematic acts, one fixed
WebGL canvas behind real DOM copy. Its commercial job is WhatsApp orders and wholesale
quotes — there is no cart and no checkout.

## Read these first

| File | What it is |
|---|---|
| [`docs/MASTER_PROMPT.md`](docs/MASTER_PROMPT.md) | **The source of truth.** The brief, verbatim, never edited. Its "Non-Negotiable Constraints" outrank every later decision. |
| [`docs/PLAN.md`](docs/PLAN.md) | Build plan: stated engineering decisions, six phases, tracked risks. |
| [`docs/PROGRESS.md`](docs/PROGRESS.md) | Append-only session log. **Start here to resume work.** |
| [`docs/ASSETS.md`](docs/ASSETS.md) | Every asset: real, placeholder, or missing. |
| [`docs/COPY_GAPS.md`](docs/COPY_GAPS.md) | Strings the brief does not supply, awaiting brand approval. |
| [`docs/LAUNCH_CHECKLIST.md`](docs/LAUNCH_CHECKLIST.md) | What must be true before this goes public. |

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build
npm run preview    # serve the built site
npm test           # copy fidelity + render smoke tests
```

## Stack

Vite · React 19 · TypeScript · Lenis (smooth scroll) · GSAP ScrollTrigger (the single master
clock) · zustand (derived scroll state). Three.js and React Three Fiber arrive in Phase 1,
code-split so the lite path never downloads them.

## Architecture in one paragraph

GSAP's ticker drives Lenis; Lenis's scroll event pokes ScrollTrigger. That is the only loop.
ScrollTrigger writes a global 0–1 and a per-act 0–1 into the zustand store, and everything
else — nav state, and from Phase 1 the camera and the 3D objects — reads those numbers.
Nothing reads `window.scrollY`. All copy lives in `src/content/site.ts`, read by four
consumers (WebGL path, lite path, prerender, JSON-LD) and guarded by a fidelity test.

## Current phase

**All six phases built.** The full scroll experience: hero scene, scrubbed origin, journey
travel, product bring-forward, cross-fading act backgrounds, device tiers, lite path,
prerender, contrast audit, bundle budget.

**Not yet done:** nothing has run in a real browser, so no frame-rate figure and no Lighthouse
score have been recorded, and the launch blockers in `docs/LAUNCH_CHECKLIST.md` (starting with
the placeholder WhatsApp number) are open. See `docs/PROGRESS.md`.

```bash
npm run render:harvest   # dev-only: render Act 2's frames to .render/ and look at them
npm run check:bundle     # asserts the lite path downloads no three.js, and the 400KB budget
```
