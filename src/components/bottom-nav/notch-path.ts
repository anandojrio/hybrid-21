export interface NotchBarGeometry {
  width: number
  height: number
  cornerRadius: number
  /** Horizontal center of the notch. */
  center: number
  /** Half-width of the notch bowl. */
  notchRadius: number
  /** Extra width on each side for the smooth shoulder into the flat edge. */
  shoulder: number
  depth: number
}

const r2 = (n: number) => Math.round(n * 100) / 100
const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)

/** Keeps the notch clear of the rounded corners; the active bubble uses the same center. */
export function clampNotchCenter(
  center: number,
  width: number,
  cornerRadius: number,
  notchRadius: number,
): number {
  return clamp(center, cornerRadius + notchRadius * 0.6, width - cornerRadius - notchRadius * 0.6)
}

/**
 * SVG path for a rounded bar with a smooth notch cut into its top edge.
 * The notch reveals whatever is behind the bar, as in the navigation reference.
 */
export function notchBarPath(g: NotchBarGeometry): string {
  const { width: w, height: h, cornerRadius: r, notchRadius: nr, shoulder: s, depth: d } = g
  if (w <= 0 || h <= 0) return ''
  const cx = clampNotchCenter(g.center, w, r, nr)
  const left = clamp(cx - nr - s, r, w - r)
  const right = clamp(cx + nr + s, r, w - r)

  return [
    `M ${r2(r)} 0`,
    `L ${r2(left)} 0`,
    `C ${r2(cx - nr)} 0 ${r2(cx - nr * 0.85)} ${r2(d)} ${r2(cx)} ${r2(d)}`,
    `C ${r2(cx + nr * 0.85)} ${r2(d)} ${r2(cx + nr)} 0 ${r2(right)} 0`,
    `L ${r2(w - r)} 0`,
    `A ${r} ${r} 0 0 1 ${r2(w)} ${r}`,
    `L ${r2(w)} ${r2(h - r)}`,
    `A ${r} ${r} 0 0 1 ${r2(w - r)} ${r2(h)}`,
    `L ${r} ${r2(h)}`,
    `A ${r} ${r} 0 0 1 0 ${r2(h - r)}`,
    `L 0 ${r}`,
    `A ${r} ${r} 0 0 1 ${r} 0`,
    'Z',
  ].join(' ')
}
