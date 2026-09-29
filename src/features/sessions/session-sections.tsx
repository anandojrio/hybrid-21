import type React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { cn } from 'cn'
import type { ContentSection } from './session-content'

/** Collapsible warm-up / main work / cooldown sections for compact cards. */
export function SessionSectionsAccordion({ sections }: { sections: ContentSection[] }) {
  if (sections.length === 0) return null
  return (
    <Accordion type="multiple" className="bg-surface-2/70 rounded-2xl px-3">
      {sections.map((section) => (
        <AccordionItem key={section.id} value={section.id} className="border-separator">
          <AccordionTrigger className="min-h-11 items-center text-[15px] font-semibold hover:no-underline">
            {section.title}
          </AccordionTrigger>
          <AccordionContent>
            <SectionItems section={section} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export function SectionItems({ section }: { section: ContentSection }) {
  return (
    <div className="flex flex-col gap-2 pb-1">
      <ul className="flex flex-col gap-1.5">
        {section.items.map((item) => (
          <li key={item.id} className="flex flex-col text-[15px] leading-snug">
            <span className="text-ink">{item.label}</span>
            {item.detail ? <span className="text-ink-muted text-sm">{item.detail}</span> : null}
          </li>
        ))}
      </ul>
      {section.note ? <p className="text-ink-muted text-sm italic">{section.note}</p> : null}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-theme-ink px-1 text-[13px] font-bold tracking-wide uppercase">
      {children}
    </h2>
  )
}

/** Numbered cards with prescription chips; each opens the exercise in the Library. */
function ExerciseCards({ section }: { section: ContentSection }) {
  return (
    <ol className="flex flex-col gap-2.5">
      {section.items.map((item, i) => {
        const body = (
          <>
            <span
              aria-hidden
              className="bg-theme text-theme-fg tabular flex size-10 shrink-0 items-center justify-center rounded-xl text-lg font-bold"
            >
              {i + 1}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="text-ink text-base leading-snug font-semibold">{item.label}</span>
              {item.chips?.length ? (
                <span className="flex flex-wrap gap-1.5">
                  {item.chips.map((chip, c) => (
                    <span
                      key={chip}
                      className={cn(
                        'tabular rounded-full px-2.5 py-0.5 text-[13px] font-medium',
                        c === 0 ? 'bg-theme-strong text-theme-strong-fg' : 'bg-surface-2 text-ink',
                      )}
                    >
                      {chip}
                    </span>
                  ))}
                </span>
              ) : item.detail ? (
                <span className="text-ink-muted text-sm">{item.detail}</span>
              ) : null}
            </span>
            {item.exerciseId ? (
              <ChevronRight aria-hidden className="text-ink-muted size-5 shrink-0" />
            ) : null}
          </>
        )
        const className = 'bg-surface flex items-center gap-3 rounded-2xl p-3'
        return (
          <li key={item.id}>
            {item.exerciseId ? (
              <Link
                to={`/library/${item.exerciseId}`}
                className={cn(className, 'active:bg-surface-2 transition-colors')}
              >
                {body}
              </Link>
            ) : (
              <div className={className}>{body}</div>
            )}
          </li>
        )
      })}
    </ol>
  )
}

/** Things done in order: a line with a dot per step. */
function Sequence({ section }: { section: ContentSection }) {
  return (
    <ol className="bg-surface flex flex-col rounded-2xl px-4 py-3">
      {section.items.map((item, i) => {
        const last = i === section.items.length - 1
        return (
          <li key={item.id} className="relative flex gap-3 pb-3 last:pb-0">
            {!last ? (
              <span aria-hidden className="bg-separator absolute top-4 bottom-0 left-[5px] w-0.5" />
            ) : null}
            <span
              aria-hidden
              className="border-theme bg-surface relative mt-1.5 size-3 shrink-0 rounded-full border-[3px]"
            />
            <span className="flex min-w-0 flex-col">
              {item.exerciseId ? (
                <Link
                  to={`/library/${item.exerciseId}`}
                  className="text-ink text-base underline-offset-4 active:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-ink text-base">{item.label}</span>
              )}
              {item.detail ? <span className="text-ink-muted text-sm">{item.detail}</span> : null}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

/** Key facts as label/value tiles in two columns. */
function Facts({ section }: { section: ContentSection }) {
  return (
    <dl className="grid grid-cols-2 gap-2">
      {section.items.map((item) => (
        <div
          key={item.id}
          className={cn(
            'bg-surface flex flex-col rounded-2xl px-3 py-2.5',
            (item.detail?.length ?? 0) > 18 && 'col-span-2',
          )}
        >
          <dt className="text-ink-muted text-[13px] font-medium">{item.label}</dt>
          <dd className="text-ink tabular text-[17px] font-semibold">{item.detail}</dd>
        </div>
      ))}
    </dl>
  )
}

function Notes({ section }: { section: ContentSection }) {
  return (
    <ul className="bg-surface flex flex-col gap-2.5 rounded-2xl px-4 py-3">
      {section.items.map((item) => (
        <li key={item.id} className="text-ink flex gap-2.5 text-[15px] leading-snug">
          <span aria-hidden className="bg-theme mt-[7px] size-1.5 shrink-0 rounded-full" />
          <span>
            {item.label}
            {item.detail ? <span className="text-ink-muted"> · {item.detail}</span> : null}
          </span>
        </li>
      ))}
    </ul>
  )
}

/** One section of the session detail screen, drawn by its layout. */
export function SectionBlock({ section }: { section: ContentSection }) {
  const Body = {
    exercises: ExerciseCards,
    sequence: Sequence,
    facts: Facts,
    notes: Notes,
  }[section.layout]
  return (
    <section className="flex flex-col gap-2">
      <SectionTitle>{section.title}</SectionTitle>
      <Body section={section} />
      {section.note ? <p className="text-ink-muted px-1 text-sm">{section.note}</p> : null}
    </section>
  )
}
