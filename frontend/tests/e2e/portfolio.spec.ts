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
  await expect(page.getByText('Hey! Welcome to my little corner of the sky')).toBeVisible()
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

test('projects section lists Devpost projects and flags winners', async ({ page }) => {
  const errors = collectErrors(page)

  // Demo embeds point at Vimeo/YouTube; answer them with a blank page so the
  // third-party player's own network chatter stays out of this run.
  await page.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>stub</title>' }),
  )

  await page.goto('/')
  await page.getByRole('button', { name: 'Projects' }).click()

  // All eight Devpost projects plus Nucleus, Policy Royale and DataGuardians,
  // newest first.
  const toggles = page.locator('.portfolio-project-toggle')
  await expect(toggles).toHaveCount(11)

  // Winners first (newest first), then the rest (newest first).
  await expect(toggles.first()).toContainText('Paper Cuts')
  await expect(toggles.nth(7)).toContainText('Ensemble')
  await expect(toggles.last()).toContainText('Bias Buddy')
  const winners = page.locator('.portfolio-project--winner')
  await expect(winners).toHaveCount(7)
  for (let i = 0; i < 7; i++) {
    await expect(page.locator('.portfolio-project').nth(i)).toHaveClass(/portfolio-project--winner/)
  }

  // Winners wear the ribbon; the rest don't.
  const prismToggle = page.getByRole('button', { name: /prism/i })
  await expect(prismToggle.locator('.portfolio-project-winner')).toHaveText(/winner/i)
  const ensembleToggle = page.getByRole('button', { name: /ensemble/i })
  await expect(ensembleToggle.locator('.portfolio-project-winner')).toHaveCount(0)

  // Collapsed details are hidden until the card is expanded.
  const detail = page.getByText('eight kinds of misinformation')
  await expect(prismToggle).toHaveAttribute('aria-expanded', 'false')
  await expect(detail).not.toBeVisible()

  await prismToggle.click()
  await expect(prismToggle).toHaveAttribute('aria-expanded', 'true')
  await expect(detail).toBeVisible()
  await expect(page.getByText('HackHer 2026')).toBeVisible()
  await expect(page.locator('.portfolio-project-award', { hasText: 'First Place' }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: 'Devpost' }).first()).toHaveAttribute(
    'href',
    'https://devpost.com/software/prism-5j2tda',
  )

  // The demo embed mounts on expand and stays on this page.
  const demo = page.locator('iframe[title="Prism demo video"]')
  await expect(demo).toHaveCount(1)
  await expect(page).toHaveURL(/\/$/)

  // Collapsing hides the details and unmounts the embed.
  await prismToggle.click()
  await expect(prismToggle).toHaveAttribute('aria-expanded', 'false')
  await expect(detail).not.toBeVisible()
  await expect(demo).toHaveCount(0)

  expect(errors).toEqual([])
})
