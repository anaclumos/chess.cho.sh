import { describe, test, expect } from 'vitest'
import { evalToWhitePercent } from '../winProbability'

describe('evalToWhitePercent', () => {
  test('returns 50% for equal position (cp 0)', () => {
    // Engine says 0 cp from Black's perspective → equal
    expect(evalToWhitePercent({ type: 'cp', value: 0 })).toBe(50)
  })

  test('returns >50% when White has centipawn advantage', () => {
    // Engine (Black) says -100 cp → Black is losing → White advantage
    const result = evalToWhitePercent({ type: 'cp', value: -100 })
    expect(result).toBeGreaterThan(50)
    expect(result).toBeLessThan(100)
  })

  test('returns <50% when Black has centipawn advantage', () => {
    // Engine (Black) says +100 cp → Black is winning
    const result = evalToWhitePercent({ type: 'cp', value: 100 })
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThan(50)
  })

  test('returns ~59% for +100cp White advantage', () => {
    // Engine says -100 from Black → White +100
    const result = evalToWhitePercent({ type: 'cp', value: -100 })
    expect(result).toBeGreaterThanOrEqual(58)
    expect(result).toBeLessThanOrEqual(60)
  })

  test('returns near 100% for mate in favor of White', () => {
    // Engine says mate -3 → White mates in 3 (engine losing)
    const result = evalToWhitePercent({ type: 'mate', value: -3 })
    expect(result).toBeGreaterThanOrEqual(95)
  })

  test('returns near 0% for mate in favor of Black', () => {
    // Engine says mate 3 → Black mates in 3 (engine winning)
    const result = evalToWhitePercent({ type: 'mate', value: 3 })
    expect(result).toBeLessThanOrEqual(5)
  })

  test('clamps extreme centipawn values', () => {
    // +5000 cp should be clamped and not exceed 100
    const high = evalToWhitePercent({ type: 'cp', value: -5000 })
    expect(high).toBeLessThanOrEqual(100)
    expect(high).toBeGreaterThanOrEqual(95)

    const low = evalToWhitePercent({ type: 'cp', value: 5000 })
    expect(low).toBeGreaterThanOrEqual(0)
    expect(low).toBeLessThanOrEqual(5)
  })

  test('is symmetric around 50%', () => {
    const whitePlus = evalToWhitePercent({ type: 'cp', value: -200 })
    const blackPlus = evalToWhitePercent({ type: 'cp', value: 200 })
    // whitePlus + blackPlus should equal ~100
    expect(whitePlus + blackPlus).toBe(100)
  })
})
