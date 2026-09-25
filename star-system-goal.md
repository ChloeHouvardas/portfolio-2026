# /goal — Star System page

Build a page at **`/star-system`** rendering a **fully procedurally generated** scene closely matching `references/starSystem.png`. Unlike Rainbow Tree, do **not** ship or draw the PNG — every pixel comes from code; side by side, the page should read as the same scene.

## Reference breakdown (study the PNG first)

1. Pure black (#000) background; large empty regions.
2. A sinuous **"river of stars"**: a continuous S-curve of dense particles entering top-left as a wide spray, narrowing as it sweeps right and down, bending back left, exiting the bottom as a broad delta — a milky-way stream, not a straight band.
3. **Filamentary streamlines** under the specks: thousands of faint hair-thin blue-grey strands tracing the flow, feathering into wisps at the edges, a few straying into the black.
4. **Star colors**: mostly white/blue-white points of varying size/glow, plus scattered gold, cyan, magenta, green, violet accents — most colorful and dense in the upper-left plume, calmer and whiter downstream.
5. **Bright white core** at the S-bend center where density peaks, with a **tiny black human silhouette** standing in it, facing away — the focal point. Drawn procedurally, placed in the brightest region so it reads backlit.
6. Sparse loose stars in the black voids.

Reference is portrait; the page must fill any viewport — portrait phones match the reference most literally, wide screens let the curve breathe (no letterboxing).

## Hard requirements

- **Procedural only, deterministic per seed.** Reuse `mulberry32`/value-noise/`fbm` from `frontend/src/pages/RainbowTree/noise.ts` (extract shared code, don't copy-paste) to drive a flow field defining the river centerline, width, filaments, and particle placement.
- **Subtle ambient animation** ("living photo"): per-star twinkle phases, faint filament shimmer, slow core breathing — barely-alive, no conveyor-belt flow.
- **`prefers-reduced-motion`** ⇒ full static scene, no animation loop (mirror `useRainbowTreeScene`).
- **Existing page pattern**: `frontend/src/pages/StarSystem/` (page component, `useStarSystemScene` hook, `Scene` class, CSS file); route in `App.tsx` via `usePathname()`; `Star system →` link on Home and `← Home` on the page; set/restore `document.title` like `RainbowTreePage.tsx`.
- Canvas with `role="img"` + descriptive `aria-label`.

## Rendering & performance

- Canvas 2D with layered offscreen buffers (Rainbow Tree `Scene` is the template); WebGL OK if needed, but no heavy deps (no three.js).
- Paint expensive layers (filaments, dim stars) **once** at init; per-frame = compositing + the few animated particles. No live `ctx.filter` per frame — pre-render glow sprites and stamp (see `sparkles.ts`).
- Adaptive quality: sample frame times, degrade (fewer animated particles, lower-res buffers) to stay smooth on a mid-range phone. Handle `devicePixelRatio` and resize (regenerate field, same seed).

## AGENTS.md compliance

Mobile-first (portrait first, then scale up); links work via touch/mouse/keyboard with visible focus and adequate hit targets; no overlap/clipping at common widths; verify Chromium + WebKit; motion cheap on mobile.

## Testing

Add `frontend/tests/e2e/star-system.spec.ts` modeled on `rainbow-tree.spec.ts`: canvas via `getByRole('img',…)` visible with non-trivial box; assert zero page/console errors; two screenshots ~1.5s apart differ; **pixel sanity** — most pixels near-black, a few percent bright, brightness non-uniform (band brighter than corners), loose thresholds; navigate Home and assert the heading. Run the whole e2e suite and fix failures.

## Done when

1. `/star-system` recognizably matches the reference at phone portrait size.
2. No image assets; deterministic per seed.
3. Reduced-motion static; normal mode twinkles.
4. Smooth on mobile, zero console errors.
5. Home ↔ page nav works by touch/mouse/keyboard.
6. New spec + existing suite pass.
