import { useRef, type ReactNode } from 'react'
import { cn } from 'cn'
import { useElementWidth } from '@/hooks/use-element-width'

export interface LegendItem {
  label: string
  color: string
}

export interface DataTable {
  columns: string[]
  rows: (string | number)[][]
}

interface ChartFrameProps {
  title: string
  subtitle?: string
  /** One sentence describing what the chart shows, for screen readers. */
  summary: string
  /** Legend for two or more series; a single series is named by the title. */
  legend?: LegendItem[]
  table: DataTable
  empty?: string
  className?: string
  children: (width: number) => ReactNode
}

/**
 * Card for one chart: title, legend, measured plot area, a screen-reader summary and a
 * data table view. When there is no data it shows `empty` instead of an empty plot.
 */
export function ChartFrame({
  title,
  subtitle,
  summary,
  legend,
  table,
  empty,
  className,
  children,
}: ChartFrameProps) {
  const ref = useRef<HTMLDivElement>(null)
  const width = useElementWidth(ref)
  return (
    <figure
      className={cn('bg-surface flex flex-col gap-3 rounded-(--radius-group) p-4', className)}
    >
      <figcaption className="flex flex-col">
        <span className="text-ink text-base font-semibold">{title}</span>
        {subtitle ? <span className="text-ink-muted text-sm">{subtitle}</span> : null}
      </figcaption>
      {empty ? (
        <p className="bg-surface-2 text-ink-muted rounded-2xl px-3 py-6 text-center text-sm">
          {empty}
        </p>
      ) : (
        <>
          {legend && legend.length > 1 ? (
            <ul className="flex flex-wrap gap-x-4 gap-y-1" aria-hidden>
              {legend.map((item) => (
                <li key={item.label} className="text-ink-muted flex items-center gap-1.5 text-sm">
                  <span
                    className="inline-block h-0.5 w-4 rounded-full"
                    style={{ backgroundColor: item.color, height: 3 }}
                  />
                  {item.label}
                </li>
              ))}
            </ul>
          ) : null}
          <div ref={ref} aria-hidden className="w-full">
            {width > 0 ? children(width) : null}
          </div>
          <p className="sr-only">{summary}</p>
          <details className="text-ink-muted text-sm">
            <summary className="text-ink flex min-h-11 cursor-pointer items-center font-medium">
              Show data
            </summary>
            <table className="tabular w-full text-left">
              <thead>
                <tr>
                  {table.columns.map((c) => (
                    <th key={c} scope="col" className="text-ink py-1 pr-2 font-semibold">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, i) => (
                  <tr key={i} className="border-separator/70 border-t">
                    {row.map((cell, j) => (
                      <td key={j} className="py-1 pr-2">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </>
      )}
    </figure>
  )
}
