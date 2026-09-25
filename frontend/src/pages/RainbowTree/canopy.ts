import { fbm, makeValueNoise2D } from './noise'
import type { CoverFit } from './geometry'
import type { ReferenceData } from './reference-data'

/** Saturation/lightness-boosted hsla() string from an rgb sample. */
function vividA(r: number, g: number, b: number, satMul: number, lightAdd: number, alpha: number): string {
  const [h, s, l] = rgbToHsl(r, g, b)
  const sat = Math.min(1, s * satMul + 0.05)
  const light = Math.min(0.85, Math.max(0.05, l + lightAdd))
  return `hsla(${h.toFixed(0)}, ${(sat * 100).toFixed(0)}%, ${(light * 100).toFixed(0)}%, ${alpha.toFixed(3)})`
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  if (d === 0) return [0, 0, l]
  const s = d / (1 - Math.abs(2 * l - 1))
  let h: number
  if (max === r) h = ((g - b) / d + 6) % 6
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  return [h * 60, Math.min(1, s), l]
}

/**
 * Fully procedural canopy texture guided by the coarse color field extracted
 * from the reference: an ambient color wash (sky holes emerge from bright
 * cells), tens of thousands of fine iridescent strands, dark leaf speckle,
 * and bright micro-speckle. Drawn once per resize.
 */
export function renderCanopy(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  fit: CoverFit,
  data: ReferenceData,
  rng: () => number,
): void {
  const { fieldW, fieldH, field, aw, ah } = data

  // Bilinear field sample at screen coords; returns [r, g, b, lum].
  const sample = (sx: number, sy: number): [number, number, number, number] => {
    const nx = (sx - fit.dx) / fit.scale / aw
    const ny = (sy - fit.dy) / fit.scale / ah
    const gx = Math.min(fieldW - 1.001, Math.max(0, nx * fieldW - 0.5))
    const gy = Math.min(fieldH - 1.001, Math.max(0, ny * fieldH - 0.5))
    const i = Math.floor(gx)
    const j = Math.floor(gy)
    const fx = gx - i
    const fy = gy - j
    let r = 0
    let g = 0
    let b = 0
    for (let oj = 0; oj <= 1; oj++) {
      for (let oi = 0; oi <= 1; oi++) {
        const wgt = (oi === 0 ? 1 - fx : fx) * (oj === 0 ? 1 - fy : fy)
        const k = ((j + oj) * fieldW + i + oi) * 3
        r += field[k] * wgt
        g += field[k + 1] * wgt
        b += field[k + 2] * wgt
      }
    }
    return [r, g, b, 0.2126 * r + 0.7152 * g + 0.0722 * b]
  }

  ctx.save()
  ctx.fillStyle = '#020204'
  ctx.fillRect(0, 0, w, h)

  // --- Ambient wash: soft radial gradients per field cell ('lighter') ---
  ctx.globalCompositeOperation = 'lighter'
  const cellW = (aw / fieldW) * fit.scale
  const cellH = (ah / fieldH) * fit.scale
  const cellR = Math.max(cellW, cellH) * 1.8
  for (let j = 0; j < fieldH; j++) {
    for (let i = 0; i < fieldW; i++) {
      const cx = ((i + 0.5) / fieldW) * aw * fit.scale + fit.dx
      const cy = ((j + 0.5) / fieldH) * ah * fit.scale + fit.dy
      if (cx < -cellR || cx > w + cellR || cy < -cellR || cy > h + cellR) continue
      const k = (j * fieldW + i) * 3
      const r = field[k]
      const g = field[k + 1]
      const b = field[k + 2]
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
      if (lum < 12) continue
      const a = Math.min(0.45, (lum / 255) * 0.5)
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cellR)
      grad.addColorStop(0, vividA(r, g, b, 1.5, 0, a))
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = grad
      ctx.fillRect(cx - cellR, cy - cellR, cellR * 2, cellR * 2)
    }
  }

  // --- Fine iridescent strands (the fibrous canopy texture) ---
  const area = w * h
  const dirNoise = makeValueNoise2D(Math.floor(rng() * 0xffffff))
  const strandTarget = Math.min(110000, Math.round(area * 0.085))
  ctx.lineWidth = 0.7
  ctx.lineCap = 'round'
  let attempts = strandTarget * 4
  let drawn = 0
  while (drawn < strandTarget && attempts-- > 0) {
    const sx = rng() * w
    const sy = rng() * h
    const [r, g, b, lum] = sample(sx, sy)
    if (rng() > (lum / 255) ** 0.6 + 0.08) continue
    const ang = fbm(dirNoise, sx / 70, sy / 70, 2) * Math.PI * 2.2
    const len = 3 + rng() * 4.5
    const bend = (rng() - 0.5) * len * 0.4
    const mx = sx + Math.cos(ang) * len * 0.5 - Math.sin(ang) * bend
    const my = sy + Math.sin(ang) * len * 0.5 + Math.cos(ang) * bend
    const ex = sx + Math.cos(ang) * len
    const ey = sy + Math.sin(ang) * len
    // The reference's fibers are neon-saturated: the field supplies only the
    // hue; saturation is forced high except inside the pale sky holes.
    const [h0, s0] = rgbToHsl(r, g, b)
    const hue = (h0 + (rng() < 0.35 ? (rng() < 0.5 ? -35 : 35) : 0) + 360) % 360
    let sat: number
    let light: number
    if (lum > 200) {
      sat = 0.25 + rng() * 0.3
      light = 0.72 + rng() * 0.16
    } else {
      sat = Math.max(0.8, Math.min(1, s0 * 2.5))
      light = 0.48 + rng() * 0.2
    }
    ctx.strokeStyle = `hsl(${hue.toFixed(0)}, ${(sat * 100).toFixed(0)}%, ${(light * 100).toFixed(0)}%)`
    ctx.globalAlpha = 0.16 + rng() * 0.22
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.quadraticCurveTo(mx, my, ex, ey)
    ctx.stroke()
    drawn++
  }

  // --- Dark leaf speckle (silhouetted foliage grain) ---
  ctx.globalCompositeOperation = 'source-over'
  const darkTarget = Math.round(area * 0.02)
  attempts = darkTarget * 4
  drawn = 0
  while (drawn < darkTarget && attempts-- > 0) {
    const sx = rng() * w
    const sy = rng() * h
    const lum = sample(sx, sy)[3]
    if (lum < 50 || lum > 225) continue
    ctx.fillStyle = `rgba(4, 7, 3, ${(0.25 + rng() * 0.3).toFixed(3)})`
    ctx.beginPath()
    ctx.arc(sx, sy, 0.6 + rng() * 1.4, 0, Math.PI * 2)
    ctx.fill()
    drawn++
  }

  // --- Bright micro-speckle ---
  ctx.globalCompositeOperation = 'lighter'
  const brightTarget = Math.round(area * 0.07)
  attempts = brightTarget * 4
  drawn = 0
  while (drawn < brightTarget && attempts-- > 0) {
    const sx = rng() * w
    const sy = rng() * h
    const [r, g, b, lum] = sample(sx, sy)
    if (rng() > (lum / 255) ** 1.2 + 0.02) continue
    if (rng() < 0.25) {
      ctx.fillStyle = `rgba(255, 250, 240, ${(0.4 + rng() * 0.4).toFixed(3)})`
    } else {
      // neon chromatic micro-dots: field hue, forced saturation
      const [h0] = rgbToHsl(r, g, b)
      const hue = (h0 + (rng() - 0.5) * 90 + 360) % 360
      ctx.fillStyle = `hsla(${hue.toFixed(0)}, 95%, ${(55 + rng() * 15).toFixed(0)}%, ${(0.45 + rng() * 0.45).toFixed(3)})`
    }
    ctx.beginPath()
    ctx.arc(sx, sy, 0.4 + rng() * 0.9, 0, Math.PI * 2)
    ctx.fill()
    drawn++
  }

  ctx.restore()
}
