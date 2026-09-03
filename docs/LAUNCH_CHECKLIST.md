# LAUNCH CHECKLIST

Nothing here is optional. Every item is a thing that is wrong in the tree today and must be
right before the site is public. Sourced from master prompt §2, §8, §12 and the "Notes for
the human".

## Blocking — the site is wrong until these are done

- [ ] **Replace the WhatsApp number.** `254700000000` is a placeholder from §8. It lives in
      exactly one place: `brand.whatsappNumber` in `src/content/site.ts`. Every CTA on the
      site reads from there.
- [ ] **Confirm `info@willowscoffee.co.ke`** is the live inbox, and that someone reads it.
- [ ] **Verify the brand hexes** in `src/styles/tokens.css` against the master brand file.
      They were sampled from the supplied PDF and renders, not taken from a spec.
- [ ] **Replace the placeholder logo** (`src/dom/LogoMark.tsx`) with the official SVG, and
      re-check the §2 logo rules against every act and every device tier.
- [ ] **Lock usage rights on the harvest footage** before it ships. See `docs/ASSETS.md`.
- [ ] **Pick the form endpoint.** The contact form currently composes a `mailto:` — honest,
      but not a submission pipeline. See build plan D5.
- [ ] **Supply or approve the placeholder strings** in `docs/COPY_GAPS.md`.
- [ ] **Add an `og:image`.** There is no social card art, so `index.html` deliberately ships
      without the tag rather than pointing at nothing.

## Verification — the acceptance criteria in §12

- [ ] 60fps on a mid-range 2021 laptop, measured with rAF timing, recorded in `PROGRESS.md`.
- [ ] Auto-falls to the lite path below ~30fps, and the switch is not visible mid-scroll.
- [ ] Phones get the lite path and it looks intentional.
- [ ] `prefers-reduced-motion` produces a calm, fully usable site.
- [ ] Every headline, product, credential and CTA is selectable DOM text.
- [ ] Order CTA reachable in one action from any scroll position, product context prefilled.
- [ ] Preloader covers first paint — no empty-canvas flash.
- [ ] Lighthouse: Performance 85+ desktop, Accessibility 95+, SEO 95+.
- [ ] Copy matches §8 exactly (enforced continuously by `copy.fidelity.test.ts`).
- [ ] Every brand colour pairing checked for WCAG AA contrast.
- [ ] Canonical URL and `og:url` point at the real domain.
