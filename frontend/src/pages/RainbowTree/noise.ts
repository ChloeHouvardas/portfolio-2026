export type Noise2D = (x: number, y: number) => number

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hash2(ix: number, iy: number, seed: number): number {
  let h = (Math.imul(ix, 0x27d4eb2d) ^ Math.imul(iy, 0x165667b1) ^ seed) | 0
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b)
  h ^= h >>> 13
  return ((h >>> 0) / 4294967295) * 2 - 1
}

export function makeValueNoise2D(seed: number): Noise2D {
  const s = seed | 0
  return (x, y) => {
    const ix = Math.floor(x)
    const iy = Math.floor(y)
    const fx = x - ix
    const fy = y - iy
    const sx = fx * fx * (3 - 2 * fx)
    const sy = fy * fy * (3 - 2 * fy)
    const v00 = hash2(ix, iy, s)
    const v10 = hash2(ix + 1, iy, s)
    const v01 = hash2(ix, iy + 1, s)
    const v11 = hash2(ix + 1, iy + 1, s)
    const a = v00 + (v10 - v00) * sx
    const b = v01 + (v11 - v01) * sx
    return a + (b - a) * sy
  }
}

export function fbm(noise: Noise2D, x: number, y: number, octaves = 3): number {
  let sum = 0
  let amp = 0.5
  let freq = 1
  let norm = 0
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise(x * freq, y * freq)
    norm += amp
    amp *= 0.5
    freq *= 2
  }
  return sum / norm
}
