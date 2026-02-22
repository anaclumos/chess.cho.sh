'use client'

interface GameControlsProps {
  onNewGame: () => void
  onUndo: () => void
  canUndo: boolean
  isAiThinking: boolean
}

export function GameControls({
  onNewGame,
  onUndo,
  canUndo,
  isAiThinking,
}: GameControlsProps) {
  const undoDisabled = !canUndo || isAiThinking

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onNewGame}
        className="flex-1 rounded-xl bg-amber-900/90 px-4 py-2.5 text-sm font-semibold tracking-wide text-amber-50 shadow-sm transition-all duration-150 active:scale-[0.97]"
      >
        New Game
      </button>

      <button
        type="button"
        onClick={onUndo}
        disabled={undoDisabled}
        aria-label="Undo"
        className="flex-1 rounded-xl border border-amber-900/20 bg-white/80 px-4 py-2.5 text-sm font-semibold tracking-wide text-amber-900 shadow-sm transition-all duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40"
      >
        Undo
      </button>
    </div>
  )
}
