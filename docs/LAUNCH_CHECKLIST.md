# LAUNCH CHECKLIST

Nothing here is optional. Every item is a thing that is wrong in the tree today and must be
right before the site is public. Sourced from master prompt §2, §8, §12 and the "Notes for
the human".

## Blocking — the site is wrong until these are done

- [ ] **Replace the WhatsApp number.** `254700000000` is a placeholder from §8. It lives in
      exactly one place: `brand.whatsappNumber` in `src/content/site.ts`. Every CTA on the
      site reads from there.
- [ ] **Confirm `info@willowscoffee.co.ke`** is the live inbox, and that someone reads it.
- [x] **Verify the brand hexes** in `src/styles/tokens.css`. Done by sampling the supplied
      packaging photograph (`assets-src/exhibit-amber.png`) down the bag's short axis. Every
      amber token landed within a couple of levels of its photographed pixel — see
      `docs/ASSETS.md`. Not changed as a result: they were already right.
- [ ] **Supply a vector logo.** The real mark is in the tree (`public/brand/willow-logo.png`)
      but as a 256×341 raster. Get an SVG before it is used large or in 3D, and re-check the
      §2 logo rules against every act and every device tier.
- [ ] **Lock usage rights on the harvest footage** before it ships. See `docs/ASSETS.md`.
- [ ] **Pick the form endpoint.** The contact form currently composes a `mailto:` — honest,
      but not a submission pipeline. See build plan D5.
- [ ] **Supply or approve the placeholder strings** in `docs/COPY_GAPS.md`.
- [ ] **Add an `og:image`.** There is no social card art, so `index.html` deliberately ships
      without the tag rather than pointing at nothing.
- [ ] **Reconcile the logo's stroke colour.** §6 describes cream (`#F7F0DA`) willow branches;
      the real artwork uses pure white. The asset ships as supplied — §2 forbids recolouring
      the logo — but the brand should confirm which is correct.

## Verification — the acceptance criteria in §12

- [ ] 60fps on a mid-range 2021 laptop. `FrameMeter` measures p95 frame time in the render loop
      and demotes automatically, but **no number has been recorded on real hardware.**
- [ ] Auto-falls to the lite path below ~30fps, and the switch is not visible mid-scroll.
- [ ] Phones get the lite path and it looks intentional.
- [ ] `prefers-reduced-motion` produces a calm, fully usable site.
- [x] Every headline, product, credential and CTA is selectable DOM text — asserted in `App.render.test.tsx`.
- [ ] Order CTA reachable in one action from any scroll position, product context prefilled.
- [ ] Preloader covers first paint — no empty-canvas flash.
- [ ] Lighthouse: Performance 85+ desktop, Accessibility 95+, SEO 95+. **Needs a browser — not run.**
- [x] Copy matches §8 exactly — enforced continuously by `copy.fidelity.test.ts`.
- [x] Every brand colour pairing checked for WCAG AA contrast — automated in `contrast.test.ts`.
      It found two real failures: cream body text on raw `--willow-green` (4.06:1) and on raw
      `--amber-deep` (4.31:1). The Journey gradient stops were deepened toward `--bean` in response.
- [ ] Canonical URL and `og:url` point at the real domain.
