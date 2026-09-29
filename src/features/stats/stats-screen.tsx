import { Activity, Clock, Dumbbell, Flag, Route, Ruler, TriangleAlert, Zap } from 'lucide-react'
import { useState } from 'react'
import { useLogs } from '@/app/logs-store'
import { DotMatrixChart } from '@/components/dot-matrix-chart'
import { Segmented } from '@/components/form-controls'
import { KpiTile } from '@/components/kpi-tile'
import { ListGroup, ListRow } from '@/components/list-group'
import { ScreenHeader } from '@/components/screen-header'
import { getPlanWeek, PLAN_END, PLAN_START } from '@/data/training-plan'
import {
  formatExerciseResult,
  formatMinutes,
  formatMinutesRange,
  formatPace,
} from '@/domain/calculations'
import type { ExerciseResult, IsoDate } from '@/domain/types'
import { useToday } from '@/hooks/use-today'
import { compareIsoDates, formatIsoDate } from '@/lib/dates'
import { ChartFrame } from './chart-frame'
import { StackedBars, TrendChart } from './charts'
import {
  averageRpe,
  exerciseSeries,
  gymCompliance,
  KNEE_PAIN_LIMIT,
  kneePainPoints,
  longestRun,
  longRunProgression,
  plannedRunUnits,
  runCompliance,
  runEntries,
  strengthSummary,
  weeklyRunTotals,
  weeklyVolume,
} from './stats-calculations'

const S1 = 'var(--chart-series-1)'
const S2 = 'var(--chart-series-2)'
const ZONES = [1, 2, 3, 4, 5].map((z) => ({
  key: `z${z}`,
  name: `Zone ${z}`,
  color: `var(--chart-zone-${z})`,
}))
const MIN_POWER_POINTS = 3

const clampToPlan = (date: IsoDate) =>
  compareIsoDates(date, PLAN_START) < 0
    ? PLAN_START
    : compareIsoDates(date, PLAN_END) > 0
      ? PLAN_END
      : date
const day = (date: IsoDate) => formatIsoDate(date, 'MMM d')
const hoursMinutes = (sec: number) => formatMinutes(sec / 60)

export default function StatsScreen() {
  const [tab, setTab] = useState<'running' | 'strength'>('running')
  return (
    <>
      <ScreenHeader title="Stats" />
      <Segmented
        label="Show"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'running', label: 'Running' },
          { value: 'strength', label: 'Strength' },
        ]}
      />
      {tab === 'running' ? <RunningStats /> : <StrengthStats />}
    </>
  )
}

function RunningStats() {
  const today = useToday()
  const { logs, checkIns } = useLogs()
  const entries = runEntries(logs)
  const weeks = weeklyRunTotals(logs)
  const currentWeek = getPlanWeek(clampToPlan(today))?.week ?? 1
  const thisWeek = weeks[currentWeek - 1]!
  const compliance = runCompliance(logs, today)
  const longest = longestRun(entries)
  const rpe = averageRpe(entries)
  const knee = kneePainPoints(entries, checkIns).at(-1)
  const progression = longRunProgression(logs, today)
  const runsPlannedThisWeek = plannedRunUnits(currentWeek)
  const noRuns = entries.length === 0 ? 'Log a run to see this chart.' : undefined

  const perRun = entries.map((e) => ({
    label: day(e.log.date),
    pace: e.log.result.avgPaceSecPerKm,
    hr: e.log.result.avgHr,
    power: e.log.result.avgPowerW ?? null,
    rpe: e.log.result.rpe ?? null,
    kneeAfter: e.log.result.kneePainAfter ?? e.log.result.kneePainDuring ?? null,
  }))
  const powerPoints = perRun.filter((r) => r.power !== null)
  const feelPoints = perRun.filter((r) => r.rpe !== null || r.kneeAfter !== null)
  const zoneWeeks = weeks.filter((w) => w.hasZones)
  const longByWeek = weeks.map((w) => {
    const long = entries.find(
      (e) => e.session.week === w.week && (e.session.type === 'long' || e.session.type === 'race'),
    )
    return long ? Math.round(long.log.result.durationSec / 60) : 0
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <KpiTile
          label="Runs this week"
          value={thisWeek.runs}
          unit={`of ${runsPlannedThisWeek}`}
          tone="charcoal"
          icon={Activity}
        />
        <KpiTile
          label="Weekly distance"
          value={thisWeek.runs ? thisWeek.distanceKm : null}
          decimals={1}
          unit="km"
          tone="ocean"
          icon={Ruler}
          emptyText="No runs this week"
        />
        <KpiTile
          label="Weekly running time"
          value={thisWeek.runs ? hoursMinutes(thisWeek.durationSec) : null}
          icon={Clock}
          emptyText="No runs this week"
        />
        <KpiTile
          label="Longest run"
          value={longest ? longest.log.result.distanceKm : null}
          decimals={1}
          unit="km"
          icon={Route}
        />
        <KpiTile
          label="Plan compliance"
          value={compliance.due ? Math.round((compliance.done / compliance.due) * 100) : null}
          unit={compliance.due ? `% · ${compliance.done} of ${compliance.due}` : undefined}
          tone="mint"
          icon={Flag}
          emptyText="No runs due yet"
        />
        <KpiTile
          label="Average session RPE"
          value={rpe ? rpe.value : null}
          decimals={1}
          unit={rpe ? `/ 10 · ${rpe.count} runs` : undefined}
          emptyText="No RPE logged yet"
        />
      </div>

      <ListGroup title="Knee and long run">
        <ListRow
          leading={
            knee && knee.value > KNEE_PAIN_LIMIT ? (
              <TriangleAlert aria-hidden className="text-danger size-5" />
            ) : undefined
          }
          title="Latest knee pain"
          subtitle={
            knee
              ? `${day(knee.date)} · ${knee.label}${knee.value > KNEE_PAIN_LIMIT ? ' · above 2/10: reduce or stop, and seek assessment if it persists' : ''}`
              : 'No knee pain values logged yet'
          }
          trailing={knee ? `${knee.value} / 10` : '–'}
        />
        <ListRow
          title="Long-run progression"
          subtitle={
            progression.latest
              ? `Last: ${formatMinutes(progression.latest.durationSec / 60)} (${progression.latest.distanceKm.toFixed(1)} km) on ${day(progression.latest.date)}`
              : 'No long run logged yet'
          }
          trailing={
            progression.next
              ? `Next: ${progression.next.planned ? formatMinutesRange(progression.next.planned) : progression.next.title}`
              : undefined
          }
        />
      </ListGroup>

      <DotTile
        title="Weekly distance"
        unit="km"
        values={weeks.map((w) => Math.round(w.distanceKm * 10) / 10)}
        current={currentWeek}
        headline={thisWeek.distanceKm.toFixed(1)}
        empty={noRuns}
      />
      <DotTile
        title="Long-run duration"
        unit="min"
        values={longByWeek}
        current={currentWeek}
        headline={String(longByWeek[currentWeek - 1] ?? 0)}
        empty={
          entries.some((e) => e.session.type === 'long')
            ? undefined
            : 'Log a long run to see this chart.'
        }
      />

      <ChartFrame
        title="Avg Pace"
        subtitle="Per run, min/km · lower is faster"
        summary={`Average pace per run: ${perRun.map((r) => `${r.label} ${formatPace(r.pace)}`).join(', ')}.`}
        table={{
          columns: ['Run', 'Avg Pace'],
          rows: perRun.map((r) => [r.label, `${formatPace(r.pace)}/km`]),
        }}
        empty={noRuns}
      >
        {(width) => (
          <TrendChart
            width={width}
            data={perRun}
            xKey="label"
            series={[{ key: 'pace', name: 'Avg Pace', color: S1 }]}
            format={(v) => formatPace(v)}
          />
        )}
      </ChartFrame>

      <ChartFrame
        title="Avg HR"
        subtitle="Per run, bpm"
        summary={`Average heart rate per run: ${perRun.map((r) => `${r.label} ${r.hr} bpm`).join(', ')}.`}
        table={{ columns: ['Run', 'Avg HR'], rows: perRun.map((r) => [r.label, `${r.hr} bpm`]) }}
        empty={noRuns}
      >
        {(width) => (
          <TrendChart
            width={width}
            data={perRun}
            xKey="label"
            series={[{ key: 'hr', name: 'Avg HR', color: S1 }]}
            format={(v) => `${Math.round(v)}`}
          />
        )}
      </ChartFrame>

      {powerPoints.length >= MIN_POWER_POINTS ? (
        <ChartFrame
          title="Avg Power"
          subtitle="Per run, W"
          summary={`Average power per run: ${powerPoints.map((r) => `${r.label} ${r.power} W`).join(', ')}.`}
          table={{
            columns: ['Run', 'Avg Power'],
            rows: powerPoints.map((r) => [r.label, `${r.power} W`]),
          }}
        >
          {(width) => (
            <TrendChart
              width={width}
              data={powerPoints}
              xKey="label"
              series={[{ key: 'power', name: 'Avg Power', color: S1 }]}
              format={(v) => `${Math.round(v)}`}
            />
          )}
        </ChartFrame>
      ) : null}

      <ChartFrame
        title="Weekly time in HR zones"
        subtitle="Minutes per plan week"
        legend={ZONES.map((z) => ({ label: z.name, color: z.color }))}
        summary={`Minutes in heart-rate zones by week: ${zoneWeeks
          .map(
            (w) =>
              `week ${w.week}: ${w.zonesSec.map((s, i) => `zone ${i + 1} ${Math.round(s / 60)}`).join(', ')}`,
          )
          .join('; ')}.`}
        table={{
          columns: ['Week', 'Z1', 'Z2', 'Z3', 'Z4', 'Z5'],
          rows: zoneWeeks.map((w) => [`W${w.week}`, ...w.zonesSec.map((s) => Math.round(s / 60))]),
        }}
        empty={
          zoneWeeks.length ? undefined : 'Enter HR zone times when logging a run to see this chart.'
        }
      >
        {(width) => (
          <StackedBars
            width={width}
            xKey="label"
            data={zoneWeeks.map((w) => ({
              label: `W${w.week}`,
              ...Object.fromEntries(w.zonesSec.map((s, i) => [`z${i + 1}`, Math.round(s / 60)])),
            }))}
            series={ZONES}
            format={(v) => `${v} min`}
          />
        )}
      </ChartFrame>

      <ChartFrame
        title="RPE and knee pain"
        subtitle="Per run, 0–10 scale"
        legend={[
          { label: 'Session RPE', color: S1 },
          { label: 'Knee pain after run', color: S2 },
        ]}
        summary={`Session RPE and knee pain after each run: ${feelPoints
          .map(
            (r) => `${r.label} RPE ${r.rpe ?? 'not logged'}, knee ${r.kneeAfter ?? 'not logged'}`,
          )
          .join('; ')}.`}
        table={{
          columns: ['Run', 'RPE', 'Knee pain'],
          rows: feelPoints.map((r) => [r.label, r.rpe ?? '–', r.kneeAfter ?? '–']),
        }}
        empty={
          feelPoints.length ? undefined : 'Log RPE or knee pain with your runs to see this chart.'
        }
      >
        {(width) => (
          <TrendChart
            width={width}
            data={feelPoints}
            xKey="label"
            domain={[0, 10]}
            series={[
              { key: 'rpe', name: 'Session RPE', color: S1 },
              { key: 'kneeAfter', name: 'Knee pain', color: S2 },
            ]}
            format={(v) => `${v}`}
          />
        )}
      </ChartFrame>
    </div>
  )
}

function DotTile({
  title,
  unit,
  values,
  current,
  headline,
  empty,
}: {
  title: string
  unit: string
  values: number[]
  current: number
  headline: string
  empty?: string
}) {
  return (
    <figure className="bg-charcoal text-ink-inverse flex flex-col gap-3 rounded-3xl p-4">
      <figcaption className="flex items-baseline justify-between">
        <span className="text-sm font-medium">{title} by week</span>
        {empty ? null : (
          <span className="font-display text-2xl font-semibold">
            {headline}
            <span className="text-sm opacity-80"> {unit} this week</span>
          </span>
        )}
      </figcaption>
      {empty ? (
        <p className="py-4 text-center text-sm opacity-80">{empty}</p>
      ) : (
        <DotMatrixChart
          values={values}
          labels={values.map((_, i) => (i % 2 === 0 ? `W${i + 1}` : ''))}
          highlightIndex={current - 1}
          summary={`${title} by plan week: ${values.map((v, i) => `week ${i + 1} ${v} ${unit}`).join(', ')}.`}
        />
      )}
    </figure>
  )
}

function StrengthStats() {
  const today = useToday()
  const { logs } = useLogs()
  const compliance = gymCompliance(logs, today)
  const summaries = strengthSummary(logs)
  const currentWeek = getPlanWeek(clampToPlan(today))?.week ?? 1
  const volume = weeklyVolume(logs)[currentWeek - 1]?.volumeKg ?? 0

  const loadAndReps = (exerciseId: string) =>
    exerciseSeries(logs, exerciseId).map((p) => ({
      label: day(p.date),
      load: 'loadKg' in p.result ? p.result.loadKg : null,
      reps: 'totalReps' in p.result ? p.result.totalReps : null,
    }))
  const pullUps = loadAndReps('pull-up')
  const bench = loadAndReps('barbell-bench-press')
  const squat = loadAndReps('back-squat')

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <KpiTile
          label="Gym sessions completed"
          value={compliance.due ? compliance.done : null}
          unit={compliance.due ? `of ${compliance.due}` : undefined}
          tone="charcoal"
          icon={Dumbbell}
          emptyText="None due yet"
        />
        <KpiTile
          label="Volume load this week"
          value={volume > 0 ? Math.round(volume).toLocaleString('en-US') : null}
          unit={volume > 0 ? 'kg' : undefined}
          tone="ocean"
          icon={Zap}
          emptyText="No loaded sets yet"
        />
      </div>

      <SeriesChart
        title="Pull-ups"
        subtitle="Total reps per session"
        points={pullUps}
        valueKey="reps"
        format={(v) => `${v} reps`}
      />
      <SeriesChart
        title="Bench press · load"
        subtitle="kg"
        points={bench}
        valueKey="load"
        format={(v) => `${v} kg`}
      />
      <SeriesChart
        title="Bench press · total reps"
        subtitle="All working sets"
        points={bench}
        valueKey="reps"
        format={(v) => `${v} reps`}
      />
      <SeriesChart
        title="Back squat · load"
        subtitle="kg"
        points={squat}
        valueKey="load"
        format={(v) => `${v} kg`}
      />
      <SeriesChart
        title="Back squat · total reps"
        subtitle="All working sets"
        points={squat}
        valueKey="reps"
        format={(v) => `${v} reps`}
      />

      <ListGroup
        title="Latest result per exercise"
        footer="Change compares with the previous time the exercise was logged."
      >
        {summaries.length === 0 ? (
          <ListRow
            title="No gym results yet"
            subtitle="Log a LEG, PUSH or PULL session to see progress."
          />
        ) : (
          summaries.map((s) => (
            <ListRow
              key={s.exerciseId}
              title={s.name}
              subtitle={`${formatExerciseResult(s.latest.result as ExerciseResult)} · ${day(s.latest.date)}`}
              trailing={s.change ?? 'First log'}
            />
          ))
        )}
      </ListGroup>
    </div>
  )
}

function SeriesChart({
  title,
  subtitle,
  points,
  valueKey,
  format,
}: {
  title: string
  subtitle: string
  points: { label: string; load: number | null; reps: number | null }[]
  valueKey: 'load' | 'reps'
  format: (v: number) => string
}) {
  const data = points.filter((p) => p[valueKey] !== null)
  return (
    <ChartFrame
      title={title}
      subtitle={subtitle}
      summary={`${title}: ${data.map((p) => `${p.label} ${format(p[valueKey]!)}`).join(', ')}.`}
      table={{
        columns: ['Session', title],
        rows: data.map((p) => [p.label, format(p[valueKey]!)]),
      }}
      empty={data.length ? undefined : 'No results logged yet.'}
    >
      {(width) => (
        <TrendChart
          width={width}
          data={data}
          xKey="label"
          series={[{ key: valueKey, name: title, color: S1 }]}
          format={format}
        />
      )}
    </ChartFrame>
  )
}
