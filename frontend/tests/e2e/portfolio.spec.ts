import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

function collectErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(String(err)))
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  return errors
}

test('portfolio home renders the cloud scene and animates', async ({ page }) => {
  const errors = collectErrors(page)

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Chloe Houvardas' })).toBeVisible()
  await expect(page.getByText('Building playful, performant things')).toBeVisible()
  for (const label of ['About', 'Projects', 'Skills', 'Contact']) {
    await expect(page.getByRole('button', { name: label })).toBeVisible()
  }

  const canvas = page.locator('.portfolio-canvas')
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

  expect(errors).toEqual([])
})

test('flying to a section and back works', async ({ page }) => {
  const errors = collectErrors(page)

  await page.goto('/')
  await page.getByRole('button', { name: 'About' }).click()

  // The 5s expect timeout absorbs the ~2s flight.
  await expect(page.getByRole('heading', { name: 'About' })).toBeVisible()
  await expect(page.locator('strong', { hasText: 'Chloe Houvardas' })).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'About' })).toBeVisible()

  expect(errors).toEqual([])
})

test('projects section expands cards with embedded media', async ({ page }) => {
  const errors = collectErrors(page)

  await page.goto('/')
  await page.getByRole('button', { name: 'Projects' }).click()

  const rainbowToggle = page.getByRole('button', { name: /rainbow tree/i })
  await expect(rainbowToggle).toBeVisible()
  await expect(page.getByRole('button', { name: /star system/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /clouds/i })).toBeVisible()

  // Collapsed details are hidden until the card is expanded.
  const detail = page.getByText('seeded flow-field tree')
  await expect(rainbowToggle).toHaveAttribute('aria-expanded', 'false')
  await expect(detail).not.toBeVisible()

  await rainbowToggle.click()
  await expect(rainbowToggle).toHaveAttribute('aria-expanded', 'true')
  await expect(detail).toBeVisible()

  // The live scene embed mounts on expand and stays on this page.
  const live = page.locator('iframe[title="Rainbow Tree live preview"]')
  await expect(live).toBeVisible()
  await expect(page).toHaveURL(/\/$/)

  // Collapsing hides the details and unmounts the embed.
  await rainbowToggle.click()
  await expect(rainbowToggle).toHaveAttribute('aria-expanded', 'false')
  await expect(detail).not.toBeVisible()
  await expect(live).toHaveCount(0)

  expect(errors).toEqual([])
})
