import { Bar, BarChart, CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'

export interface SeriesSpec {
  key: string
  name: string
  color: string
}

type Row = Record<string, string | number | null>

const axisTick = { fill: 'var(--ink-muted)', fontSize: 12 }
const HEIGHT = 180

interface TooltipCardProps {
  active?: boolean
  payload?: ReadonlyArray<{ value?: unknown; name?: unknown; color?: string; dataKey?: unknown }>
  label?: unknown
  format: (value: number) => string
}

function TooltipCard({ active, payload, label, format }: TooltipCardProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-charcoal text-ink-inverse rounded-xl px-3 py-2 text-sm shadow-lg">
      <p className="font-semibold">{String(label ?? '')}</p>
      {payload.map((p) =>
        typeof p.value === 'number' ? (
          <p key={String(p.dataKey)} className="tabular flex items-center gap-1.5">
            <span
              className="inline-block size-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            {String(p.name)}: {format(p.value)}
          </p>
        ) : null,
      )}
    </div>
  )
}

interface TrendChartProps {
  width: number
  data: Row[]
  xKey: string
  series: SeriesSpec[]
  format: (value: number) => string
  domain?: [number | 'auto', number | 'auto']
}

/** Line trend on one shared y-axis (never two scales). */
export function TrendChart({
  width,
  data,
  xKey,
  series,
  format,
  domain = ['auto', 'auto'],
}: TrendChartProps) {
  return (
    <LineChart
      width={width}
      height={HEIGHT}
      data={data}
      margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
    >
      <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
      <XAxis
        dataKey={xKey}
        tick={axisTick}
        tickLine={false}
        axisLine={false}
        interval="preserveStartEnd"
        minTickGap={16}
      />
      <YAxis
        tick={axisTick}
        tickLine={false}
        axisLine={false}
        width={44}
        domain={domain}
        tickFormatter={(v: number) => format(v)}
        allowDecimals={false}
      />
      <Tooltip
        cursor={{ stroke: 'var(--separator)' }}
        content={(props) => (
          <TooltipCard
            active={props.active}
            payload={props.payload}
            label={props.label}
            format={format}
          />
        )}
      />
      {series.map((s) => (
        <Line
          key={s.key}
          type="monotone"
          dataKey={s.key}
          name={s.name}
          stroke={s.color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          dot={{ r: 4, fill: s.color, stroke: 'var(--surface)', strokeWidth: 2 }}
          activeDot={{ r: 6, stroke: 'var(--surface)', strokeWidth: 2 }}
          connectNulls
          isAnimationActive={false}
        />
      ))}
    </LineChart>
  )
}

interface StackedBarsProps {
  width: number
  data: Row[]
  xKey: string
  series: SeriesSpec[]
  format: (value: number) => string
}

/** Stacked columns with a 2px surface gap between segments. */
export function StackedBars({ width, data, xKey, series, format }: StackedBarsProps) {
  return (
    <BarChart
      width={width}
      height={HEIGHT}
      data={data}
      margin={{ top: 8, right: 4, bottom: 0, left: 0 }}
    >
      <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
      <XAxis dataKey={xKey} tick={axisTick} tickLine={false} axisLine={false} />
      <YAxis tick={axisTick} tickLine={false} axisLine={false} width={36} allowDecimals={false} />
      <Tooltip
        cursor={{ fill: 'var(--surface-2)' }}
        content={(props) => (
          <TooltipCard
            active={props.active}
            payload={props.payload}
            label={props.label}
            format={format}
          />
        )}
      />
      {series.map((s, i) => (
        <Bar
          key={s.key}
          dataKey={s.key}
          name={s.name}
          stackId="stack"
          fill={s.color}
          stroke="var(--surface)"
          strokeWidth={2}
          maxBarSize={24}
          radius={i === series.length - 1 ? [4, 4, 0, 0] : 0}
          isAnimationActive={false}
        />
      ))}
    </BarChart>
  )
}
