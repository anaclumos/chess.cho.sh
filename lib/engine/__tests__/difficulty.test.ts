import { describe, test, expect } from 'vitest'
import { getPreset, getUCIOptions } from '../difficulty'

describe('getPreset', () => {
  test('returns maximum preset', () => {
    const preset = getPreset()
    expect(preset.name).toBe('maximum')
    expect(preset.label).toBe('Maximum')
    expect(preset.skillLevel).toBe(20)
    expect(preset.movetime).toBe(5000)
    expect(preset.description).toBe('Full Stockfish strength')
  })

  test('always returns maximum regardless of argument', () => {
    expect(getPreset('beginner').name).toBe('maximum')
    expect(getPreset('hard').name).toBe('maximum')
    expect(getPreset('nonexistent').name).toBe('maximum')
    expect(getPreset().name).toBe('maximum')
  })

  test('preset has all required fields', () => {
    const preset = getPreset()
    expect(typeof preset.name).toBe('string')
    expect(typeof preset.label).toBe('string')
    expect(typeof preset.skillLevel).toBe('number')
    expect(typeof preset.movetime).toBe('number')
    expect(typeof preset.description).toBe('string')
  })

  test('skill level is maximum (20)', () => {
    const preset = getPreset()
    expect(preset.skillLevel).toBe(20)
  })

  test('movetime is 5000ms', () => {
    const preset = getPreset()
    expect(preset.movetime).toBe(5000)
  })
})

describe('getUCIOptions', () => {
  test('returns correct setoption string for Skill Level 20', () => {
    const preset = getPreset()
    const options = getUCIOptions(preset)
    expect(options).toContain('setoption name Skill Level value 20')
  })

  test('returns array of strings', () => {
    const preset = getPreset()
    const options = getUCIOptions(preset)
    expect(Array.isArray(options)).toBe(true)
    expect(options.length).toBeGreaterThan(0)
  })
})
