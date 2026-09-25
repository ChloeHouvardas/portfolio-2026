import { fractal, type Field2D } from './noise'

/**
 * The "river of stars" centerline: an S-curve in normalized viewport space
 * (x, y in 0..1 with a little overshoot so the stream enters and exits
 * off-screen). Entering top-left as a wide spray, narrowing as it sweeps
 * right and down, bending back left, and exiting the bottom as a broad
 * delta — matching the reference composition.
 */
interface Ctrl {
  x: number
  y: number
  w: number // half-width as a fraction of min(viewportW, viewportH)
}

const CTRL: Ctrl[] = [
  { x: -0.1, y: -0.2, w: 0.95 },
  { x: 0.13, y: 0.03, w: 0.75 },
  { x: 0.36, y: 0.24, w: 0.46 },
  { x: 0.56, y: 0.38, w: 0.26 },
  { x: 0.6, y: 0.5, w: 0.2 }, // S-bend center: the bright core lives here
  { x: 0.52, y: 0.62, w: 0.26 },
  { x: 0.42, y: 0.76, w: 0.4 },
  { x: 0.44, y: 0.92, w: 0.65 },
  { x: 0.52, y: 1.15, w: 1.0 },
]

export const CORE_U = 0.5 // curve parameter of the S-bend center

export interface RiverSample {
  x: number
  y: number
  /** unit normal (perpendicular to flow) */
  nx: number
  ny: number
  /** unit tangent (flow direction) */
  tx: number
  ty: number
  /** half-width in px */
  width: number
}

export class River {
  private readonly pts: RiverSample[]

  constructor(w: number, h: number, noise: Field2D, samples = 240) {
    const minDim = Math.min(w, h)
    const raw: { x: number; y: number; width: number }[] = []
    for (let i = 0; i < samples; i++) {
      const u = i / (samples - 1)
      const p = catmullRom(CTRL, u)
      // Organic wiggle so the band never reads as a clean drawn curve.
      const wig = fractal(noise, u * 5.2 + 3.7, 11.3, 3) * 0.035
      raw.push({
        x: (p.x + wig) * w,
        y: p.y * h,
        width: p.w * minDim * 0.5,
      })
    }
    this.pts = raw.map((p, i) => {
      const a = raw[Math.max(0, i - 1)]
      const b = raw[Math.min(raw.length - 1, i + 1)]
      const dx = b.x - a.x
      const dy = b.y - a.y
      const len = Math.hypot(dx, dy) || 1
      return {
        x: p.x,
        y: p.y,
        tx: dx / len,
        ty: dy / len,
        nx: -dy / len,
        ny: dx / len,
        width: p.width,
      }
    })
  }

  /** Sample the river at curve parameter u in [0, 1]. */
  at(u: number): RiverSample {
    const f = Math.min(Math.max(u, 0), 1) * (this.pts.length - 1)
    const i = Math.floor(f)
    const j = Math.min(i + 1, this.pts.length - 1)
    const t = f - i
    const a = this.pts[i]
    const b = this.pts[j]
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      tx: a.tx + (b.tx - a.tx) * t,
      ty: a.ty + (b.ty - a.ty) * t,
      nx: a.nx + (b.nx - a.nx) * t,
      ny: a.ny + (b.ny - a.ny) * t,
      width: a.width + (b.width - a.width) * t,
    }
  }
}

/** Centripetal-ish Catmull-Rom through the control points, u in [0, 1]. */
function catmullRom(ctrl: Ctrl[], u: number): Ctrl {
  const n = ctrl.length - 1
  const f = u * n
  const i = Math.min(Math.floor(f), n - 1)
  const t = f - i
  const p0 = ctrl[Math.max(0, i - 1)]
  const p1 = ctrl[i]
  const p2 = ctrl[i + 1]
  const p3 = ctrl[Math.min(ctrl.length - 1, i + 2)]
  const t2 = t * t
  const t3 = t2 * t
  const blend = (a: number, b: number, c: number, d: number) =>
    0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3)
  return {
    x: blend(p0.x, p1.x, p2.x, p3.x),
    y: blend(p0.y, p1.y, p2.y, p3.y),
    w: blend(p0.w, p1.w, p2.w, p3.w),
  }
}
