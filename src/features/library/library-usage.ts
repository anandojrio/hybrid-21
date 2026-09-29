import { EXERCISES } from '@/data/exercises'
import { WORKOUT_TEMPLATES } from '@/data/workout-templates'
import type { ExerciseCategory, ExerciseDefinition, WorkoutTemplate } from '@/domain/types'

export interface ExerciseUsage {
  workout: string
  section: string
  prescription: string
  rest?: string
}

const TEMPLATE_LABEL: Record<string, string> = {
  'leg-intro': 'LEG · week 1',
  'leg-base': 'LEG · week 2',
  'leg-full': 'LEG · weeks 3–12',
  push: 'PUSH',
  pull: 'PULL',
  'mob-a': 'MOB · Core A',
  'mob-b': 'MOB · Core B',
}

/** Where an exercise appears in the plan, with its prescription, rest and RIR. */
export function exerciseUsage(exerciseId: string): ExerciseUsage[] {
  const usages: ExerciseUsage[] = []
  const seen = new Set<string>()
  const add = (u: ExerciseUsage) => {
    const key = `${u.workout}|${u.section}|${u.prescription}`
    if (!seen.has(key)) {
      seen.add(key)
      usages.push(u)
    }
  }
  for (const t of WORKOUT_TEMPLATES as readonly WorkoutTemplate[]) {
    const workout = TEMPLATE_LABEL[t.id] ?? t.title
    for (const w of t.warmUp) {
      if (w.exerciseId === exerciseId)
        add({ workout, section: t.warmUpTitle, prescription: w.dose })
    }
    for (const e of t.exercises) {
      if (e.exerciseId === exerciseId) {
        add({
          workout,
          section: t.kind === 'mobility' ? 'Core' : 'Workout',
          prescription: e.prescription,
          rest: e.rest,
        })
      }
    }
    for (const c of t.cooldown) {
      if (c.exerciseId === exerciseId) {
        add({ workout, section: t.cooldownTitle ?? 'Cooldown', prescription: c.dose })
      }
    }
  }
  // Mobility templates share their dynamic mobility and stretching blocks.
  const mob = usages.filter((u) => u.workout.startsWith('MOB') && u.section !== 'Core')
  if (mob.length === 2 && mob[0]!.prescription === mob[1]!.prescription) {
    usages.splice(usages.indexOf(mob[1]!), 1)
    mob[0]!.workout = 'MOB · A and B'
  }
  return usages
}

export const LIBRARY_FILTERS: { id: string; label: string; categories: ExerciseCategory[] }[] = [
  { id: 'all', label: 'All', categories: [] },
  { id: 'legs', label: 'Legs', categories: ['lower-body', 'plyometric'] },
  { id: 'push', label: 'Chest & shoulders', categories: ['chest', 'shoulders'] },
  { id: 'back', label: 'Back', categories: ['back'] },
  { id: 'arms', label: 'Arms', categories: ['biceps', 'triceps'] },
  { id: 'core', label: 'Core', categories: ['core'] },
  { id: 'mobility', label: 'Warm-up & mobility', categories: ['warm-up', 'mobility'] },
  { id: 'stretch', label: 'Stretching', categories: ['stretch'] },
]

export const CATEGORY_LABEL: Record<ExerciseCategory, string> = {
  'lower-body': 'Lower body',
  plyometric: 'Plyometric',
  chest: 'Chest',
  shoulders: 'Shoulders',
  back: 'Back',
  biceps: 'Biceps',
  triceps: 'Triceps',
  core: 'Core',
  'warm-up': 'Warm-up',
  mobility: 'Mobility',
  stretch: 'Stretching',
}

export function searchExercises(query: string, filterId: string): ExerciseDefinition[] {
  const filter = LIBRARY_FILTERS.find((f) => f.id === filterId) ?? LIBRARY_FILTERS[0]!
  const q = query.trim().toLowerCase()
  return (EXERCISES as readonly ExerciseDefinition[]).filter((e) => {
    if (filter.categories.length && !filter.categories.includes(e.category)) return false
    if (!q) return true
    return (
      e.name.toLowerCase().includes(q) ||
      e.muscleFocus.toLowerCase().includes(q) ||
      e.alternatives.some((a) => a.toLowerCase().includes(q))
    )
  })
}
