# ASSET REGISTER

Every asset the site uses or will use, and its honest status. Master prompt §7 says
to fall back rather than block; this file exists so no fallback ships by accident.

**Rule: nothing marked PLACEHOLDER may go to production.** Check this file before launch.

---

## Present and real

| Asset | Path | Status | Licence |
|---|---|---|---|
| Fredoka (display, variable 400–600, latin) | `public/fonts/fredoka-latin-var.woff2` | ✅ real | SIL OFL 1.1 — `public/fonts/OFL.txt` |
| Inter (body, variable 400–600, latin) | `public/fonts/inter-latin-var.woff2` | ✅ real | SIL OFL 1.1 |
| Brand colour tokens | `src/styles/tokens.css` | ⚠️ sampled from the brand PDF, **unverified** | — |
| Nandi Hills map | OpenStreetMap embed in `src/dom/Contact.tsx` | ✅ real | ODbL, embed permitted |

## Placeholders in the tree right now

| Asset | Where | Why | Replace with |
|---|---|---|---|
| Logo mark | `src/dom/LogoMark.tsx` | The official logo was never supplied. Drawn to the §6 description — dark bean, cream willow branches, central S-curve — and obeying every §2 logo rule. | Official Willow SVG. Swap the component's innards; the interface stays. |
| Origin media panel | `.origin__media` in `src/styles/components.css` | The harvest sequence does not exist. A brand-coloured highland field stands in — deliberately **not** a stock photo of someone else's farm. | The real scrubbed sequence (below). |
| `og:image` | absent from `index.html` | No brand card art exists. A missing social card is better than a wrong one. | 1200×630 brand card. |
| Meta description | `src/content/site.ts` → `meta.description` | §11 says carry over "the existing" one; it was never supplied. Built only from facts already in §8 — invents no claim. | The brand's own description. |

## Missing — needed before the phase that uses them

| Asset | Needed by | Note |
|---|---|---|
| **North Rift harvest image sequence** (60–120 frames, WEBP/JPG) | Phase 2 | **The critical one.** Shoot around Nandi Hills or Kitale, license authentic Kenyan-harvest stock, or render a consistent sequence. **Lock usage rights before launch.** Phase 2 ships on the still fallback until it lands, behind a stable interface. |
| Packaging renders — pouch, cup, tin-tie | Phase 1 / 3 | §7 says wrap the existing renders rather than model from scratch. Without them the 3D packaging is untextured brand-coloured geometry. |
| Low-poly bean GLTF (+ normal / roughness maps) | Phase 1 | §7 fallback is lathe / deformed-sphere geometry, which is acceptable but visibly cheaper. |
| Warm studio HDRI | Phase 1 | For believable bean and packaging highlights. Compress hard. |
| Willow leaf pattern, tileable SVG | Phase 1 / 4 | The drooping-branch motif from the packaging, in brand colours. |
| Brand PDF | before launch | To verify the sampled hexes in `tokens.css`. |
