// Extracts compact structural data from references/rainbow_tree.png so the
// Rainbow Tree page can be rendered fully procedurally (no image at runtime):
//   - branch centerline polylines with radii (dark-mask skeletonization)
//   - bright light points with their colors (local-maxima detection)
//   - a coarse color/luminance field guiding the canopy texture
//   - the sun glint position
// Output: src/pages/RainbowTree/reference-data.ts
// Run: node scripts/extract-reference.mjs

import { chromium } from '@playwright/test'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const imgPath = resolve(here, '../../references/rainbow_tree.png')
const outPath = resolve(here, '../src/pages/RainbowTree/reference-data.ts')

const dataUrl = `data:image/png;base64,${readFileSync(imgPath).toString('base64')}`

const browser = await chromium.launch()
const page = await browser.newPage()

const result = await page.evaluate(async (src) => {
  const img = new Image()
  await new Promise((res, rej) => {
    img.onload = res
    img.onerror = rej
    img.src = src
  })

  const AW = 540
  const AH = Math.round((img.naturalHeight / img.naturalWidth) * AW)
  const cv = document.createElement('canvas')
  cv.width = AW
  cv.height = AH
  const cx = cv.getContext('2d', { willReadFrequently: true })
  cx.drawImage(img, 0, 0, AW, AH)
  const d = cx.getImageData(0, 0, AW, AH).data
  const N = AW * AH

  const lum = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    lum[i] = 0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2]
  }

  // ---------- branch mask ----------
  let mask = new Uint8Array(N)
  for (let i = 0; i < N; i++) mask[i] = lum[i] < 40 ? 1 : 0

  const morph = (m, isErode) => {
    const out = new Uint8Array(N)
    for (let y = 1; y < AH - 1; y++) {
      for (let x = 1; x < AW - 1; x++) {
        const k = y * AW + x
        const s = m[k] + m[k - 1] + m[k + 1] + m[k - AW] + m[k + AW]
        out[k] = isErode ? (s === 5 ? 1 : 0) : s > 0 ? 1 : 0
      }
    }
    return out
  }
  mask = morph(morph(mask, true), false) // open: removes speckle-scale noise

  // connected components; drop tiny fragments
  const label = new Int32Array(N).fill(-1)
  const stack = []
  let nextLabel = 0
  const areas = []
  for (let i = 0; i < N; i++) {
    if (mask[i] === 0 || label[i] !== -1) continue
    let area = 0
    stack.push(i)
    label[i] = nextLabel
    while (stack.length) {
      const k = stack.pop()
      area++
      const x = k % AW
      const y = (k / AW) | 0
      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          const nx = x + ox
          const ny = y + oy
          if (nx < 0 || nx >= AW || ny < 0 || ny >= AH) continue
          const nk = ny * AW + nx
          if (mask[nk] === 1 && label[nk] === -1) {
            label[nk] = nextLabel
            stack.push(nk)
          }
        }
      }
    }
    areas.push(area)
    nextLabel++
  }
  for (let i = 0; i < N; i++) {
    if (mask[i] === 1 && areas[label[i]] < 250) mask[i] = 0
  }

  // ---------- distance transform (chamfer 3-4, /3 ~= px to background) ----------
  const INF = 1e9
  const dist = new Float32Array(N)
  for (let i = 0; i < N; i++) dist[i] = mask[i] === 1 ? INF : 0
  for (let y = 0; y < AH; y++) {
    for (let x = 0; x < AW; x++) {
      const k = y * AW + x
      if (dist[k] === 0) continue
      let v = dist[k]
      if (x > 0) v = Math.min(v, dist[k - 1] + 3)
      if (y > 0) {
        v = Math.min(v, dist[k - AW] + 3)
        if (x > 0) v = Math.min(v, dist[k - AW - 1] + 4)
        if (x < AW - 1) v = Math.min(v, dist[k - AW + 1] + 4)
      }
      dist[k] = v
    }
  }
  for (let y = AH - 1; y >= 0; y--) {
    for (let x = AW - 1; x >= 0; x--) {
      const k = y * AW + x
      if (dist[k] === 0) continue
      let v = dist[k]
      if (x < AW - 1) v = Math.min(v, dist[k + 1] + 3)
      if (y < AH - 1) {
        v = Math.min(v, dist[k + AW] + 3)
        if (x < AW - 1) v = Math.min(v, dist[k + AW + 1] + 4)
        if (x > 0) v = Math.min(v, dist[k + AW - 1] + 4)
      }
      dist[k] = v
    }
  }
  for (let i = 0; i < N; i++) dist[i] /= 3

  // ---------- Zhang-Suen thinning ----------
  const skel = Uint8Array.from(mask)
  const at = (x, y) => (x < 0 || x >= AW || y < 0 || y >= AH ? 0 : skel[y * AW + x])
  let changed = true
  while (changed) {
    changed = false
    for (let phase = 0; phase < 2; phase++) {
      const kill = []
      for (let y = 1; y < AH - 1; y++) {
        for (let x = 1; x < AW - 1; x++) {
          if (skel[y * AW + x] === 0) continue
          const p2 = at(x, y - 1)
          const p3 = at(x + 1, y - 1)
          const p4 = at(x + 1, y)
          const p5 = at(x + 1, y + 1)
          const p6 = at(x, y + 1)
          const p7 = at(x - 1, y + 1)
          const p8 = at(x - 1, y)
          const p9 = at(x - 1, y - 1)
          const b = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9
          if (b < 2 || b > 6) continue
          const seq = [p2, p3, p4, p5, p6, p7, p8, p9, p2]
          let a = 0
          for (let i = 0; i < 8; i++) if (seq[i] === 0 && seq[i + 1] === 1) a++
          if (a !== 1) continue
          if (phase === 0) {
            if (p2 * p4 * p6 !== 0 || p4 * p6 * p8 !== 0) continue
          } else {
            if (p2 * p4 * p8 !== 0 || p2 * p6 * p8 !== 0) continue
          }
          kill.push(y * AW + x)
        }
      }
      if (kill.length) changed = true
      for (const k of kill) skel[k] = 0
    }
  }

  // ---------- skeleton graph -> polylines with radii ----------
  const deg = new Uint8Array(N)
  for (let y = 1; y < AH - 1; y++) {
    for (let x = 1; x < AW - 1; x++) {
      if (skel[y * AW + x] === 0) continue
      let n = 0
      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          if (ox === 0 && oy === 0) continue
          n += at(x + ox, y + oy)
        }
      }
      deg[y * AW + x] = n
    }
  }
  const visited = new Uint8Array(N)
  const branches = []
  const tracePath = (startK, firstK) => {
    const pts = [startK]
    let prev = startK
    let cur = firstK
    while (true) {
      pts.push(cur)
      visited[cur] = 1
      if (deg[cur] !== 2) break
      const x = cur % AW
      const y = (cur / AW) | 0
      let next = -1
      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          if (ox === 0 && oy === 0) continue
          const nk = (y + oy) * AW + x + ox
          if (skel[nk] === 1 && nk !== prev && (visited[nk] === 0 || deg[nk] !== 2)) {
            next = nk
            break
          }
        }
        if (next !== -1) break
      }
      if (next === -1) break
      prev = cur
      cur = next
    }
    return pts
  }
  for (let k = 0; k < N; k++) {
    if (skel[k] === 0 || deg[k] === 2) continue
    // endpoint or junction: start a path down every unvisited neighbor
    const x = k % AW
    const y = (k / AW) | 0
    for (let oy = -1; oy <= 1; oy++) {
      for (let ox = -1; ox <= 1; ox++) {
        if (ox === 0 && oy === 0) continue
        const nk = (y + oy) * AW + x + ox
        if (nk < 0 || nk >= N || skel[nk] === 0 || visited[nk] === 1) continue
        branches.push(tracePath(k, nk))
      }
    }
  }
  // leftover pure loops
  for (let k = 0; k < N; k++) {
    if (skel[k] === 1 && deg[k] === 2 && visited[k] === 0) {
      const x = k % AW
      const y = (k / AW) | 0
      let first = -1
      for (let oy = -1; oy <= 1 && first === -1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          if (ox === 0 && oy === 0) continue
          const nk = (y + oy) * AW + x + ox
          if (skel[nk] === 1) {
            first = nk
            break
          }
        }
      }
      if (first !== -1) branches.push(tracePath(k, first))
    }
  }

  // simplify: keep every 2nd point (plus ends), quantize, attach radii
  const outBranches = []
  for (const pts of branches) {
    if (pts.length < 4) continue
    const px = []
    const pr = []
    for (let i = 0; i < pts.length; i++) {
      if (i % 2 !== 0 && i !== pts.length - 1) continue
      const k = pts[i]
      px.push(Math.round((k % AW) * 2) / 2, Math.round(((k / AW) | 0) * 2) / 2)
      pr.push(Math.round(Math.max(0.6, dist[k]) * 10) / 10)
    }
    outBranches.push({ p: px, r: pr })
  }

  // ---------- lights ----------
  const candidates = []
  for (let y = 1; y < AH - 1; y++) {
    for (let x = 1; x < AW - 1; x++) {
      const l = lum[y * AW + x]
      if (l < 140) continue
      let isMax = true
      for (let oy = -1; oy <= 1 && isMax; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          if (ox === 0 && oy === 0) continue
          if (lum[(y + oy) * AW + x + ox] > l) {
            isMax = false
            break
          }
        }
      }
      if (isMax) candidates.push({ x, y, l })
    }
  }
  candidates.sort((a, b) => b.l - a.l)
  const suppressed = new Uint8Array(N)
  const lights = []
  const SUP = 6
  for (const c of candidates) {
    if (lights.length >= 900) break
    if (suppressed[c.y * AW + c.x]) continue
    for (let oy = -SUP; oy <= SUP; oy++) {
      for (let ox = -SUP; ox <= SUP; ox++) {
        const sx = c.x + ox
        const sy = c.y + oy
        if (sx >= 0 && sx < AW && sy >= 0 && sy < AH && ox * ox + oy * oy <= SUP * SUP) {
          suppressed[sy * AW + sx] = 1
        }
      }
    }
    let r = 0
    let g = 0
    let b = 0
    for (let oy = -1; oy <= 1; oy++) {
      for (let ox = -1; ox <= 1; ox++) {
        const k = ((c.y + oy) * AW + c.x + ox) * 4
        r += d[k]
        g += d[k + 1]
        b += d[k + 2]
      }
    }
    lights.push({
      x: c.x,
      y: c.y,
      b: Math.round(((c.l - 140) / 115) * 100) / 100,
      c: [Math.round(r / 9), Math.round(g / 9), Math.round(b / 9)],
    })
  }

  // ---------- sun ----------
  let sun = { x: Math.round(AW * 0.435), y: Math.round(AH * 0.177) }
  let best = -1
  for (let y = Math.floor(AH * 0.1); y < AH * 0.25; y++) {
    for (let x = Math.floor(AW * 0.3); x < AW * 0.6; x++) {
      if (lum[y * AW + x] > best) {
        best = lum[y * AW + x]
        sun = { x, y }
      }
    }
  }

  // ---------- coarse color field ----------
  const FW = 45
  const FH = Math.round((AH / AW) * FW)
  const fc = document.createElement('canvas')
  fc.width = FW
  fc.height = FH
  const fctx = fc.getContext('2d', { willReadFrequently: true })
  fctx.drawImage(img, 0, 0, FW, FH)
  const fd = fctx.getImageData(0, 0, FW, FH).data
  const field = []
  for (let i = 0; i < FW * FH; i++) {
    field.push(fd[i * 4], fd[i * 4 + 1], fd[i * 4 + 2])
  }

  return { aw: AW, ah: AH, branches: outBranches, lights, sun, fieldW: FW, fieldH: FH, field }
}, dataUrl)

await browser.close()

const json = JSON.stringify(result)
const ts = `// Generated by scripts/extract-reference.mjs from references/rainbow_tree.png — do not edit.
export interface RefBranch {
  /** Flat centerline points [x0, y0, x1, y1, ...] in analysis pixels. */
  p: number[]
  /** Half-width (radius) in analysis pixels per point. */
  r: number[]
}
export interface RefLight {
  x: number
  y: number
  /** 0..1 relative brightness. */
  b: number
  c: [number, number, number]
}
export interface ReferenceData {
  aw: number
  ah: number
  branches: RefBranch[]
  lights: RefLight[]
  sun: { x: number; y: number }
  fieldW: number
  fieldH: number
  /** Flat RGB triplets, row-major, fieldW x fieldH. */
  field: number[]
}
export const referenceData: ReferenceData = JSON.parse(${JSON.stringify(json)})
`
writeFileSync(outPath, ts)
console.log(
  `wrote ${outPath}: ${result.branches.length} branches, ${result.lights.length} lights, field ${result.fieldW}x${result.fieldH}, ${(ts.length / 1024).toFixed(0)} KB`,
)
