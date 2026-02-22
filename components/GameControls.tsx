'use client'

import { getAllPresets } from '@/lib/engine/difficulty'

interface GameControlsProps {
  onNewGame: () => void
  onUndo: () => void
  onFlipBoard: () => void
  onDifficultyChange: (difficulty: string) => void
  currentDifficulty: string
  canUndo: boolean
  isAiThinking: boolean
}

const presets = getAllPresets()

export function GameControls({
  onNewGame,
  onUndo,
  onFlipBoard,
  onDifficultyChange,
  currentDifficulty,
  canUndo,
  isAiThinking,
}: GameControlsProps) {
  const undoDisabled = !canUndo || isAiThinking

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-900/15 bg-gradient-to-b from-amber-50/80 to-amber-100/60 px-4 py-3 shadow-sm">
      <button
        type="button"
        onClick={onNewGame}
        className="rounded-lg border border-amber-300/60 bg-white/90 px-3 py-1.5 text-sm font-semibold tracking-wide text-amber-900 shadow-sm transition-all duration-150 hover:-translate-y-px hover:border-amber-400 hover:bg-white hover:shadow-md active:translate-y-0 active:shadow-sm"
      >
        New Game
      </button>

      <select
        value={currentDifficulty}
        onChange={(e) => onDifficultyChange(e.target.value)}
        className="rounded-lg border border-amber-300/60 bg-white/90 px-2 py-1.5 text-sm font-medium text-amber-900 shadow-sm transition-colors duration-150 hover:border-amber-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300/40"
      >
        {presets.map((p) => (
          <option key={p.name} value={p.name}>
            {p.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={onUndo}
        disabled={undoDisabled}
        aria-label="Undo"
        className="rounded-lg border border-amber-300/60 bg-white/90 px-3 py-1.5 text-sm font-semibold tracking-wide text-amber-900 shadow-sm transition-all duration-150 hover:-translate-y-px hover:border-amber-400 hover:bg-white hover:shadow-md active:translate-y-0 active:shadow-sm disabled:pointer-events-none disabled:opacity-40"
      >
        Undo
      </button>

      <button
        type="button"
        onClick={onFlipBoard}
        aria-label="Flip Board"
        className="rounded-lg border border-amber-300/60 bg-white/90 px-3 py-1.5 text-sm font-semibold tracking-wide text-amber-900 shadow-sm transition-all duration-150 hover:-translate-y-px hover:border-amber-400 hover:bg-white hover:shadow-md active:translate-y-0 active:shadow-sm"
      >
        Flip Board
      </button>
    </div>
  )
}
