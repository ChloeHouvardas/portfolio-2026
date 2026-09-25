import { test, expect } from '@playwright/test'

test('clouds page renders and navigates without errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(String(err)))
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  await page.goto('/clouds')
  const canvas = page.getByRole('img', { name: /clouds drifting/i })
  await expect(canvas).toBeVisible()
  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.width).toBeGreaterThan(100)
  expect(box!.height).toBeGreaterThan(100)

  // Let the texture load and animation start, then confirm it actually moves.
  await page.waitForTimeout(1500)
  const shotA = await canvas.screenshot()
  await page.waitForTimeout(1500)
  const shotB = await canvas.screenshot()
  expect(shotA.equals(shotB)).toBe(false)

  await page.getByRole('link', { name: /home/i }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { name: 'Chloe Houvardas' })).toBeVisible()

  expect(errors).toEqual([])
})
