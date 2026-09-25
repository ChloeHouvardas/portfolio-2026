import { CORE_U, type River } from './river'

// Palette: mostly white / blue-white, with scattered accents that are most
// common in the upper-left plume (matching the reference's colorful spray).
const WHITES: [number, number, number][] = [
  [255, 255, 255],
  [225, 235, 255],
  [200, 218, 255],
]
const ACCENTS: [number, number, number][] = [
  [255, 208, 120], // gold
  [120, 228, 255], // cyan
  [255, 140, 225], // magenta
  [140, 255, 175], // green
  [185, 150, 255], // violet
]
export const SPRITE_COLORS = [...WHITES, ...ACCENTS]
export const WHITE_COUNT = WHITES.length

/** CSS color per sprite index, for sub-pixel specks drawn as plain rects. */
export const SPECK_FILLS = SPRITE_COLORS.map(([r, g, b]) => `rgb(${r},${g},${b})`)

const SPRITE_PX = 48

export function makeStarSprites(): HTMLCanvasElement[] {
  return SPRITE_COLORS.map(([r, g, b], i) => {
    const c = document.createElement('canvas')
    c.width = SPRITE_PX
    c.height = SPRITE_PX
    const ctx = c.getContext('2d')!
    const m = SPRITE_PX / 2
    const grad = ctx.createRadialGradient(m, m, 0, m, m, m)
    // Accent sprites keep their hue in the hot center so the color reads.
    const core =
      i < WHITE_COUNT
        ? 'rgba(255,255,255,1)'
        : `rgba(${Math.min(255, r + 70)},${Math.min(255, g + 70)},${Math.min(255, b + 70)},1)`
    grad.addColorStop(0, core)
    grad.addColorStop(0.18, `rgba(${r},${g},${b},0.9)`)
    grad.addColorStop(0.45, `rgba(${r},${g},${b},0.28)`)
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, SPRITE_PX, SPRITE_PX)
    return c
  })
}

export interface StarSet {
  x: Float32Array
  y: Float32Array
  size: Float32Array
  sprite: Int16Array
  phase: Float32Array
  freq: Float32Array
  baseAlpha: Float32Array
  count: number
}

function allocStars(n: number): StarSet {
  return {
    x: new Float32Array(n),
    y: new Float32Array(n),
    size: new Float32Array(n),
    sprite: new Int16Array(n),
    phase: new Float32Array(n),
    freq: new Float32Array(n),
    baseAlpha: new Float32Array(n),
    count: n,
  }
}

function gaussian(rng: () => number): number {
  const a = Math.max(rng(), 1e-9)
  const b = rng()
  return Math.sqrt(-2 * Math.log(a)) * Math.cos(Math.PI * 2 * b)
}

/** Bias u toward the plume (low u) and the delta (high u) where the stream is dense. */
function sampleU(rng: () => number): number {
  const r = rng()
  if (r < 0.42) return rng() * 0.34 // upper-left plume
  if (r < 0.62) return 0.34 + rng() * 0.28 // mid-stream and core
  return 0.62 + rng() * 0.38 // lower delta
}

function pickSprite(u: number, rng: () => number): number {
  const accentChance = u < 0.32 ? 0.55 : u < 0.55 ? 0.12 : 0.2
  if (rng() < accentChance) return WHITES.length + Math.floor(rng() * ACCENTS.length)
  return Math.floor(rng() * WHITES.length)
}

function placeInRiver(
  set: StarSet,
  i: number,
  river: River,
  rng: () => number,
  spreadMul: number,
): number {
  const u = sampleU(rng)
  const s = river.at(u)
  const lateral = gaussian(rng) * s.width * 0.5 * spreadMul
  set.x[i] = s.x + s.nx * lateral
  set.y[i] = s.y + s.ny * lateral
  set.phase[i] = rng() * Math.PI * 2
  set.freq[i] = 0.4 + rng() * 1.4
  set.sprite[i] = pickSprite(u, rng)
  return u
}

/**
 * The dense speckle of the stream plus loose stars in the black voids.
 * Painted once onto the static layer.
 */
export function generateDimStars(
  river: River,
  rng: () => number,
  w: number,
  h: number,
): StarSet {
  const riverCount = Math.round(Math.min(16000, Math.max(4000, (w * h) / 140)))
  const voidCount = Math.round((w * h) / 6500)
  const set = allocStars(riverCount + voidCount)
  for (let i = 0; i < riverCount; i++) {
    const u = placeInRiver(set, i, river, rng, 1.05)
    const nearCore = Math.exp(-(((u - CORE_U) / 0.16) ** 2))
    set.size[i] = 0.5 + rng() * rng() * 1.6
    set.baseAlpha[i] = 0.25 + rng() * 0.55 + nearCore * 0.2
  }
  for (let i = riverCount; i < set.count; i++) {
    set.x[i] = rng() * w
    set.y[i] = rng() * h
    set.size[i] = 0.4 + rng() * 1.1
    set.sprite[i] = Math.floor(rng() * WHITES.length)
    set.baseAlpha[i] = 0.15 + rng() * 0.5
    set.phase[i] = rng() * Math.PI * 2
    set.freq[i] = 0.4 + rng() * 1.2
  }
  return set
}

/** The brighter glows that twinkle every frame. */
export function generateBrightStars(
  river: River,
  rng: () => number,
  w: number,
  h: number,
): StarSet {
  const count = Math.round(Math.min(520, Math.max(200, (w * h) / 2400)))
  const set = allocStars(count)
  const minDim = Math.min(w, h)
  for (let i = 0; i < count; i++) {
    const u = placeInRiver(set, i, river, rng, 0.9)
    const nearCore = Math.exp(-(((u - CORE_U) / 0.2) ** 2))
    set.size[i] = minDim * (0.004 + rng() * rng() * 0.012) + nearCore * minDim * 0.004
    set.baseAlpha[i] = 0.35 + rng() * 0.5
  }
  return set
}
