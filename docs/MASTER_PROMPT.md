# MASTER PROMPT — Willow Coffee Immersive Scroll Site

> This is the single source of truth for the project. Received from Erick 2026-09-03, stored verbatim.
> Follow it top to bottom. If anything conflicts, the Non-Negotiable Constraints section wins.

---

## 0. Your role and the goal

You are a senior creative front-end engineer who ships scroll-driven WebGL sites. Build an immersive, single-page, scroll-controlled marketing experience for **Willow Coffee**, a specialty single-origin coffee brand from Kenya's North Rift. The whole site is one continuous vertical scroll broken into cinematic "acts" that fade into each other. Scroll position drives everything: camera moves, 3D objects, and a scrubbed harvest sequence. The feeling should be warm, vivid, and alive, like the coffee is travelling from the highland farm into the viewer's cup.

This is a real business site whose job is to get people to order on WhatsApp or request a wholesale quote. Spectacle serves selling, never the other way round.

Reference feel: the falling-beans, big-blurred-type, product-in-focus energy of modern coffee landing pages, plus scroll-scrubbed storytelling in the spirit of high-end WebGL sites, but deliberately scoped down and reliable. Do not attempt a studio-tier clone. Ship something real that runs at 60fps on a mid-range laptop and degrades gracefully on phones.

---

## 1. The experience, act by act (high level)

One scroll. Five acts. Each act is a full-viewport scene. Transitions are cross-fades or camera pushes, never hard page jumps.

1. **Act 1 — Hero / "Where the highlands meet your cup."** Logo, a coffee cup, and coffee beans drift toward the viewer as they scroll, over a vivid orange-to-yellow gradient. Beans scatter with slow physics-like float. This is the wow moment.
2. **Act 2 — Origin / North Rift.** The vivid background gives way to the highland farm. A scroll-scrubbed image sequence of hand-picking cherries plays: scrolling moves the pickers. Short, then it fades out.
3. **Act 3 — The Journey.** Bean to bag: four steps (growing, harvesting, processing, roasting) revealed as the camera travels. Colour warms from green highland to deep roast maroon.
4. **Act 4 — The Product.** The packaging comes forward: the pouch and cup rotate into focus. Product cards and CTAs. This act must be the easiest to act on.
5. **Act 5 — Quality, credentials, footer.** Certifications, testimonials, contact, and a persistent order CTA.

---

## 2. Non-negotiable constraints (these override everything else)

- **Performance floor.** 60fps on a 2021 mid-range laptop. If a device cannot sustain ~30fps, auto-switch to the lite path (see section 10). Measure with `requestAnimationFrame` timing, not vibes.
- **Mobile-lite path is mandatory.** On phones and on low-power devices, do not run the full WebGL scene. Show a lighter version: static or lightly parallaxed brand art, real DOM copy, working CTAs. Never ship a phone experience that janks or drains battery.
- **`prefers-reduced-motion` is respected everywhere.** When set, disable scrubbing, dolly moves, and float. Snap sections into place and keep all content readable and reachable.
- **Content is real DOM, not baked into the canvas.** Every headline, paragraph, product, and CTA exists as real, crawlable, selectable HTML layered over the canvas. The canvas is decoration and drama, not the content layer. This protects SEO and accessibility.
- **CTA is always reachable.** A persistent "Order on WhatsApp" affordance is visible or one tap away from any scroll position. Never trap the user in a scene with no way to buy.
- **Logo integrity.** The Willow logo must never be stretched, tilted, shadowed, recoloured off-brand, or distorted by the WebGL scene. If the logo appears in 3D space it stays flat-facing, upright, and uses only brand colours. The vivid environment can do anything; the logo cannot.
- **No fake data.** Use the exact copy, products, and credentials in section 8. Do not invent SKUs, prices, or claims.
- **Graceful load.** A branded preloader covers first paint until core assets are ready. No flash of an empty canvas.

---

## 3. Tech stack

Use this stack unless you have a concrete reason not to, in which case state it.

- **Build:** Vite + React + TypeScript.
- **3D:** `three`, `@react-three/fiber`, `@react-three/drei`.
- **Post-processing:** `@react-three/postprocessing` (Bloom for the glow, Depth of Field for the "beans coming closer" focus, subtle Vignette).
- **Smooth scroll:** `lenis` (or `@studio-freight/lenis`).
- **Scroll timeline:** `gsap` with `ScrollTrigger`, wired to Lenis so ScrollTrigger reads Lenis's scroll value. This is the master clock. R3F reads the same normalised scroll progress.
- **State:** `zustand` for a tiny global store (scroll progress, current act, device tier, reduced-motion flag).
- **Fonts:** self-hosted, `font-display: swap`.

Install:

```bash
npm create vite@latest willow-coffee -- --template react-ts
cd willow-coffee
npm i three @react-three/fiber @react-three/drei @react-three/postprocessing gsap lenis zustand
```

Do not add a heavy commerce framework. Ordering is WhatsApp and email enquiry, so there is no cart or checkout to build.

---

## 4. Project structure

```
src/
  main.tsx
  App.tsx
  store/useAppStore.ts          // scroll progress, act index, deviceTier, reducedMotion
  scroll/
    Lenis.tsx                   // Lenis provider + GSAP ScrollTrigger sync
    useScrollProgress.ts        // normalised 0..1 global + per-act
  canvas/
    Scene.tsx                   // single <Canvas>, act mounting by scroll range
    Lights.tsx
    Effects.tsx                 // bloom, DOF, vignette (desktop tier only)
    acts/
      HeroAct.tsx
      OriginAct.tsx             // image-sequence scrub
      JourneyAct.tsx
      ProductAct.tsx
    objects/
      Beans.tsx                 // instanced beans
      Cup.tsx                   // cylinder + packaging texture
      Pouch.tsx                 // bent plane + packaging texture
      LogoBean.tsx              // the brand bean mark in 3D (brand-locked)
  dom/                          // real content, layered over canvas
    Nav.tsx
    HeroCopy.tsx
    OriginCopy.tsx
    JourneyCopy.tsx
    Products.tsx
    Quality.tsx
    Testimonials.tsx
    Footer.tsx
    StickyCTA.tsx
    Preloader.tsx
  lite/
    LiteApp.tsx                 // full non-WebGL fallback
  styles/
    tokens.css                  // brand tokens (section 6)
    globals.css
  assets/                       // see manifest, section 7
```

Architecture rule: **one `<Canvas>` for the entire site.** Acts mount and unmount based on scroll range so the GPU only renders what is near the viewport. DOM content scrolls normally in a tall container; the canvas is fixed full-viewport behind it.

---

## 5. Global systems

### 5.1 Smooth scroll + master timeline
- Initialise Lenis with a slow, weighty feel (lerp around 0.08 to 0.1, no rubber-banding on desktop).
- Register GSAP ScrollTrigger and feed it Lenis's scroll value on every Lenis `scroll` event, and call `lenis.raf()` from GSAP's ticker so there is one loop, not two.
- Compute a global progress value 0..1 for the whole page and a local 0..1 for each act. Store both in zustand. R3F components read these; they do not read `window.scrollY` directly.

### 5.2 Act mounting
- Define scroll ranges per act (for example Hero 0.0 to 0.2, Origin 0.2 to 0.45, and so on). Mount an act's 3D content only when global progress is within its range plus a small buffer so entry is pre-warmed.

### 5.3 Preloader
- Branded loader on the Willow marigold background: the logo bean mark centred, a thin progress bar in cream. Track real asset load (textures, image sequence key frames, any GLTF). Reveal the hero only at 100%. Keep it under a few seconds on broadband; if load stalls, still allow entry to the lite path.

### 5.4 Transitions between acts
- Cross-fade backgrounds by animating the gradient/scene colours along scroll.
- Use a short camera push or a bloom flare to mask the swap between the Origin image sequence and the Journey scene, so it reads as a filmic wipe, not a cut.

### 5.5 Device tiers
- Detect a tier on load: `high` (desktop, decent GPU), `mid` (capable laptop or high-end phone), `low` (everything else). Base it on a quick check of pointer type, hardware concurrency, and an initial frame-time sample. `low` goes straight to the lite path. `mid` runs the scene with post-processing off and reduced instance counts.

---

## 6. Brand tokens

Sampled from the supplied brand PDF and packaging renders. Put these in `tokens.css`. Confirm against the master brand file before launch.

```css
:root{
  /* Core brand */
  --marigold:    #FAAF40;  /* brand base, safe surfaces, preloader bg */
  --amber-orange:#DD7310;  /* vivid energy, hero mid-gradient */
  --amber-yellow:#F1C82D;  /* vivid highlight, hero top-gradient */
  --amber-deep:  #B4560A;  /* hero bottom-gradient, warm shadow */
  --bean:        #371101;  /* logo bean, primary dark text */
  --bean-soft:   #4B2F23;  /* secondary brown */
  --cream:       #F7F0DA;  /* willow strokes, light text on dark */
  --tan:         #A58B50;  /* calm premium alt surface */
  /* Accents (use sparingly) */
  --willow-green:#6E7B2E;  /* highland foliage, Origin act only */
  --maroon:      #6E1E1A;  /* deep roast, Journey step 04 */
}
```

**Hero gradient:** top `--amber-yellow` to mid `--amber-orange` to bottom `--amber-deep`. Animate the stops subtly with scroll for life.

**Typography:** rounded, friendly, lowercase-leaning display to match the logo wordmark. Use a rounded geometric display face such as Fredoka or Baloo 2 for headlines, and a clean neutral sans such as Inter or Nunito Sans for body. Self-host both. Display headlines are lowercase to echo "willow coffee".

**Logo:** dark bean silhouette (`--bean`) with cream (`--cream`) willow branches and the central S-curve trunk. Wordmark "willow coffee" lowercase, stacked. Enforce the don'ts from section 2.

**Willow leaf pattern:** the thin drooping-branch motif from the packaging. Supply as a tileable SVG. Use it as a low-opacity texture on surfaces and as floating parallax elements, never on top of the logo's clear space.

**Motion language:** slow, warm, weighty. Prefer expo and power eases. Beans float and settle rather than snap. Camera dollies rather than cuts.

---

## 7. Asset manifest and fallbacks

For each asset, use the primary approach. If the asset is missing, use the fallback so the build is never blocked.

- **Coffee beans (3D).** Primary: a single low-poly bean GLTF, instanced 40 to 120 times with slight scale and rotation variance and a warm normal/roughness map. Fallback: a deformed sphere or lathe geometry with a bean normal map. Lite fallback: 2D bean sprites with parallax.
- **Cup (3D).** Primary: a cylinder with the Willow cup packaging render mapped as a texture, slight top taper, plastic lid rim. Do not model a cup from scratch; wrap the existing render. Fallback: flat cup PNG with parallax.
- **Pouch / bag (3D).** Primary: a lightly bent plane (or a rounded box) with the Willow pouch render mapped on, so the existing artwork does the work. Fallback: flat pouch PNG.
- **Logo bean mark (3D).** A flat, upright, brand-locked plane facing camera, using the official logo asset. Never distorted.
- **Harvest image sequence (Origin act).** Primary: 60 to 120 frames of North Rift hand-picking, exported as optimised WEBP/JPG at a size the target device can decode (serve a smaller set to mid tier). Scrub frame index by act-local scroll progress, drawn to a canvas or an R3F texture whose `needsUpdate` flips per frame. Fallback: a single looping muted autoplay `<video>` or, failing that, a still hero image with 2 to 3 parallax layers. **Sourcing note for the human: you do not have this footage yet. Shoot it around Nandi Hills or Kitale, license authentic Kenyan-harvest stock, or render a consistent sequence. Confirm usage rights before launch.**
- **Environment lighting.** A warm studio HDRI for believable bean and packaging highlights. Keep file size modest; compress.
- **Willow pattern SVG.** Tileable, in brand colours.
- **Fonts.** Self-hosted WOFF2 for the two families above.

Every texture: compressed (KTX2/Basis where practical), power-of-two where it matters, and lazy-loaded per act.

---

## 8. Act-by-act build spec (with real copy)

Use this copy verbatim. It is the brand's own wording.

### Act 1 — Hero
- **Scene:** vivid orange-to-yellow gradient. Beans float in depth. As scroll progress rises, the cup, the logo bean mark, and a cluster of beans dolly toward the camera and grow, with Depth of Field pulling focus onto the cup. Slow parallax on floating willow-leaf motifs.
- **Camera:** starts pulled back, pushes in on scroll. Never rolls the logo.
- **DOM copy (layered):**
  - Eyebrow: `North Rift Kenya · grown with nature`
  - H1: `Where the Highlands Meet Your Cup`
  - Sub: `a contemporary coffee brand inspired by the relationship between coffee, nature and the places where it's grown. hand-picked. small-batch roasted. packaged for retail and export.`
  - Buttons: `explore our coffee` (scrolls to Product), `our story` (scrolls to Origin)
- **Exit:** gradient cools and desaturates toward highland tones as Origin approaches.

### Act 2 — Origin (North Rift, scrubbed harvest)
- **Scene:** the harvest image sequence, scrubbed by act-local scroll. Scrolling moves the pickers. Keep it short: the full sequence spans this act's scroll range only. Overlay a soft grain and a warm colour grade toward `--willow-green` highland light.
- **DOM copy (layered, appears as the sequence plays):**
  - Eyebrow: `Our Origin`
  - H2: `from the rift valley's red soil to your morning ritual`
  - Body 1: `The North Rift is where Kenya's world-champion runners train in thin highland air. It is also where Willow Coffee grows, in the same volcanic red soil, at the same high altitude, nurtured by the same ethic of relentless excellence.`
  - Body 2: `Our coffee is not blended. It is not generic "Kenyan." It is traceable to specific farms in Nandi Hills and Kitale, land our farming families have tended for generations, where every cherry is selected by hand.`
  - Stat chips: `2,100m Altitude` · `Hand-Picked Every Cherry` · `North Rift Single Origin`
- **Exit:** the sequence fades to its last frame, a bloom flare masks the swap, and the Journey scene resolves in.

### Act 3 — The Journey (bean to bag)
- **Scene:** camera travels along a path. Four stations reveal in turn as their scroll sub-range hits. Background colour warms from highland green through amber to deep roast `--maroon` at step 04.
- **DOM copy (layered):**
  - Eyebrow: `The Journey`
  - H2: `from flower to cup, every step, traced`
  - Step 01 · Growing — `Slow Ripening at High Altitude`: `Our arabica cherries ripen for 9 to 11 months at 2,100m. The cool nights and equatorial sun build layered sweetness and bright acidity that define North Rift character.`
  - Step 02 · Harvesting — `Selected by Hand, Cherry by Cherry`: `No machine stripping. No compromise. Our farming families walk the rows and pick only the deepest red cherries at peak ripeness, a process that takes skill honed over generations.`
  - Step 03 · Processing — `Washed & Sun-Dried on Raised Beds`: `Cherries are pulped and fermented using clean mountain water, then laid on raised drying beds for 18 to 21 days. This washed process preserves clean, complex flavour clarity.`
  - Step 04 · Roasting — `Small-Batch Roasted to Order`: `We roast in small batches, never pre-roasting for stock, so every bag reaches you within days of roasting, at the peak of freshness and flavour complexity.`
- **Exit:** the roasted beans tumble forward and resolve into the finished pouch of Act 4.

### Act 4 — The Product
- **Scene:** the pouch and cup rotate into focus over a rich amber field. Beans settle around them. This act is calmer and reads clearly; it is where people decide to buy. Keep motion gentle so the CTAs are easy to hit.
- **DOM copy + product cards (layered, fully interactive):**
  - Eyebrow: `Our Packaging`
  - H2: `north rift coffee, ready to shelf`
  - Intro: `premium single-origin coffee in branded retail pouches and wholesale bulk bags. Available 250g to 10kg. Private label and custom packaging on request.`
  - **Products (use exactly these):**
    1. **willow aa retail pouch** [RETAIL] — notes: Jasmine, Blackcurrant, Citrus. `Our flagship retail product. Packaged in resealable kraft pouches with a one-way degassing valve. Ready for specialty store shelves. Min. wholesale: 20 units.` Weights: 250g / 500g / 1kg. Grinds: Whole Bean / Coarse / Fine / Espresso.
    2. **willow ab premium pouch** [RETAIL] — notes: Dark Cherry, Brown Sugar, Hazelnut. `Our bestselling packaged product. Matte-finish branded pouch ideal for supermarket shelf, café resale, or corporate gifting. Available as private label.` Weights: 250g / 500g / 1kg / 2kg. Grinds: Whole Bean / Coarse / Fine / Espresso.
    3. **willow peaberry limited tin-tie** [LIMITED] — notes: Tropical Fruit, Honey, Winey. `Rare single-seed cherry, packaged in a premium foil tin-tie bag with origin certificate. Perfect for gift shops and high-end hospitality. Seasonal batches.` Weights: 250g / 500g. Grinds: Whole Bean / Coarse / Fine / Espresso.
    4. **willow wholesale bulk bag** [WHOLESALE] — `For cafés, hotels, restaurants, and distributors. Available in 2kg, 5kg, and 10kg bags, unbranded, roasted whole bean, or ground to spec. We supply across Kenya and export to East Africa.` Weights: 2kg / 5kg / 10kg. Grinds: Whole Bean / Custom Grind / Green Bean (unroasted).
  - **Per-card CTAs:** `Order via WhatsApp` (prefill a wa.me message with the selected product, weight, and grind) and `Request Wholesale Quote` (scrolls to contact).
  - **Packaging blurbs:** `Retail-Ready Packaging`, `Private Label Available` (Min. 50 units), `Export Packaging` (jute sacks, GrainPro-lined bags, vacuum-sealed pouches for EU, US, GCC).
- WhatsApp link pattern: `https://wa.me/254700000000?text=<url-encoded message>`. Replace the number with the live business number before launch.

### Act 5 — Quality, credentials, footer
- **Scene:** motion calms fully. Brand marigold surface, willow pattern low-opacity, beans at rest.
- **DOM copy (layered):**
  - Eyebrow: `Quality & Credentials`
  - H2: `trusted from farm to export`
  - Intro: `Our coffee meets the highest international standards, graded, tested, and certified for quality you can taste and verify.`
  - **Kenya Coffee Board:** `Licensed and registered with the Kenya Coffee Board. All our lots are officially graded before export.`
  - **KEBS Certified:** `Kenya Bureau of Standards certification ensures every batch meets national and international food safety standards.`
  - **Export Ready:** `Cleared for export to EU, US, and Middle East markets. Full documentation, phytosanitary certificates, and traceability records available on request.`
  - **SDGs:** 01 No Poverty · 08 Decent Work · 12 Responsible Consumption · 13 Climate Action.
  - **Quality Dossier CTA:** `Request Our Quality Dossier` (mailto to info@willowscoffee.co.ke) and `Or ask on WhatsApp`.
  - **Testimonials (4, verbatim):**
    - Thomas K., Specialty Roaster, Nairobi: `The North Rift character is unmistakable, that altitude-driven brightness, the clean finish. We've been sourcing Willow AA for two years and our customers ask for it by name.`
    - Sarah M., Green Coffee Buyer, UK: `What sets Willow apart is the traceability. I know the farm, I know the processing lot, I know the drying time. That transparency is increasingly what my buyers in London demand.`
    - Amina W., Home Barista, Nairobi: `I ordered the Peaberry on a whim and it completely changed my morning routine. Complex, sweet, and unlike anything I'd had from Kenya before. Now I subscribe.`
    - David O., Café Owner, Eldoret: `We serve Willow AB in our café and our customers consistently rate it as the best filter coffee on our menu. The medium roast hits that perfect balance.`
  - **Footer:** logo + `warm coffee, grown with nature`; quick links (our story, the coffee, our journey, contact); coffees list; `Nandi Hills, Rift Valley, Kenya`; `info@willowscoffee.co.ke`; `order on whatsapp`; `© 2025 Willow Coffee Ltd`.
- **Contact form fields:** Name, Email, Phone (optional), Subject (Order Enquiry / Wholesale-Bulk Order / Private Label Enquiry / Export Partnership / General), Message. Plus the Nandi Hills map embed.

---

## 9. Performance budget

- Total initial JS + WASM under ~400KB gzipped before the 3D chunk; code-split the canvas so the lite path never downloads it.
- Textures compressed (KTX2/Basis). Serve smaller texture and image-sequence sets to the mid tier.
- Instance beans; never create them in a loop as separate meshes.
- Unmount off-screen acts. Pause the render loop when the tab is hidden and when the canvas is fully scrolled past.
- Target LCP under 2.5s on broadband, first interaction not blocked by the 3D bundle.

---

## 10. Accessibility and fallbacks

- **Lite path (`src/lite/LiteApp.tsx`):** a complete, no-WebGL version. Same copy, same products, same CTAs, brand art as static or lightly parallaxed images. Served to `low` tier, to `prefers-reduced-motion`, and if WebGL fails to initialise.
- All text meets WCAG AA contrast. Note: `--bean` text on `--marigold` passes; light text uses `--cream` on dark scenes. Verify every pairing.
- Full keyboard navigation. All CTAs are real links or buttons with visible focus states.
- Provide skip-to-content. The scroll narrative must not trap keyboard or screen-reader users.
- Respect `prefers-reduced-motion`: no scrub, no dolly, no float; sections snap and are fully usable.

---

## 11. SEO

- Real DOM content (already required in section 2) plus a static prerender of the copy so crawlers get the full text without executing the scene. Consider a light prerender step (for example `vite-plugin-prerender` or serving the lite HTML to bots).
- Carry over the existing meta: title `willow coffee — warm coffee, grown with nature`, the description, Open Graph and Twitter card tags, and the keyword themes (Kenyan coffee, North Rift coffee, specialty arabica, Nandi Hills coffee, single origin, wholesale coffee Kenya).
- Add JSON-LD `Organization` and `Product` structured data for the four products.

---

## 12. Acceptance criteria (definition of done)

1. Full scroll runs at 60fps on a mid-range 2021 laptop; auto-falls to lite below ~30fps.
2. Phone visitors get the lite path automatically and it looks intentional, not broken.
3. `prefers-reduced-motion` produces a calm, fully usable site.
4. Every headline, product, credential, and CTA is real, selectable DOM text.
5. "Order on WhatsApp" is reachable from any scroll position in one action, with product context prefilled from Act 4.
6. The logo never violates the brand don'ts in any act or any tier.
7. Preloader covers first paint; no empty-canvas flash.
8. Lighthouse: Performance 85+ on desktop, Accessibility 95+, SEO 95+.
9. All copy matches section 8 exactly.

---

## 13. Build in phases (ship value early)

- **Phase 0 — Skeleton.** Vite + React + TS, Lenis + GSAP ScrollTrigger, zustand store, all DOM content and CTAs laid out and working with zero WebGL. This alone is a shippable, better-than-current site.
- **Phase 1 — Hero scene.** Canvas, lights, gradient, instanced beans, cup, logo mark, scroll-driven dolly, DOF and bloom on desktop tier.
- **Phase 2 — Origin scrub.** Image-sequence scrubber wired to act-local scroll, with the video and still fallbacks.
- **Phase 3 — Journey + Product scenes.** Camera travel, four steps, packaging bring-forward, product interactivity.
- **Phase 4 — Transitions + post-processing polish.** Cross-fades, flare wipe, colour-along-scroll.
- **Phase 5 — Tiers, lite path, a11y, perf, SEO.** Device detection, full lite build, reduced-motion, budgets, structured data, Lighthouse pass.

At the end of each phase the site must build and deploy. Do not leave the tree broken between phases.

---

## Notes for the human (Erick)

- Replace the placeholder WhatsApp number `254700000000` and confirm `info@willowscoffee.co.ke` before launch.
- The harvest image sequence is the critical missing asset. Line it up early: shoot in the North Rift, license authentic footage, or render a consistent sequence, and lock usage rights.
- Confirm the exact brand hexes against the master brand file; the values here are sampled from the supplied PDF and renders.
- Decide whether Act 4 should later grow into a real cart. For now WhatsApp and enquiry is the flow, and the stack above assumes that.
- Plan first, then build.
