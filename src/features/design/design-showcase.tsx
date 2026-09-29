import {
  BookOpen,
  CalendarDays,
  ChartNoAxesColumn,
  Flag,
  History,
  Medal,
  Route,
  Settings,
  Sun,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { BottomNav, type BottomNavItem } from '@/components/bottom-nav/bottom-nav'
import { DotMatrixChart } from '@/components/dot-matrix-chart'
import { KpiTile } from '@/components/kpi-tile'
import { ListGroup, ListRow } from '@/components/list-group'
import { SessionTypeBadge, SessionTypeIcon } from '@/components/session-type-badge'
import { StatusMarker } from '@/components/status-marker'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Slider } from '@/components/ui/slider'
import { Toaster } from '@/components/ui/sonner'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { WeekStrip, type WeekStripDay } from '@/components/week-strip'
import {
  PLAN_END,
  PLAN_START,
  PLANNED_SESSIONS,
  RACE_DATE,
  getPlanWeek,
  getSessionsForDate,
} from '@/data/training-plan'
import { getIntensityGuide } from '@/data/running-plan'
import { getTemplate } from '@/data/workout-templates'
import {
  estimateTemplateMinutes,
  formatMinutesRange,
  runDurationRange,
} from '@/domain/calculations'
import {
  SESSION_TYPES,
  SESSION_STATUSES,
  type PlannedSession,
  type SessionType,
} from '@/domain/types'
import {
  addDays,
  compareIsoDates,
  daysBetween,
  formatIsoDate,
  startOfIsoWeek,
  todayIso,
} from '@/lib/dates'
import { SESSION_TYPE_META } from '@/lib/session-types'

const NAV_ITEMS: BottomNavItem[] = [
  { key: 'today', label: 'Today', href: '/', icon: Sun },
  { key: 'plan', label: 'Plan', href: '/plan', icon: CalendarDays },
  { key: 'history', label: 'History', href: '/history', icon: History },
  { key: 'stats', label: 'Stats', href: '/stats', icon: ChartNoAxesColumn },
  { key: 'library', label: 'Library', href: '/library', icon: BookOpen },
]

const clampToPlan = (date: string) =>
  compareIsoDates(date, PLAN_START) < 0
    ? PLAN_START
    : compareIsoDates(date, PLAN_END) > 0
      ? PLAN_END
      : date

function sessionDuration(session: PlannedSession): string | null {
  if (session.run) {
    const range = runDurationRange(session.run)
    return range ? formatMinutesRange(range) : session.run.distanceKm ? '21.1 km' : null
  }
  if (session.templateId)
    return `≈ ${formatMinutesRange(estimateTemplateMinutes(getTemplate(session.templateId)))}`
  return null
}

function weekDays(weekStart: string): WeekStripDay[] {
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i)
    return {
      date,
      isRace: date === RACE_DATE,
      sessions: getSessionsForDate(date).map((s) => ({ type: s.type, status: 'planned' as const })),
    }
  })
}

function weekTitle(weekStart: string): string {
  const week = getPlanWeek(weekStart)
  const range = `${formatIsoDate(weekStart, 'MMM d')} – ${formatIsoDate(addDays(weekStart, 6), 'MMM d')}`
  return week ? `Week ${week.week} · ${range}` : range
}

/** Development-only preview of the design system at phone width. */
export default function DesignShowcase() {
  const today = todayIso()
  const [selectedDate, setSelectedDate] = useState(clampToPlan(today))
  const [weekStart, setWeekStart] = useState(startOfIsoWeek(clampToPlan(today)))
  const [direction, setDirection] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [nav, setNav] = useState('today')
  const [themeType, setThemeType] = useState<SessionType>('run')
  const [rpe, setRpe] = useState(3)

  const days = useMemo(() => weekDays(weekStart), [weekStart])
  const selectedSessions = getSessionsForDate(selectedDate)
  const firstWeek = startOfIsoWeek(PLAN_START)
  const lastWeek = startOfIsoWeek(PLAN_END)

  const moveWeek = (delta: number) => {
    const next = addDays(weekStart, delta * 7)
    if (compareIsoDates(next, firstWeek) < 0 || compareIsoDates(next, lastWeek) > 0) return
    setDirection(delta)
    setWeekStart(next)
  }

  const longRuns = PLANNED_SESSIONS.filter((s) => s.type === 'long')
  const longRunMinutes = longRuns.map((s) => runDurationRange(s.run!)?.max ?? 0)
  const currentWeek = getPlanWeek(clampToPlan(today))?.week ?? 1
  const thisWeekLong = longRuns.find((s) => s.week === currentWeek)
  const themedSession =
    PLANNED_SESSIONS.find((s) => s.type === themeType && compareIsoDates(s.date, today) >= 0) ??
    PLANNED_SESSIONS.find((s) => s.type === themeType)!

  return (
    <div className="mx-auto flex min-h-dvh max-w-(--app-max-width) flex-col">
      <Toaster />
      <main className="flex flex-col gap-8 px-4 pt-[max(16px,env(safe-area-inset-top))] pb-40">
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="text-ink-muted text-sm">Development preview · not in production</p>
            <h1 className="font-display text-3xl font-bold tracking-tight">Design system</h1>
          </div>
          <Button variant="ghost" size="icon" aria-label="Settings">
            <Settings />
          </Button>
        </header>

        <Section title="Palette">
          <div className="grid grid-cols-4 gap-2">
            {[
              ['Cool White', 'var(--cool-white)', 'var(--ink)'],
              ['Charcoal', 'var(--charcoal)', 'var(--ink-inverse)'],
              ['Mint', 'var(--mint)', 'var(--type-mob-fg)'],
              ['Ocean', 'var(--ocean)', '#fff'],
            ].map(([name, bg, fg]) => (
              <div
                key={name}
                className="ring-separator flex h-20 items-end rounded-2xl p-2 text-xs font-semibold ring-1"
                style={{ backgroundColor: bg, color: fg }}
              >
                {name}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Session types">
          <div className="flex flex-wrap gap-2">
            {SESSION_TYPES.map((type) => (
              <SessionTypeBadge key={type} type={type} />
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            {SESSION_TYPES.map((type) => (
              <SessionTypeIcon key={type} type={type} size={36} />
            ))}
          </div>
        </Section>

        <Section title="Status">
          <div className="flex flex-wrap gap-2">
            {SESSION_STATUSES.map((status) => (
              <StatusMarker key={status} status={status} />
            ))}
          </div>
        </Section>

        <Section title="Buttons">
          <Button className="w-full">Mark as complete</Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline">Skip workout</Button>
            <Button variant="inverse">View result</Button>
            <Button variant="mint">Edit result</Button>
            <Button variant="destructive">Delete</Button>
          </div>
        </Section>

        <Section title="Plan · week strip">
          <WeekStrip
            title={weekTitle(weekStart)}
            days={days}
            selectedDate={selectedDate}
            today={today}
            direction={direction}
            onSelectDate={(date) => {
              setSelectedDate(date)
              setDrawerOpen(true)
            }}
            onPrevWeek={compareIsoDates(weekStart, firstWeek) > 0 ? () => moveWeek(-1) : undefined}
            onNextWeek={compareIsoDates(weekStart, lastWeek) < 0 ? () => moveWeek(1) : undefined}
            onToday={() => {
              const target = startOfIsoWeek(clampToPlan(today))
              setDirection(compareIsoDates(target, weekStart))
              setWeekStart(target)
              setSelectedDate(clampToPlan(today))
            }}
          />
          <p className="text-ink-muted text-sm">
            Tap a day to open the bottom sheet. Swipe the strip to change week.
          </p>
        </Section>

        <Section title="Grouped list (option A)">
          <ListGroup title={formatIsoDate(selectedDate, 'EEEE, MMM d')}>
            {selectedSessions.length === 0 ? (
              <ListRow title="Rest day" subtitle="No planned sessions" />
            ) : (
              selectedSessions.map((session) => (
                <ListRow
                  key={session.id}
                  leading={<SessionTypeBadge type={session.type} size="sm" />}
                  title={session.title}
                  subtitle={sessionDuration(session) ?? session.goal}
                  onClick={() => setThemeType(session.type)}
                />
              ))
            )}
          </ListGroup>
        </Section>

        <Section title="KPI tiles">
          <div className="grid grid-cols-2 gap-3">
            <KpiTile
              label="Race in"
              value={daysBetween(today, RACE_DATE)}
              unit="days"
              tone="charcoal"
              icon={Flag}
            />
            <KpiTile
              label="Race distance"
              value={21.0975}
              decimals={1}
              unit="km"
              tone="ocean"
              icon={Medal}
            />
            <KpiTile
              label="Long run this week"
              value={thisWeekLong ? (runDurationRange(thisWeekLong.run!)?.max ?? null) : null}
              unit="min"
              tone="mint"
              icon={Route}
            />
            <KpiTile label="Runs completed this week" value={null} />
          </div>
          <p className="text-ink-muted text-sm">
            Values come from the plan. Logged results will appear after Phase 4; the last tile shows
            the empty state.
          </p>
        </Section>

        <Section title="Dot-matrix chart">
          <div className="bg-charcoal text-ink-inverse rounded-3xl p-4">
            <div className="mb-3 flex items-baseline justify-between">
              <span className="text-sm font-medium">Planned long run, minutes</span>
              <span className="font-display tabular text-2xl font-semibold">
                {longRunMinutes[currentWeek - 1] ?? 0}
                <span className="text-sm opacity-80"> min</span>
              </span>
            </div>
            <DotMatrixChart
              values={longRunMinutes}
              labels={longRunMinutes.map((_, i) => (i % 2 === 0 ? `W${i + 1}` : ''))}
              highlightIndex={currentWeek - 1}
              summary={`Planned long-run minutes by week: ${longRunMinutes
                .map((m, i) => `week ${i + 1} ${m}`)
                .join(', ')}.`}
            />
          </div>
        </Section>

        <Section title="Slider (RPE)">
          <div className="bg-surface flex flex-col gap-3 rounded-(--radius-group) p-4">
            <div className="flex items-baseline justify-between">
              <label htmlFor="rpe" className="text-base font-medium">
                Session RPE
              </label>
              <span className="font-display tabular text-3xl font-semibold">{rpe}</span>
            </div>
            <Slider
              id="rpe"
              min={1}
              max={10}
              step={1}
              value={[rpe]}
              onValueChange={([v]) => setRpe(v ?? rpe)}
              aria-label="Session RPE"
            />
            <div className="text-ink-muted flex justify-between text-xs">
              <span>1 · very easy</span>
              <span>10 · max</span>
            </div>
          </div>
        </Section>

        <Section title="Session screen in its type color">
          <ToggleGroup
            type="single"
            value={themeType}
            onValueChange={(v) => v && setThemeType(v as SessionType)}
            className="flex flex-wrap justify-start gap-1.5"
            aria-label="Session type"
          >
            {SESSION_TYPES.map((type) => (
              <ToggleGroupItem
                key={type}
                value={type}
                className="data-[state=on]:bg-charcoal data-[state=on]:text-ink-inverse h-11 rounded-full px-3 text-xs font-semibold"
              >
                {SESSION_TYPE_META[type].slug}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <ThemedSessionPreview session={themedSession} />
        </Section>

        <Section title="Toast">
          <Button
            variant="outline"
            onClick={() =>
              toast.success('Ice hockey marked complete', {
                action: { label: 'Undo', onClick: () => undefined },
              })
            }
          >
            Show confirmation toast
          </Button>
        </Section>
      </main>

      <div className="bg-page fixed inset-x-0 bottom-0 z-40 mx-auto max-w-(--app-max-width) px-4 pb-[max(12px,env(safe-area-inset-bottom))]">
        <BottomNav items={NAV_ITEMS} activeKey={nav} onSelect={(key) => setNav(key)} />
      </div>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="bg-page mx-auto max-w-(--app-max-width)">
          <DrawerHeader className="text-left">
            <DrawerTitle className="font-display text-2xl">
              {formatIsoDate(selectedDate, 'EEEE, MMMM d')}
            </DrawerTitle>
            <DrawerDescription>
              {selectedDate === RACE_DATE ? 'Race day' : weekTitle(startOfIsoWeek(selectedDate))}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-[max(24px,env(safe-area-inset-bottom))]">
            <ListGroup>
              {selectedSessions.length === 0 ? (
                <ListRow title="Rest day" subtitle="No planned sessions" />
              ) : (
                selectedSessions.map((session) => (
                  <ListRow
                    key={session.id}
                    leading={<SessionTypeBadge type={session.type} size="sm" />}
                    title={session.title}
                    subtitle={
                      session.choiceGroupId
                        ? 'Either/or: do one, never both'
                        : sessionDuration(session)
                    }
                    trailing={<StatusMarker status="planned" variant="dot" />}
                    onClick={() => {
                      setThemeType(session.type)
                      setDrawerOpen(false)
                    }}
                  />
                ))
              )}
            </ListGroup>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-ink-muted text-[13px] font-semibold tracking-wide uppercase">{title}</h2>
      {children}
    </section>
  )
}

function ThemedSessionPreview({ session }: { session: PlannedSession }) {
  const meta = SESSION_TYPE_META[session.type]
  const Icon = meta.icon
  const guide = session.run ? getIntensityGuide(session.run.primaryIntensity) : null
  const hr = session.run ? (session.run.hr ?? guide?.hr) : undefined
  const duration = sessionDuration(session)
  const [bigNumber, unit] = duration?.replace('≈ ', '').split(' ') ?? []

  return (
    <div
      className="ring-separator overflow-hidden rounded-[32px] ring-1"
      style={{ backgroundColor: meta.color, color: meta.foreground }}
    >
      <div className="flex flex-col gap-4 px-5 pt-5 pb-7">
        <div className="flex items-center justify-between text-sm font-medium">
          <span className="inline-flex items-center gap-1.5">
            <Icon aria-hidden className="size-4" strokeWidth={2.25} />
            {meta.slug}
          </span>
          <span className="tabular">
            {formatIsoDate(session.date, 'EEE, MMM d')} · Week {session.week}
          </span>
        </div>
        <h3 className="font-display text-3xl leading-tight font-bold tracking-tight">
          {session.title}
        </h3>
        <div className="flex gap-8">
          {bigNumber ? (
            <div>
              <div className="font-display tabular text-5xl leading-none font-semibold">
                {bigNumber}
              </div>
              <div className="mt-1 text-sm opacity-85">
                {unit ?? ''}
                {duration?.startsWith('≈') ? ' (est.)' : ''}
              </div>
            </div>
          ) : null}
          {hr ? (
            <div>
              <div className="font-display tabular text-5xl leading-none font-semibold">
                {hr.min}
                <span className="text-2xl">–{hr.max}</span>
              </div>
              <div className="mt-1 text-sm opacity-85">bpm</div>
            </div>
          ) : null}
        </div>
      </div>
      <div className="bg-page text-ink flex flex-col gap-4 rounded-t-[28px] px-4 pt-5 pb-5">
        <ListGroup>
          <ListRow title="Warm-up" subtitle="Before the main work" onClick={() => undefined} />
          <ListRow
            title={session.run ? 'Run tactics' : 'Workout'}
            subtitle={session.run?.prescription ?? session.goal}
            onClick={() => undefined}
          />
          <ListRow title="Coaching note" subtitle={session.coachingNote ?? '—'} />
        </ListGroup>
        <div className="flex flex-col gap-2">
          <Button className="w-full">Mark as complete</Button>
          <Button variant="ghost" className="w-full">
            Skip workout
          </Button>
        </div>
      </div>
    </div>
  )
}
