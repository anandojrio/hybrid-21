import { morningCheckInSchema, runFormSchema, toRunResult, type RunFormInput } from './schemas'

const blankOptional = {
  zone1: '',
  zone2: '',
  zone3: '',
  zone4: '',
  zone5: '',
  aerobicTe: '',
  anaerobicTe: '',
  avgPowerW: '',
  totalAscentM: '',
  avgCadenceSpm: '',
}

const sep22: RunFormInput = {
  ...blankOptional,
  distanceKm: '4.5',
  duration: '00:30:22',
  avgPace: '6:45',
  avgHr: '142',
  maxHr: '174',
  zone1: '00:00:28',
  zone2: '00:20:23',
  zone3: '00:09:09',
  zone4: '00:00:22',
  zone5: '00:00:00',
  avgPowerW: '296',
}

describe('running schema', () => {
  it('accepts the Sep 22 run and maps it to a RunResult', () => {
    const result = toRunResult(runFormSchema.parse(sep22))
    expect(result).toMatchObject({
      distanceKm: 4.5,
      durationSec: 1822,
      avgPaceSecPerKm: 405,
      avgHr: 142,
      maxHr: 174,
      avgPowerW: 296,
    })
    expect(result.hrZonesSec).toEqual([28, 1223, 549, 22, 0])
    expect(result).not.toHaveProperty('aerobicTe')
  })

  it('accepts only required fields and comma decimals', () => {
    const result = toRunResult(
      runFormSchema.parse({
        ...blankOptional,
        distanceKm: '4,5',
        duration: '30:22',
        avgPace: '6:45',
        avgHr: '142',
        maxHr: '174',
      }),
    )
    expect(result.distanceKm).toBe(4.5)
    expect(result.durationSec).toBe(1822)
    expect(result.hrZonesSec).toBeUndefined()
  })

  it('reports specific errors per field', () => {
    const res = runFormSchema.safeParse({
      ...sep22,
      distanceKm: '',
      duration: '0:3:22',
      avgPace: '645',
      aerobicTe: '5.5',
    })
    expect(res.success).toBe(false)
    const messages = Object.fromEntries(
      res.error!.issues.map((i) => [String(i.path[0]), i.message]),
    )
    expect(messages.distanceKm).toBe('Distance is required.')
    expect(messages.duration).toBe('Time must use hh:mm:ss.')
    expect(messages.avgPace).toBe('Avg Pace must use m:ss, e.g. 6:45.')
    expect(messages.aerobicTe).toBe('Aerobic Training Effect must be between 0 and 5.')
  })

  it('rejects Max HR below Avg HR', () => {
    const res = runFormSchema.safeParse({ ...sep22, maxHr: '130' })
    expect(res.success).toBe(false)
    expect(res.error!.issues[0]).toMatchObject({
      path: ['maxHr'],
      message: 'Max HR cannot be lower than Avg HR.',
    })
  })

  it('validates subjective ranges', () => {
    expect(runFormSchema.safeParse({ ...sep22, rpe: 11 }).success).toBe(false)
    expect(runFormSchema.safeParse({ ...sep22, kneePainDuring: -1 }).success).toBe(false)
    expect(
      runFormSchema.safeParse({ ...sep22, rpe: 3, talkTest: 'full-sentences', kneePainAfter: 1 })
        .success,
    ).toBe(true)
  })
})

describe('morning check-in schema', () => {
  it('requires at least one value within range', () => {
    expect(morningCheckInSchema.safeParse({}).success).toBe(false)
    expect(morningCheckInSchema.safeParse({ energy: 4 }).success).toBe(true)
    expect(morningCheckInSchema.safeParse({ energy: 6 }).success).toBe(false)
    expect(morningCheckInSchema.safeParse({ kneePainNextMorning: 0 }).success).toBe(true)
  })
})
