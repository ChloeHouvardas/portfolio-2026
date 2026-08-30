import { expect, test } from '@playwright/test'

for (const viewport of [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'laptop', width: 1280, height: 800 },
]) {
  test(`shows only the construction message on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('under construction!')
    await expect(page.locator('body')).toHaveText('under construction!')
    await expect(page.locator('main')).toBeInViewport()
  })
}
