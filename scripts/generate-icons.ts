/**
 * Renders the H21 icon set (Charcoal background, Mint monogram) into public/icons.
 * Run with `npm run icons` after changing the design; the PNGs are committed.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

const CHARCOAL = '#272B3A'
const MINT = '#5DF9C0'
const OUT = 'public/icons'

/** `scale` shrinks the monogram so maskable icons keep it inside the 80 % safe zone. */
function iconSvg(scale: number, rounded: boolean): string {
  const fontSize = 205 * scale
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="${rounded ? 112 : 0}" fill="${CHARCOAL}"/>
  <text x="256" y="256" dy="0.35em" text-anchor="middle" fill="${MINT}"
    font-family="Segoe UI, -apple-system, system-ui, sans-serif" font-weight="800"
    font-size="${fontSize}" letter-spacing="${-6 * scale}">H21</text>
</svg>`
}

const TARGETS = [
  { file: 'icon-192.png', size: 192, scale: 1, rounded: false },
  { file: 'icon-512.png', size: 512, scale: 1, rounded: false },
  { file: 'maskable-512.png', size: 512, scale: 0.78, rounded: false },
  { file: 'apple-touch-icon.png', size: 180, scale: 1, rounded: false },
  { file: 'favicon-32.png', size: 32, scale: 1.05, rounded: true },
]

async function main() {
  mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  const page = await browser.newPage()
  for (const t of TARGETS) {
    await page.setViewportSize({ width: t.size, height: t.size })
    await page.setContent(
      `<html><body style="margin:0;background:transparent">${iconSvg(t.scale, t.rounded).replace(
        'width="512" height="512"',
        `width="${t.size}" height="${t.size}"`,
      )}</body></html>`,
    )
    await page.screenshot({ path: `${OUT}/${t.file}`, omitBackground: true })
    console.log(`wrote ${OUT}/${t.file}`)
  }
  await browser.close()
  writeFileSync(`${OUT}/icon.svg`, iconSvg(1, true))
}

void main()
