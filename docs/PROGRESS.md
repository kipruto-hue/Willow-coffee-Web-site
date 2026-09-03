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
