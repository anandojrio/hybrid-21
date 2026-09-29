import { getTemplate } from '../data/workout-templates'
import {
  aggregatePace,
  checkPace,
  estimateTemplateMinutes,
  formatDuration,
  formatExerciseResult,
  formatPace,
  parseDecimal,
  parseDuration,
  parsePace,
  totalVolumeLoad,
  volumeLoad,
} from './calculations'

describe('duration parsing', () => {
  it('parses hh:mm:ss and mm:ss', () => {
    expect(parseDuration('00:30:22')).toBe(1822)
    expect(parseDuration('1:05:00')).toBe(3900)
    expect(parseDuration('30:22')).toBe(1822)
  })

  it('rejects invalid values', () => {
    for (const bad of [
      '',
      '30',
      '00:60:00',
      '00:30:60',
      '0:3:22',
      'aa:bb:cc',
      '1:2:3:4',
      '-1:00:00',
    ]) {
      expect(parseDuration(bad), bad).toBeNull()
    }
  })

  it('formats as hh:mm:ss', () => {
    expect(formatDuration(1822)).toBe('00:30:22')
    expect(formatDuration(3900)).toBe('01:05:00')
  })
})

describe('pace', () => {
  it('parses and formats m:ss per km', () => {
    expect(parsePace('6:45')).toBe(405)
    expect(parsePace('6:5')).toBeNull()
    expect(parsePace('6:60')).toBeNull()
    expect(formatPace(405)).toBe('6:45')
    expect(formatPace(359.6)).toBe('6:00')
  })

  it('matches the Sep 22 run: 4.5 km in 30:22 is about 6:45/km', () => {
    const check = checkPace(405, 4.5, 1822)!
    expect(formatPace(check.computedSecPerKm)).toBe('6:45')
    expect(check.material).toBe(false)
  })

  it('flags a material mismatch without changing the entered value', () => {
    expect(checkPace(parsePace('6:15')!, 4.5, 1822)!.material).toBe(true)
    expect(checkPace(405, 0, 1822)).toBeNull()
  })

  it('aggregates pace from total time over total distance', () => {
    const runs = [
      { distanceKm: 10, durationSec: 3000 }, // 5:00/km
      { distanceKm: 2, durationSec: 840 }, // 7:00/km
    ]
    // The mean of the two paces would be 6:00; the correct aggregate is 3840 s / 12 km.
    expect(formatPace(aggregatePace(runs)!)).toBe('5:20')
    expect(aggregatePace([])).toBeNull()
  })

  it('accepts comma decimals from iOS keypads', () => {
    expect(parseDecimal('4,5')).toBe(4.5)
    expect(parseDecimal('4.50')).toBe(4.5)
    expect(parseDecimal('4..5')).toBeNull()
  })
})

describe('gym volume and display', () => {
  it('computes volume as total reps × load, not × sets again', () => {
    expect(
      volumeLoad({
        exerciseId: 'back-squat',
        kind: 'loaded',
        setsCompleted: 3,
        totalReps: 15,
        loadKg: 80,
      }),
    ).toBe(1200)
  })

  it('treats volume as invalid for non-standard kinds', () => {
    expect(
      volumeLoad({
        exerciseId: 'pull-up',
        kind: 'bodyweight-loadable',
        setsCompleted: 4,
        totalReps: 34,
      }),
    ).toBeNull()
    expect(
      volumeLoad({
        exerciseId: 'side-plank',
        kind: 'timed',
        setsCompleted: 2,
        totalHoldSeconds: 120,
      }),
    ).toBeNull()
    expect(
      totalVolumeLoad([
        { exerciseId: 'back-squat', kind: 'loaded', setsCompleted: 3, totalReps: 15, loadKg: 80 },
        { exerciseId: 'low-pogo-hops', kind: 'contacts', setsCompleted: 2, totalContacts: 20 },
      ]),
    ).toBe(1200)
  })

  it('shows pull-ups as bodyweight or with added load', () => {
    expect(
      formatExerciseResult({
        exerciseId: 'pull-up',
        kind: 'bodyweight-loadable',
        setsCompleted: 4,
        totalReps: 34,
      }),
    ).toBe('4 sets · 34 reps · bodyweight')
    expect(
      formatExerciseResult({
        exerciseId: 'pull-up',
        kind: 'bodyweight-loadable',
        setsCompleted: 4,
        totalReps: 28,
        addedLoadKg: 2.5,
      }),
    ).toBe('4 sets · 28 reps · bodyweight + 2.5 kg')
  })

  it('labels unilateral, timed and contact results explicitly', () => {
    expect(
      formatExerciseResult({
        exerciseId: 'reverse-lunge-or-bss',
        kind: 'unilateral',
        setsCompleted: 2,
        repsPerSide: 14,
        loadKg: 16,
      }),
    ).toBe('2 sets · 14 reps per side · 16 kg')
    expect(
      formatExerciseResult({
        exerciseId: 'side-plank',
        kind: 'timed',
        setsCompleted: 2,
        totalHoldSeconds: 130,
      }),
    ).toBe('2 sets · 130 s total hold')
    expect(
      formatExerciseResult({
        exerciseId: 'low-pogo-hops',
        kind: 'contacts',
        setsCompleted: 1,
        totalContacts: 10,
      }),
    ).toBe('1 set · 10 contacts')
  })

  it('estimates gym session length in 5-minute steps', () => {
    const est = estimateTemplateMinutes(getTemplate('push'))
    expect(est.min % 5).toBe(0)
    expect(est.max).toBeGreaterThan(est.min)
    expect(est.min).toBeGreaterThanOrEqual(45)
    expect(est.max).toBeLessThanOrEqual(120)
  })
})
