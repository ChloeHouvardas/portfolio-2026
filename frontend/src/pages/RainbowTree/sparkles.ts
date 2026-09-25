import type { CoverFit } from './geometry'
import type { RefLight } from './reference-data'

const TINT_COUNT = 12
const WHITE_INDEX = TINT_COUNT
const SPRITE_SIZE = 64

function rgbToHue(r: number, g: number, b: number): { hue: number; sat: number } {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  const sat = max === 0 ? 0 : d / max
  let hue = 0
  if (d > 0) {
    if (max === r) hue = ((g - b) / d + 6) % 6
    else if (max === g) hue = (b - r) / d + 2
    else hue = (r - g) / d + 4
    hue /= 6
  }
  return { hue, sat }
}

function saturate(r: number, g: number, b: number): [number, number, number] {
  const { hue, sat } = rgbToHue(r, g, b)
  if (sat < 0.18) return [r, g, b] // near-white stays white-hot
  const s = Math.max(0.75, Math.min(1, sat * 2))
  const l = 0.58
  const c = (1 - Math.abs(2 * l - 1)) * s
  const hp = hue * 6
  const x = c * (1 - Math.abs((hp % 2) - 1))
  const m = l - c / 2
  const [rr, gg, bb] =
    hp < 1 ? [c, x, 0] : hp < 2 ? [x, c, 0] : hp < 3 ? [0, c, x] : hp < 4 ? [0, x, c] : hp < 5 ? [x, 0, c] : [c, 0, x]
  return [Math.round((rr + m) * 255), Math.round((gg + m) * 255), Math.round((bb + m) * 255)]
}

function makeSprite(rIn: number, gIn: number, bIn: number): HTMLCanvasElement {
  const [r, g, b] = saturate(rIn, gIn, bIn)
  const c = document.createElement('canvas')
  c.width = SPRITE_SIZE
  c.height = SPRITE_SIZE
  const ctx = c.getContext('2d')!
  const half = SPRITE_SIZE / 2
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half * 0.95)
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
  grad.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, 0.9)`)
  grad.addColorStop(0.55, `rgba(${r}, ${g}, ${b}, 0.35)`)
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE)
  return c
}

/**
 * Twinkling glows placed exactly where the reference's lights are, tinted
 * with the reference's own colors (points are hue-bucketed; each bucket's
 * sprite uses the average color of its members).
 */
export class GlowSystem {
  private readonly pts: RefLight[]
  private readonly sprites: HTMLCanvasElement[]
  private readonly spriteOf: Int32Array
  private readonly phase: Float32Array
  private readonly freq: Float32Array
  private readonly glint: Uint8Array
  private readonly sx: Float32Array
  private readonly sy: Float32Array
  private readonly size: Float32Array
  private active: number

  constructor(points: RefLight[], rng: () => number) {
    this.pts = points
    const n = points.length
    this.active = n
    this.spriteOf = new Int32Array(n)
    this.phase = new Float32Array(n)
    this.freq = new Float32Array(n)
    this.glint = new Uint8Array(n)
    this.sx = new Float32Array(n)
    this.sy = new Float32Array(n)
    this.size = new Float32Array(n)

    // Bucket points by hue (low-saturation points go to a white bucket) and
    // average each bucket's actual color for its sprite.
    const sums = Array.from({ length: TINT_COUNT + 1 }, () => ({ r: 0, g: 0, b: 0, n: 0 }))
    for (let i = 0; i < n; i++) {
      const p = points[i]
      const { hue, sat } = rgbToHue(p.c[0], p.c[1], p.c[2])
      const bucket = sat < 0.18 ? WHITE_INDEX : Math.min(TINT_COUNT - 1, Math.floor(hue * TINT_COUNT))
      this.spriteOf[i] = bucket
      sums[bucket].r += p.c[0]
      sums[bucket].g += p.c[1]
      sums[bucket].b += p.c[2]
      sums[bucket].n++
      this.phase[i] = rng() * Math.PI * 2
      this.freq[i] = 0.3 + rng() * 1.2
      this.glint[i] = rng() < 0.05 ? 1 : 0
    }
    this.sprites = sums.map((s) =>
      s.n === 0
        ? makeSprite(240, 240, 245)
        : makeSprite(Math.round(s.r / s.n), Math.round(s.g / s.n), Math.round(s.b / s.n)),
    )
  }

  /** Map analysis-pixel coords to screen space for the current viewport. */
  layout(fit: CoverFit, w: number, h: number): void {
    for (let i = 0; i < this.pts.length; i++) {
      const p = this.pts[i]
      const x = p.x * fit.scale + fit.dx
      const y = p.y * fit.scale + fit.dy
      const glowR = (1.5 + 3.5 * p.b) * fit.scale * 3
      if (x < -glowR || x > w + glowR || y < -glowR || y > h + glowR) {
        this.size[i] = 0
        continue
      }
      this.sx[i] = x
      this.sy[i] = y
      this.size[i] = glowR * 2
    }
  }

  reduceTo(count: number): void {
    this.active = Math.max(100, Math.min(this.active, Math.floor(count)))
  }

  activeCount(): number {
    return this.active
  }

  draw(ctx: CanvasRenderingContext2D, t: number): void {
    const { sx, sy, size, phase, freq, glint, spriteOf, sprites, active } = this
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    for (let i = 0; i < active; i++) {
      const s = size[i]
      if (s === 0) continue
      const tw = 0.5 + 0.5 * Math.sin(t * freq[i] + phase[i])
      let alpha = 0.12 + 0.5 * tw * tw
      if (glint[i] === 1) {
        const spike = Math.max(0, Math.sin(t * 0.31 + phase[i] * 11))
        alpha = Math.min(1, alpha + 2.5 * spike ** 24)
      }
      ctx.globalAlpha = alpha
      ctx.drawImage(sprites[spriteOf[i]], sx[i] - s / 2, sy[i] - s / 2, s, s)
    }
    ctx.restore()
  }
}
