import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EXERCISE_LIBRARY } from '@/data/exercise-library'
import { EXERCISES } from '@/data/exercises'
import { renderApp } from '@/test/render-app'
import { exerciseUsage, searchExercises } from './library-usage'

const NOW = new Date(2026, 8, 29, 9)

afterEach(() => {
  vi.useRealTimers()
})

describe('library content', () => {
  it('describes every exercise and drill in the plan', () => {
    for (const e of EXERCISES) {
      const content = EXERCISE_LIBRARY[e.id]
      expect(content, e.id).toBeDefined()
      expect(content!.purpose.length).toBeGreaterThan(10)
      expect(content!.setup.length).toBeGreaterThan(10)
      expect(content!.cues.length, e.id).toBeGreaterThanOrEqual(2)
      expect(content!.cues.length, e.id).toBeLessThanOrEqual(4)
      expect(content!.mistakes.length, e.id).toBeGreaterThanOrEqual(1)
    }
    expect(Object.keys(EXERCISE_LIBRARY).sort()).toEqual(EXERCISES.map((e) => e.id).sort())
  })

  it('lists where an exercise is used with prescription and rest', () => {
    const squat = exerciseUsage('back-squat')
    expect(squat).toContainEqual({
      workout: 'LEG · weeks 3–12',
      section: 'Workout',
      prescription: '3 × 4–6 at RIR 2–3',
      rest: '2.5–4 min',
    })
    expect(squat).toContainEqual(
      expect.objectContaining({ workout: 'LEG · week 1', prescription: '2 × 5 at RIR 3' }),
    )
    expect(exerciseUsage('cat-cow').map((u) => u.workout)).toEqual(['PULL', 'MOB · A and B'])
  })

  it('searches by name, muscle focus and alternatives', () => {
    expect(searchExercises('hamstring', 'all').map((e) => e.id)).toEqual(
      expect.arrayContaining(['romanian-deadlift', 'seated-leg-curl', 'supine-hamstring-stretch']),
    )
    expect(searchExercises('face pull', 'all').map((e) => e.id)).toEqual(['reverse-pec-deck'])
    expect(
      searchExercises('', 'arms').every((e) => e.category === 'biceps' || e.category === 'triceps'),
    ).toBe(true)
  })
})

describe('library screens', () => {
  it('filters the list and opens an exercise with its details and no image placeholder', async () => {
    renderApp('/library', NOW)
    await userEvent.type(await screen.findByLabelText('Search exercises'), 'bench')
    await userEvent.click(await screen.findByRole('button', { name: /Barbell bench press/ }))
    expect(await screen.findByRole('heading', { name: 'Barbell bench press' })).toBeInTheDocument()
    expect(screen.getByText('Technique cues')).toBeInTheDocument()
    expect(screen.getByText('PUSH · Workout')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('flags the controlled lateral rotation as needing technique confirmation', async () => {
    renderApp('/library/controlled-lateral-rotation', NOW)
    const note = await screen.findByRole('note')
    expect(within(note).getByText(/Technique needs final confirmation/)).toBeInTheDocument()
    expect(within(note).getByText(/avoid forced lumbar rotation/)).toBeInTheDocument()
  })
})
