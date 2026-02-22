export type { DifficultyPreset } from '@/lib/types'

const MAXIMUM_PRESET: DifficultyPreset = {
  name: 'maximum',
  label: 'Maximum',
  skillLevel: 20,
  movetime: 5000,
  description: 'Full Stockfish strength',
}

export function getPreset(): DifficultyPreset {
  return MAXIMUM_PRESET
}

export function getUCIOptions(preset: DifficultyPreset): string[] {
  return [`setoption name Skill Level value ${preset.skillLevel}`]
}
