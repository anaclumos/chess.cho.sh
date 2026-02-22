'use client'

interface PromotionDialogProps {
  isOpen: boolean
  color: 'w' | 'b'
  onSelect: (piece: string) => void
}

const PIECES = [
  { key: 'q', label: 'Queen', white: '♕', black: '♛' },
  { key: 'r', label: 'Rook', white: '♖', black: '♜' },
  { key: 'b', label: 'Bishop', white: '♗', black: '♝' },
  { key: 'n', label: 'Knight', white: '♘', black: '♞' },
] as const

export function PromotionDialog({ isOpen, color, onSelect }: PromotionDialogProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      aria-label="Choose promotion piece"
    >
      <div className="flex flex-col gap-2 rounded-2xl border border-amber-900/20 bg-gradient-to-b from-amber-50 to-amber-100 p-5 shadow-2xl shadow-amber-900/30">
        <p className="mb-1 text-center text-xs font-bold uppercase tracking-widest text-amber-800/70">
          Promote pawn to
        </p>
        <div className="flex gap-3">
          {PIECES.map(({ key, label, white, black }) => (
            <button
              type="button"
              key={key}
              onClick={() => onSelect(key)}
              aria-label={label}
              className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-amber-200 bg-white/80 text-4xl shadow-md transition-all duration-150 hover:-translate-y-0.5 hover:border-amber-400 hover:bg-white hover:shadow-lg active:translate-y-0 active:shadow-sm"
            >
              <span className="drop-shadow-sm">
                {color === 'w' ? white : black}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
