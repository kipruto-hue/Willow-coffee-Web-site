# BUILD PLAN — Willow Coffee Immersive Scroll Site

Derived from `docs/MASTER_PROMPT.md` (the source of truth). Written 2026-09-03, before any code.
Status of this document: **approved by Erick, 2026-09-03.** Phase 0 is built; see `PROGRESS.md`.

---

## 1. Reading of the brief

The site is one tall scroll, five acts, one fixed `<Canvas>` behind real DOM copy. GSAP ScrollTrigger
driven by Lenis is the single clock; zustand holds the derived numbers; React Three Fiber components
read those numbers and never touch `window.scrollY`. Ordering happens on WhatsApp — there is no cart,
no checkout, no commerce backend.

The stack in §3 is accepted as-is. No substitutions proposed.

---

## 2. Decisions I am making (and why)

These are engineering calls the master prompt leaves open. Each is reversible; each is stated so it can
be overruled.

| # | Decision | Why |
|---|---|---|
| D1 | **Prerender via a `react-dom/server` build script, not `vite-plugin-prerender`.** After `vite build`, a small Node script renders `LiteApp` to static HTML and injects it into `dist/index.html`, which the WebGL app then hydrates/replaces on capable devices. | `vite-plugin-prerender` is unmaintained and drags in a headless browser. `renderToStaticMarkup` on the lite tree is ~30 lines, has no extra runtime dependency, and satisfies §11 exactly — crawlers get the full copy without executing the scene. |
| D2 | **Copy lives in one typed data module (`src/content/`), not inline in JSX.** Products, journey steps, testimonials, credentials, and nav all come from typed constants. | §12.9 requires copy to match §8 *exactly*, and the same strings are consumed by the WebGL path, the lite path, the prerender, and the JSON-LD. One source prevents drift between four consumers. A copy-fidelity test asserts the strings against a fixture. |
| D3 | **`prefers-reduced-motion` routes to the lite path**, per §10, rather than a de-animated WebGL scene. | §2 and §10 read slightly differently. §10 is the more explicit instruction and the safer outcome: one calm, fully-usable code path rather than a second, lightly-tested animation mode. Stated here as an assumption — say the word and I build the snap-in-place WebGL variant instead. |
| D4 | **Placeholder art is generated in-repo and tracked in `docs/ASSETS.md`.** Beans use the §7 lathe/deformed-sphere fallback, packaging uses flat brand-coloured panels, and the harvest act uses the still + parallax fallback until real frames exist. | §7 explicitly says fall back rather than block. "No fake data" (§2) governs *copy, SKUs, prices, claims* — those stay verbatim; it does not require withholding placeholder geometry. Every placeholder is listed so none ships by accident. |
| D5 | **Contact form posts to a static-host form endpoint** (Netlify Forms or Formspree), with a `mailto:` fallback baked into the markup. | There is no backend in the stack and none is warranted. Needs Erick's pick — see §6 Open Questions. |
| D6 | **Fonts self-hosted from the Google Fonts OFL originals** (Fredoka + Inter), subset to latin, WOFF2, `font-display: swap`, preloaded. | §3 and §6 require self-hosting; OFL permits it. Subsetting keeps the display face under budget. |
| D7 | **CI: GitHub Actions running typecheck + build + the copy-fidelity test on every push.** | Phase gate in §13 says "at the end of each phase the site must build". A machine should enforce that, not memory. |
| D8 | **Typography is normalised, wording is not.** The site typesets curly apostrophes and quotes; the fidelity test normalises curly↔straight and collapses whitespace before comparing. | The brief is plain text and its straight quotes are an artefact of that, not a design instruction. Normalising the *shape* while asserting every word means the test catches real drift instead of failing on a typographic improvement. Punctuation *presence* is still asserted. |
| D9 | **Act scroll ranges are measured from the sections' real positions (a ScrollTrigger per section), not hardcoded global fractions.** | §5.2 gives "Hero 0.0 to 0.2, Origin 0.2 to 0.45" as an example. Section heights change with copy and breakpoints; a hardcoded range silently desynchronises from the content when they do, and the failure is a scene that leads or lags the words by half a screen. The ranges still exist — they are just derived. |

---

## 3. Phase plan

Each phase ends green: `npm run build` passes, the tree is deployable, work is committed **and pushed**,
and `docs/PROGRESS.md` is updated in the same commit.

### Phase 0 — Skeleton (no WebGL)
Vite + React + TS scaffold; `tokens.css` with the §6 palette; self-hosted fonts; Lenis + ScrollTrigger
wired as one loop; zustand store (`globalProgress`, `actProgress`, `actIndex`, `deviceTier`,
`reducedMotion`); all five acts as real DOM sections with the §8 copy verbatim; nav; sticky WhatsApp CTA;
product cards with weight/grind selectors building the `wa.me` prefill; contact form; footer; preloader
shell; JSON-LD. **This alone is a shippable site.**

### Phase 1 — Hero scene
Single fixed `<Canvas>`; act-range mounting; lights; scroll-driven gradient background; instanced beans
(40–120, one `InstancedMesh`); cup; brand-locked `LogoBean` plane; camera dolly on scroll; Bloom + DOF +
Vignette on the `high` tier only.

### Phase 2 — Origin scrub
Frame-sequence scrubber driven by act-local progress, decoding into a canvas texture with a preload
window and a hard cap on in-flight decodes; video fallback; still + parallax fallback (the path we ship
until real frames land).

### Phase 3 — Journey + Product scenes
Camera travel along a curve; four stations keyed to scroll sub-ranges; background colour ramp
green → amber → `--maroon`; pouch and cup bring-forward; beans settle; product act kept calm so CTAs are
easy to hit.

### Phase 4 — Transitions + polish
Cross-fades between act backgrounds, the bloom-flare wipe masking Origin → Journey, beans-to-pouch
resolve, easing pass (expo/power, weighty).

### Phase 5 — Tiers, lite, a11y, perf, SEO
Device-tier detection (pointer type, `hardwareConcurrency`, live rAF frame-time sample with a rolling
window and hysteresis so it cannot flap); full `LiteApp`; WebGL-init failure fallback; contrast audit of
every brand pairing; keyboard + skip-link pass; code-split the 3D chunk; texture compression; render-loop
pause on hidden tab and scrolled-past canvas; prerender script (D1); Lighthouse run against §12.8.

---

## 4. Risks I am watching

1. **The harvest sequence does not exist.** Phase 2 ships on the still-image fallback and the real frames
   drop in behind a stable interface. Flagged early so the shoot/licensing can run in parallel.
2. **Frame-sequence decode is the likeliest jank source**, more than the 3D. Budget it as its own
   problem: cap concurrent decodes, preload a window around the current frame, never decode on the
   scroll callback.
3. **Tier detection that flaps** turns into a visible mode-switch mid-scroll. Hysteresis and a
   one-way-down demotion (never auto-promote back mid-session) prevent that.
4. **60fps is a measured claim, not an aspiration.** §2 says measure with rAF timing. A dev-only overlay
   reports p50/p95 frame time per act; the phase is not done until the numbers are recorded in
   `docs/PROGRESS.md`.
5. **Copy drift** across four consumers — handled by D2 plus the fidelity test.

---

## 5. Continuity (Rule #1)

- `docs/MASTER_PROMPT.md` — the brief, verbatim, never edited.
- `docs/PLAN.md` — this file; updated when a decision changes, with the reason.
- `docs/PROGRESS.md` — append-only session log: what was done, what is next, what is blocked, branch + commit.
- `docs/ASSETS.md` — every asset: real, placeholder, or missing, with its licence status.
- Commit and push at every meaningful step, not at the end of a session.

---

## 6. Open questions for Erick (blocking where marked)

1. **Assets** — do the Willow logo (SVG/PNG), the packaging renders (pouch, cup, tin-tie), and the brand
   PDF exist as files I can have? *Not blocking Phase 0; blocking a real-looking Phase 1.*
2. **Live WhatsApp number** — `254700000000` is the placeholder in §8. *Not blocking; ships as placeholder
   with a launch-checklist entry.*
3. **Deploy target** — Netlify, Vercel, GitHub Pages, or Hostinger? *Decides D5 (form endpoint) and the
   CI deploy step.*
4. **Contact form endpoint** — follows from 3.
5. **Reduced-motion routing** — confirm D3 (reduced motion → lite path) or ask for the de-animated WebGL variant.
