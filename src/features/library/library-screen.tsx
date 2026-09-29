import { Search } from 'lucide-react'
import { useId } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { cn } from 'cn'
import { ListRow } from '@/components/list-group'
import { ScreenHeader } from '@/components/screen-header'
import { CATEGORY_LABEL, LIBRARY_FILTERS, searchExercises } from './library-usage'

export default function LibraryScreen() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const filter = params.get('filter') ?? 'all'
  const searchId = useId()
  const results = searchExercises(query, filter)

  const update = (next: { q?: string; filter?: string }) => {
    const q = next.q ?? query
    const f = next.filter ?? filter
    setParams({ ...(q ? { q } : {}), ...(f !== 'all' ? { filter: f } : {}) }, { replace: true })
  }

  return (
    <>
      <ScreenHeader title="Library" subtitle={`${results.length} exercises and drills`} />

      <div className="relative">
        <label htmlFor={searchId} className="sr-only">
          Search exercises
        </label>
        <Search
          aria-hidden
          className="text-ink-muted pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2"
        />
        <input
          id={searchId}
          type="search"
          value={query}
          onChange={(e) => update({ q: e.target.value })}
          placeholder="Squat, hamstrings, face pull"
          autoComplete="off"
          className="border-separator bg-surface text-ink placeholder:text-ink-muted/70 h-12 w-full rounded-2xl border pr-3 pl-10 text-base"
        />
      </div>

      <div
        role="group"
        aria-label="Filter library"
        className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1"
      >
        {LIBRARY_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => update({ filter: f.id })}
            className={cn(
              'h-11 shrink-0 rounded-full px-4 text-[15px] font-medium',
              filter === f.id ? 'bg-charcoal text-ink-inverse' : 'bg-surface text-ink',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {results.length === 0 ? (
        <div className="bg-surface rounded-(--radius-group) px-4 py-8 text-center">
          <p className="text-ink text-base font-semibold">No matches</p>
          <p className="text-ink-muted mt-1 text-sm">Try a shorter search or another filter.</p>
        </div>
      ) : (
        <div className="divide-separator/80 bg-surface divide-y overflow-hidden rounded-(--radius-group)">
          {results.map((e) => (
            <ListRow
              key={e.id}
              title={e.name}
              subtitle={`${CATEGORY_LABEL[e.category]} · ${e.muscleFocus}`}
              onClick={() => navigate(`/library/${e.id}`)}
            />
          ))}
        </div>
      )}
    </>
  )
}
