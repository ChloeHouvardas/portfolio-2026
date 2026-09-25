export interface CoverFit {
  scale: number
  dx: number
  dy: number
}

/** Center-crop cover fit: sourceCoord * scale + d maps into the viewport. */
export function coverFit(iw: number, ih: number, w: number, h: number): CoverFit {
  const scale = Math.max(w / iw, h / ih)
  return { scale, dx: (w - iw * scale) / 2, dy: (h - ih * scale) / 2 }
}
