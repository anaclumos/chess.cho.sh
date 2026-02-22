import { describe, test, expect } from 'vitest'
import {
  getPreset,
  getAllPresets,
  getUCIOptions,
} from '../difficulty'

describe('getAllPresets', () => {
  test('returns exactly 5 presets', () => {
    expect(getAllPresets()).toHaveLength(5)
  })

  test('contains all required preset names', () => {
    const names = getAllPresets().map((p) => p.name)
    expect(names).toContain('beginner')
    expect(names).toContain('easy')
    expect(names).toContain('intermediate')
    expect(names).toContain('hard')
    expect(names).toContain('maximum')
  })

  test('presets are sorted by difficulty (ascending skillLevel)', () => {
    const presets = getAllPresets()
    for (let i = 1; i < presets.length; i++) {
      expect(presets[i].skillLevel).toBeGreaterThan(presets[i - 1].skillLevel)
    }
  })

  test('each preset has all required fields', () => {
    for (const preset of getAllPresets()) {
      expect(preset).toHaveProperty('name')
      expect(preset).toHaveProperty('label')
      expect(preset).toHaveProperty('skillLevel')
      expect(preset).toHaveProperty('movetime')
      expect(preset).toHaveProperty('description')
      expect(typeof preset.name).toBe('string')
      expect(typeof preset.label).toBe('string')
      expect(typeof preset.skillLevel).toBe('number')
      expect(typeof preset.movetime).toBe('number')
      expect(typeof preset.description).toBe('string')
    }
  })

  test('skill levels are within valid range 0-20', () => {
    for (const preset of getAllPresets()) {
      expect(preset.skillLevel).toBeGreaterThanOrEqual(0)
      expect(preset.skillLevel).toBeLessThanOrEqual(20)
    }
  })

  test('movetimes are positive numbers in milliseconds', () => {
    for (const preset of getAllPresets()) {
      expect(preset.movetime).toBeGreaterThan(0)
    }
  })
})

describe('getPreset', () => {
  test('returns beginner preset with Skill Level 0', () => {
    const preset = getPreset('beginner')
    expect(preset.skillLevel).toBe(0)
    expect(preset.movetime).toBe(500)
  })

  test('returns easy preset with Skill Level 5', () => {
    const preset = getPreset('easy')
    expect(preset.skillLevel).toBe(5)
    expect(preset.movetime).toBe(1000)
  })

  test('returns intermediate preset with Skill Level 10', () => {
    const preset = getPreset('intermediate')
    expect(preset.skillLevel).toBe(10)
    expect(preset.movetime).toBe(2000)
  })

  test('returns hard preset with Skill Level 15', () => {
    const preset = getPreset('hard')
    expect(preset.skillLevel).toBe(15)
    expect(preset.movetime).toBe(3000)
  })

  test('returns maximum preset with Skill Level 20', () => {
    const preset = getPreset('maximum')
    expect(preset.skillLevel).toBe(20)
    expect(preset.movetime).toBe(5000)
  })

  test('throws for unknown preset name', () => {
    expect(() => getPreset('nonexistent')).toThrow()
    expect(() => getPreset('')).toThrow()
  })

  test('throws with descriptive message for unknown preset', () => {
    expect(() => getPreset('godmode')).toThrow(/godmode/)
  })
})

describe('getUCIOptions', () => {
  test('returns correct setoption string for Skill Level', () => {
    const preset = getPreset('beginner')
    const options = getUCIOptions(preset)
    expect(options).toContain('setoption name Skill Level value 0')
  })

  test('returns setoption string for maximum', () => {
    const preset = getPreset('maximum')
    const options = getUCIOptions(preset)
    expect(options).toContain('setoption name Skill Level value 20')
  })

  test('returns array of strings', () => {
    const preset = getPreset('intermediate')
    const options = getUCIOptions(preset)
    expect(Array.isArray(options)).toBe(true)
    expect(options.length).toBeGreaterThan(0)
  })
})
