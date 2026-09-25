import { makeNoise2D, makeRng, fractal, type Field2D } from './noise'
import { River, CORE_U } from './river'
import {
  generateBrightStars,
  generateDimStars,
  makeStarSprites,
  SPECK_FILLS,
  WHITE_COUNT,
  type StarSet,
} from './stars'

const DEFAULT_SEED = 47210331

export interface SceneOptions {
  reducedMotion: boolean
  seed?: number
}

/**
 * Fully procedural "river of stars": a flow-field S-curve of filamentary
 * streamlines and star speckle on black, with a bright core and a tiny
 * silhouette at the S-bend. Everything is drawn by code, deterministic per
 * seed. Expensive layers (filaments, dim stars, core glow) are painted once
 * per resize; the animation loop only composites those buffers and stamps a
 * few hundred twinkling glow sprites, so the "living photo" stays cheap on
 * mobile. Frame times are sampled and quality degrades (fewer animated
 * stars, then no shimmer) if the device can't keep up.
 */
export class Scene {
  private readonly canvas: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D
  private readonly seed: number
  private reducedMotion: boolean

  private readonly noise: Field2D
  private readonly sprites: HTMLCanvasElement[]
  private readonly coreSprite: HTMLCanvasElement

  private base!: HTMLCanvasElement
  private filaments!: HTMLCanvasElement
  private shimmerWork!: HTMLCanvasElement
  private shimmerMask!: HTMLCanvasElement
  private bright!: StarSet
  private coreX = 0
  private coreY = 0
  private coreSize = 0
  private figureH = 0

  private w = 0
  private h = 0
  private raf = 0
  private running = false
  private lastNow = 0
  private time = 0

  private activeBright = 0
  private shimmerOn = true
  private frameAccum = 0
  private frameSamples = 0
  private adaptLevel = 0

  constructor(canvas: HTMLCanvasElement, opts: SceneOptions) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.seed = opts.seed ?? DEFAULT_SEED
    this.reducedMotion = opts.reducedMotion
    this.noise = makeNoise2D(this.seed)
    this.sprites = makeStarSprites()
    this.coreSprite = makeCoreSprite()
  }

  setReducedMotion(reduced: boolean): void {
    if (this.reducedMotion === reduced) return
    this.reducedMotion = reduced
    this.stop()
    this.start()
  }

  resize(): void {
    const cssW = this.canvas.clientWidth
    const cssH = this.canvas.clientHeight
    if (cssW === 0 || cssH === 0) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.w = cssW
    this.h = cssH
    this.canvas.width = Math.round(cssW * dpr)
    this.canvas.height = Math.round(cssH * dpr)
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // Same seed on every resize: the field regenerates deterministically.
    const rng = makeRng(this.seed)
    const river = new River(cssW, cssH, this.noise)

    const core = river.at(CORE_U)
    this.coreX = core.x
    this.coreY = core.y
    this.coreSize = core.width * 2.4
    this.figureH = Math.max(13, Math.min(cssW, cssH) * 0.034)

    this.filaments = makeLayer(cssW, cssH, dpr)
    drawFilaments(this.filaments.getContext('2d')!, river, this.noise, rng, cssW, cssH)

    this.base = makeLayer(cssW, cssH, dpr)
    const bctx = this.base.getContext('2d')!
    bctx.fillStyle = '#000'
    bctx.fillRect(0, 0, cssW, cssH)
    bctx.drawImage(this.filaments, 0, 0, cssW, cssH)
    drawDimStars(bctx, generateDimStars(river, rng, cssW, cssH), this.sprites)
    this.drawCoreGlow(bctx, river)

    this.bright = generateBrightStars(river, rng, cssW, cssH)
    this.activeBright =
      this.adaptLevel >= 1 ? Math.floor(this.bright.count / 2) : this.bright.count
    this.shimmerOn = this.adaptLevel < 2

    this.shimmerWork = document.createElement('canvas')
    this.shimmerWork.width = Math.max(1, Math.round(cssW / 2))
    this.shimmerWork.height = Math.max(1, Math.round(cssH / 2))
    this.shimmerMask = document.createElement('canvas')
    this.shimmerMask.width = this.shimmerWork.width
    this.shimmerMask.height = this.shimmerWork.height

    this.frameAccum = 0
    this.frameSamples = 0

    if (!this.running) this.renderStill()
  }

  start(): void {
    if (this.w === 0) return
    if (this.reducedMotion) {
      this.running = false
      this.renderStill()
      return
    }
    if (this.running) return
    this.running = true
    this.lastNow = performance.now()
    this.raf = requestAnimationFrame(this.frame)
  }

  stop(): void {
    this.running = false
    cancelAnimationFrame(this.raf)
  }

  destroy(): void {
    this.stop()
  }

  /** Static frame at a mid-phase time so twinkle states look varied. */
  private renderStill(): void {
    this.composite(5.8, true)
  }

  private frame = (now: number): void => {
    if (!this.running) return
    const dt = Math.min((now - this.lastNow) / 1000, 0.05)
    this.lastNow = now
    this.time += dt

    this.composite(this.time, false)

    // Adaptive quality: sample a second of frames, degrade if slow.
    if (this.adaptLevel < 2) {
      this.frameAccum += dt
      this.frameSamples++
      if (this.frameSamples === 60) {
        if (this.frameAccum / 60 > 0.022) {
          this.adaptLevel++
          if (this.adaptLevel === 1) this.activeBright = Math.floor(this.bright.count / 2)
          else this.shimmerOn = false
        }
        this.frameAccum = 0
        this.frameSamples = 0
      }
    }

    this.raf = requestAnimationFrame(this.frame)
  }

  private composite(t: number, still: boolean): void {
    const { ctx, w, h } = this
    if (w === 0) return

    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    ctx.drawImage(this.base, 0, 0, w, h)

    if (!still && this.shimmerOn) this.drawShimmer(t)
    this.drawBrightStars(t)
    this.drawCoreBreath(t)
    this.drawFigure()

    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
  }

  /** Static stacked glow that whites out the S-bend on the base layer. */
  private drawCoreGlow(ctx: CanvasRenderingContext2D, river: River): void {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    for (let k = 0; k < 13; k++) {
      const u = CORE_U - 0.13 + (k / 12) * 0.26
      const s = river.at(u)
      const fall = Math.exp(-(((u - CORE_U) / 0.07) ** 2))
      const size = s.width * (1.4 + 0.9 * fall)
      ctx.globalAlpha = 0.045 + 0.2 * fall
      ctx.drawImage(this.coreSprite, s.x - size / 2, s.y - size / 2, size, size)
    }
    ctx.restore()
  }

  /** Faint filament shimmer: two roaming soft patches of the filament layer. */
  private drawShimmer(t: number): void {
    const work = this.shimmerWork.getContext('2d')!
    const mask = this.shimmerMask.getContext('2d')!
    const hw = this.shimmerWork.width
    const hh = this.shimmerWork.height

    work.globalCompositeOperation = 'source-over'
    work.clearRect(0, 0, hw, hh)
    work.drawImage(this.filaments, 0, 0, hw, hh)

    mask.globalCompositeOperation = 'source-over'
    mask.clearRect(0, 0, hw, hh)
    mask.globalCompositeOperation = 'lighter'
    const radius = Math.min(hw, hh) * 0.42
    for (let i = 0; i < 2; i++) {
      const cx = hw * (0.5 + 0.4 * fractal(this.noise, t / 31 + i * 13.9, 4.1 + i * 7.7, 2))
      const cy = hh * (0.5 + 0.4 * fractal(this.noise, 8.3 + i * 5.1, t / 26 + i * 3.3, 2))
      const g = mask.createRadialGradient(cx, cy, 0, cx, cy, radius)
      g.addColorStop(0, 'rgba(255,255,255,0.9)')
      g.addColorStop(1, 'rgba(255,255,255,0)')
      mask.fillStyle = g
      mask.fillRect(cx - radius, cy - radius, radius * 2, radius * 2)
    }

    work.globalCompositeOperation = 'destination-in'
    work.drawImage(this.shimmerMask, 0, 0)

    this.ctx.globalCompositeOperation = 'lighter'
    this.ctx.globalAlpha = 0.12
    this.ctx.drawImage(this.shimmerWork, 0, 0, this.w, this.h)
  }

  private drawBrightStars(t: number): void {
    const { ctx, bright, sprites } = this
    ctx.globalCompositeOperation = 'lighter'
    for (let i = 0; i < this.activeBright; i++) {
      const s = bright.size[i]
      const tw = 0.5 + 0.5 * Math.sin(t * bright.freq[i] + bright.phase[i])
      ctx.globalAlpha = bright.baseAlpha[i] * (0.3 + 0.7 * tw * tw)
      const d = s * 2
      ctx.drawImage(sprites[bright.sprite[i]], bright.x[i] - s, bright.y[i] - s, d, d)
    }
  }

  /** Slow core breathing on top of the static glow. */
  private drawCoreBreath(t: number): void {
    const { ctx } = this
    const pulse = 0.06 + 0.04 * Math.sin(t * 0.45)
    const size = this.coreSize * (1 + 0.04 * Math.sin(t * 0.45 + 1.3))
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = pulse
    ctx.drawImage(this.coreSprite, this.coreX - size / 2, this.coreY - size / 2, size, size)
  }

  /** Tiny back-facing human silhouette standing in the brightest region. */
  private drawFigure(): void {
    const { ctx } = this
    const H = this.figureH
    const x = this.coreX
    const feetY = this.coreY + H * 0.55 // stands just below the glow center
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    ctx.fillStyle = '#000'

    // Head
    ctx.beginPath()
    ctx.arc(x, feetY - H * 0.86, H * 0.1, 0, Math.PI * 2)
    ctx.fill()

    // Torso and legs: a gently tapered body seen from behind.
    ctx.beginPath()
    ctx.moveTo(x - H * 0.16, feetY - H * 0.7) // left shoulder
    ctx.quadraticCurveTo(x, feetY - H * 0.82, x + H * 0.16, feetY - H * 0.7)
    ctx.quadraticCurveTo(x + H * 0.13, feetY - H * 0.38, x + H * 0.09, feetY) // right side
    ctx.lineTo(x + H * 0.03, feetY)
    ctx.lineTo(x + H * 0.015, feetY - H * 0.3) // inner right leg
    ctx.lineTo(x - H * 0.015, feetY - H * 0.3) // crotch notch hints two legs
    ctx.lineTo(x - H * 0.03, feetY)
    ctx.lineTo(x - H * 0.09, feetY)
    ctx.quadraticCurveTo(x - H * 0.13, feetY - H * 0.38, x - H * 0.16, feetY - H * 0.7)
    ctx.closePath()
    ctx.fill()
  }
}

function makeLayer(cssW: number, cssH: number, dpr: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = Math.round(cssW * dpr)
  c.height = Math.round(cssH * dpr)
  const ctx = c.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return c
}

function makeCoreSprite(): HTMLCanvasElement {
  const size = 256
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')!
  const m = size / 2
  const g = ctx.createRadialGradient(m, m, 0, m, m, m)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.25, 'rgba(250,250,255,0.75)')
  g.addColorStop(0.55, 'rgba(225,232,250,0.25)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return c
}

/**
 * Thousands of hair-thin blue-grey streamlines tracing the flow. Each
 * filament keeps its normalized lateral position in the stream, so strands
 * fan out where the river widens and bunch up where it narrows; noise adds
 * per-strand drift, and a few strays wander into the black.
 */
function drawFilaments(
  ctx: CanvasRenderingContext2D,
  river: River,
  noise: Field2D,
  rng: () => number,
  w: number,
  h: number,
): void {
  const count = Math.round(Math.min(3000, Math.max(1200, (w * h) / 480)))
  const DU = 0.007
  ctx.lineCap = 'round'
  for (let f = 0; f < count; f++) {
    const u0 = -0.02 + rng() * 1.0
    const lenU = 0.08 + rng() * 0.22
    // Normalized lateral position; gaussian-ish via sum of two uniforms.
    let lNorm = (rng() + rng() - 1) * 1.15
    if (rng() < 0.06) lNorm *= 2.4 // strays into the void
    const edge = Math.exp(-lNorm * lNorm * 1.1)
    const alpha = (0.03 + rng() * 0.07) * (0.35 + 0.65 * edge)
    const cr = 135 + Math.floor(rng() * 55)
    const cg = 155 + Math.floor(rng() * 50)
    const cb = 195 + Math.floor(rng() * 45)
    ctx.strokeStyle = `rgba(${cr},${cg},${cb},${alpha.toFixed(3)})`
    ctx.lineWidth = 0.5 + rng() * 0.45

    ctx.beginPath()
    let started = false
    for (let u = u0; u <= u0 + lenU; u += DU) {
      const s = river.at(u)
      const drift = fractal(noise, u * 6.5 + f * 0.371, f * 0.173, 2)
      const lat = lNorm * s.width + drift * s.width * 0.3
      const x = s.x + s.nx * lat
      const y = s.y + s.ny * lat
      if (!started) {
        ctx.moveTo(x, y)
        started = true
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()
  }
}

/** Stamp the dense dim speckle once onto the base layer. */
function drawDimStars(
  ctx: CanvasRenderingContext2D,
  set: StarSet,
  sprites: HTMLCanvasElement[],
): void {
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  for (let i = 0; i < set.count; i++) {
    const s = set.size[i]
    ctx.globalAlpha = set.baseAlpha[i]
    if (s < 0.9 && set.sprite[i] < WHITE_COUNT) {
      // Sub-pixel white stars: cheap rects read as sharp specks. Accents
      // always take the sprite path so their color survives at 1px scale.
      ctx.fillStyle = SPECK_FILLS[set.sprite[i]]
      ctx.fillRect(set.x[i], set.y[i], 1, 1)
    } else {
      const d = s * 3.2
      ctx.drawImage(sprites[set.sprite[i]], set.x[i] - d / 2, set.y[i] - d / 2, d, d)
    }
  }
  ctx.restore()
}
