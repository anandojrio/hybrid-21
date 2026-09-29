import { ChevronRight } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'
import { cn } from 'cn'
import { useLogs } from '@/app/logs-store'
import { ScreenHeader } from '@/components/screen-header'
import { SessionTypeBadge } from '@/components/session-type-badge'
import { StatusMarker } from '@/components/status-marker'
import { getSession, PLAN_WEEKS } from '@/data/training-plan'
import type { PlannedSession, SessionLog } from '@/domain/types'
import { formatIsoDate } from '@/lib/dates'
import { keyResult } from '@/features/sessions/result-summary'
import {
  HISTORY_FILTERS,
  isHistoryFilter,
  matchesFilter,
  type HistoryFilter,
} from './history-filters'

interface Entry {
  log: SessionLog
  session: PlannedSession
}

export default function HistoryScreen() {
  const { logs, checkIns } = useLogs()
  const [params, setParams] = useSearchParams()
  const raw = params.get('filter')
  const filter: HistoryFilter = isHistoryFilter(raw) ? raw : 'all'

  const entries: Entry[] = logs
    .map((log) => ({ log, session: getSession(log.sessionId)! }))
    .filter((e) => e.session && matchesFilter(e.log, e.session, filter))
    .sort((a, b) =>
      a.log.date === b.log.date
        ? b.session.order - a.session.order
        : a.log.date < b.log.date
          ? 1
          : -1,
    )

  const weeks = PLAN_WEEKS.map((w) => ({
    ...w,
    entries: entries.filter((e) => e.session.week === w.week),
  }))
    .filter((w) => w.entries.length)
    .reverse()

  return (
    <>
      <ScreenHeader
        title="History"
        subtitle={`${logs.length} logged session${logs.length === 1 ? '' : 's'}`}
      />

      <div
        role="group"
        aria-label="Filter history"
        className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1"
      >
        {HISTORY_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => setParams(f.id === 'all' ? {} : { filter: f.id }, { replace: true })}
            className={cn(
              'h-11 shrink-0 rounded-full px-4 text-[15px] font-medium transition-colors',
              filter === f.id ? 'bg-charcoal text-ink-inverse' : 'bg-surface text-ink',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {weeks.length === 0 ? (
        <div className="bg-surface rounded-(--radius-group) px-4 py-8 text-center">
          <p className="text-ink text-base font-semibold">
            {logs.length === 0 ? 'Nothing logged yet' : 'Nothing matches this filter'}
          </p>
          <p className="text-ink-muted mt-1 text-sm">
            {logs.length === 0
              ? 'Completed, modified and skipped sessions appear here.'
              : 'Try another filter.'}
          </p>
        </div>
      ) : (
        weeks.map((w) => (
          <section key={w.week} aria-labelledby={`week-${w.week}`} className="flex flex-col gap-2">
            <h2
              id={`week-${w.week}`}
              className="text-ink-muted px-4 text-[13px] font-semibold tracking-wide uppercase"
            >
              Week {w.week} · {formatIsoDate(w.start, 'MMM d')} – {formatIsoDate(w.end, 'MMM d')}
            </h2>
            <ul className="divide-separator/80 bg-surface divide-y overflow-hidden rounded-(--radius-group)">
              {w.entries.map(({ log, session }) => {
                const rpe = log.kind === 'run' ? log.result.rpe : undefined
                const checkedIn =
                  log.kind === 'run' && checkIns.some((c) => c.sessionId === session.id)
                return (
                  <li key={log.id}>
                    <Link
                      to={`/session/${session.id}`}
                      className="active:bg-surface-2 flex min-h-16 items-center gap-3 px-4 py-3"
                    >
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="flex items-center gap-2">
                          <SessionTypeBadge type={session.type} size="sm" />
                          <span className="text-ink-muted tabular text-sm">
                            {formatIsoDate(log.date, 'EEE, MMM d')}
                          </span>
                        </span>
                        <span className="text-ink truncate text-base font-medium">
                          {session.title}
                        </span>
                        <span className="text-ink-muted tabular text-sm">
                          {keyResult(log)}
                          {rpe !== undefined ? ` · RPE ${rpe}` : ''}
                          {checkedIn ? ' · checked in' : ''}
                        </span>
                      </span>
                      <StatusMarker status={log.status} />
                      <ChevronRight aria-hidden className="text-ink-muted size-5 shrink-0" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        ))
      )}
    </>
  )
}
