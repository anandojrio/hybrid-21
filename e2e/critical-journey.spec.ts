import { expect, test, type Page } from '@playwright/test'

/** Tuesday of plan week 2, 10:00 in Belgrade. */
const NOW = new Date('2026-09-29T10:00:00+02:00')

async function start(page: Page) {
  await page.clock.setFixedTime(NOW)
  // Chromium on a desktop may offer Web Share; force the plain download path for the test.
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'canShare', { value: undefined })
  })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible()
}

/** The day bottom sheet, once it has finished opening. */
function daySheet(page: Page, day: string) {
  return page.getByRole('dialog', { name: day })
}

const nav = (page: Page, name: string) =>
  page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name })

test('log a run, see it in History and Stats, complete ICE in one tap, export a backup', async ({
  page,
}) => {
  // 1–2. Open Today, then Plan.
  await start(page)
  await nav(page, 'Plan').click()
  await expect(page.getByRole('heading', { name: 'Plan' })).toBeVisible()

  // 3. Open the planned RUN of Tuesday, Sep 29.
  await page.getByRole('button', { name: /^Tuesday, September 29/ }).click()
  await daySheet(page, 'Tuesday, September 29')
    .getByRole('button', { name: /Easy 35 min/ })
    .click()
  await expect(page).toHaveURL(/\/session\/w02-tue-run$/)
  await expect(page.getByRole('heading', { name: 'Easy 35 min' })).toBeVisible()

  // 4–6. Mark as complete, enter the required Garmin overview and save.
  await page.getByRole('button', { name: 'Mark as complete' }).click()
  const form = page.getByRole('dialog', { name: 'Log Easy 35 min' })
  await form.getByRole('textbox', { name: /^Distance ,/ }).fill('5.20')
  await form.getByRole('textbox', { name: /^Time ,/ }).fill('003510')
  await form.getByRole('textbox', { name: /^Avg Pace ,/ }).fill('646')
  await form.getByRole('textbox', { name: /^Avg HR ,/ }).fill('141')
  await form.getByRole('textbox', { name: /^Max HR ,/ }).fill('160')
  await form.getByRole('button', { name: 'Save' }).click()
  await expect(form).toBeHidden()

  // 7. Status and History entry.
  await expect(page.getByText('Completed').first()).toBeVisible()
  await page.getByRole('button', { name: 'Back' }).click()
  await nav(page, 'History').click()
  await expect(page.getByRole('link', { name: /Easy 35 min.*5\.20 km/ })).toBeVisible()

  // 8. Stats update from the saved log.
  await nav(page, 'Stats').click()
  await expect(page.getByRole('group', { name: 'Weekly distance: 5.2 km' })).toBeVisible()

  // 9. ICE (Sunday of week 1, already past) completes with one tap and no form.
  await nav(page, 'Plan').click()
  await page.getByRole('button', { name: 'Previous week' }).click()
  await page.getByRole('button', { name: /^Sunday, September 27/ }).click()
  await daySheet(page, 'Sunday, September 27')
    .getByRole('button', { name: /Ice Hockey/ })
    .click()
  await expect(page).toHaveURL(/\/session\/w01-sun-ice$/)
  await page.getByRole('button', { name: 'Mark as complete' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByText('Completed').first()).toBeVisible()

  // 10. Export a JSON backup.
  await page.getByRole('button', { name: 'Back' }).click()
  await page.getByRole('link', { name: 'Settings' }).click()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: /Export backup \(JSON\)/ }).click()
  const file = await download
  expect(file.suggestedFilename()).toBe('hybrid21-backup-2026-09-29.json')
  await expect(page.getByText('Sep 29, 2026 · 10:00')).toBeVisible()
})

test('the app shell and plan work offline after the first visit', async ({ page, context }) => {
  await start(page)
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  // Reload once so the page is controlled by the service worker.
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible()

  await context.setOffline(true)
  await page.goto('/plan')
  await expect(page.getByRole('heading', { name: 'Plan' })).toBeVisible()
  await expect(page.getByRole('heading', { name: /run intensity/i })).toBeVisible()
  await expect(page.getByRole('status').filter({ hasText: 'Offline' })).toBeVisible()
  await nav(page, 'Library').click()
  await expect(page.getByRole('heading', { name: 'Library' })).toBeVisible()
})

for (const width of [375, 390, 430]) {
  test(`no horizontal overflow at ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.clock.setFixedTime(NOW)
    for (const path of [
      '/',
      '/plan',
      '/history',
      '/stats',
      '/library',
      '/settings',
      '/session/w02-thu-run',
      '/session/w03-mon-leg',
      '/library/back-squat',
    ]) {
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      )
      expect(overflow, path).toBeLessThanOrEqual(0)
    }
  })
}
