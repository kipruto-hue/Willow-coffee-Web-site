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
| **Willow logo mark** | `public/brand/willow-logo.png` (256×341 RGBA) | ✅ real — the brand's own asset, taken from the existing Willow site | brand-owned |
| Meta description, OG copy, keywords | `src/content/site.ts`, `index.html` | ✅ real — the brand's own strings, lifted from the existing site per §11 | brand-owned |
| `--bean` (#371101) | `src/styles/tokens.css` | ✅ **verified** — the logo's silhouette samples to exactly this value | — |
| Other brand hexes | `src/styles/tokens.css` | ⚠️ sampled from the brand PDF, **unverified** | — |
| Nandi Hills map | OpenStreetMap embed in `src/dom/Contact.tsx` | ✅ real | ODbL, embed permitted |

## Placeholders in the tree right now

| Asset | Where | Why | Replace with |
|---|---|---|---|
| Logo **format** | `public/brand/willow-logo.png` | The artwork is real, but it is a 256×341 raster. Fine at nav and footer size; it will soften on a large hero treatment or in 3D. | A vector (SVG) export of the same mark. |
| Origin harvest scene | `src/origin/harvestScene.ts` | The real sequence does not exist. Rather than pass off stock footage of someone else's farm as Willow's, the fallback **renders** a travelling coffee row: branches, leaves, cherries passing through focus, one warm key light. Art-directed from Erick's reference frame — the principle, not the picture. | The real scrubbed sequence (below). Set `HARVEST_MANIFEST` and nothing else changes. |
| `og:image` | absent from `index.html` | No brand card art exists. A missing social card is better than a wrong one. | 1200×630 brand card. |

## Missing — needed before the phase that uses them

| Asset | Needed by | Note |
|---|---|---|
| **North Rift harvest image sequence** (60–120 frames, WEBP/JPG) | already built for | **The critical one.** Shoot around Nandi Hills or Kitale, license authentic Kenyan-harvest stock, or render a consistent sequence. **Lock usage rights before launch.** The scrubber, the preload window and the decode cap are already built and tested: drop frames into `public/harvest/` and fill in `HARVEST_MANIFEST` in `src/origin/frameSource.ts`. A test asserts the fallback is in use, and will flip the moment a manifest is set. |
| Packaging renders — pouch, cup, tin-tie | Phase 1 / 3 | §7 says wrap the existing renders rather than model from scratch. Without them the 3D packaging is untextured brand-coloured geometry. |
| Low-poly bean GLTF (+ normal / roughness maps) | Phase 1 | §7 fallback is lathe / deformed-sphere geometry, which is acceptable but visibly cheaper. |
| Warm studio HDRI | Phase 1 | For believable bean and packaging highlights. Compress hard. |
| Willow leaf pattern, tileable SVG | Phase 1 / 4 | The drooping-branch motif from the packaging, in brand colours. |
| Brand PDF | before launch | To verify the sampled hexes in `tokens.css`. |
