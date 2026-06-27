import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test'
import { PNG } from 'pngjs'

const projects = [
  {
    title: 'Paper Cuts',
    counter: '1 / 2',
    labels: ['Gameplay loop', 'Devpost', 'We made it on stage!'],
  },
  {
    title: 'Prism',
    counter: '2 / 2',
    labels: ['Extension view', 'Instagram analysis', 'We finally submitted!'],
  },
]

const viewports = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]

async function openFeaturedProjects(page: Page) {
  await page.goto('/#featured-projects')
  await page.locator('#featured-projects').scrollIntoViewIfNeeded()
  await expect(page.getByTestId('project-card')).toHaveAttribute('data-image-decode-pending', 'false')
}

async function dragCarousel(page: Page, locator: Locator, direction: 'next' | 'previous') {
  const box = await locator.boundingBox()

  expect(box, 'carousel should have a measurable box before dragging').not.toBeNull()

  if (!box) {
    return
  }

  const startX = box.x + box.width * (direction === 'next' ? 0.78 : 0.22)
  const endX = box.x + box.width * (direction === 'next' ? 0.22 : 0.78)
  const y = box.y + Math.min(Math.max(box.height * 0.35, 40), box.height - 40)

  await locator.dispatchEvent('pointerdown', {
    bubbles: true,
    button: 0,
    cancelable: true,
    clientX: startX,
    clientY: y,
    pointerId: 1,
    pointerType: 'touch',
  })
  await locator.dispatchEvent('pointermove', {
    bubbles: true,
    button: 0,
    cancelable: true,
    clientX: (startX + endX) / 2,
    clientY: y,
    pointerId: 1,
    pointerType: 'touch',
  })
  await locator.dispatchEvent('pointerup', {
    bubbles: true,
    button: 0,
    cancelable: true,
    clientX: endX,
    clientY: y,
    pointerId: 1,
    pointerType: 'touch',
  })
}

async function triggerProjectNavigation(page: Page, direction: 'next' | 'previous', viewportName: string) {
  if (viewportName === 'mobile') {
    await dragCarousel(page, page.getByTestId('featured-projects-carousel'), direction)
    return
  }

  await page.getByRole('button', { name: direction === 'next' ? 'Next project' : 'Previous project' }).click()
}

async function waitForProject(page: Page, projectIndex: number) {
  const card = page.getByTestId('project-card')

  await expect(card).toHaveAttribute('data-carousel-transition', 'idle')
  await expect(card).toHaveAttribute('data-image-decode-pending', 'false')
  await expect(card).toHaveAttribute('data-project-index', String(projectIndex))
}

async function expectProject(page: Page, projectIndex: number) {
  const project = projects[projectIndex]

  await waitForProject(page, projectIndex)
  await expect(page.getByTestId('project-title')).toHaveText(project.title)
  await expect(page.getByTestId('project-counter')).toHaveText(project.counter)

  const labels = await page.getByTestId('project-polaroid').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-preview-label')),
  )

  expect(labels).toEqual(project.labels)
}

async function screenshotGallery(page: Page, gallery: Locator, testInfo: TestInfo, name: string) {
  const box = await gallery.boundingBox()

  expect(box, `${name} gallery region should have a measurable box`).not.toBeNull()

  const screenshot = await page.screenshot({
    animations: 'allow',
    clip: box ?? undefined,
    path: testInfo.outputPath(`${name}.png`),
  })
  expectGalleryFrameIsNotBlank(screenshot, name)

  return screenshot
}

async function pauseActiveAnimations(page: Page) {
  await page.evaluate(() => {
    document.getAnimations({ subtree: true }).forEach((animation) => {
      animation.pause()
    })
  })
}

async function resumeActiveAnimations(page: Page) {
  await page.evaluate(() => {
    document.getAnimations({ subtree: true }).forEach((animation) => {
      animation.play()
    })
  })
}

function readPng(buffer: Buffer) {
  return PNG.sync.read(buffer)
}

function expectGalleryFrameIsNotBlank(buffer: Buffer, label: string) {
  const png = readPng(buffer)
  const stepX = Math.max(1, Math.floor(png.width / 24))
  const stepY = Math.max(1, Math.floor(png.height / 18))
  let samples = 0
  let darkSamples = 0
  let brightSamples = 0
  let nonWhiteSamples = 0

  for (let y = 0; y < png.height; y += stepY) {
    for (let x = 0; x < png.width; x += stepX) {
      const pixelIndex = (png.width * y + x) * 4
      const red = png.data[pixelIndex]
      const green = png.data[pixelIndex + 1]
      const blue = png.data[pixelIndex + 2]
      const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue

      samples += 1

      if (luminance < 80) {
        darkSamples += 1
      }

      if (luminance > 170) {
        brightSamples += 1
      }

      if (!(red > 248 && green > 248 && blue > 248)) {
        nonWhiteSamples += 1
      }
    }
  }

  expect(darkSamples / samples, `${label} should retain dark gallery background pixels`).toBeGreaterThan(0.12)
  expect(brightSamples / samples, `${label} should retain bright polaroid pixels`).toBeGreaterThan(0.01)
  expect(nonWhiteSamples / samples, `${label} should not be a white flash frame`).toBeGreaterThan(0.35)
}

function sampledPixelDifferenceRatio(firstBuffer: Buffer, secondBuffer: Buffer) {
  const first = readPng(firstBuffer)
  const second = readPng(secondBuffer)

  expect(first.width).toBe(second.width)
  expect(first.height).toBe(second.height)

  const stepX = Math.max(1, Math.floor(first.width / 64))
  const stepY = Math.max(1, Math.floor(first.height / 48))
  let samples = 0
  let changedSamples = 0

  for (let y = 0; y < first.height; y += stepY) {
    for (let x = 0; x < first.width; x += stepX) {
      const pixelIndex = (first.width * y + x) * 4
      const redDifference = Math.abs(first.data[pixelIndex] - second.data[pixelIndex])
      const greenDifference = Math.abs(first.data[pixelIndex + 1] - second.data[pixelIndex + 1])
      const blueDifference = Math.abs(first.data[pixelIndex + 2] - second.data[pixelIndex + 2])

      samples += 1

      if (redDifference + greenDifference + blueDifference > 30) {
        changedSamples += 1
      }
    }
  }

  return changedSamples / samples
}

async function captureTransition(page: Page, testInfo: TestInfo, direction: 'next' | 'previous', viewportName: string, targetProjectIndex: number) {
  const card = page.getByTestId('project-card')
  const gallery = page.getByTestId('project-gallery-region')
  const before = await screenshotGallery(page, gallery, testInfo, `${viewportName}-${direction}-before`)

  const navigationPromise = triggerProjectNavigation(page, direction, viewportName)
  await expect(card).toHaveAttribute('data-carousel-transition', direction)
  await page.waitForFunction(
    () => {
      const incomingGallery = document.querySelector('[data-gallery-role="to"]')

      if (!incomingGallery) {
        return false
      }

      const translate = getComputedStyle(incomingGallery).translate
      const xTranslation = Number.parseFloat(translate)

      return Number.isFinite(xTranslation) && Math.abs(xTranslation) > 2 && Math.abs(xTranslation) < 98
    },
    undefined,
    { polling: 10, timeout: 3_000 },
  )
  await expect
    .poll(
      async () =>
        page.evaluate(() => ({
          title: document.querySelector('[data-testid="project-title"]')?.textContent,
          transition: document.querySelector('[data-testid="project-card"]')?.getAttribute('data-carousel-transition'),
        })),
      { timeout: 1_000 },
    )
    .toEqual({
      title: projects[targetProjectIndex].title,
      transition: direction,
    })
  await pauseActiveAnimations(page)
  const mid = await screenshotGallery(page, gallery, testInfo, `${viewportName}-${direction}-mid`)
  await resumeActiveAnimations(page)
  await navigationPromise

  await expectProject(page, targetProjectIndex)
  await expect(page.getByTestId('project-preview-modal')).toHaveCount(0)
  const after = await screenshotGallery(page, gallery, testInfo, `${viewportName}-${direction}-after`)

  expect(sampledPixelDifferenceRatio(before, mid), `${viewportName} ${direction} mid-frame differs from start`).toBeGreaterThan(0.03)
  expect(sampledPixelDifferenceRatio(mid, after), `${viewportName} ${direction} mid-frame differs from end`).toBeGreaterThan(0.03)
}

for (const viewport of viewports) {
  test(`featured projects carousel swipes cleanly on ${viewport.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await openFeaturedProjects(page)
    await expectProject(page, 0)

    await captureTransition(page, testInfo, 'next', viewport.name, 1)
    await captureTransition(page, testInfo, 'previous', viewport.name, 0)

    for (let index = 1; index < projects.length; index += 1) {
      await triggerProjectNavigation(page, 'next', viewport.name)
      await expectProject(page, index)
    }
  })
}

test('mobile swipe navigates the bird, about, and experience carousels', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const birdCarousel = page.getByTestId('bird-card-carousel')
  await expect(birdCarousel).toHaveAttribute('data-active-card-index', '0')
  await dragCarousel(page, birdCarousel, 'next')
  await expect(birdCarousel).toHaveAttribute('data-active-card-index', '1')
  await dragCarousel(page, birdCarousel, 'previous')
  await expect(birdCarousel).toHaveAttribute('data-active-card-index', '0')

  const aboutCarousel = page.getByLabel('About carousel')
  await aboutCarousel.scrollIntoViewIfNeeded()
  await expect(aboutCarousel).toHaveAttribute('data-about-index', '0')
  await dragCarousel(page, aboutCarousel, 'next')
  await expect(aboutCarousel).toHaveAttribute('data-about-index', '1')
  await dragCarousel(page, aboutCarousel, 'previous')
  await expect(aboutCarousel).toHaveAttribute('data-about-index', '0')

  const experienceCarousel = page.getByTestId('experience-carousel')
  await experienceCarousel.scrollIntoViewIfNeeded()
  await expect(experienceCarousel).toHaveAttribute('data-experience-index', '0')
  await dragCarousel(page, experienceCarousel, 'next')
  await expect(experienceCarousel).toHaveAttribute('data-experience-index', '1')
  await dragCarousel(page, experienceCarousel, 'previous')
  await expect(experienceCarousel).toHaveAttribute('data-experience-index', '0')
})

test('expanded project preview still opens after carousel navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await openFeaturedProjects(page)

  await page.getByRole('button', { name: 'Expand Gameplay loop' }).click()
  await expect(page.getByTestId('project-preview-modal')).toBeVisible()
  await page.getByRole('button', { name: 'Close expanded project image' }).click()
  await expect(page.getByTestId('project-preview-modal')).toBeHidden()

  await page.getByRole('button', { name: 'Next project' }).click()
  await expectProject(page, 1)

  await page.getByRole('button', { name: 'Expand Extension view' }).click()
  await expect(page.getByTestId('project-preview-modal')).toBeVisible()
  await page.getByRole('button', { name: 'Close expanded project image' }).click()
  await expect(page.getByTestId('project-preview-modal')).toBeHidden()
})

test('featured projects navigation respects reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1280, height: 900 })
  await openFeaturedProjects(page)
  await expectProject(page, 0)

  for (let index = 1; index < projects.length; index += 1) {
    await page.getByRole('button', { name: 'Next project' }).click()
    await expect(page.getByTestId('project-card')).toHaveAttribute('data-carousel-transition', 'idle')
    await expectProject(page, index)
  }
})
