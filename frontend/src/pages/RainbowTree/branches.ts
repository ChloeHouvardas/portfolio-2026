import { fbm, makeValueNoise2D } from './noise'
import type { CoverFit } from './geometry'
import type { RefBranch } from './reference-data'

/**
 * Draws the branch silhouettes procedurally from the centerline polylines
 * extracted from the reference (position + per-point radius), then adds
 * procedural fine twigs at thin endpoints and iridescent rim streaks.
 * The ctx is translated so (0,0) is the page origin; drawing may bleed into
 * the overscan margin.
 */
export function drawBranchLayer(
  ctx: CanvasRenderingContext2D,
  branches: RefBranch[],
  fit: CoverFit,
  rng: () => number,
): void {
  const wander = makeValueNoise2D(Math.floor(rng() * 0xffffff))
  const mapX = (x: number) => x * fit.scale + fit.dx
  const mapY = (y: number) => y * fit.scale + fit.dy

  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // --- Silhouette pass ---
  ctx.globalCompositeOperation = 'source-over'
  ctx.globalAlpha = 1
  ctx.strokeStyle = '#050507'
  for (const br of branches) {
    const n = br.r.length
    for (let i = 0; i + 1 < n; i++) {
      const x0 = mapX(br.p[i * 2])
      const y0 = mapY(br.p[i * 2 + 1])
      const x1 = mapX(br.p[(i + 1) * 2])
      const y1 = mapY(br.p[(i + 1) * 2 + 1])
      // avg diameter (2*r0 + 2*r1) / 2, widened 1.25x: the morphological open
      // in extraction shaves the mask, so raw radii under-read the reference
      ctx.lineWidth = Math.max(0.7, (br.r[i] + br.r[i + 1]) * fit.scale * 1.25)
      ctx.beginPath()
      ctx.moveTo(x0, y0)
      ctx.lineTo(x1, y1)
      ctx.stroke()
    }
  }

  // --- Procedural fine twigs continuing thin endpoints ---
  const growTwig = (x: number, y: number, heading: number, width: number, depth: number): void => {
    let steps = 0
    while (width > 0.5 && steps < 14) {
      const segLen = Math.max(4, width * 3)
      heading += fbm(wander, x / 90, y / 90, 2) * 0.5 + (rng() - 0.5) * 0.35
      const x1 = x + Math.cos(heading) * segLen
      const y1 = y + Math.sin(heading) * segLen
      ctx.lineWidth = width
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x1, y1)
      ctx.stroke()
      x = x1
      y = y1
      width *= 0.86
      steps++
      if (depth < 2 && width > 0.7 && rng() < 0.25) {
        growTwig(x, y, heading + (rng() < 0.5 ? -1 : 1) * (0.5 + 0.5 * rng()), width * 0.7, depth + 1)
      }
    }
  }
  ctx.strokeStyle = '#050507'
  for (const br of branches) {
    const n = br.r.length
    if (n < 2) continue
    for (const end of [0, 1]) {
      const i = end === 0 ? 0 : n - 1
      const j = end === 0 ? 1 : n - 2
      if (br.r[i] > 2.5) continue
      const x = mapX(br.p[i * 2])
      const y = mapY(br.p[i * 2 + 1])
      const heading = Math.atan2(br.p[i * 2 + 1] - br.p[j * 2 + 1], br.p[i * 2] - br.p[j * 2])
      growTwig(x, y, heading, br.r[i] * 2 * fit.scale * 0.8, 0)
    }
  }

  // --- Iridescent rim streaks along thicker limbs ---
  ctx.globalCompositeOperation = 'lighter'
  for (const br of branches) {
    const n = br.r.length
    for (let i = 0; i + 1 < n; i++) {
      const width = (br.r[i] + br.r[i + 1]) * fit.scale
      if (width < 3) continue
      const x0 = mapX(br.p[i * 2])
      const y0 = mapY(br.p[i * 2 + 1])
      const x1 = mapX(br.p[(i + 1) * 2])
      const y1 = mapY(br.p[(i + 1) * 2 + 1])
      const dx = x1 - x0
      const dy = y1 - y0
      const len = Math.hypot(dx, dy)
      if (len < 1) continue
      const nx = -dy / len
      const ny = dx / len
      const copies = width > 10 ? 2 : 1
      for (let c = 0; c < copies; c++) {
        if (rng() < 0.3) continue // streaky, not continuous
        const side = rng() < 0.5 ? 1 : -1
        const offset = side * (width / 2 - 0.9) * (0.7 + rng() * 0.3)
        ctx.strokeStyle = `hsl(${Math.floor(rng() * 360)}, 90%, 65%)`
        ctx.globalAlpha = 0.25 + rng() * 0.3
        ctx.lineWidth = 0.6 + rng() * 0.4
        ctx.beginPath()
        ctx.moveTo(x0 + nx * offset, y0 + ny * offset)
        ctx.lineTo(x1 + nx * offset, y1 + ny * offset)
        ctx.stroke()
      }
    }
  }
  ctx.restore()
}
