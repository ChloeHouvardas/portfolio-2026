import { referenceData } from './reference-data'
import { coverFit, type CoverFit } from './geometry'
import { renderCanopy } from './canopy'
import { drawBranchLayer } from './branches'
import { GlowSystem } from './sparkles'
import { fbm, makeValueNoise2D, mulberry32, type Noise2D } from './noise'

const DEFAULT_SEED = 20260101
const OVER = 8 // branch-layer overscan so sway never exposes gaps, css px
const SHIMMER_ALPHA = 0.16
const SHIMMER_PATCHES = 4
const KEN_BURNS_PERIOD = 40 // seconds for one 1.00 -> 1.03 -> 1.00 cycle

export interface SceneOptions {
  reducedMotion: boolean
  seed?: number
}

/**
 * Fully procedural scene guided by structural data extracted from the
 * reference photo (scripts/extract-reference.mjs): every pixel is drawn by
 * code — field-guided canopy texture, skeleton-driven branch silhouettes,
 * twinkling glows at the reference's light positions, roaming shimmer,
 * sun-glint pulse, and a slow Ken Burns drift.
 */
export class Scene {
  private readonly canvas: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D
  private readonly seed: number
  private reducedMotion: boolean

  private canopy!: HTMLCanvasElement
  private branch!: HTMLCanvasElement
  private shimmerWork!: HTMLCanvasElement
  private shimmerMask!: HTMLCanvasElement
  private readonly glintSprite: HTMLCanvasElement
  private readonly glow: GlowSystem
  private readonly driftNoise: Noise2D
  private fit!: CoverFit
  private sunX = 0
  private sunY = 0

  private w = 0
  private h = 0
  private raf = 0
  private running = false
  private lastNow = 0
  private time = 0
  private frameSamples = 0
  private frameAccum = 0
  private adapted = false

  constructor(canvas: HTMLCanvasElement, opts: SceneOptions) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.seed = opts.seed ?? DEFAULT_SEED
    this.reducedMotion = opts.reducedMotion
    this.driftNoise = makeValueNoise2D(this.seed)
    this.glintSprite = makeGlintSprite()
    this.glow = new GlowSystem(referenceData.lights, mulberry32(this.seed))
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

    const data = referenceData
    this.fit = coverFit(data.aw, data.ah, cssW, cssH)
    const rng = mulberry32(this.seed)

    this.canopy = document.createElement('canvas')
    this.canopy.width = Math.round(cssW * dpr)
    this.canopy.height = Math.round(cssH * dpr)
    const cctx = this.canopy.getContext('2d')!
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    renderCanopy(cctx, cssW, cssH, this.fit, data, rng)

    this.branch = document.createElement('canvas')
    this.branch.width = Math.round((cssW + OVER * 2) * dpr)
    this.branch.height = Math.round((cssH + OVER * 2) * dpr)
    const bctx = this.branch.getContext('2d')!
    bctx.setTransform(dpr, 0, 0, dpr, OVER * dpr, OVER * dpr)
    drawBranchLayer(bctx, data.branches, this.fit, rng)

    // Half-resolution buffers for the shimmer pass (soft by nature).
    this.shimmerWork = document.createElement('canvas')
    this.shimmerWork.width = Math.max(1, Math.round(cssW / 2))
    this.shimmerWork.height = Math.max(1, Math.round(cssH / 2))
    this.shimmerMask = document.createElement('canvas')
    this.shimmerMask.width = this.shimmerWork.width
    this.shimmerMask.height = this.shimmerWork.height

    this.glow.layout(this.fit, cssW, cssH)
    this.sunX = data.sun.x * this.fit.scale + this.fit.dx
    this.sunY = data.sun.y * this.fit.scale + this.fit.dy

    this.frameSamples = 0
    this.frameAccum = 0

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

  private renderStill(): void {
    // A mid-phase time gives varied twinkle states in the static frame.
    this.composite(7.3, true)
  }

  private frame = (now: number): void => {
    if (!this.running) return
    const dt = Math.min((now - this.lastNow) / 1000, 0.05)
    this.lastNow = now
    this.time += dt

    this.composite(this.time, false)

    if (!this.adapted && this.frameSamples < 60) {
      this.frameAccum += dt
      this.frameSamples++
      if (this.frameSamples === 60 && this.frameAccum / 60 > 0.022) {
        this.glow.reduceTo(this.glow.activeCount() / 2)
        this.adapted = true
      }
    }

    this.raf = requestAnimationFrame(this.frame)
  }

  private composite(t: number, still: boolean): void {
    const { ctx, w, h } = this
    if (w === 0) return

    ctx.save()
    // Ken Burns: whole scene breathes 1.00 -> 1.03 about the center.
    if (!still && !this.reducedMotion) {
      const s = 1 + 0.015 * (1 + Math.sin((t * Math.PI * 2) / KEN_BURNS_PERIOD))
      ctx.translate(w / 2, h / 2)
      ctx.scale(s, s)
      ctx.translate(-w / 2, -h / 2)
    }

    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    ctx.drawImage(this.canopy, 0, 0, w, h)

    this.drawShimmer(t)
    this.glow.draw(ctx, t)

    // Branch layer with a subtle whole-layer sway about a bottom anchor.
    ctx.save()
    if (!still && !this.reducedMotion) {
      const sway = Math.sin(t * 0.3)
      ctx.translate(w / 2, h)
      ctx.rotate(sway * 0.002)
      ctx.translate(-w / 2 + sway * 1.5, -h)
    }
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    ctx.drawImage(this.branch, -OVER, -OVER, w + OVER * 2, h + OVER * 2)
    ctx.restore()

    // Sun glint pulse at its real position in the reference.
    const pulse = 0.35 + 0.25 * Math.sin(t * 0.6)
    const size = Math.min(w, h) * 0.14
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = pulse
    ctx.drawImage(this.glintSprite, this.sunX - size / 2, this.sunY - size / 2, size, size)

    ctx.restore()
  }

  /** Roaming patches of the canopy's own bright texture, gently brightening. */
  private drawShimmer(t: number): void {
    const { w, h } = this
    const work = this.shimmerWork.getContext('2d')!
    const mask = this.shimmerMask.getContext('2d')!
    const hw = this.shimmerWork.width
    const hh = this.shimmerWork.height

    work.globalCompositeOperation = 'source-over'
    work.clearRect(0, 0, hw, hh)
    work.drawImage(this.canopy, 0, 0, hw, hh)

    mask.globalCompositeOperation = 'source-over'
    mask.clearRect(0, 0, hw, hh)
    mask.globalCompositeOperation = 'lighter'
    const radius = Math.min(hw, hh) * 0.38
    for (let i = 0; i < SHIMMER_PATCHES; i++) {
      const cx = hw * (0.5 + 0.42 * fbm(this.driftNoise, t / 28 + i * 11.7, i * 5.3, 2))
      const cy = hh * (0.5 + 0.42 * fbm(this.driftNoise, i * 3.1, t / 23 + i * 9.2, 2))
      const g = mask.createRadialGradient(cx, cy, 0, cx, cy, radius)
      g.addColorStop(0, 'rgba(255, 255, 255, 0.85)')
      g.addColorStop(1, 'rgba(255, 255, 255, 0)')
      mask.fillStyle = g
      mask.fillRect(cx - radius, cy - radius, radius * 2, radius * 2)
    }

    work.globalCompositeOperation = 'destination-in'
    work.drawImage(this.shimmerMask, 0, 0)

    this.ctx.globalCompositeOperation = 'lighter'
    this.ctx.globalAlpha = SHIMMER_ALPHA
    this.ctx.drawImage(this.shimmerWork, 0, 0, w, h)
    this.ctx.globalAlpha = 1
    this.ctx.globalCompositeOperation = 'source-over'
  }
}

function makeGlintSprite(): HTMLCanvasElement {
  const size = 256
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')!
  const half = size / 2
  const g = ctx.createRadialGradient(half, half, 0, half, half, half * 0.5)
  g.addColorStop(0, 'rgba(255, 255, 250, 1)')
  g.addColorStop(0.35, 'rgba(255, 244, 214, 0.4)')
  g.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  ctx.strokeStyle = 'rgba(255, 252, 235, 0.5)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(half, 8)
  ctx.lineTo(half, size - 8)
  ctx.moveTo(8, half)
  ctx.lineTo(size - 8, half)
  ctx.stroke()
  return c
}
