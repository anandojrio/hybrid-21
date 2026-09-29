import { cn } from 'cn'

interface DotMatrixChartProps {
  /** One column per value. */
  values: readonly number[]
  /** Column labels shown under selected columns. */
  labels?: readonly string[]
  rows?: number
  /** Index of the column drawn in the accent color, e.g. the current week. */
  highlightIndex?: number
  /** Full-sentence summary for screen readers. */
  summary: string
  filledColor?: string
  highlightColor?: string
  emptyColor?: string
  className?: string
}

/**
 * Dot-matrix column chart: each column fills from the bottom in proportion to its value,
 * like the reference in docs/design-references/screens-colors-kpi-nav.jpg.
 */
export function DotMatrixChart({
  values,
  labels,
  rows = 8,
  highlightIndex,
  summary,
  filledColor = 'var(--ink-inverse)',
  highlightColor = 'var(--mint)',
  emptyColor = 'rgb(255 255 255 / 0.18)',
  className,
}: DotMatrixChartProps) {
  const max = Math.max(...values, 0)
  const gap = 4
  const dot = 14
  const width = values.length * (dot + gap) - gap
  const height = rows * (dot + gap) - gap

  return (
    <figure className={cn('flex flex-col gap-2', className)}>
      <svg
        role="img"
        aria-label={summary}
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
      >
        {values.map((value, col) => {
          const filled = max > 0 ? Math.round((value / max) * rows) : 0
          return Array.from({ length: rows }, (_, row) => {
            const fromBottom = rows - row
            const isFilled = fromBottom <= filled && value > 0
            const color = isFilled
              ? col === highlightIndex
                ? highlightColor
                : filledColor
              : emptyColor
            return (
              <circle
                key={`${col}-${row}`}
                cx={col * (dot + gap) + dot / 2}
                cy={row * (dot + gap) + dot / 2}
                r={dot / 2}
                fill={color}
              />
            )
          })
        })}
      </svg>
      {labels ? (
        <figcaption
          className="tabular grid text-xs opacity-80"
          style={{ gridTemplateColumns: `repeat(${values.length}, minmax(0, 1fr))` }}
          aria-hidden
        >
          {labels.map((label, i) => (
            <span key={i} className="text-center">
              {label}
            </span>
          ))}
        </figcaption>
      ) : null}
    </figure>
  )
}
