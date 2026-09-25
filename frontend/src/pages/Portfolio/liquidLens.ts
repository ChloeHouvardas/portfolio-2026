/**
 * True liquid-glass refraction (technique from kube.io/blog/liquid-glass-css-svg):
 * a displacement map encodes per-pixel backdrop offsets (X in red, Y in green,
 * 128 = neutral) that an SVG feDisplacementMap applies via
 * `backdrop-filter: url(#...)`. Only Chromium supports SVG filters in
 * backdrop-filter, so callers gate on supportsBackdropLens() and everyone
 * else keeps the plain blur glass.
 */

/** Chromium (Chrome/Edge/Opera/Arc) is the only engine that applies SVG
 *  filters through backdrop-filter. */
export function supportsBackdropLens(): boolean {
  const data = (navigator as { userAgentData?: { brands?: { brand: string }[] } }).userAgentData
  if (data?.brands) return data.brands.some((b) => /Chromium/i.test(b.brand))
  return /Chrome\//.test(navigator.userAgent)
}

/**
 * Displacement map for a rounded "lens": neutral in the middle, with
 * refraction that ramps up smoothly toward the edges, pushing the backdrop
 * outward from the center the way light bends through curved glass.
 *
 * The map stretches to the filtered element (preserveAspectRatio="none"),
 * so edgeBand is a FRACTION of the element: ~0.3 suits pill-sized chrome,
 * ~0.12 keeps the distorted band narrow on large sheets.
 */
export function makeLensDisplacementMap(size = 256, edgeBand = 0.3): string {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const image = ctx.createImageData(size, size)
  const half = size / 2

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const dx = (px - half) / half // -1..1
      const dy = (py - half) / half
      // Distance to the nearest edge of the square lens, 0 at edge, 1 center.
      const edgeDist = Math.min(1 - Math.abs(dx), 1 - Math.abs(dy))
      // Smooth ramp confined to the edge band; quadratic for a glassy falloff.
      const t = Math.max(0, 1 - edgeDist / edgeBand)
      const strength = t * t
      // Displace along the direction from center, strongest at the rim.
      const len = Math.hypot(dx, dy) || 1
      const ox = (dx / len) * strength
      const oy = (dy / len) * strength

      const i = (py * size + px) * 4
      image.data[i] = 128 + ox * 127
      image.data[i + 1] = 128 + oy * 127
      image.data[i + 2] = 128
      image.data[i + 3] = 255
    }
  }

  ctx.putImageData(image, 0, 0)
  return canvas.toDataURL('image/png')
}
