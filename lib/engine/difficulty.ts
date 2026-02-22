import type { DifficultyPreset } from '@/lib/types'

export type { DifficultyPreset }

const PRESETS: DifficultyPreset[] = [
  {
    name: 'beginner',
    label: 'Beginner',
    skillLevel: 0,
    movetime: 500,
    description: '~1320 ELO',
  },
  {
    name: 'easy',
    label: 'Easy',
    skillLevel: 5,
    movetime: 1000,
    description: '~1650 ELO',
  },
  {
    name: 'intermediate',
    label: 'Intermediate',
    skillLevel: 10,
    movetime: 2000,
    description: '~2000 ELO',
  },
  {
    name: 'hard',
    label: 'Hard',
    skillLevel: 15,
    movetime: 3000,
    description: '~2500 ELO',
  },
  {
    name: 'maximum',
    label: 'Maximum',
    skillLevel: 20,
    movetime: 5000,
    description: 'Full Stockfish strength',
  },
]

export function getPreset(name: string): DifficultyPreset {
  const preset = PRESETS.find((p) => p.name === name)
  if (!preset) {
    throw new Error(
      `Unknown difficulty preset: "${name}". Valid options: ${PRESETS.map((p) => p.name).join(', ')}`
    )
  }
  return preset
}

export function getAllPresets(): DifficultyPreset[] {
  return [...PRESETS].sort((a, b) => a.skillLevel - b.skillLevel)
}

export function getUCIOptions(preset: DifficultyPreset): string[] {
  return [`setoption name Skill Level value ${preset.skillLevel}`]
}
