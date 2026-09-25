// Self-contained randomness for the Star System scene. Deliberately
// independent of any other page: sfc32 PRNG plus a gradient-hash value
// noise, both fully deterministic per seed.

export type Field2D = (x: number, y: number) => number

/** sfc32 PRNG seeded from a single 32-bit integer via splitmix. */
export function makeRng(seed: number): () => number {
  let s = seed >>> 0
  const split = () => {
    s = (s + 0x9e3779b9) | 0
    let z = s
    z = Math.imul(z ^ (z >>> 16), 0x21f0aaad)
    z = Math.imul(z ^ (z >>> 15), 0x735a2d97)
    return (z ^ (z >>> 15)) >>> 0
  }
  let a = split()
  let b = split()
  let c = split()
  let d = split()
  return () => {
    const t = (((a + b) | 0) + d) | 0
    d = (d + 1) | 0
    a = b ^ (b >>> 9)
    b = (c + (c << 3)) | 0
    c = (c << 21) | (c >>> 11)
    c = (c + t) | 0
    return (t >>> 0) / 4294967296
  }
}

function latticeHash(ix: number, iy: number, seed: number): number {
  let h = (Math.imul(ix, 0x9e3779b1) + Math.imul(iy, 0x85ebca77) + seed) | 0
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d)
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b)
  h ^= h >>> 16
  return ((h >>> 0) / 4294967295) * 2 - 1
}

/** Smooth value noise over an integer lattice, output roughly in [-1, 1]. */
export function makeNoise2D(seed: number): Field2D {
  const s = seed | 0
  return (x, y) => {
    const x0 = Math.floor(x)
    const y0 = Math.floor(y)
    const fx = x - x0
    const fy = y - y0
    // quintic fade for smoother derivatives than smoothstep
    const ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10)
    const uy = fy * fy * fy * (fy * (fy * 6 - 15) + 10)
    const n00 = latticeHash(x0, y0, s)
    const n10 = latticeHash(x0 + 1, y0, s)
    const n01 = latticeHash(x0, y0 + 1, s)
    const n11 = latticeHash(x0 + 1, y0 + 1, s)
    const top = n00 + (n10 - n00) * ux
    const bot = n01 + (n11 - n01) * ux
    return top + (bot - top) * uy
  }
}

/** Fractal sum of the noise field, output roughly in [-1, 1]. */
export function fractal(field: Field2D, x: number, y: number, octaves = 3): number {
  let value = 0
  let amplitude = 1
  let frequency = 1
  let total = 0
  for (let o = 0; o < octaves; o++) {
    value += amplitude * field(x * frequency, y * frequency)
    total += amplitude
    amplitude *= 0.55
    frequency *= 2.1
  }
  return value / total
}
