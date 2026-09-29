import { splitNumber } from './number-format'

describe('splitNumber', () => {
  it('splits into a big whole part and a small fraction', () => {
    expect(splitNumber(21.0975, 1)).toEqual({ whole: '21', fraction: '.1' })
    expect(splitNumber(578.14, 2)).toEqual({ whole: '578', fraction: '.14' })
    expect(splitNumber(74, 0)).toEqual({ whole: '74', fraction: '' })
  })
})
