import type { DifficultyPreset } from '@/lib/types'

export type { DifficultyPreset }

const MAXIMUM_PRESET: DifficultyPreset = {
  name: 'maximum',
  label: 'Maximum',
  skillLevel: 20,
  movetime: 5000,
  description: 'Full Stockfish strength',
}

export function getPreset(_name?: string): DifficultyPreset {
  return MAXIMUM_PRESET
}

export function getUCIOptions(preset: DifficultyPreset): string[] {
  return [`setoption name Skill Level value ${preset.skillLevel}`]
}
