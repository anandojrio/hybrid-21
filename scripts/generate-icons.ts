/**
 * Renders the app icon set (HYBRID emblem on Charcoal) into public/icons.
 * Run with `npm run icons` after changing the design; the PNGs are committed.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

const CHARCOAL = '#272B3A'
const OUT = 'public/icons'

const submark = readFileSync('src/assets/logo-submark.svg', 'utf8')
const [vbX, vbY, vbW, vbH] = /viewBox="([^"]+)"/.exec(submark)![1]!.split(' ').map(Number) as [
  number,
  number,
  number,
  number,
]
const emblemPaths = submark.match(/<path[^>]*\/>/g)!.join('')

/**
 * The HYBRID emblem centered on Charcoal. `width` is the emblem's share of the icon width;
 * maskable icons use a smaller share to stay inside the 80 % safe zone.
 */
function iconSvg(width: number, rounded: boolean): string {
  const w = 512 * width
  const scale = w / vbW
  const h = vbH * scale
  const x = (512 - w) / 2
  const y = (512 - h) / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="${rounded ? 112 : 0}" fill="${CHARCOAL}"/>
  <g transform="translate(${x} ${y}) scale(${scale}) translate(${-vbX} ${-vbY})">${emblemPaths}</g>
</svg>`
}

const TARGETS = [
  { file: 'icon-192.png', size: 192, scale: 0.74, rounded: false },
  { file: 'icon-512.png', size: 512, scale: 0.74, rounded: false },
  { file: 'maskable-512.png', size: 512, scale: 0.6, rounded: false },
  { file: 'apple-touch-icon.png', size: 180, scale: 0.74, rounded: false },
  { file: 'favicon-32.png', size: 32, scale: 0.8, rounded: true },
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
  writeFileSync(`${OUT}/icon.svg`, iconSvg(0.8, true))
}

void main()
