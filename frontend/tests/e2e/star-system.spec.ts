import { test, expect } from '@playwright/test'

test('star system page renders the procedural scene and navigates without errors', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(String(err)))
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  await page.goto('/star-system')
  const canvas = page.getByRole('img', { name: /river of stars/i })
  await expect(canvas).toBeVisible()
  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.width).toBeGreaterThan(100)
  expect(box!.height).toBeGreaterThan(100)

  // Let the scene paint and the twinkle loop start, then confirm it moves.
  await page.waitForTimeout(1500)
  const shotA = await canvas.screenshot()
  await page.waitForTimeout(1500)
  const shotB = await canvas.screenshot()
  expect(shotA.equals(shotB)).toBe(false)

  // Pixel sanity, computed in-page from the live canvas: mostly near-black,
  // a small bright fraction, and clearly non-uniform brightness (the star
  // river is brighter than the darkest void). Thresholds are deliberately
  // loose — this guards composition, not exact rendering.
  const stats = await page.evaluate(() => {
    const cv = document.querySelector('canvas') as HTMLCanvasElement
    const ctx = cv.getContext('2d') as CanvasRenderingContext2D
    const { width: W, height: H } = cv
    const data = ctx.getImageData(0, 0, W, H).data
    const GRID = 4
    const cellSum = new Array(GRID * GRID).fill(0)
    const cellN = new Array(GRID * GRID).fill(0)
    let total = 0
    let nearBlack = 0
    let bright = 0
    const step = 3 // sample every 3rd pixel
    for (let y = 0; y < H; y += step) {
      for (let x = 0; x < W; x += step) {
        const o = (y * W + x) * 4
        const lum = 0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2]
        total++
        if (lum < 24) nearBlack++
        if (lum > 110) bright++
        const c = Math.min(GRID - 1, Math.floor((y / H) * GRID)) * GRID +
          Math.min(GRID - 1, Math.floor((x / W) * GRID))
        cellSum[c] += lum
        cellN[c]++
      }
    }
    const cells = cellSum.map((s, i) => s / Math.max(1, cellN[i]))
    return { total, nearBlack, bright, cells }
  })

  expect(stats.nearBlack / stats.total).toBeGreaterThan(0.3)
  const brightFrac = stats.bright / stats.total
  expect(brightFrac).toBeGreaterThan(0.002)
  expect(brightFrac).toBeLessThan(0.5)

  const maxCell = Math.max(...stats.cells)
  const minCell = Math.min(...stats.cells)
  expect(maxCell).toBeGreaterThan(minCell * 2 + 8)

  // The center (core of the star river) outshines the darkest corner void.
  const centerMean =
    (stats.cells[5] + stats.cells[6] + stats.cells[9] + stats.cells[10]) / 4
  const darkestCorner = Math.min(
    stats.cells[0],
    stats.cells[3],
    stats.cells[12],
    stats.cells[15],
  )
  expect(centerMean).toBeGreaterThan(darkestCorner + 10)

  await page.getByRole('link', { name: /home/i }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { name: 'Chloe Houvardas' })).toBeVisible()

  expect(errors).toEqual([])
})
