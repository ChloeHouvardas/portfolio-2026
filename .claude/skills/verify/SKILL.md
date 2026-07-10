---
name: verify
description: Build, launch, and drive this portfolio app to visually verify changes end-to-end
---

# Verifying changes in this repo

Single-page React app; everything lives in `frontend/` (pnpm).

## Build + launch

```bash
cd frontend
pnpm build                                   # tsc -b + vite build
pnpm preview --host 127.0.0.1 --port 4174 &  # serves dist/ (use 4174; e2e owns 4173)
```

## Drive + screenshot

`@playwright/test` is a frontend devDependency. From a Node ESM script, resolve it
through the package or it won't be found:

```js
import { createRequire } from 'module'
const require = createRequire('<abs path>/frontend/package.json')
const { chromium } = require('@playwright/test')
```

Useful contexts: `colorScheme: 'light' | 'dark'` (theme init follows OS when
localStorage is empty), `reducedMotion: 'reduce'`, mobile `{ width: 390, height: 844,
isMobile: true, hasTouch: true }`.

## Flows worth driving

- Theme: `data-testid="theme-toggle"` in the nav; check `document.documentElement.dataset.theme`
  and `localStorage.theme`. Toggle animates a ~650ms View Transitions diagonal sweep —
  screenshot at ~200ms for the mid-frame.
- Holo cards: hover `.holo-card` with `mouse.move(..., { steps: N })` to fire the tilt/shine.
- Sections by anchor: `#hero`, `#about`, `#featured-projects`, `#experience`, `#contact`.

## Gotchas

- `pnpm test:e2e` pixel-asserts the featured-projects gallery stays dark (>12% dark,
  >35% non-white) — it must stay dark in BOTH themes.
- Light mode is the frozen reference design; dark styling is additive
  (`dark:` classes / `[data-theme='dark']` overrides only).
