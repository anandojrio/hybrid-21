import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
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
