import { TriangleAlert } from 'lucide-react'
import { Navigate, useParams } from 'react-router'
import { ListGroup, ListRow } from '@/components/list-group'
import { ScreenHeader } from '@/components/screen-header'
import { EXERCISE_LIBRARY } from '@/data/exercise-library'
import { findExercise } from '@/data/exercises'
import { CATEGORY_LABEL, exerciseUsage } from './library-usage'

function TextList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2 px-4 py-3">
      {items.map((item) => (
        <li key={item} className="text-ink flex gap-2 text-base">
          <span aria-hidden className="bg-theme mt-2.5 size-1.5 shrink-0 rounded-full" />
          {item}
        </li>
      ))}
    </ul>
  )
}

/** Exercise entry: purpose, setup, cues, mistakes, where it is used, rest/RIR, alternatives. */
export default function ExerciseDetailScreen() {
  const { exerciseId } = useParams()
  const exercise = exerciseId ? findExercise(exerciseId) : undefined
  const content = exerciseId ? EXERCISE_LIBRARY[exerciseId] : undefined
  if (!exercise || !content) return <Navigate to="/library" replace />
  const usage = exerciseUsage(exercise.id)

  return (
    <>
      <ScreenHeader
        variant="pushed"
        title={exercise.name}
        subtitle={`${CATEGORY_LABEL[exercise.category]} · ${exercise.muscleFocus}`}
      />

      {exercise.needsTechniqueConfirmation || exercise.caution ? (
        <div
          role="note"
          className="flex gap-2 rounded-(--radius-group) bg-(--status-modified) px-4 py-3 text-(--status-modified-fg)"
        >
          <TriangleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
          <p className="text-[15px]">
            {exercise.needsTechniqueConfirmation ? 'Technique needs final confirmation. ' : ''}
            {exercise.caution}
          </p>
        </div>
      ) : null}

      <ListGroup title="Purpose">
        <p className="text-ink px-4 py-3 text-base">{content.purpose}</p>
      </ListGroup>
      <ListGroup title="Setup">
        <p className="text-ink px-4 py-3 text-base">{content.setup}</p>
      </ListGroup>
      <ListGroup title="Technique cues">
        <TextList items={content.cues} />
      </ListGroup>
      <ListGroup title="Common mistakes">
        <TextList items={content.mistakes} />
      </ListGroup>

      <ListGroup
        title="Where it is used"
        footer={usage.length ? undefined : 'Not part of a planned workout.'}
      >
        {usage.map((u) => (
          <ListRow
            key={`${u.workout}-${u.section}`}
            title={`${u.workout} · ${u.section}`}
            subtitle={[u.prescription, u.rest ? `rest ${u.rest}` : undefined]
              .filter(Boolean)
              .join(' · ')}
          />
        ))}
      </ListGroup>

      {exercise.alternatives.length ? (
        <ListGroup title="Alternatives">
          <TextList items={[...exercise.alternatives]} />
        </ListGroup>
      ) : null}
    </>
  )
}
